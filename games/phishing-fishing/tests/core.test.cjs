'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const bank=require('../emails.js'),config=require('../config.js');
const {Round,selectQuestions,validateBank,evidenceChoices}=require('../game-core.js');
const fishing=require('../catch.js');
// Rebuild the local answer key (as the demo/standalone build does) so the tests exercise judging.
const demoWin={};vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../demo-answers.js'),'utf8'),{window:demoWin});
for(const email of bank){const c=demoWin.EMAIL_DEMO_ANSWERS[email.id];if(c)email.classification=c;}
validateBank(bank,config);assert.equal(bank.length,32);assert.equal(config.roundSeconds,90);
let seed=7314;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
const orders=new Set(),seen=new Set(),easyLegit=new Set();
for(let i=0;i<1000;i++){
 const deal=selectQuestions(bank,config,random);assert.equal(deal.length,10);assert.equal(new Set(deal.map(e=>e.id)).size,10);
 for(const kind of ['phishing','legitimate'])for(const [difficulty,n] of [['Easy',2],['Medium',2],['Hard',1]])assert.equal(deal.filter(e=>e.classification===kind&&e.difficulty===difficulty).length,n);
 deal.forEach(e=>{seen.add(e.id);if(e.classification==='legitimate'&&e.difficulty==='Easy')easyLegit.add(e.id)});orders.add(deal.map(e=>e.id).join(','));
}
assert.equal(orders.size,1000);assert.equal(seen.size,32);assert.ok(easyLegit.size>2);
console.log('PASS: 32 cases, 1,000 balanced difficulty-matched deals, no fixed easy legitimate pair');
function play(a,c,settings=config){
 let now=1000;const r=new Round(bank,settings,{now:()=>now,random});assert.ok(r.start());
 for(let i=0;i<a;i++){
  now+=300;const q=r.questions[r.index],kind=i<c?q.classification:q.classification==='phishing'?'legitimate':'phishing';
  if(i%2===0)assert.ok(r.verify(q.id));
  assert.equal(r.answer(q.id,kind),true);assert.equal(r.answer(q.id,kind),false,'duplicate answer rejected');
 }
 if(r.status!=='finished'){now=91010;r.expire()}
 const out=r.results();assert.equal(out.correct,c);assert.equal(out.incorrect,a-c);
 assert.equal(out.score,Math.round(c*1000/settings.roundQuestions)/10);
 assert.deepEqual(Round.restore(bank,settings,r.snapshot(),{now:()=>now}).results(),out);return out;
}
for(let a=0;a<=10;a++)for(let c=0;c<=a;c++)play(a,c);
for(let a=0;a<=32;a++)for(const c of new Set([0,Math.floor(a/2),a]))play(a,c,{...config,roundQuestions:32});
assert.equal(play(10,10).score,100);assert.equal(play(10,4).score,40);assert.equal(play(8,7).score,70);
for(const kind of ['phishing','legitimate']){const r=new Round(bank,config);r.start();for(const q of r.questions)r.answer(q.id,kind);assert.equal(r.results().score,50)}
console.log('PASS: each correct answer earns 10 points, wrong and unanswered earn zero, repeated labels earn 50 on a full round');
let now=1000,r=new Round(bank,config,{now:()=>now});r.start();const q=r.questions[0];r.verify(q.id);
const saved=r.snapshot();now=2000;const restored=Round.restore(bank,config,saved,{now:()=>now});assert.equal(restored.verified[0],true);assert.equal(restored.startedAt,1000);
const legacy=structuredClone(saved);legacy.version=2;legacy.draft={classification:'phishing',evidenceId:'subject'};
assert.equal(Round.restore(bank,config,legacy,{now:()=>now}).snapshot().version,4);
r.answer(q.id,q.classification);const legacyAnswered=r.snapshot();legacyAnswered.version=2;legacyAnswered.answers[0].evidenceId='subject';
assert.deepEqual(Round.restore(bank,config,legacyAnswered).answers[0],{classification:q.classification});
now=91010;assert.equal(restored.answer(q.id,q.classification),false);assert.equal(restored.results().timeUsed,90);assert.equal(restored.endedAt,91000);
const oldFinished=restored.snapshot();oldFinished.version=2;assert.throws(()=>Round.restore(bank,config,oldFinished));
for(const mutate of [d=>d.version=1,d=>d.questionIds[1]=d.questionIds[0],d=>d.answers[2]={classification:'phishing'},d=>d.verified[0]='yes',d=>d.lastElapsed=-1]){const d=structuredClone(saved);mutate(d);assert.throws(()=>Round.restore(bank,config,d))}
console.log('PASS: verification/deadline persist; active v2 migrates labels; historical v2 scores protected; late clicks/corrupt snapshots rejected');

const oldRound=new Round(bank,config,{now:()=>1000});
oldRound.start();
for(const [i,email] of oldRound.questions.entries()){
 const answer=i<4?email.classification:email.classification==='phishing'?'legitimate':'phishing';
 oldRound.answer(email.id,answer);
 if(i!==8)continue;
 const oldActive={...oldRound.snapshot(),version:3};
 const upgraded=Round.restore(bank,config,oldActive,{now:()=>2000});
 assert.equal(upgraded.snapshot().version,4);
 assert.equal(upgraded.startedAt,oldActive.startedAt);
 assert.deepEqual(upgraded.answers,oldActive.answers);
 const lastEmail=upgraded.questions[9];
 upgraded.answer(lastEmail.id,lastEmail.classification==='phishing'?'legitimate':'phishing');
 assert.equal(upgraded.results().score,40);
}
const oldFinishedV3={...oldRound.snapshot(),version:3};
const previousResult=Round.restore(bank,config,oldFinishedV3);
assert.equal(previousResult.results().score,0,'finished rounds keep the original score for display and retries');
assert.equal(previousResult.results().rawScore,-20);
assert.equal(previousResult.snapshot().version,3);
console.log('PASS: open v3 rounds keep their answers and deadline and use new scoring; completed v3 scores remain reproducible');
for(const mutate of [b=>b[1].id=b[0].id,b=>delete b[0].context,b=>b[0].reasoning.evidence='',b=>b[0].acceptedEvidence=['body:999'],b=>{const block=b[0].body.find(x=>x.type==='link'||x.type==='button');block.url='https://maybank2u.com.my/'},b=>b[0].indicators[0].text='missing clue']){const b=structuredClone(bank);mutate(b);assert.throws(()=>validateBank(b,config))}
console.log('PASS: exact evidence keys, rationale, destination domains and content validation');

for(const email of bank.filter(e=>e.classification==='phishing'))assert.ok(fishing.lessons[email.lesson],email.id+' needs a known teaching category');
const scam=bank.find(e=>e.classification==='phishing'),safe=bank.find(e=>e.classification==='legitimate');
const reviews=[
 {email:scam,answer:'phishing',correct:true},
 {email:safe,answer:'legitimate',correct:true},
 {email:scam,answer:'legitimate',correct:false},
 {email:safe,answer:'phishing',correct:false},
 {email:scam,answer:null,correct:false},
 {email:safe,answer:null,correct:false}
];
const original=JSON.stringify(reviews),catchResult=fishing.summarize(reviews);
assert.deepEqual(catchResult.counts,{caught:1,safe:1,escaped:1,miscast:1,untouched:2});
assert.deepEqual(catchResult.catches.map(c=>c.index),[0,1,2,3,4,5]);
assert.equal(catchResult.badges.length,1);assert.equal(catchResult.badges[0].count,1);
assert.equal(JSON.stringify(reviews),original,'presentation must not mutate answers or grading');
assert.deepEqual(fishing.summarize(reviews.slice(2)).badges,[],'wrong and unanswered cases earn no badges');
assert.deepEqual(fishing.summarize([]).badges,[]);
for(const email of bank.filter(e=>e.lesson)){
 const result=fishing.summarize([{email,answer:'phishing',correct:true},{email,answer:'phishing',correct:true}]);
 assert.equal(result.badges.length,1);assert.equal(result.badges[0].count,2,'same skill aggregates without duplicate badges');
}
const retired=r.snapshot();retired.questionIds[0]='penguin-qr';assert.throws(()=>Round.restore(bank,config,retired),'retired cases must never be silently regraded');
console.log('PASS: catch outcomes partition the inbox; badges reward caught techniques only; grading is untouched; retired deals fail closed');

// Pause / resume timer must not consume play time while reading verdict popups
let pNow=10_000;
const pr=new Round(bank,config,{now:()=>pNow});
assert.ok(pr.start());
pNow+=5_000;
assert.equal(pr.elapsedMs(),5_000);
assert.equal(pr.remainingMs(),85_000);
assert.equal(pr.pause(),true);
assert.equal(pr.isPaused(),true);
pNow+=200_000; // 200 seconds spent reading verdict popup!
assert.equal(pr.elapsedMs(),5_000,'paused time must not consume play time');
assert.equal(pr.remainingMs(),85_000);
assert.equal(pr.expire(),false,'cannot time out while paused');
const pausedSnap=pr.snapshot();
assert.equal(pausedSnap.pausedAt,15_000);
const restoredPaused=Round.restore(bank,config,pausedSnap,{now:()=>pNow});
assert.equal(restoredPaused.isPaused(),true);
assert.equal(restoredPaused.remainingMs(),85_000);
assert.equal(pr.resume(),true);
assert.equal(pr.isPaused(),false);
assert.equal(pr.pausedMs,200_000);
assert.equal(pr.remainingMs(),85_000);
pNow+=85_000;
assert.equal(pr.expire(),true);
assert.equal(pr.results().timeUsed,90);
assert.equal(pr.endedAt-pr.startedAt-pr.pausedMs,90_000);
assert.deepEqual(Round.restore(bank,config,pr.snapshot(),{now:()=>pNow}).results(),pr.results());
console.log('PASS: Round.pause()/resume() freezes clock without consuming play time and round-trips through snapshot/restore');

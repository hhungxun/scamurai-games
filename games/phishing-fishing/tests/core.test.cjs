'use strict';
const assert=require('node:assert/strict');
const bank=require('../emails.js'),config=require('../config.js');
const {Round,selectQuestions,validateBank,evidenceChoices}=require('../game-core.js');
validateBank(bank,config);assert.equal(bank.length,32);assert.equal(config.roundSeconds,60);
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
 if(r.status!=='finished'){now=61010;r.expire()}
 const out=r.results();assert.equal(out.correct,c);assert.equal(out.incorrect,a-c);
 assert.equal(out.score,Math.round(Math.max(0,(c-(a-c))*100/settings.roundQuestions)*10)/10);
 assert.deepEqual(Round.restore(bank,settings,r.snapshot(),{now:()=>now}).results(),out);return out;
}
for(let a=0;a<=10;a++)for(let c=0;c<=a;c++)play(a,c);
for(let a=0;a<=32;a++)for(const c of new Set([0,Math.floor(a/2),a]))play(a,c,{...config,roundQuestions:32});
assert.equal(play(10,10).score,100);assert.equal(play(10,5).score,0);assert.equal(play(8,7).score,60);
for(const kind of ['phishing','legitimate']){const r=new Round(bank,config);r.start();for(const q of r.questions)r.answer(q.id,kind);assert.equal(r.results().score,0)}
console.log('PASS: classification submits immediately; correct +10, wrong -10, unanswered0; blind-label0; verification never affects scoring');
let now=1000,r=new Round(bank,config,{now:()=>now});r.start();const q=r.questions[0];r.verify(q.id);
const saved=r.snapshot();now=2000;const restored=Round.restore(bank,config,saved,{now:()=>now});assert.equal(restored.verified[0],true);assert.equal(restored.startedAt,1000);
const legacy=structuredClone(saved);legacy.version=2;legacy.draft={classification:'phishing',evidenceId:'subject'};
assert.equal(Round.restore(bank,config,legacy,{now:()=>now}).snapshot().version,3);
r.answer(q.id,q.classification);const legacyAnswered=r.snapshot();legacyAnswered.version=2;legacyAnswered.answers[0].evidenceId='subject';
assert.deepEqual(Round.restore(bank,config,legacyAnswered).answers[0],{classification:q.classification});
now=61010;assert.equal(restored.answer(q.id,q.classification),false);assert.equal(restored.results().timeUsed,60);assert.equal(restored.endedAt,61000);
const oldFinished=restored.snapshot();oldFinished.version=2;assert.throws(()=>Round.restore(bank,config,oldFinished));
for(const mutate of [d=>d.version=1,d=>d.questionIds[1]=d.questionIds[0],d=>d.answers[2]={classification:'phishing'},d=>d.verified[0]='yes',d=>d.lastElapsed=-1]){const d=structuredClone(saved);mutate(d);assert.throws(()=>Round.restore(bank,config,d))}
console.log('PASS: verification/deadline persist; active v2 migrates labels; historical v2 scores protected; late clicks/corrupt snapshots rejected');
for(const mutate of [b=>b[1].id=b[0].id,b=>delete b[0].context,b=>b[0].reasoning.evidence='',b=>b[0].acceptedEvidence=['body:999'],b=>b[0].body.find(x=>x.type==='link').url='https://external.invalid/',b=>b[0].indicators[0].text='missing clue']){const b=structuredClone(bank);mutate(b);assert.throws(()=>validateBank(b,config))}
console.log('PASS: exact evidence keys, rationale, reserved domains and content validation');

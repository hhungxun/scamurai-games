'use strict';
const assert=require('node:assert/strict');
const bank=require('../emails.js'),config=require('../config.js');
const {Round,selectQuestions,validateBank,evidenceChoices}=require('../game-core.js');
validateBank(bank,config);assert.equal(bank.length,32);assert.equal(config.roundSeconds,120);
let seed=7314;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
const orders=new Set(),seen=new Set(),easyLegit=new Set();
for(let i=0;i<1000;i++){
 const deal=selectQuestions(bank,config,random);assert.equal(deal.length,10);assert.equal(new Set(deal.map(e=>e.id)).size,10);
 for(const kind of ['phishing','legitimate'])for(const [difficulty,n] of [['Easy',2],['Medium',2],['Hard',1]])assert.equal(deal.filter(e=>e.classification===kind&&e.difficulty===difficulty).length,n);
 deal.forEach(e=>{seen.add(e.id);if(e.classification==='legitimate'&&e.difficulty==='Easy')easyLegit.add(e.id)});orders.add(deal.map(e=>e.id).join(','));
}
assert.equal(orders.size,1000);assert.equal(seen.size,32);assert.ok(easyLegit.size>2);
console.log('PASS: 32 cases, 1,000 balanced difficulty-matched deals, no fixed easy legitimate pair');
function evidence(r,q,supported){const id=supported?q.acceptedEvidence[0]:'subject';if(id.startsWith('verification:'))assert.ok(r.verify(q.id));return id}
function play(a,c,j,settings=config){
 let now=1000;const r=new Round(bank,settings,{now:()=>now,random});r.start();
 for(let i=0;i<a;i++){
  now+=300;const q=r.questions[r.index],kind=i<c?q.classification:q.classification==='phishing'?'legitimate':'phishing';
  assert.equal(r.answer(q.id,kind),false,'label alone never submits');
  const id=evidence(r,q,i<j);assert.equal(r.answer(q.id,kind,id),true);assert.equal(r.answer(q.id,kind,id),false);
 }
 if(r.status!=='finished'){now=121010;r.expire()}
 const out=r.results();assert.equal(out.correct,c);assert.equal(out.justified,j);assert.equal(out.unsupported,c-j);assert.equal(out.incorrect,a-c);
 assert.equal(out.score,Math.round(Math.max(0,(j-(a-c))*100/settings.roundQuestions)*10)/10);
 assert.deepEqual(Round.restore(bank,settings,r.snapshot(),{now:()=>now}).results(),out);return out;
}
for(let a=0;a<=10;a++)for(let c=0;c<=a;c++)for(let j=0;j<=c;j++)play(a,c,j);
for(let a=0;a<=32;a++)for(const c of new Set([0,Math.floor(a/2),a]))for(const j of new Set([0,c]))play(a,c,j,{...config,roundQuestions:32});
assert.equal(play(10,10,0).score,0);assert.equal(play(10,10,10).score,100);assert.equal(play(10,5,5).score,0);assert.equal(play(8,7,6).score,50);
console.log('PASS: label/evidence grading combinations, unsupported correct labels score zero, wrong labels deduct, full support100 and blind-label0');
let now=1000,r=new Round(bank,config,{now:()=>now});r.start();const q=r.questions[0];
assert.equal(r.choose(q.id,{evidenceId:'verification:0'}),false);r.verify(q.id);r.choose(q.id,{classification:q.classification,evidenceId:'verification:0'});
const saved=r.snapshot();now=2000;const restored=Round.restore(bank,config,saved,{now:()=>now});assert.deepEqual(restored.draft,saved.draft);assert.equal(restored.verified[0],true);assert.equal(restored.startedAt,1000);
now=121010;assert.equal(restored.answer(q.id),false);assert.equal(restored.results().timeUsed,120);assert.equal(restored.endedAt,121000);assert.equal(restored.snapshot().lastElapsed,120000);
assert.deepEqual(Round.restore(bank,config,restored.snapshot(),{now:()=>now}).results(),restored.results());
for(const mutate of [d=>d.version=1,d=>d.questionIds[1]=d.questionIds[0],d=>d.answers[2]={classification:'phishing',evidenceId:'subject'},d=>d.verified[0]=false,d=>d.draft.evidenceId='missing',d=>d.lastElapsed=-1]){const d=structuredClone(saved);mutate(d);assert.throws(()=>Round.restore(bank,config,d))}
console.log('PASS: verification/draft/deadline persist; hidden verification evidence cannot submit; late clicks rejected; old and corrupt snapshots fail closed');
for(const mutate of [b=>b[1].id=b[0].id,b=>delete b[0].context,b=>b[0].reasoning.evidence='',b=>b[0].acceptedEvidence=['body:999'],b=>b[0].body.find(x=>x.type==='link').url='https://external.invalid/',b=>b[0].indicators[0].text='missing clue']){const b=structuredClone(bank);mutate(b);assert.throws(()=>validateBank(b,config))}
console.log('PASS: exact evidence keys, rationale, reserved domains and content validation');

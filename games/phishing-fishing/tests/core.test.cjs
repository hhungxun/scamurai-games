'use strict';
const assert=require('node:assert/strict');
const bank=require('../emails.js'),config=require('../config.js');
const {Round,selectQuestions,validateBank}=require('../game-core.js');
let now=1000, seed=7314;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
validateBank(bank,config);
assert.equal(bank.length,20);
const original=bank.map(e=>e.id),orders=new Set();
for(let i=0;i<1000;i++){
 const deal=selectQuestions(bank,config,random);assert.equal(deal.length,10);assert.equal(new Set(deal.map(e=>e.id)).size,10);
 for(const kind of ['phishing','legitimate']){
  const chosen=deal.filter(e=>e.classification===kind);assert.equal(chosen.length,5);
  for(const [difficulty,n] of [['Easy',2],['Medium',2],['Hard',1]])assert.equal(chosen.filter(e=>e.difficulty===difficulty).length,n);
 }
 orders.add(deal.map(e=>e.id).join(','));
}
assert.equal(orders.size,1000);assert.deepEqual(bank.map(e=>e.id),original);
console.log('PASS: 1,000 unique balanced deals with equal difficulty mixes and no duplicate/mutated emails');
function play(answered,correct,settings=config){
 now=1000;const r=new Round(bank,settings,{now:()=>now,random});assert.throws(()=>r.results());assert.equal(r.start(),true);assert.equal(r.start(),false);
 for(let i=0;i<answered;i++){now+=500;const q=r.questions[r.index];assert.equal(r.answer(q.id,i<correct?q.classification:q.classification==='phishing'?'legitimate':'phishing'),true);assert.equal(r.answer(q.id,q.classification),false)}
 if(r.status!=='finished'){now=61000;r.expire()}
 const results=r.results();now+=100000;assert.deepEqual(r.results(),results);return results;
}
for(const total of [10,20])for(let a=0;a<=total;a++)for(let c=0;c<=a;c++){
 const r=play(a,c,{...config,roundQuestions:total});assert.equal(r.score,Math.max(0,(2*c-a)*100/total));assert.equal(r.unanswered,total-a);assert.equal(r.incorrect,a-c);assert.equal(r.maximum,100);
}
assert.equal(play(0,0).score,0);assert.equal(play(10,0).score,0);assert.equal(play(10,5).score,0);assert.equal(play(10,10).score,100);assert.equal(play(8,7).score,60);
console.log('PASS: all 297 scored/practice answer combinations, zero participation credit, wrong-answer deductions and frozen results');
now=1000;let r=new Round(bank,config,{now:()=>now,random});r.start();now=2000;r.answer(r.questions[0].id,'phishing');const saved=r.snapshot();
let restored=Round.restore(bank,config,saved,{now:()=>now});assert.deepEqual(restored.snapshot(),saved);now=61000;assert.equal(restored.answer(restored.questions[restored.index].id,'phishing'),false);assert.equal(restored.results().timeUsed,60);assert.equal(restored.endedAt,61000);
assert.deepEqual(Round.restore(bank,config,restored.snapshot(),{now:()=>now}).results(),restored.results());
for(const mutate of [d=>d.questionIds[1]=d.questionIds[0],d=>d.answers[2]='legitimate',d=>d.startedAt=null,d=>d.status='oops',d=>d.index=8,d=>d.lastElapsed=-1]){const d=structuredClone(saved);mutate(d);assert.throws(()=>Round.restore(bank,config,d))}
now=1000;r=new Round(bank,config,{now:()=>now});r.start();now=60999;assert.equal(r.remainingMs(),1);now=2000;assert.equal(r.remainingMs(),1);now=500000;r.expire();assert.equal(r.results().timeUsed,60);assert.equal(r.endedAt,61000);assert.deepEqual(Round.restore(bank,config,r.snapshot()).results(),r.results());
console.log('PASS: refresh restores exact deal/answers/deadline, expiry wins over late answers, invalid snapshots fail closed and clock reversal cannot restore time');
for(const settings of [{roundQuestions:0},{roundQuestions:11},{roundSeconds:0}])assert.throws(()=>validateBank(bank,{...config,...settings}));
for(const mutate of [b=>b[1].id=b[0].id,b=>b[0].classification='other',b=>b[0].difficulty='Extreme',b=>b.find(e=>e.classification==='legitimate').senderEmail='staff@wrong.example',b=>b[0].body.find(e=>e.type==='link').url='https://external.invalid/',b=>b[0].indicators[0].text='missing clue']){const b=structuredClone(bank);mutate(b);assert.throws(()=>validateBank(b,config))}
console.log('PASS: content, fictional domains, indicators, settings and sender-validation checks');

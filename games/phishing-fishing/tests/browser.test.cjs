'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const bank=require('../emails.js'),url=pathToFileURL(path.resolve(__dirname,'../game.html')).href;
let browser;const errors=[],remote=[],downloads=[];
function watch(p){p.on('pageerror',e=>errors.push(e.message));p.on('request',r=>{if(/^https?:/.test(r.url()))remote.push(r.url())});p.on('download',d=>downloads.push(d.suggestedFilename()))}
async function judgement(p,{correct=true,kind}={}){
 const id=await p.locator('[data-question]').first().getAttribute('data-question'),e=bank.find(e=>e.id===id);
 const label=kind||(correct?e.classification:e.classification==='phishing'?'legitimate':'phishing');
 await p.locator(`[data-answer="${label}"]`).click({force:true});await p.clock.runFor(350);return id;
}
async function restart(p){await p.locator('.new-player').first().click({force:true});await p.locator('#start-game').click({force:true})}
(async()=>{
 browser=await chromium.launch({headless:true,...(process.env.BROWSER_PATH?{executablePath:process.env.BROWSER_PATH}:{})});
 const c=await browser.newContext({viewport:{width:1366,height:900},offline:true,reducedMotion:'reduce'}),p=await c.newPage();watch(p);await p.clock.install();await p.goto(url);
 assert.match(await p.locator('.round-facts').innerText(),/32 emails/);assert.match(await p.locator('.round-facts').innerText(),/120 seconds/);await p.locator('#start-game').click();
 assert.equal(await p.locator('#timer-value').innerText(),'2:00');assert.equal(await p.locator('.case-context').isVisible(),false);
 assert.equal(await p.locator('[data-evidence],#submit-judgement,.evidence-pick').count(),0);
 await p.locator('#verify-independent').click();assert.equal(await p.locator('.case-context').isVisible(),true);await p.clock.runFor(1000);assert.notEqual(await p.locator('#timer-value').innerText(),'2:00');
 await p.keyboard.down('p');await p.clock.runFor(350);await p.keyboard.down('p');await p.clock.runFor(350);assert.equal(await p.locator('.email-progress .answered').count(),1);await p.keyboard.up('p');
 await p.clock.fastForward(121000);assert.equal(await p.locator('.review-card').count(),32);
 console.log('PASS: no evidence controls; optional verification keeps clock running; keyboard answers immediately and held keys do not skip messages');
 await restart(p);const seen=[];
 for(let i=0;i<32;i++){
  assert.equal(await p.locator('.case-context').isVisible(),false);assert.equal(await p.locator('mark,.review-card').count(),0);
  assert.equal(await p.locator('.email-card a,.email-card input,.email-card form').count(),0);
  seen.push(await judgement(p));
 }
 assert.equal(new Set(seen).size,32);assert.match(await p.locator('.score-circle strong').innerText(),/^100/);assert.equal(await p.locator('.review-card').count(),32);assert.equal(await p.locator('.decision-reasoning dt').count(),96);assert.equal(await p.locator('.submitted-evidence').count(),0);
 console.log('PASS: all32 cases render; classification-only earns100; review teaches decisive clues and safe next actions');
 await restart(p);for(let i=0;i<10;i++)await judgement(p);for(let i=0;i<2;i++)await judgement(p,{correct:false});await p.clock.fastForward(121000);assert.match(await p.locator('.score-circle strong').innerText(),/^25/);assert.match(await p.locator('.timeout-note').innerText(),/20 emails were unanswered/);
 console.log('PASS: partial timeout scores correct minus wrong; unanswered zero');
 for(const v of [{width:1366,height:768},{width:1024,height:768},{width:768,height:1024},{width:390,height:844},{width:360,height:800}]){
  await p.setViewportSize(v);await restart(p);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  if(v.width>720)assert.equal(await p.locator('[data-answer]').last().evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight),true);
  for(let i=0;i<31;i++)await judgement(p);assert.equal(await p.locator('.email-progress [aria-current="step"]').count(),1);await judgement(p);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 }
 console.log('PASS: investigation controls, full-bank progress and reviews fit five desktop/mobile sizes');
 const touch=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,offline:true}),t=await touch.newPage();watch(t);await t.clock.install();await t.goto(url);await t.locator('#start-game').tap();
 for(let i=0;i<32&&!(await t.locator('[data-link-inspector]').count());i++)await judgement(t);
 const block=t.locator('[data-link-inspector]').first();await block.locator('.inspect-link').tap({force:true});assert.equal(await block.locator('.link-destination').isVisible(),true);assert.equal(t.url(),url);assert.equal(touch.pages().length,1);
 await t.locator('#verify-independent').tap();assert.equal(await t.locator('.case-context').isVisible(),true);await touch.close();
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(downloads,[]);console.log('PASS: touch verification/link inspection stay inert; no errors, remote requests or downloads');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close()});

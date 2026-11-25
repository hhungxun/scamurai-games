'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const bank=require('../emails.js'),url=pathToFileURL(path.resolve(__dirname,'../game.html')).href;
const {Round}=require('../game-core.js'),config=require('../config.js');
const fs=require('node:fs');
async function screenshot(p,name){if(process.env.ARTIFACT_DIR){fs.mkdirSync(process.env.ARTIFACT_DIR,{recursive:true});await p.screenshot({path:path.join(process.env.ARTIFACT_DIR,name+'.png'),fullPage:true})}}
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
 await screenshot(p,'welcome');
 await p.locator('#start-game').click();
 assert.equal(await p.locator('#timer-value').innerText(),'1:30');assert.equal(await p.locator('.case-context').isVisible(),false);
 assert.equal(await p.locator('[data-evidence],#submit-judgement,.evidence-pick').count(),0);
 assert.equal(await p.locator('.catch-report,.field-badges,.catch-fish').count(),0);
 await screenshot(p,'inbox');
 await p.locator('#verify-independent').click();assert.equal(await p.locator('.case-context').isVisible(),true);await p.clock.runFor(1000);assert.notEqual(await p.locator('#timer-value').innerText(),'1:30');
 await p.keyboard.down('p');await p.clock.runFor(350);await p.keyboard.down('p');await p.clock.runFor(350);assert.equal(await p.locator('.email-progress .answered').count(),1);await p.keyboard.up('p');
 await p.clock.fastForward(91000);assert.equal(await p.locator('.review-card').count(),10);
 console.log('PASS: no evidence controls; optional verification keeps clock running; keyboard answers immediately and held keys do not skip messages');
 assert.equal(await p.locator('.catch-fish').count(),10);
 assert.equal(await p.locator('.catch-fish.untouched').count(),9);
 const untouched=p.locator('.catch-fish.untouched').first(),reviewId=await untouched.getAttribute('aria-controls');
 await untouched.click();assert.equal(await p.locator('#'+reviewId).getAttribute('open'),'');
 assert.equal(await p.locator('#'+reviewId+' > summary').evaluate(el=>el===document.activeElement),true);
 await restart(p);const seen=[];
 for(let i=0;i<10;i++){
  assert.equal(await p.locator('.case-context').isVisible(),false);assert.equal(await p.locator('mark,.review-card').count(),0);
  assert.equal(await p.locator('.email-card a,.email-card input,.email-card form').count(),0);
  seen.push(await judgement(p));
 }
 assert.equal(new Set(seen).size,10);assert.match(await p.locator('.score-circle strong').innerText(),/^100/);assert.equal(await p.locator('.review-card').count(),10);assert.equal(await p.locator('.decision-reasoning dt').count(),30);assert.equal(await p.locator('.submitted-evidence').count(),0);
 assert.equal(await p.locator('.catch-fish.caught').count(),5);assert.equal(await p.locator('.catch-fish.safe').count(),5);
 const lessons=new Set(bank.filter(e=>seen.includes(e.id)&&e.classification==='phishing').map(e=>e.lesson));
 assert.equal(await p.locator('.field-badges li').count(),lessons.size);
 console.log('PASS: offline play deals ten unique emails, five of each label, and ends after the tenth answer');
 await screenshot(p,'catch-report');
 await restart(p);for(let i=0;i<3;i++)await judgement(p);for(let i=0;i<2;i++)await judgement(p,{correct:false});await p.clock.fastForward(91000);assert.match(await p.locator('.score-circle strong').innerText(),/^30\s*\/\s*100$/);assert.match(await p.locator('.timeout-note').innerText(),/5 emails were unanswered/);
 assert.match(await p.locator('.score-breakdown').innerText(),/3 correct × 10 = 30 \/ 100\. Wrong and unanswered emails earn 0 points/);
 console.log('PASS: three correct, two wrong and five unanswered display 30 points');
 assert.equal(await p.locator('.catch-fish.escaped,.catch-fish.miscast').count(),2);assert.equal(await p.locator('.catch-fish.untouched').count(),5);
 for(const v of [{width:1366,height:768},{width:1024,height:768},{width:768,height:1024},{width:390,height:844},{width:360,height:800}]){
  await p.setViewportSize(v);await restart(p);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
  if(v.width>720)assert.equal(await p.locator('[data-answer]').last().evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight),true);
  for(let i=0;i<9;i++)await judgement(p);assert.equal(await p.locator('.email-progress [aria-current="step"]').count(),1);await judgement(p);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
 }
 console.log('PASS: investigation controls, round progress and reviews fit five desktop/mobile sizes');
 await screenshot(p,'mobile-catch');
 const motion=await browser.newContext({viewport:{width:1366,height:768},offline:true}),m=await motion.newPage();watch(m);await m.clock.install();await m.goto(url);await m.locator('#start-game').click();
 for(const correct of [true,false]){
  const id=await m.locator('[data-question]').first().getAttribute('data-question'),email=bank.find(e=>e.id===id),choice=correct?email.classification:email.classification==='phishing'?'legitimate':'phishing';
  const envelope=m.locator('.fishing-mail');
  assert.ok(await envelope.evaluate(el=>el.getBoundingClientRect().top>el.closest('.fishing-water').getBoundingClientRect().top+35));
  await m.locator(`[data-answer="${choice}"]`).click();
  assert.equal(await m.locator('.is-reeling').count(),1);assert.equal(await m.locator('.cast-feedback').innerText(),'Reeling in…');
  assert.equal(await m.locator('.catch-report,.field-badges,mark').count(),0);
  const rig=m.locator('.fishing-rig');
  const duration=await rig.evaluate(el=>{
   const reel=el.getAnimations().find(animation=>animation.animationName==='reel-in');
   reel.pause();
   return reel.effect.getTiming().duration;
  });
  assert.ok(duration>=750,'the lift should be visible at normal speed');
  await m.clock.runFor(350);
  assert.notEqual(await m.locator('[data-question]').first().getAttribute('data-question'),id,'next email opens before reel finishes');
  assert.equal(await m.locator('.is-reeling').count(),1);
  await rig.evaluate((el,peak)=>{el.getAnimations().find(animation=>animation.animationName==='reel-in').currentTime=peak},duration*.63);
  assert.ok(await envelope.evaluate(el=>el.getBoundingClientRect().bottom<el.closest('.fishing-water').getBoundingClientRect().top+35));
  await rig.evaluate(el=>el.getAnimations().find(animation=>animation.animationName==='reel-in').finish());
  await m.locator('.is-reeling').waitFor({state:'detached'});
 }
 await m.clock.fastForward(91000);await m.locator('.new-player').first().click();assert.equal(await m.locator('.catch-report,.field-badges').count(),0);
 await motion.close();
 assert.equal(await p.locator('.catch-fish').first().evaluate(el=>getComputedStyle(el).animationName),'none');
 console.log('PASS: identical neutral reel animation for right/wrong answers; no early reveal; reset clears catches; reduced motion stays still');
 // Exercise the real embedded page against a local host double, without event/API writes.
 const hostContext=await browser.newContext({viewport:{width:1366,height:900},offline:true,reducedMotion:'reduce'});
 const apiWrites=[];
 await hostContext.route('**/*',async route=>{
  const pathname=decodeURIComponent(new URL(route.request().url()).pathname);
  if(pathname==='/host')return route.fulfill({contentType:'text/html',body:`<!doctype html><style>body{margin:0}iframe{width:100%;height:100vh;border:0}</style><script>
   window.finishes=[];
   window.ScamuraiBooth={demo:false,snapshot:()=>JSON.parse(sessionStorage.getItem('test-round')||'null'),update:(win,snapshot)=>sessionStorage.setItem('test-round',JSON.stringify(snapshot)),finish:(win,snapshot,score)=>{sessionStorage.setItem('test-round',JSON.stringify(snapshot));window.finishes.push({snapshot,score})},next:()=>{}};
   </script><iframe src="/games/phishing-fishing/game.html"></iframe>`});
  if(pathname.startsWith('/api/')){apiWrites.push(pathname);return route.abort()}
  let relative=pathname.startsWith('/games/')?pathname.slice(1):'server/public'+pathname;
  if(relative.endsWith('/'))relative+='index.html';
  const file=path.resolve(__dirname,'../../..',relative);
  const mime={'.html':'text/html','.js':'application/javascript','.css':'text/css','.ttf':'font/ttf','.png':'image/png','.svg':'image/svg+xml'}[path.extname(file)];
  if(!fs.existsSync(file))return route.fulfill({status:404,body:'Not found'});
  return route.fulfill({path:file,contentType:mime});
 });
 const h=await hostContext.newPage();h.on('pageerror',e=>errors.push(e.message));await h.clock.install();await h.goto('http://phishing.test/host');
 const game=()=>h.frames().find(f=>f.url().endsWith('/games/phishing-fishing/game.html'));
 await h.frameLocator('iframe').locator('#start-game').click();
 assert.equal(await game().locator('.email-progress li').count(),10);
 const originalStart=await h.evaluate(()=>JSON.parse(sessionStorage.getItem('test-round')).startedAt);
 await h.reload();await h.frameLocator('iframe').locator('[data-question]').first().waitFor();
 assert.equal(await h.evaluate(()=>JSON.parse(sessionStorage.getItem('test-round')).startedAt),originalStart);
 const missed=new Set();
 for(let i=0;i<10;i++){
  const f=game(),id=await f.locator('[data-question]').first().getAttribute('data-question'),email=bank.find(e=>e.id===id);
  let choice=email.classification;
  if(!missed.has(email.classification)){
   choice=email.classification==='phishing'?'legitimate':'phishing';
   missed.add(email.classification);
  }
  await f.locator(`[data-answer="${choice}"]`).click();await h.clock.runFor(350);
 }
 assert.equal(await game().locator('.catch-fish').count(),10);
 const escaped=game().locator('.catch-fish.escaped'),safe=game().locator('.catch-fish.safe').first();
 assert.equal(await escaped.count(),1);assert.equal(await game().locator('.catch-fish.miscast').count(),1);
 assert.notEqual(await escaped.locator('.catch-symbol').innerHTML(),await safe.locator('.catch-symbol').innerHTML());
 assert.equal(await escaped.evaluate(el=>getComputedStyle(el).borderStyle),'dashed');
 assert.equal(await safe.evaluate(el=>getComputedStyle(el).borderStyle),'solid');
 assert.deepEqual(await h.evaluate(()=>finishes.map(f=>f.score)),[80]);
 await screenshot(h,'event-results');
 if(process.env.ARTIFACT_DIR)await game().locator('.catch-report').screenshot({path:path.join(process.env.ARTIFACT_DIR,'event-catch.png')});
 await h.reload();await h.frameLocator('iframe').locator('.catch-report').waitFor();assert.match(await game().locator('.score-circle strong').innerText(),/^80/);
 await h.evaluate(()=>{const snapshot=JSON.parse(sessionStorage.getItem('test-round'));snapshot.version=3;sessionStorage.setItem('test-round',JSON.stringify(snapshot))});
 await h.reload();await h.frameLocator('iframe').locator('.catch-report').waitFor();
 assert.match(await game().locator('.score-circle strong').innerText(),/^60/);
 assert.match(await game().locator('.score-breakdown').innerText(),/Previous scoring rules/);
 await h.evaluate(()=>{const snapshot=JSON.parse(sessionStorage.getItem('test-round'));snapshot.questionIds[0]='penguin-qr';sessionStorage.setItem('test-round',JSON.stringify(snapshot))});
 await h.reload();await h.frameLocator('iframe').locator('.setup-error').waitFor();assert.equal(await h.evaluate(()=>finishes.length),0);
 const oldRound=new Round(bank,{...config,roundQuestions:bank.length});oldRound.start();
 await h.evaluate(snapshot=>sessionStorage.setItem('scamurai.booth.3.demo.v1',JSON.stringify({version:1,status:'open',roundId:null,participant:null,snapshot})),oldRound.snapshot());
 await h.goto('http://phishing.test/games/phishing-fishing/?demo=1');
 const demo=h.frameLocator('#booth-frame');
 await demo.locator('#start-game').click();
 assert.equal(await demo.locator('.email-progress li').count(),10);
 assert.equal(await h.evaluate(()=>JSON.parse(sessionStorage.getItem('scamurai.booth.3.demo.v1')).snapshot.questionIds.length),10);
 assert.deepEqual(apiWrites,[]);
 await hostContext.close();
 console.log('PASS: embedded event keeps score and deadline across reload; the web demo restarts old 32-email saves as ten-email rounds without API writes');
 const touch=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,offline:true}),t=await touch.newPage();watch(t);await t.clock.install();await t.goto(url);await t.locator('#start-game').tap();
 for(let i=0;i<10&&!(await t.locator('[data-link-inspector]').count());i++)await judgement(t);
 const block=t.locator('[data-link-inspector]').first();await block.locator('.inspect-link').tap({force:true});assert.equal(await block.locator('.link-destination').isVisible(),true);assert.equal(t.url(),url);assert.equal(touch.pages().length,1);
 await t.locator('#verify-independent').tap();assert.equal(await t.locator('.case-context').isVisible(),true);await touch.close();
 assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);assert.deepEqual(downloads,[]);console.log('PASS: touch verification/link inspection stay inert; no errors, remote requests or downloads');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(async()=>{if(browser)await browser.close()});

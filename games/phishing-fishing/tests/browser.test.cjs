/* Offline browser checks. Use an existing PLAYWRIGHT_PATH and BROWSER_PATH. */
"use strict";
const assert = require("node:assert/strict");
const path = require("node:path"), fs = require("node:fs");
const { pathToFileURL } = require("node:url");
const { chromium } = require(process.env.PLAYWRIGHT_PATH || "playwright");
const bank = require("../emails.js");
const shots = process.env.SCREENSHOT_DIR || "/tmp/scamurai-phishing-qa";
const url = pathToFileURL(path.resolve(__dirname, "../game.html")).href;
const errors = [], remoteRequests = [], downloads = [];
let browser;
async function check(name, fn) { await fn(); console.log(`PASS ${name}`); }
async function answer(page, correct = true) {
  const id = await page.locator("[data-question]").first().getAttribute("data-question");
  const email = bank.find(e => e.id === id);
  const kind = correct ? email.classification : email.classification === "legitimate" ? "phishing" : "legitimate";
  await page.locator(`[data-answer="${kind}"]`).click({force: true});
  await page.clock.runFor(350);
  return id;
}
async function restart(page) {
  await page.locator(".new-player").first().click({force: true});
  await page.locator("#start-game").click({force: true});
}
function observe(page) {
  page.on("pageerror", e => errors.push(e.message));
  page.on("download", d => downloads.push(d.suggestedFilename()));
  page.on("request", r => { if (/^https?:/.test(r.url())) remoteRequests.push(r.url()); });
}
(async () => {
  fs.mkdirSync(shots, {recursive: true});
  browser = await chromium.launch({headless: true, ...(process.env.BROWSER_PATH ? {executablePath: process.env.BROWSER_PATH} : {})});
  const context = await browser.newContext({viewport: {width: 1366, height: 900}, offline: true, reducedMotion: "reduce"});
  const page = await context.newPage(); observe(page);
  await page.clock.install();
  await page.addInitScript(() => {
    let seed = 7314;
    Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  });
  await page.goto(url);
  await check("practice welcome shows all 20 emails, 60 seconds and correct/wrong scoring", async () => {
    assert.match(await page.locator(".round-facts").innerText(), /20 emails/);
    assert.match(await page.locator(".round-facts").innerText(), /60 seconds/);
    assert.match(await page.locator(".scoring-note").innerText(), /each correct answer/);
    assert.match(await page.locator(".scoring-note").innerText(), /Unscored demo/);
    assert.equal(await page.locator('script[src^="http"],link[href^="http"]').count(), 0);
    await page.screenshot({path: path.join(shots, "welcome.png"), fullPage: true});
    await page.locator("#open-reference").click();
    assert.equal(await page.locator(".reference-institution").count(), 6);
    const text = await page.locator("#reference-dialog").innerText();
    assert.equal(bank.some(email => text.includes(email.subject)), false);
    await page.keyboard.press("Escape");
    await page.locator("#start-game").click();
    assert.equal(await page.locator("#timer-value").innerText(), "1:00");
    assert.equal(await page.locator(".email-progress li").count(), 20);
    await page.screenshot({path: path.join(shots, "inbox.png"), fullPage: true});
  });
  await check("duplicate clicks and repeat keys do not advance; timer stays shared", async () => {
    const id = await page.locator("[data-question]").first().getAttribute("data-question");
    await page.evaluate(kind => {
      const b = document.querySelector(`[data-answer="${kind}"]`); b.click(); b.click(); b.click();
    }, bank.find(e => e.id === id).classification);
    assert.equal(await page.locator(".answer-button:disabled").count(), 2);
    await page.clock.runFor(350);
    assert.equal(await page.locator(".email-progress .answered").count(), 1);
    await page.clock.runFor(9400);
    assert.equal(await page.locator("#timer-value").innerText(), "0:51");
    const second = await page.locator("[data-question]").first().getAttribute("data-question");
    const key = bank.find(e => e.id === second).classification === "phishing" ? "p" : "l";
    await page.keyboard.press(key);
    await page.evaluate(key => document.dispatchEvent(new KeyboardEvent("keydown", {key, repeat: true})), key);
    await page.clock.runFor(350);
    assert.equal(await page.locator(".email-progress .answered").count(), 2);
    assert.equal(await page.locator("mark,.review-card").count(), 0);
    await page.clock.fastForward(60000);
  });
  await check("practice partial timeout converts 10 correct / 2 wrong to 40, with 8 unanswered", async () => {
    await restart(page);
    for (let i = 0; i < 12; i++) await answer(page, i < 10);
    await page.locator("#open-reference").click();
    await page.keyboard.press("p");
    assert.equal(await page.locator(".email-progress .answered").count(), 12);
    await page.clock.fastForward(60000);
    assert.equal(await page.locator("#reference-dialog").evaluate(e => e.open), false);
    assert.equal((await page.locator(".score-circle strong").innerText()).replace(/\s/g, ""), "40/100");
    assert.match(await page.locator(".result-stats").innerText(), /83\.3/);
    assert.match(await page.locator(".result-stats").innerText(), /10 correct, 2 wrong/);
    assert.match(await page.locator(".result-stats").innerText(), /60\.0/);
    assert.equal(await page.locator(".review-card").count(), 20);
    assert.equal(await page.locator(".review-answer-line").filter({hasText: "Your answer: Unanswered"}).count(), 8);
    assert.match(await page.locator(".timeout-note").innerText(), /8 emails were unanswered/);
    assert.match(await page.locator(".score-breakdown").innerText(), /10 correct/);
    assert.ok(Math.abs(parseFloat(await page.locator(".score-circle").evaluate(e => e.style.getPropertyValue("--score-angle"))) - 144) < 1e-8);
    await page.screenshot({path: path.join(shots, "results.png"), fullPage: true});
  });
  await check("all 20 emails render, including diverse scams; links inspect without navigating", async () => {
    await restart(page);
    const ids = [];
    for (let i = 0; i < 20; i++) {
      assert.match(await page.locator(".game-topbar p").innerText(), new RegExp(`Email ${i + 1} of 20`));
      assert.equal(await page.locator("mark,.review-card").count(), 0);
      assert.equal(await page.locator(".email-card a,.email-card input,.email-card form").count(), 0);
      const id = await page.locator("[data-question]").first().getAttribute("data-question");
      const block = bank.find(e => e.id === id).body.find(b => b.type === "link");
      if (block) {
        const inspector = page.locator("[data-link-inspector]").first();
        await inspector.locator(".inspect-link").focus();
        assert.equal(await inspector.locator(".link-destination").isVisible(), true);
        await page.keyboard.press("Enter");
        assert.equal(await inspector.locator(".destination-url").innerText(), block.url);
        await page.keyboard.press("Escape");
        assert.equal(await inspector.locator(".link-destination").isVisible(), false);
        await inspector.locator(".simulated-link").evaluate(b => b.click());
        assert.equal(await inspector.locator(".link-destination").isVisible(), true);
        assert.equal(page.url(), url);
      }
      if (id === "alien-wallet") await page.screenshot({path: path.join(shots, "funny-scam.png"), fullPage: true});
      ids.push(await answer(page));
    }
    assert.equal(new Set(ids).size, 20);
    assert.equal(await page.locator(".review-card").count(), 20);
    assert.match(await page.locator(".score-circle strong").innerText(), /^100/);
    assert.equal(await page.locator(".score-circle").evaluate(e => e.style.getPropertyValue("--score-angle")), "360deg");
    await page.locator(".review-card summary").first().click({force: true});
    assert.ok(await page.locator("mark").count() > 0);
    assert.equal(await page.locator(".review-email button,.review-email a").count(), 0);
  });
  await check("zero answers, one correct answer and all incorrect answers score consistently", async () => {
    for (const [answered, correct, expected] of [[0,0,0],[1,1,5],[8,8,40],[10,8,30],[10,10,50],[20,0,0]]) {
      await restart(page);
      for (let i = 0; i < answered; i++) await answer(page, i < correct);
      if (answered < 20) await page.clock.fastForward(60000);
      assert.equal((await page.locator(".score-circle strong").innerText()).replace(/\s/g, ""), `${expected}/100`);
      assert.equal(await page.locator("[data-answer]").count(), 0);
      assert.equal(await page.locator(".review-card").count(), 20);
    }
  });
  await check("full-bank progress, results and welcome fit five screen sizes", async () => {
    for (const viewport of [{width:1366,height:768},{width:1024,height:768},{width:768,height:1024},{width:390,height:844},{width:360,height:800}]) {
      await page.setViewportSize(viewport);
      await restart(page);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      if (viewport.width > 720) assert.equal(await page.locator(".answer-buttons").evaluate(e => e.getBoundingClientRect().bottom <= innerHeight), true);
      for (let i = 0; i < 19; i++) await answer(page);
      assert.match(await page.locator(".game-topbar p").innerText(), /Email 20 of 20/);
      assert.equal(await page.locator('.email-progress [aria-current="step"]').evaluate(e => {
        const step = e.getBoundingClientRect();
        const rail = e.closest(innerWidth > 720 ? ".round-sidebar" : ".email-progress").getBoundingClientRect();
        return innerWidth > 720 ? step.top >= rail.top && step.bottom <= rail.bottom : step.left >= rail.left && step.right <= rail.right;
      }), true, `current step visible at ${viewport.width}`);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      if (viewport.width === 360) await page.screenshot({path:path.join(shots,"mobile-progress-email-20.png"),fullPage:true});
      await answer(page);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      if (viewport.width === 360) await page.screenshot({path:path.join(shots,"mobile-results.png"),fullPage:true});
    }
    await page.locator(".new-player").first().click({force:true});
    assert.equal(await page.locator(".review-card,#timer").count(), 0);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
    await page.screenshot({path:path.join(shots,"mobile-welcome.png"),fullPage:true});
  });
  await check("touch inspection only reveals an inert destination", async () => {
    const ctx = await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,offline:true});
    const touch = await ctx.newPage(); observe(touch); await touch.clock.install();
    await touch.goto(url); await touch.locator("#start-game").tap();
    for (let i=0; i<20 && !(await touch.locator("[data-link-inspector]").count()); i++) await answer(touch);
    const inspector = touch.locator("[data-link-inspector]").first();
    await inspector.locator(".inspect-link").tap({force:true});
    assert.equal(await inspector.locator(".link-destination").isVisible(), true);
    assert.equal(touch.url(), url); assert.equal(ctx.pages().length, 1);
    await ctx.close();
  });
  assert.deepEqual(errors, []); assert.deepEqual(remoteRequests, []); assert.deepEqual(downloads, []);
  console.log("\nAll browser checks passed. No browser errors, remote requests or downloads.");
})().catch(error => {console.error(error); process.exitCode=1;}).finally(async () => {if(browser) await browser.close();});

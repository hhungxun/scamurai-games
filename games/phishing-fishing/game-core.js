/* Pure game logic, shared by the offline page and optional verification script. */
(function (root) {
  "use strict";
  const reference = typeof module !== "undefined" && module.exports ? require("./domains.js") : root.DOMAIN_REFERENCE;
  const belongsTo = (host, domain) => host === domain || host.endsWith(`.${domain}`);
  function shuffle(items, random = Math.random) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function evidenceChoices(email) {
    return ['sender','subject',...email.body.flatMap((block,i)=>block.type==='link'?[`body:${i}`,`destination:${i}`]:[`body:${i}`]),...email.context.facts.map((_,i)=>`verification:${i}`)];
  }
  function validateBank(bank, settings) {
    if (!Number.isFinite(settings.roundSeconds) || settings.roundSeconds <= 0) throw new Error("roundSeconds must be positive.");
    if (!Array.isArray(bank) || !bank.length || new Set(bank.map(email => email.id)).size !== bank.length)
      throw new Error("The bank must contain emails with unique IDs.");
    if (![10,bank.length].includes(settings.roundQuestions) || settings.roundQuestions > bank.length)
      throw new Error("roundQuestions must be 10 or the full practice bank.");
    if (settings.roundQuestions === 10 && ["phishing","legitimate"].some(kind => bank.filter(e => e.classification === kind).length < 5))
      throw new Error("A scored deal needs five messages of each classification.");
    for (const email of bank) {
      if (!email.context || typeof email.context.source !== 'string' || !email.context.source.trim() || !Array.isArray(email.context.facts) || email.context.facts.length < 1 || email.context.facts.some(fact=>typeof fact !== 'string' || !fact.trim())) throw new Error("Every email needs independent case notes.");
      if (!email.reasoning || ['evidence','contrast','nextStep'].some(key=>typeof email.reasoning[key] !== 'string' || !email.reasoning[key].trim())) throw new Error("Every classification needs evidence, a counterpoint and a safe next step.");
      if (!email.id || !["phishing", "legitimate"].includes(email.classification)) throw new Error("Every email needs an ID and valid classification.");
      if (!email.senderName || !email.senderEmail || !email.subject || !email.body?.length || !email.explanation || !email.indicators?.length) throw new Error("An email is missing required content.");
      if (!["Easy", "Medium", "Hard"].includes(email.difficulty)) throw new Error("Unknown email difficulty.");
      const institution = reference.find(item => item.id === email.institution);
      if (!institution || !email.objective) throw new Error("Every email needs a reference institution and learning objective.");
      if (!/^[^\s@]+@(?:[a-z0-9-]+\.)+example$/i.test(email.senderEmail) || !/^[^\s@]+@(?:[a-z0-9-]+\.)+example$/i.test(email.recipient || "student@xmum.example")) throw new Error("All email addresses must use reserved .example domains.");
      if (email.classification === "legitimate" && !belongsTo(email.senderEmail.split("@")[1], institution.domain)) throw new Error("A legitimate sender must use its reference institution's domain.");
      for (const block of email.body) {
        if (!["paragraph", "detail", "link", "attachment"].includes(block.type) || typeof block.text !== "string") throw new Error("Unknown or incomplete email body block.");
        if (block.type === "link") {
          for (const address of [block.url, ...(/^https?:\/\//i.test(block.text) ? [block.text] : [])]) {
            const url = new URL(address);
            if (url.protocol !== "https:" || !url.hostname.endsWith(".example") || url.username || url.password || url.port) throw new Error("Simulated URLs must be HTTPS addresses on reserved .example domains, without credentials or ports.");
          }
          if (email.classification === "legitimate" && !belongsTo(new URL(block.url).hostname, institution.domain)) throw new Error("A legitimate destination must use its reference institution's domain.");
        }
      }
      if (!Array.isArray(email.acceptedEvidence) || !email.acceptedEvidence.length || email.acceptedEvidence.some(id=>!evidenceChoices(email).includes(id))) throw new Error("Evidence keys must identify selectable details in the message or verification record.");
      for (const clue of email.indicators) {
        const text = clue.target === "sender" ? email.senderEmail : clue.target === "subject" ? email.subject : clue.target === "body" ? email.body.map(block => `${block.text} ${block.url || ""}`).join("\n") : "";
        if (!clue.text || !clue.explanation || !text.includes(clue.text)) throw new Error("Each indicator must match text available in its email.");
      }
    }
  }
  function selectQuestions(bank, settings, random = Math.random) {
    validateBank(bank, settings);
    if (settings.roundQuestions === bank.length) return shuffle(bank, random);
    const groups = ["phishing","legitimate"].map(kind => {
      const candidates = bank.filter(e => e.classification === kind);
      // Equal difficulty mix for both classifications: 2 Easy, 2 Medium, 1 Hard.
      return ["Easy","Medium","Hard"].flatMap((difficulty,index) => {
        const pool = shuffle(candidates.filter(e => e.difficulty === difficulty), random);
        const count = index === 2 ? 1 : 2;
        if (pool.length < count) throw new Error("The scored bank needs 2 Easy, 2 Medium and 1 Hard of each classification.");
        return pool.slice(0,count);
      });
    });
    return shuffle(groups.flat(), random);
  }
  class Round {
    constructor(bank, settings, options = {}) {
      this.settings = settings;
      this.now = options.now || (() => Date.now());
      this.questions = selectQuestions(bank, settings, options.random || Math.random);
      this.answers = new Array(this.questions.length).fill(null);
      this.index = 0;
      this.verified = new Array(this.questions.length).fill(false);
      this.status = "ready";
      this.startedAt = null;
      this.endedAt = null;
      this.endReason = null;
      this.lastElapsed = 0;
      this.legacyScoring = false;
    }
    start() {
      if (this.status !== "ready") return false;
      this.startedAt = this.now();
      this.status = "playing";
      return true;
    }
    elapsedMs() {
      if (this.startedAt === null) return 0;
      // Retain the highest observed elapsed time, even if a clock moves backwards.
      this.lastElapsed = Math.min(this.settings.roundSeconds * 1000, Math.max(this.lastElapsed, (this.endedAt ?? this.now()) - this.startedAt, 0));
      return Math.min(this.settings.roundSeconds * 1000, this.lastElapsed);
    }
    remainingMs() { return Math.max(0, this.settings.roundSeconds * 1000 - this.elapsedMs()); }
    expire() {
      if (this.status === "playing" && this.remainingMs() <= 0) this.finish("timeout");
      return this.status === "finished";
    }
    current(questionId) { return this.status==='playing'&&!this.expire()&&this.questions[this.index]?.id===questionId; }
    verify(questionId) {
      if(!this.current(questionId))return false;
      this.verified[this.index]=true;return true;
    }
    answer(questionId, classification) {
      if(!this.current(questionId)||!['phishing','legitimate'].includes(classification))return false;
      this.answers[this.index]={classification};this.index++;
      if(this.index===this.questions.length)this.finish('completed');
      return true;
    }
    finish(reason) {
      if (this.status !== "playing") return;
      this.endedAt = reason === "timeout" ? this.startedAt + this.settings.roundSeconds * 1000 : Math.min(this.now(), this.startedAt + this.settings.roundSeconds * 1000);
      this.status = "finished";
      this.endReason = reason;
    }
    snapshot() {
      return {version:this.legacyScoring ? 3 : 4, roundSeconds:this.settings.roundSeconds, verified:[...this.verified], questionIds:this.questions.map(q=>q.id), answers:this.answers.map(a=>a&&{...a}), index:this.index,
        status:this.status, startedAt:this.startedAt, endedAt:this.endedAt, endReason:this.endReason, lastElapsed:this.lastElapsed};
    }
    static restore(bank, settings, data, options={}) {
      validateBank(bank, settings);
      if (![2,3,4].includes(data?.version) || data.version===2&&data.status==='finished' || data.roundSeconds !== settings.roundSeconds || !Array.isArray(data.questionIds) || data.questionIds.length !== settings.roundQuestions || new Set(data.questionIds).size !== data.questionIds.length || !Array.isArray(data.answers) || data.answers.length !== data.questionIds.length || !["ready","playing","finished"].includes(data.status)) throw new Error("Saved inbox uses a different exercise version or is damaged. Ask the Game Master to cancel this Round.");
      const questions=data.questionIds.map(id=>bank.find(q=>q.id===id));
      if (questions.some(q=>!q) || (settings.roundQuestions===10 && questions.filter(q=>q.classification==='phishing').length!==5)) throw new Error("Invalid saved email deal.");
      const count=data.answers.filter(a=>a!==null).length;
      if (data.index!==count || data.answers.some((a,i)=> i<count ? (!a||!['phishing','legitimate'].includes(a.classification)) : a!==null)) throw new Error("Invalid saved answers.");
      if(!Array.isArray(data.verified)||data.verified.length!==questions.length||data.verified.some(v=>typeof v!=='boolean'))throw new Error('Invalid verification record.');
      const finite=v=>Number.isFinite(v)&&v>=0;
      if (!finite(data.lastElapsed) || data.lastElapsed>settings.roundSeconds*1000 || (data.status==='ready' ? data.startedAt!==null||data.endedAt!==null||count!==0 : !finite(data.startedAt)) || (data.status==='playing' && (data.endedAt!==null||data.endReason!==null||count===questions.length)) || (data.status==='finished' && (!finite(data.endedAt)||data.endedAt<data.startedAt||data.endedAt>data.startedAt+settings.roundSeconds*1000||!['timeout','completed'].includes(data.endReason)||data.endReason==='completed'&&count!==questions.length||data.endReason==='timeout'&&data.endedAt!==data.startedAt+settings.roundSeconds*1000))) throw new Error("Invalid saved timer.");
      const round=Object.create(Round.prototype);
      Object.assign(round,{settings,now:options.now||(()=>Date.now()),questions,answers:data.answers.map(a=>a&&{classification:a.classification}),verified:[...data.verified],index:data.index,status:data.status,startedAt:data.startedAt,endedAt:data.endedAt,endReason:data.endReason,lastElapsed:data.lastElapsed});
      // A finished round may already have a saved or pending score on the host.
      round.legacyScoring = data.version === 3 && data.status === 'finished';
      return round;
    }
    results() {
      if (this.status !== "finished") throw new Error("Results are available only after the round.");
      const reviews=this.questions.map((email,i)=>{
        const submitted=this.answers[i],answer=submitted?.classification||null;
        const labelCorrect=answer===email.classification;
        return {email,answer,verified:this.verified[i],correct:labelCorrect};
      });
      const answered=this.answers.filter(Boolean).length,correct=reviews.filter(r=>r.correct).length;
      const incorrect=answered-correct;
      const pointsPerEmail = 100 / this.questions.length;
      const wrongAnswerPenalty = this.legacyScoring ? pointsPerEmail : 0;
      const rawScore = correct * pointsPerEmail - incorrect * wrongAnswerPenalty;
      return {endReason:this.endReason,score:Math.round(Math.max(0,rawScore)*10)/10,maximum:100,
        correct,incorrect,answered,unanswered:this.questions.length-answered,
        accuracy:answered?correct/answered:0,pointsPerEmail,wrongAnswerPenalty,rawScore,timeUsed:this.elapsedMs()/1000,reviews};
    }
  }
  const api = { evidenceChoices, shuffle, validateBank, selectQuestions, Round };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.GameCore = api;
})(typeof window !== "undefined" ? window : globalThis);

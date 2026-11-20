(()=>{'use strict';
const $=id=>document.getElementById(id);
const Core=window.RealAiCore;
const MAX_QUESTIONS=60;
const params=new URLSearchParams(location.search);
const host=window.parent!==window?window.parent.ScamuraiBooth:null;
const demo=!host||host.demo;
const VERSION=1;
let items=(window.REAL_OR_AI_QUESTIONS||[]).map(q=>({...q}));
// Demo/standalone only: merge the local answer key back in for judging. Event rounds
// get their verdicts from the server, so the shipped questions.js carries no answers.
if (demo && window.REAL_OR_AI_DEMO_ANSWERS) {
  for (const q of items) { const a = window.REAL_OR_AI_DEMO_ANSWERS[q.id]; if (a) q.answer = a; }
}
let round=null,ticker=null,awaitingNext=false,submitting=false,finishReported=false,lastResult=null,page='home';
const player=$('player');
let clearMediaWatch=()=>{};
function makeClock(){const wallOrigin=Date.now(),monoOrigin=performance.now();return()=>wallOrigin+Math.max(performance.now()-monoOrigin,Date.now()-wallOrigin);}
function announce(t){const a=$('announcer');if(a)a.textContent=t;}
function setText(id,t){const e=$(id);if(e)e.textContent=t;}
function pool(){return Core.usable(items);}
function counts(){
 const usable=pool(),photos=usable.filter(q=>q.type==='photo').length,voices=usable.filter(q=>q.type==='voice').length;
 setText('homeIntroCount',usable.length);setText('photoPoolCount',photos);setText('voicePoolCount',voices);
 $('startBtn').disabled=!usable.length;
 setText('editorCount',items.length+' / '+MAX_QUESTIONS+' total (including disabled)');
 $('addPhotoBtn').disabled=items.length>=MAX_QUESTIONS;$('addVoiceBtn').disabled=items.length>=MAX_QUESTIONS;
 const preview=usable.find(q=>q.type==='photo');if(preview)$('homePreview').src=preview.src;
}
function show(id){page=id;for(const key of ['home','game','result','organizer'])$('screen-'+key).classList.toggle('hidden',key!==id);window.scrollTo(0,0);}
function toast(msg){const t=$('toast');t.textContent=msg;t.classList.remove('hidden');setTimeout(()=>t.classList.add('hidden'),2400);}
function save(){if(!host||!round)return;try{host.update(window,round.snapshot());}catch(e){storageFailure(e);throw e;}}
function storageFailure(error){
 clearInterval(ticker);stopAudio();
 $('main').innerHTML='<section class="result"><div class="result-head"><h2>Keep this tab open.</h2><p></p></div></section>';
 $('main').querySelector('p').textContent='Your laptop could not preserve this Round: '+error.message+'. Ask the Game Master to cancel it before another participant starts.';
}
function stopAudio(){clearMediaWatch();try{player.pause();player.removeAttribute('src');player.load();}catch(e){}}
function fmt(ms){const sec=Math.ceil(ms/1000);return String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');}
function tick(){
 if(!round||round.status==='ready')return;
 const ms=round.remainingMs();setText('timerText',fmt(ms));$('timerText').classList.toggle('urgent',ms<=10000&&round.status==='playing');
 if(round.status==='playing'&&round.expire()){try{save();}catch(e){return;}showResults();}
}
function preloadOne(q,ms){
 return new Promise(resolve=>{
  let done=false;const fin=ok=>{if(!done){done=true;resolve(ok);}};
  setTimeout(()=>fin(false),ms);
  if(q.type==='photo'){const i=new Image();i.onload=()=>fin(true);i.onerror=()=>fin(false);i.src=q.src;}
  else{const a=new Audio();a.preload='auto';a.oncanplaythrough=()=>fin(true);a.onloadeddata=()=>fin(true);a.onerror=()=>fin(false);a.src=q.src;a.load();}
 });
}
let starting=false;
async function start(){
 if(starting)return;
 if(!pool().length){toast('Add a question with a media file first.');return;}
 starting=true;$('startBtn').disabled=true;
 try{
  clearInterval(ticker);stopAudio();
  let r;
  if(demo){
    r=new Core.Round(items,{now:makeClock()});
  }else{
    const deal=await host.deal(window);
    const questions=deal.ids.map(id=>items.find(q=>q.id===id)).filter(Boolean);
    if(questions.length!==deal.ids.length)throw new Error('This round draws questions missing from this build. Ask the Game Master to cancel the Round.');
    r=new Core.Round(items,{questions,seconds:deal.seconds,now:makeClock()});
  }
  // Load every stimulus before the clock starts.
  const oks=await Promise.all(r.questions.map(q=>preloadOne(q,15000)));
  if(oks.some(ok=>!ok)){toast('Some questions did not load. Check the connection and try again.');return;}
  round=r;finishReported=false;round.start();
  try{save();}catch(e){return;}
  show('game');renderQuestion();ticker=setInterval(tick,100);tick();
 }finally{starting=false;$('startBtn').disabled=!pool().length;}
}
function playVoice(){
 const q=round&&round.questions[round.index];
 if(page!=='game'||!q||q.type!=='voice')return;
 try{player.currentTime=0;const p=player.play();if(p&&p.catch)p.catch(()=>{const b=$('audioButton');if(b)b.textContent='▶  Play audio';toast('Press Space or the Play button to hear the clip.');});}catch(e){toast('Press the Play button to hear the clip.');}
}
function setAnswerButtons(disabled){$('answerReal').disabled=disabled;$('answerAI').disabled=disabled;}
function watchMedia(media,q,readyEvent){
 const status=$('mediaStatus'),kind=q.type==='photo'?'image':'audio';
 const active=()=>page==='game'&&!awaitingNext&&round&&round.current===q;
 status.hidden=false;status.textContent='Loading '+kind+'… You can still choose REAL or AI.';
 const ready=()=>{clearTimeout(timeout);if(active()){status.hidden=true;status.textContent='';}};
 const failed=()=>{clearTimeout(timeout);if(active()){status.hidden=false;status.textContent='This '+kind+' could not load. You can still choose REAL or AI, or ask the Game Master for help.';announce(status.textContent);}};
 const timeout=setTimeout(()=>{if(active()){status.hidden=false;status.textContent='This '+kind+' is taking too long to load. You can still choose REAL or AI, or ask the Game Master for help.';announce(status.textContent);}},8000);
 media.addEventListener(readyEvent,ready);media.addEventListener('error',failed);
 clearMediaWatch=()=>{clearTimeout(timeout);media.removeEventListener(readyEvent,ready);media.removeEventListener('error',failed);status.hidden=true;status.textContent='';clearMediaWatch=()=>{};};
}
function renderQuestion(){
 // Media readiness must never gate answers; only submitted answers disable them.
 stopAudio();awaitingNext=false;$('feedback').classList.add('hidden');setAnswerButtons(false);
 const q=round.questions[round.index];if(!q){showResults();return;}
 const n=round.questions.length;
 setText('questionCount',(round.index+1)+' / '+n);setText('scoreText',round.correct);
 $('progressFill').style.width=(round.index/n*100)+'%';
 setText('mediaTag',q.type==='photo'?'PHOTO':'VOICE');
 setText('sceneLabel',q.subtitle||'REAL OR AI?');
 setText('questionTitle',q.type==='photo'?'Is this a real photo or an AI-generated image?':'Is this a real voice or an AI-generated voice?');
 const box=$('mediaContainer');box.replaceChildren();
 if(q.type==='photo'){
  const img=new Image();img.alt=q.title||'Photo question';
  watchMedia(img,q,'load');
  img.src=q.src;box.append(img);
  const hint=document.createElement('span');hint.className='hint';hint.textContent=q.title||'Photo';box.append(hint);
 }else{
  const wrap=document.createElement('div');wrap.className='audio-wrap';
  const circle=document.createElement('div');circle.className='audio-circle';circle.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 10v4h3l4 4V6L7 10z"/><path d="M15 9a5 5 0 0 1 0 6M17 6a9 9 0 0 1 0 12"/></svg>';wrap.append(circle);
  const wave=document.createElement('div');wave.className='audio-wave';for(let j=0;j<31;j++){const b=document.createElement('span');b.style.height=(7+((j*11+j*j)%32))+'px';wave.append(b);}wrap.append(wave);
  const actions=document.createElement('div');actions.className='audio-actions';
  const play=document.createElement('button');play.type='button';play.className='play-audio';play.id='audioButton';play.textContent='▶  Play audio';play.addEventListener('click',playVoice);actions.append(play);
  const note=document.createElement('span');note.className='duration-note';note.textContent='Replay as often as you like (Space)';actions.append(note);wrap.append(actions);box.append(wrap);
  watchMedia(player,q,'canplay');
  player.src=q.src;
  player.onplay=()=>{wave.classList.add('animating');play.textContent='↻  Replay audio';};
  player.onpause=()=>wave.classList.remove('animating');player.onended=()=>wave.classList.remove('animating');
  playVoice();
 }
 announce('Question '+(round.index+1)+' of '+n+'. '+(q.type==='photo'?'Photo.':'Voice.'));
}
async function answer(choice){
 if(page!=='game'||awaitingNext||submitting||!round||round.status!=='playing')return;
 const q=round.current;
 let verdict;
 if(demo){
  const res=round.answer(choice);
  if(!res){try{save();}catch(e){return;}showResults();return;}
  verdict={correct:res.correct,answer:q.answer,clue:q.clue,explanation:q.explanation};
 }else{
  submitting=true;setAnswerButtons(true);       // block a double-submit while the server judges
  if(round.expire()){submitting=false;try{save();}catch(e){return;}showResults();return;}
  try{verdict=await host.answer(window,q.id,choice);}
  catch(e){submitting=false;setAnswerButtons(false);toast('Could not submit your answer: '+(e.message||'server error')+' — try again.');return;}
  submitting=false;
  const res=round.recordAnswer(choice,verdict.correct);
  if(!res){try{save();}catch(e){return;}showResults();return;}
 }
 try{save();}catch(e){return;}
 if(round.status==='finished'&&host){try{host.finish(window,round.snapshot(),round.score);finishReported=true;}catch(e){storageFailure(e);return;}}
 awaitingNext=true;setAnswerButtons(true);clearMediaWatch();player.pause();
 const f=$('feedback');f.classList.remove('hidden','right','wrong');f.classList.add(verdict.correct?'right':'wrong');
 const head=(verdict.correct?'Correct. ':'Not quite. ')+'It was '+(verdict.answer==='ai'?'AI':'REAL')+'.';
 setText('feedbackHead',head);setText('feedbackClue',verdict.clue||verdict.explanation||'');
 setText('scoreText',round.correct);$('progressFill').style.width=(round.index/round.questions.length*100)+'%';
 const last=round.status==='finished';$('nextBtn').textContent=last?'See results':'Next question';
 $('nextBtn').focus({preventScroll:true});announce(head+' '+(verdict.clue||verdict.explanation||''));
}
function next(){
 if(!awaitingNext)return;
 if(round.status==='finished'){showResults();return;}
 renderQuestion();
}
function showResults(){
 if(page==='result'||!round||round.status!=='finished')return;
 clearInterval(ticker);stopAudio();awaitingNext=false;
 const r=round,total=r.answers.length,correct=r.correct,bad=r.wrong,score=r.score,acc=total?Math.round(correct/total*100):0,n=r.questions.length;
 if(host&&!finishReported){try{host.finish(window,r.snapshot(),score);}catch(e){storageFailure(e);return;}}
 setText('resultHeading',r.endReason==='complete'?'Round complete!':"Time's up!");
 setText('resultSubtitle',r.endReason==='complete'?'You answered all '+n+' questions.':'60 seconds are over. Here is how far you got.');
 setText('circleNum',String(score));setText('answeredNum',total+' / '+n);setText('correctNum',correct);setText('wrongNum',bad);setText('accuracyNum',acc+'%');
 $('againBtn').textContent=host&&!demo?'Next participant':demo?'Play again':'Play again';
 $('reviewPanel').classList.add('hidden');$('reviewBtn').textContent='Review answers';renderReview();show('result');
 announce('Round finished. Score '+score+' out of 100.');
}
function renderReview(){const div=$('reviewList');div.replaceChildren();for(let i=0;i<round.answers.length;i++){
 const result=round.answers[i],q=round.questions[i];const row=document.createElement('div');row.className='review-row';
 const num=document.createElement('span');num.className='num';num.textContent='#'+String(i+1).padStart(2,'0');
 const content=document.createElement('div');content.className='actual';const heading=document.createElement('strong');heading.textContent=(q.type==='photo'?'Photo: ':'Voice: ')+(q.title||q.id);content.append(heading,document.createElement('br'));
 content.append(document.createTextNode('Your answer: '+result.choice.toUpperCase()+'. Correct: '+q.answer.toUpperCase()));
 const exp=document.createElement('div');exp.className='clue';exp.textContent=q.clue||q.explanation||'';content.append(exp);
 const badge=document.createElement('span');badge.className=(result.correct?'correct':'wrong')+' tag';badge.textContent=result.correct?'CORRECT':'WRONG';row.append(num,content,badge);div.append(row);
}}
function again(){if(host){host.next(window);return;}start();}
function restoreOrHome(){
 if(!host)return;
 const saved=host.snapshot(window);
 if(!saved){host.next(window);return;}
 if(demo&&saved.version!==VERSION){if(host.restartDemo)host.restartDemo(window);else window.parent.location.reload();return;}
 try{round=Core.Round.restore(items,saved,{now:makeClock()});}
 catch(e){
  $('main').innerHTML='<section class="result"><div class="result-head"><h2>This exercise has been updated.</h2><p></p></div></section>';
  $('main').querySelector('p').textContent='This tab contains an earlier Round that cannot be restored. Its saved score stays unchanged. Use Next participant if it is saved, or ask the Game Master to cancel the Round.';
  return;
 }
 if(round.status==='finished'||round.expire()){round.finish&&round.finish('time');showResults();return;}
 if(round.status==='ready'){round.start();}
 show('game');renderQuestion();ticker=setInterval(tick,100);tick();
}
function openEditor(){clearInterval(ticker);stopAudio();buildEditor();show('organizer');}
function field(label,value,callback,kind='input'){
 const lbl=document.createElement('label');lbl.textContent=label;const elem=document.createElement(kind==='textarea'?'textarea':'input');if(kind!=='textarea')elem.type='text';elem.value=value||'';elem.addEventListener('input',()=>callback(elem.value));lbl.append(elem);return lbl;
}
function buildEditor(){counts();const grid=$('editGrid');grid.replaceChildren();for(const q of items){
 const card=document.createElement('div');card.className='editcard';
 const line=document.createElement('div');line.className='meta-line';const type=document.createElement('div');type.className='tiny';type.textContent=q.id+' · '+q.type.toUpperCase();line.append(type);
 const del=document.createElement('button');del.type='button';del.className='delbtn';del.textContent='Remove';del.addEventListener('click',()=>{if(!confirm('Remove question '+q.id+'?'))return;items=items.filter(x=>x!==q);buildEditor();});line.append(del);card.append(line);
 const h=document.createElement('h3');h.textContent=q.title||'New question';card.append(h);
 const check=document.createElement('label');check.className='checkrow';const enabled=document.createElement('input');enabled.type='checkbox';enabled.checked=q.enabled!==false;enabled.addEventListener('change',()=>{q.enabled=enabled.checked;counts();});check.append(enabled,document.createTextNode('Include in game'));card.append(check);
 const label=document.createElement('label');label.textContent='Correct answer';const sel=document.createElement('select');for(const v of ['real','ai']){const opt=document.createElement('option');opt.value=v;opt.textContent=v.toUpperCase();opt.selected=q.answer===v;sel.append(opt);}sel.addEventListener('change',()=>q.answer=sel.value);label.append(sel);card.append(label);
 card.append(field('Scenario title',q.title,val=>{q.title=val;h.textContent=val||'New question';}));
 card.append(field('Subtitle / category',q.subtitle,val=>q.subtitle=val));
 card.append(field('Explanation shown after game',q.explanation,val=>q.explanation=val,'textarea'));
 card.append(field('Clue (one line shown after each answer)',q.clue,val=>q.clue=val));
 card.append(field('Media path (e.g. assets/images/my-photo.jpg)',q.src,val=>{q.src=val;counts();}));
 const fileLbl=document.createElement('label');fileLbl.textContent='OR upload '+(q.type==='photo'?'photo':'voice')+' file (embedded in exported questions.js)';const file=document.createElement('input');file.type='file';file.accept=q.type==='photo'?'image/*':'audio/*';file.addEventListener('change',async()=>{if(!file.files?.[0])return;try{q.src=await fileToData(file.files[0],q.type);buildEditor();toast(q.id+' media imported. Download questions.js to save.');}catch(err){toast('Could not import file: '+err.message);}});fileLbl.append(file);card.append(fileLbl);grid.append(card);
}}
function addQuestion(type){if(items.length>=MAX_QUESTIONS){toast('Maximum 60 questions reached.');return;}
 const prefix=type==='photo'?'P':'V';let n=1;while(items.some(q=>q.id===prefix+String(n).padStart(2,'0')))n++;
 items.push({id:prefix+String(n).padStart(2,'0'),type,answer:'real',title:'New '+(type==='photo'?'photo':'voice')+' question',subtitle:type==='photo'?'PHOTO · LOOK CLOSELY':'VOICE · LISTEN CLOSELY',clue:'',explanation:'Replace this with the verified reason after the game.',src:'',enabled:false,demo:false});buildEditor();
 const edit=$('editGrid');edit.lastElementChild?.scrollIntoView({behavior:'smooth',block:'center'});toast('Question added. Add a media path and enable it.');
}
function fileToData(file,type){return new Promise((resolve,reject)=>{let reader=new FileReader();reader.onerror=()=>reject(Error('File could not be read'));reader.onload=()=>{if(type==='photo'){let image=new Image();image.onerror=()=>reject(Error('Invalid image'));image.onload=()=>{const canvas=document.createElement('canvas'),scale=Math.min(1,1100/Math.max(image.width,image.height));canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.84));};image.src=reader.result;}else resolve(reader.result);};reader.readAsDataURL(file);});}
function exportQuestions(){
 const contents='window.REAL_OR_AI_QUESTIONS = '+JSON.stringify(items,null,2)+';\n';
 const url=URL.createObjectURL(new Blob([contents],{type:'text/javascript;charset=utf-8'}));
 const link=document.createElement('a');link.href=url;link.download='questions.js';
 document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 setText('exportInfo','Replace data/questions.js with the downloaded file.');
}
$('startBtn').addEventListener('click',start);
$('againBtn').addEventListener('click',again);
$('nextBtn').addEventListener('click',next);
$('organizerLink').addEventListener('click',openEditor);
$('backOrganizerBtn').addEventListener('click',()=>{counts();show('home');});
$('exportBtn').addEventListener('click',exportQuestions);$('addPhotoBtn').addEventListener('click',()=>addQuestion('photo'));$('addVoiceBtn').addEventListener('click',()=>addQuestion('voice'));
$('answerReal').addEventListener('click',()=>answer('real'));$('answerAI').addEventListener('click',()=>answer('ai'));
$('reviewBtn').addEventListener('click',()=>{const p=$('reviewPanel'),hidden=p.classList.toggle('hidden');$('reviewBtn').textContent=hidden?'Review answers':'Hide review';});
document.addEventListener('keydown',e=>{
 if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName))return;
 if(page!=='game')return;
 if(e.key==='Enter'&&awaitingNext){e.preventDefault();next();return;}
 if(!awaitingNext&&e.key==='1'){e.preventDefault();answer('real');}
 else if(!awaitingNext&&e.key==='2'){e.preventDefault();answer('ai');}
 else if(e.key===' '&&!/BUTTON/.test(document.activeElement?.tagName||'')){e.preventDefault();playVoice();}
});
const org=$('organizerLink');if(org&&params.get('organizer')==='1')org.classList.remove('hidden'),org.hidden=false;
counts();const w=$('waveDecoration');if(w)for(let i=0;i<28;i++){const el=document.createElement('span');el.style.height=(8+((i*19+i*i)%27))+'px';w.append(el);}
if(host)restoreOrHome();
})();

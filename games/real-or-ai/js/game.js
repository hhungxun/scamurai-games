(()=>{'use strict';
const $=id=>document.getElementById(id);
const MAX_QUESTIONS=60;
const T=60000;
let items=(window.REAL_OR_AI_QUESTIONS||[]).map(q=>({...q}));
let sequence=[],position=0,answers=[],active=false,deadline=0,ticker=null,startTime=0;
const player=$('player');
function shuffle(a){for(let i=a.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function pool(){return items.filter(q=>q.enabled!==false&&q.src&&q.answer&&q.type);}
function makeOrder(){
 const photos=shuffle(pool().filter(q=>q.type==='photo'));
 const voices=shuffle(pool().filter(q=>q.type==='voice'));
 const arranged=[];let choosePhoto=Math.random()<.5;
 while(photos.length||voices.length){
   const candidate=choosePhoto?photos:voices;
   const other=choosePhoto?voices:photos;
   if(candidate.length)arranged.push(candidate.pop());else arranged.push(other.pop());
   choosePhoto=!choosePhoto;
 }
 return arranged;
}
function counts(){
 const usable=pool(), photos=usable.filter(q=>q.type==='photo').length,voices=usable.filter(q=>q.type==='voice').length;
 $('homeIntroCount').textContent=usable.length;
 $('readyCount').textContent=usable.length;
 $('photoPoolCount').textContent=photos;
 $('voicePoolCount').textContent=voices;
 $('startBtn').disabled=!usable.length;
 $('editorCount').textContent=items.length+' / '+MAX_QUESTIONS+' total (including disabled)';
 $('addPhotoBtn').disabled=items.length>=MAX_QUESTIONS;
 $('addVoiceBtn').disabled=items.length>=MAX_QUESTIONS;
 const preview=usable.find(q=>q.type==='photo');if(preview)$('homePreview').src=preview.src;
}
function show(id){for(const key of ['home','game','result','organizer'])$('screen-'+key).classList.toggle('hidden',key!==id);window.scrollTo(0,0);}
function toast(msg){$('toast').textContent=msg;$('toast').classList.remove('hidden');setTimeout(()=>$('toast').classList.add('hidden'),2100);}
function updateTimer(){if(!active)return;const remaining=Math.max(0,deadline-performance.now()),sec=Math.ceil(remaining/1000);$('timerText').textContent=String(Math.floor(sec/60)).padStart(2,'0')+':'+String(sec%60).padStart(2,'0');$('timerText').classList.toggle('urgent',sec<=10);if(remaining<=0)finish('time');}
function start(){
 clearInterval(ticker);player.pause();answers=[];position=0;sequence=makeOrder();
 if(!sequence.length){toast('Add a question with a media file first.');return;}
 startTime=performance.now();deadline=startTime+T;active=true;show('game');renderQuestion();updateTimer();ticker=setInterval(updateTimer,100);
}
function playVoice(){if(!active||sequence[position]?.type!=='voice')return;
 try{player.currentTime=0;const promise=player.play();if(promise?.catch)promise.catch(()=>{if($('audioButton'))$('audioButton').textContent='▶ Play audio';});}catch(e){toast('Click Play Audio to hear this clip.');}
}
function renderQuestion(){
 if(!active)return;player.pause();player.removeAttribute('src');player.load();
 const q=sequence[position];if(!q){finish('complete');return;}
 $('questionCount').textContent=(position+1)+' / '+sequence.length;
 $('scoreText').textContent=answers.filter(x=>x.correct).length;
 $('progressFill').style.width=(position/sequence.length*100)+'%';
 $('mediaTag').textContent=q.type==='photo'?'▧ PHOTO':'♫ VOICE';
 $('sceneLabel').textContent=q.subtitle||'REAL OR AI?';
 $('questionTitle').textContent=q.type==='photo'?'Is this a real photo or an AI-generated image?':'Is this a real voice or an AI-generated voice?';
 const box=$('mediaContainer');box.replaceChildren();
 if(q.type==='photo'){
  const img=new Image();img.src=q.src;img.alt=q.title||'Photo question';box.append(img);
  const hint=document.createElement('span');hint.className='hint';hint.textContent=q.title||'Photo';box.append(hint);
 }else{
  const wrap=document.createElement('div');wrap.className='audio-wrap';
  const circle=document.createElement('div');circle.className='audio-circle';circle.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 10v4h3l4 4V6L7 10z"/><path d="M15 9a5 5 0 0 1 0 6M17 6a9 9 0 0 1 0 12"/></svg>';wrap.append(circle);
  const wave=document.createElement('div');wave.className='audio-wave';for(let j=0;j<31;j++){const b=document.createElement('span');b.style.height=(7+((j*11+j*j)%32))+'px';wave.append(b);}wrap.append(wave);
  const actions=document.createElement('div');actions.className='audio-actions';const play=document.createElement('button');play.className='play-audio';play.id='audioButton';play.textContent='▶  Play audio';play.addEventListener('click',playVoice);actions.append(play);
  const note=document.createElement('span');note.className='duration-note';note.textContent='Listen, then choose';actions.append(note);wrap.append(actions);box.append(wrap);
  player.src=q.src;player.onplay=()=>{wave.classList.add('animating');play.textContent='↻  Replay audio';};player.onpause=()=>wave.classList.remove('animating');player.onended=()=>wave.classList.remove('animating');
  playVoice();
 }
}
function answer(choice){if(!active)return;if(performance.now()>=deadline){finish('time');return;}
 const q=sequence[position];answers.push({id:q.id,choice,correct:choice===q.answer});position++;if(position>=sequence.length){finish('complete');return;}renderQuestion();updateTimer();}
function finish(reason){
 if(!active)return;active=false;clearInterval(ticker);player.pause();player.removeAttribute('src');player.load();
 const total=answers.length,correct=answers.filter(a=>a.correct).length,bad=total-correct,accuracy=total?Math.round(correct/total*100):0;
 $('resultHeading').textContent=reason==='complete'?'Challenge complete!':"Time's up!";
 $('resultSubtitle').textContent=reason==='complete'?`You answered all ${sequence.length} questions before the clock ran out.`:'60 seconds are over. Here’s how many you got through.';
 $('resultIcon').textContent=reason==='complete'?'🏆':'⏱';$('circleNum').textContent=correct;
 $('scoreCircle').style.setProperty('--progress',accuracy+'%');$('answeredNum').textContent=total+' / '+sequence.length;
 $('correctNum').textContent=correct;$('wrongNum').textContent=bad;$('accuracyNum').textContent=accuracy+'%';
 $('reviewPanel').classList.add('hidden');$('reviewBtn').textContent='☷   Review Answers';renderReview();show('result');
}
function renderReview(){const div=$('reviewList');div.replaceChildren();for(let i=0;i<answers.length;i++){
 let result=answers[i],q=sequence[i];const row=document.createElement('div');row.className='review-row';
 const num=document.createElement('span');num.className='num';num.textContent='#'+String(i+1).padStart(2,'0');
 const content=document.createElement('div');content.className='actual';const heading=document.createElement('strong');heading.textContent=(q.type==='photo'?'Photo · ':'Voice · ')+(q.title||q.id);content.append(heading,document.createElement('br'));
 content.append(document.createTextNode('Your answer: '+result.choice.toUpperCase()+' · Correct: '+q.answer.toUpperCase()));
 const exp=document.createElement('div');exp.textContent=q.explanation||'No explanation added yet.';exp.style.marginTop='6px';content.append(exp);
 const badge=document.createElement('span');badge.className=(result.correct?'correct':'wrong')+' tag';badge.textContent=result.correct?'✓ CORRECT':'✕ WRONG';row.append(num,content,badge);div.append(row);
}}
function openEditor(){active=false;clearInterval(ticker);player.pause();buildEditor();show('organizer');}
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
 card.append(field('Media path (e.g. assets/images/my-photo.jpg)',q.src,val=>{q.src=val;counts();}));
 const fileLbl=document.createElement('label');fileLbl.textContent='OR upload '+(q.type==='photo'?'photo':'voice')+' file (embedded in exported questions.js)';const file=document.createElement('input');file.type='file';file.accept=q.type==='photo'?'image/*':'audio/*';file.addEventListener('change',async()=>{if(!file.files?.[0])return;try{q.src=await fileToData(file.files[0],q.type);buildEditor();toast(q.id+' media imported. Download questions.js to save.');}catch(err){toast('Could not import file: '+err.message);}});fileLbl.append(file);card.append(fileLbl);grid.append(card);
}}
function addQuestion(type){if(items.length>=MAX_QUESTIONS){toast('Maximum 60 questions reached.');return;}
 const prefix=type==='photo'?'P':'V';let n=1;while(items.some(q=>q.id===prefix+String(n).padStart(2,'0')))n++;
 items.push({id:prefix+String(n).padStart(2,'0'),type,answer:'real',title:'New '+(type==='photo'?'photo':'voice')+' question',subtitle:type==='photo'?'PHOTO · LOOK CLOSELY':'VOICE · LISTEN CLOSELY',explanation:'Replace this with the verified reason after the game.',src:'',enabled:false,demo:false});buildEditor();
 const edit=$('editGrid');edit.lastElementChild?.scrollIntoView({behavior:'smooth',block:'center'});toast('Question added. Add a media path and enable it.');
}
function fileToData(file,type){return new Promise((resolve,reject)=>{let reader=new FileReader();reader.onerror=()=>reject(Error('File could not be read'));reader.onload=()=>{if(type==='photo'){let image=new Image();image.onerror=()=>reject(Error('Invalid image'));image.onload=()=>{const canvas=document.createElement('canvas'),scale=Math.min(1,1100/Math.max(image.width,image.height));canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.84));};image.src=reader.result;}else resolve(reader.result);};reader.readAsDataURL(file);});}
function exportQuestions(){const content='/* Real or AI? Questions · change and commit this file to GitHub */\nwindow.REAL_OR_AI_QUESTIONS = '+JSON.stringify(items,null,2)+';\n';const blob=new Blob([content],{type:'application/javascript;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='questions.js';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),4000);$('exportInfo').textContent='Downloaded questions.js. Upload it to data/questions.js in GitHub (replace the old file) and commit the changes.';}
$('startBtn').addEventListener('click',start);$('againBtn').addEventListener('click',start);
$('menuBtn').addEventListener('click',()=>{active=false;clearInterval(ticker);player.pause();show('home');});
$('organizerLink').addEventListener('click',openEditor);$('backOrganizerBtn').addEventListener('click',()=>{counts();show('home');});
$('exportBtn').addEventListener('click',exportQuestions);$('addPhotoBtn').addEventListener('click',()=>addQuestion('photo'));$('addVoiceBtn').addEventListener('click',()=>addQuestion('voice'));
$('answerReal').addEventListener('click',()=>answer('real'));$('answerAI').addEventListener('click',()=>answer('ai'));
$('reviewBtn').addEventListener('click',()=>{const p=$('reviewPanel'),hidden=p.classList.toggle('hidden');$('reviewBtn').textContent=hidden?'☷   Review Answers':'×   Hide Review';});
document.addEventListener('keydown',e=>{if(!active||e.repeat||/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName))return;if(e.key==='1'){e.preventDefault();answer('real');}if(e.key==='2'){e.preventDefault();answer('ai');}if(e.key===' '){e.preventDefault();playVoice();}});
document.addEventListener('visibilitychange',()=>{if(active)updateTimer();});
counts();const w=$('waveDecoration');for(let i=0;i<28;i++){let el=document.createElement('span');el.style.height=(8+((i*19+i*i)%27))+'px';w.append(el);}
})();

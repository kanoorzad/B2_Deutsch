const initialData = window.FLASHCARD_DATA.cards;
const STORE='b2-native-cards-extra-v9';
let extra=JSON.parse(localStorage.getItem(STORE)||'[]');
let cards=[...initialData,...extra];
let filtered=[];
let idx=0;
let flipped=false;
let lastFront=null;
let playing=false;
let paused=false;
let playQueue=[];
let playIndex=0;

const $=id=>document.getElementById(id);
const els={
  list:$('listFilter'),unit:$('unitFilter'),part:$('partFilter'),type:$('typeFilter'),search:$('search'),front:$('front'),
  prev:$('prev'),next:$('next'),flip:$('flip'),speakFront:$('speakFront'),card:$('card'),answer:$('answer'),
  frontText:$('frontText'),frontHint:$('frontHint'),frontSub:$('frontSub'),frontSyn:$('frontSynonyms'),
  chipList:$('chipList'),chipUnit:$('chipUnit'),chipPart:$('chipPart'),chipType:$('chipType'),
  de:$('de'),dePluralLine:$('dePluralLine'),en:$('en'),fa:$('fa'),nounBox:$('nounBox'),article:$('article'),singular:$('singular'),plural:$('plural'),
  verbBox:$('verbBox'),inf:$('inf'),pres3:$('pres3'),past:$('past'),perf:$('perf'),plus:$('plus'),verbQuality:$('verbQuality'),
  syn:$('syn'),ex:$('ex'),count:$('count'),bar:$('bar'),playDe:$('playDe'),playEn:$('playEn'),playFa:$('playFa'),playForms:$('playForms'),
  repeat:$('repeat'),playList:$('playList'),pauseList:$('pauseList'),stopList:$('stopList'),now:$('nowPlaying'),
  addForm:$('addForm'),exportBtn:$('exportBtn'),importJson:$('importJson'),theme:$('themeBtn'),install:$('installBtn'),voiceBtn:$('voiceBtn'),
  help:$('help'),closeHelp:$('closeHelp'),installText:$('installText'),deviceInfo:$('deviceInfo'),voiceDe:$('voiceDe'),voiceEn:$('voiceEn'),voiceFa:$('voiceFa'),
  testDe:$('testDe'),testEn:$('testEn'),testFa:$('testFa')
};

function unique(arr){return [...new Set(arr.filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}))}
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function norm(s){return String(s||'').toLowerCase().trim()}
function textOf(c){return [c.list,c.unit,c.part,c.category,c.german,c.english,c.dari,c.article,c.singular,c.plural,c.example,...Object.values(c.forms||{}),...(c.synonyms||[])].join(' ').toLowerCase()}
function displayGerman(c){return [c.article,c.singular||c.german].filter(Boolean).join(' ')||c.german||'—'}
function displayEnglish(c){return cleanEnglish(c.english||'—')}
function displayDari(c){return c.dari||'—'}
function twoSynonyms(c){return ((c.synonyms_en&&c.synonyms_en.length?c.synonyms_en:c.synonyms)||[]).filter(Boolean).slice(0,2)}
function setDirForLang(lang){if(lang==='fa')els.frontText.setAttribute('dir','rtl'); else els.frontText.removeAttribute('dir')}

// English cleanup: do not show/speak "slash". For playback/manual English, "x / y" becomes "x or y".
function cleanEnglish(text){
  return String(text||'')
    .replace(/\s*\/\s*/g,' or ')
    .replace(/\s+/g,' ')
    .trim();
}
// German/Dari speech cleanup avoids reading UI punctuation too harshly but keeps the learning text.
function cleanSpeechText(text, lang){
  let t=String(text||'').replace(/\s+/g,' ').trim();
  if(lang==='en') t=cleanEnglish(t);
  if(lang==='de') t=t.replace(/\s*\/\s*/g,' oder ');
  return t;
}

function formStep(c){
  const f=c.forms||{};
  if(c.category==='noun' && c.plural){
    return {display:c.plural, speech:c.plural, lang:'de', label:'German plural', sub:'Slow German pronunciation'};
  }
  if(c.category==='verb'){
    const visible=[];
    const spoken=[];
    if(f.infinitive){ visible.push(f.infinitive); spoken.push(f.infinitive); }
    if(f.past){ visible.push(f.past); spoken.push(f.past); }
    if(f.perfect){ visible.push(f.perfect); spoken.push(f.perfect); }
    if(f.plusquamperfekt){ visible.push(f.plusquamperfekt); spoken.push(f.plusquamperfekt); }
    if(visible.length){
      return {
        display:visible.join(' · '),
        speech:spoken.join('. '),
        lang:'de',
        label:'German verb forms',
        sub:'Infinitive · past · perfect · plusquamperfekt'
      };
    }
  }
  return null;
}

function setup(){
  els.list.innerHTML='<option value="all">All lists</option>'+unique(cards.map(c=>c.list)).map(x=>`<option>${esc(x)}</option>`).join('');
  updateUnits();
  detectDevice();
  updateVoiceStatus();
}
function updateUnits(){
  const list=els.list.value;
  const pool=list==='all'?cards:cards.filter(c=>c.list===list);
  els.unit.innerHTML='<option value="all">All units</option>'+unique(pool.map(c=>c.unit)).map(x=>`<option>${esc(x)}</option>`).join('');
  updateParts();
}
function updateParts(){
  const list=els.list.value,u=els.unit.value;
  const pool=cards.filter(c=>(list==='all'||c.list===list)&&(u==='all'||c.unit===u));
  els.part.innerHTML='<option value="all">All parts</option>'+unique(pool.map(c=>c.part)).map(x=>`<option>${esc(x)}</option>`).join('');
}
function apply(){
  const l=els.list.value,u=els.unit.value,p=els.part.value,t=els.type.value,q=norm(els.search.value);
  filtered=cards.filter(c=>(l==='all'||c.list===l)&&(u==='all'||c.unit===u)&&(p==='all'||c.part===p)&&(t==='all'||c.category===t)&&(!q||textOf(c).includes(q)));
  idx=Math.min(idx,Math.max(filtered.length-1,0));
  flipped=false;
  render();
}
function getManualFront(c){
  let mode=els.front.value;
  if(mode==='random')mode=['german','english','dari','plural'][Math.floor(Math.random()*4)];
  if(mode==='english')return {display:displayEnglish(c),speech:cleanSpeechText(c.english,'en'),label:'US English',sub:'Medium speed',lang:'en'};
  if(mode==='dari')return {display:displayDari(c),speech:displayDari(c),label:'Dari',sub:'Medium speed',lang:'fa'};
  if(mode==='plural'){
    const fs=formStep(c);
    return fs || {display:'No plural/forms for this card',speech:'',label:'Plural / forms',sub:'',lang:'de'};
  }
  return {display:displayGerman(c),speech:displayGerman(c),label:'German word with article',sub:'Slow German pronunciation',lang:'de'};
}

function renderSynonyms(c){
  const syns=twoSynonyms(c);
  const html=syns.map(s=>`<span>${esc(cleanEnglish(s))}</span>`).join('') || '<span>—</span>';
  els.frontSyn.innerHTML=html;
  els.syn.innerHTML=html;
}
function renderChips(c){
  els.chipList.textContent=c.list||'—';
  els.chipUnit.textContent=c.unit||'—';
  els.chipPart.textContent=c.part||'—';
  els.chipType.textContent=c.category||'—';
}
function renderDetails(c){
  // Critical clean flip mapping: German id receives German only, English id receives English only, Dari id receives Dari only.
  els.de.textContent=displayGerman(c);
  els.dePluralLine.textContent=(c.category==='noun'&&c.plural)?`Plural: ${c.plural}`:'';
  els.en.textContent=displayEnglish(c);
  els.fa.textContent=displayDari(c);

  els.nounBox.classList.toggle('hidden',c.category!=='noun');
  els.article.textContent=c.article||'—';
  els.singular.textContent=c.singular||c.german||'—';
  els.plural.textContent=c.plural||'—';

  const f=c.forms||{};
  const hasVerb=c.category==='verb'||Object.values(f).some(Boolean);
  els.verbBox.classList.toggle('hidden',!hasVerb);
  els.inf.textContent=f.infinitive||c.german||'—';
  els.pres3.textContent=f.present3||'—';
  els.past.textContent=f.past||'—';
  els.perf.textContent=f.perfect||'—';
  els.plus.textContent=f.plusquamperfekt||'—';
  els.verbQuality.textContent=(c.quality&&c.quality.verbForms)?`Form source: ${c.quality.verbForms}`:'';
  renderSynonyms(c);
  els.ex.textContent=c.example||'—';
}
function renderProgress(){
  els.count.textContent=filtered.length?`${idx+1} / ${filtered.length}`:'0 / 0';
  els.bar.style.width=filtered.length?`${((idx+1)/filtered.length)*100}%`:'0';
}

function render(){
  const c=filtered[idx];
  if(!c){
    els.frontText.textContent='No cards';
    els.frontHint.textContent='Change filters or add cards.';
    els.frontSub.textContent='';
    els.frontSyn.innerHTML='<span>—</span>';
    els.answer.classList.add('hidden');
    renderProgress();
    return;
  }
  const f=getManualFront(c);
  lastFront=f;
  renderChips(c);
  renderDetails(c);
  setDirForLang(f.lang);
  els.frontText.textContent=f.display||'—';
  els.frontHint.textContent=f.label;
  els.frontSub.textContent=f.sub||'';
  els.answer.classList.toggle('hidden',!flipped);
  els.card.classList.toggle('playing',playing);
  renderProgress();
}

function next(){if(!filtered.length)return;idx=(idx+1)%filtered.length;flipped=false;render()}
function prev(){if(!filtered.length)return;idx=(idx-1+filtered.length)%filtered.length;flipped=false;render()}
function flip(){flipped=!flipped;render()}

function voices(){return speechSynthesis.getVoices()||[]}
function voiceLabel(v){return v?`${v.name} (${v.lang})`:'Not found on this device'}
function pickVoice(lang){
  const vs=voices();
  const exact=lang==='de'?'de-DE':lang==='en'?'en-US':'fa-AF';
  const prefix=exact.slice(0,2);
  return vs.find(v=>v.lang===exact&&/premium|enhanced|natural|siri|google|microsoft/i.test(v.name))||
         vs.find(v=>v.lang===exact)||
         vs.find(v=>v.lang&&v.lang.startsWith(prefix))||
         (lang==='fa'?vs.find(v=>v.lang&&v.lang.startsWith('fa')):null);
}
function makeUtterance(text,lang,done){
  const u=new SpeechSynthesisUtterance(cleanSpeechText(text,lang));
  u.lang=lang==='de'?'de-DE':lang==='en'?'en-US':'fa-AF';
  u.rate=lang==='de'?0.64:0.92;
  u.pitch=1;
  const v=pickVoice(lang);
  if(v)u.voice=v;
  u.onend=done;
  u.onerror=done;
  return u;
}
function say(text,lang='de',done=()=>{}){
  if(!text){done();return}
  if(!('speechSynthesis'in window)){alert('Speech is not supported in this browser.');done();return}
  speechSynthesis.cancel();
  speechSynthesis.speak(makeUtterance(text,lang,done));
}
function queueSay(text,lang='de',done=()=>{}){
  if(!text){done();return}
  if(!('speechSynthesis'in window)){alert('Speech is not supported in this browser.');done();return}
  speechSynthesis.speak(makeUtterance(text,lang,done));
}
function speakFront(){if(lastFront)say(lastFront.speech||lastFront.display,lastFront.lang)}

function cardScript(c){
  const steps=[];
  if(els.playDe.checked){
    const g=displayGerman(c);
    steps.push({display:g,speech:g,lang:'de',label:'German word with article',sub:'Slow German pronunciation'});
  }
  if(els.playForms.checked){
    const fs=formStep(c);
    if(fs)steps.push(fs);
  }
  if(els.playEn.checked&&c.english){
    steps.push({display:displayEnglish(c),speech:cleanSpeechText(c.english,'en'),lang:'en',label:'US English',sub:'Medium pronunciation'});
  }
  if(els.playFa.checked&&c.dari){
    const d=displayDari(c);
    steps.push({display:d,speech:d,lang:'fa',label:'Dari',sub:'Medium pronunciation'});
  }
  return steps.filter(x=>x.display&&String(x.display).trim()&&String(x.display).trim()!=='—');
}

function renderPlaybackStep(item, partIdx){
  const c=item.card;
  const p=item.parts[partIdx];

  idx=Math.max(0,filtered.indexOf(c));
  flipped=false;
  playing=true;

  renderChips(c);
  renderDetails(c);
  renderProgress();

  setDirForLang(p.lang);
  els.card.classList.add('playing');
  els.answer.classList.add('hidden');
  els.frontText.textContent=p.display;
  els.frontHint.textContent=`Card ${item.cardNo}/${item.totalCards} · Step ${partIdx+1}/${item.parts.length} · ${p.label}`;
  els.frontSub.textContent=p.sub||'';
  lastFront=p;

  const langName=p.lang==='de'?'German':p.lang==='en'?'US English':'Dari';
  els.now.textContent=`Playing card ${item.cardNo}/${item.totalCards}: ${langName} — ${p.display}`;
}

function playSelected(){
  if(!filtered.length)return;
  stop(false);
  playing=true;
  paused=false;
  playQueue=[];
  const source=[...filtered];
  const rep=Number(els.repeat.value)||1;
  for(let r=0;r<rep;r++){
    source.forEach((c,i)=>{
      const parts=cardScript(c);
      if(parts.length)playQueue.push({card:c,parts,cardNo:i+1,totalCards:source.length});
    });
  }
  playIndex=0;
  if('speechSynthesis'in window)speechSynthesis.cancel();
  playNextPart(0);
}
function playNextPart(partIdx){
  if(!playing||playIndex>=playQueue.length){stop();return}
  if(paused)return;
  const item=playQueue[playIndex];
  if(partIdx>=item.parts.length){playIndex++;playNextPart(0);return}
  const part=item.parts[partIdx];
  renderPlaybackStep(item,partIdx);
  setTimeout(()=>queueSay(part.speech||part.display,part.lang,()=>setTimeout(()=>playNextPart(partIdx+1),520)),170);
}
function pauseResume(){
  if(!playing||!('speechSynthesis'in window))return;
  if(paused){
    paused=false;
    els.pauseList.textContent='Pause';
    speechSynthesis.resume();
  }else{
    paused=true;
    els.pauseList.textContent='Resume';
    speechSynthesis.pause();
    els.now.textContent='Paused.';
  }
}
function stop(doRender=true){
  playing=false;
  paused=false;
  playQueue=[];
  playIndex=0;
  if('speechSynthesis'in window)speechSynthesis.cancel();
  els.pauseList.textContent='Pause';
  els.now.textContent='Not playing.';
  els.card.classList.remove('playing');
  els.frontText.removeAttribute('dir');
  if(doRender)render();
}

function detectDevice(){
  const ua=navigator.userAgent||'';
  let device='Desktop or laptop';
  let instruction='Open the link in your browser. You can use it directly, or install it if your browser shows an install option.';
  if(/iPhone|iPad|iPod/i.test(ua)){
    device='iPhone/iPad';
    instruction='For iPhone/iPad: open this link in Safari, tap Share, then Add to Home Screen.';
  }else if(/Android/i.test(ua)){
    device='Android';
    instruction='For Android: open this link in Chrome, tap the three-dot menu, then Install app or Add to Home screen.';
  }else if(/Windows/i.test(ua)){
    device='Windows PC';
    instruction='For Windows: open in Chrome or Edge. Use the install icon if it appears, or just keep it as a browser bookmark.';
  }else if(/Macintosh/i.test(ua)){
    device='Mac';
    instruction='For Mac: open in Safari, Chrome, or Edge. Install if your browser offers the web-app option.';
  }
  els.deviceInfo.textContent=`Detected: ${device}. ${instruction}`;
  els.installText.textContent=instruction;
}
function updateVoiceStatus(){
  if(!('speechSynthesis'in window)){
    els.voiceDe.textContent=els.voiceEn.textContent=els.voiceFa.textContent='Speech not supported';
    return;
  }
  els.voiceDe.textContent=voiceLabel(pickVoice('de'));
  els.voiceEn.textContent=voiceLabel(pickVoice('en'));
  els.voiceFa.textContent=voiceLabel(pickVoice('fa'));
}

function addCard(e){
  e.preventDefault();
  const d=Object.fromEntries(new FormData(els.addForm).entries());
  const syns=String(d.synonyms||'').split(',').map(s=>s.trim()).filter(Boolean).slice(0,2);
  while(syns.length<2)syns.push(syns.length?'related meaning':'study term');
  const c={
    id:'custom-'+Date.now(),source:'user',list:'My cards',unit:d.unit||'My list',part:'',category:d.category||'other',
    german:d.german,english:d.english,dari:d.dari,article:d.article||'',singular:d.german,plural:d.plural||'',
    forms:{infinitive:d.infinitive||'',present3:'',past:d.past||'',perfect:d.perfect||'',plusquamperfekt:d.plusquamperfekt||''},
    synonyms:syns,synonyms_en:syns,example:'',quality:{verbForms:'user-entered',translation:'user-entered',synonyms:'user-entered'}
  };
  extra.push(c);
  localStorage.setItem(STORE,JSON.stringify(extra));
  cards=[...initialData,...extra];
  setup();apply();els.addForm.reset();
}
function exportBackup(){
  const blob=new Blob([JSON.stringify(extra,null,2)],{type:'application/json'});
  const u=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=u;a.download='my-flashcard-backup.json';a.click();
  URL.revokeObjectURL(u);
}
function importBackup(file){
  const r=new FileReader();
  r.onload=()=>{
    try{
      const x=JSON.parse(r.result);
      if(!Array.isArray(x))throw Error('Backup must be an array.');
      extra=x;
      localStorage.setItem(STORE,JSON.stringify(extra));
      cards=[...initialData,...extra];
      setup();apply();alert('Backup imported.');
    }catch(e){alert(e.message)}
  };
  r.readAsText(file);
}

['list','unit','part','type','front'].forEach(k=>els[k]?.addEventListener('change',()=>{
  if(k==='list')updateUnits();
  if(k==='unit')updateParts();
  apply();
}));
els.search.addEventListener('input',apply);
els.next.addEventListener('click',next);
els.prev.addEventListener('click',prev);
els.flip.addEventListener('click',flip);
els.card.addEventListener('click',()=>{if(!playing)flip()});
els.speakFront.addEventListener('click',speakFront);
els.playList.addEventListener('click',playSelected);
els.pauseList.addEventListener('click',pauseResume);
els.stopList.addEventListener('click',()=>stop());
els.addForm.addEventListener('submit',addCard);
els.exportBtn.addEventListener('click',exportBackup);
els.importJson.addEventListener('change',e=>e.target.files[0]&&importBackup(e.target.files[0]));
els.theme.addEventListener('click',()=>document.body.classList.toggle('dark'));
els.install.addEventListener('click',()=>els.help.showModal());
els.closeHelp.addEventListener('click',()=>els.help.close());
els.voiceBtn.addEventListener('click',()=>document.querySelector('.tools details:nth-of-type(2)').open=true);
els.testDe.addEventListener('click',()=>say('die Abteilung','de'));
els.testEn.addEventListener('click',()=>say('department or division','en'));
els.testFa.addEventListener('click',()=>say('دیپارتمنت، بخش','fa'));
document.querySelectorAll('[data-say]').forEach(b=>b.addEventListener('click',()=>{
  const c=filtered[idx];if(!c)return;
  if(b.dataset.say==='de')say(displayGerman(c),'de');
  if(b.dataset.say==='en')say(displayEnglish(c),'en');
  if(b.dataset.say==='fa')say(displayDari(c),'fa');
}));
document.addEventListener('keydown',e=>{
  if(e.target.matches('input,select,textarea'))return;
  if(e.code==='Space'){e.preventDefault();if(!playing)flip()}
  if(e.code==='ArrowRight')next();
  if(e.code==='ArrowLeft')prev();
});
if('speechSynthesis'in window){
  speechSynthesis.onvoiceschanged=()=>updateVoiceStatus();
  setTimeout(updateVoiceStatus,500);
}
if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js?v=9').catch(()=>{});
setup();
apply();

const initialData = window.FLASHCARD_DATA.cards;
const STORE='b2-native-cards-extra-v7';
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
  de:$('de'),en:$('en'),fa:$('fa'),nounBox:$('nounBox'),article:$('article'),singular:$('singular'),plural:$('plural'),
  verbBox:$('verbBox'),inf:$('inf'),pres3:$('pres3'),past:$('past'),perf:$('perf'),plus:$('plus'),verbQuality:$('verbQuality'),
  syn:$('syn'),ex:$('ex'),count:$('count'),bar:$('bar'),playDe:$('playDe'),playEn:$('playEn'),playFa:$('playFa'),playForms:$('playForms'),
  repeat:$('repeat'),playList:$('playList'),pauseList:$('pauseList'),stopList:$('stopList'),now:$('nowPlaying'),
  addForm:$('addForm'),exportBtn:$('exportBtn'),importJson:$('importJson'),theme:$('themeBtn'),install:$('installBtn'),voiceBtn:$('voiceBtn'),
  help:$('help'),closeHelp:$('closeHelp'),installText:$('installText'),deviceInfo:$('deviceInfo'),voiceDe:$('voiceDe'),voiceEn:$('voiceEn'),voiceFa:$('voiceFa'),
  testDe:$('testDe'),testEn:$('testEn'),testFa:$('testFa')
};

function unique(arr){return [...new Set(arr.filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}))}
function norm(s){return String(s||'').toLowerCase().trim()}
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function textOf(c){return [c.list,c.unit,c.part,c.category,c.german,c.english,c.dari,c.article,c.singular,c.plural,c.example,...Object.values(c.forms||{}),...(c.synonyms||[])].join(' ').toLowerCase()}
function displayGerman(c){return [c.article,c.singular||c.german].filter(Boolean).join(' ')||c.german||'—'}
function twoSynonyms(c){return ((c.synonyms_en&&c.synonyms_en.length?c.synonyms_en:c.synonyms)||[]).filter(Boolean).slice(0,2)}
function setDirForFront(lang){if(lang==='fa')els.frontText.setAttribute('dir','rtl'); else els.frontText.removeAttribute('dir')}

function formsText(c){
  const f=c.forms||{};
  if(c.category==='noun' && c.plural) return {txt:'Plural: '+c.plural, sub:'German plural', lang:'de'};
  if(c.category==='verb'){
    const parts=[];
    if(f.infinitive) parts.push('Infinitiv: '+f.infinitive);
    if(f.past) parts.push('Präteritum: '+f.past);
    if(f.perfect) parts.push('Perfekt: '+f.perfect);
    if(parts.length) return {txt:parts.join(' · '), sub:'German verb forms', lang:'de'};
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
function getFront(c){
  let mode=els.front.value;
  if(mode==='random')mode=['german','english','dari','plural'][Math.floor(Math.random()*4)];
  if(mode==='english')return {txt:c.english||'—',h:'US English',sub:'Medium speed',lang:'en'};
  if(mode==='dari')return {txt:c.dari||'—',h:'Dari',sub:'Medium speed',lang:'fa'};
  if(mode==='plural'){
    const ft=formsText(c);
    return ft ? {txt:ft.txt,h:ft.sub,sub:'German slow speed',lang:'de'} : {txt:'No plural/forms for this card',h:'Plural / forms',sub:'',lang:'de'};
  }
  return {txt:displayGerman(c),h:'German word with article',sub:'Slow German pronunciation',lang:'de'};
}

function renderSynonyms(c){
  const syns=twoSynonyms(c);
  const html=syns.map(s=>`<span>${esc(s)}</span>`).join('');
  els.syn.innerHTML=html || '—';
  els.frontSyn.innerHTML=html || '<span>—</span>';
}

function render(){
  const c=filtered[idx];
  if(!c){
    els.frontText.textContent='No cards';
    els.frontHint.textContent='Change filters or add cards.';
    els.frontSub.textContent='';
    els.frontSyn.innerHTML='<span>—</span>';
    els.answer.classList.add('hidden');
    els.count.textContent='0 / 0';
    els.bar.style.width='0';
    return;
  }

  lastFront=getFront(c);
  setDirForFront(lastFront.lang);
  els.frontText.textContent=lastFront.txt||'—';
  els.frontHint.textContent=lastFront.h;
  els.frontSub.textContent=lastFront.sub||'';
  els.chipList.textContent=c.list||'—';
  els.chipUnit.textContent=c.unit||'—';
  els.chipPart.textContent=c.part||'—';
  els.chipType.textContent=c.category||'—';

  els.de.textContent=displayGerman(c)+(c.plural?` · plural: ${c.plural}`:'');
  els.en.textContent=c.english||'—';
  els.fa.textContent=c.dari||'—';

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
  els.answer.classList.toggle('hidden',!flipped);
  els.count.textContent=`${idx+1} / ${filtered.length}`;
  els.bar.style.width=`${((idx+1)/filtered.length)*100}%`;
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
function say(text, lang='de', done=()=>{}){
  if(!text){done();return}
  if(!('speechSynthesis'in window)){alert('Speech is not supported in this browser.');done();return}
  const u=new SpeechSynthesisUtterance(text);
  u.lang=lang==='de'?'de-DE':lang==='en'?'en-US':'fa-AF';
  u.rate=lang==='de'?0.64:0.92;
  u.pitch=1;
  const v=pickVoice(lang);
  if(v)u.voice=v;
  u.onend=done;
  u.onerror=done;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}
function queueSay(text, lang='de', done=()=>{}){
  if(!text){done();return}
  if(!('speechSynthesis'in window)){alert('Speech is not supported in this browser.');done();return}
  const u=new SpeechSynthesisUtterance(text);
  u.lang=lang==='de'?'de-DE':lang==='en'?'en-US':'fa-AF';
  u.rate=lang==='de'?0.64:0.92;
  u.pitch=1;
  const v=pickVoice(lang);
  if(v)u.voice=v;
  u.onend=done;
  u.onerror=done;
  speechSynthesis.speak(u);
}
function speakFront(){if(lastFront)say(lastFront.txt,lastFront.lang)}

function cardScript(c){
  const steps=[];
  if(els.playDe.checked) steps.push({t:displayGerman(c),l:'de',label:'German word with article',sub:'Slow German'});
  if(els.playForms.checked){
    const ft=formsText(c);
    if(ft) steps.push({t:ft.txt,l:'de',label:ft.sub,sub:'Slow German'});
  }
  if(els.playEn.checked&&c.english) steps.push({t:c.english,l:'en',label:'US English',sub:'Medium speed'});
  if(els.playFa.checked&&c.dari) steps.push({t:c.dari,l:'fa',label:'Dari',sub:'Medium speed'});
  return steps.filter(x=>x.t&&String(x.t).trim()&&String(x.t).trim()!=='—');
}
function renderPlaybackCard(item, partIdx){
  const c=item.card;
  const p=item.parts[partIdx];
  idx=Math.max(0,filtered.indexOf(c));
  flipped=false;
  render();
  els.card.classList.add('playing');
  setDirForFront(p.l);
  els.frontText.textContent=p.t||'—';
  els.frontHint.textContent=`Card ${item.cardNo}/${item.totalCards} · ${p.label}`;
  els.frontSub.textContent=p.sub||'';
  renderSynonyms(c);
  const langName=p.l==='de'?'German':p.l==='en'?'US English':'Dari';
  els.now.textContent=`Playing card ${item.cardNo}/${item.totalCards}, step ${partIdx+1}/${item.parts.length}: ${displayGerman(c)} → ${langName}`;
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
  renderPlaybackCard(item,partIdx);
  const p=item.parts[partIdx];
  setTimeout(()=>queueSay(p.t,p.l,()=>setTimeout(()=>playNextPart(partIdx+1),520)),150);
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
  const de=pickVoice('de'), en=pickVoice('en'), fa=pickVoice('fa');
  els.voiceDe.textContent=voiceLabel(de);
  els.voiceEn.textContent=voiceLabel(en);
  els.voiceFa.textContent=voiceLabel(fa);
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
els.card.addEventListener('click',flip);
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
els.testDe.addEventListener('click',()=>say('der Beruf, die Berufe','de'));
els.testEn.addEventListener('click',()=>say('career, profession','en'));
els.testFa.addEventListener('click',()=>say('مسلک؛ شغل','fa'));
document.querySelectorAll('[data-say]').forEach(b=>b.addEventListener('click',()=>{
  const c=filtered[idx];if(!c)return;
  if(b.dataset.say==='de')say(displayGerman(c),'de');
  if(b.dataset.say==='en')say(c.english,'en');
  if(b.dataset.say==='fa')say(c.dari,'fa');
}));
document.addEventListener('keydown',e=>{
  if(e.target.matches('input,select,textarea'))return;
  if(e.code==='Space'){e.preventDefault();flip()}
  if(e.code==='ArrowRight')next();
  if(e.code==='ArrowLeft')prev();
});
if('speechSynthesis'in window){
  speechSynthesis.onvoiceschanged=()=>updateVoiceStatus();
  setTimeout(updateVoiceStatus,500);
}
if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
setup();
apply();

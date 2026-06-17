// v34: remove old service workers/caches once so old broken versions cannot control audio.
(function(){try{const key='v51AudioResetDone';if(!sessionStorage.getItem(key)){sessionStorage.setItem(key,'1');Promise.all([('serviceWorker'in navigator)?navigator.serviceWorker.getRegistrations().then(rs=>Promise.all(rs.map(r=>r.unregister()))):Promise.resolve(),('caches'in window)?caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))):Promise.resolve()]).then(()=>{if(!location.search.includes('fresh46=')){const sep=location.search?'&':'?';location.replace(location.pathname+location.search+sep+'fresh46='+Date.now())}}).catch(()=>{});}}catch(e){}})();
const initialData = window.FLASHCARD_DATA.cards;
const STORE='b2-native-cards-extra-v43';
let extra=JSON.parse(localStorage.getItem(STORE)||'[]');
let cards=[...initialData,...extra];
let filtered=[]; let idx=0; let flipped=false; let lastFront=null; let playing=false; let paused=false; let playQueue=[]; let playIndex=0;
let dariSpriteAudio=null;
let dariSpriteUnlocked=false;
let dariStopTimer=null;

const $=id=>document.getElementById(id);
const els={
  list:$('listFilter'),unit:$('unitFilter'),part:$('partFilter'),type:$('typeFilter'),search:$('search'),front:$('front'),
  prev:$('prev'),next:$('next'),flip:$('flip'),speakFront:$('speakFront'),card:$('card'),cardBottom:$('cardBottom'),answer:$('answer'),
  frontText:$('frontText'),frontHint:$('frontHint'),frontSub:$('frontSub'),frontSyn:$('frontSynonyms'),chipLabel:$('chipLabel'),
  de:$('de'),dePluralLine:$('dePluralLine'),en:$('en'),fa:$('fa'),nounBox:$('nounBox'),article:$('article'),singular:$('singular'),plural:$('plural'),
  verbBox:$('verbBox'),inf:$('inf'),pres3:$('pres3'),past:$('past'),perf:$('perf'),plus:$('plus'),syn:$('syn'),synBox:$('synBox'),ex:$('ex'),
  count:$('count'),bar:$('bar'),playDe:$('playDe'),playEn:$('playEn'),playFa:$('playFa'),playForms:$('playForms'),repeat:$('repeat'),
  playList:$('playList'),pauseList:$('pauseList'),stopList:$('stopList'),now:$('nowPlaying'),speechWarning:$('speechWarning'),
  addForm:$('addForm'),exportBtn:$('exportBtn'),importJson:$('importJson'),deviceInfo:$('deviceInfo'),voiceDe:$('voiceDe'),voiceEn:$('voiceEn'),voiceFa:$('voiceFa'),
  testDe:$('testDe'),testEn:$('testEn'),testFa:$('testFa'),unlockSpeech:$('unlockSpeech'),voiceSelectDe:$('voiceSelectDe'),voiceSelectEn:$('voiceSelectEn'),voiceSelectFa:$('voiceSelectFa'),scanDariVoices:$('scanDariVoices'),nextDariCandidate:$('nextDariCandidate'),dariCandidate:$('dariCandidate'),onlineStatus:$('onlineStatus')
};
function unique(a){return [...new Set(a.filter(Boolean))].sort((x,y)=>x.localeCompare(y,undefined,{numeric:true}))}
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function norm(s){return String(s||'').toLowerCase().trim()}
function textOf(c){return [c.list,c.unit,c.part,c.category,c.german,c.english,c.dari,c.article,c.singular,c.plural,c.example,...Object.values(c.forms||{}),...(c.synonyms_en||[]),...(c.synonyms_de||[]),...(c.synonyms_fa||[])].join(' ').toLowerCase()}
function displayGerman(c){return [c.article,c.singular||c.german].filter(Boolean).join(' ')||c.german||'—'}
function cleanEnglish(t){return String(t||'').replace(/\s*\/\s*/g,' or ').replace(/\s+/g,' ').trim()}
function displayEnglish(c){return cleanEnglish(c.english||'—')}
function displayDari(c){return c.dari||'—'}
function setDirForLang(lang){if(lang==='fa')els.frontText.setAttribute('dir','rtl'); else els.frontText.removeAttribute('dir')}
function showWarning(msg){els.speechWarning.textContent=msg; els.speechWarning.classList.remove('hidden')}
function clearWarning(){els.speechWarning.textContent=''; els.speechWarning.classList.add('hidden')}
function chipsFor(c,lang){ if(c.category!=='verb') return []; if(lang==='de')return(c.synonyms_de||[]).slice(0,3); if(lang==='fa')return(c.synonyms_fa||[]).slice(0,3); return(c.synonyms_en||[]).slice(0,3).map(cleanEnglish); }
function chipLabel(lang){ if(lang==='de')return 'German verb synonyms'; if(lang==='fa')return 'Dari verb synonyms'; return 'English verb synonyms'; }
function renderChips(c,lang='en'){
  const chips=chipsFor(c,lang);
  const show=c.category==='verb' && chips.length>0;
  els.cardBottom.classList.toggle('hidden',!show);
  els.synBox.classList.toggle('hidden',!show);
  if(!show){els.frontSyn.innerHTML=''; els.syn.innerHTML=''; return;}
  const html=chips.map(s=>`<span>${esc(s)}</span>`).join('');
  els.frontSyn.innerHTML=html; els.syn.innerHTML=html; els.chipLabel.textContent=chipLabel(lang);
  if(lang==='fa'){els.frontSyn.setAttribute('dir','rtl');els.syn.setAttribute('dir','rtl');}else{els.frontSyn.removeAttribute('dir');els.syn.removeAttribute('dir');}
}
function cleanSpeechText(text,lang){let t=String(text||'').replace(/\s+/g,' ').trim(); if(lang==='en')t=cleanEnglish(t); if(lang==='de')t=t.replace(/\s*\/\s*/g,' oder '); return t;}
function formStep(c){const f=c.forms||{}; if(c.category==='noun'&&c.plural)return{display:c.plural,speech:c.plural,lang:'de',label:'German plural',sub:'Slow'}; if(c.category==='verb'){const visible=[],spoken=[]; for(const k of ['infinitive','past','perfect','plusquamperfekt'])if(f[k]){visible.push(f[k]);spoken.push(f[k]);} if(visible.length)return{display:visible.join(' · '),speech:spoken.join('. '),lang:'de',label:'German forms',sub:'Slow'};} return null;}
function setup(){els.list.innerHTML='<option value="all">All lists</option>'+unique(cards.map(c=>c.list)).map(x=>`<option>${esc(x)}</option>`).join('');updateUnits();detectDevice();updateVoiceStatus();}
function updateUnits(){const l=els.list.value,pool=l==='all'?cards:cards.filter(c=>c.list===l);els.unit.innerHTML='<option value="all">All units</option>'+unique(pool.map(c=>c.unit)).map(x=>`<option>${esc(x)}</option>`).join('');updateParts();}
function updateParts(){const l=els.list.value,u=els.unit.value,pool=cards.filter(c=>(l==='all'||c.list===l)&&(u==='all'||c.unit===u));els.part.innerHTML='<option value="all">All parts</option>'+unique(pool.map(c=>c.part)).map(x=>`<option>${esc(x)}</option>`).join('');}
function apply(){const l=els.list.value,u=els.unit.value,p=els.part.value,t=els.type.value,q=norm(els.search.value);filtered=cards.filter(c=>(l==='all'||c.list===l)&&(u==='all'||c.unit===u)&&(p==='all'||c.part===p)&&(t==='all'||c.category===t)&&(!q||textOf(c).includes(q)));idx=Math.min(idx,Math.max(filtered.length-1,0));flipped=false;render();}
function getManualFront(c){let m=els.front.value;if(m==='random')m=['german','english','dari','plural'][Math.floor(Math.random()*4)];if(m==='english')return{display:displayEnglish(c),speech:cleanSpeechText(c.english,'en'),label:'English',sub:'Medium',lang:'en'};if(m==='dari')return{display:displayDari(c),speech:displayDari(c),label:'Dari',sub:'Medium',lang:'fa'};if(m==='plural'){const fs=formStep(c);return fs||{display:'No plural/forms',speech:'',label:'Plural / forms',sub:'',lang:'de'}}return{display:displayGerman(c),speech:displayGerman(c),label:'German',sub:'Slow',lang:'de'}}
function renderDetails(c,chipLang='en'){els.de.textContent=displayGerman(c);els.dePluralLine.textContent=(c.category==='noun'&&c.plural)?c.plural:'';els.en.textContent=displayEnglish(c);els.fa.textContent=displayDari(c);els.nounBox.classList.toggle('hidden',c.category!=='noun');els.article.textContent=c.article||'—';els.singular.textContent=c.singular||c.german||'—';els.plural.textContent=c.plural||'—';const f=c.forms||{},hasVerb=c.category==='verb'||Object.values(f).some(Boolean);els.verbBox.classList.toggle('hidden',!hasVerb);els.inf.textContent=f.infinitive||c.german||'—';els.pres3.textContent=f.present3||'—';els.past.textContent=f.past||'—';els.perf.textContent=f.perfect||'—';els.plus.textContent=f.plusquamperfekt||'—';renderChips(c,chipLang);els.ex.textContent=c.example||'—';}
function renderProgress(){els.count.textContent=filtered.length?`${idx+1} / ${filtered.length}`:'0 / 0';els.bar.style.width=filtered.length?`${((idx+1)/filtered.length)*100}%`:'0'}
function render(){const c=filtered[idx];if(!c){els.frontText.textContent='No cards';els.frontHint.textContent='Change filters.';els.frontSub.textContent='';els.cardBottom.classList.add('hidden');renderProgress();return}const f=getManualFront(c);lastFront=f;renderDetails(c,f.lang);setDirForLang(f.lang);els.frontText.textContent=f.display||'—';els.frontHint.textContent=f.label;els.frontSub.textContent=f.sub||'';els.answer.classList.toggle('hidden',!flipped);els.card.classList.toggle('playing',playing);renderProgress();}
function next(){if(!filtered.length)return;idx=(idx+1)%filtered.length;flipped=false;render()}function prev(){if(!filtered.length)return;idx=(idx-1+filtered.length)%filtered.length;flipped=false;render()}function flip(){flipped=!flipped;render()}


// v34 audio engine: native best-quality voices for German/English; Dari Auto = native Farsi/Persian voice if it truly works, otherwise local high-quality sprite fallback.
// v43 browser voice engine with brute-force Dari/Farsi mobile candidates.
// Keeps v3-v6 browser SpeechSynthesis, but tries all practical BCP-47 tags and voice-name forms.
// No local sprite/WebAudio/remote TTS.
// v51 Dari voice restored to version-4 style.
// Keep direct browser SpeechSynthesis. No online TTS, no audio sprites, no provider router.
// The key v4-style behavior is direct utterance creation and direct speechSynthesis.speak().
// v51: FULL version-4 voice engine restored for all languages.
// This is the original v4 pattern:
// voices() -> pickVoice(lang) -> say(text, lang, done)
// Direct SpeechSynthesisUtterance only. No online TTS. No router. No local audio sprite.
let activeUtterance=null;

function voices(){return speechSynthesis.getVoices()||[]}

function pickVoice(lang){
  const vs=voices();
  const exact= lang==='de'?'de-DE':lang==='en'?'en-US':'fa-AF';
  const prefix=exact.slice(0,2);
  return vs.find(v=>v.lang===exact&&/premium|enhanced|natural|siri|google|microsoft/i.test(v.name))||
         vs.find(v=>v.lang===exact)||
         vs.find(v=>v.lang&&v.lang.startsWith(prefix));
}

function say(text, lang='de', done=()=>{}){
  if(!text){done();return}
  if(!('speechSynthesis'in window)){
    alert('Speech is not supported in this browser.');
    done();
    return
  }
  const u=new SpeechSynthesisUtterance(text);
  u.lang=lang==='de'?'de-DE':lang==='en'?'en-US':'fa-AF';
  u.rate=lang==='de'?0.78:0.92;
  u.pitch=1;
  const v=pickVoice(lang);
  if(v)u.voice=v;
  activeUtterance=u;
  u.onend=()=>{activeUtterance=null;done()};
  u.onerror=()=>{activeUtterance=null;done()};
  speechSynthesis.speak(u);
}

// Compatibility wrappers for the newer UI. They do not change the v4 voice engine.
function sayBrowserOnly(text,lang='de',done=()=>{}){say(text,lang,done)}
function queueSay(t,l='de',d=()=>{}){say(t,l,d)}
function speakFront(){if(lastFront)say(lastFront.speech||lastFront.display||lastFront.txt,lastFront.lang)}

function voiceLabel(v){return v ? `${v.name} (${v.lang})` : 'Automatic'}
function voiceKey(v){return v ? `${v.name}|||${v.lang}` : ''}
function voiceByKey(k){return null}
function isFalseDariVoice(v){
  const name=((v&&v.name)||'').toLowerCase();
  const code=((v&&v.lang)||'').toLowerCase();
  return code==='bg-bg' || code.startsWith('bg') || /\bdaria\b|bulgarian|българ/i.test(name);
}
function selectedVoice(lang){return pickVoice(lang)||null}
function populateVoiceSelect(lang){
  const select = lang==='de' ? els.voiceSelectDe : lang==='en' ? els.voiceSelectEn : els.voiceSelectFa;
  if(!select)return;
  select.innerHTML='<option value="">Automatic</option>';
}
function populateAllVoiceSelects(){
  populateVoiceSelect('de');
  populateVoiceSelect('en');
  populateVoiceSelect('fa');
}
function saveVoiceChoice(lang){updateVoiceStatus()}
function updateOnlineStatus(msg){if(els.onlineStatus)els.onlineStatus.textContent='Automatic'}
function stopOnlineAudio(){}
function unlockSpeech(){
  populateAllVoiceSelects();
  updateVoiceStatus();
  try{speechSynthesis.cancel();speechSynthesis.resume()}catch(e){}
  els.now.textContent='Audio ready.';
}
function runDariVoiceSearch(){updateVoiceStatus()}
function tryCurrentDariCandidate(){updateVoiceStatus()}
function nextDariCandidate(){updateVoiceStatus()}
function detectDevice(){if(els.deviceInfo)els.deviceInfo.textContent='Audio ready.'}
function updateDariCandidateLabel(){if(els.dariCandidate)els.dariCandidate.textContent='Automatic'}
function autoInitVoices(){populateAllVoiceSelects();updateVoiceStatus()}
function scheduleAutoVoiceInit(){autoInitVoices()}
function updateVoiceStatus(){
  populateAllVoiceSelects();
  if(els.voiceDe)els.voiceDe.textContent=voiceLabel(pickVoice('de'));
  if(els.voiceEn)els.voiceEn.textContent=voiceLabel(pickVoice('en'));
  if(els.voiceFa)els.voiceFa.textContent=voiceLabel(pickVoice('fa'));
  updateDariCandidateLabel();
  updateOnlineStatus('Automatic');
}
function cardScript(c){
  const steps=[];
  if(els.playDe.checked){
    const g=displayGerman(c);
    steps.push({t:g,l:'de',label:'German',sub:'Slow'});
  }
  if(els.playForms.checked){
    const fs=formStep(c);
    if(fs)steps.push({t:fs.display||fs.speech,l:'de',label:fs.label||'German forms',sub:fs.sub||'Slow'});
  }
  if(els.playEn.checked&&c.english){
    steps.push({t:displayEnglish(c),l:'en',label:'English',sub:'Medium'});
  }
  if(els.playFa.checked&&c.dari){
    const d=displayDari(c);
    steps.push({t:d,l:'fa',label:'Dari',sub:'Medium',audio:c.audio_fa||''});
  }
  return steps.filter(x=>x.t&&String(x.t).trim()&&String(x.t).trim()!=='—');
}
function renderPlaybackCard(item,partIdx){
  const c=item.card;
  const p=item.parts[partIdx];
  idx=Math.max(0,filtered.indexOf(c));
  flipped=false;
  playing=true;
  renderDetails(c,p.l);
  renderProgress();
  setDirForLang(p.l);
  els.card.classList.add('playing');
  els.answer.classList.add('hidden');
  els.frontText.textContent=p.t;
  els.frontHint.textContent=p.label;
  els.frontSub.textContent=`${item.cardNo}/${item.totalCards} · ${p.sub||''}`;
  lastFront={display:p.t,speech:p.t,lang:p.l,label:p.label,sub:p.sub||'',audio:p.audio||''};
  els.now.textContent=`${item.cardNo}/${item.totalCards}: ${p.label} — ${p.t}`;
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
  playNextPart(0);
}
function playNextPart(partIdx){
  if(!playing||playIndex>=playQueue.length){stop();return}
  if(paused)return;
  const item=playQueue[playIndex];
  if(partIdx>=item.parts.length){playIndex++;playNextPart(0);return}
  renderPlaybackCard(item,partIdx);
  const p=item.parts[partIdx];
  const txt=p.t||p.speech||p.display||'';
  const lang=p.l||p.lang||'de';
  setTimeout(()=>say(txt,lang,()=>setTimeout(()=>playNextPart(partIdx+1),450)),120);
}
function pauseResume(){if(!playing||!('speechSynthesis'in window))return;if(paused){paused=false;els.pauseList.textContent='Pause';speechSynthesis.resume()}else{paused=true;els.pauseList.textContent='Resume';speechSynthesis.pause();els.now.textContent='Paused.'}}
function stop(doRender=true){
  playing=false;
  paused=false;
  playQueue=[];
  playIndex=0;
  stopOnlineAudio();
  if('speechSynthesis'in window)speechSynthesis.cancel();
  els.pauseList.textContent='Pause';
  els.now.textContent='Ready.';
  els.card.classList.remove('playing');
  els.frontText.removeAttribute('dir');
  if(doRender)render();
}

function addCard(e){e.preventDefault();const d=Object.fromEntries(new FormData(els.addForm).entries());const syns=String(d.synonyms||'').split(',').map(s=>s.trim()).filter(Boolean).slice(0,3);while(syns.length<3)syns.push(syns.length?'related verb':'verb meaning');const isVerb=d.category==='verb';const c={id:'custom-'+Date.now(),source:'user',list:'My cards',unit:d.unit||'My list',part:'',category:d.category||'other',german:d.german,english:d.english,dari:d.dari,article:d.article||'',singular:d.german,plural:d.plural||'',forms:{infinitive:d.infinitive||'',present3:'',past:d.past||'',perfect:d.perfect||'',plusquamperfekt:d.plusquamperfekt||''},synonyms:isVerb?syns:[],synonyms_en:isVerb?syns:[],synonyms_de:isVerb?syns:[],synonyms_fa:isVerb?syns:[],example:''};extra.push(c);localStorage.setItem(STORE,JSON.stringify(extra));cards=[...initialData,...extra];setup();apply();scheduleAutoVoiceInit();els.addForm.reset()}
function exportBackup(){const blob=new Blob([JSON.stringify(extra,null,2)],{type:'application/json'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='my-flashcard-backup.json';a.click();URL.revokeObjectURL(u)}function importBackup(file){const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!Array.isArray(x))throw Error('Backup must be an array.');extra=x;localStorage.setItem(STORE,JSON.stringify(extra));cards=[...initialData,...extra];setup();apply();scheduleAutoVoiceInit();alert('Backup imported.')}catch(e){alert(e.message)}};r.readAsText(file)}
['list','unit','part','type','front'].forEach(k=>els[k]?.addEventListener('change',()=>{if(k==='list')updateUnits();if(k==='unit')updateParts();apply()}));els.search.addEventListener('input',apply);els.next.addEventListener('click',next);els.prev.addEventListener('click',prev);els.flip.addEventListener('click',flip);els.card.addEventListener('click',()=>{if(!playing)flip()});els.speakFront.addEventListener('click',speakFront);els.playList.addEventListener('click',playSelected);els.pauseList.addEventListener('click',pauseResume);els.stopList.addEventListener('click',()=>stop());els.addForm.addEventListener('submit',addCard);els.exportBtn.addEventListener('click',exportBackup);els.importJson.addEventListener('change',e=>e.target.files[0]&&importBackup(e.target.files[0]));els.unlockSpeech.addEventListener('click',unlockSpeech);els.testDe.addEventListener('click',()=>say('die Abteilung. die Abteilungen.','de'));els.testEn.addEventListener('click',()=>say('department or division','en'));els.testFa.addEventListener('click',()=>say('دیپارتمنت، بخش','fa'));document.querySelectorAll('[data-say]').forEach(b=>b.addEventListener('click',()=>{const c=filtered[idx];if(!c)return;if(b.dataset.say==='de')say(displayGerman(c),'de');if(b.dataset.say==='en')say(displayEnglish(c),'en');if(b.dataset.say==='fa')say(displayDari(c),'fa')}));if(els.voiceSelectDe)els.voiceSelectDe.addEventListener('change',()=>saveVoiceChoice('de'));
if(els.voiceSelectEn)els.voiceSelectEn.addEventListener('change',()=>saveVoiceChoice('en'));
if(els.voiceSelectFa)els.voiceSelectFa.addEventListener('change',()=>saveVoiceChoice('fa'));
if(els.scanDariVoices)els.scanDariVoices.addEventListener('click',runDariVoiceSearch);
if(els.nextDariCandidate)els.nextDariCandidate.addEventListener('click',nextDariCandidate);
document.addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea'))return;if(e.code==='Space'){e.preventDefault();if(!playing)flip()}if(e.code==='ArrowRight')next();if(e.code==='ArrowLeft')prev()});if('speechSynthesis'in window)speechSynthesis.onvoiceschanged=()=>voices();setup();apply();
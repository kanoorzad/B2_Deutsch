// v67: full user-provided script applied; Persian/Persian/Farsi debug helper included.
// v67: remove old service workers/caches once so old broken versions cannot control audio.
(function(){try{const key='v96AudioResetDone';if(!sessionStorage.getItem(key)){sessionStorage.setItem(key,'1');Promise.all([('serviceWorker'in navigator)?navigator.serviceWorker.getRegistrations().then(rs=>Promise.all(rs.map(r=>r.unregister()))):Promise.resolve(),('caches'in window)?caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))):Promise.resolve()]).then(()=>{if(!location.search.includes('fresh96=')){const sep=location.search?'&':'?';location.replace(location.pathname+location.search+sep+'fresh96='+Date.now())}}).catch(()=>{});}}catch(e){}})();
const initialData = window.FLASHCARD_DATA.cards;
const STORE='b2-native-cards-extra-v96';
let extra=JSON.parse(localStorage.getItem(STORE)||'[]');
let cards=[...initialData,...extra];
let filtered=[]; let idx=0; let flipped=false; let lastFront=null; let playing=false; let paused=false; let playQueue=[]; let playIndex=0;
let dariSpriteAudio=null;
let dariSpriteUnlocked=false;
let dariStopTimer=null;

const $=id=>document.getElementById(id);
const els={
  list:$('listFilter'),unit:$('unitFilter'),part:$('partFilter'),type:$('typeFilter'),search:$('search'),front:$('front'),targetLang:$('targetLang'),
  prev:$('prev'),next:$('next'),flip:$('flip'),speakFront:$('speakFront'),card:$('card'),cardBottom:$('cardBottom'),answer:$('answer'),
  frontText:$('frontText'),frontHint:$('frontHint'),frontSub:$('frontSub'),frontSyn:$('frontSynonyms'),chipLabel:$('chipLabel'),
  targetTitle:$('targetTitle'),de:$('de'),dePluralLine:$('dePluralLine'),en:$('en'),fa:$('fa'),nounBox:$('nounBox'),article:$('article'),singular:$('singular'),plural:$('plural'),
  verbBox:$('verbBox'),inf:$('inf'),pres3:$('pres3'),past:$('past'),perf:$('perf'),plus:$('plus'),syn:$('syn'),synBox:$('synBox'),ex:$('ex'),multiSynBox:$('multiSynBox'),multiSynContent:$('multiSynContent'),
  count:$('count'),bar:$('bar'),playDe:$('playDe'),playEn:$('playEn'),playFa:$('playFa'),playForms:$('playForms'),repeat:$('repeat'),
  playList:$('playList'),pauseList:$('pauseList'),stopList:$('stopList'),now:$('nowPlaying'),speechWarning:$('speechWarning'),
  addForm:$('addForm'),importJson:$('importJson'),deviceInfo:$('deviceInfo'),voiceDe:$('voiceDe'),voiceEn:$('voiceEn'),voiceFa:$('voiceFa'),
  testDe:$('testDe'),testEn:$('testEn'),testFa:$('testFa'),unlockSpeech:$('unlockSpeech'),voiceSelectDe:$('voiceSelectDe'),voiceSelectEn:$('voiceSelectEn'),voiceSelectFa:$('voiceSelectFa'),scanDariVoices:$('scanDariVoices'),nextDariCandidate:$('nextDariCandidate'),dariCandidate:$('dariCandidate'),onlineStatus:$('onlineStatus')
};
window.els=els;


const TARGET_LANGS={
  en:{label:'Englisch',voice:'en-US',dir:'ltr',missing:'Englische Übersetzung fehlt.'},
  fa:{label:'Farsi',voice:'fa-IR',dir:'rtl',missing:'Farsi-Übersetzung fehlt.'},
  es:{label:'Spanisch',voice:'es-ES',dir:'ltr',missing:'Spanische Übersetzung fehlt.'},
  ru:{label:'Russisch',voice:'ru-RU',dir:'ltr',missing:'Russische Übersetzung fehlt.'},
  uk:{label:'Ukrainisch',voice:'uk-UA',dir:'ltr',missing:'Ukrainische Übersetzung fehlt.'},
  tr:{label:'Türkisch',voice:'tr-TR',dir:'ltr',missing:'Türkische Übersetzung fehlt.'}
};
const VOICE_PROFILES={
  de:{code:'de-DE',fallback:['de-DE','de-AT','de-CH','de'],premium:/anna|siri|apple|google|microsoft|natural|premium|enhanced|neural|online/i,reject:/compact|novelty|whisper|trinoids|zarvox|bells|boing|bad news|bahh|cellos|deranged|hysterical|pipe organ|princess|rishi/i,rate:.78},
  en:{code:'en-US',fallback:['en-US','en-GB','en-AU','en-CA','en'],premium:/samantha|daniel|alex|siri|apple|google|microsoft|natural|premium|enhanced|neural|online/i,reject:/compact|novelty|whisper|trinoids|zarvox|bells|boing|bad news|bahh|cellos|deranged|hysterical|pipe organ|princess|rishi/i,rate:.92},
  fa:{code:'fa-IR',fallback:['fa-IR','fa-AF','fa'],premium:/persian|farsi|فارسی|دری|siri|apple|google|microsoft|natural|premium|enhanced|neural|online/i,reject:/daria|bulgarian|bg-bg|compact|novelty|whisper|trinoids|zarvox|bells|boing|bad news|bahh|cellos|deranged|hysterical|pipe organ|princess|rishi/i,rate:.86},
  es:{code:'es-ES',fallback:['es-ES','es-MX','es-US','es-419','es'],premium:/monica|paulina|jorge|siri|apple|google|microsoft|natural|premium|enhanced|neural|online/i,reject:/compact|novelty|whisper|trinoids|zarvox|bells|boing|bad news|bahh|cellos|deranged|hysterical|pipe organ|princess|rishi/i,rate:.92},
  ru:{code:'ru-RU',fallback:['ru-RU','ru'],premium:/milena|yuri|russian|рус|siri|apple|google|microsoft|natural|premium|enhanced|neural|online/i,reject:/compact|novelty|whisper|trinoids|zarvox|bells|boing|bad news|bahh|cellos|deranged|hysterical|pipe organ|princess|rishi/i,rate:.86},
  uk:{code:'uk-UA',fallback:['uk-UA','uk'],premium:/ukrainian|україн|украин|siri|apple|google|microsoft|natural|premium|enhanced|neural|online/i,reject:/compact|novelty|whisper|trinoids|zarvox|bells|boing|bad news|bahh|cellos|deranged|hysterical|pipe organ|princess|rishi/i,rate:.86},
  tr:{code:'tr-TR',fallback:['tr-TR','tr'],premium:/turkish|türk|yelda|cem|siri|apple|google|microsoft|natural|premium|enhanced|neural|online/i,reject:/compact|novelty|whisper|trinoids|zarvox|bells|boing|bad news|bahh|cellos|deranged|hysterical|pipe organ|princess|rishi/i,rate:.90}
};
function voiceCodeFor(lang){return (VOICE_PROFILES[lang]||VOICE_PROFILES.de).code}
function voices(){try{return speechSynthesis.getVoices()||[]}catch(e){return[]}}
function voiceScore(v,lang){
  const p=VOICE_PROFILES[lang]||VOICE_PROFILES.de;
  const name=((v.name||'')+' '+(v.voiceURI||''));
  const vl=(v.lang||'').toLowerCase();
  let score=0;
  if(p.reject&&p.reject.test(name))score-=1000;
  if(p.premium&&p.premium.test(name))score+=100;
  if(v.localService===false)score+=16;
  if(v.default)score+=8;
  p.fallback.forEach((code,i)=>{
    const lc=code.toLowerCase(), base=lc.split('-')[0];
    if(vl===lc)score+=90-i*7;
    else if(vl.startsWith(base))score+=45-i*4;
  });
  if(/google/i.test(name))score+=20;
  if(/microsoft/i.test(name))score+=18;
  if(/apple|siri|enhanced|premium|neural|natural/i.test(name))score+=22;
  if(/compact/i.test(name))score-=50;
  return score;
}
function pickVoice(lang){
  if(!('speechSynthesis' in window))return null;
  const p=VOICE_PROFILES[lang]||VOICE_PROFILES.de;
  const vs=voices();
  if(!vs.length)return null;
  const pool=vs.filter(v=>{
    const vl=(v.lang||'').toLowerCase();
    const name=((v.name||'')+' '+(v.voiceURI||''));
    if(p.reject&&p.reject.test(name))return false;
    return p.fallback.some(code=>vl===code.toLowerCase()||vl.startsWith(code.split('-')[0].toLowerCase())) || (p.premium&&p.premium.test(name));
  });
  const chosen=(pool.length?pool:vs).slice().sort((a,b)=>voiceScore(b,lang)-voiceScore(a,lang))[0]||null;
  return chosen;
}
function warmVoices(){
  if(!('speechSynthesis' in window))return;
  try{
    speechSynthesis.getVoices();
    setTimeout(()=>{speechSynthesis.getVoices();updateVoiceStatus&&updateVoiceStatus()},250);
    setTimeout(()=>{speechSynthesis.getVoices();updateVoiceStatus&&updateVoiceStatus()},900);
  }catch(e){}
}
function say(text,lang='de',done=()=>{}){
  if(!text){done();return}
  if(!('speechSynthesis' in window)){done();return}
  const p=VOICE_PROFILES[lang]||VOICE_PROFILES.de;
  try{speechSynthesis.cancel()}catch(e){}
  const makeUtter=(withVoice=true)=>{
    const u=new SpeechSynthesisUtterance(String(text));
    u.lang=p.code;
    const v=withVoice?pickVoice(lang):null;
    if(v){u.voice=v;u.lang=v.lang||p.code}
    u.rate=p.rate;u.pitch=1;u.volume=1;
    return u;
  };
  let finished=false;
  const finish=()=>{if(!finished){finished=true;done()}};
  const u=makeUtter(true);
  u.onend=finish;
  u.onerror=()=>{
    try{
      const r=makeUtter(false);
      r.onend=finish;r.onerror=finish;
      speechSynthesis.cancel();
      setTimeout(()=>speechSynthesis.speak(r),80);
    }catch(e){finish()}
  };
  try{
    speechSynthesis.resume&&speechSynthesis.resume();
    setTimeout(()=>speechSynthesis.speak(u),40);
  }catch(e){finish()}
}
function updateVoiceStatus(){
  const el=$('voiceStatus');
  if(!el)return;
  const vs=voices();
  if(!vs.length){el.textContent='Stimmen werden geladen …';return}
  el.textContent=['de','en','fa','es','ru','uk','tr'].map(lang=>{
    const v=pickVoice(lang);
    const label=lang==='de'?'Deutsch':(TARGET_LANGS[lang]?.label||lang);
    return `${label}: ${v?`${v.name} (${v.lang})`:`System ${voiceCodeFor(lang)}`}`;
  }).join(' · ');
}



function translationOf(c,lang=targetLang()){
  const t=(c.translations&&c.translations[lang]) || (lang==='en'?c.english:'') || (lang==='fa'?c.dari:'') || '';
  return String(t||'').trim();
}
function displayTranslation(c,lang=targetLang()){
  const t=translationOf(c,lang);
  return t || targetMeta(lang).missing;
}
function isTranslationMissing(c,lang=targetLang()){return !translationOf(c,lang)}


function unique(a){return [...new Set(a.filter(Boolean))].sort((x,y)=>x.localeCompare(y,undefined,{numeric:true}))}
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function norm(s){return String(s||'').toLowerCase().trim()}
function textOf(c){return [c.list,c.unit,c.part,c.category,c.german,c.english,c.dari,c.article,c.singular,c.plural,c.example,...Object.values(c.forms||{}),...(c.synonyms_en||[]),...(c.synonyms_de||[]),...(c.synonyms_fa||[]),...Object.values(c.translations||{})].join(' ').toLowerCase()}
function displayGerman(c){return [c.article,c.singular||c.german].filter(Boolean).join(' ')||c.german||'—'}
function cleanEnglish(t){return String(t||'').replace(/\s*\/\s*/g,' or ').replace(/\s+/g,' ').trim()}
function displayEnglish(c){return cleanEnglish(c.english||'—')}
function displayDari(c){return c.dari||'—'}
function displayTarget(c,lang=targetLang()){return displayTranslation(c,lang)}
function setDirForLang(lang){if(lang==='fa')els.frontText.setAttribute('dir','rtl'); else els.frontText.removeAttribute('dir')}
function showWarning(msg){els.speechWarning.textContent=msg; els.speechWarning.classList.remove('hidden')}
function clearWarning(){els.speechWarning.textContent=''; els.speechWarning.classList.add('hidden')}
function chipsFor(c,lang){ if(c.category!=='verb') return []; if(lang==='de')return(c.synonyms_de||[]).slice(0,3); if(lang==='fa')return(c.synonyms_fa||[]).slice(0,3); return(c.synonyms_en||[]).slice(0,3).map(cleanEnglish); }
function chipLabel(lang){ if(lang==='de')return 'Deutsche Verb-Synonyme'; if(lang==='fa')return 'Farsi-Verb-Synonyme'; return 'Verb-Synonyme'; }
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
function formStep(c){
  const f=c.forms||{};
  if(c.category==='noun'&&c.plural)return{display:c.plural,speech:c.plural,lang:'de',label:'Deutscher Plural',sub:'Langsam'};
  if(c.category==='verb'){
    const visible=[],spoken=[];
    for(const k of ['infinitive','past','perfect','plusquamperfekt'])if(f[k]){visible.push(f[k]);spoken.push(f[k]);}
    if(visible.length)return{display:visible.join(' · '),speech:spoken.join('. '),lang:'de',label:'Deutsche Formen',sub:'Langsam'};
  }
  return null;
}


function setup(){
  els.list.innerHTML='<option value="all">Alle Karten</option><option value="A1">A1</option><option value="A1 Irregular Verbs">A1 Irregular Verbs</option><option value="A2">A2</option><option value="A2 Irregular Verbs">A2 Irregular Verbs</option><option value="B1">B1</option><option value="B1 Irregular Verbs">B1 Irregular Verbs</option><option value="B1 Plus 7 Units">B1+</option><option value="B2 all 12 units">B2</option><option value="B2 Irregular Verbs">B2 Irregular Verbs</option>';
  updateUnits();
  detectDevice();
  updateVoiceStatus();
}
function updateUnits(){
  const l=els.list.value,pool=l==='all'?cards:cards.filter(c=>c.list===l);
  els.unit.innerHTML='<option value="all">Alle Einheiten</option>'+unique(pool.map(c=>c.unit)).map(x=>`<option>${esc(x)}</option>`).join('');
  updateParts();
}
function updateParts(){
  const l=els.list.value,u=els.unit.value,pool=cards.filter(c=>(l==='all'||c.list===l)&&(u==='all'||c.unit===u));
  els.part.innerHTML='<option value="all">Alle Teile</option>'+unique(pool.map(c=>c.part)).map(x=>`<option>${esc(x)}</option>`).join('');
}
function apply(){const l=els.list.value,u=els.unit.value,p=els.part.value,t=els.type.value,q=norm(els.search.value);filtered=cards.filter(c=>(l==='all'||c.list===l)&&(u==='all'||c.unit===u)&&(p==='all'||c.part===p)&&(t==='all'||c.category===t)&&(!q||textOf(c).includes(q)));idx=Math.min(idx,Math.max(filtered.length-1,0));flipped=false;render();}
function getManualFront(c){
  let m=els.front.value;
  if(m==='random')m=['german','translation','plural'][Math.floor(Math.random()*3)];
  if(m==='english'||m==='dari'||m==='persian'||m==='translation'){
    const lang=targetLang();
    const meta=targetMeta(lang);
    const display=displayTarget(c,lang);
    return{display,speech:isTranslationMissing(c,lang)?'':display,label:meta.label,sub:isTranslationMissing(c,lang)?'Fehlt':'Mittel',lang};
  }
  if(m==='plural'){
    const fs=formStep(c);
    return fs||{display:'Keine Plural-/Formangabe',speech:'',label:'Plural / Formen',sub:'',lang:'de'}
  }
  return{display:displayGerman(c),speech:displayGerman(c),label:'Deutsch',sub:'Langsam',lang:'de'}
}

function escHtml(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function renderMultiSynonyms(c){
  const box=els.multiSynBox, cont=els.multiSynContent;
  if(!box||!cont)return;
  const lang=targetLang();
  const multi=c.synonyms_multi||{};
  const de=(multi.de||[]).filter(Boolean);
  const target=(multi[lang]||[]).filter(Boolean);
  if(!de.length && !target.length){box.classList.add('hidden');cont.innerHTML='';return}
  const meta=targetMeta(lang);
  const rows=[];
  if(de.length)rows.push(`<div class="synCol"><strong>Deutsch</strong><p>${de.map(escHtml).join(' · ')}</p></div>`);
  if(target.length)rows.push(`<div class="synCol"><strong>${escHtml(meta.label)}</strong><p dir="${meta.dir||'ltr'}">${target.map(escHtml).join(' · ')}</p></div>`);
  cont.innerHTML=rows.join('');
  box.classList.remove('hidden');
}




function targetLang(){
  const val=($('targetLang')&&$('targetLang').value)||localStorage.getItem('targetLang')||'en';
  return TARGET_LANGS[val]?val:'en';
}
function targetMeta(lang=targetLang()){return TARGET_LANGS[lang]||TARGET_LANGS.en}
function targetText(c,lang=targetLang()){
  const tr=c.translations||{};
  return tr[lang]||targetMeta(lang).missing||'—';
}
function renderDetails(c){
  if(!c)return;
  const lang=targetLang();
  const meta=targetMeta(lang);
  const forms=c.forms||{};
  if(els.front)els.front.textContent=displayGerman(c);
  if(els.gender)els.gender.textContent=c.article||'';
  if(els.plural)els.plural.textContent=c.plural||'';
  if(els.forms){
    const parts=[];
    if(forms.infinitive)parts.push(`Infinitiv: ${forms.infinitive}`);
    if(forms.present3)parts.push(`Präsens: ${forms.present3}`);
    if(forms.past)parts.push(`Präteritum: ${forms.past}`);
    if(forms.perfect)parts.push(`Perfekt: ${forms.perfect}`);
    if(forms.plusquamperfekt)parts.push(`Plusquamperfekt: ${forms.plusquamperfekt}`);
    els.forms.textContent=parts.length?parts.join(' · '):'—';
  }
  const targetTitle=$('targetTitle');
  if(targetTitle)targetTitle.textContent=meta.label;
  if(els.en)els.en.textContent=targetText(c,lang);
  if(els.en)els.en.dir=meta.dir||'ltr';
  if(els.fa)els.fa.textContent=(c.translations&&c.translations.fa)||c.dari||'';
  if(els.fa)els.fa.dir='rtl';
  if(els.ex)els.ex.textContent=c.example||'—';
  renderMultiSynonyms&&renderMultiSynonyms(c);
}
function renderProgress(){els.count.textContent=filtered.length?`${idx+1} / ${filtered.length}`:'0 / 0';els.bar.style.width=filtered.length?`${((idx+1)/filtered.length)*100}%`:'0'}
function render(){const c=filtered[idx];if(!c){els.frontText.textContent='Keine Karten';els.frontHint.textContent='Filter ändern.';els.frontSub.textContent='';els.cardBottom.classList.add('hidden');renderProgress();return}const f=getManualFront(c);lastFront=f;renderDetails(c,f.lang);setDirForLang(f.lang);els.frontText.textContent=f.display||'—';els.frontHint.textContent=f.label;els.frontSub.textContent=f.sub||'';els.answer.classList.toggle('hidden',!flipped);els.card.classList.toggle('playing',playing);renderProgress();}
function next(){if(!filtered.length)return;idx=(idx+1)%filtered.length;flipped=false;render()}function prev(){if(!filtered.length)return;idx=(idx-1+filtered.length)%filtered.length;flipped=false;render()}function flip(){flipped=!flipped;render()}


// v67 audio engine: native best-quality voices for German/English; Persian/Farsi Auto = native Farsi/Persian voice if it truly works, otherwise local high-quality sprite fallback.
// v67 browser voice engine with brute-force Persian/Farsi mobile candidates.
// Keeps v67-v67 browser SpeechSynthesis, but tries all practical BCP-47 tags and voice-name forms.
// No local sprite/WebAudio/remote TTS.
// v67 Persian/Farsi voice restored to version-4 style.
// Keep direct browser SpeechSynthesis. No online TTS, no audio sprites, no provider router.
// The key v67-style behavior is direct utterance creation and direct speechSynthesis.speak().
// v67: FULL version-4 voice engine restored for all languages.
// This is the original v67 pattern:
// voices() -> pickVoice(lang) -> say(text, lang, done)
// Direct SpeechSynthesisUtterance only. No online TTS. No router. No local audio sprite.
let activeUtterance=null;
let screenWakeLock=null;
let wakeLockWanted=false;

async function requestScreenWakeLock(){
  wakeLockWanted=true;
  if(!('wakeLock' in navigator))return false;
  try{
    if(screenWakeLock && !screenWakeLock.released)return true;
    screenWakeLock=await navigator.wakeLock.request('screen');
    screenWakeLock.addEventListener('release',()=>{
      screenWakeLock=null;
      if(wakeLockWanted && document.visibilityState==='visible'){
        setTimeout(()=>requestScreenWakeLock(),250);
      }
    });
    return true;
  }catch(e){
    screenWakeLock=null;
    return false;
  }
}

async function releaseScreenWakeLock(){
  wakeLockWanted=false;
  if(screenWakeLock){
    try{await screenWakeLock.release()}catch(e){}
    screenWakeLock=null;
  }
}

document.addEventListener('visibilitychange',()=>{
  if(document.visibilityState==='visible' && wakeLockWanted){
    requestScreenWakeLock();
  }
});



// ----------------------------------------------
// UPDATED pickVoice with name-based search for Persian/Farsi
// ----------------------------------------------


// ----------------------------------------------
// UPDATED say() – for Persian/Farsi, do NOT set u.voice
// ----------------------------------------------
function debugVoices() {
  const vs = speechSynthesis.getVoices();
  const selected = targetLang();
  const prefix = voiceCodeFor(selected).slice(0,2);
  const relevant = vs.filter(v => String(v.lang||'').toLowerCase().startsWith(prefix) || /persian|farsi|فارسی/i.test(v.name||''));
  console.log('Alle Stimmen:', vs.map(v => v.name + ' (' + v.lang + ')'));
  console.log('Stimmen für Zielsprache:', relevant.map(v => v.name + ' (' + v.lang + ')'));
  return relevant;
}

function initStartWizard(){
  const wizard=$('startWizard');
  const optionsToggle=$('optionsToggle');
  const setStep=(id)=>{
    ['wizardLang','wizardMaterial','wizardUnit'].forEach(x=>{
      const el=$(x);
      if(el){
        el.classList.toggle('active',x===id);
        el.style.display=(x===id?'block':'none');
      }
    });
  };
  window.showWizardStep=setStep;
  document.body.classList.add('wizardMode');
  document.body.classList.remove('appReady');
  if(wizard)wizard.hidden=false;
  if(optionsToggle)optionsToggle.hidden=true;
  setStep('wizardLang');
}

function populateWizardUnits(){
  const sel=$('wizardUnitSelect');
  if(!sel)return;
  const list=(els.list&&els.list.value)||'all';
  const pool=CARDS.filter(c=>list==='all'||c.list===list);
  const units=[...new Set(pool.map(c=>c.unit).filter(Boolean))];
  sel.innerHTML='<option value="all">Alle Einheiten</option>'+units.map(u=>`<option value="${u}">${u}</option>`).join('');
  sel.value='all';
  const note=$('wizardUnitNote');
  if(note)note.textContent=pool.length?`${pool.length} Karten verfügbar.`:'Noch keine Karten für dieses Material. Bitte anderes Material wählen.';
}

function cardScript(c){
  const lang=targetLang();
  const bits=[];
  bits.push({text:displayGerman(c),lang:'de',label:'Deutsch'});
  const forms=c.forms||{};
  const formBits=[];
  if(forms.infinitive)formBits.push(forms.infinitive);
  if(forms.present3)formBits.push(forms.present3);
  if(forms.past)formBits.push(forms.past);
  if(forms.perfect)formBits.push(forms.perfect);
  if(formBits.length)bits.push({text:formBits.join('. '),lang:'de',label:'Formen'});
  bits.push({text:targetText(c,lang),lang:lang,label:targetMeta(lang).label});
  return bits.filter(x=>x.text&&x.text!=='—');
}

function speakPart(kind){
  const c=current();
  if(!c)return;
  if(kind==='target')return say(targetText(c,targetLang()),targetLang());
  if(kind==='de')return say(displayGerman(c),'de');
  if(kind==='forms'){
    const forms=c.forms||{};
    const txt=[forms.infinitive,forms.present3,forms.past,forms.perfect].filter(Boolean).join('. ');
    return say(txt||displayGerman(c),'de');
  }
  return say(displayGerman(c),'de');
}

document.querySelectorAll('[data-say]').forEach(btn=>btn.addEventListener('click',()=>speakPart(btn.dataset.say)));





function bootApp(){
  try{
    if(typeof warmVoices==='function') warmVoices();
    if(typeof setup==='function') setup();
    if(typeof apply==='function') apply();
    if(typeof initStartWizard==='function') initStartWizard();
    if('speechSynthesis' in window){
      speechSynthesis.onvoiceschanged=()=>{ if(typeof warmVoices==='function') warmVoices(); if(typeof updateVoiceStatus==='function') updateVoiceStatus(); };
    }
  }catch(err){
    console.error('Boot error:',err);
    const wizard=document.getElementById('startWizard');
    if(wizard)wizard.hidden=false;
  }
}
if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',bootApp,{once:true});
}else{
  bootApp();
}


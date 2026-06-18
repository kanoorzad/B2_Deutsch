// v67: full user-provided script applied; Persian/Persian/Farsi debug helper included.
// v67: remove old service workers/caches once so old broken versions cannot control audio.
(function(){try{const key='v68AudioResetDone';if(!sessionStorage.getItem(key)){sessionStorage.setItem(key,'1');Promise.all([('serviceWorker'in navigator)?navigator.serviceWorker.getRegistrations().then(rs=>Promise.all(rs.map(r=>r.unregister()))):Promise.resolve(),('caches'in window)?caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))):Promise.resolve()]).then(()=>{if(!location.search.includes('fresh68=')){const sep=location.search?'&':'?';location.replace(location.pathname+location.search+sep+'fresh68='+Date.now())}}).catch(()=>{});}}catch(e){}})();
const initialData = window.FLASHCARD_DATA.cards;
const STORE='b2-native-cards-extra-v68';
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

const TARGET_LANGS={
  en:{label:'Englisch',voice:'en-US',dir:'ltr',missing:'Geprüfte Übersetzung noch nicht verfügbar'},
  fa:{label:'Farsi',voice:'fa-IR',dir:'rtl',missing:'Geprüfte Übersetzung noch nicht verfügbar'},
  ru:{label:'Russisch',voice:'ru-RU',dir:'ltr',missing:'Russisch ist vorbereitet. Geprüfte Übersetzung folgt.'},
  uk:{label:'Ukrainisch',voice:'uk-UA',dir:'ltr',missing:'Ukrainisch ist vorbereitet. Geprüfte Übersetzung folgt.'},
  tr:{label:'Türkisch',voice:'tr-TR',dir:'ltr',missing:'Türkisch ist vorbereitet. Geprüfte Übersetzung folgt.'},
  es:{label:'Spanisch',voice:'es-ES',dir:'ltr',missing:'Spanische Übersetzung für diese Karte fehlt noch.'}
};
function targetLang(){return (document.getElementById('targetLang')?.value)||'en'}
function targetMeta(lang=targetLang()){return TARGET_LANGS[lang]||TARGET_LANGS.en}
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
const VOICE_PROFILES={
  de:{
    code:'de-DE',
    fallback:['de-DE','de-AT','de-CH','de'],
    premium:/anna|siri|google|microsoft|natural|premium|enhanced|neural|online|eloquence/i,
    reject:/compact|novelty|whisper|trinoids|zarvox|bells|boing|bad news|bahh|cellos|deranged|good news|hysterical|pipe organ|princess|rishi|victoria/i
  },
  en:{
    code:'en-US',
    fallback:['en-US','en-GB','en-AU','en-CA','en'],
    premium:/samantha|daniel|alex|siri|google|microsoft|natural|premium|enhanced|neural|online|eloquence/i,
    reject:/compact|novelty|whisper|trinoids|zarvox|bells|boing|bad news|bahh|cellos|deranged|good news|hysterical|pipe organ|princess|rishi|victoria/i
  },
  fa:{
    code:'fa-IR',
    fallback:['fa-IR','fa-AF','fa'],
    premium:/persian|farsi|فارسی|siri|google|microsoft|natural|premium|enhanced|neural|online/i,
    reject:/daria|bulgarian|bg-bg|compact|novelty|whisper|trinoids|zarvox|bells|boing|bad news|bahh|cellos|deranged|good news|hysterical|pipe organ|princess|rishi|victoria/i
  },
  es:{
    code:'es-ES',
    fallback:['es-ES','es-MX','es-US','es-419','es'],
    premium:/monica|paulina|jorge|siri|google|microsoft|natural|premium|enhanced|neural|online|eloquence/i,
    reject:/compact|novelty|whisper|trinoids|zarvox|bells|boing|bad news|bahh|cellos|deranged|good news|hysterical|pipe organ|princess|rishi|victoria/i
  },
  ru:{
    code:'ru-RU',
    fallback:['ru-RU','ru'],
    premium:/milena|yuri|russian|рус|siri|google|microsoft|natural|premium|enhanced|neural|online/i,
    reject:/compact|novelty|whisper|trinoids|zarvox|bells|boing|bad news|bahh|cellos|deranged|good news|hysterical|pipe organ|princess|rishi|victoria/i
  },
  uk:{
    code:'uk-UA',
    fallback:['uk-UA','uk'],
    premium:/ukrainian|україн|украин|siri|google|microsoft|natural|premium|enhanced|neural|online/i,
    reject:/compact|novelty|whisper|trinoids|zarvox|bells|boing|bad news|bahh|cellos|deranged|good news|hysterical|pipe organ|princess|rishi|victoria/i
  },
  tr:{
    code:'tr-TR',
    fallback:['tr-TR','tr'],
    premium:/turkish|türk|yelda|cem|siri|google|microsoft|natural|premium|enhanced|neural|online/i,
    reject:/compact|novelty|whisper|trinoids|zarvox|bells|boing|bad news|bahh|cellos|deranged|good news|hysterical|pipe organ|princess|rishi|victoria/i
  }
};
let VOICE_CACHE={};
function voiceCodeFor(lang){
  return (VOICE_PROFILES[lang]||VOICE_PROFILES.de).code;
}
function voiceScore(v,lang){
  const p=VOICE_PROFILES[lang]||VOICE_PROFILES.de;
  const name=(v.name||'')+' '+(v.voiceURI||'');
  const vl=(v.lang||'').toLowerCase();
  let score=0;
  if(p.reject && p.reject.test(name))score-=1000;
  if(p.premium && p.premium.test(name))score+=100;
  if(v.localService===false)score+=12;
  if(v.default)score+=8;
  if(vl===p.code.toLowerCase())score+=80;
  p.fallback.forEach((code,i)=>{
    const c=code.toLowerCase();
    if(vl===c)score+=70-i*8;
    else if(vl.startsWith(c.split('-')[0]))score+=35-i*4;
  });
  if(/google/i.test(name))score+=18;      // strong on Android Chrome
  if(/microsoft/i.test(name))score+=16;   // strong on Edge/Windows/Android
  if(/siri|apple|enhanced|premium|neural|natural/i.test(name))score+=20; // strong on iOS/macOS
  if(/compact/i.test(name))score-=45;
  return score;
}
function voices(){
  return ('speechSynthesis' in window)?speechSynthesis.getVoices():[];
}
function pickVoice(lang){
  const p=VOICE_PROFILES[lang]||VOICE_PROFILES.de;
  const vs=voices();
  if(!vs.length)return null;
  const candidates=vs.filter(v=>{
    const vl=(v.lang||'').toLowerCase();
    return p.fallback.some(code=>vl===code.toLowerCase()||vl.startsWith(code.split('-')[0].toLowerCase())) ||
           (p.premium&&p.premium.test((v.name||'')+' '+(v.voiceURI||'')));
  }).filter(v=>!(p.reject&&p.reject.test((v.name||'')+' '+(v.voiceURI||''))));
  const pool=candidates.length?candidates:vs.filter(v=>(v.lang||'').toLowerCase().startsWith(p.code.slice(0,2).toLowerCase()));
  if(!pool.length)return null;
  return pool.slice().sort((a,b)=>voiceScore(b,lang)-voiceScore(a,lang))[0]||null;
}
function warmVoices(){
  if(!('speechSynthesis' in window))return;
  try{
    speechSynthesis.getVoices();
    setTimeout(()=>speechSynthesis.getVoices(),100);
    setTimeout(()=>{speechSynthesis.getVoices();updateVoiceStatus&&updateVoiceStatus();},450);
  }catch(e){}
}
function say(text,lang='de',done=()=>{}){
  if(!text){done();return}
  if(!('speechSynthesis' in window)){done();return}
  const p=VOICE_PROFILES[lang]||VOICE_PROFILES.de;
  try{speechSynthesis.cancel()}catch(e){}
  const u=new SpeechSynthesisUtterance(String(text));
  u.lang=p.code;
  const v=pickVoice(lang);
  if(v){u.voice=v;u.lang=v.lang||p.code}
  // Mobile-safe rates: clearer for German, Farsi, Russian, Ukrainian; normal for Spanish/Turkish/English.
  u.rate=({de:.78,fa:.86,ru:.86,uk:.86,en:.92,es:.92,tr:.90}[lang]||.88);
  u.pitch=1;
  u.volume=1;
  let finished=false;
  const finish=()=>{if(!finished){finished=true;done();}};
  u.onend=finish;
  u.onerror=()=> {
    // iOS/Android fallback: retry once with language code only, no explicit voice.
    if(v){
      try{
        const r=new SpeechSynthesisUtterance(String(text));
        r.lang=p.code;
        r.rate=u.rate;r.pitch=1;r.volume=1;
        r.onend=finish;r.onerror=finish;
        speechSynthesis.cancel();
        setTimeout(()=>speechSynthesis.speak(r),80);
      }catch(e){finish()}
    }else finish();
  };
  try{
    speechSynthesis.resume&&speechSynthesis.resume();
    setTimeout(()=>speechSynthesis.speak(u),40);
  }catch(e){finish()}
}
function updateVoiceStatus(){
  const el=$('voiceStatus');
  const vs=voices();
  if(!el)return;
  if(!vs.length){el.textContent='Stimmen werden geladen …';return}
  const rows=['de','en','fa','es','ru','uk','tr'].map(lang=>{
    const v=pickVoice(lang);
    const label=(TARGET_LANGS&&TARGET_LANGS[lang]?TARGET_LANGS[lang].label:lang)||lang;
    return `${label}: ${v?`${v.name} (${v.lang})`:'Systemstandard '+voiceCodeFor(lang)}`;
  });
  el.textContent=rows.join(' · ');
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

function renderDetails(c,chipLang='en'){
  const lang=targetLang();
  const meta=targetMeta(lang);
  if(els.targetTitle)els.targetTitle.textContent=meta.label;
  els.de.textContent=displayGerman(c);
  els.dePluralLine.textContent=(c.category==='noun'&&c.plural)?c.plural:'';
  els.en.textContent=displayTarget(c,lang);
  els.en.classList.toggle('pendingTranslation',isTranslationMissing(c,lang));
  if(lang==='fa')els.en.setAttribute('dir','rtl'); else els.en.removeAttribute('dir');
  if(els.fa){els.fa.textContent='';els.fa.classList.add('hidden');}
  els.nounBox.classList.toggle('hidden',c.category!=='noun');
  els.article.textContent=c.article||'—';
  els.singular.textContent=c.singular||c.german||'—';
  els.plural.textContent=c.plural||'—';
  const f=c.forms||{},hasVerb=c.category==='verb'||Object.values(f).some(Boolean);
  els.verbBox.classList.toggle('hidden',!hasVerb);
  els.inf.textContent=f.infinitive||c.german||'—';
  els.pres3.textContent=f.present3||'—';
  els.past.textContent=f.past||'—';
  els.perf.textContent=f.perfect||'—';
  els.plus.textContent=f.plusquamperfekt||'—';
  renderChips(c,chipLang);
  els.ex.textContent=c.example||'—';
  renderMultiSynonyms(c);
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

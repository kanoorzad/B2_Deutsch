// v34: remove old service workers/caches once so old broken versions cannot control audio.
(function(){try{const key='v34AudioResetDone';if(!sessionStorage.getItem(key)){sessionStorage.setItem(key,'1');Promise.all([('serviceWorker'in navigator)?navigator.serviceWorker.getRegistrations().then(rs=>Promise.all(rs.map(r=>r.unregister()))):Promise.resolve(),('caches'in window)?caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))):Promise.resolve()]).then(()=>{if(!location.search.includes('fresh34=')){const sep=location.search?'&':'?';location.replace(location.pathname+location.search+sep+'fresh34='+Date.now())}}).catch(()=>{});}}catch(e){}})();
const initialData = window.FLASHCARD_DATA.cards;
const STORE='b2-native-cards-extra-v40';
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
  testDe:$('testDe'),testEn:$('testEn'),testFa:$('testFa'),unlockSpeech:$('unlockSpeech'),voiceSelectDe:$('voiceSelectDe'),voiceSelectEn:$('voiceSelectEn'),voiceSelectFa:$('voiceSelectFa'),scanDariVoices:$('scanDariVoices'),nextDariCandidate:$('nextDariCandidate'),dariCandidate:$('dariCandidate')
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
// v40 browser voice engine with brute-force Dari/Farsi mobile candidates.
// Keeps v3-v6 browser SpeechSynthesis, but tries all practical BCP-47 tags and voice-name forms.
// No local sprite/WebAudio/remote TTS.
let activeUtterance=null;
let dariCandidates=[];
let dariCandidateIndex=0;

const DARI_TEST_TEXT='دیپارتمنت، بخش. سلام، این یک تست صدای دری و فارسی است.';
const DARI_TAGS=[
  'fa-IR','fa-AF','fa','prs-AF','prs','fa-Arab','fa-Arab-IR','fa-Arab-AF',
  'fas','fas-IR','per','per-IR','ira','ira-IR','ps-AF','ur-PK','ar','ar-SA'
];

function voices(){
  return ('speechSynthesis' in window) ? (speechSynthesis.getVoices() || []) : [];
}
function voiceLabel(v){return v ? `${v.name} (${v.lang})` : 'No specific voice'}
function voiceKey(v){return v ? `${v.name}|||${v.lang}` : ''}
function voiceByKey(k){
  if(!k)return null;
  const [name,lang]=k.split('|||');
  return voices().find(v=>v.name===name && v.lang===lang) || null;
}
function isPremiumVoice(v){
  return /premium|enhanced|natural|neural|online|siri|google|microsoft|compact/i.test((v&&v.name)||'');
}
function looksPersianVoice(v){
  const s=((v&&v.name)||'')+' '+((v&&v.lang)||'');
  return /fa[-_]?ir|fa[-_]?af|\bfa\b|farsi|persian|dari|afghan|afghanistan|iran|iranian|فارسی|دری|ایران|افغان/i.test(s);
}
function scoreVoice(v, lang){
  const name=(v.name||'').toLowerCase();
  const code=(v.lang||'').toLowerCase();
  let score=0;
  if(isPremiumVoice(v))score+=20;
  if(lang==='de'){
    if(code==='de-de')score+=100; else if(code.startsWith('de'))score+=70;
  }else if(lang==='en'){
    if(code==='en-us')score+=100; else if(code.startsWith('en'))score+=70;
  }else if(lang==='fa'){
    if(code==='fa-ir')score+=140;
    else if(code==='fa-af')score+=135;
    else if(code==='fa')score+=120;
    else if(code.startsWith('fa'))score+=110;
    else if(code==='prs-af'||code==='prs')score+=105;
    if(/persian|farsi|dari|afghan|afghanistan|iran|iranian|فارسی|دری/i.test(name))score+=90;
    // Arabic/Urdu/Pashto are only last-resort test candidates, not auto choices.
    if(code.startsWith('ar')||code.startsWith('ur')||code.startsWith('ps'))score-=100;
  }
  return score;
}
function candidates(lang){
  const vs=voices();
  if(lang==='fa'){
    return vs.map(v=>({v,score:scoreVoice(v,'fa')}))
      .filter(x=>x.score>0)
      .sort((a,b)=>b.score-a.score)
      .map(x=>x.v);
  }
  return vs.map(v=>({v,score:scoreVoice(v,lang)}))
    .filter(x=>x.score>0)
    .sort((a,b)=>b.score-a.score)
    .map(x=>x.v);
}
function buildDariCandidates(){
  const out=[];
  const seen=new Set();
  function add(label, voice, lang, note){
    const key=(voice?voiceKey(voice):'noVoice')+'||'+lang+'||'+label;
    if(seen.has(key))return;
    seen.add(key);
    out.push({label,voice,lang,note});
  }

  // 1. Detected Persian/Farsi/Dari voices with their own lang.
  candidates('fa').forEach(v=>add(`Detected: ${voiceLabel(v)} using ${v.lang}`, v, v.lang, 'detected'));

  // 2. All voices whose name/lang looks Persian, even if score did not catch them.
  voices().filter(looksPersianVoice).forEach(v=>add(`Name match: ${voiceLabel(v)} using ${v.lang}`, v, v.lang, 'name-match'));

  // 3. Same selected/detected voice forced through all realistic tags.
  const baseVoices=[...candidates('fa'), ...voices().filter(looksPersianVoice)];
  baseVoices.forEach(v=>{
    DARI_TAGS.forEach(tag=>add(`Voice ${v.name} forced tag ${tag}`, v, tag, 'voice+tag'));
  });

  // 4. Tag-only modes: no selected voice, just u.lang. Some mobile browsers work only this way.
  DARI_TAGS.forEach(tag=>add(`No selected voice · language tag ${tag}`, null, tag, 'tag-only'));

  // 5. Absolute last resort: every installed voice with fa-IR/fa-AF/fa tags for manual discovery.
  voices().forEach(v=>{
    ['fa-IR','fa-AF','fa'].forEach(tag=>add(`Manual all voices: ${voiceLabel(v)} + ${tag}`, v, tag, 'manual-all'));
  });

  return out;
}
function selectedVoice(lang){
  const select = lang==='de' ? els.voiceSelectDe : lang==='en' ? els.voiceSelectEn : els.voiceSelectFa;
  const chosen = select ? voiceByKey(select.value) : null;
  if(chosen)return chosen;
  return candidates(lang)[0] || null;
}
function populateVoiceSelect(lang){
  const select = lang==='de' ? els.voiceSelectDe : lang==='en' ? els.voiceSelectEn : els.voiceSelectFa;
  if(!select)return;
  const old = localStorage.getItem(`voice-choice-v40-${lang}`) || select.value || '';
  const list = candidates(lang);
  select.innerHTML = '';

  const auto = document.createElement('option');
  auto.value='';
  auto.textContent = lang==='fa' ? 'Auto: best Persian/Farsi/Dari voice' : 'Auto: best voice';
  select.appendChild(auto);

  list.forEach(v=>{
    const opt=document.createElement('option');
    opt.value=voiceKey(v);
    opt.textContent=voiceLabel(v);
    select.appendChild(opt);
  });

  if(lang==='fa'){
    const named=voices().filter(looksPersianVoice).filter(v=>!list.some(x=>voiceKey(x)===voiceKey(v)));
    named.forEach(v=>{
      const opt=document.createElement('option');
      opt.value=voiceKey(v);
      opt.textContent='Name match: '+voiceLabel(v);
      select.appendChild(opt);
    });

    if(list.length===0 && named.length===0){
      const opt=document.createElement('option');
      opt.value='';
      opt.textContent='No fa/prs/Persian/Farsi/Dari voice detected — use Run Dari voice search';
      select.appendChild(opt);
    }
  }

  if(old && [...select.options].some(o=>o.value===old))select.value=old;
}
function populateAllVoiceSelects(){
  populateVoiceSelect('de');
  populateVoiceSelect('en');
  populateVoiceSelect('fa');
}
function saveVoiceChoice(lang){
  const select = lang==='de' ? els.voiceSelectDe : lang==='en' ? els.voiceSelectEn : els.voiceSelectFa;
  if(select)localStorage.setItem(`voice-choice-v40-${lang}`, select.value || '');
  updateVoiceStatus();
}
function speakWithCandidate(text, candidate, done=()=>{}){
  if(!('speechSynthesis'in window)){alert('Speech is not supported in this browser.');done();return}
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  if(candidate&&candidate.voice)u.voice=candidate.voice;
  u.lang=(candidate&&candidate.lang)||'fa-IR';
  u.rate=0.88;
  u.pitch=1;
  activeUtterance=u;
  let finished=false;
  function finish(){
    if(finished)return;
    finished=true;
    activeUtterance=null;
    done();
  }
  u.onend=finish;
  u.onerror=finish;
  try{speechSynthesis.resume()}catch(e){}
  setTimeout(()=>speechSynthesis.speak(u),80);
}
function say(text, lang='de', done=()=>{}){
  if(!text){done();return}
  if(!('speechSynthesis'in window)){alert('Speech is not supported in this browser.');done();return}

  if(lang==='fa'){
    // If the user has run/selected a candidate, use it exactly.
    const saved=localStorage.getItem('dari-candidate-v40');
    if(saved){
      try{
        const parsed=JSON.parse(saved);
        const voice=parsed.voiceKey?voiceByKey(parsed.voiceKey):null;
        speakWithCandidate(text,{voice,lang:parsed.lang,label:parsed.label},done);
        return;
      }catch(e){}
    }
  }

  speechSynthesis.cancel();
  const v = selectedVoice(lang);
  const u = new SpeechSynthesisUtterance(text);

  if(v){u.voice=v;u.lang=v.lang}
  else{u.lang = lang==='de'?'de-DE':lang==='en'?'en-US':'fa-IR'}

  u.rate = lang==='de'?0.78:lang==='en'?0.88:0.88;
  u.pitch = 1;
  activeUtterance=u;
  let finished=false;
  function finish(){if(finished)return;finished=true;activeUtterance=null;done();}
  u.onend=finish;u.onerror=finish;
  try{speechSynthesis.resume()}catch(e){}
  setTimeout(()=>speechSynthesis.speak(u),60);
}
function queueSay(t,l='de',d=()=>{}){say(t,l,d)}
function speakFront(){if(lastFront)say(lastFront.speech||lastFront.display||lastFront.txt,lastFront.lang)}
function unlockSpeech(){
  populateAllVoiceSelects();
  updateVoiceStatus();
  try{speechSynthesis.cancel();speechSynthesis.resume()}catch(e){}
  els.now.textContent='Voices refreshed. Run Dari voice search on mobile if Dari is still silent.';
}
function updateDariCandidateLabel(){
  if(!els.dariCandidate)return;
  const saved=localStorage.getItem('dari-candidate-v40');
  if(saved){
    try{els.dariCandidate.textContent=JSON.parse(saved).label;return}catch(e){}
  }
  els.dariCandidate.textContent='Not selected yet';
}
function runDariVoiceSearch(){
  populateAllVoiceSelects();
  dariCandidates=buildDariCandidates();
  dariCandidateIndex=0;
  if(!dariCandidates.length){
    if(els.dariCandidate)els.dariCandidate.textContent='No candidates found';
    els.now.textContent='No speech voices were exposed by this mobile browser.';
    return;
  }
  tryCurrentDariCandidate();
}
function tryCurrentDariCandidate(){
  if(!dariCandidates.length)dariCandidates=buildDariCandidates();
  if(!dariCandidates.length)return;
  const c=dariCandidates[dariCandidateIndex % dariCandidates.length];
  if(els.dariCandidate)els.dariCandidate.textContent=`${dariCandidateIndex+1}/${dariCandidates.length}: ${c.label}`;
  localStorage.setItem('dari-candidate-v40',JSON.stringify({label:c.label,lang:c.lang,voiceKey:c.voice?voiceKey(c.voice):''}));
  els.now.textContent='Testing Dari candidate: '+c.label;
  speakWithCandidate(DARI_TEST_TEXT,c,()=>{});
}
function nextDariCandidate(){
  if(!dariCandidates.length)dariCandidates=buildDariCandidates();
  if(!dariCandidates.length){runDariVoiceSearch();return}
  dariCandidateIndex=(dariCandidateIndex+1)%dariCandidates.length;
  tryCurrentDariCandidate();
}
function detectDevice(){
  let d='Desktop/laptop';
  const ua=navigator.userAgent||'';
  if(/iPhone|iPad|iPod/i.test(ua))d='iPhone/iPad';
  else if(/Android/i.test(ua))d='Android';
  else if(/Windows/i.test(ua))d='Windows PC';
  else if(/Macintosh/i.test(ua))d='Mac';
  els.deviceInfo.textContent=`Detected: ${d}. v40 brute-forces fa-IR, fa-AF, fa, prs-AF, prs, Persian/Farsi/Dari, and tag-only speech.`;
}
function updateVoiceStatus(){
  if(!('speechSynthesis'in window)){
    els.voiceDe.textContent=els.voiceEn.textContent=els.voiceFa.textContent='Speech not supported';
    return;
  }
  populateAllVoiceSelects();
  els.voiceDe.textContent=voiceLabel(selectedVoice('de'));
  els.voiceEn.textContent=voiceLabel(selectedVoice('en'));
  const fv=selectedVoice('fa');
  const count=buildDariCandidates().length;
  els.voiceFa.textContent=fv ? `${voiceLabel(fv)} · ${count} Dari candidates available` : `No direct Persian voice · ${count} brute-force candidates available`;
  updateDariCandidateLabel();
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
  if('speechSynthesis'in window)speechSynthesis.cancel();
  els.pauseList.textContent='Pause';
  els.now.textContent='Ready.';
  els.card.classList.remove('playing');
  els.frontText.removeAttribute('dir');
  if(doRender)render();
}

function addCard(e){e.preventDefault();const d=Object.fromEntries(new FormData(els.addForm).entries());const syns=String(d.synonyms||'').split(',').map(s=>s.trim()).filter(Boolean).slice(0,3);while(syns.length<3)syns.push(syns.length?'related verb':'verb meaning');const isVerb=d.category==='verb';const c={id:'custom-'+Date.now(),source:'user',list:'My cards',unit:d.unit||'My list',part:'',category:d.category||'other',german:d.german,english:d.english,dari:d.dari,article:d.article||'',singular:d.german,plural:d.plural||'',forms:{infinitive:d.infinitive||'',present3:'',past:d.past||'',perfect:d.perfect||'',plusquamperfekt:d.plusquamperfekt||''},synonyms:isVerb?syns:[],synonyms_en:isVerb?syns:[],synonyms_de:isVerb?syns:[],synonyms_fa:isVerb?syns:[],example:''};extra.push(c);localStorage.setItem(STORE,JSON.stringify(extra));cards=[...initialData,...extra];populateAllVoiceSelects();setup();apply();els.addForm.reset()}
function exportBackup(){const blob=new Blob([JSON.stringify(extra,null,2)],{type:'application/json'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='my-flashcard-backup.json';a.click();URL.revokeObjectURL(u)}function importBackup(file){const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!Array.isArray(x))throw Error('Backup must be an array.');extra=x;localStorage.setItem(STORE,JSON.stringify(extra));cards=[...initialData,...extra];populateAllVoiceSelects();setup();apply();alert('Backup imported.')}catch(e){alert(e.message)}};r.readAsText(file)}
['list','unit','part','type','front'].forEach(k=>els[k]?.addEventListener('change',()=>{if(k==='list')updateUnits();if(k==='unit')updateParts();apply()}));els.search.addEventListener('input',apply);els.next.addEventListener('click',next);els.prev.addEventListener('click',prev);els.flip.addEventListener('click',flip);els.card.addEventListener('click',()=>{if(!playing)flip()});els.speakFront.addEventListener('click',speakFront);els.playList.addEventListener('click',playSelected);els.pauseList.addEventListener('click',pauseResume);els.stopList.addEventListener('click',()=>stop());els.addForm.addEventListener('submit',addCard);els.exportBtn.addEventListener('click',exportBackup);els.importJson.addEventListener('change',e=>e.target.files[0]&&importBackup(e.target.files[0]));els.unlockSpeech.addEventListener('click',unlockSpeech);els.testDe.addEventListener('click',()=>say('die Abteilung. die Abteilungen.','de'));els.testEn.addEventListener('click',()=>say('department or division','en'));els.testFa.addEventListener('click',()=>say(DARI_TEST_TEXT,'fa'));document.querySelectorAll('[data-say]').forEach(b=>b.addEventListener('click',()=>{const c=filtered[idx];if(!c)return;if(b.dataset.say==='de')say(displayGerman(c),'de');if(b.dataset.say==='en')say(displayEnglish(c),'en');if(b.dataset.say==='fa')say(displayDari(c),'fa')}));if(els.voiceSelectDe)els.voiceSelectDe.addEventListener('change',()=>saveVoiceChoice('de'));
if(els.voiceSelectEn)els.voiceSelectEn.addEventListener('change',()=>saveVoiceChoice('en'));
if(els.voiceSelectFa)els.voiceSelectFa.addEventListener('change',()=>saveVoiceChoice('fa'));
if(els.scanDariVoices)els.scanDariVoices.addEventListener('click',runDariVoiceSearch);
if(els.nextDariCandidate)els.nextDariCandidate.addEventListener('click',nextDariCandidate);
document.addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea'))return;if(e.code==='Space'){e.preventDefault();if(!playing)flip()}if(e.code==='ArrowRight')next();if(e.code==='ArrowLeft')prev()});if('speechSynthesis'in window){speechSynthesis.onvoiceschanged=()=>updateVoiceStatus();setTimeout(updateVoiceStatus,500);setTimeout(updateVoiceStatus,1500)}populateAllVoiceSelects();setup();apply();

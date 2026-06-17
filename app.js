const initialData = window.FLASHCARD_DATA.cards;
const STORE='b2-native-cards-extra-v16';
let extra=JSON.parse(localStorage.getItem(STORE)||'[]');
let cards=[...initialData,...extra];
let filtered=[]; let idx=0; let flipped=false; let lastFront=null; let playing=false; let paused=false; let playQueue=[]; let playIndex=0;
let activeUtterance=null; let speechWatchTimer=null;

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
  testDe:$('testDe'),testEn:$('testEn'),testFa:$('testFa'),unlockSpeech:$('unlockSpeech')
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

// v15 voice engine: keeps the v6-style direct path, but fixes mobile Dari disappearing fast.
// Key fixes: keep the utterance object alive globally, retry fa-AF/fa-IR/fa on mobile if it ends instantly,
// and hold the Dari card visible for a minimum time even if the mobile browser fires onend/onerror too fast.
function isMobile(){return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent||'')}
function voices(){return ('speechSynthesis'in window)?(speechSynthesis.getVoices()||[]):[]}
function pickVoice(lang){
  const vs=voices();
  if(lang==='de'){
    return vs.find(v=>v.lang==='de-DE'&&/premium|enhanced|natural|siri|google|microsoft/i.test(v.name))||
           vs.find(v=>v.lang==='de-DE')||vs.find(v=>v.lang&&v.lang.startsWith('de'));
  }
  if(lang==='en'){
    return vs.find(v=>v.lang==='en-US'&&/premium|enhanced|natural|siri|google|microsoft/i.test(v.name))||
           vs.find(v=>v.lang==='en-US')||vs.find(v=>v.lang&&v.lang.startsWith('en'));
  }
  // Dari: same base as the working v6 path, with Persian voice recognition for mobile.
  return vs.find(v=>v.lang==='fa-AF')||
         vs.find(v=>v.lang==='fa-IR')||
         vs.find(v=>v.lang&&v.lang.toLowerCase()==='fa')||
         vs.find(v=>/dari|persian|farsi|فارسی|دری/i.test(v.name||''))||
         vs.find(v=>v.lang&&v.lang.startsWith('fa'));
}
function voiceLabel(v){return v?`${v.name} (${v.lang})`:'Browser default voice'}
function finishAfterMinimum(start, lang, text, done){
  const mobileDari=lang==='fa'&&isMobile();
  const minHold=mobileDari?Math.min(5200,Math.max(2600,String(text||'').length*115)):0;
  const wait=Math.max(0,minHold-(Date.now()-start));
  clearTimeout(speechWatchTimer);
  speechWatchTimer=setTimeout(()=>{activeUtterance=null;done();},wait);
}
function buildUtterance(text, lang, voice, langCode, done, fail){
  const u=new SpeechSynthesisUtterance(text);
  u.lang=langCode || (lang==='de'?'de-DE':lang==='en'?'en-US':'fa-AF');
  u.rate=lang==='de'?0.78:0.92;
  u.pitch=1;
  if(voice)u.voice=voice;
  let called=false;
  u.onend=()=>{if(called)return;called=true;done();};
  u.onerror=()=>{if(called)return;called=true;fail?fail():done();};
  return u;
}
function speakDariMobile(text, done){
  const start=Date.now();
  const vs=voices();
  const picked=pickVoice('fa');
  const attempts=[];
  if(picked)attempts.push({voice:picked, lang:picked.lang||'fa-AF'});
  attempts.push({voice:null, lang:'fa-AF'});
  attempts.push({voice:null, lang:'fa-IR'});
  attempts.push({voice:null, lang:'fa'});
  let i=0;
  function attempt(){
    if(i>=attempts.length){finishAfterMinimum(start,'fa',text,done);return;}
    const a=attempts[i++];
    try{speechSynthesis.cancel();speechSynthesis.resume&&speechSynthesis.resume();}catch(e){}
    const localStart=Date.now();
    const u=buildUtterance(text,'fa',a.voice,a.lang,()=>{
      const tooFast=Date.now()-localStart<450;
      if(tooFast && i<attempts.length){setTimeout(attempt,90);return;}
      finishAfterMinimum(start,'fa',text,done);
    },()=>{
      if(i<attempts.length){setTimeout(attempt,90);return;}
      finishAfterMinimum(start,'fa',text,done);
    });
    activeUtterance=u;
    speechSynthesis.speak(u);
    // iOS/Android sometimes stay paused; resume nudges the queue without changing the text.
    setTimeout(()=>{try{speechSynthesis.resume&&speechSynthesis.resume();}catch(e){}},180);
  }
  attempt();
}
function isMobile(){return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent||'')}
function estimateHoldMs(text,lang){
  const len=String(text||'').trim().length;
  if(lang==='fa') return Math.max(isMobile()?4200:2400, Math.min(8000, 1800 + len*85));
  if(lang==='de') return Math.max(1300, Math.min(5200, 800 + len*70));
  return Math.max(1200, Math.min(4800, 700 + len*65));
}
function say(text,lang='de',done=()=>{}){
  if(!text){done();return}
  if(!('speechSynthesis' in window)){showWarning('Speech is not supported in this browser.');setTimeout(done,estimateHoldMs(text,lang));return}
  clearWarning();

  const token=++speechToken;
  let finished=false;
  let minDone=false;

  function finish(){
    if(finished || token!==speechToken) return;
    finished=true;
    done();
  }

  const minMs=estimateHoldMs(text,lang);
  setTimeout(()=>{minDone=true; if(lang==='fa') finish();}, minMs);

  try{
    const u=new SpeechSynthesisUtterance(text);
    activeUtterance=u;
    u.lang=lang==='de'?'de-DE':lang==='en'?'en-US':'fa-AF';
    u.rate=lang==='de'?0.78:0.92;
    u.pitch=1;
    const v=pickVoice(lang);
    if(v)u.voice=v;

    u.onend=()=>{
      // Critical v16 fix:
      // Mobile often fires onend/onerror immediately for fa-AF without audio.
      // For Dari we ignore early completion and keep the card visible until minMs.
      if(lang==='fa'){
        if(minDone) finish();
      }else{
        finish();
      }
    };
    u.onerror=()=>{
      if(lang==='fa'){
        // Do not jump to the next card. Hold the Dari text, then continue.
        if(minDone) finish();
      }else{
        finish();
      }
    };

    speechSynthesis.speak(u);
    if(lang==='fa' && isMobile()){
      setTimeout(()=>{try{speechSynthesis.resume()}catch(e){}}, 250);
      setTimeout(()=>{try{speechSynthesis.resume()}catch(e){}}, 900);
    }
  }catch(e){
    if(lang==='fa'){
      setTimeout(finish, minMs);
    }else{
      finish();
    }
  }
}
function queueSay(t,l='de',d=()=>{}){say(t,l,d)}
function speakFront(){if(lastFront)say(lastFront.speech||lastFront.display,lastFront.lang)}
function unlockSpeech(){clearWarning();updateVoiceStatus();els.now.textContent='Voice list refreshed.'}
function detectDevice(){let d='Desktop/laptop';const ua=navigator.userAgent||'';if(/iPhone|iPad|iPod/i.test(ua))d='iPhone/iPad';else if(/Android/i.test(ua))d='Android';else if(/Windows/i.test(ua))d='Windows PC';else if(/Macintosh/i.test(ua))d='Mac';els.deviceInfo.textContent=`Detected: ${d}. Mobile Dari now keeps the card visible and retries fa-AF / fa-IR / fa if the browser ends too fast.`}
function updateVoiceStatus(){if(!('speechSynthesis'in window)){els.voiceDe.textContent=els.voiceEn.textContent=els.voiceFa.textContent='Speech not supported';return}els.voiceDe.textContent=voiceLabel(pickVoice('de'));els.voiceEn.textContent=voiceLabel(pickVoice('en'));els.voiceFa.textContent=voiceLabel(pickVoice('fa'));}
function cardScript(c){const s=[];if(els.playDe.checked){const g=displayGerman(c);s.push({display:g,speech:g,lang:'de',label:'German',sub:'Slow'})}if(els.playForms.checked){const fs=formStep(c);if(fs)s.push(fs)}if(els.playEn.checked&&c.english)s.push({display:displayEnglish(c),speech:cleanSpeechText(c.english,'en'),lang:'en',label:'English',sub:'Medium'});if(els.playFa.checked&&c.dari){const d=displayDari(c);s.push({display:d,speech:d,lang:'fa',label:'Dari',sub:'Medium'})}return s.filter(x=>x.display&&String(x.display).trim()&&String(x.display).trim()!=='—');}
function renderPlaybackStep(item,partIdx){const c=item.card,p=item.parts[partIdx];idx=Math.max(0,filtered.indexOf(c));flipped=false;playing=true;renderDetails(c,p.lang);renderProgress();setDirForLang(p.lang);els.card.classList.add('playing');els.answer.classList.add('hidden');els.frontText.textContent=p.display;els.frontHint.textContent=p.label;els.frontSub.textContent=`${item.cardNo}/${item.totalCards} · ${p.sub||''}`;lastFront=p;els.now.textContent=`${item.cardNo}/${item.totalCards}: ${p.label} — ${p.display}`;}
function playSelected(){if(!filtered.length)return;stop(false);playing=true;paused=false;playQueue=[];const source=[...filtered],rep=Number(els.repeat.value)||1;for(let r=0;r<rep;r++)source.forEach((c,i)=>{const parts=cardScript(c);if(parts.length)playQueue.push({card:c,parts,cardNo:i+1,totalCards:source.length})});playIndex=0;if('speechSynthesis'in window)speechSynthesis.cancel();playNextPart(0)}
function playNextPart(partIdx){
  if(!playing||playIndex>=playQueue.length){stop();return}
  if(paused)return;
  const item=playQueue[playIndex];
  if(partIdx>=item.parts.length){playIndex++;playNextPart(0);return}
  const part=item.parts[partIdx];

  renderPlaybackStep(item,partIdx);

  // v16: continuation is controlled by say(), and Dari cannot complete before its minimum hold.
  setTimeout(()=>{
    queueSay(part.speech||part.display,part.lang,()=>{
      setTimeout(()=>playNextPart(partIdx+1), part.lang==='fa'?260:520);
    });
  },170);
}
function pauseResume(){if(!playing||!('speechSynthesis'in window))return;if(paused){paused=false;els.pauseList.textContent='Pause';speechSynthesis.resume()}else{paused=true;els.pauseList.textContent='Resume';speechSynthesis.pause();els.now.textContent='Paused.'}}
function stop(doRender=true){
  playing=false;paused=false;playQueue=[];playIndex=0;
  speechToken++;
  activeUtterance=null;
  if('speechSynthesis'in window)speechSynthesis.cancel();
  els.pauseList.textContent='Pause';els.now.textContent='Ready.';els.card.classList.remove('playing');els.frontText.removeAttribute('dir');
  if(doRender)render();
}

function addCard(e){e.preventDefault();const d=Object.fromEntries(new FormData(els.addForm).entries());const syns=String(d.synonyms||'').split(',').map(s=>s.trim()).filter(Boolean).slice(0,3);while(syns.length<3)syns.push(syns.length?'related verb':'verb meaning');const isVerb=d.category==='verb';const c={id:'custom-'+Date.now(),source:'user',list:'My cards',unit:d.unit||'My list',part:'',category:d.category||'other',german:d.german,english:d.english,dari:d.dari,article:d.article||'',singular:d.german,plural:d.plural||'',forms:{infinitive:d.infinitive||'',present3:'',past:d.past||'',perfect:d.perfect||'',plusquamperfekt:d.plusquamperfekt||''},synonyms:isVerb?syns:[],synonyms_en:isVerb?syns:[],synonyms_de:isVerb?syns:[],synonyms_fa:isVerb?syns:[],example:''};extra.push(c);localStorage.setItem(STORE,JSON.stringify(extra));cards=[...initialData,...extra];setup();apply();els.addForm.reset()}
function exportBackup(){const blob=new Blob([JSON.stringify(extra,null,2)],{type:'application/json'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='my-flashcard-backup.json';a.click();URL.revokeObjectURL(u)}function importBackup(file){const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!Array.isArray(x))throw Error('Backup must be an array.');extra=x;localStorage.setItem(STORE,JSON.stringify(extra));cards=[...initialData,...extra];setup();apply();alert('Backup imported.')}catch(e){alert(e.message)}};r.readAsText(file)}
['list','unit','part','type','front'].forEach(k=>els[k]?.addEventListener('change',()=>{if(k==='list')updateUnits();if(k==='unit')updateParts();apply()}));els.search.addEventListener('input',apply);els.next.addEventListener('click',next);els.prev.addEventListener('click',prev);els.flip.addEventListener('click',flip);els.card.addEventListener('click',()=>{if(!playing)flip()});els.speakFront.addEventListener('click',speakFront);els.playList.addEventListener('click',playSelected);els.pauseList.addEventListener('click',pauseResume);els.stopList.addEventListener('click',()=>stop());els.addForm.addEventListener('submit',addCard);els.exportBtn.addEventListener('click',exportBackup);els.importJson.addEventListener('change',e=>e.target.files[0]&&importBackup(e.target.files[0]));els.unlockSpeech.addEventListener('click',unlockSpeech);els.testDe.addEventListener('click',()=>say('die Abteilung','de'));els.testEn.addEventListener('click',()=>say('department or division','en'));els.testFa.addEventListener('click',()=>say('دیپارتمنت، بخش','fa'));document.querySelectorAll('[data-say]').forEach(b=>b.addEventListener('click',()=>{const c=filtered[idx];if(!c)return;if(b.dataset.say==='de')say(displayGerman(c),'de');if(b.dataset.say==='en')say(displayEnglish(c),'en');if(b.dataset.say==='fa')say(displayDari(c),'fa')}));document.addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea'))return;if(e.code==='Space'){e.preventDefault();if(!playing)flip()}if(e.code==='ArrowRight')next();if(e.code==='ArrowLeft')prev()});if('speechSynthesis'in window){speechSynthesis.onvoiceschanged=()=>updateVoiceStatus();setTimeout(updateVoiceStatus,500);setTimeout(updateVoiceStatus,1500)}if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js?v=16').catch(()=>{});setup();apply();

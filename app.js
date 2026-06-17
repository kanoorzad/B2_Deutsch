// v34: remove old service workers/caches once so old broken versions cannot control audio.
(function(){try{const key='v34AudioResetDone';if(!sessionStorage.getItem(key)){sessionStorage.setItem(key,'1');Promise.all([('serviceWorker'in navigator)?navigator.serviceWorker.getRegistrations().then(rs=>Promise.all(rs.map(r=>r.unregister()))):Promise.resolve(),('caches'in window)?caches.keys().then(ks=>Promise.all(ks.map(k=>caches.delete(k)))):Promise.resolve()]).then(()=>{if(!location.search.includes('fresh34=')){const sep=location.search?'&':'?';location.replace(location.pathname+location.search+sep+'fresh34='+Date.now())}}).catch(()=>{});}}catch(e){}})();
const initialData = window.FLASHCARD_DATA.cards;
const STORE='b2-native-cards-extra-v34';
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


// v34 audio engine: native best-quality voices for German/English; Dari Auto = native Farsi/Persian voice if it truly works, otherwise local high-quality sprite fallback.
let activeUtterance=null;
function voices(){return ('speechSynthesis'in window)?(speechSynthesis.getVoices()||[]):[]}
function normVoice(v){return ((v&&v.name)||'')+' '+((v&&v.lang)||'')}
function isMobile(){return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent||'')}
function scoreVoice(v,lang){
  const n=normVoice(v).toLowerCase(); let s=0;
  if(lang==='de'){if(v.lang==='de-DE')s+=100; else if(v.lang&&v.lang.startsWith('de'))s+=70;}
  if(lang==='en'){if(v.lang==='en-US')s+=100; else if(v.lang&&v.lang.startsWith('en'))s+=70;}
  if(lang==='fa'){if(v.lang==='fa-IR')s+=120; else if(v.lang==='fa-AF')s+=110; else if(v.lang&&v.lang.toLowerCase().startsWith('fa'))s+=90; if(/persian|farsi|dari|فارسی|دری/i.test(n))s+=60;}
  if(/premium|enhanced|neural|natural|online|siri|google|microsoft|ava|samantha|eloquence/i.test(n))s+=30;
  if(/compact|novelty|whisper|bad news|bells|organ/i.test(n))s-=30;
  return s;
}
function pickVoice(lang){const vs=voices();return vs.map(v=>[scoreVoice(v,lang),v]).filter(x=>x[0]>0).sort((a,b)=>b[0]-a[0])[0]?.[1]||null}
function voiceLabel(v){return v?`${v.name} (${v.lang})`:'No matching device voice'}
function getSpriteMeta(){return window.DARI_AUDIO_SPRITE||{sprites:['dari-sprite-1.mp3?v=34'],entries:{}}}
function spriteSrcFor(entry){const meta=getSpriteMeta();const list=meta.sprites||[];const n=Math.max(1,Number(entry&&entry.f)||1);return list[n-1]||list[0]||'dari-sprite-1.mp3?v=34'}
function getSpriteEntry(audioRef){const entries=getSpriteMeta().entries||{};if(audioRef&&entries[audioRef])return entries[audioRef];if(audioRef){const name=audioRef.split('/').pop();const key=Object.keys(entries).find(k=>k.split('/').pop()===name);if(key)return entries[key]}return null}
function getFirstSpriteEntry(){const entries=getSpriteMeta().entries||{};const k=Object.keys(entries)[0];return k?entries[k]:null}
function ensureDariSprite(src){if(!dariSpriteAudio){dariSpriteAudio=new Audio();dariSpriteAudio.preload='auto';dariSpriteAudio.playsInline=true}const wanted=src||spriteSrcFor(getFirstSpriteEntry()||{});if(wanted&&dariSpriteAudio.src.indexOf(wanted.split('?')[0])<0){dariSpriteAudio.src=wanted}return dariSpriteAudio}
function setDariStatus(msg){try{if(els&&els.voiceFa)els.voiceFa.textContent=msg}catch(e){}}
function unlockDariSprite(){try{const a=ensureDariSprite();if(dariSpriteUnlocked){setDariStatus('Dari local sprite ready.');return}a.muted=true;a.currentTime=0;const p=a.play();if(p&&p.then){p.then(()=>{a.pause();a.currentTime=0;a.muted=false;dariSpriteUnlocked=true;setDariStatus('Dari local sprite ready.')}).catch(e=>{a.muted=false;setDariStatus('Tap Test Dari again: '+(e&&e.name?e.name:'unlock blocked'))})}else{a.pause();a.currentTime=0;a.muted=false;dariSpriteUnlocked=true;setDariStatus('Dari local sprite ready.')}}catch(e){setDariStatus('Dari unlock failed: '+(e&&e.message?e.message:'error'))}}
function primeDariAudio(){unlockDariSprite();try{if('speechSynthesis'in window)speechSynthesis.resume()}catch(e){}}
function stopDariSpriteOnly(){clearTimeout(dariStopTimer);if(dariSpriteAudio){try{dariSpriteAudio.pause()}catch(e){}}}
function playSpriteSegment(entry,done=()=>{}){const a=ensureDariSprite(spriteSrcFor(entry));stopDariSpriteOnly();let finished=false;const start=Math.max(0,Number(entry.s)||0);const dur=Math.max(.45,Number(entry.d)||2.5);function finish(){if(finished)return;finished=true;clearTimeout(dariStopTimer);try{a.pause()}catch(e){}done()}try{a.muted=false;a.playbackRate=0.94;a.currentTime=start;a.ontimeupdate=()=>{if(a.currentTime>=start+dur)finish()};a.onended=finish;a.onerror=()=>{setDariStatus('Dari sprite media error.');finish()};const p=a.play();if(p&&p.catch)p.catch(e=>{setDariStatus('Tap Test Dari / Play again: '+(e&&e.name?e.name:'play blocked'));setTimeout(finish,Math.max(2200,dur*1000/0.94))});dariStopTimer=setTimeout(finish,Math.max(1200,Math.ceil((dur/0.94+.25)*1000)));setDariStatus('Playing local Dari/Farsi sprite.')}catch(e){setDariStatus('Dari sprite failed: '+(e&&e.message?e.message:'error'));setTimeout(finish,Math.max(2200,dur*1000))}}
function saySpriteDari(text,audioRef='',done=()=>{}){const entry=getSpriteEntry(audioRef)||getFirstSpriteEntry();if(!entry){setDariStatus('No Dari sprite entry found.');setTimeout(done,2200);return}playSpriteSegment(entry,done)}
function sayWebSpeech(text,lang='de',done=()=>{},opts={}){if(!text){done();return}if(!('speechSynthesis'in window)){done();return}try{speechSynthesis.resume()}catch(e){}const v=pickVoice(lang);const u=new SpeechSynthesisUtterance(text);activeUtterance=u;u.lang=(v&&v.lang)?v.lang:(lang==='de'?'de-DE':lang==='en'?'en-US':'fa-IR');u.rate=lang==='de'?0.76:(lang==='en'?0.84:0.88);u.pitch=1;if(v)u.voice=v;let called=false;function finish(kind){if(called)return;called=true;activeUtterance=null;done(kind)}u.onend=()=>finish('end');u.onerror=()=>finish('error');speechSynthesis.speak(u);if(opts.maxMs)setTimeout(()=>finish('timeout'),opts.maxMs)}
function sayDariAuto(text,audioRef='',done=()=>{}){const v=pickVoice('fa');if(v){const t0=performance.now();sayWebSpeech(text,'fa',(kind)=>{const elapsed=performance.now()-t0;if(kind==='error'||elapsed<650){setDariStatus('Device Farsi silent; using local sprite.');saySpriteDari(text,audioRef,done)}else{setDariStatus('Played with device Farsi/Persian voice.');done()}},{maxMs:8500});return}setDariStatus('No device Farsi voice; using local sprite.');saySpriteDari(text,audioRef,done)}
function say(text,lang='de',done=()=>{},audioRef=''){if(!text){done();return}if(lang==='fa'){sayDariAuto(text,audioRef,done);return}if(!('speechSynthesis'in window)){alert('Speech is not supported in this browser.');done();return}sayWebSpeech(text,lang,done,{maxMs:9000})}
function queueSay(t,l='de',d=()=>{},audioRef=''){say(t,l,d,audioRef)}
function speakFront(){primeDariAudio();if(lastFront)say(lastFront.speech||lastFront.display,lastFront.lang,()=>{},lastFront.audio||'')}
function unlockSpeech(){primeDariAudio();updateVoiceStatus();els.now.textContent='Audio reset/unlock done. Try Test German, Test English, Test Dari.'}
function detectDevice(){let d='Desktop/laptop';const ua=navigator.userAgent||'';if(/iPhone|iPad|iPod/i.test(ua))d='iPhone/iPad';else if(/Android/i.test(ua))d='Android';else if(/Windows/i.test(ua))d='Windows PC';else if(/Macintosh/i.test(ua))d='Mac';els.deviceInfo.textContent=`Detected: ${d}. v34 reset old caches; Dari Auto uses device Farsi if reliable, else local sprite.`}
function updateVoiceStatus(){if(!('speechSynthesis'in window)){els.voiceDe.textContent=els.voiceEn.textContent='Speech not supported'}else{els.voiceDe.textContent=voiceLabel(pickVoice('de'));els.voiceEn.textContent=voiceLabel(pickVoice('en'))}const fv=pickVoice('fa');els.voiceFa.textContent=fv?`Auto: device ${voiceLabel(fv)} or local sprite fallback`:'Auto: local Dari/Farsi sprite fallback'}
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
  primeDariAudio();
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
  setTimeout(()=>say(p.t,p.l,()=>setTimeout(()=>playNextPart(partIdx+1),450),p.audio||''),120);
}
function pauseResume(){if(!playing||!('speechSynthesis'in window))return;if(paused){paused=false;els.pauseList.textContent='Pause';speechSynthesis.resume()}else{paused=true;els.pauseList.textContent='Resume';speechSynthesis.pause();els.now.textContent='Paused.'}}
function stop(doRender=true){
  playing=false;
  paused=false;
  playQueue=[];
  playIndex=0;
  stopDariSpriteOnly();
  if('speechSynthesis'in window)speechSynthesis.cancel();
  els.pauseList.textContent='Pause';
  els.now.textContent='Ready.';
  els.card.classList.remove('playing');
  els.frontText.removeAttribute('dir');
  if(doRender)render();
}

function addCard(e){e.preventDefault();const d=Object.fromEntries(new FormData(els.addForm).entries());const syns=String(d.synonyms||'').split(',').map(s=>s.trim()).filter(Boolean).slice(0,3);while(syns.length<3)syns.push(syns.length?'related verb':'verb meaning');const isVerb=d.category==='verb';const c={id:'custom-'+Date.now(),source:'user',list:'My cards',unit:d.unit||'My list',part:'',category:d.category||'other',german:d.german,english:d.english,dari:d.dari,article:d.article||'',singular:d.german,plural:d.plural||'',forms:{infinitive:d.infinitive||'',present3:'',past:d.past||'',perfect:d.perfect||'',plusquamperfekt:d.plusquamperfekt||''},synonyms:isVerb?syns:[],synonyms_en:isVerb?syns:[],synonyms_de:isVerb?syns:[],synonyms_fa:isVerb?syns:[],example:''};extra.push(c);localStorage.setItem(STORE,JSON.stringify(extra));cards=[...initialData,...extra];setup();apply();els.addForm.reset()}
function exportBackup(){const blob=new Blob([JSON.stringify(extra,null,2)],{type:'application/json'});const u=URL.createObjectURL(blob);const a=document.createElement('a');a.href=u;a.download='my-flashcard-backup.json';a.click();URL.revokeObjectURL(u)}function importBackup(file){const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!Array.isArray(x))throw Error('Backup must be an array.');extra=x;localStorage.setItem(STORE,JSON.stringify(extra));cards=[...initialData,...extra];setup();apply();alert('Backup imported.')}catch(e){alert(e.message)}};r.readAsText(file)}
['list','unit','part','type','front'].forEach(k=>els[k]?.addEventListener('change',()=>{if(k==='list')updateUnits();if(k==='unit')updateParts();apply()}));els.search.addEventListener('input',apply);els.next.addEventListener('click',next);els.prev.addEventListener('click',prev);els.flip.addEventListener('click',flip);els.card.addEventListener('click',()=>{if(!playing)flip()});els.speakFront.addEventListener('click',speakFront);els.playList.addEventListener('click',playSelected);els.pauseList.addEventListener('click',pauseResume);els.stopList.addEventListener('click',()=>stop());els.addForm.addEventListener('submit',addCard);els.exportBtn.addEventListener('click',exportBackup);els.importJson.addEventListener('change',e=>e.target.files[0]&&importBackup(e.target.files[0]));els.unlockSpeech.addEventListener('click',unlockSpeech);els.testDe.addEventListener('click',()=>{primeDariAudio();say('die Abteilung','de')});els.testEn.addEventListener('click',()=>{primeDariAudio();say('department or division','en')});els.testFa.addEventListener('click',()=>{primeDariAudio();setTimeout(()=>sayDariAuto('دیپارتمنت، بخش','',()=>{}),220)});document.querySelectorAll('[data-say]').forEach(b=>b.addEventListener('click',()=>{const c=filtered[idx];if(!c)return;if(b.dataset.say==='de')say(displayGerman(c),'de');if(b.dataset.say==='en')say(displayEnglish(c),'en');if(b.dataset.say==='fa'){primeDariAudio();setTimeout(()=>say(displayDari(c),'fa',()=>{},c.audio_fa||''),220)}}));document.addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea'))return;if(e.code==='Space'){e.preventDefault();if(!playing)flip()}if(e.code==='ArrowRight')next();if(e.code==='ArrowLeft')prev()});if('speechSynthesis'in window){speechSynthesis.onvoiceschanged=()=>updateVoiceStatus();setTimeout(updateVoiceStatus,500);setTimeout(updateVoiceStatus,1500)}setup();apply();

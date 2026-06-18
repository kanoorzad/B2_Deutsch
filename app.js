const initialData = window.FLASHCARD_DATA.cards;
const STORE='b2-native-cards-extra-v3';
let extra=JSON.parse(localStorage.getItem(STORE)||'[]');
let cards=[...initialData,...extra]; let filtered=[]; let idx=0; let flipped=false; let lastFront=null; let playing=false; let playQueue=[]; let playIndex=0;
const $=id=>document.getElementById(id); const els={list:$('listFilter'),unit:$('unitFilter'),part:$('partFilter'),type:$('typeFilter'),search:$('search'),front:$('front'),prev:$('prev'),next:$('next'),flip:$('flip'),speakFront:$('speakFront'),card:$('card'),answer:$('answer'),frontText:$('frontText'),frontHint:$('frontHint'),chipList:$('chipList'),chipUnit:$('chipUnit'),chipPart:$('chipPart'),chipType:$('chipType'),de:$('de'),en:$('en'),fa:$('fa'),nounBox:$('nounBox'),article:$('article'),singular:$('singular'),plural:$('plural'),verbBox:$('verbBox'),inf:$('inf'),pres3:$('pres3'),past:$('past'),perf:$('perf'),plus:$('plus'),verbQuality:$('verbQuality'),syn:$('syn'),ex:$('ex'),count:$('count'),bar:$('bar'),playDe:$('playDe'),playEn:$('playEn'),playFa:$('playFa'),playForms:$('playForms'),repeat:$('repeat'),playList:$('playList'),pauseList:$('pauseList'),stopList:$('stopList'),now:$('nowPlaying'),addForm:$('addForm'),exportBtn:$('exportBtn'),importJson:$('importJson'),theme:$('themeBtn'),install:$('installBtn'),help:$('help'),closeHelp:$('closeHelp')};
function unique(arr){return [...new Set(arr.filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{numeric:true}))}function norm(s){return String(s||'').toLowerCase().trim()}function textOf(c){return [c.list,c.unit,c.part,c.category,c.german,c.english,c.dari,c.article,c.singular,c.plural,c.example,...Object.values(c.forms||{}),...(c.synonyms||[])].join(' ').toLowerCase()}
function setup(){els.list.innerHTML='<option value="all">All lists</option>'+unique(cards.map(c=>c.list)).map(x=>`<option>${esc(x)}</option>`).join(''); updateUnits();}
function updateUnits(){const list=els.list.value; const pool=list==='all'?cards:cards.filter(c=>c.list===list); const u=unique(pool.map(c=>c.unit)); els.unit.innerHTML='<option value="all">All units</option>'+u.map(x=>`<option>${esc(x)}</option>`).join(''); updateParts()}
function updateParts(){const list=els.list.value,u=els.unit.value; const pool=cards.filter(c=>(list==='all'||c.list===list)&&(u==='all'||c.unit===u)); const p=unique(pool.map(c=>c.part)); els.part.innerHTML='<option value="all">All parts</option>'+p.map(x=>`<option>${esc(x)}</option>`).join('')}
function apply(){const l=els.list.value,u=els.unit.value,p=els.part.value,t=els.type.value,q=norm(els.search.value); filtered=cards.filter(c=>(l==='all'||c.list===l)&&(u==='all'||c.unit===u)&&(p==='all'||c.part===p)&&(t==='all'||c.category===t)&&(!q||textOf(c).includes(q))); idx=Math.min(idx,Math.max(filtered.length-1,0)); flipped=false; render()}
function getFront(c){let mode=els.front.value;if(mode==='random')mode=['german','english','dari','plural'][Math.floor(Math.random()*4)]; if(mode==='english')return {txt:c.english,h:'US English',lang:'en'}; if(mode==='dari')return {txt:c.dari,h:'Dari',lang:'fa'}; if(mode==='plural')return {txt:c.category==='noun'?(c.plural||'Plural not provided'):(c.forms?.past||'Past not provided'),h:c.category==='noun'?'German plural':'German past form',lang:'de'}; return {txt:displayGerman(c),h:'German',lang:'de'}}
function displayGerman(c){return [c.article,c.singular||c.german].filter(Boolean).join(' ')||c.german}
function render(){const c=filtered[idx]; if(!c){els.frontText.textContent='No cards';els.frontHint.textContent='Change filters or add cards.';els.answer.classList.add('hidden');els.count.textContent='0 / 0';els.bar.style.width='0';return} lastFront=getFront(c); els.frontText.textContent=lastFront.txt||'—'; els.frontHint.textContent=lastFront.h; els.chipList.textContent=c.list; els.chipUnit.textContent=c.unit; els.chipPart.textContent=c.part||'—'; els.chipType.textContent=c.category; els.de.textContent=displayGerman(c)+(c.plural?` · plural: ${c.plural}`:''); els.en.textContent=c.english||'—'; els.fa.textContent=c.dari||'—'; els.nounBox.classList.toggle('hidden',c.category!=='noun'); els.article.textContent=c.article||'—'; els.singular.textContent=c.singular||c.german||'—'; els.plural.textContent=c.plural||'—'; const f=c.forms||{}; const hasVerb=c.category==='verb'||Object.values(f).some(Boolean); els.verbBox.classList.toggle('hidden',!hasVerb); els.inf.textContent=f.infinitive||c.german||'—'; els.pres3.textContent=f.present3||'—'; els.past.textContent=f.past||'—'; els.perf.textContent=f.perfect||'—'; els.plus.textContent=f.plusquamperfekt||'—'; els.verbQuality.textContent=(c.quality&&c.quality.verbForms)?`Form source: ${c.quality.verbForms}`:''; els.syn.textContent=(c.synonyms||[]).length?c.synonyms.join(', '):'—'; els.ex.textContent=c.example||'—'; els.answer.classList.toggle('hidden',!flipped); els.count.textContent=`${idx+1} / ${filtered.length}`; els.bar.style.width=`${((idx+1)/filtered.length)*100}%`}
function next(){if(!filtered.length)return;idx=(idx+1)%filtered.length;flipped=false;render()}function prev(){if(!filtered.length)return;idx=(idx-1+filtered.length)%filtered.length;flipped=false;render()}function flip(){flipped=!flipped;render()}
function voices(){return speechSynthesis.getVoices()||[]}function pickVoice(lang){const vs=voices(); const exact= lang==='de'?'de-DE':lang==='en'?'en-US':'fa-AF'; const prefix=exact.slice(0,2); return vs.find(v=>v.lang===exact&&/premium|enhanced|natural|siri|google|microsoft/i.test(v.name))||vs.find(v=>v.lang===exact)||vs.find(v=>v.lang&&v.lang.startsWith(prefix))}
function say(text, lang='de', done=()=>{}){if(!text){done();return} if(!('speechSynthesis'in window)){alert('Speech is not supported in this browser.');done();return} const u=new SpeechSynthesisUtterance(text); u.lang=lang==='de'?'de-DE':lang==='en'?'en-US':'fa-AF'; u.rate=lang==='de'?0.78:0.92; u.pitch=1; const v=pickVoice(lang); if(v)u.voice=v; u.onend=done; u.onerror=done; speechSynthesis.speak(u)}
function speakFront(){if(lastFront)say(lastFront.txt,lastFront.lang)}
function cardScript(c){
  let a=[];
  if(els.playDe.checked)a.push({t:displayGerman(c),l:'de',label:'German'});
  if(els.playForms.checked&&c.category==='noun'&&c.plural)a.push({t:'Plural: '+c.plural,l:'de',label:'German plural'});
  if(els.playForms.checked&&c.category==='verb'){
    const f=c.forms||{};
    if(f.infinitive)a.push({t:'Infinitiv: '+f.infinitive,l:'de',label:'Infinitiv'});
    if(f.present3)a.push({t:'Präsens: '+f.present3,l:'de',label:'3rd person present'});
    if(f.past)a.push({t:'Präteritum: '+f.past,l:'de',label:'Präteritum'});
    if(f.perfect)a.push({t:'Perfekt: '+f.perfect,l:'de',label:'Perfekt'});
    if(f.plusquamperfekt)a.push({t:'Plusquamperfekt: '+f.plusquamperfekt,l:'de',label:'Plusquamperfekt'});
  }
  if(els.playEn.checked&&c.english)a.push({t:c.english,l:'en',label:'US English'});
  if(els.playFa.checked&&c.dari)a.push({t:c.dari,l:'fa',label:'Dari'});
  return a.filter(x=>x.t&&String(x.t).trim()&&String(x.t).trim()!=='—')
}
function playSelected(){
  if(!filtered.length)return;
  stop();
  playing=true;
  playQueue=[];
  const rep=Number(els.repeat.value)||1;
  filtered.forEach((c,i)=>{
    for(let r=0;r<rep;r++){
      const parts=cardScript(c);
      if(parts.length)playQueue.push({card:c,parts:parts,n:i+1,repeat:r+1});
    }
  });
  playIndex=0;
  playNextPart(0);
}
function showPlayingPart(item,p,partIdx){
  idx=item.n-1;
  flipped=true;
  render();
  els.frontText.textContent=p.t||'—';
  const langName=p.l==='de'?'German':p.l==='en'?'US English':'Dari';
  els.frontHint.textContent=`Now playing: ${p.label||langName}`;
  els.now.textContent=`Playing card ${playIndex+1}/${playQueue.length}, part ${partIdx+1}/${item.parts.length}: ${item.card.unit} ${item.card.part||''} — ${displayGerman(item.card)}`;
  els.card.classList.add('playing');
}
function playNextPart(partIdx){
  if(!playing||playIndex>=playQueue.length){stop();return}
  const item=playQueue[playIndex];
  if(partIdx>=item.parts.length){playIndex++; playNextPart(0);return}
  const p=item.parts[partIdx];
  showPlayingPart(item,p,partIdx);
  setTimeout(()=>say(p.t,p.l,()=>setTimeout(()=>playNextPart(partIdx+1),300)),90);
}
function pauseResume(){if(!('speechSynthesis'in window))return; if(speechSynthesis.paused)speechSynthesis.resume(); else speechSynthesis.pause()}function stop(){playing=false; playQueue=[]; playIndex=0; if('speechSynthesis'in window)speechSynthesis.cancel(); els.now.textContent='Not playing.'; if(els.card)els.card.classList.remove('playing'); render()}
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function addCard(e){e.preventDefault(); const d=Object.fromEntries(new FormData(els.addForm).entries()); const c={id:'custom-'+Date.now(),source:'user',list:'My cards',unit:d.unit||'My list',part:'',category:d.category||'other',german:d.german,english:d.english,dari:d.dari,article:d.article||'',singular:d.german,plural:d.plural||'',forms:{infinitive:d.infinitive||'',present3:'',past:d.past||'',perfect:d.perfect||'',plusquamperfekt:d.plusquamperfekt||''},synonyms:String(d.synonyms||'').split(',').map(s=>s.trim()).filter(Boolean),example:'',quality:{verbForms:'user-entered',translation:'user-entered'}}; extra.push(c); localStorage.setItem(STORE,JSON.stringify(extra)); cards=[...initialData,...extra]; setup();apply();els.addForm.reset()}
function exportBackup(){const blob=new Blob([JSON.stringify(extra,null,2)],{type:'application/json'}); const u=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=u; a.download='my-b2-flashcard-backup.json'; a.click(); URL.revokeObjectURL(u)}
function importBackup(file){const r=new FileReader(); r.onload=()=>{try{const x=JSON.parse(r.result); if(!Array.isArray(x))throw Error('Backup must be an array.'); extra=x; localStorage.setItem(STORE,JSON.stringify(extra)); cards=[...initialData,...extra]; setup();apply();alert('Backup imported.')}catch(e){alert(e.message)}}; r.readAsText(file)}
['list','unit','part','type','front'].forEach(k=>els[k]?.addEventListener('change',()=>{if(k==='list')updateUnits(); if(k==='unit')updateParts(); apply()})); els.search.addEventListener('input',apply); els.next.addEventListener('click',next);els.prev.addEventListener('click',prev);els.flip.addEventListener('click',flip);els.card.addEventListener('click',flip);els.speakFront.addEventListener('click',speakFront);els.playList.addEventListener('click',playSelected);els.pauseList.addEventListener('click',pauseResume);els.stopList.addEventListener('click',stop);els.addForm.addEventListener('submit',addCard);els.exportBtn.addEventListener('click',exportBackup);els.importJson.addEventListener('change',e=>e.target.files[0]&&importBackup(e.target.files[0]));els.theme.addEventListener('click',()=>document.body.classList.toggle('dark'));els.install.addEventListener('click',()=>els.help.showModal());els.closeHelp.addEventListener('click',()=>els.help.close());document.querySelectorAll('[data-say]').forEach(b=>b.addEventListener('click',()=>{const c=filtered[idx]; if(!c)return; if(b.dataset.say==='de')say(displayGerman(c),'de'); if(b.dataset.say==='en')say(c.english,'en'); if(b.dataset.say==='fa')say(c.dari,'fa')}));document.addEventListener('keydown',e=>{if(e.target.matches('input,select,textarea'))return;if(e.code==='Space'){e.preventDefault();flip()}if(e.code==='ArrowRight')next();if(e.code==='ArrowLeft')prev()}); if('speechSynthesis'in window)speechSynthesis.onvoiceschanged=()=>voices(); if('serviceWorker'in navigator)navigator.serviceWorker.register('./service-worker.js').catch(()=>{}); setup();apply();

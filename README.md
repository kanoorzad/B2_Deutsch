# B2 + B1 Plus Flashcards v51 — Full Version 4 Voice Engine

## What changed

v51 restores the full voice engine for all languages to the version-4 pattern:

```js
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
  const u=new SpeechSynthesisUtterance(text);
  u.lang=lang==='de'?'de-DE':lang==='en'?'en-US':'fa-AF';
  u.rate=lang==='de'?0.78:0.92;
  const v=pickVoice(lang);
  if(v)u.voice=v;
  speechSynthesis.speak(u);
}
```

## Also fixed

The initiative line appeared twice. v51 keeps it only once:

Initiative by Khalid Noorzad for Afghan Students

## Open

https://kanoorzad.github.io/B2_Deutsch/?v=51

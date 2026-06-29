/* ============================================================
   integration.js — bridges your REAL data.js to the soft-3D UI
   ------------------------------------------------------------
   Your data.js sets window.FLASHCARD_DATA = { cards:[...] }.
   This adapter converts each real card into the shape the
   soft-3D front-end renders, WITHOUT changing your data.

   DATA CONTRACT (real card -> prototype card):
     german        -> word            (always German)
     article/singular/plural -> noun forms (German)
     forms{}       -> verb tenses     (German, level-aware)
     synonyms_de OR synonyms_multi.de -> 4 German synonyms
     example       -> German example sentence
     translations[langKey]            -> translation text
     synonyms_multi[langKey]          -> translated synonyms (optional)
     audio_fa                         -> Persian MP3 path
   ------------------------------------------------------------
   Language key mapping (UI code -> data.js translation key):
     en->en, fa->fa, es->es, ru->ru, uk->uk, tr->tr, ar->ar, ku->kmr
   ============================================================ */
(function(){
  "use strict";

  // UI language code -> data.js translation key (Kurmanji differs)
  var LANG_KEY = { en:"en", fa:"fa", es:"es", ru:"ru", uk:"uk", tr:"tr", ar:"ar", ku:"kmr" };

  // Derive display level for a card from its list name (matches original rules)
  function levelOf(card){
    var L = (card.list||"") + "";
    if (/A1/.test(L)) return "A1";
    if (/A2/.test(L)) return "A2";
    if (/B1\s*Plus|B1\+/.test(L)) return "B1";   // B1+ uses B1 form rules
    if (/B1/.test(L)) return "B1";
    return "B2";
  }
  function isIrregular(card){ return /Irregular/i.test(card.list||""); }

  // German headword exactly as the app speaks/shows it
  function germanHead(card){
    if (card.category === "noun"){
      return [card.article, card.singular || card.german].filter(Boolean).join(" ").trim()
             || (card.german||"");
    }
    return (card.german || card.singular || "").trim();
  }

  // Pick the 4 German synonyms (prefer explicit, fall back to multi)
  function germanSynonyms(card){
    var s = card.synonyms_de;
    if ((!s || !s.length) && card.synonyms_multi && card.synonyms_multi.de) s = card.synonyms_multi.de;
    if (!s || !s.length) return "";
    return s.slice(0,4).join(" · ");
  }

  // Build a highlighted example: [before, target, after]
  function exampleParts(card){
    var ex = (card.example || "").trim();
    if (!ex) return ["", germanHead(card), ""];   // fallback: just the word
    // try to highlight the headword/stem inside the sentence
    var cand = card.singular || (card.german||"").split(",")[0]
                 .replace(/\s*\(.*?\)/g,'').replace(/\b(jdn|jdm|etw|sich)\b\.?/g,'').trim();
    var stem = (cand||"").split(" ").filter(Boolean).pop() || "";
    if (stem && stem.length>2){
      // match case-insensitively, keep original casing in output
      var i = ex.toLowerCase().indexOf(stem.toLowerCase());
      if (i >= 0) return [ex.slice(0,i), ex.slice(i,i+stem.length), ex.slice(i+stem.length)];
    }
    return [ex, "", ""];
  }

  // Translation text for the chosen language
  function translationFor(card, uiLangCode){
    var key = LANG_KEY[uiLangCode] || "en";
    var tr = card.translations && card.translations[key];
    return tr || (card.translations && card.translations.en) || "";
  }

  // Convert one real card -> prototype card model
  function adapt(card){
    var parts = exampleParts(card);
    return {
      id: card.id,
      cat: card.category === "verb" ? "verb" : (card.category === "noun" ? "noun" : "other"),
      level: levelOf(card),
      irregular: isIrregular(card),
      word: germanHead(card),
      article: card.article || "",
      singular: card.singular || "",
      plural: card.plural || "",
      forms: card.forms || {},
      syn: germanSynonyms(card),
      ex: parts,
      // translation is resolved live (depends on chosen language):
      _translations: card.translations || {},
      _exampleTrans: card.example_trans || {},
      _exampleSource: card.example_source || "",
      _unit: card.unit || "",
      _synMulti: card.synonyms_multi || {},
      audio_fa: card.audio_fa || "",
      list: card.list || ""
    };
  }

  // Public: load + adapt all real cards, optionally filtered by list
  window.IntegrationAdapter = {
    LANG_KEY: LANG_KEY,
    levelOf: levelOf,
    translationFor: translationFor,
    loadCards: function(filterList){
      var data = window.FLASHCARD_DATA;
      if (!data || !data.cards){ console.error("FLASHCARD_DATA not loaded"); return []; }
      var cards = data.cards;
      if (filterList && filterList !== "all"){
        cards = cards.filter(function(c){ return (c.list||"") === filterList; });
      }
      return cards.map(adapt);
    },
    // resolve translation main + sub for a given adapted card and UI lang
    resolveTranslation: function(adaptedCard, uiLangCode){
      var key = LANG_KEY[uiLangCode] || "en";
      var main = (adaptedCard._translations && (adaptedCard._translations[key] || adaptedCard._translations.en)) || "";
      return { main: main, sub: "" };  // sub (example translation) wired when available in data
    },
    // list of available lists in the data (for the material screen)
    availableLists: function(){
      var data = window.FLASHCARD_DATA; if(!data||!data.cards) return [];
      var seen={}, out=[];
      data.cards.forEach(function(c){ var L=c.list||""; if(L && !seen[L]){seen[L]=1; out.push(L);} });
      return out;
    }
  };
})();

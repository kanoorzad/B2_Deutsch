import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Speech from 'expo-speech';
import data from './data/cards.json';

const VERSION = 'v41 native mobile speech';

function cleanEnglish(t) {
  return String(t || '').replace(/\s*\/\s*/g, ' or ').replace(/\s+/g, ' ').trim();
}
function displayGerman(c) {
  return [c.article, c.singular || c.german].filter(Boolean).join(' ') || c.german || '—';
}
function displayEnglish(c) {
  return cleanEnglish(c.english || '—');
}
function displayDari(c) {
  return c.dari || '—';
}
function formText(c) {
  const f = c.forms || {};
  if (c.category === 'noun' && c.plural) return c.plural;
  if (c.category === 'verb') {
    return ['infinitive', 'past', 'perfect', 'plusquamperfekt'].map(k => f[k]).filter(Boolean).join('. ');
  }
  return '';
}
function voiceText(v) {
  if (!v) return 'Auto';
  return `${v.name || v.identifier || 'Voice'} · ${v.language || ''}${v.quality ? ' · ' + v.quality : ''}`;
}
function scoreVoice(v, lang) {
  const s = `${v.name || ''} ${v.identifier || ''} ${v.language || ''}`.toLowerCase();
  let score = 0;
  if (/enhanced|premium|neural|siri|google|microsoft|compact|default|high/i.test(s)) score += 20;

  if (lang === 'de') {
    if (s.includes('de-de')) score += 100;
    else if (/\bde\b|german|deutsch/.test(s)) score += 60;
  }
  if (lang === 'en') {
    if (s.includes('en-us')) score += 100;
    else if (s.includes('en-')) score += 70;
    else if (/english|us/.test(s)) score += 40;
  }
  if (lang === 'fa') {
    if (s.includes('fa-ir')) score += 140;
    if (s.includes('fa-af')) score += 135;
    if (/\bfa\b|fa-/.test(s)) score += 110;
    if (s.includes('prs-af') || /\bprs\b/.test(s)) score += 100;
    if (/persian|farsi|dari|afghan|afghanistan|iran|iranian|فارسی|دری|ایران|افغان/.test(s)) score += 100;
    if (s.includes('ar-') || s.includes('ur-') || s.includes('ps-')) score -= 80;
  }
  return score;
}
function bestVoice(voices, lang) {
  return [...voices].map(v => ({ v, s: scoreVoice(v, lang) })).filter(x => x.s > 0).sort((a,b) => b.s - a.s)[0]?.v || null;
}
function candidateVoices(voices, lang) {
  return [...voices].map(v => ({ v, s: scoreVoice(v, lang) })).filter(x => x.s > 0).sort((a,b) => b.s - a.s).map(x => x.v);
}

export default function App() {
  const [voices, setVoices] = useState([]);
  const [voiceDe, setVoiceDe] = useState(null);
  const [voiceEn, setVoiceEn] = useState(null);
  const [voiceFa, setVoiceFa] = useState(null);
  const [idx, setIdx] = useState(0);
  const [front, setFront] = useState('german');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('Ready.');
  const [showVoices, setShowVoices] = useState(false);
  const [dariTag, setDariTag] = useState('fa-IR');

  const cards = data.cards || [];

  useEffect(() => {
    refreshVoices();
  }, []);

  async function refreshVoices() {
    try {
      const available = await Speech.getAvailableVoicesAsync();
      setVoices(available || []);
      const de = bestVoice(available || [], 'de');
      const en = bestVoice(available || [], 'en');
      const fa = bestVoice(available || [], 'fa');
      setVoiceDe(v => v || de);
      setVoiceEn(v => v || en);
      setVoiceFa(v => v || fa);
      setStatus(`Native voices loaded: ${(available || []).length}. ${fa ? 'Dari/Farsi candidate found.' : 'No native Dari/Farsi candidate found yet.'}`);
    } catch (e) {
      setStatus('Voice scan failed: ' + String(e?.message || e));
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cards;
    return cards.filter(c => [displayGerman(c), displayEnglish(c), displayDari(c), c.list, c.unit, c.part, c.category]
      .join(' ').toLowerCase().includes(q));
  }, [query]);

  const card = filtered[Math.min(idx, Math.max(0, filtered.length - 1))] || cards[0];

  function next() {
    setIdx(i => filtered.length ? (i + 1) % filtered.length : 0);
  }
  function prev() {
    setIdx(i => filtered.length ? (i - 1 + filtered.length) % filtered.length : 0);
  }

  function speak(text, lang) {
    Speech.stop();
    let selectedVoice = lang === 'de' ? voiceDe : lang === 'en' ? voiceEn : voiceFa;
    let language = lang === 'de' ? 'de-DE' : lang === 'en' ? 'en-US' : dariTag;

    const options = {
      language: selectedVoice?.language || language,
      rate: lang === 'de' ? 0.78 : lang === 'en' ? 0.88 : 0.88,
      pitch: 1.0,
      onStart: () => setStatus(`Speaking ${lang.toUpperCase()} · ${selectedVoice ? voiceText(selectedVoice) : language}`),
      onDone: () => setStatus('Done.'),
      onStopped: () => setStatus('Stopped.'),
      onError: (err) => setStatus('Speech error: ' + String(err?.message || err || 'unknown'))
    };
    if (selectedVoice?.identifier) options.voice = selectedVoice.identifier;

    try {
      Speech.speak(String(text || ''), options);
    } catch (e) {
      setStatus('Speech failed: ' + String(e?.message || e));
    }
  }

  function speakCurrent(lang) {
    if (!card) return;
    if (lang === 'de') speak(displayGerman(card), 'de');
    if (lang === 'en') speak(displayEnglish(card), 'en');
    if (lang === 'fa') speak(displayDari(card), 'fa');
  }

  async function playSequence() {
    if (!card) return;
    const steps = [
      { text: displayGerman(card), lang: 'de' },
      ...(formText(card) ? [{ text: formText(card), lang: 'de' }] : []),
      { text: displayEnglish(card), lang: 'en' },
      { text: displayDari(card), lang: 'fa' }
    ];
    let i = 0;
    const playOne = () => {
      if (i >= steps.length) { next(); return; }
      const s = steps[i++];
      let selectedVoice = s.lang === 'de' ? voiceDe : s.lang === 'en' ? voiceEn : voiceFa;
      const options = {
        language: selectedVoice?.language || (s.lang === 'de' ? 'de-DE' : s.lang === 'en' ? 'en-US' : dariTag),
        rate: s.lang === 'de' ? 0.78 : s.lang === 'en' ? 0.88 : 0.88,
        pitch: 1,
        onStart: () => setStatus(`Sequence: ${s.lang.toUpperCase()} ${i}/${steps.length}`),
        onDone: () => setTimeout(playOne, 500),
        onError: () => setTimeout(playOne, 500)
      };
      if (selectedVoice?.identifier) options.voice = selectedVoice.identifier;
      Speech.speak(String(s.text || ''), options);
    };
    Speech.stop();
    playOne();
  }

  function frontDisplay() {
    if (!card) return '—';
    if (front === 'english') return displayEnglish(card);
    if (front === 'dari') return displayDari(card);
    if (front === 'forms') return formText(card) || 'No plural/forms';
    return displayGerman(card);
  }

  const deCandidates = candidateVoices(voices, 'de');
  const enCandidates = candidateVoices(voices, 'en');
  const faCandidates = candidateVoices(voices, 'fa');
  const allManual = voices || [];
  const dariTags = ['fa-IR', 'fa-AF', 'fa', 'prs-AF', 'prs', 'fa-Arab-IR', 'fa-Arab-AF'];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="auto" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.version}>{VERSION}</Text>
          <Text style={styles.title}>B2 + B1 Plus Flashcards</Text>
          <Text style={styles.subtitle}>Native mobile speech — not browser Web Speech</Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.status}>{status}</Text>
          <View style={styles.row}>
            <Button label="Refresh native voices" onPress={refreshVoices} />
            <Button label={showVoices ? 'Hide voices' : 'Show voices'} onPress={() => setShowVoices(v => !v)} secondary />
          </View>
          <Text style={styles.voiceLine}>German: {voiceText(voiceDe)}</Text>
          <Text style={styles.voiceLine}>English: {voiceText(voiceEn)}</Text>
          <Text style={styles.voiceLine}>Dari/Farsi: {voiceText(voiceFa)} · tag {dariTag}</Text>
        </View>

        {showVoices && (
          <View style={styles.panel}>
            <Text style={styles.sectionTitle}>Dari/Farsi native voice candidates</Text>
            {faCandidates.length === 0 && <Text style={styles.warning}>No Persian/Farsi/Dari native voice was detected. Try tag-only tests below or install Persian voice in iOS settings.</Text>}
            {faCandidates.map(v => (
              <VoiceButton key={v.identifier || voiceText(v)} voice={v} onPress={() => { setVoiceFa(v); speak('دیپارتمنت، بخش. سلام، این صدای دری و فارسی است.', 'fa'); }} />
            ))}
            <Text style={styles.sectionTitle}>Dari/Farsi language tag tests</Text>
            <View style={styles.wrap}>
              {dariTags.map(t => <Button key={t} label={t} onPress={() => { setVoiceFa(null); setDariTag(t); setTimeout(() => speak('دیپارتمنت، بخش. سلام، این صدای دری و فارسی است.', 'fa'), 80); }} secondary />)}
            </View>
            <Text style={styles.sectionTitle}>Manual all voices test</Text>
            {allManual.slice(0, 80).map(v => (
              <VoiceButton key={'all'+(v.identifier || voiceText(v))} voice={v} onPress={() => { setVoiceFa(v); speak('دیپارتمنت، بخش. سلام، این صدای دری و فارسی است.', 'fa'); }} small />
            ))}
          </View>
        )}

        <View style={styles.panel}>
          <TextInput style={styles.search} value={query} onChangeText={t => { setQuery(t); setIdx(0); }} placeholder="Search German / English / Dari" />
          <Text style={styles.counter}>{Math.min(idx + 1, filtered.length)} / {filtered.length}</Text>

          <View style={styles.card}>
            <Text style={styles.frontLabel}>{front.toUpperCase()}</Text>
            <Text style={[styles.cardText, front === 'dari' && styles.rtl]}>{frontDisplay()}</Text>
            <Text style={styles.meta}>{card?.list} · {card?.unit} · {card?.category}</Text>
          </View>

          <View style={styles.wrap}>
            <Button label="German front" onPress={() => setFront('german')} secondary={front !== 'german'} />
            <Button label="English front" onPress={() => setFront('english')} secondary={front !== 'english'} />
            <Button label="Dari front" onPress={() => setFront('dari')} secondary={front !== 'dari'} />
            <Button label="Forms front" onPress={() => setFront('forms')} secondary={front !== 'forms'} />
          </View>

          <View style={styles.row}>
            <Button label="Prev" onPress={prev} secondary />
            <Button label="Next" onPress={next} secondary />
          </View>
          <View style={styles.wrap}>
            <Button label="Speak German" onPress={() => speakCurrent('de')} />
            <Button label="Speak English" onPress={() => speakCurrent('en')} />
            <Button label="Speak Dari" onPress={() => speakCurrent('fa')} />
            <Button label="Play sequence" onPress={playSequence} />
            <Button label="Stop" onPress={() => { Speech.stop(); setStatus('Stopped.'); }} secondary />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function VoiceButton({ voice, onPress, small }) {
  return (
    <Pressable style={[styles.voiceButton, small && styles.voiceButtonSmall]} onPress={onPress}>
      <Text style={styles.voiceButtonText}>{voiceText(voice)}</Text>
    </Pressable>
  );
}

function Button({ label, onPress, secondary }) {
  return (
    <Pressable style={[styles.button, secondary && styles.secondaryButton]} onPress={onPress}>
      <Text style={[styles.buttonText, secondary && styles.secondaryButtonText]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f7fb' },
  container: { padding: 14, paddingBottom: 40 },
  header: { backgroundColor: '#fff', borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#dce3ef' },
  version: { alignSelf: 'flex-end', fontStyle: 'italic', color: '#667085', fontSize: 12 },
  title: { fontSize: 24, fontWeight: '800', color: '#172033' },
  subtitle: { color: '#5d6b82', marginTop: 4 },
  panel: { backgroundColor: '#fff', borderRadius: 18, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#dce3ef' },
  status: { backgroundColor: '#fff8df', borderColor: '#ead793', borderWidth: 1, padding: 10, borderRadius: 12, color: '#473b11', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  button: { backgroundColor: '#23407a', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, marginBottom: 4 },
  buttonText: { color: '#fff', fontWeight: '700' },
  secondaryButton: { backgroundColor: '#eef3ff' },
  secondaryButtonText: { color: '#23407a' },
  voiceLine: { color: '#344054', marginTop: 4 },
  warning: { color: '#9a3412', backgroundColor: '#fff7ed', borderColor: '#fed7aa', borderWidth: 1, padding: 10, borderRadius: 12 },
  sectionTitle: { fontWeight: '800', fontSize: 16, marginTop: 12, marginBottom: 8, color: '#18233a' },
  voiceButton: { backgroundColor: '#eef3ff', borderColor: '#bfd0ff', borderWidth: 1, borderRadius: 12, padding: 10, marginBottom: 7 },
  voiceButtonSmall: { padding: 8 },
  voiceButtonText: { color: '#203864', fontWeight: '600' },
  search: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#dce3ef', borderRadius: 12, padding: 12, marginBottom: 8 },
  counter: { color: '#667085', textAlign: 'right' },
  card: { minHeight: 180, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', borderRadius: 18, borderWidth: 1, borderColor: '#dce3ef', padding: 18, marginTop: 10 },
  frontLabel: { color: '#667085', fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  cardText: { fontSize: 31, color: '#111827', textAlign: 'center', fontWeight: '800' },
  rtl: { writingDirection: 'rtl', textAlign: 'center' },
  meta: { color: '#667085', marginTop: 14, textAlign: 'center' }
});

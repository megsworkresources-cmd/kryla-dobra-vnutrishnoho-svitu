import { getState } from './store';
import type { CharId } from '@/content/characters';

/**
 * Character voices and narration. "natural" uses Lovable AI voices with a warm Ukrainian delivery
 * (only app-written lines are sent, never anything the child types); "device" uses built-in speech.
 * Falls back to device speech if a natural voice can't be fetched. Obeys sound settings.
 */
type Voice = { voice: string; pitch: number };
const CAST: Record<CharId, Voice> = {
  solomiya: { voice: 'Leda', pitch: 1.15 },
  olenka: { voice: 'Aoede', pitch: 1.15 },
  daryna: { voice: 'Zephyr', pitch: 1.15 },
  taras: { voice: 'Puck', pitch: 0.95 },
  marko: { voice: 'Orus', pitch: 0.95 },
  lihtaryk: { voice: 'Fenrir', pitch: 1.4 },
};
export const characterVoice = (who: CharId) => CAST[who];

export function voices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const all = window.speechSynthesis.getVoices();
  const uk = all.filter((v) => v.lang.startsWith('uk'));
  return uk.length ? uk : all.filter((v) => /^(ru|pl|en)/.test(v.lang)).slice(0, 6);
}

const cache = new Map<string, string>(); // in-memory only
let audio: HTMLAudioElement | null = null;
let token = 0;

function deviceSpeak(text: string, pitch: number) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const s = getState();
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = s.lang === 'uk' ? 'uk-UA' : 'en-US'; u.rate = 0.85; u.pitch = pitch; u.volume = Math.min(1, Math.max(0.1, s.volume * 1.6));
  const all = window.speechSynthesis.getVoices();
  const sameLang = all.filter((x) => x.lang.toLowerCase().replace('_', '-').startsWith(s.lang));
  const v = (s.voiceURI && sameLang.find((x) => x.voiceURI === s.voiceURI)) ?? sameLang[0] ?? all.find((x) => x.lang.startsWith('uk'));
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

export function speak(text: string, opts: { force?: boolean; pitch?: number; who?: CharId; voice?: string } = {}) {
  if (typeof window === 'undefined') return;
  const s = getState();
  if (!s.sound || (!s.voice && !opts.force)) return;
  stopSpeaking();
  const c = opts.who ? CAST[opts.who] : null;
  const pitch = opts.pitch ?? c?.pitch ?? 1.05;
  if (s.voiceEngine !== 'natural') return deviceSpeak(text, pitch);
  const voice = opts.voice ?? c?.voice ?? s.narrator ?? 'Leda';
  const style = opts.who ?? 'narrator';
  const key = `${s.lang}|${voice}|${text}`;
  const my = ++token;
  const play = (b64: string) => {
    if (my !== token) return;
    audio = new Audio(`data:audio/wav;base64,${b64}`);
    audio.volume = Math.min(1, Math.max(0.1, s.volume * 1.6));
    void audio.play().catch(() => {});
  };
  const hit = cache.get(key);
  if (hit) return play(hit);
  void import('./voice.functions').then(({ speakNatural }) =>
    speakNatural({ data: { text, voice: voice as never, lang: s.lang, style } }))
    .then((r) => {
      if (r.ok) { cache.set(key, r.audio); play(r.audio); }
      else if (my === token) deviceSpeak(text, pitch);
    })
    .catch(() => { if (my === token) deviceSpeak(text, pitch); });
}

export function pauseSpeaking() { audio?.pause(); if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.pause(); }
export function resumeSpeaking() { void audio?.play().catch(() => {}); if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.resume(); }
export function stopSpeaking() {
  token++;
  if (audio) { audio.pause(); audio = null; }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

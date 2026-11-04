import { getState } from './store';

/** Character voices and narration via the device's built-in speech. Obeys sound settings. */
export function voices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const all = window.speechSynthesis.getVoices();
  const uk = all.filter((v) => v.lang.startsWith('uk'));
  return uk.length ? uk : all.filter((v) => /^(ru|pl|en)/.test(v.lang)).slice(0, 6);
}

export function speak(text: string, opts: { force?: boolean; pitch?: number } = {}) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const s = getState();
  if (!s.sound || (!s.voice && !opts.force)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'uk-UA'; u.rate = 0.85; u.pitch = opts.pitch ?? 1.05; u.volume = Math.max(0.1, s.volume * 1.6 > 1 ? 1 : s.volume * 1.6);
  const all = window.speechSynthesis.getVoices();
  const v = all.find((x) => x.voiceURI === s.voiceURI) ?? all.find((x) => x.lang.startsWith('uk'));
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

export function pauseSpeaking() { if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.pause(); }
export function resumeSpeaking() { if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.resume(); }
export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
}

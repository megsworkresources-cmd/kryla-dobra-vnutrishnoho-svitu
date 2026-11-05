/**
 * Original sound identity, synthesised in the browser (no files to download).
 * Nothing plays until the child has touched the screen, and every sound obeys the saved settings.
 */
import { getState } from './store';

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let unlocked = false;

function ac() {
  if (typeof window === 'undefined' || !unlocked) return null;
  if (!ctx) { ctx = new AudioContext(); master = ctx.createGain(); master.connect(ctx.destination); }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}
export function unlockAudio() { unlocked = true; ac(); syncVolume(); }

export function syncVolume() {
  const s = getState();
  if (master && ctx) master.gain.setTargetAtTime(s.sound ? s.volume : 0, ctx.currentTime, 0.05);
  if (!s.sound || !s.music) stopAmbient();
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.18, out?: AudioNode) {
  const c = ac(); if (!c || !master) return;
  const o = c.createOscillator(); const g = c.createGain(); const f = c.createBiquadFilter();
  f.type = 'lowpass'; f.frequency.value = 2200;
  o.type = type; o.frequency.value = freq;
  const t = c.currentTime + start;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f).connect(g).connect(out ?? master); o.start(t); o.stop(t + dur + 0.05);
}

/* Plucked string (Karplus–Strong), cached per pitch — bandura / tsymbaly timbre. */
const pluckCache = new Map<string, AudioBuffer>();
function pluckBuffer(c: AudioContext, freq: number, bright: number, secs: number) {
  const key = `${Math.round(freq)}-${bright}-${secs}`;
  const hit = pluckCache.get(key); if (hit) return hit;
  const sr = c.sampleRate; const len = Math.floor(sr * secs); const buf = c.createBuffer(1, len, sr); const d = buf.getChannelData(0);
  const period = Math.max(2, Math.round(sr / freq)); const ring = new Float32Array(period);
  for (let i = 0; i < period; i++) ring[i] = (Math.random() * 2 - 1) * (0.5 + 0.5 * Math.sin((i / period) * Math.PI));
  const damp = 0.996 - (1 - bright) * 0.004;
  for (let i = 0, j = 0; i < len; i++) { const n = (j + 1) % period; const v = ring[j]!; ring[j] = damp * (bright * v + (1 - bright) * 0.5 * (v + ring[n]!)); d[i] = v; j = n; }
  pluckCache.set(key, buf); return buf;
}
function pluck(freq: number, when: number, vol: number, out: AudioNode, bright = 0.5, secs = 2.2) {
  const c = ac(); if (!c) return;
  const src = c.createBufferSource(); src.buffer = pluckBuffer(c, freq, bright, secs);
  const g = c.createGain(); g.gain.value = vol; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1800 + bright * 2500;
  src.connect(f).connect(g).connect(out); src.start(when);
}
/* Sopilka (wooden flute): soft sine with gentle vibrato and breath. */
function flute(freq: number, when: number, dur: number, vol: number, out: AudioNode) {
  const c = ac(); if (!c) return;
  const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = freq;
  const o2 = c.createOscillator(); o2.type = 'triangle'; o2.frequency.value = freq * 2; const g2 = c.createGain(); g2.gain.value = 0.12;
  const vib = c.createOscillator(); vib.frequency.value = 5; const vg = c.createGain(); vg.gain.setValueAtTime(0, when); vg.gain.linearRampToValueAtTime(freq * 0.006, when + 0.35);
  vib.connect(vg).connect(o.frequency);
  const g = c.createGain(); g.gain.setValueAtTime(0, when); g.gain.linearRampToValueAtTime(vol, when + 0.08); g.gain.setValueAtTime(vol, when + dur * 0.7); g.gain.exponentialRampToValueAtTime(0.0001, when + dur + 0.25);
  o.connect(g); o2.connect(g2).connect(g); g.connect(out);
  [o, o2, vib].forEach((x) => { x.start(when); x.stop(when + dur + 0.3); });
}

export type Sfx = 'tap' | 'select' | 'confirm' | 'page' | 'complete' | 'soft';
/** Very soft, low, rounded sounds — like a tiny wooden drop or a single quiet string. */
export function sfx(kind: Sfx) {
  const s = getState(); if (!s.sound || !s.sfx) return;
  const c = ac(); if (!c || !master) return;
  const t = c.currentTime;
  switch (kind) {
    case 'tap': tone(520, 0, 0.12, 'sine', 0.035); break;
    case 'soft': tone(392, 0, 0.25, 'sine', 0.03); break;
    case 'select': pluck(587, t, 0.12, master, 0.25, 0.8); break;
    case 'page': pluck(440, t, 0.08, master, 0.2, 0.8); break;
    case 'confirm': pluck(440, t, 0.12, master, 0.3, 1.2); pluck(659, t + 0.1, 0.1, master, 0.3, 1.2); break;
    case 'complete': [440, 523, 659, 880].forEach((f, i) => pluck(f, t + i * 0.16, 0.14, master!, 0.35, 2)); break;
  }
}

/* ---------- Ambient soundscapes ---------- */
export type Ambient = 'meadow' | 'forest' | 'night' | 'clouds' | 'garden' | 'cozy';
let amb: { kind: Ambient; style: string; stop: () => void } | null = null;

function noise(c: AudioContext) {
  const b = c.createBuffer(1, c.sampleRate * 3, c.sampleRate); const d = b.getChannelData(0);
  let last = 0; for (let i = 0; i < d.length; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
  const src = c.createBufferSource(); src.buffer = b; src.loop = true; return src;
}

export function playAmbient(kind: Ambient | null) {
  const s = getState();
  if (!kind || !s.sound || !s.music) { stopAmbient(); return; }
  if (amb?.kind === kind && amb.style === s.musicStyle) return;
  stopAmbient();
  const c = ac(); if (!c || !master) return;
  const bus = c.createGain(); bus.gain.setValueAtTime(0, c.currentTime); bus.gain.linearRampToValueAtTime(0.35, c.currentTime + 3); bus.connect(master);
  const stops: (() => void)[] = [];
  // soft wind / air bed
  const n = noise(c); const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = kind === 'night' ? 300 : 600;
  const ng = c.createGain(); ng.gain.value = kind === 'cozy' ? 0.08 : 0.16; n.connect(f).connect(ng).connect(bus); n.start(); stops.push(() => n.stop());
  stops.push(startMusic(bus, s.musicStyle ?? 'bandura', kind === 'night'));
  // occasional nature voices
  const timer = window.setInterval(() => {
    if (!ctx) return; const t = ctx.currentTime;
    const chirp = (base: number, count: number, gap: number, vol: number) => { for (let k = 0; k < count; k++) { const o = ctx!.createOscillator(); const g = ctx!.createGain(); o.frequency.setValueAtTime(base, t + k * gap); o.frequency.exponentialRampToValueAtTime(base * 1.3, t + k * gap + 0.08); g.gain.setValueAtTime(0, t + k * gap); g.gain.linearRampToValueAtTime(vol, t + k * gap + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + k * gap + 0.12); o.connect(g).connect(bus); o.start(t + k * gap); o.stop(t + k * gap + 0.15); } };
    if (Math.random() > 0.5) return;
    if (kind === 'night') chirp(3800, 5, 0.07, 0.006);
    else if (kind === 'meadow' || kind === 'garden' || kind === 'forest') chirp(2400 + Math.random() * 1200, 3, 0.12, 0.012);
    else chirp(1200, 1, 0, 0.008);
  }, 2500);
  stops.push(() => window.clearInterval(timer));
  amb = { kind, style: s.musicStyle, stop: () => { bus.gain.setTargetAtTime(0, c.currentTime, 0.4); window.setTimeout(() => { stops.forEach((x) => { try { x(); } catch { /* already stopped */ } }); bus.disconnect(); }, 1500); } };
}
/* ---------- Light Ukrainian-style instrumentals (original tunes, synthesised) ---------- */
export type MusicStyle = 'bandura' | 'sopilka' | 'tsymbaly' | 'lullaby' | 'nature';
export const MUSIC_STYLES: { id: MusicStyle; name: string; hint: string }[] = [
  { id: 'bandura', name: 'Бандура', hint: 'Ніжні перебори струн' },
  { id: 'sopilka', name: 'Сопілка', hint: 'Легка дерев’яна флейта над бандурою' },
  { id: 'tsymbaly', name: 'Цимбали', hint: 'Дзвінкі, грайливі молоточки' },
  { id: 'lullaby', name: 'Колискова', hint: 'Повільно й тихо, як перед сном' },
  { id: 'nature', name: 'Лише природа', hint: 'Вітерець і пташки, без мелодії' },
];
// D Ukrainian Dorian (D E F G# A B C) — the characteristic folk colour.
const SC = [146.83, 164.81, 174.61, 207.65, 220, 246.94, 261.63];
const note = (deg: number) => SC[((deg % 7) + 7) % 7]! * 2 ** Math.floor(deg / 7);
// Phrases as [scale degree, beats]; -99 = rest. Original melodies in a folk character.
const PHRASES: [number, number][][] = [
  [[7, 1], [9, 1], [10, 1], [11, 2], [10, 1], [9, 1], [7, 2], [-99, 1]],
  [[11, 1], [12, 1], [11, 1], [10, 1], [9, 2], [8, 1], [7, 3]],
  [[4, 1], [7, 1], [9, 1], [8, 1], [7, 1], [6, 1], [7, 2], [-99, 1]],
  [[9, 1.5], [10, 0.5], [11, 1], [9, 1], [8, 1], [7, 1], [6, 1], [7, 2]],
];
const BASS = [0, 0, 3, 4, 0, 4, 3, 0];

export function startMusic(bus: AudioNode, style: MusicStyle, night: boolean) {
  const c = ac(); if (!c || style === 'nature') return () => {};
  const tempo = style === 'lullaby' || night ? 0.75 : style === 'tsymbaly' ? 0.42 : 0.55; // seconds per beat
  let next = c.currentTime + 0.5; let pi = 0; let bar = 0;
  const schedule = () => {
    if (!ctx) return;
    while (next < ctx.currentTime + 2) {
      const phrase = PHRASES[pi % PHRASES.length]!; let t = next;
      const shift = style === 'lullaby' ? -7 : 0;
      for (const [deg, beats] of phrase) {
        if (deg !== -99) {
          const f = note(deg + shift);
          if (style === 'sopilka') flute(f * 2, t, beats * tempo * 0.95, 0.05, bus);
          else if (style === 'tsymbaly') { pluck(f * 2, t, 0.09, bus, 0.85, 1.6); pluck(f * 2, t + 0.07, 0.04, bus, 0.85, 1.2); }
          else pluck(f, t, style === 'lullaby' ? 0.12 : 0.15, bus, 0.45, 2.4);
        }
        t += beats * tempo;
      }
      // gentle bandura bass / arpeggio underneath
      const total = phrase.reduce((n, [, b]) => n + b, 0);
      for (let b = 0; b < total; b += 2) {
        const root = BASS[bar++ % BASS.length]! - 7;
        pluck(note(root), next + b * tempo, 0.1, bus, 0.3, 2.6);
        if (style !== 'lullaby') pluck(note(root + 4), next + (b + 1) * tempo, 0.06, bus, 0.3, 1.8);
      }
      next = t + tempo; pi++;
    }
  };
  schedule();
  const id = window.setInterval(schedule, 500);
  return () => window.clearInterval(id);
}

export function stopAmbient() { amb?.stop(); amb = null; }

export function ambientFor(pathname: string): Ambient | null {
  const seg = pathname.split('/')[1] ?? '';
  return ({ meadow: 'meadow', forest: 'forest', sky: 'night', clouds: 'clouds', garden: 'garden', world: 'garden', '': 'garden', safe: 'cozy', studio: 'cozy', path: 'meadow' } as Record<string, Ambient>)[seg] ?? null;
}

/** One soft plucked note for musical games (pentatonic friendly). */
export function note(freq: number) {
  const s = getState(); if (!s.sound || !s.sfx) return;
  const c = ac(); if (!c || !master) return;
  pluck(freq, c.currentTime, 0.12, master, 0.3, 1.5);
}

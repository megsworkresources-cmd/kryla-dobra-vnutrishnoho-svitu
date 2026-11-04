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

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.18) {
  const c = ac(); if (!c || !master) return;
  const o = c.createOscillator(); const g = c.createGain();
  o.type = type; o.frequency.value = freq;
  const t = c.currentTime + start;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.05);
}

export type Sfx = 'tap' | 'select' | 'confirm' | 'page' | 'complete' | 'soft';
export function sfx(kind: Sfx) {
  const s = getState(); if (!s.sound || !s.sfx) return;
  switch (kind) {
    case 'tap': tone(880, 0, 0.09, 'triangle', 0.08); break;
    case 'select': tone(660, 0, 0.12, 'sine', 0.12); tone(990, 0.06, 0.14, 'sine', 0.08); break;
    case 'confirm': tone(523, 0, 0.18); tone(784, 0.09, 0.22); break;
    case 'page': [392, 523, 659].forEach((f, i) => tone(f, i * 0.05, 0.25, 'sine', 0.05)); break;
    case 'soft': tone(440, 0, 0.3, 'sine', 0.06); break;
    case 'complete': [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.12, 0.6, 'triangle', 0.12)); tone(1568, 0.55, 0.9, 'sine', 0.05); break;
  }
}

/* ---------- Ambient soundscapes ---------- */
export type Ambient = 'meadow' | 'forest' | 'night' | 'clouds' | 'garden' | 'cozy';
let amb: { kind: Ambient; stop: () => void } | null = null;

function noise(c: AudioContext) {
  const b = c.createBuffer(1, c.sampleRate * 3, c.sampleRate); const d = b.getChannelData(0);
  let last = 0; for (let i = 0; i < d.length; i++) { last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = last * 3.5; }
  const src = c.createBufferSource(); src.buffer = b; src.loop = true; return src;
}

export function playAmbient(kind: Ambient | null) {
  const s = getState();
  if (!kind || !s.sound || !s.music) { stopAmbient(); return; }
  if (amb?.kind === kind) return;
  stopAmbient();
  const c = ac(); if (!c || !master) return;
  const bus = c.createGain(); bus.gain.setValueAtTime(0, c.currentTime); bus.gain.linearRampToValueAtTime(0.35, c.currentTime + 3); bus.connect(master);
  const stops: (() => void)[] = [];
  // soft wind / air bed
  const n = noise(c); const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = kind === 'night' ? 300 : 600;
  const ng = c.createGain(); ng.gain.value = kind === 'cozy' ? 0.15 : 0.35; n.connect(f).connect(ng).connect(bus); n.start(); stops.push(() => n.stop());
  // warm pad (pentatonic chord, slowly breathing)
  const chord = kind === 'night' ? [196, 247, 294] : kind === 'clouds' ? [262, 330, 392] : [220, 277, 330];
  chord.forEach((fr, i) => {
    const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = fr;
    const g = c.createGain(); g.gain.value = 0.03;
    const l = c.createOscillator(); l.frequency.value = 0.05 + i * 0.03; const lg = c.createGain(); lg.gain.value = 0.02;
    l.connect(lg).connect(g.gain); o.connect(g).connect(bus); o.start(); l.start(); stops.push(() => { o.stop(); l.stop(); });
  });
  // occasional nature voices
  const timer = window.setInterval(() => {
    if (!ctx) return; const t = ctx.currentTime;
    const chirp = (base: number, count: number, gap: number, vol: number) => { for (let k = 0; k < count; k++) { const o = ctx!.createOscillator(); const g = ctx!.createGain(); o.frequency.setValueAtTime(base, t + k * gap); o.frequency.exponentialRampToValueAtTime(base * 1.3, t + k * gap + 0.08); g.gain.setValueAtTime(0, t + k * gap); g.gain.linearRampToValueAtTime(vol, t + k * gap + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + k * gap + 0.12); o.connect(g).connect(bus); o.start(t + k * gap); o.stop(t + k * gap + 0.15); } };
    if (Math.random() > 0.5) return;
    if (kind === 'night') chirp(4200, 6, 0.06, 0.015);
    else if (kind === 'meadow' || kind === 'garden' || kind === 'forest') chirp(2400 + Math.random() * 1200, 3, 0.12, 0.03);
    else chirp(1200, 1, 0, 0.02);
  }, 2500);
  stops.push(() => window.clearInterval(timer));
  amb = { kind, stop: () => { bus.gain.setTargetAtTime(0, c.currentTime, 0.4); window.setTimeout(() => { stops.forEach((x) => { try { x(); } catch { /* already stopped */ } }); bus.disconnect(); }, 1500); } };
}
export function stopAmbient() { amb?.stop(); amb = null; }

export function ambientFor(pathname: string): Ambient | null {
  const seg = pathname.split('/')[1] ?? '';
  return ({ meadow: 'meadow', forest: 'forest', sky: 'night', clouds: 'clouds', garden: 'garden', world: 'garden', '': 'garden', safe: 'cozy', studio: 'cozy', path: 'meadow' } as Record<string, Ambient>)[seg] ?? null;
}

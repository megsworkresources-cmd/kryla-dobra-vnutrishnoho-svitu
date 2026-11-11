/**
 * Recorded Ukrainian instrumental soundscapes with soft synthesised interface sounds.
 * Nothing plays until the child has touched the screen, and every sound obeys the saved settings.
 */
import { useSyncExternalStore } from "react";
import { getState } from "./store";
import banduraTrack from "@/assets/audio/quiet-bandura.mp3.asset.json";
import sopilkaTrack from "@/assets/audio/quiet-sopilka.mp3.asset.json";
import tsymbalyTrack from "@/assets/audio/quiet-tsymbaly.mp3.asset.json";
import lullabyTrack from "@/assets/audio/quiet-lullaby.mp3.asset.json";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let unlocked = false;

function ac() {
  if (typeof window === "undefined" || !unlocked) return null;
  if (!("AudioContext" in window)) return null;
  if (!ctx) {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") void ctx.resume().catch(() => {});
  return ctx;
}
export function unlockAudio() {
  unlocked = true;
  ac();
  syncVolume();
}
export function isAudioUnlocked() {
  return unlocked;
}

export function syncVolume() {
  const s = getState();
  if (master && ctx) master.gain.setTargetAtTime(s.sound ? s.volume : 0, ctx.currentTime, 0.05);
  if (amb && ctx) amb.bus.gain.setTargetAtTime(0.35 * s.musicVolume, ctx.currentTime, 0.05);
  if (!s.sound || !s.music || s.volume === 0 || s.musicVolume === 0) stopAmbient();
}

function tone(
  freq: number,
  start: number,
  dur: number,
  type: OscillatorType = "sine",
  vol = 0.18,
  out?: AudioNode,
) {
  const c = ac();
  if (!c || !master) return;
  const o = c.createOscillator();
  const g = c.createGain();
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 2200;
  o.type = type;
  o.frequency.value = freq;
  const t = c.currentTime + start;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol * getState().effectsVolume, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(f)
    .connect(g)
    .connect(out ?? master);
  o.start(t);
  o.stop(t + dur + 0.05);
}

/* Plucked string (Karplus–Strong), cached per pitch — bandura / tsymbaly timbre. */
const pluckCache = new Map<string, AudioBuffer>();
function pluckBuffer(c: AudioContext, freq: number, bright: number, secs: number) {
  const key = `${Math.round(freq)}-${bright}-${secs}`;
  const hit = pluckCache.get(key);
  if (hit) return hit;
  const sr = c.sampleRate;
  const len = Math.floor(sr * secs);
  const buf = c.createBuffer(1, len, sr);
  const d = buf.getChannelData(0);
  const period = Math.max(2, Math.round(sr / freq));
  const ring = new Float32Array(period);
  for (let i = 0; i < period; i++)
    ring[i] = (Math.random() * 2 - 1) * (0.5 + 0.5 * Math.sin((i / period) * Math.PI));
  const damp = 0.996 - (1 - bright) * 0.004;
  for (let i = 0, j = 0; i < len; i++) {
    const n = (j + 1) % period;
    const v = ring[j] ?? 0;
    ring[j] = damp * (bright * v + (1 - bright) * 0.5 * (v + (ring[n] ?? 0)));
    d[i] = v;
    j = n;
  }
  pluckCache.set(key, buf);
  return buf;
}
function pluck(freq: number, when: number, vol: number, out: AudioNode, bright = 0.5, secs = 2.2) {
  const c = ac();
  if (!c) return;
  const src = c.createBufferSource();
  src.buffer = pluckBuffer(c, freq, bright, secs);
  const g = c.createGain();
  g.gain.value = vol * getState().effectsVolume;
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = 1800 + bright * 2500;
  src.connect(f).connect(g).connect(out);
  src.start(when);
}
export type Sfx = "tap" | "select" | "confirm" | "page" | "complete" | "soft";
/** Very soft, low, rounded sounds — like a tiny wooden drop or a single quiet string. */
export function sfx(kind: Sfx) {
  const s = getState();
  if (!s.sound || !s.sfx || s.volume === 0 || s.effectsVolume === 0) return;
  const c = ac();
  if (!c || !master) return;
  const t = c.currentTime;
  switch (kind) {
    case "tap":
      tone(520, 0, 0.12, "sine", 0.035);
      break;
    case "soft":
      tone(392, 0, 0.25, "sine", 0.03);
      break;
    case "select":
      pluck(587, t, 0.12, master, 0.25, 0.8);
      break;
    case "page":
      pluck(440, t, 0.08, master, 0.2, 0.8);
      break;
    case "confirm":
      pluck(440, t, 0.12, master, 0.3, 1.2);
      pluck(659, t + 0.1, 0.1, master, 0.3, 1.2);
      break;
    case "complete":
      const output = master;
      [440, 523, 659, 880].forEach((f, i) => pluck(f, t + i * 0.16, 0.14, output, 0.35, 2));
      break;
  }
}

/* ---------- Ambient soundscapes ---------- */
export type Ambient = "meadow" | "forest" | "night" | "clouds" | "garden" | "cozy";
let amb: { kind: Ambient; style: string; bus: GainNode; stop: () => void } | null = null;
export type MusicStatus = "idle" | "loading" | "playing" | "error";
let musicStatus: MusicStatus = "idle";
const statusListeners = new Set<() => void>();
function setMusicStatus(value: MusicStatus) {
  musicStatus = value;
  statusListeners.forEach((listener) => listener());
}
export function useMusicStatus() {
  return useSyncExternalStore((listener) => {
    statusListeners.add(listener);
    return () => statusListeners.delete(listener);
  }, () => musicStatus, () => "idle" as MusicStatus);
}

function noise(c: AudioContext) {
  const b = c.createBuffer(1, c.sampleRate * 3, c.sampleRate);
  const d = b.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    d[i] = last * 3.5;
  }
  const src = c.createBufferSource();
  src.buffer = b;
  src.loop = true;
  return src;
}

export function playAmbient(kind: Ambient | null) {
  const s = getState();
  if (!kind || !s.sound || !s.music || s.volume === 0 || s.musicVolume === 0 || document.hidden) {
    stopAmbient();
    return;
  }
  if (amb?.kind === kind && amb.style === s.musicStyle) return;
  stopAmbient();
  const c = ac();
  if (!c || !master) return;
  const bus = c.createGain();
  bus.gain.setValueAtTime(0, c.currentTime);
  bus.gain.linearRampToValueAtTime(0.35 * s.musicVolume, c.currentTime + 3);
  bus.connect(master);
  const stops: (() => void)[] = [];
  // soft wind / air bed
  const n = noise(c);
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = kind === "night" ? 300 : 600;
  const ng = c.createGain();
  ng.gain.value = kind === "cozy" ? 0.08 : 0.16;
  n.connect(f).connect(ng).connect(bus);
  n.start();
  stops.push(() => n.stop());
  stops.push(startMusic(bus, s.musicStyle ?? "bandura", kind === "night"));
  // occasional nature voices
  const timer = window.setInterval(() => {
    const current = ctx;
    if (!current) return;
    const t = current.currentTime;
    const chirp = (base: number, count: number, gap: number, vol: number) => {
      for (let k = 0; k < count; k++) {
        const o = current.createOscillator();
        const g = current.createGain();
        o.frequency.setValueAtTime(base, t + k * gap);
        o.frequency.exponentialRampToValueAtTime(base * 1.3, t + k * gap + 0.08);
        g.gain.setValueAtTime(0, t + k * gap);
        g.gain.linearRampToValueAtTime(vol, t + k * gap + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, t + k * gap + 0.12);
        o.connect(g).connect(bus);
        o.start(t + k * gap);
        o.stop(t + k * gap + 0.15);
      }
    };
    if (Math.random() > 0.5) return;
    if (kind === "night") chirp(3800, 5, 0.07, 0.006);
    else if (kind === "meadow" || kind === "garden" || kind === "forest")
      chirp(2400 + Math.random() * 1200, 3, 0.12, 0.012);
    else chirp(1200, 1, 0, 0.008);
  }, 2500);
  stops.push(() => window.clearInterval(timer));
  amb = {
    kind,
    style: s.musicStyle,
    bus,
    stop: () => {
      // Cancel pending recordings and nature timers immediately on exit or replacement.
      stops.forEach((stop) => { try { stop(); } catch { /* already stopped */ } });
      bus.disconnect();
    },
  };
}
/* ---------- Recorded Ukrainian instrumentals ---------- */
export type MusicStyle = "bandura" | "sopilka" | "tsymbaly" | "lullaby" | "nature";
export const MUSIC_STYLES: { id: MusicStyle; name: string; hint: string }[] = [
  { id: "bandura", name: "Бандура", hint: "Ніжні перебори струн" },
  { id: "sopilka", name: "Сопілка", hint: "Легка дерев’яна флейта над бандурою" },
  { id: "tsymbaly", name: "Цимбали", hint: "Дзвінкі, грайливі молоточки" },
  { id: "lullaby", name: "Колискова", hint: "Повільно й тихо, як перед сном" },
  { id: "nature", name: "Лише природа", hint: "Вітерець і пташки, без мелодії" },
];
const MUSIC_URLS: Record<Exclude<MusicStyle, "nature">, string> = {
  bandura: banduraTrack.url,
  sopilka: sopilkaTrack.url,
  tsymbaly: tsymbalyTrack.url,
  lullaby: lullabyTrack.url,
};
const trackCache = new Map<string, Promise<AudioBuffer>>();

function loadTrack(style: Exclude<MusicStyle, "nature">, c: AudioContext) {
  const hit = trackCache.get(style);
  if (hit) return hit;
  const request = fetch(MUSIC_URLS[style], { signal: AbortSignal.timeout(20000) })
    .then((r) => {
      if (!r.ok) throw new Error("music unavailable");
      return r.arrayBuffer();
    })
    .then((data) => c.decodeAudioData(data))
    .catch((error) => {
      if (trackCache.get(style) === request) trackCache.delete(style);
      throw error;
    });
  trackCache.set(style, request);
  // Bound decoded buffers on mobile; current sources retain their own buffer reference.
  if (trackCache.size > 2) {
    const oldest = trackCache.keys().next().value;
    if (oldest) trackCache.delete(oldest);
  }
  return request;
}

/** Never silently substitute a synthetic melody for an unavailable recording. */
export function startMusic(bus: AudioNode, style: MusicStyle, night: boolean) {
  const c = ac();
  if (!c || style === "nature") return () => {};
  let stopped = false;
  let source: AudioBufferSourceNode | null = null;
  let gain: GainNode | null = null;
  setMusicStatus("loading");
  void loadTrack(style, c)
    .then((buffer) => {
      if (stopped) return;
      source = c.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.loopStart = Math.min(0.08, buffer.duration / 10);
      source.loopEnd = Math.max(source.loopStart + 0.1, buffer.duration - 0.08);
      source.playbackRate.value = night ? 0.96 : 1;
      gain = c.createGain();
      gain.gain.value = 0.72;
      source.connect(gain).connect(bus);
      source.start();
      setMusicStatus("playing");
    })
    .catch(() => {
      if (!stopped) setMusicStatus("error");
    });
  return () => {
    stopped = true;

    if (source) {
      try { source.stop(); } catch { /* already stopped */ }
      source.disconnect();
    }
    gain?.disconnect();
  };
}

export function stopAmbient() {
  amb?.stop();
  amb = null;
  setMusicStatus("idle");
}

export function ambientFor(pathname: string): Ambient | null {
  const seg = pathname.split("/")[1] ?? "";
  return (
    (
      {
        meadow: "meadow",
        forest: "forest",
        sky: "night",
        clouds: "clouds",
        garden: "garden",
        world: "garden",
        settings: "garden",
        "": "garden",
        safe: "cozy",
        studio: "cozy",
        path: "meadow",
      } as Record<string, Ambient>
    )[seg] ?? null
  );
}

/** One soft plucked note for musical games (pentatonic friendly). */
export function chime(freq: number) {
  const s = getState();
  if (!s.sound || !s.sfx || s.volume === 0 || s.effectsVolume === 0) return;
  const c = ac();
  if (!c || !master) return;
  pluck(freq, c.currentTime, 0.12, master, 0.3, 1.5);
}

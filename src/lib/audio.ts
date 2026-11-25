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
let audioGeneration = 0;
let ambientGeneration = 0;
const unlockListeners = new Set<() => void>();
function notifyUnlocked() {
  unlockListeners.forEach((listener) => listener());
}
let scape: { kind: Soundscape; bus: GainNode; stop: () => void } | null = null;
let scapeKind: Soundscape | null = null;
const scapeListeners = new Set<() => void>();

function handleAudioStateChange(changedContext: AudioContext) {
  // Ignore events from a context that was closed and subsequently replaced.
  if (ctx !== changedContext) return;
  if (changedContext.state === "closed") {
    audioGeneration += 1;
    ambientGeneration += 1;
    stopAmbient();
    stopSoundscape();
    try {
      master?.disconnect();
    } catch {
      // already disconnected
    }
    master = null;
    ctx = null;
    return;
  }
  if (changedContext.state === "running") syncVolume();
}

function ac() {
  if (typeof window === "undefined" || !unlocked) return null;
  if (!getState().sound) return null;
  const AudioContextClass =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (ctx && ctx.state === "closed") {
    ctx = null;
    master = null;
  }
  if (!ctx) {
    try {
      // Larger buffers stop crackling on iPhone speakers.
      ctx = new AudioContextClass({ latencyHint: "playback" });
    } catch {
      return null;
    }
    master = ctx.createGain();
    master.connect(ctx.destination);
    const createdContext = ctx;
    createdContext.onstatechange = () => handleAudioStateChange(createdContext);
  }
  return ctx;
}

/** A phone interruption leaves the context suspended; ask for it again on the next sound. */
function ensureRunning(c: AudioContext) {
  if (c.state !== "running" && c.state !== "closed")
    void c.resume().catch(() => {
      if (c === ctx && musicStatus !== "idle") setMusicStatus("error");
    });
}

/**
 * Play an interface sound once the context is really running. The very first touch
 * on an iPhone can leave it suspended for a moment; scheduling a note then either
 * drops it or lets it arrive with the next tap, which is what made the games sound
 * broken. A refused interruption resume still surfaces on the music status.
 */
function whenSounding(play: (c: AudioContext, out: GainNode) => void) {
  const c = ac();
  const out = master;
  if (!c || !out) return;
  if (c.state === "running") {
    play(c, out);
    return;
  }
  const generation = audioGeneration;
  void c.resume().then(
    () => {
      if (c !== ctx || generation !== audioGeneration || c.state !== "running" || !master) return;
      play(c, master);
    },
    () => {
      if (musicStatus !== "idle") setMusicStatus("error");
    },
  );
}

/**
 * iPhone mutes Web Audio (music, taps) when the side switch is on silent unless the
 * page asks for a "playback" session (Safari 16.4+). Voices then also share it.
 */
function requestPlaybackSession() {
  const nav = navigator as Navigator & { audioSession?: { type: string } };
  try {
    if (nav.audioSession && nav.audioSession.type !== "playback")
      nav.audioSession.type = "playback";
  } catch {
    // older Safari: no audio session control
  }
}

export function unlockAudio() {
  if (typeof navigator !== "undefined") requestPlaybackSession();
  if (!unlocked) {
    unlocked = true;
    notifyUnlocked();
  }
  const context = ac();
  if (context && context.state !== "running" && context.state !== "closed")
    void context
      .resume()
      .then(() => {
        // The gesture unlocked the context: start the soundscape that was waiting for it.
        if (wantedAmbient && context === ctx) playAmbient(wantedAmbient);
      })
      .catch(() => {
        // Safari can reject resume outside a fresh gesture; surface it on the music status.
        if (musicStatus !== "idle") setMusicStatus("error");
      });
  syncVolume();
}

export function destroyAudio() {
  if (unlocked) {
    unlocked = false;
    notifyUnlocked();
  }
  audioGeneration += 1;
  ambientGeneration += 1;
  stopAmbient();
  stopSoundscape();
  if (master) {
    try {
      master.disconnect();
    } catch {
      // already disconnected
    }
    master = null;
  }
  const closingContext = ctx;
  ctx = null;
  if (closingContext) {
    closingContext.onstatechange = null;
    if (closingContext.state !== "closed")
      void closingContext.close().catch(() => {
        // Teardown only: a failed close has no user-visible effect, and the context is already detached.
      });
  }
}

export function isAudioUnlocked() {
  return unlocked;
}

/** True once a real gesture has unlocked sound, so pages know when they may speak. */
export function useAudioUnlocked() {
  return useSyncExternalStore(
    (listener) => {
      unlockListeners.add(listener);
      return () => unlockListeners.delete(listener);
    },
    () => unlocked,
    () => false,
  );
}

export function syncVolume() {
  const s = getState();
  if (master && ctx && ctx.state !== "closed")
    master.gain.setTargetAtTime(s.sound ? s.volume : 0, ctx.currentTime, 0.05);
  applyAmbientGain();
  if (scape && ctx && ctx.state !== "closed")
    scape.bus.gain.setTargetAtTime(0.5 * s.effectsVolume, ctx.currentTime, 0.08);
  if (!s.sound || !s.music || s.volume === 0 || s.musicVolume === 0) stopAmbient();
  if (!s.sound || s.volume === 0 || s.effectsVolume === 0) stopSoundscape();
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
  whenSounding((c, out) => {
    const t = c.currentTime;
    switch (kind) {
      case "tap":
        tone(520, 0, 0.12, "sine", 0.035);
        break;
      case "soft":
        tone(392, 0, 0.25, "sine", 0.03);
        break;
      case "select":
        pluck(587, t, 0.12, out, 0.25, 0.8);
        break;
      case "page":
        pluck(440, t, 0.08, out, 0.2, 0.8);
        break;
      case "confirm":
        pluck(440, t, 0.12, out, 0.3, 1.2);
        pluck(659, t + 0.1, 0.1, out, 0.3, 1.2);
        break;
      case "complete":
        [440, 523, 659, 880].forEach((f, i) => pluck(f, t + i * 0.16, 0.14, out, 0.35, 2));
        break;
    }
  });
}

/* ---------- Ambient soundscapes ---------- */
export type Ambient = "meadow" | "forest" | "night" | "clouds" | "garden" | "cozy";
let amb: { kind: Ambient; style: string; bus: GainNode; stop: () => void } | null = null;
/** The scene the page asked for, kept so a freshly unlocked context can start it. */
let wantedAmbient: Ambient | null = null;
let musicDucked = false;
export type MusicStatus = "idle" | "loading" | "playing" | "error";
let musicStatus: MusicStatus = "idle";
const statusListeners = new Set<() => void>();
function setMusicStatus(value: MusicStatus) {
  musicStatus = value;
  statusListeners.forEach((listener) => listener());
}
export function getMusicStatus(): MusicStatus {
  return musicStatus;
}
export function useMusicStatus() {
  return useSyncExternalStore(
    (listener) => {
      statusListeners.add(listener);
      return () => statusListeners.delete(listener);
    },
    () => musicStatus,
    () => "idle" as MusicStatus,
  );
}

/** Keep the background music under the voice so every word stays clear. */
function applyAmbientGain() {
  if (!amb || !ctx || ctx.state === "closed") return;
  amb.bus.gain.setTargetAtTime(
    0.6 * getState().musicVolume * (musicDucked ? 0.3 : 1),
    ctx.currentTime,
    0.12,
  );
}
export function duckMusic(on: boolean) {
  if (musicDucked === on) return;
  musicDucked = on;
  applyAmbientGain();
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
  wantedAmbient = kind;
  const s = getState();
  if (!kind || !s.sound || !s.music || s.volume === 0 || s.musicVolume === 0 || document.hidden) {
    stopAmbient();
    return;
  }
  // A recording that failed must be retryable when the child comes back to the page.
  if (amb?.kind === kind && amb.style === s.musicStyle && musicStatus !== "error") return;
  stopAmbient();
  const c = ac();
  if (!c || !master) return;
  ensureRunning(c);
  const token = ++ambientGeneration;
  const bus = c.createGain();
  bus.gain.setValueAtTime(0, c.currentTime);
  bus.gain.linearRampToValueAtTime(
    0.6 * s.musicVolume * (musicDucked ? 0.3 : 1),
    c.currentTime + 3,
  );
  bus.connect(master);
  const stops: (() => void)[] = [];
  const n = noise(c);
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = kind === "night" ? 300 : 600;
  const ng = c.createGain();
  ng.gain.value = kind === "cozy" ? 0.03 : 0.05;
  n.connect(f).connect(ng).connect(bus);
  n.start();
  stops.push(() => n.stop());
  stops.push(startMusic(bus, s.musicStyle ?? "bandura", kind === "night"));
  const timer = window.setInterval(() => {
    if (token !== ambientGeneration) return;
    const current = ctx;
    if (!current || current.state !== "running") return;
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
      // The generation is bumped by stopAmbient immediately, not here: this
      // stop may run 320ms later and must not invalidate the next scene.
      stops.forEach((stop) => {
        try {
          stop();
        } catch {
          /* already stopped */
        }
      });
      try {
        bus.disconnect();
      } catch {
        /* already disconnected */
      }
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
// Cache the shared fetch/decode promise independently of any one playback's lifetime.
// A caller stopping playback must not abort a load another caller is waiting on.
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
  if (trackCache.size > 2) {
    const oldest = trackCache.keys().next().value;
    if (oldest) trackCache.delete(oldest);
  }
  return request;
}

/** The first gesture can leave a fresh context suspended for a moment; wait for it. */
function whenRunning(c: AudioContext, generation: number, ms = 5000) {
  const ready = () => c.state === "running" && generation === audioGeneration;
  if (ready()) return Promise.resolve(true);
  return new Promise<boolean>((resolve) => {
    let settled = false;
    let timer = 0;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      if (typeof c.removeEventListener === "function") c.removeEventListener("statechange", check);
      window.clearTimeout(timer);
      resolve(ok && generation === audioGeneration);
    };
    const check = () => {
      if (c.state === "running") finish(true);
      else if (c.state === "closed") finish(false);
    };
    if (typeof c.addEventListener === "function") c.addEventListener("statechange", check);
    timer = window.setTimeout(() => finish(c.state === "running"), ms);
  });
}

/** Never silently substitute a synthetic melody for an unavailable recording. */
export function startMusic(bus: AudioNode, style: MusicStyle, _night: boolean) {
  const c = ac();
  if (!c || style === "nature") return () => {};
  const generation = audioGeneration;
  let stopped = false;
  let source: AudioBufferSourceNode | null = null;
  let gain: GainNode | null = null;
  setMusicStatus("loading");
  void loadTrack(style, c)
    .then(async (buffer) => {
      const running = await whenRunning(c, generation);
      if (stopped || generation !== audioGeneration || c !== ctx) return;
      if (!running) {
        setMusicStatus("error");
        return;
      }
      source = c.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.loopStart = Math.min(0.08, buffer.duration / 10);
      source.loopEnd = Math.max(source.loopStart + 0.1, buffer.duration - 0.08);
      gain = c.createGain();
      gain.gain.value = 1;
      source.connect(gain).connect(bus);
      source.start();
      setMusicStatus("playing");
    })
    .catch(() => {
      if (!stopped && generation === audioGeneration) setMusicStatus("error");
    });
  return () => {
    stopped = true;
    if (source) {
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
      source.disconnect();
    }
    gain?.disconnect();
  };
}

export function stopAmbient() {
  const current = amb;
  amb = null;
  ambientGeneration += 1;
  setMusicStatus("idle");
  if (!current) return;
  const c = ctx;
  // Cancel recordings and pending decode callbacks synchronously. A delayed stop can
  // otherwise start a recording after its owner exited, or overlap the next page.
  if (!c || c.state === "closed") {
    current.stop();
    return;
  }
  // No pending source may outlive its owning page.
  current.stop();
}

/* ---------- Nature sounds chosen by the child ---------- */
export type Soundscape = "rain" | "wind" | "crickets";
function setScapeKind(kind: Soundscape | null) {
  scapeKind = kind;
  scapeListeners.forEach((listener) => listener());
}
export function getSoundscape() {
  return scapeKind;
}
export function useSoundscape() {
  return useSyncExternalStore(
    (listener) => {
      scapeListeners.add(listener);
      return () => scapeListeners.delete(listener);
    },
    () => scapeKind,
    () => null as Soundscape | null,
  );
}

/** Rain, wind and evening crickets share the app's context, master volume and settings. */
export function playSoundscape(kind: Soundscape) {
  const s = getState();
  if (!s.sound || s.volume === 0 || s.effectsVolume === 0) return;
  const c = ac();
  if (!c || !master || c.state === "closed") return;
  ensureRunning(c);
  stopSoundscape();
  const bus = c.createGain();
  bus.gain.setValueAtTime(0, c.currentTime);
  bus.gain.linearRampToValueAtTime(0.5 * s.effectsVolume, c.currentTime + 0.2);
  bus.connect(master);
  const stops: (() => void)[] = [];
  if (kind === "crickets") {
    const osc = c.createOscillator();
    osc.frequency.value = 4200;
    const amp = c.createGain();
    amp.gain.value = 0;
    const lfo = c.createOscillator();
    lfo.frequency.value = 18;
    const lg = c.createGain();
    lg.gain.value = 0.08;
    lfo.connect(lg).connect(amp.gain);
    osc.connect(amp).connect(bus);
    osc.start();
    lfo.start();
    stops.push(() => {
      osc.stop();
      lfo.stop();
    });
  } else {
    const buffer = c.createBuffer(1, Math.floor(c.sampleRate * 2), c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const filter = c.createBiquadFilter();
    filter.type = kind === "rain" ? "highpass" : "lowpass";
    filter.frequency.value = kind === "rain" ? 1200 : 400;
    src.connect(filter).connect(bus);
    src.start();
    stops.push(() => src.stop());
    if (kind === "wind") {
      const lfo = c.createOscillator();
      lfo.frequency.value = 0.15;
      const lg = c.createGain();
      lg.gain.value = 250;
      lfo.connect(lg).connect(filter.frequency);
      lfo.start();
      stops.push(() => lfo.stop());
    }
  }
  scape = {
    kind,
    bus,
    stop: () => {
      stops.forEach((stop) => {
        try {
          stop();
        } catch {
          /* already stopped */
        }
      });
      try {
        bus.disconnect();
      } catch {
        /* already disconnected */
      }
    },
  };
  setScapeKind(kind);
}

export function stopSoundscape() {
  const current = scape;
  scape = null;
  setScapeKind(null);
  if (!current) return;
  const c = ctx;
  if (!c || c.state === "closed") {
    current.stop();
    return;
  }
  // Selection changes and exits stop before another source can start.
  current.stop();
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
        watch: "cozy",
        story: "cozy",
        bedtime: "night",
        stroll: "meadow",
        puddles: "clouds",
        maze: "night",
        count: "meadow",
        "safe-drawing": "cozy",
        together: "cozy",
        dreams: "night",
        wonders: "meadow",
        raindrop: "clouds",
        trails: "forest",
        morning: "meadow",
        island: "cozy",
      } as Record<string, Ambient>
    )[seg] ?? null
  );
}

/** One soft plucked note for musical games (pentatonic friendly). */
export function chime(freq: number) {
  const s = getState();
  if (!s.sound || !s.sfx || s.volume === 0 || s.effectsVolume === 0) return;
  whenSounding((c, out) => pluck(freq, c.currentTime, 0.12, out, 0.3, 1.5));
}

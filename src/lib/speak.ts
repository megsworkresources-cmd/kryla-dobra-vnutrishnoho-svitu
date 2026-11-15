import { getState } from "./store";
import type { CharId } from "@/content/characters";
import { duckMusic, isAudioUnlocked } from "./audio";
import { useSyncExternalStore } from "react";

/**
 * Character voices and narration. "natural" uses Lovable AI voices with a warm Ukrainian delivery
 * (only app-written lines are sent, never anything the child types); "device" uses built-in speech.
 * Falls back to device speech if a natural voice can't be fetched. Obeys sound settings.
 */
type Voice = { voice: string; pitch: number };
const CAST: Record<CharId, Voice> = {
  solomiya: { voice: "Leda", pitch: 1.15 },
  olenka: { voice: "Aoede", pitch: 1.15 },
  daryna: { voice: "Zephyr", pitch: 1.15 },
  taras: { voice: "Puck", pitch: 0.95 },
  marko: { voice: "Orus", pitch: 0.95 },
  lihtaryk: { voice: "Fenrir", pitch: 1.4 },
};
export const characterVoice = (who: CharId) => CAST[who];

export function voices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];
  const all = window.speechSynthesis.getVoices();
  const uk = all.filter((v) => v.lang.startsWith("uk"));
  return uk.length ? uk : all.filter((v) => /^(ru|pl|en)/.test(v.lang)).slice(0, 6);
}

const cache = new Map<string, string>(); // in-memory only; values are audio data URIs
let audio: HTMLAudioElement | null = null;
let primedPlayer: HTMLAudioElement | null = null;
let naturalPaused = false;
/** Reuse the element unlocked synchronously by a real gesture, including on Safari. */
export function unlockSpeech() {
  if (typeof window === "undefined" || primedPlayer || !getState().sound) return;
  const player = new Audio(
    "data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQIAAAAAAA==",
  );
  primedPlayer = player;
  player.volume = 0;
  void player
    .play()
    .then(() => {
      if (audio !== player) player.pause();
    })
    .catch(() => {
      if (primedPlayer === player && audio !== player) primedPlayer = null;
    });
}
let token = 0;
type SpeechState = "idle" | "loading" | "playing" | "paused" | "unavailable";
let speechState: SpeechState = "idle";
const listeners = new Set<() => void>();
export const getSpeechState = () => speechState;
function setSpeechState(state: SpeechState) {
  speechState = state;
  listeners.forEach((l) => l());
}
export function useSpeechState() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    getSpeechState,
    () => "idle" as SpeechState,
  );
}

function deviceSpeak(text: string, pitch: number) {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    !("SpeechSynthesisUtterance" in window)
  ) {
    setSpeechState("unavailable");
    return;
  }
  const s = getState();
  if (!s.sound || s.volume === 0 || s.voiceVolume === 0) return;
  window.speechSynthesis.cancel();
  const mine = token;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = s.lang === "uk" ? "uk-UA" : "en-US";
  u.rate = 0.85;
  u.pitch = pitch;
  u.volume = s.volume * s.voiceVolume;
  const all = window.speechSynthesis.getVoices();
  const sameLang = all.filter((x) => x.lang.toLowerCase().replace("_", "-").startsWith(s.lang));
  const v = (s.voiceURI && sameLang.find((x) => x.voiceURI === s.voiceURI)) ?? sameLang[0];
  if (v) u.voice = v;
  u.onstart = () => {
    if (mine === token) setSpeechState("playing");
  };
  u.onend = () => {
    if (mine !== token) return;
    setSpeechState("idle");
    duckMusic(false);
  };
  u.onerror = () => {
    if (mine !== token) return;
    setSpeechState("unavailable");
    duckMusic(false);
  };
  setSpeechState("loading");
  duckMusic(true);
  try {
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(u);
  } catch {
    setSpeechState("unavailable");
    duckMusic(false);
  }
}

export function speak(
  text: string,
  opts: { force?: boolean; pitch?: number; who?: CharId; voice?: string; localOnly?: boolean } = {},
) {
  if (typeof window === "undefined") return;
  const s = getState();
  if (
    !s.sound ||
    s.volume === 0 ||
    s.voiceVolume === 0 ||
    !isAudioUnlocked() ||
    (!s.voice && !opts.force)
  )
    return;
  stopSpeaking();
  const c = opts.who ? CAST[opts.who] : null;
  const pitch = opts.pitch ?? c?.pitch ?? 1.05;
  if (opts.localOnly || s.voiceEngine !== "natural") return deviceSpeak(text, pitch);
  if (opts.force) naturalPaused = false;
  if (naturalPaused) return deviceSpeak(text, pitch);
  const voice = opts.voice ?? c?.voice ?? s.narrator ?? "Leda";
  const style = opts.who ?? "narrator";
  const key = `${s.lang}|${voice}|${style}|${text}`;
  const my = ++token;
  setSpeechState("loading");
  const play = (audioData: string) => {
    if (my !== token) return;
    // voice.server returns a complete data URI with the gateway's actual MIME type.
    // Retain a compatibility path for older server responses that returned bare base64.
    const source = audioData.startsWith("data:audio/")
      ? audioData
      : `data:audio/ogg;codecs=opus;base64,${audioData}`;
    const player = primedPlayer ?? new Audio();
    player.src = source;
    audio = player;
    const current = getState();
    if (!current.sound || current.volume === 0 || current.voiceVolume === 0) {
      stopSpeaking();
      return;
    }
    player.volume = current.volume * current.voiceVolume;
    player.onplaying = () => {
      if (my !== token) return;
      setSpeechState("playing");
      duckMusic(true);
    };
    player.onended = () => {
      if (my !== token) return;
      setSpeechState("idle");
      duckMusic(false);
    };
    let fellBack = false;
    const fallback = () => {
      if (my !== token || fellBack || speechState === "paused") return;
      fellBack = true;
      player.onplaying = null;
      player.onended = null;
      player.onerror = null;
      player.pause();
      audio = null;
      duckMusic(false);
      deviceSpeak(text, pitch);
    };
    player.onerror = fallback;
    if (speechState === "paused") return;
    duckMusic(true);
    void player
      .play()
      .then(() => {
        if (my !== token || speechState === "paused") player.pause();
      })
      .catch(() => {
        fallback();
      });
  };
  const hit = cache.get(key);
  if (hit) return play(hit);
  void import("./voice.functions")
    .then(({ speakNatural }) =>
      speakNatural({ data: { text, voice: voice as never, lang: s.lang, style } }),
    )
    .then((r) => {
      if (r.ok) {
        cache.set(key, r.audio);
        if (cache.size > 24) {
          const oldest = cache.keys().next().value;
          if (oldest) cache.delete(oldest);
        }
        play(r.audio);
      } else if (my === token) {
        if (["402", "403", "401", "404", "config"].includes(r.error)) naturalPaused = true;
        if (speechState !== "paused") deviceSpeak(text, pitch);
      }
    })
    .catch(() => {
      if (my === token && speechState !== "paused") deviceSpeak(text, pitch);
    });
}

export function pauseSpeaking() {
  if (speechState === "idle" || speechState === "unavailable") return;
  setSpeechState("paused");
  audio?.pause();
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.pause();
}
export function resumeSpeaking() {
  const s = getState();
  if (!s.sound || s.volume === 0 || s.voiceVolume === 0 || !isAudioUnlocked()) return;
  if (speechState !== "paused") return;
  setSpeechState("loading");
  const mine = token;
  const player = audio;
  void player
    ?.play()
    .then(() => {
      if (mine !== token) player.pause();
      else setSpeechState("playing");
    })
    .catch(() => {
      if (mine === token) setSpeechState("unavailable");
    });
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.resume();
}
export function stopSpeaking() {
  token++;
  setSpeechState("idle");
  duckMusic(false);
  if (audio) {
    audio.onplaying = null;
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    audio = null;
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

export function syncSpeechVolume() {
  const s = getState();
  if (!s.sound || !s.voice || s.volume === 0 || s.voiceVolume === 0) {
    stopSpeaking();
    return;
  }
  if (audio) audio.volume = s.volume * s.voiceVolume;
}

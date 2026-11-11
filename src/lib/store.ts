import { useSyncExternalStore } from "react";

/**
 * All child data stays on this device (localStorage). Only the optional "Розкажи, як ти" text is sent once to Lovable AI and never stored.
 */
export type AgeBand = "young" | "mid" | "older";
export type Lang = "uk" | "en";

export interface AppState {
  age: AgeBand;
  lang: Lang;
  completed: Record<string, number>; // activityId -> times completed
  favorites: string[]; // activity hrefs
  comfort: string[]; // child's own "what helps me" list
  drawings: { id: string; data: string; at: number }[];
  visits: Record<string, { n: number; last: number }>; // placeId -> visits
  lastDone: Record<string, number>; // activityId -> last completion time
  voice: boolean;
  reduceMotion: boolean;
  sound: boolean; // master switch
  music: boolean;
  musicStyle: "bandura" | "sopilka" | "tsymbaly" | "lullaby" | "nature";
  sfx: boolean;
  volume: number; // 0..1
  musicVolume: number;
  voiceVolume: number;
  effectsVolume: number;
  voiceURI: string;
  voiceEngine: "natural" | "device";
  narrator: string; // natural narrator voice
  textSize: "normal" | "large" | "xl";
}

const KEY = "tyhe-mistse-v1";
const DEFAULTS: AppState = {
  age: "mid",
  lang: "uk",
  completed: {},
  favorites: [],
  comfort: [],
  drawings: [],
  visits: {},
  lastDone: {},
  voice: false,
  reduceMotion: false,
  sound: true,
  music: false,
  musicStyle: "bandura",
  sfx: true,
  volume: 0.5,
  musicVolume: 1,
  voiceVolume: 1,
  effectsVolume: 1,
  voiceURI: "",
  voiceEngine: "natural",
  narrator: "Leda",
  textSize: "normal",
};

/** Read current state outside React (audio engine). */
export function getState() {
  load();
  return state;
}

let state: AppState = DEFAULTS;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return;
      const saved = parsed as Partial<AppState>;
      state = { ...DEFAULTS, ...saved };
      for (const key of ["favorites", "comfort", "drawings"] as const) {
        if (!Array.isArray(saved[key])) Object.assign(state, { [key]: DEFAULTS[key] });
      }
      for (const key of ["completed", "visits", "lastDone"] as const) {
        const value = saved[key];
        if (!value || typeof value !== "object" || Array.isArray(value))
          Object.assign(state, { [key]: DEFAULTS[key] });
      }
      for (const key of ["sound", "music", "sfx", "voice", "reduceMotion"] as const) {
        if (typeof saved[key] !== "boolean") state[key] = DEFAULTS[key];
      }
      state.volume =
        typeof saved.volume === "number" && Number.isFinite(saved.volume)
          ? Math.min(1, Math.max(0, saved.volume))
          : DEFAULTS.volume;
      for (const key of ["musicVolume", "voiceVolume", "effectsVolume"] as const) {
        const value = saved[key];
        state[key] = typeof value === "number" && Number.isFinite(value)
          ? Math.min(1, Math.max(0, value)) : DEFAULTS[key];
      }
      for (const key of ["completed", "lastDone"] as const) {
        state[key] = Object.fromEntries(Object.entries(state[key]).filter(([, value]) =>
          typeof value === "number" && Number.isSafeInteger(value) && value >= 0));
      }
      state.visits = Object.fromEntries(Object.entries(state.visits).filter(([, value]) =>
        value && typeof value === "object" && Number.isSafeInteger(value.n) && value.n >= 0
        && Number.isFinite(value.last) && value.last >= 0));
      state.favorites = state.favorites.filter((value) => typeof value === "string");
      state.comfort = state.comfort.filter((value) => typeof value === "string");
      state.drawings = state.drawings.filter((value) => value && typeof value.id === "string"
        && typeof value.data === "string" && Number.isFinite(value.at));
      state.age = ["young", "mid", "older"].includes(String(saved.age))
        ? (saved.age as AgeBand)
        : DEFAULTS.age;
      state.lang = saved.lang === "en" ? "en" : "uk";
      state.musicStyle = ["bandura", "sopilka", "tsymbaly", "lullaby", "nature"].includes(
        String(saved.musicStyle),
      )
        ? (saved.musicStyle as AppState["musicStyle"])
        : DEFAULTS.musicStyle;
      state.voiceEngine = saved.voiceEngine === "device" ? "device" : "natural";
      state.textSize = ["normal", "large", "xl"].includes(String(saved.textSize))
        ? (saved.textSize as AppState["textSize"])
        : DEFAULTS.textSize;
      state.voiceURI = typeof saved.voiceURI === "string" ? saved.voiceURI : DEFAULTS.voiceURI;
      state.narrator = typeof saved.narrator === "string" ? saved.narrator : DEFAULTS.narrator;
    }
  } catch {
    state = DEFAULTS;
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    /* storage full or unavailable — app keeps working in memory */
    return false;
  }
}

export function update(fn: (s: AppState) => AppState) {
  load();
  state = fn(state);
  const saved = persist();
  listeners.forEach((l) => l());
  return saved;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore<T>(select: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return select(state);
    },
    () => select(DEFAULTS),
  );
}

export const markDone = (id: string) =>
  update((s) => ({
    ...s,
    completed: { ...s.completed, [id]: (s.completed[id] ?? 0) + 1 },
    lastDone: { ...s.lastDone, [id]: Date.now() },
  }));

export const markVisit = (place: string) =>
  update((s) => ({
    ...s,
    visits: { ...s.visits, [place]: { n: (s.visits[place]?.n ?? 0) + 1, last: Date.now() } },
  }));

/** Wipes only progress records (not settings or drawings). */
export const resetProgress = () =>
  update((s) => ({ ...s, completed: {}, lastDone: {}, visits: {} }));

export const toggleFavorite = (href: string) =>
  update((s) => ({
    ...s,
    favorites: s.favorites.includes(href)
      ? s.favorites.filter((f) => f !== href)
      : [...s.favorites, href],
  }));

export const setAge = (age: AgeBand) => update((s) => ({ ...s, age }));

export function totalDone(c: Record<string, number>) {
  return Object.values(c).reduce((a, b) => a + b, 0);
}

/** Sunflower growth stage 0..5 from completed activity count. Never decreases. */
export function growthStage(count: number) {
  if (count >= 20) return 5;
  if (count >= 12) return 4;
  if (count >= 7) return 3;
  if (count >= 3) return 2;
  if (count >= 1) return 1;
  return 0;
}

export function pick<T>(age: AgeBand, v: { young: T; mid: T; older: T }) {
  return v[age];
}

export const addDrawing = (data: string) =>
  update((s) => ({
    ...s,
    drawings: [...s.drawings, { id: `${Date.now()}`, data, at: Date.now() }].slice(-30),
  }));
export const removeDrawing = (id: string) =>
  update((s) => ({ ...s, drawings: s.drawings.filter((d) => d.id !== id) }));
export const addComfort = (text: string) =>
  update((s) => ({ ...s, comfort: [...s.comfort, text] }));
export const removeComfort = (i: number) =>
  update((s) => ({ ...s, comfort: s.comfort.filter((_, j) => j !== i) }));

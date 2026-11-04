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
  musicStyle: 'bandura' | 'sopilka' | 'tsymbaly' | 'lullaby' | 'nature';
  sfx: boolean;
  volume: number; // 0..1
  voiceURI: string;
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
  musicStyle: 'bandura',
  sfx: true,
  volume: 0.5,
  voiceURI: "",
  textSize: "normal",
};

/** Read current state outside React (audio engine). */
export function getState() { load(); return state; }

let state: AppState = DEFAULTS;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) state = { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    state = DEFAULTS;
  }
}

function persist() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage full or unavailable — app keeps working in memory */
  }
}

export function update(fn: (s: AppState) => AppState) {
  load();
  state = fn(state);
  persist();
  listeners.forEach((l) => l());
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
  update((s) => ({ ...s, completed: { ...s.completed, [id]: (s.completed[id] ?? 0) + 1 }, lastDone: { ...s.lastDone, [id]: Date.now() } }));

export const markVisit = (place: string) =>
  update((s) => ({ ...s, visits: { ...s.visits, [place]: { n: (s.visits[place]?.n ?? 0) + 1, last: Date.now() } } }));

/** Wipes only progress records (not settings or drawings). */
export const resetProgress = () => update((s) => ({ ...s, completed: {}, lastDone: {}, visits: {} }));

export const toggleFavorite = (href: string) =>
  update((s) => ({
    ...s,
    favorites: s.favorites.includes(href) ? s.favorites.filter((f) => f !== href) : [...s.favorites, href],
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
  update((s) => ({ ...s, drawings: [...s.drawings, { id: `${Date.now()}`, data, at: Date.now() }].slice(-30) }));
export const removeDrawing = (id: string) => update((s) => ({ ...s, drawings: s.drawings.filter((d) => d.id !== id) }));
export const addComfort = (text: string) => update((s) => ({ ...s, comfort: [...s.comfort, text] }));
export const removeComfort = (i: number) => update((s) => ({ ...s, comfort: s.comfort.filter((_, j) => j !== i) }));

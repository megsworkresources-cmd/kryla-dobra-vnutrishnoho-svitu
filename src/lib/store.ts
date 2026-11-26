import { useEffect, useState, useSyncExternalStore } from "react";
import { clearSavedGarden } from "@/lib/community-cache";

/**
 * All child data stays on this device (localStorage). Only the optional "Розкажи, як ти" text is sent once to Lovable AI and never stored.
 */
export type AgeBand = "young" | "mid" | "older";
export type Lang = "uk" | "en";
export type StarShape = "classic" | "round" | "flower";
export type StarColor = "honey" | "moon" | "rose" | "sky" | "lavender";
export type StarGlow = "soft" | "warm" | "bright";

export interface AppState {
  age: AgeBand;
  lang: Lang;
  completed: Record<string, number>; // activityId -> times completed
  favorites: string[]; // activity hrefs
  comfort: string[]; // child's own "what helps me" list
  drawings: { id: string; data: string; at: number }[];
  visits: Record<string, { n: number; last: number }>; // placeId -> visits
  lastDone: Record<string, number>; // activityId -> last completion time
  watch: Record<string, number>; // cartoonId -> last scene shown
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
  careSteps: number; // daily waterings that grew the sunflower
  wateredOn: string | null; // local day (YYYY-MM-DD) of the last watering
  starName: string; // the child's own star, kept on this device only
  starWish: string;
  starX: number; // percent position inside the sky
  starY: number;
  starShape: StarShape; // the child's own star look, kept on this device only
  starColor: StarColor;
  starGlow: StarGlow;
  starLinks: string[]; // story stars joined into the child's constellation
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
  watch: {},
  voice: true,
  reduceMotion: false,
  sound: true,
  music: true,
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
  careSteps: 0,
  wateredOn: null,
  starName: "",
  starWish: "",
  starX: 50,
  starY: 46,
  starShape: "classic",
  starColor: "honey",
  starGlow: "warm",
  starLinks: [],
};

/** Read current state outside React (audio engine). */
export function getState() {
  load();
  return state;
}

let state: AppState = DEFAULTS;
let loaded = false;
/** True once this session has written the store; in-memory writes then win over storage. */
let touched = false;
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
        state[key] =
          typeof value === "number" && Number.isFinite(value)
            ? Math.min(1, Math.max(0, value))
            : DEFAULTS[key];
      }
      for (const key of ["completed", "lastDone"] as const) {
        state[key] = Object.fromEntries(
          Object.entries(state[key]).filter(
            ([, value]) => typeof value === "number" && Number.isSafeInteger(value) && value >= 0,
          ),
        );
      }
      if (!state.watch || typeof state.watch !== "object" || Array.isArray(state.watch)) {
        state.watch = {};
      } else {
        state.watch = Object.fromEntries(
          Object.entries(state.watch).filter(
            ([, value]) => Number.isSafeInteger(value) && value >= 0,
          ),
        );
      }
      state.visits = Object.fromEntries(
        Object.entries(state.visits).filter(
          ([, value]) =>
            value &&
            typeof value === "object" &&
            Number.isSafeInteger(value.n) &&
            value.n >= 0 &&
            Number.isFinite(value.last) &&
            value.last >= 0,
        ),
      );
      state.favorites = state.favorites.filter((value) => typeof value === "string");
      state.comfort = state.comfort.filter((value) => typeof value === "string");
      state.drawings = state.drawings.filter(
        (value) =>
          value &&
          typeof value.id === "string" &&
          typeof value.data === "string" &&
          Number.isFinite(value.at),
      );
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
      state.careSteps =
        typeof saved.careSteps === "number" &&
        Number.isSafeInteger(saved.careSteps) &&
        saved.careSteps >= 0
          ? saved.careSteps
          : DEFAULTS.careSteps;
      state.wateredOn =
        typeof saved.wateredOn === "string" && /^\d{4}-\d{2}-\d{2}$/.test(saved.wateredOn)
          ? saved.wateredOn
          : DEFAULTS.wateredOn;
      state.starShape = ["classic", "round", "flower"].includes(String(saved.starShape))
        ? (saved.starShape as StarShape)
        : DEFAULTS.starShape;
      state.starColor = ["honey", "moon", "rose", "sky", "lavender"].includes(
        String(saved.starColor),
      )
        ? (saved.starColor as StarColor)
        : DEFAULTS.starColor;
      state.starGlow = ["soft", "warm", "bright"].includes(String(saved.starGlow))
        ? (saved.starGlow as StarGlow)
        : DEFAULTS.starGlow;
      state.starLinks = Array.isArray(saved.starLinks)
        ? [...new Set(saved.starLinks.filter((id): id is string => typeof id === "string"))].slice(
            0,
            5,
          )
        : DEFAULTS.starLinks;
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
  touched = true;
  state = fn(state);
  const saved = persist();
  listeners.forEach((l) => l());
  return saved;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

/** Re-read the device store unless this session has already written it. */
function refreshFromStorage() {
  if (touched) return;
  loaded = false;
  load();
}

export function useStore<T>(select: (s: AppState) => T): T {
  const value = useSyncExternalStore(
    subscribe,
    () => {
      load();
      return select(state);
    },
    () => select(DEFAULTS),
  );
  // Server markup is rendered before the device store can be read, so the first client
  // paint shows the resting state. Re-read once after mount so saved progress appears
  // immediately instead of a beat later.
  const [, afterMount] = useState(false);
  useEffect(() => {
    refreshFromStorage();
    afterMount(true);
  }, []);
  return value;
}

export const markDone = (id: string) =>
  update((s) => ({
    ...s,
    completed: { ...s.completed, [id]: (s.completed[id] ?? 0) + 1 },
    lastDone: { ...s.lastDone, [id]: Date.now() },
  }));

export const setWatchPosition = (id: string, scene: number) => {
  const next = Math.max(0, Math.trunc(scene));
  if (getState().watch[id] === next) return;
  update((s) => ({ ...s, watch: { ...s.watch, [id]: next } }));
};

export const markVisit = (place: string) =>
  update((s) => ({
    ...s,
    visits: { ...s.visits, [place]: { n: (s.visits[place]?.n ?? 0) + 1, last: Date.now() } },
  }));

const clamped = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, Number.isFinite(value) ? value : min));

/** The child's star is private to this device; its position stays inside the sky. */
export const setStarName = (name: string) => update((s) => ({ ...s, starName: name.slice(0, 24) }));

export const setStarWish = (wish: string) => update((s) => ({ ...s, starWish: wish.slice(0, 90) }));

export const moveStar = (x: number, y: number) =>
  update((s) => ({ ...s, starX: clamped(x, 8, 92), starY: clamped(y, 8, 92) }));

export const setStarShape = (shape: StarShape) => update((s) => ({ ...s, starShape: shape }));

export const setStarColor = (color: StarColor) => update((s) => ({ ...s, starColor: color }));

export const setStarGlow = (glow: StarGlow) => update((s) => ({ ...s, starGlow: glow }));

/** Constellation lines are device-only too: nothing about them is ever sent away. */
export const toggleStarLink = (id: string) =>
  update((s) => ({
    ...s,
    starLinks: s.starLinks.includes(id)
      ? s.starLinks.filter((link) => link !== id)
      : [...s.starLinks, id].slice(0, 5),
  }));

/** Wipes only progress records (not settings or drawings). */
export const resetProgress = () => {
  // Other families' cached flowers are progress-shaped too: a reset device
  // should not keep falling back to them.
  clearSavedGarden();
  update((s) => ({
    ...s,
    completed: {},
    lastDone: {},
    visits: {},
    watch: {},
    careSteps: 0,
    wateredOn: null,
  }));
};

/** One watering per local day; growth never decreases and nothing leaves the device. */
export const waterFlower = (day: string) =>
  update((s) => (s.wateredOn === day ? s : { ...s, wateredOn: day, careSteps: s.careSteps + 1 }));

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

/** Growth comes from real activities plus gentle daily waterings. */
export function careCount(s: Pick<AppState, "completed" | "careSteps">) {
  const waterings = Number.isSafeInteger(s.careSteps) && s.careSteps > 0 ? s.careSteps : 0;
  return totalDone(s.completed) + waterings;
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

export const addDrawing = (data: string) => {
  const at = Date.now();
  // A random suffix keeps two drawings saved in the same millisecond distinct.
  const id = `${at}-${Math.random().toString(36).slice(2, 8)}`;
  return update((s) => ({
    ...s,
    drawings: [...s.drawings, { id, data, at }].slice(-30),
  }));
};
export const removeDrawing = (id: string) =>
  update((s) => ({ ...s, drawings: s.drawings.filter((d) => d.id !== id) }));
export const addComfort = (text: string) =>
  update((s) => ({ ...s, comfort: [...s.comfort, text] }));
export const removeComfort = (i: number) =>
  update((s) => ({ ...s, comfort: s.comfort.filter((_, j) => j !== i) }));

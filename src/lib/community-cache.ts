/**
 * The last shared-garden stages this device saw, kept on this device only.
 *
 * A failed read must not make other families' flowers vanish, so the page can
 * fall back to this snapshot. It stores coarse stages only — the same public
 * projection the server returns, with no owners, names or child data — plus a
 * timestamp, and it expires: a long-abandoned device should not keep showing
 * flowers that may no longer exist.
 */
import { cleanStages } from "@/content/community";

const KEY = "tyhe-mistse-community-garden-v1";

/** Saved flowers are shown for a few days at most, then dropped. */
export const SAVE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export interface SavedGarden {
  stages: number[];
  /** When the snapshot was saved, or null when it is missing, unusable or stale. */
  at: number | null;
}

const EMPTY: SavedGarden = { stages: [], at: null };

export function readSavedGarden(): SavedGarden {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return EMPTY;
    const saved = parsed as { stages?: unknown; at?: unknown };
    const at =
      typeof saved.at === "number" && Number.isFinite(saved.at) && saved.at > 0 ? saved.at : null;
    // An undated snapshot cannot be trusted to be recent, and an old one may
    // list flowers that no longer exist.
    if (at === null || Date.now() - at > SAVE_TTL_MS) return EMPTY;
    return { stages: cleanStages(saved.stages), at };
  } catch {
    return EMPTY;
  }
}

export function saveGarden(stages: number[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify({ stages: cleanStages(stages), at: Date.now() }),
    );
    return true;
  } catch {
    /* storage full or blocked — the live garden still renders */
    return false;
  }
}

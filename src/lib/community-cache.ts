/**
 * The last shared-garden stages this device saw, kept on this device only.
 *
 * A failed read must not make other families' flowers vanish, so the page can
 * fall back to this snapshot. It stores coarse stages only — the same public
 * projection the server returns, with no owners, names or child data — plus a
 * timestamp so a stale snapshot can say how old it is.
 */
import { cleanStages } from "@/content/community";

const KEY = "tyhe-mistse-community-garden-v1";

export interface SavedGarden {
  stages: number[];
  /** When the snapshot was saved, or null when the stored value has no usable time. */
  at: number | null;
}

export function readSavedGarden(): SavedGarden {
  if (typeof window === "undefined") return { stages: [], at: null };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { stages: [], at: null };
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { stages: [], at: null };
    }
    const saved = parsed as { stages?: unknown; at?: unknown };
    const at =
      typeof saved.at === "number" && Number.isFinite(saved.at) && saved.at > 0 ? saved.at : null;
    return { stages: cleanStages(saved.stages), at };
  } catch {
    return { stages: [], at: null };
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

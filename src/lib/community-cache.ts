/**
 * The last shared-garden stages this device saw, kept on this device only.
 *
 * A failed read must not make other families' flowers vanish, so the page can
 * fall back to this snapshot. It stores coarse stages only — the same public
 * projection the server returns, with no owners, names or child data.
 */
import { cleanStages } from "@/content/community";

const KEY = "tyhe-mistse-community-garden-v1";

export function readSavedStages(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return [];
    return cleanStages((parsed as { stages?: unknown }).stages);
  } catch {
    return [];
  }
}

export function saveStages(stages: number[]): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ stages: cleanStages(stages) }));
    return true;
  } catch {
    /* storage full or blocked — the live garden still renders */
    return false;
  }
}

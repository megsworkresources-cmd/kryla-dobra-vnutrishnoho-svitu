/**
 * Unfinished drawings, kept on this device only.
 * A child who draws for ten minutes and wanders off should not lose the picture.
 */
const KEY = "tyhe-mistse-drafts-v1";
const LIMIT = 3;
const MAX_BYTES = 480_000;

function read(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, string> = {};
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === "string" && value.startsWith("data:image/")) out[id] = value;
    }
    return out;
  } catch {
    return {};
  }
}

function write(all: Record<string, string>) {
  if (typeof window === "undefined") return false;
  try {
    const kept = Object.entries(all).slice(-LIMIT);
    window.localStorage.setItem(KEY, JSON.stringify(Object.fromEntries(kept)));
    return true;
  } catch {
    /* storage full — the drawing is still on screen */
    return false;
  }
}

export function getDraft(id: string): string | undefined {
  return read()[id];
}

export function saveDraft(id: string, dataUrl: string) {
  if (!dataUrl.startsWith("data:image/") || dataUrl.length > MAX_BYTES) return false;
  const all = read();
  all[id] = dataUrl;
  return write(all);
}

export function clearDraft(id: string) {
  const all = read();
  if (!(id in all)) return false;
  delete all[id];
  return write(all);
}

/**
 * Unfinished exercise walkthroughs, kept on this device only.
 * A closed tab or a wander back to the map should never erase a child's place.
 */
export interface Session {
  step: number;
  answers: Record<string, string>;
  checks: Record<string, string[]>;
  at: number;
}

const KEY = "tyhe-mistse-sessions-v1";
const LIMIT = 30;

function read(): Record<string, Session> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const out: Record<string, Session> = {};
    for (const [id, value] of Object.entries(parsed as Record<string, Partial<Session>>)) {
      if (!value || typeof value !== "object") continue;
      if (!Number.isSafeInteger(value.step) || (value.step ?? 0) < 0) continue;
      out[id] = {
        step: Math.max(0, value.step ?? 0),
        at: Number.isFinite(value.at) ? (value.at as number) : 0,
        answers: Object.fromEntries(
          Object.entries(value.answers ?? {}).filter(([, a]) => typeof a === "string"),
        ),
        checks: Object.fromEntries(
          Object.entries(value.checks ?? {}).filter(
            ([, a]) => Array.isArray(a) && a.every((item) => typeof item === "string"),
          ),
        ),
      };
    }
    return out;
  } catch {
    return {};
  }
}

function write(all: Record<string, Session>) {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(
      KEY,
      JSON.stringify(Object.fromEntries(Object.entries(all).slice(-LIMIT))),
    );
    return true;
  } catch {
    /* storage full or unavailable — the exercise still works in memory */
    return false;
  }
}

export function getSession(id: string): Session | undefined {
  return read()[id];
}

export function saveSession(
  id: string,
  step: number,
  answers: Record<string, string>,
  checks: Record<string, string[]>,
) {
  const all = read();
  all[id] = { step, answers, checks, at: Date.now() };
  return write(all);
}

export function clearSession(id: string) {
  const all = read();
  delete all[id];
  return write(all);
}

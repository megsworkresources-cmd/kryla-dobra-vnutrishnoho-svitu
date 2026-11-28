import type { AppState } from "./store";

/**
 * A grown-up's local copy of the device store. The file is written by the browser and read
 * back from a file the grown-up chooses: it never travels over the network, and importing
 * only ever adds what is missing, so a restore cannot destroy what is already on the device.
 */
export const BACKUP_KIND = "tyhe-mistse/device-store";
export const BACKUP_VERSION = 1;

export interface DeviceBackupFile {
  kind: string;
  version: number;
  exportedAt: string;
  state: AppState;
}

export function backupPayload(state: AppState, exportedAt = new Date()): DeviceBackupFile {
  return {
    kind: BACKUP_KIND,
    version: BACKUP_VERSION,
    exportedAt: exportedAt.toISOString(),
    state,
  };
}

export function backupText(state: AppState, exportedAt = new Date()) {
  return `${JSON.stringify(backupPayload(state, exportedAt), null, 2)}\n`;
}

/** A file name a grown-up can find again among photos and downloads. */
export function backupFileName(exportedAt = new Date()) {
  return `tyhe-mistse-${exportedAt.toISOString().slice(0, 10)}.json`;
}

/**
 * Accepts this app's own file, and a bare store object for a copy made before the wrapper
 * existed. Anything else — another app's file, a broken download, an array — is refused
 * rather than half-imported.
 */
export function readBackup(text: string): Partial<AppState> | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;
  const record = parsed as Record<string, unknown>;
  if ("kind" in record && record["kind"] !== BACKUP_KIND) return null;
  const state = "state" in record ? record["state"] : record;
  if (!state || typeof state !== "object" || Array.isArray(state)) return null;
  return state as Partial<AppState>;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const counts = (value: unknown): Record<string, number> =>
  Object.fromEntries(
    Object.entries(isObject(value) ? value : {}).filter(
      ([, entry]) => Number.isSafeInteger(entry) && (entry as number) >= 0,
    ),
  ) as Record<string, number>;

const strings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];

const savedDrawings = (value: unknown): AppState["drawings"] =>
  Array.isArray(value)
    ? value.filter(
        (entry): entry is AppState["drawings"][number] =>
          isObject(entry) &&
          typeof entry["id"] === "string" &&
          typeof entry["data"] === "string" &&
          Number.isFinite(entry["at"]),
      )
    : [];

const perKeyMax = (a: Record<string, number>, b: Record<string, number>) =>
  Object.fromEntries(
    [...new Set([...Object.keys(a), ...Object.keys(b)])].map((key) => [
      key,
      Math.max(a[key] ?? 0, b[key] ?? 0),
    ]),
  );

const unique = (values: string[]) => [...new Set(values)];

const visits = (a: AppState["visits"], value: unknown): AppState["visits"] => {
  const merged: AppState["visits"] = { ...a };
  for (const [place, entry] of Object.entries(isObject(value) ? value : {})) {
    if (!isObject(entry)) continue;
    const n = Number.isSafeInteger(entry["n"]) ? Math.max(0, entry["n"] as number) : 0;
    const last = Number.isFinite(entry["last"]) ? Math.max(0, entry["last"] as number) : 0;
    const current = merged[place];
    merged[place] = {
      n: Math.max(current?.n ?? 0, n),
      last: Math.max(current?.last ?? 0, last),
    };
  }
  return merged;
};

/**
 * Everything on the device survives: counters take the larger value, lists are united,
 * drawings are matched by id, and the device keeps its own settings, sound and star.
 */
export function mergeStates(current: AppState, incoming: Partial<AppState>): AppState {
  const drawingsById = new Map<string, AppState["drawings"][number]>();
  for (const drawing of [...current.drawings, ...savedDrawings(incoming.drawings)]) {
    drawingsById.set(drawing.id, drawing);
  }
  const careSteps = Number.isSafeInteger(incoming.careSteps)
    ? Math.max(current.careSteps, incoming.careSteps as number)
    : current.careSteps;
  const wateredOn = [current.wateredOn, incoming.wateredOn]
    .filter((day): day is string => typeof day === "string" && /^\d{4}-\d{2}-\d{2}$/.test(day))
    .sort()
    .pop();

  return {
    ...current,
    completed: perKeyMax(current.completed, counts(incoming.completed)),
    lastDone: perKeyMax(current.lastDone, counts(incoming.lastDone)),
    watch: perKeyMax(current.watch, counts(incoming.watch)),
    visits: visits(current.visits, incoming.visits),
    careSteps,
    wateredOn: wateredOn ?? current.wateredOn,
    favorites: unique([...current.favorites, ...strings(incoming.favorites)]),
    comfort: unique([...current.comfort, ...strings(incoming.comfort)]),
    drawings: [...drawingsById.values()].sort((a, b) => b.at - a.at).slice(0, 30),
    starName: current.starName || (typeof incoming.starName === "string" ? incoming.starName : ""),
    starWish: current.starWish || (typeof incoming.starWish === "string" ? incoming.starWish : ""),
    starLinks: unique([...current.starLinks, ...strings(incoming.starLinks)]).slice(0, 5),
  };
}

import { describe, expect, it } from "vitest";
import { exportDeviceState, importDeviceState } from "@/lib/store";
import {
  BACKUP_KIND,
  BACKUP_VERSION,
  backupFileName,
  backupText,
  mergeStates,
  readBackup,
} from "@/lib/store-backup";

describe("backup file", () => {
  it("names the app, its version and the moment it was written", () => {
    const exportedAt = new Date("2026-11-27T10:00:00.000Z");
    const file = JSON.parse(backupText(exportDeviceState(), exportedAt));
    expect(file.kind).toBe(BACKUP_KIND);
    expect(file.version).toBe(BACKUP_VERSION);
    expect(file.exportedAt).toBe("2026-11-27T10:00:00.000Z");
    expect(file.state).toEqual(exportDeviceState());
    expect(backupFileName(exportedAt)).toBe("tyhe-mistse-2026-11-27.json");
  });

  it("reads its own file and a bare store, and refuses anything else", () => {
    expect(readBackup(backupText(exportDeviceState()))).not.toBeNull();
    expect(readBackup(JSON.stringify({ completed: { breathing: 1 } }))).toEqual({
      completed: { breathing: 1 },
    });
    // A broken download, another app's file, or a stray array must not reach the store.
    expect(readBackup("not json")).toBeNull();
    expect(readBackup("[]")).toBeNull();
    expect(readBackup('"text"')).toBeNull();
    expect(readBackup(JSON.stringify({ kind: "other/app", state: {} }))).toBeNull();
    expect(readBackup(JSON.stringify({ kind: BACKUP_KIND, state: null }))).toBeNull();
  });
});

describe("restoring a copy", () => {
  it("keeps everything already on the device and adds what the copy has", () => {
    const current = {
      ...exportDeviceState(),
      completed: { breathing: 2 },
      drawings: [{ id: "d1", data: "one", at: 1 }],
      comfort: ["обійми"],
      starName: "Моя зірка",
      careSteps: 1,
      wateredOn: "2026-11-20",
      lang: "en" as const,
    };
    const merged = mergeStates(current, {
      completed: { breathing: 1, maze: 3 },
      drawings: [
        { id: "d1", data: "one", at: 1 },
        { id: "d2", data: "two", at: 2 },
      ],
      comfort: ["обійми", "чай"],
      favorites: ["/watch"],
      starName: "Інша",
      starLinks: ["sky-lantern"],
      careSteps: 4,
      wateredOn: "2026-11-25",
      lang: "uk",
    });

    expect(merged.completed).toEqual({ breathing: 2, maze: 3 });
    expect(merged.drawings.map((drawing) => drawing.id)).toEqual(["d2", "d1"]);
    expect(merged.comfort).toEqual(["обійми", "чай"]);
    expect(merged.favorites).toEqual(["/watch"]);
    // The child's own star and this device's settings win over the file's.
    expect(merged.starName).toBe("Моя зірка");
    expect(merged.lang).toBe("en");
    expect(merged.careSteps).toBe(4);
    expect(merged.wateredOn).toBe("2026-11-25");
  });

  it("never lowers a number, even when the copy is older", () => {
    const merged = mergeStates(
      { ...exportDeviceState(), completed: { breathing: 5 }, careSteps: 9 },
      { completed: { breathing: 1 }, careSteps: 0 },
    );
    expect(merged.completed["breathing"]).toBe(5);
    expect(merged.careSteps).toBe(9);
  });

  it("ignores malformed fields in a file instead of throwing", () => {
    const device = exportDeviceState();
    const merged = mergeStates(device, {
      comfort: "nope" as never,
      watch: [1, 2] as never,
      drawings: [null, { id: 1 }] as never,
      visits: { park: { n: "x", last: Number.NaN } } as never,
    });
    expect(merged.comfort).toEqual(device.comfort);
    expect(merged.watch).toEqual(device.watch);
    expect(merged.drawings).toEqual(device.drawings);
    expect(merged.visits["park"]).toEqual({ n: 0, last: 0 });
  });

  it("puts a restored store through the same normalisation as a page load", () => {
    const restored = importDeviceState({
      ...exportDeviceState(),
      age: "alien",
      completed: { butterflies: 2 },
      drawings: [{ id: "x", data: "d", at: 5 }, { bad: true }],
    });
    expect(restored).toBe(true);
    const after = exportDeviceState();
    expect(after.age).toBe("mid");
    expect(after.completed["butterflies"]).toBe(2);
    expect(after.drawings).toEqual([{ id: "x", data: "d", at: 5 }]);
  });

  it("refuses values that are not a store at all", () => {
    expect(importDeviceState(null)).toBe(false);
    expect(importDeviceState([1, 2])).toBe(false);
    expect(importDeviceState("store")).toBe(false);
  });
});

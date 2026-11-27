import "@testing-library/jest-dom/vitest";
import { configure } from "@testing-library/react";

// Queries wait 1s by default for UI that settles over a few frames. On a loaded
// machine that ceiling expires while the component is behaving correctly, which is
// how a green suite turns red without a code change; waiting longer only delays a
// real failure.
configure({ asyncUtilTimeout: 5_000 });

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

// Node 22 and newer expose their own experimental `localStorage`, `sessionStorage` and
// `Storage` globals, which stay unusable unless the process was started with
// `--localstorage-file`. Vitest only copies jsdom globals that do not already exist, so
// those dead runtime versions shadow jsdom's working storage. When the runtime's storage
// is unavailable, install a minimal spec-shaped one instead (all instances share one
// `Storage.prototype`, so spies on it still intercept every call).
if (typeof globalThis.localStorage === "undefined") {
  class MemoryStorage {
    private readonly entries = new Map<string, string>();
    get length() {
      return this.entries.size;
    }
    clear() {
      this.entries.clear();
    }
    getItem(key: string) {
      return this.entries.has(key) ? (this.entries.get(key) ?? null) : null;
    }
    key(index: number) {
      return Array.from(this.entries.keys())[index] ?? null;
    }
    removeItem(key: string) {
      this.entries.delete(key);
    }
    setItem(key: string, value: string) {
      this.entries.set(String(key), String(value));
    }
  }
  for (const name of ["Storage", "localStorage", "sessionStorage"] as const) {
    Object.defineProperty(globalThis, name, {
      configurable: true,
      writable: true,
      value: name === "Storage" ? MemoryStorage : new MemoryStorage(),
    });
  }
}

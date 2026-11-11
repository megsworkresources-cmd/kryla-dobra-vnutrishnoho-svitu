import { createServerFn } from "@tanstack/react-start";
import { getRequestIP } from "@tanstack/react-start/server";
import { z } from "zod";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const MAX_GLOBAL_PER_MIN = 60;
const hits = new Map<string, number[]>();
let globalHits: number[] = [];

function allow(ip: string): boolean {
  const now = Date.now();
  globalHits = globalHits.filter((t) => now - t < 60_000);
  if (globalHits.length >= MAX_GLOBAL_PER_MIN) return false;
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (list.length >= MAX_PER_WINDOW) {
    hits.set(ip, list);
    return false;
  }
  list.push(now);
  globalHits.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) hits.clear();
  return true;
}

export const askHelper = createServerFn({ method: "POST" })
  .validator(
    z.object({
      text: z.string().trim().min(2).max(500),
      age: z.enum(["5-7", "8-10", "11-13"]),
      lang: z.enum(["uk", "en"]).default("uk"),
    }),
  )
  .handler(async ({ data }) => {
    const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown";
    if (!allow(ip)) return { ok: false as const, error: "busy" };
    const { suggestActivity, SuggestError } = await import("./suggest.server");
    try {
      return {
        ok: true as const,
        suggestion: await suggestActivity(data.text, data.age, data.lang),
      };
    } catch (e) {
      return { ok: false as const, error: e instanceof SuggestError ? e.message : "fail" };
    }
  });

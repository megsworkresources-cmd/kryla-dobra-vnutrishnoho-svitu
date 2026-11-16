import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const NATURAL_VOICES = [
  "Leda",
  "Aoede",
  "Kore",
  "Zephyr",
  "Puck",
  "Orus",
  "Charon",
  "Fenrir",
] as const;

export const speakNatural = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      text: z.string().trim().min(1).max(600),
      voice: z.enum(NATURAL_VOICES),
      lang: z.enum(["uk", "en"]),
      style: z.enum(["narrator", "solomiya", "olenka", "daryna", "taras", "marko", "lihtaryk"]),
    }),
  )
  .handler(async ({ data, context }) => {
    const { allowAi } = await import("./ai-quota.server");
    if (!allowAi("voice", context.userId, 60, 60 * 60 * 1000))
      return { ok: false as const, error: "busy" };
    const { isAppLine } = await import("./i18n");
    // Only app-written lines may be voiced; anything else falls back to device speech.
    if (!isAppLine(data.text)) return { ok: false as const, error: "not_allowed" };
    const { synthesize, VoiceError } = await import("./voice.server");
    try {
      return {
        ok: true as const,
        audio: await synthesize(data.text, data.voice, data.lang, data.style),
      };
    } catch (e) {
      return { ok: false as const, error: e instanceof VoiceError ? e.message : "fail" };
    }
  });

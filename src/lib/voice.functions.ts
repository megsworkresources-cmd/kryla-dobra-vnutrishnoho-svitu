import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const NATURAL_VOICES = ["Leda", "Aoede", "Kore", "Zephyr", "Puck", "Orus", "Charon", "Fenrir"] as const;

export const speakNatural = createServerFn({ method: "POST" })
  .validator(z.object({ text: z.string().trim().min(1).max(600), voice: z.enum(NATURAL_VOICES), lang: z.enum(["uk", "en"]), style: z.string().max(80) }))
  .handler(async ({ data }) => {
    const { synthesize, VoiceError } = await import("./voice.server");
    try {
      return { ok: true as const, audio: await synthesize(data.text, data.voice, data.lang, data.style) };
    } catch (e) {
      return { ok: false as const, error: e instanceof VoiceError ? e.message : "fail" };
    }
  });

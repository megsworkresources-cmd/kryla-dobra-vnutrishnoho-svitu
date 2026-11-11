import { createAnthropic } from "@ai-sdk/anthropic";
import { NoObjectGeneratedError, Output, streamText } from "ai";
import { z } from "zod";
import { CHARACTERS } from "@/content/characters";
import { PLACES } from "@/content/places";
import { createLovableAiGatewayRunIdFetch } from "./run-id.server";
import type { StoryInput } from "./story.functions";
import { tr } from "./i18n";

const StorySchema = z.object({
  title: z.string(),
  scenes: z.array(z.object({ text: z.string() })),
  closing: z.string(),
});

export type Story = z.infer<typeof StorySchema>;
export type StoryData = z.infer<typeof StoryInput>;
export type StoryErrorCode = "config" | "credits" | "busy" | "denied" | "unavailable" | "fail";

export class StoryError extends Error {
  constructor(public status: number, public code: StoryErrorCode, message: string) {
    super(message);
  }
}

const FEELINGS: Record<StoryData["feeling"], { uk: string; en: string }> = {
  calm: { uk: "спокій і тихий відпочинок", en: "calm and quiet rest" },
  sad: { uk: "сум і потреба у теплому товаристві", en: "sadness and a need for warm company" },
  worried: { uk: "хвилювання і пошук опори", en: "worry and finding support" },
  angry: { uk: "злість і потреба в просторі без осуду", en: "anger and a need for space without judgement" },
  proud: { uk: "гордість за маленький особистий крок", en: "pride in a small personal step" },
  curious: { uk: "цікавість і ніжна пригода", en: "curiosity and a gentle adventure" },
};

function failure(status: number, lang: "uk" | "en"): StoryError {
  const code: StoryErrorCode = status === 401 ? "config" : status === 402 ? "credits" : status === 403 ? "denied" : status === 404 ? "unavailable" : status === 429 ? "busy" : "fail";
  const messages: Record<StoryErrorCode, string> = {
    config: "Чарівна казка ще не налаштована. Поки що обери готову казку в Нічному небі.",
    credits: "Магія нових казок тимчасово вичерпана. Дорослий може поповнити кредити Lovable AI, а поки що обери готову казку.",
    busy: "Казкар зараз відпочиває. Зачекай трохи або обери готову казку.",
    denied: "Нові казки зараз недоступні. Обери готову казку в Нічному небі.",
    unavailable: "Казкар зараз недоступний. Обери готову казку в Нічному небі.",
    fail: "Казка цього разу не склалася. Спробуй інший вибір або відкрий готову казку.",
  };
  return new StoryError(status, code, tr(messages[code], lang));
}

/** One streamed Claude call, consumed server-side. Only preset choices are sent; nothing is stored. */
export async function generateStory(input: StoryData): Promise<Story> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw failure(401, input.lang);
  const runIdFetch = createLovableAiGatewayRunIdFetch();
  const anthropic = createAnthropic({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });
  const who = CHARACTERS[input.who];
  const place = PLACES.find((p) => p.id === input.place)!;
  const age = input.age;
  const system = `Ти — український дитячий казкар застосунку «Тихе Місце». Створи лагідну, образну коротку казку для дитини ${age} років.
Головний герой: ${who.name}. Місце: ${place.name}. Емоційна тема: ${FEELINGS[input.feeling].uk}.
Пиши тепло, просто й цікаво, з українськими природними деталями. Жодного насильства, смерті, жахів, осуду, діагнозів, медичних обіцянок або тиску. Жодне почуття не є поганим. Не пропонуй затримувати подих. Не проси особисті дані.
Рівно 4 сцени, кожна — 2–3 прості речення. Завершення — одне ніжне речення, яке лишає надію, але не стверджує, що все ідеально. Не використовуй Markdown.`;
  try {
    const result = streamText({
      model: anthropic("anthropic/claude-sonnet-5"),
      output: Output.object({ schema: StorySchema }),
      system: input.lang === "en" ? `${system}\nWrite the entire story in warm, simple US English. Keep the character's name recognizable.` : system,
      messages: [{ role: "user", content: `Create one new story from these approved choices: ${who.name}, ${place.name}, ${FEELINGS[input.feeling].en}.` }],
      maxOutputTokens: 3000,
      maxRetries: 0,
      providerOptions: { anthropic: { thinking: { type: "adaptive" }, effort: "low" } },
    });
    const out = await result.output;
    const scenes = out.scenes.slice(0, 4).map((scene) => ({ text: scene.text.trim().slice(0, 1400) })).filter((scene) => scene.text.length > 0);
    if (scenes.length !== 4 || !out.title.trim() || !out.closing.trim()) throw failure(422, input.lang);
    return { title: out.title.trim().slice(0, 140), scenes, closing: out.closing.trim().slice(0, 400) };
  } catch (error) {
    if (error instanceof StoryError) throw error;
    if (NoObjectGeneratedError.isInstance(error)) throw failure(422, input.lang);
    const status = Number((error as { statusCode?: number; status?: number })?.statusCode ?? (error as { status?: number })?.status ?? 500);
    throw failure(status, input.lang);
  }
}

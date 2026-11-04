import { createOpenAI } from "@ai-sdk/openai";
import { Output, streamText } from "ai";
import { z } from "zod";
import { CATALOG } from "@/content/catalog";

export const SuggestionSchema = z.object({
  activity: z.string(),
  guide: z.enum(["solomiya", "taras", "olenka", "marko", "daryna", "lihtaryk"]),
  mood: z.enum(["calm", "cheer", "listen", "think"]),
  feeling: z.string(),
  reply: z.string(),
  why: z.string(),
});
export type Suggestion = z.infer<typeof SuggestionSchema>;

export class SuggestError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function suggestActivity(text: string, age: string) {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new SuggestError(500, "config");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  const list = CATALOG.map((a) => `${a.key} — ${a.title}: ${a.desc}`).join("\n");
  const system = `Ти — лагідний помічник дитячого застосунку «Тихе Місце». Дитина віком ${age} років описала, як почувається.
Правила: відповідай українською, коротко (2–3 прості речення у "reply"), тепло, без діагнозів, без оцінок, жодне почуття не є поганим.
Ніколи не тисни, лише пропонуй. Не став запитань про особисті дані.
Якщо дитина пише про небезпеку, насильство, бажання завдати собі шкоди — у "reply" лагідно порадь одразу розповісти дорослому, якому вона довіряє, і обери "clouds-anchor".
"feeling" — одне-два слова, як називається почуття. "why" — одне речення, чому ця вправа може допомогти.
Обери рівно одну вправу з цього списку, поле "activity" — точний ключ:
${list}
"guide" — персонаж: olenka (дихання, сором'язливість), marko (думки, творчість), daryna (сміливість, страх), taras (злість, суперечки, рішення), lihtaryk (почуття), solomiya (сум, історії, сон).`;
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    output: Output.object({ schema: SuggestionSchema }),
    instructions: system,
    messages: [{ role: "user", content: text }],
    providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
  });
  try {
    const out = await result.output;
    if (!CATALOG.some((a) => a.key === out.activity)) out.activity = "clouds-anchor";
    return out;
  } catch (e: unknown) {
    const status = (e as { statusCode?: number })?.statusCode ?? 500;
    throw new SuggestError(status, status === 429 ? "busy" : status === 402 ? "credits" : "fail");
  }
}

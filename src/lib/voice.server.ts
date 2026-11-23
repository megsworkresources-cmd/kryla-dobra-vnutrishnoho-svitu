/** Server-only: turns app-written lines (never child text) into natural speech via Lovable AI. */
const MODEL = "google/gemini-3.1-flash-tts-preview";
const URL = "https://ai.gateway.lovable.dev/v1/audio/speech";
const DEFAULT_TTS_MIME = "audio/wav";
const CACHE_LIMIT = 40;
const audioCache = new Map<string, string>();
const pending = new Map<string, Promise<string>>();

const STYLES: Record<string, [string, string]> = {
  narrator: ["як тепла казкарка", "like a warm storyteller"],
  solomiya: ["як лагідна дівчинка-оповідачка", "like a gentle young girl"],
  olenka: ["як спокійна ніжна дівчинка", "like a calm, soft-spoken girl"],
  daryna: ["як мрійлива тиха дівчинка", "like a dreamy, quiet girl"],
  taras: ["як веселий дружній хлопчик", "like a cheerful, friendly boy"],
  marko: ["як добрий творчий хлопчик", "like a kind, creative boy"],
  lihtaryk: ["як маленький казковий їжачок, грайливо", "like a tiny playful fairy-tale hedgehog"],
};

function toDataUri(raw: ArrayBuffer, contentType: string | null): string {
  const mime = contentType && contentType.includes("audio/") ? contentType : DEFAULT_TTS_MIME;
  const bytes = new Uint8Array(raw);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return `data:${mime};base64,${btoa(binary)}`;
}

export class VoiceError extends Error {}

async function requestSynthesis(
  text: string,
  voice: string,
  lang: "uk" | "en",
  who: string,
): Promise<string> {
  const [ukStyle, enStyle] = STYLES[who] ?? ["як тепла казкарка", "like a warm storyteller"];
  const style = lang === "uk" ? ukStyle : enStyle;
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new VoiceError("config");
  const prompt =
    lang === "uk"
      ? `Промов українською мовою з природною теплою українською вимовою, ${style}, повільно й лагідно для дитини: ${text}`
      : `Say in warm, natural English, ${style}, slowly and gently for a child: ${text}`;
  const res = await fetch(URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
      },
      stream_format: "audio",
    }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error(`Voice request failed [${res.status}]: ${body}`);
    throw new VoiceError(String(res.status));
  }
  const type = res.headers.get("content-type");
  return toDataUri(await res.arrayBuffer(), type);
}

/**
 * Replays and simultaneous requests for the same app line share one result. The
 * bounded process cache avoids repeatedly spending synthesis credits; failures
 * are never cached, and an explicit device-speech fallback remains available.
 */
export async function synthesize(text: string, voice: string, lang: "uk" | "en", who: string) {
  const cacheKey = JSON.stringify([text, voice, lang, who]);
  const cached = audioCache.get(cacheKey);
  if (cached) {
    audioCache.delete(cacheKey);
    audioCache.set(cacheKey, cached);
    return cached;
  }
  const existing = pending.get(cacheKey);
  if (existing) return existing;
  const request = requestSynthesis(text, voice, lang, who);
  pending.set(cacheKey, request);
  try {
    const audio = await request;
    if (audioCache.size >= CACHE_LIMIT) {
      const oldest = audioCache.keys().next().value;
      if (typeof oldest === "string") audioCache.delete(oldest);
    }
    audioCache.set(cacheKey, audio);
    return audio;
  } finally {
    pending.delete(cacheKey);
  }
}

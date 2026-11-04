/** Server-only: turns app-written lines (never child text) into natural speech via Lovable AI. */
const MODEL = "google/gemini-3.1-flash-tts-preview";
const URL = "https://ai.gateway.lovable.dev/v1/audio/speech";

export class VoiceError extends Error {}

export async function synthesize(text: string, voice: string, lang: "uk" | "en", style: string) {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new VoiceError("config");
  const prompt = lang === "uk"
    ? `Промов українською мовою з природною теплою українською вимовою, ${style}, повільно й лагідно для дитини: ${text}`
    : `Say in warm, natural English, ${style}, slowly and gently for a child: ${text}`;
  const res = await fetch(URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } } },
      stream_format: "audio",
    }),
  });
  if (!res.ok) {
    console.error(`Voice request failed [${res.status}]: ${await res.text()}`);
    throw new VoiceError(String(res.status));
  }
  const buf = new Uint8Array(await res.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(bin);
}

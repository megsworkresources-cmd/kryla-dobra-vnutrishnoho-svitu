/** Optional voice guidance via the browser's built-in speech (works offline on most devices). */
export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "uk-UA";
  u.rate = 0.85;
  u.pitch = 1.05;
  const v = window.speechSynthesis.getVoices().find((x) => x.lang.startsWith("uk"));
  if (v) u.voice = v;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}

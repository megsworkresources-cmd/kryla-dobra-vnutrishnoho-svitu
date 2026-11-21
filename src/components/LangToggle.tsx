import { update, useStore } from "@/lib/store";
import { sfx } from "@/lib/audio";

/** Small, always-visible UA / EN language switch. */
export function LangToggle({ night }: { night?: boolean | undefined }) {
  const lang = useStore((s) => s.lang);
  const btn = (l: "uk" | "en", label: string, name: string) => (
    <button
      type="button"
      onClick={() => {
        if (lang !== l) {
          sfx("select");
          update((s) => ({ ...s, lang: l }));
        }
      }}
      aria-pressed={lang === l}
      aria-label={name}
      className={`h-11 min-w-11 rounded-full px-2.5 text-xs font-extrabold press${lang === l ? "bg-primary text-primary-foreground" : night ? "opacity-70" : "opacity-60"}`}
    >
      {label}
    </button>
  );
  return (
    <div
      role="group"
      aria-label="Мова / Language"
      className={`${night ? "night-card" : "paper-card"} flex h-12 shrink-0 items-center gap-0.5 rounded-full px-1`}
    >
      {btn("uk", "UA", "Українська")}
      {btn("en", "EN", "English")}
    </div>
  );
}

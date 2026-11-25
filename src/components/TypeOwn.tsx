import { sfx } from "@/lib/audio";
import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/**
 * Typing is never the only way in. Every field a child can write in also offers
 * ready-made examples they may tap and then change, so a five-year-old who cannot
 * spell yet, or a child who freezes at an empty box, still has a way forward.
 * Tapping only fills the field: nothing is saved unless the activity already saves it.
 */
export function TypedExamples({
  examples,
  value,
  onPick,
  night,
  className = "",
}: {
  examples: readonly string[];
  value: string;
  onPick: (example: string) => void;
  night?: boolean | undefined;
  className?: string;
}) {
  const t = useT();
  return (
    <div className={cn("space-y-2", className)}>
      <p className={cn("text-sm font-bold", night ? "text-moon/75" : "text-muted-foreground")}>
        {t("Або почни з прикладу — і зміни його на своє:")}
      </p>
      <div className="flex flex-wrap gap-2">
        {examples.map((example) => {
          const on = value.trim() === example;
          return (
            <button
              key={example}
              type="button"
              aria-pressed={on}
              onClick={() => {
                sfx("select");
                onPick(example);
              }}
              className={`press min-h-11 items-center rounded-full px-4 text-left text-sm font-bold ${
                on
                  ? "bg-primary text-primary-foreground ring-2 ring-ring"
                  : night
                    ? "bg-night/60 text-moon"
                    : "bg-secondary text-secondary-foreground"
              }`}
            >
              {t(example)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

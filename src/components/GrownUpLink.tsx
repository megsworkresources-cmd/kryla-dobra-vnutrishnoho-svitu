import { useEffect, useRef, useState, type ReactNode } from "react";
import { Btn } from "@/components/Scene";
import { useT } from "@/lib/i18n";

/** Outside links ask a grown-up first (App Store kids rule), then open in a new tab. */
export function GrownUpLink({
  href,
  children,
  className = "inline-flex min-h-11 items-center py-1 underline underline-offset-2",
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  const t = useT();
  const [ask, setAsk] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);

  // Keep keyboard focus inside the grown-up check, close on Escape and restore
  // focus to the link afterwards, so the dialog is usable without a mouse.
  useEffect(() => {
    if (!ask) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const buttons = () =>
      Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    // The safe choice ("Not now") gets focus, never the outbound link.
    const items = buttons();
    items[items.length - 1]?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setAsk(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = buttons();
      if (!focusable.length) return;
      const index = focusable.indexOf(document.activeElement as HTMLButtonElement);
      if (event.shiftKey && index <= 0) {
        event.preventDefault();
        focusable[focusable.length - 1]?.focus();
      } else if (!event.shiftKey && index === focusable.length - 1) {
        event.preventDefault();
        focusable[0]?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [ask]);

  return (
    <>
      <button type="button" onClick={() => setAsk(true)} className={className}>
        {children}
      </button>
      {ask && (
        <div
          ref={dialog}
          role="dialog"
          aria-modal="true"
          aria-label={t("Спершу спитай дорослого")}
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center"
        >
          <div className="paper-card w-full max-w-sm p-5 text-center text-card-foreground">
            <p className="font-display text-2xl font-bold">{t("Спершу спитай дорослого")}</p>
            <p className="mt-2 text-base">
              {t("Це посилання відкриє інший сайт. Дорослий, чи можна?")}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Btn
                onClick={() => {
                  setAsk(false);
                  window.open(href, "_blank", "noopener,noreferrer");
                }}
              >
                {t("Так, відкрити")}
              </Btn>
              <Btn variant="soft" onClick={() => setAsk(false)}>
                {t("Не зараз")}
              </Btn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/** Small "report this answer" control for AI output; signed-in grown-ups only. */
export function ReportAi({ kind, content }: { kind: "story" | "helper"; content: string }) {
  const t = useT();
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  if (state === "done")
    return (
      <p className="text-sm text-muted-foreground">
        {t("Дякуємо, відповідь надіслано на перевірку.")}
      </p>
    );
  return (
    <div className="text-sm">
      <button
        type="button"
        disabled={state === "sending"}
        className="py-1 text-muted-foreground underline"
        onClick={async () => {
          setState("sending");
          try {
            const { reportAiAnswer } = await import("@/lib/account.functions");
            const res = await reportAiAnswer({ data: { kind, content: content.slice(0, 4000) } });
            setState(res.ok ? "done" : "error");
          } catch {
            setState("error");
          }
        }}
      >
        {t("Дорослим: повідомити про погану відповідь ШІ")}
      </button>
      {state === "error" && (
        <p role="alert" className="text-destructive">
          {t("Не вдалося надіслати. Спробуйте ще раз.")}
        </p>
      )}
    </div>
  );
}

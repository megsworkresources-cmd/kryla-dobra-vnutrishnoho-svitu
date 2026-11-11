import { Link, useLocation } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { neighbours } from "@/content/sequence";
import { useT } from "@/lib/i18n";

/** Back / Next buttons shown at the bottom of every page. */
export function BottomNav({ night }: { night?: boolean | undefined; floating?: boolean }) {
  const t = useT();
  const { pathname } = useLocation();
  const { prev, next } = neighbours(pathname);
  if (!prev && !next) return null;
  const card = night ? "night-card" : "paper-card";
  return (
    <>
      {/* Spacer reserves the bar's height so page content never slides underneath it. */}
      <div aria-hidden className="h-[calc(5rem+env(safe-area-inset-bottom))] shrink-0" />
      <div
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-border backdrop-blur-md ${night ? "bg-night-bar" : "bg-background/95"}`}
      >
        <nav
          aria-label={t("Назад і далі")}
          className="mx-auto flex max-w-3xl items-stretch justify-between gap-3 px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2"
        >
          {prev ? (
            <Link
              to={prev.to as never}
              className={`${card} flex min-h-14 max-w-[48%] items-center gap-1 px-4 py-2 text-sm font-bold leading-tight`}
              aria-label={t("Назад: {l}", { l: t(prev.label) })}
            >
              <ChevronLeft className="h-5 w-5 shrink-0" />
              <span className="min-w-0 whitespace-normal [text-wrap:balance]">{t(prev.label)}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to={next.to as never}
              className="flex min-h-14 max-w-[48%] items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-bold leading-tight text-primary-foreground shadow-soft"
              aria-label={t("Далі: {l}", { l: t(next.label) })}
            >
              <span className="min-w-0 whitespace-normal [text-wrap:balance]">{t(next.label)}</span>
              <ChevronRight className="h-5 w-5 shrink-0" />
            </Link>
          ) : (
            <span />
          )}
        </nav>
      </div>
    </>
  );
}

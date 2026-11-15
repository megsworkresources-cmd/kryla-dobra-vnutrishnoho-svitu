import { Link, useLocation } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Map } from "lucide-react";
import { ORDER, neighbours } from "@/content/sequence";
import { useT } from "@/lib/i18n";
import { useEffect, useRef, useState } from "react";

/**
 * Back / Map / Next, shown at the bottom of every page.
 * The bar never disappears: a page outside the gentle path (Settings, a preview)
 * still gets a way back to its own section and an always-visible route to the map.
 */
export function BottomNav({ night }: { night?: boolean | undefined }) {
  const t = useT();
  const { pathname } = useLocation();
  const { prev, next } = neighbours(pathname);
  const bar = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(80);

  const path = pathname.replace(/\/+$/, "") || "/";
  // Pages that are not part of the path step back to their own section first,
  // then to the beginning — so "back" is never a dead end.
  const section = path.split("/").filter(Boolean)[0];
  const sectionStop = section ? ORDER.find((stop) => stop.to === `/${section}`) : undefined;
  const fallback = sectionStop ?? (path !== "/" ? { to: "/", label: "Початок" } : undefined);
  const back = prev ?? (fallback && fallback.to !== path ? fallback : undefined);

  useEffect(() => {
    const element = bar.current;
    if (!element) return;
    const measure = () => setHeight(element.getBoundingClientRect().height);
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [pathname]);

  const card = night ? "night-card" : "paper-card";
  const side =
    "flex min-h-14 min-w-0 flex-1 items-center gap-1 px-4 py-2 text-sm font-bold leading-tight";
  return (
    <>
      {/* Spacer reserves the bar's height so page content never slides underneath it. */}
      <div aria-hidden className="shrink-0" style={{ height }} />
      <div
        ref={bar}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-border backdrop-blur-md ${night ? "bg-night-bar" : "bg-background/95"}`}
      >
        <nav
          aria-label={t("Назад і далі")}
          className="mx-auto flex max-w-3xl items-center gap-2 px-4 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2"
        >
          {back ? (
            <Link
              to={back.to as never}
              className={`${card} ${side} justify-start`}
              aria-label={t("Назад: {l}", { l: t(back.label) })}
            >
              <ChevronLeft className="h-5 w-5 shrink-0" aria-hidden />
              <span className="line-clamp-2 min-w-0 [text-wrap:balance]">{t(back.label)}</span>
            </Link>
          ) : (
            <span className="min-h-14 flex-1" />
          )}

          <Link
            to={"/world" as never}
            aria-label={t("Мапа світу")}
            title={t("Мапа світу")}
            aria-current={path === "/world" ? "page" : undefined}
            className={`${card} grid h-14 w-14 shrink-0 place-items-center rounded-full ${
              path === "/world" ? "ring-4 ring-ring" : ""
            }`}
          >
            <Map className="h-6 w-6" aria-hidden />
          </Link>

          {next ? (
            <Link
              to={next.to as never}
              className={`${side} justify-end rounded-full bg-primary text-primary-foreground shadow-soft`}
              aria-label={t("Далі: {l}", { l: t(next.label) })}
            >
              <span className="line-clamp-2 min-w-0 [text-wrap:balance]">{t(next.label)}</span>
              <ChevronRight className="h-5 w-5 shrink-0" aria-hidden />
            </Link>
          ) : (
            <span className="min-h-14 flex-1" />
          )}
        </nav>
      </div>
    </>
  );
}

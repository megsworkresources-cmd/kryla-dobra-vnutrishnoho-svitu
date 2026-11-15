import { Link, useLocation } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Map } from "lucide-react";
import { ORDER, neighbours } from "@/content/sequence";
import { useT } from "@/lib/i18n";
import { useEffect, useRef, useState } from "react";

/**
 * Back / Map / Next at the bottom of every page, together with the other activities
 * of the place you are in and your place in the whole journey. A child can move from
 * one activity to the next without walking back to the map.
 */
export function BottomNav({ night }: { night?: boolean | undefined }) {
  const t = useT();
  const { pathname } = useLocation();
  const { prev, next } = neighbours(pathname);
  const bar = useRef<HTMLDivElement>(null);
  const chips = useRef<HTMLElement>(null);
  const activeChip = useRef<HTMLAnchorElement>(null);
  const [height, setHeight] = useState(96);

  const path = pathname.replace(/\/+$/, "") || "/";
  const section = path.split("/").filter(Boolean)[0] ?? "";
  const sectionStops = section
    ? ORDER.filter((stop) => stop.to === `/${section}` || stop.to.startsWith(`/${section}/`))
    : [];
  const position = ORDER.findIndex((stop) => stop.to === path);
  const current = position >= 0 ? ORDER[position] : undefined;
  // Pages that are not part of the path step back to their own section first,
  // then to the beginning — so "back" is never a dead end.
  const sectionStop = sectionStops.find((stop) => stop.to === `/${section}`);
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

  // Bring the activity you are in into view inside the scrolling strip.
  useEffect(() => {
    const element = activeChip.current;
    if (!element || !chips.current) return;
    if (typeof element.scrollIntoView !== "function") return;
    element.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [path]);

  const card = night ? "night-card" : "paper-card";
  const progress = position >= 0 ? ((position + 1) / ORDER.length) * 100 : 0;
  return (
    <>
      {/* Spacer reserves the bar's height so page content never slides underneath it. */}
      <div aria-hidden className="shrink-0" style={{ height }} />
      <div
        ref={bar}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-border backdrop-blur-md ${night ? "bg-night-bar" : "bg-background/95"}`}
      >
        <div className="mx-auto w-full max-w-3xl px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2">
          {sectionStops.length > 2 && (
            <nav
              ref={chips}
              aria-label={t("Вправи цього місця")}
              className="no-scrollbar mb-2 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1"
            >
              {sectionStops.map((stop) => {
                const here = stop.to === path;
                return (
                  <Link
                    key={stop.to}
                    ref={here ? activeChip : undefined}
                    to={stop.to as never}
                    activeOptions={{ exact: true }}
                    aria-current={here ? "page" : undefined}
                    className={`flex min-h-11 shrink-0 snap-center items-center rounded-full px-4 text-sm font-bold leading-tight ${
                      here ? "bg-primary text-primary-foreground shadow-soft" : card
                    }`}
                  >
                    {t(stop.label)}
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="mb-1 flex items-baseline gap-2 text-[0.7rem] font-extrabold uppercase tracking-wide">
            <span className="truncate">{t(current?.label ?? "Тихе Місце")}</span>
            {position >= 0 && (
              <span className="ml-auto shrink-0 tabular-nums opacity-70">
                {t("Крок {i} з {n}", { i: position + 1, n: ORDER.length })}
              </span>
            )}
          </div>
          <div className="mb-1.5 h-1 overflow-hidden rounded-full bg-secondary" aria-hidden>
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
          </div>

          <nav
            aria-label={t("Назад і далі")}
            className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2"
          >
            <div className="flex min-w-0">
              {back ? (
                <Link
                  to={back.to as never}
                  activeOptions={{ exact: true }}
                  className={`${card} flex min-h-14 min-w-0 flex-col justify-center gap-0.5 px-3 text-left`}
                  aria-label={t("Назад: {l}", { l: t(back.label) })}
                >
                  <span className="flex items-center gap-1 text-[0.65rem] font-extrabold uppercase tracking-wide opacity-70">
                    <ChevronLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {t("Назад")}
                  </span>
                  <span className="line-clamp-2 min-w-0 text-sm font-bold leading-tight [text-wrap:balance]">
                    {t(back.label)}
                  </span>
                </Link>
              ) : null}
            </div>

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

            <div className="flex min-w-0 justify-end">
              {next ? (
                <Link
                  to={next.to as never}
                  activeOptions={{ exact: true }}
                  className="flex min-h-14 min-w-0 flex-col items-end justify-center gap-0.5 rounded-2xl bg-primary px-3 text-right text-primary-foreground shadow-soft"
                  aria-label={t("Далі: {l}", { l: t(next.label) })}
                >
                  <span className="flex items-center gap-1 text-[0.65rem] font-extrabold uppercase tracking-wide opacity-80">
                    {t("Далі")}
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  </span>
                  <span className="line-clamp-2 min-w-0 text-sm font-bold leading-tight [text-wrap:balance]">
                    {t(next.label)}
                  </span>
                </Link>
              ) : null}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}

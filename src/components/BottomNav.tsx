import { Link, useLocation } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Map } from "lucide-react";
import { ORDER, neighbours } from "@/content/sequence";
import { Glyph } from "./Glyph";
import { useT } from "@/lib/i18n";
import { contentSpacer, useKeyboardInset } from "@/lib/keyboard";
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
  // 0 unless the on-screen keyboard is up, in which case the bar rides above it.
  const keyboard = useKeyboardInset();

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
    const measure = () => {
      const next = element.getBoundingClientRect().height;
      setHeight(next);
      // Shared with the page: scroll padding and "is this under the bar?" checks
      // need the measured height, not a guess.
      document.documentElement.style.setProperty("--bar-h", `${next}px`);
    };
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
  return (
    <>
      {/* Spacer reserves the bar's height, plus the keyboard while it is up, so the
          last controls can still be scrolled clear of both. */}
      <div aria-hidden className="shrink-0" style={{ height: contentSpacer(height, keyboard) }} />
      <div
        ref={bar}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-border backdrop-blur-md ${night ? "bg-night-bar" : "bg-background/95"}`}
        style={keyboard > 0 ? { bottom: keyboard } : undefined}
      >
        <div
          className="mx-auto w-full max-w-3xl px-3 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pt-2"
          style={{
            paddingLeft: "max(0.75rem, env(safe-area-inset-left, 0px))",
            paddingRight: "max(0.75rem, env(safe-area-inset-right, 0px))",
          }}
        >
          {sectionStops.length > 1 && (
            <nav
              ref={chips}
              aria-label={t("Вправи цього місця")}
              className="bar-chip-strip no-scrollbar mb-2 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1"
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
                    className={`press flex min-h-11 shrink-0 snap-center items-center rounded-full px-4 text-sm font-bold leading-tight ${
                      here ? "bg-primary text-primary-foreground shadow-soft" : card
                    }`}
                  >
                    {t(stop.label)}
                  </Link>
                );
              })}
            </nav>
          )}

          <div className="mb-1.5 flex items-stretch gap-2">
            <div className="bar-section-label flex min-w-0 flex-1 items-center">
              {sectionStop && sectionStop.to !== path ? (
                <Link
                  to={sectionStop.to as never}
                  aria-label={t("Відкрити всі вправи цього місця")}
                  className="press flex min-h-11 min-w-0 items-center gap-1 text-xs font-extrabold uppercase tracking-wide"
                >
                  <Glyph name="map" className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{t(sectionStop.label)}</span>
                </Link>
              ) : (
                <p className="flex min-h-11 min-w-0 items-center text-xs font-extrabold uppercase tracking-wide">
                  <span className="truncate">{t(current?.label ?? "Тихе Місце")}</span>
                </p>
              )}
            </div>
            {position >= 0 && (
              <p className="bar-section-label flex shrink-0 items-center text-xs font-bold tabular-nums">
                {t("Місце {i} з {n}", { i: position + 1, n: ORDER.length })}
              </p>
            )}
            {/* Adults look for the resource directory by name: keep it in the bar itself. */}
            <Link
              to="/resources"
              aria-label={t("Ресурси для батьків")}
              aria-current={path === "/resources" ? "page" : undefined}
              className={`${card} press flex min-h-11 shrink-0 items-center gap-1.5 rounded-full px-3 text-[0.7rem] font-extrabold uppercase tracking-wide ${
                path === "/resources" ? "ring-2 ring-ring" : ""
              }`}
            >
              <Glyph name="book" className="h-4 w-4 shrink-0" />
              {t("Дорослим")}
            </Link>
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
                  className={`${card} press flex min-h-14 min-w-0 flex-col justify-center gap-0.5 px-3 text-left`}
                  aria-label={t("Назад: {l}", { l: t(back.label) })}
                >
                  <span className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide opacity-80">
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
              className={`${card} press grid h-14 w-14 shrink-0 place-items-center rounded-full ${
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
                  className="press flex min-h-14 min-w-0 flex-col items-end justify-center gap-0.5 rounded-2xl bg-primary px-3 text-right text-primary-foreground shadow-soft"
                  aria-label={t("Далі: {l}", { l: t(next.label) })}
                >
                  <span className="flex items-center gap-1 text-xs font-extrabold uppercase tracking-wide">
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

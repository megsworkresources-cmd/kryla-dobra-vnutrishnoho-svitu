import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { ArrowLeft, Minus, Plus, Maximize2, X } from "lucide-react";
import map from "@/assets/world-map.jpg";
import { PLACES } from "@/content/places";
import { BottomNav } from "@/components/BottomNav";
import { LangToggle } from "@/components/LangToggle";
import { Glyph } from "@/components/Glyph";
import { t, useT } from "@/lib/i18n";

export const Route = createFileRoute("/explore")({
  head: () => ({
    meta: [
      { title: t("Уся мапа — Тихе Місце") },
      {
        name: "description",
        content: t("Розглянь увесь чарівний світ: наближай, рухай мапу й обирай місце."),
      },
      { property: "og:title", content: t("Уся мапа — Тихе Місце") },
      { property: "og:description", content: t("Наближай мапу й торкайся будь-якого місця.") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Explore,
});

/** Where each place actually appears in the painting (percent of the image). */
const SPOTS: Record<string, { x: number; y: number; icon: string }> = {
  clouds: { x: 30, y: 8, icon: "☁️" },
  sky: { x: 87, y: 5, icon: "🌙" },
  path: { x: 87, y: 19, icon: "🥾" },
  forest: { x: 20, y: 25, icon: "🌳" },
  meadow: { x: 50, y: 38, icon: "🌼" },
  garden: { x: 20, y: 67, icon: "🌻" },
  studio: { x: 57, y: 72, icon: "🎨" },
  safe: { x: 87, y: 81, icon: "🏕️" },
};

function Explore() {
  const t = useT();
  const [sel, setSel] = useState<string | null>(null);
  const place = PLACES.find((p) => p.id === sel);
  const btn = "paper-card flex h-12 w-12 items-center justify-center";

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-ink">
      <header className="z-20 flex items-center justify-between gap-2 p-3">
        <h1 className="sr-only">{t("Уся мапа")}</h1>
        <Link
          to="/world"
          className="paper-card flex h-12 items-center gap-1 px-4 text-sm font-bold"
          aria-label={t("Назад до мапи")}
        >
          <ArrowLeft className="h-5 w-5" />
          <span>{t("Уся мапа")}</span>
        </Link>
        <LangToggle />
      </header>

      <div className="relative min-h-0 flex-1">
        <TransformWrapper
          minScale={1}
          maxScale={5}
          centerOnInit
          doubleClick={{ mode: "zoomIn", step: 0.7 }}
          wheel={{ step: 0.15 }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <TransformComponent
                wrapperStyle={{ width: "100%", height: "100%" }}
                contentStyle={{ height: "100%" }}
              >
                <div className="relative h-full" style={{ aspectRatio: "1088 / 1920" }}>
                  <img
                    loading="lazy"
                    decoding="async"
                    src={map}
                    alt={t("Чарівна долина з лісом, лугом, хмарним замком і нічним небом")}
                    className="h-full w-full select-none rounded-2xl"
                    draggable={false}
                  />
                  {PLACES.map((p) => {
                    const s = SPOTS[p.id];
                    if (!s) return null;
                    const active = sel === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSel(p.id)}
                        aria-label={t(p.name)}
                        aria-pressed={active}
                        className="absolute flex min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center"
                        style={{ left: `${s.x}%`, top: `${s.y}%` }}
                      >
                        <span
                          className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-paper text-lg shadow-lift transition-transform duration-(--dur-base) ease-(--ease-enter) ${active ? "scale-125 bg-primary" : "bg-paper/90"}`}
                          aria-hidden
                        >
                          <Glyph emoji={s.icon} className="h-7 w-7" />
                        </span>
                        <span className="paper-card mt-0.5 whitespace-nowrap px-2 py-0.5 text-xs font-extrabold leading-tight">
                          {t(p.name)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </TransformComponent>
              {/* Bottom-right keeps these off the two right-hand map labels. */}
              {!place && (
                <div
                  className="absolute bottom-3 right-3 z-10 flex gap-2"
                  role="group"
                  aria-label={t("Масштаб")}
                >
                  <button
                    type="button"
                    className={btn}
                    onClick={() => zoomIn()}
                    aria-label={t("Наблизити")}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className={btn}
                    onClick={() => zoomOut()}
                    aria-label={t("Віддалити")}
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className={btn}
                    onClick={() => resetTransform()}
                    aria-label={t("Показати весь світ")}
                  >
                    <Maximize2 className="h-5 w-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </TransformWrapper>

        {place && (
          <div className="absolute inset-x-3 bottom-3 z-20 mx-auto max-w-md animate-fade-up">
            <div className="paper-card flex items-center gap-3 p-3">
              <img
                loading="lazy"
                decoding="async"
                src={place.image}
                alt=""
                className="h-16 w-16 shrink-0 rounded-2xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-bold leading-tight">{t(place.name)}</p>
                <p className="text-sm text-muted-foreground">{t(place.tagline)}</p>
              </div>
              <button
                type="button"
                onClick={() => setSel(null)}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-secondary"
                aria-label={t("Закрити")}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <Link
              to={place.to}
              className="mt-2 flex min-h-12 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground shadow-soft"
            >
              {t("Вирушити сюди")}
            </Link>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}

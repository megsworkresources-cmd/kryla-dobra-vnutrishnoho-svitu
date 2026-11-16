import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Btn } from "@/components/Scene";
import { Settings2, Users } from "lucide-react";
import map from "@/assets/world-map.jpg";
import { PLACES } from "@/content/places";
import { BottomNav } from "@/components/BottomNav";
import { LangToggle } from "@/components/LangToggle";
import { t, useT } from "@/lib/i18n";
import { useWebMCP } from "use-webmcp-tool";
import { runWebMCPTool } from "@/lib/webmcp-telemetry";

export const Route = createFileRoute("/world")({
  head: () => ({
    meta: [
      { title: t("Мапа світу — Тихе Місце") },
      {
        name: "description",
        content: t(
          "Вісім чарівних місць: ліс почуттів, луг дихання, королівство хмар, нічне небо та інші.",
        ),
      },
      { property: "og:title", content: t("Мапа світу — Тихе Місце") },
      { property: "og:description", content: t("Обери, куди вирушити сьогодні.") },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: World,
});

// Balanced zigzag so bubbles never crowd each other on narrow phones.
const SPOTS = [
  [28, 3],
  [72, 14],
  [30, 26],
  [70, 38],
  [28, 50],
  [72, 62],
  [30, 74],
  [70, 86],
] as const;

function World() {
  const t = useT();
  const navigate = useNavigate();
  const [askGames, setAskGames] = useState(false);
  useWebMCP({
    name: "list_world_places",
    description:
      "Read the eight places visible on the current world map. No child data is included.",
    annotations: { readOnlyHint: true },
    execute: () =>
      runWebMCPTool("list_world_places", () =>
        PLACES.map((p) => `${p.id}: ${t(p.name)} — ${p.to}`).join("\n"),
      ),
  });

  return (
    <div className="relative flex min-h-dvh flex-col bg-ink">
      <img
        src={map}
        alt={t("Чарівна долина з лісом, лугом, хмарним замком і нічним небом")}
        width={1088}
        height={1920}
        className="fixed inset-0 h-full w-full object-cover"
      />
      {/* butterflies */}
      <div
        className="pointer-events-none absolute left-[40%] top-[55%] text-xl animate-flutter"
        aria-hidden
      >
        🦋
      </div>

      <header className="sticky top-0 z-20 flex flex-wrap items-center gap-2 p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link
          to="/"
          className="paper-card flex h-12 min-w-0 flex-1 items-center px-4 font-display text-lg font-bold sm:flex-none"
        >
          <span className="truncate">{t("Тихе Місце")}</span>
        </Link>
        <LangToggle />
        <div className="grid w-full grid-cols-6 gap-1 sm:ml-auto sm:flex sm:w-auto sm:shrink-0 sm:items-center sm:gap-2">
          <Link
            to="/explore"
            className="paper-card flex h-12 min-w-11 items-center justify-center gap-1 px-2 text-sm font-bold sm:px-3"
            aria-label={t("Уся мапа")}
          >
            🔍<span className="hidden sm:inline">{t("Уся мапа")}</span>
          </Link>
          <Link
            to="/friends"
            className="paper-card flex h-12 min-w-11 items-center justify-center gap-1 px-2 text-sm font-bold sm:px-3"
            aria-label={t("Мої друзі-персонажі")}
          >
            <Users className="h-5 w-5" />
            <span className="hidden sm:inline">{t("Друзі")}</span>
          </Link>
          <button
            type="button"
            onClick={() => setAskGames(true)}
            className="paper-card flex h-12 min-w-11 items-center justify-center gap-1 px-2 text-sm font-bold sm:px-3"
            aria-label={t("Ігри")}
          >
            🎮<span className="hidden sm:inline">{t("Ігри")}</span>
          </button>
          <Link
            to="/watch"
            className="paper-card flex h-12 min-w-11 items-center justify-center gap-1 px-2 text-sm font-bold sm:px-3"
            aria-label={t("Мультики")}
          >
            📺<span className="hidden sm:inline">{t("Мультики")}</span>
          </Link>
          <Link
            to="/helper"
            className="paper-card flex h-12 min-w-11 items-center justify-center gap-1 px-2 text-sm font-bold sm:px-3"
            aria-label={t("Розкажи, як ти почуваєшся")}
          >
            💬<span className="hidden sm:inline">{t("Розкажи")}</span>
          </Link>
          <Link
            to="/settings"
            className="paper-card flex h-12 min-w-11 items-center justify-center px-2 sm:px-3"
            aria-label={t("Налаштування")}
          >
            <Settings2 className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <nav aria-label={t("Місця світу")} className="relative z-10 min-h-[56rem] flex-1">
        {PLACES.map((p, i) => (
          <Link
            key={p.id}
            to={p.to}
            className="group absolute flex min-h-11 min-w-11 -translate-x-1/2 flex-col items-center justify-center animate-fade-up"
            style={{
              left: `${SPOTS[i % SPOTS.length]![0]}%`,
              top: `${SPOTS[i % SPOTS.length]![1]}%`,
              animationDelay: `${i * 80}ms`,
            }}
          >
            <span className="flex flex-col items-center">
              <span className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-paper shadow-lift transition group-hover:scale-110 group-active:scale-95 sm:h-24 sm:w-24">
                <img src={p.image} alt="" className="h-full w-full object-cover" loading="lazy" />
              </span>
              <span className="paper-card mt-1 whitespace-nowrap px-3 py-1 text-xs font-extrabold">
                {t(p.name)}
              </span>
            </span>
          </Link>
        ))}
      </nav>
      {askGames && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="games-consent-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-center"
        >
          <div className="paper-card w-full max-w-sm p-5 text-center">
            <h2 id="games-consent-title" className="font-display text-2xl font-bold">
              {t("Спершу спитай дорослого")}
            </h2>
            <p className="mt-2 text-base">{t("Дорослий, чи можна дитині зараз пограти в ігри?")}</p>
            <div className="mt-4 flex flex-col gap-2">
              <Btn onClick={() => navigate({ to: "/games" })}>{t("Так, можна грати")}</Btn>
              <Btn variant="soft" onClick={() => setAskGames(false)}>
                {t("Не зараз")}
              </Btn>
            </div>
          </div>
        </div>
      )}
      <BottomNav />
    </div>
  );
}

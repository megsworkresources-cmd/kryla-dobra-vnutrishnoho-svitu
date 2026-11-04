import { createFileRoute, Link } from "@tanstack/react-router";
import { Settings2, Users } from "lucide-react";
import map from "@/assets/world-map.jpg";
import { PLACES } from "@/content/places";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/world")({
  head: () => ({
    meta: [
      { title: "Мапа світу — Тихе Місце" },
      { name: "description", content: "Вісім чарівних місць: ліс почуттів, луг дихання, королівство хмар, нічне небо та інші." },
      { property: "og:title", content: "Мапа світу — Тихе Місце" },
      { property: "og:description", content: "Обери, куди вирушити сьогодні." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: World,
});

function World() {

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-ink">
      <img src={map} alt="Чарівна долина з лісом, лугом, хмарним замком і нічним небом" width={1088} height={1920} className="absolute inset-0 h-full w-full object-cover" />
      {/* butterflies */}
      <div className="pointer-events-none absolute left-[40%] top-[55%] text-xl animate-flutter" aria-hidden>🦋</div>

      <header className="relative z-20 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 p-3">
        <Link to="/" className="paper-card flex h-12 min-w-0 items-center justify-self-start px-4 font-display text-lg font-bold"><span className="truncate">Тихе Місце</span></Link>
        <div className="flex shrink-0 gap-2">
          <Link to="/friends" className="paper-card flex h-12 items-center gap-1 px-3 text-sm font-bold" aria-label="Мої друзі-персонажі"><Users className="h-5 w-5" /><span className="hidden sm:inline">Друзі</span></Link>
          <Link to="/helper" className="paper-card flex h-12 items-center gap-1 px-3 text-sm font-bold" aria-label="Розкажи, як ти почуваєшся">💬<span className="hidden sm:inline">Розкажи</span></Link>
          <Link to="/settings" className="paper-card flex h-12 w-12 items-center justify-center" aria-label="Налаштування"><Settings2 className="h-5 w-5" /></Link>
        </div>
      </header>


      <nav aria-label="Місця світу" className="relative z-10 min-h-0 flex-1">
        {PLACES.map((p, i) => (
          <Link key={p.id} to={p.to}
            className="group absolute -translate-x-1/2 animate-fade-up"
            style={{ left: `${Math.min(Math.max(p.x, 18), 82)}%`, top: `${p.y * 0.8 + 1}%`, animationDelay: `${i * 80}ms` }}>
            <span className="flex flex-col items-center">
              <span className="relative h-14 w-14 overflow-hidden rounded-full border-4 border-paper shadow-lift transition group-hover:scale-110 group-active:scale-95 sm:h-16 sm:w-16">
                <img src={p.image} alt="" className="h-full w-full object-cover" loading="lazy" />
              </span>
              <span className="paper-card mt-1 whitespace-nowrap px-3 py-1 text-xs font-extrabold">{p.name}</span>
            </span>
          </Link>
        ))}
      </nav>
      <BottomNav />
    </div>
  );
}

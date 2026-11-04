import { createFileRoute, Link } from "@tanstack/react-router";
import welcome from "@/assets/welcome.jpg";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Тихе Місце — світ, де можна бути собою" },
      { name: "description", content: "Український чарівний світ для дітей 5–13 років: почуття, дихання, казки, творчість і сміливість." },
      { property: "og:title", content: "Тихе Місце — світ, де можна бути собою" },
      { property: "og:description", content: "Почуття, дихання, казки й творчість для дітей. Без реєстрації, без реклами." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-paper">
      <img src={welcome} alt="Соняшникове поле, біла хатка й річка на світанку" width={1088} height={1920} className="absolute inset-0 h-full w-full object-cover animate-kenburns" />
      <div className="absolute inset-0 veil-bottom" aria-hidden />
      {/* drifting dandelion seeds */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {[12, 38, 64, 80].map((l, i) => (
          <span key={l} className="absolute h-2 w-2 rounded-full bg-paper/80 animate-float" style={{ left: `${l}%`, top: `${18 + i * 9}%`, animationDelay: `${i * 0.8}s` }} />
        ))}
      </div>
      <div className="relative z-10 mt-auto px-6 pb-4 text-center animate-fade-up">
        <h1 className="font-display text-6xl font-bold text-ink drop-shadow-sm sm:text-7xl">Тихе Місце</h1>
        <p className="mt-3 font-display text-2xl text-ink">Тут ти можеш бути собою</p>
        <p className="mx-auto mt-2 max-w-sm text-base text-muted-foreground">
          Чарівний світ, де можна відчувати, мріяти, дихати й відпочивати — скільки захочеш.
        </p>
        <Link
          to="/world"
          className="mt-8 inline-flex min-h-14 items-center rounded-full bg-primary px-9 text-lg font-extrabold text-primary-foreground shadow-lift transition active:scale-95"
        >
          Увійти у свій світ
        </Link>
        <div className="mt-6">
          <Link to="/parents" className="text-sm font-semibold text-muted-foreground underline underline-offset-4">
            Для дорослих
          </Link>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

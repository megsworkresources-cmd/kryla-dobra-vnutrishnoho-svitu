import { Link, useLocation, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Heart, Home, Map, Settings2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { CharacterSay } from "./Character";
import { LangToggle } from "./LangToggle";
import { toggleFavorite, useStore } from "@/lib/store";
import { sfx } from "@/lib/audio";
import { useT } from "@/lib/i18n";
import { castFor, cheerOf, type CharId } from "@/content/characters";

interface SceneProps {
  image?: string;
  night?: boolean | undefined;
  title?: string;
  /** Where Back goes. Defaults to browser history, falls back to /world. */
  back?: string;
  favHref?: string;
  children: ReactNode;
  /** Image takes top portion only; content sits on paper below. */
  compact?: boolean;
}

/** Shared screen frame: illustrated backdrop, top menu (back, home, map, settings) and bottom Back/Next. */
export function Scene({ image, night, title, back, favHref, children, compact }: SceneProps) {
  const router = useRouter();
  const favs = useStore((s) => s.favorites);
  const isFav = favHref ? favs.includes(favHref) : false;
  const btn = `${night ? "night-card" : "paper-card"} flex h-12 items-center justify-center transition active:scale-90`;

  return (
    <div className={`relative flex min-h-dvh flex-col overflow-x-clip ${night ? "bg-night text-moon" : "bg-paper"}`}>
      {image && (
        <div className={`absolute inset-x-0 top-0 ${compact ? "h-[46vh]" : "h-full"} overflow-hidden`} aria-hidden>
          <img src={image} alt="" className="h-full w-full object-cover animate-kenburns" />
          <div className={`absolute inset-0 ${night ? "veil-night" : "veil-bottom"}`} />
        </div>
      )}
      <header className="relative z-20 mx-auto flex w-full max-w-3xl items-center gap-2 px-4 pt-4">
        <button
          onClick={() => (back ? router.navigate({ to: back }) : window.history.length > 1 ? router.history.back() : router.navigate({ to: "/world" }))}
          className={`${btn} gap-1.5 px-4 text-sm font-bold`}
          aria-label="Назад"
        >
          <ArrowLeft className="h-5 w-5" /> Назад
        </button>
        <Link to="/" className={`${btn} w-12`} aria-label="Додому"><Home className="h-5 w-5" /></Link>
        <Link to="/world" className={`${btn} w-12`} aria-label="Мапа світу (головне меню)"><Map className="h-5 w-5" /></Link>
        <div className="flex-1" />
        {favHref && (
          <button onClick={() => { sfx("confirm"); toggleFavorite(favHref); }} className={`${btn} w-12`} aria-pressed={isFav}
            aria-label={isFav ? "Прибрати з мого безпечного місця" : "Додати в моє безпечне місце"}>
            <Heart className={`h-5 w-5 ${isFav ? "fill-rose text-rose" : ""}`} />
          </button>
        )}
        <Link to="/settings" className={`${btn} w-12`} aria-label="Налаштування звуку й екрана"><Settings2 className="h-5 w-5" /></Link>
      </header>
      {title && <h1 className="relative z-20 mx-auto mt-3 w-full max-w-3xl px-4 font-display text-2xl font-bold drop-shadow-sm sm:text-3xl">{title}</h1>}
      <main className="relative z-10 mx-auto w-full max-w-3xl flex-1 animate-fade-up px-4 pb-6 pt-4">{children}</main>
      <BottomNav night={night} />
    </div>
  );
}

export function DoneCard({ text, again, night, who }: { text: string; again?: () => void; night?: boolean; who?: CharId }) {
  const { pathname } = useLocation();
  const hero = who ?? castFor(pathname.split("/")[1] ?? "")[0];
  const [cheer] = useState(() => cheerOf(hero));
  useEffect(() => { sfx("complete"); }, []);
  return (
    <div className={`${night ? "night-card" : "paper-card"} relative animate-pop overflow-hidden p-6 text-center`}>
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {[8, 22, 40, 58, 74, 90].map((l, i) => <span key={l} className="absolute top-0 text-xl animate-petal" style={{ left: `${l}%`, animationDelay: `${i * 0.25}s` }}>🌼</span>)}
      </div>
      <CharacterSay who={hero} night={night} mood="cheer" size="lg" text={`${cheer} ${text}`} />
      <p className={`mt-4 text-base ${night ? "opacity-80" : "text-muted-foreground"}`}>🌻 Твій соняшник у саду трохи підріс.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {again && <Btn variant="soft" onClick={again}>Ще раз</Btn>}
        <Link to="/garden" className="flex min-h-12 items-center rounded-full bg-honey px-5 font-bold text-accent-foreground shadow-soft">Подивитися на соняшник</Link>
      </div>
    </div>
  );
}

export function Btn({ children, onClick, variant = "primary", disabled, className = "", ...rest }: {
  children: ReactNode; onClick?: () => void; variant?: "primary" | "soft" | "honey" | "ghost"; disabled?: boolean; className?: string; "aria-label"?: string; "aria-pressed"?: boolean;
}) {
  const v = {
    primary: "bg-primary text-primary-foreground",
    soft: "bg-secondary text-secondary-foreground",
    honey: "bg-honey text-accent-foreground",
    ghost: "border-2 border-current bg-transparent",
  }[variant];
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={`min-h-12 rounded-full px-5 font-bold shadow-soft transition hover:brightness-105 active:scale-95 disabled:opacity-40 ${v} ${className}`} {...rest}>
      {children}
    </button>
  );
}

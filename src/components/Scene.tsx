import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Heart, Map } from "lucide-react";
import type { ReactNode } from "react";
import { toggleFavorite, useStore } from "@/lib/store";

interface SceneProps {
  image?: string;
  night?: boolean;
  title?: string;
  /** Where Back goes. Defaults to browser history, falls back to /world. */
  back?: string;
  favHref?: string;
  children: ReactNode;
  /** Image takes top portion only; content sits on paper below. */
  compact?: boolean;
}

/** Shared screen frame: illustrated backdrop + consistent top navigation. */
export function Scene({ image, night, title, back, favHref, children, compact }: SceneProps) {
  const router = useRouter();
  const favs = useStore((s) => s.favorites);
  const isFav = favHref ? favs.includes(favHref) : false;
  const btn = night
    ? "night-card"
    : "paper-card";

  return (
    <div className={`relative min-h-dvh overflow-hidden ${night ? "bg-night text-moon" : "bg-paper"}`}>
      {image && (
        <div className={`absolute inset-x-0 top-0 ${compact ? "h-[46vh]" : "h-full"} overflow-hidden`} aria-hidden>
          <img src={image} alt="" className="h-full w-full object-cover animate-kenburns" />
          <div className={`absolute inset-0 ${night ? "veil-night" : "veil-bottom"}`} />
        </div>
      )}
      <header className="relative z-20 mx-auto flex max-w-3xl items-center gap-2 px-4 pt-4">
        <button
          onClick={() => (back ? router.navigate({ to: back }) : window.history.length > 1 ? router.history.back() : router.navigate({ to: "/world" }))}
          className={`${btn} flex h-12 items-center gap-1.5 px-4 text-sm font-bold`}
          aria-label="Назад"
        >
          <ArrowLeft className="h-5 w-5" /> Назад
        </button>
        <Link to="/world" className={`${btn} flex h-12 w-12 items-center justify-center`} aria-label="До мапи світу">
          <Map className="h-5 w-5" />
        </Link>
        {title && <h1 className="ml-1 flex-1 truncate text-lg font-bold drop-shadow-sm">{title}</h1>}
        {!title && <div className="flex-1" />}
        {favHref && (
          <button
            onClick={() => toggleFavorite(favHref)}
            className={`${btn} flex h-12 w-12 items-center justify-center`}
            aria-pressed={isFav}
            aria-label={isFav ? "Прибрати з мого безпечного місця" : "Додати в моє безпечне місце"}
          >
            <Heart className={`h-5 w-5 ${isFav ? "fill-rose text-rose" : ""}`} />
          </button>
        )}
      </header>
      <main className="relative z-10 mx-auto max-w-3xl px-4 pb-10 pt-4">{children}</main>
    </div>
  );
}

export function DoneCard({ text, again, night }: { text: string; again?: () => void; night?: boolean }) {
  return (
    <div className={`${night ? "night-card" : "paper-card"} animate-fade-up p-6 text-center`}>
      <div className="mx-auto mb-3 text-4xl" aria-hidden>🌻</div>
      <p className="font-display text-xl font-bold">{text}</p>
      <p className={`mt-2 text-sm ${night ? "opacity-80" : "text-muted-foreground"}`}>Твій соняшник у саду трохи підріс.</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {again && (
          <button onClick={again} className="h-12 rounded-full bg-secondary px-5 font-bold text-secondary-foreground">
            Ще раз
          </button>
        )}
        <Link to="/world" className="flex h-12 items-center rounded-full bg-primary px-5 font-bold text-primary-foreground">
          До мапи світу
        </Link>
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
    <button onClick={onClick} disabled={disabled} className={`min-h-12 rounded-full px-5 font-bold shadow-soft transition active:scale-95 disabled:opacity-40 ${v} ${className}`} {...rest}>
      {children}
    </button>
  );
}

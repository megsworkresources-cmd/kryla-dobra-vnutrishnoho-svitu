import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Heart, Home, Map, Settings2 } from "lucide-react";
import { useEffect, useState, type ReactNode, type CSSProperties } from "react";
import { BottomNav } from "./BottomNav";
import { CharacterSay } from "./Character";
import { LangToggle } from "./LangToggle";
import { careCount, growthStage, toggleFavorite, useStore } from "@/lib/store";
import { sfx } from "@/lib/audio";
import { MagicStage } from "./MagicStage";
import { Glyph } from "./Glyph";
import { useT } from "@/lib/i18n";
import { castFor, cheerOf, type CharId } from "@/content/characters";
import { FINAL_GROWTH_STAGE, growthGlyph } from "@/content/growth";
import { cn } from "@/lib/utils";

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
  const t = useT();
  const favs = useStore((s) => s.favorites);
  const isFav = favHref ? favs.includes(favHref) : false;
  const btn = `${night ? "night-card" : "paper-card"} press flex h-12 min-w-11 items-center justify-center`;

  return (
    <div
      className={`relative flex min-h-dvh flex-col overflow-x-clip ${night ? "bg-night text-moon" : "bg-paper"}`}
    >
      {image && (
        <div
          className={`absolute inset-x-0 top-0 ${compact ? "h-[46vh]" : "h-full"} overflow-hidden`}
          aria-hidden
        >
          <img src={image} alt="" className="h-full w-full object-cover animate-kenburns" />
          <div className={`absolute inset-0 ${night ? "veil-night" : "veil-bottom"}`} />
        </div>
      )}
      <header className="relative z-20 mx-auto flex w-full max-w-3xl items-center gap-1 px-2 pt-[max(1rem,env(safe-area-inset-top))] sm:gap-2 sm:px-4">
        <button
          onClick={() =>
            back
              ? router.navigate({ to: back })
              : window.history.length > 1
                ? router.history.back()
                : router.navigate({ to: "/world" })
          }
          className={`${btn} gap-1.5 px-3 text-sm font-bold sm:px-4`}
          aria-label={t("Назад")}
        >
          <ArrowLeft className="h-5 w-5 shrink-0" />
          <span className="hidden min-[480px]:inline">{t("Назад")}</span>
        </button>
        <Link to="/" className={`${btn} w-12`} aria-label={t("Додому")}>
          <Home className="h-5 w-5" />
        </Link>
        <Link to="/world" className={`${btn} w-12`} aria-label={t("Мапа світу (головне меню)")}>
          <Map className="h-5 w-5" />
        </Link>
        <div className="flex-1" />
        {favHref && (
          <button
            onClick={() => {
              sfx("confirm");
              toggleFavorite(favHref);
            }}
            className={`${btn} w-12`}
            aria-pressed={isFav}
            aria-label={
              isFav ? t("Прибрати з мого безпечного місця") : t("Додати в моє безпечне місце")
            }
          >
            <Heart className={`h-5 w-5 ${isFav ? "fill-rose text-rose" : ""}`} />
          </button>
        )}
        <LangToggle night={night} />
        <Link
          to="/settings"
          className={`${btn} w-12`}
          aria-label={t("Налаштування звуку й екрана")}
        >
          <Settings2 className="h-5 w-5" />
        </Link>
      </header>
      {title && (
        <div className="relative z-20 mx-auto mt-3 w-full max-w-3xl px-4">
          <h1
            className={`inline-block rounded-2xl px-4 py-2 font-display text-2xl font-bold shadow-soft backdrop-blur-sm sm:text-3xl ${
              night ? "bg-night/60 text-moon" : "bg-paper/85 text-ink"
            }`}
          >
            {t(title)}
          </h1>
        </div>
      )}
      <div className="relative z-10 mx-auto w-full max-w-3xl flex-1 animate-fade-up px-4 pb-6 pt-4">
        {children}
      </div>
      <BottomNav night={night} />
    </div>
  );
}

export function DoneCard({
  text,
  again,
  night,
  who,
}: {
  text: string;
  again?: () => void;
  night?: boolean;
  who?: CharId;
}) {
  // DoneCard also renders without a router — in tests and previews of a single screen —
  // so the section comes from the address bar, which holds the same value.
  const pathname = typeof window === "undefined" ? "/" : window.location.pathname;
  const t = useT();
  const hero = who ?? castFor(pathname.split("/")[1] ?? "")[0];
  // The card shows the sunflower the child actually has, not a fixed promise.
  const stage = growthStage(useStore((s) => careCount(s)));
  const [cheer] = useState(() => cheerOf(hero));
  useEffect(() => {
    sfx("complete");
  }, []);
  return (
    <div
      className={`${night ? "night-card" : "paper-card"} relative animate-pop overflow-hidden p-6 text-center`}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {[8, 22, 40, 58, 74, 90].map((l, i) => (
          <Glyph
            key={l}
            name="flower"
            className="absolute top-0 h-5 w-5 animate-petal"
            style={{ left: `${l}%`, animationDelay: `${i * 0.25}s` }}
          />
        ))}
      </div>
      <p
        className={`relative z-10 mx-auto mb-3 flex w-fit items-center justify-center gap-2 rounded-full px-3 py-1 text-base backdrop-blur-sm ${night ? "bg-night/60 opacity-80" : "bg-paper/85 text-muted-foreground"}`}
      >
        <Glyph emoji={growthGlyph(stage)} className="h-7 w-7" />
        <span>
          {stage === FINAL_GROWTH_STAGE
            ? t("Твій соняшник розквіт! 🌻")
            : t("Твоя стадія: {n} з 5", { n: stage })}
        </span>
      </p>
      <CharacterSay who={hero} night={night} mood="cheer" size="lg" text={`${t(cheer)} ${text}`} />
      <div className="mt-4">
        <MagicStage
          theme={pathname.split("/")[1] ?? "meadow"}
          night={night}
          count={8}
          label={t("Святкове небо: торкайся, щоб засвітити")}
        />
      </div>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {again && (
          <Btn variant="soft" onClick={again}>
            {t("Ще раз")}
          </Btn>
        )}
        <Link
          to="/garden"
          className="flex min-h-12 items-center rounded-full bg-honey px-5 font-bold text-accent-foreground shadow-soft"
        >
          {t("Подивитися на соняшник")}
        </Link>
      </div>
    </div>
  );
}

export function Btn({
  children,
  onClick,
  variant = "primary",
  disabled,
  className = "",
  type = "button",
  ...rest
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "soft" | "honey" | "ghost";
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
  "aria-pressed"?: boolean;
  type?: "button" | "submit" | "reset";
}) {
  const v = {
    primary: "bg-primary text-primary-foreground",
    soft: "bg-secondary text-secondary-foreground",
    honey: "bg-honey text-accent-foreground",
    ghost: "border-2 border-current bg-transparent",
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "press min-h-12 min-w-11 rounded-full px-5 font-bold shadow-soft hover:brightness-105 disabled:cursor-not-allowed disabled:saturate-50",
        "inline-flex min-h-12 min-w-11 items-center justify-center gap-2 rounded-full px-5 text-center font-bold shadow-soft transition hover:brightness-105 active:scale-95 disabled:cursor-not-allowed disabled:saturate-50",
        v,
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}

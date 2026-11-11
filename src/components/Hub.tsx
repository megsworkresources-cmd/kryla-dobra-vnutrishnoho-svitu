import { Link } from "@tanstack/react-router";
import { Check, ChevronRight } from "lucide-react";
import { Scene } from "./Scene";
import { useStore } from "@/lib/store";
import { CharacterSay } from "./Character";
import { useT } from "@/lib/i18n";
import { castFor, CHARACTERS } from "@/content/characters";

export interface HubItem {
  id: string;
  title: string;
  desc: string;
  href: string;
  params?: Record<string, string>;
  mins?: string;
  mark: string; // small symbol for the item
}

export function Hub({
  image,
  title,
  intro,
  items,
  night,
}: {
  image: string;
  title: string;
  intro: string;
  items: HubItem[];
  night?: boolean;
}) {
  const t = useT();
  const done = useStore((s) => s.completed);
  const guide = castFor(items[0]?.id ?? "")[0];
  const count = items.filter((it) => done[it.id]).length;
  return (
    <Scene image={image} night={night} back="/world" compact>
      <div className="pt-[12vh]">
        <h1
          className={`inline-block rounded-2xl px-4 py-2 font-display text-4xl font-bold shadow-soft backdrop-blur-sm ${
            night ? "bg-night/60 text-moon" : "bg-paper/85 text-ink"
          }`}
        >
          {t(title)}
        </h1>
        <div className="mt-3">
          <CharacterSay
            who={guide}
            night={night}
            text={`${t(CHARACTERS[guide].greet)} ${t(intro)}`}
          />
        </div>
        <p className="mt-4 text-sm font-bold" aria-live="polite">
          {t("Спробувано: {n} з {m}", { n: count, m: items.length })}
        </p>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-sage transition-all"
            style={{ width: `${(count / items.length) * 100}%` }}
          />
        </div>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map((it, i) => (
            <li key={it.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <Link
                to={it.href}
                params={it.params as never}
                className={`${night ? "night-card" : "paper-card"} flex min-h-20 items-center gap-4 p-4 transition active:scale-[.98]`}
              >
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${night ? "bg-dusk" : "bg-secondary"}`}
                  aria-hidden
                >
                  {it.mark}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-bold">
                    {t(it.title)}
                    {done[it.id] ? (
                      <Check className="h-4 w-4 text-sage" aria-label={t("вже пробував")} />
                    ) : null}
                  </span>
                  <span
                    className={`block text-sm ${night ? "opacity-75" : "text-muted-foreground"}`}
                  >
                    {t(it.desc)}
                    {it.mins ? ` · ${t(it.mins)}` : ""}
                  </span>
                </span>
                <ChevronRight className="h-5 w-5 opacity-50" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </Scene>
  );
}

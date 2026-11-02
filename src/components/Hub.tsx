import { Link } from "@tanstack/react-router";
import { Check, ChevronRight } from "lucide-react";
import { Scene } from "./Scene";
import { useStore } from "@/lib/store";

export interface HubItem {
  id: string;
  title: string;
  desc: string;
  href: string;
  params?: Record<string, string>;
  mins?: string;
  mark: string; // small symbol for the item
}

export function Hub({ image, title, intro, items, night }: { image: string; title: string; intro: string; items: HubItem[]; night?: boolean }) {
  const done = useStore((s) => s.completed);
  return (
    <Scene image={image} night={night} back="/world" compact>
      <div className="pt-[24vh]">
        <h1 className={`font-display text-4xl font-bold drop-shadow-sm ${night ? "text-moon" : "text-ink"}`}>{title}</h1>
        <p className={`mt-2 max-w-md text-base ${night ? "opacity-85" : "text-muted-foreground"}`}>{intro}</p>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map((it, i) => (
            <li key={it.id} className="animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <Link to={it.href} params={it.params as never}
                className={`${night ? "night-card" : "paper-card"} flex min-h-20 items-center gap-4 p-4 transition active:scale-[.98]`}>
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl ${night ? "bg-dusk" : "bg-secondary"}`} aria-hidden>{it.mark}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-bold">
                    {it.title}
                    {done[it.id] ? <Check className="h-4 w-4 text-sage" aria-label="вже пробував" /> : null}
                  </span>
                  <span className={`block text-sm ${night ? "opacity-75" : "text-muted-foreground"}`}>{it.desc}{it.mins ? ` · ${it.mins}` : ""}</span>
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

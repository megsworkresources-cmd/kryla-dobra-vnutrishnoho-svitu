import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Btn, Scene } from "@/components/Scene";
import { CharacterSay } from "@/components/Character";
import { placeImage } from "@/content/places";
import { pageHead } from "@/content/journeys";
import { COUNT } from "@/content/play.i18n";
import type { Bi } from "@/content/adventures.i18n";
import { chime } from "@/lib/audio";
import { markDone } from "@/lib/store";
import { useLang, useT } from "@/lib/i18n";

export const Route = createFileRoute("/count")({
  head: () => pageHead("Уважний луг", "Розглянь луг і порахуй метеликів, сонечок і соняшники."),
  component: Count,
});

/** Deterministic spread so server and client markup match. */
function spots(seed: number, total: number) {
  return Array.from({ length: total }, (_, i) => {
    const a = (i * 47 + seed * 31) % 89;
    return { x: 6 + ((a * 13) % 86), y: 8 + ((i * 29 + seed * 17) % 80) };
  });
}

/** Three answer choices that always include the right one. */
export function choices(n: number) {
  return [n - 1, n, n + 1].filter((v) => v > 0);
}

function Count() {
  const t = useT();
  const lang = useLang();
  const L = (x: Bi) => (lang === "en" ? x.en : x.uk);
  const [play, setPlay] = useState(0);
  const [i, setI] = useState(0);
  const [msg, setMsg] = useState<Bi>(COUNT.intro);
  const round = COUNT.rounds[i % COUNT.rounds.length]!;
  const done = i >= COUNT.rounds.length;
  const items = useMemo(() => {
    const list = [...Array(round.n).fill(round.icon), ...round.others.flatMap((o) => [o, o, o])] as string[];
    return spots(i + play * 5, list.length).map((p, k) => ({ ...p, icon: list[k]! }));
  }, [round, i, play]);
  useEffect(() => { if (done) markDone("count"); }, [done]);

  const answer = (v: number) => {
    if (v === round.n) { chime(600); setMsg(COUNT.right); setI((x) => x + 1); }
    else { chime(300); setMsg(COUNT.again); }
  };

  return (
    <Scene title="Уважний луг" back="/world" compact>
      <div className="space-y-4">
        <CharacterSay who="taras" text={L(done ? COUNT.done : msg)} mood={done ? "cheer" : "talk"} />
        {!done && (
          <>
            <div className="relative mx-auto aspect-[4/3] w-full max-w-xl overflow-hidden rounded-3xl shadow-soft">
              <img src={placeImage("meadow")} alt="" className="h-full w-full object-cover" />
              {items.map((it, k) => (
                <span key={k} aria-hidden className="absolute -translate-x-1/2 -translate-y-1/2 text-2xl drop-shadow sm:text-3xl" style={{ left: `${it.x}%`, top: `${it.y}%` }}>{it.icon}</span>
              ))}
            </div>
            <p className="text-center font-display text-xl font-bold" aria-live="polite">{L(COUNT.ask).replace("{x}", `${round.icon} ${L(round.name)}`)}</p>
            <div className="flex justify-center gap-3">
              {choices(round.n).map((v) => <Btn key={v} variant="honey" className="min-w-16 text-xl" onClick={() => answer(v)}>{v}</Btn>)}
            </div>
            <p className="text-center text-sm">{t("Раунд {n} із {m}", { n: i + 1, m: COUNT.rounds.length })}</p>
          </>
        )}
        {done && <div className="flex justify-center"><Btn onClick={() => { setI(0); setPlay((p) => p + 1); setMsg(COUNT.intro); }}>{t("Ще раз")}</Btn></div>}
      </div>
    </Scene>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Btn, Scene } from "@/components/Scene";
import { CharacterSay } from "@/components/Character";
import { pageHead } from "@/content/journeys";
import { TOGETHER } from "@/content/play.i18n";
import type { Bi } from "@/content/adventures.i18n";
import { chime } from "@/lib/audio";
import { markDone } from "@/lib/store";
import { useLang, useT } from "@/lib/i18n";

export const Route = createFileRoute("/together")({
  head: () => pageHead("Разом", "Гра для дитини й дорослого: картки на увагу, слухання й тепло."),
  component: Together,
});

function Together() {
  const t = useT();
  const lang = useLang();
  const L = (x: Bi) => (lang === "en" ? x.en : x.uk);
  const [i, setI] = useState(-1);
  const [count, setCount] = useState(0);
  const card = i >= 0 ? TOGETHER.cards[i % TOGETHER.cards.length] : undefined;
  const draw = () => {
    chime(520);
    setI((x) => x + 1);
    setCount((n) => { if (n + 1 === 3) markDone("together"); return n + 1; });
  };
  return (
    <Scene title="Разом" back="/world" compact>
      <div className="space-y-4">
        <CharacterSay who="daryna" text={L(TOGETHER.intro)} />
        <div aria-live="polite" className="paper-card mx-auto flex min-h-40 max-w-md items-center justify-center p-6 text-center font-display text-xl">
          {card ? L(card) : "🃏"}
        </div>
        <div className="flex justify-center"><Btn variant="honey" onClick={draw}>{card ? t("Наступна картка") : t("Витягнути картку")}</Btn></div>
        <p className="text-center text-sm">{t("Карток зіграно: {n}", { n: count })}</p>
        <p className="paper-card p-4 text-sm">{L(TOGETHER.adult)}</p>
      </div>
    </Scene>
  );
}

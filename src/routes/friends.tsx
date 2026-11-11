import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Scene } from "@/components/Scene";
import { CharacterSay } from "@/components/Character";
import { CHARACTERS, type CharId } from "@/content/characters";
import { pageHead } from "@/content/journeys";
import { sfx } from "@/lib/audio";
import { useT } from "@/lib/i18n";

export const Route = createFileRoute("/friends")({
  head: () =>
    pageHead(
      "Мої друзі",
      "Познайомся з Соломією, Тарасом, Оленкою, Марком, Дариною та їжачком Ліхтариком.",
    ),
  component: Friends,
});

function Friends() {
  const t = useT();
  const ids = Object.keys(CHARACTERS) as CharId[];
  const [who, setWho] = useState<CharId>("solomiya");
  const c = CHARACTERS[who];
  return (
    <Scene title="Мої друзі" back="/world">
      <div className="space-y-5">
        <div className="paper-card p-5">
          <CharacterSay who={who} size="lg" text={`${t(c.greet)} ${t(c.about)}`} />
          <p className="mt-3 text-center text-sm font-bold text-muted-foreground">{t(c.role)}</p>
        </div>
        <ul className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {ids.map((id) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => {
                  sfx("select");
                  setWho(id);
                }}
                aria-pressed={who === id}
                aria-label={t("Послухати, що каже {n}", { n: t(CHARACTERS[id].name) })}
                className={`paper-card flex w-full flex-col items-center p-2 transition active:scale-95 ${who === id ? "ring-4 ring-ring" : ""}`}
              >
                <img
                  src={CHARACTERS[id].image}
                  alt=""
                  className="h-24 w-auto object-contain"
                  loading="lazy"
                />
                <span className="mt-1 text-sm font-bold">
                  {t(CHARACTERS[id].name).replace(t("Їжачок "), "")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Scene>
  );
}

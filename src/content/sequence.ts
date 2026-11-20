import { PLACES } from "./places";
import { FOREST } from "./hubs";
import { JOURNEYS, type Journey } from "./journeys";

export interface Stop {
  to: string;
  label: string;
}

/** The whole app as one gentle path, used by the Back / Next buttons. */
export const ORDER: Stop[] = (() => {
  const list: Stop[] = [
    { to: "/", label: "Початок" },
    { to: "/world", label: "Мапа світу" },
    { to: "/explore", label: "Уся мапа" },
    { to: "/friends", label: "Мої друзі" },
    { to: "/helper", label: "Розкажи, як ти" },
    { to: "/games", label: "Ігри" },
    { to: "/watch", label: "Мультики" },
    { to: "/story", label: "Казка для мене" },
  ];
  for (const p of PLACES) {
    list.push({ to: p.to, label: p.name });
    // The community garden belongs to the garden stop: every child can walk into it.
    if (p.id === "garden") list.push({ to: "/community-garden", label: "Спільний сад" });
    if (p.id === "forest")
      FOREST.forEach((f) => list.push({ to: `/forest/${f.params?.["id"]}`, label: f.title }));
    if (p.id in JOURNEYS)
      JOURNEYS[p.id as Journey].activities.forEach((a) =>
        list.push({ to: `/${p.id}/${a[0]}`, label: a[1] }),
      );
  }
  list.push(
    { to: "/parents", label: "Для дорослих" },
    { to: "/shared-garden", label: "Спільний сад" },
    { to: "/resources", label: "Ресурси для батьків" },
    { to: "/privacy", label: "Політика конфіденційності" },
  );
  return list;
})();

export function neighbours(pathname: string) {
  const path = pathname.replace(/\/+$/, "") || "/";
  const i = ORDER.findIndex((s) => s.to === path);
  if (i < 0) return { prev: undefined, next: undefined };
  return { prev: ORDER[i - 1], next: ORDER[i + 1] };
}

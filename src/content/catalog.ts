import { JOURNEYS, type Journey } from './journeys';
import { FOREST } from './hubs';

export interface CatalogItem { key: string; place: string; id: string; title: string; desc: string }

/** Every activity a helper may recommend (excludes the gallery of saved drawings). */
export const CATALOG: CatalogItem[] = [
  ...FOREST.map((f) => ({ key: `forest-${f.params?.['id']}`, place: 'forest', id: String(f.params?.['id']), title: f.title, desc: f.desc })),
  ...(Object.keys(JOURNEYS) as Journey[]).flatMap((p) =>
    JOURNEYS[p].activities.filter((a) => a[0] !== 'gallery').map(([id, title, desc]) => ({ key: `${p}-${id}`, place: p, id, title, desc: desc as string }))),
];

export const findActivity = (key: string) => CATALOG.find((a) => a.key === key);

import { createFileRoute, notFound } from "@tanstack/react-router";
import { Scene } from "@/components/Scene";
import { placeImage } from "@/content/places";
import { FOREST } from "@/content/hubs";
import { BodyMap, EmotionGallery, Express, MixedFeelings, SortGame } from "@/activities/forest";

const MAP = { gallery: EmotionGallery, mixed: MixedFeelings, body: BodyMap, sort: SortGame, express: Express } as const;

export const Route = createFileRoute("/forest/$id")({
  loader: ({ params }) => {
    const item = FOREST.find((f) => f.params?.["id"] === params["id"]);
    if (!item) throw notFound();
    return { title: item.title };
  },
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.title ?? "Ліс почуттів"} — Тихе Місце` },
      { name: "description", content: "Вправа з Лісу почуттів." },
      { property: "og:title", content: `${loaderData?.title ?? "Ліс почуттів"} — Тихе Місце` },
      { property: "og:description", content: "Вправа з Лісу почуттів." },
    ],
  }),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { title } = Route.useLoaderData();
  const C = MAP[id as keyof typeof MAP];
  return (
    <Scene title={title} back="/forest" favHref={`/forest/${id}`} image={placeImage("forest")} compact>
      <div className="pt-[8vh]"><C /></div>
    </Scene>
  );
}

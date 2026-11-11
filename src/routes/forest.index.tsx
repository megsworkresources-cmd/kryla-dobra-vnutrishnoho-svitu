import { createFileRoute } from "@tanstack/react-router";
import { Hub } from "@/components/Hub";
import { placeImage } from "@/content/places";
import { FOREST } from "@/content/hubs";

export const Route = createFileRoute("/forest/")({
  head: () => ({
    meta: [
      { title: "Ліс почуттів — Тихе Місце" },
      {
        name: "description",
        content: "Пізнавай почуття: що вони означають, де живуть у тілі й як про них сказати.",
      },
      { property: "og:title", content: "Ліс почуттів — Тихе Місце" },
      {
        property: "og:description",
        content: "Їжачок із ліхтариком покаже стежки до твоїх почуттів.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <Hub
      image={placeImage("forest")}
      title="Ліс почуттів"
      intro="Їжачок Ліхтарик знає кожну стежку. Тут живуть усі почуття — і кожне має що сказати."
      items={FOREST}
    />
  ),
});

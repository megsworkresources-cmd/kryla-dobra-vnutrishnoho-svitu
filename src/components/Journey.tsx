import { Hub } from "./Hub";
import { Scene } from "./Scene";
import { placeImage } from "@/content/places";
import { JOURNEYS, journeyItems, type Journey } from "@/content/journeys";
import { ACTIVITIES } from "@/activities/registry";

const img = (p: Journey) => placeImage(p === "sky" ? "sky" : p);

export function JourneyHub({ place }: { place: Journey }) {
  const j = JOURNEYS[place];
  return (
    <Hub
      image={img(place)}
      night={place === "sky"}
      title={j.title}
      intro={j.intro}
      items={journeyItems(place)}
    />
  );
}

export function JourneyActivity({
  place,
  id,
  title,
}: {
  place: Journey;
  id: string;
  title: string;
}) {
  const C = ACTIVITIES[place][id];
  return (
    <Scene
      title={title}
      back={`/${place}`}
      favHref={`/${place}/${id}`}
      image={img(place)}
      night={place === "sky"}
      compact
    >
      <div className="pt-[8vh]">{C ? <C /> : null}</div>
    </Scene>
  );
}

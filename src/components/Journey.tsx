import { Hub } from "./Hub";
import { Motif } from "./Motif";
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
  // The breathing exercises draw their own large flower and sea, so no second motif.
  // These exercises draw their own large picture, so a second motif above it would be noise.
  const ownVisual =
    (place === "meadow" && (id === "flower" || id === "wave" || id === "square")) ||
    (place === "clouds" && id === "jar") ||
    (place === "studio" && id === "heart") ||
    (place === "sky" && id === "star");
  return (
    <Scene
      title={title}
      back={`/${place}`}
      favHref={`/${place}/${id}`}
      image={img(place)}
      night={place === "sky"}
      compact
    >
      <div className="space-y-4 pt-[6vh]">
        {!ownVisual && <Motif place={place} id={id} night={place === "sky"} />}
        {C ? <C /> : null}
      </div>
    </Scene>
  );
}

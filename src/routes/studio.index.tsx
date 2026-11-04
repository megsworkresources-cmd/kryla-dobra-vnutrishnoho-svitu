import { createFileRoute } from "@tanstack/react-router";
import { JourneyHub } from "@/components/Journey";
import { JOURNEYS, pageHead } from "@/content/journeys";

export const Route = createFileRoute("/studio/")({
  head: () => pageHead(JOURNEYS.studio.title, JOURNEYS.studio.intro),
  component: () => <JourneyHub place="studio" />,
});

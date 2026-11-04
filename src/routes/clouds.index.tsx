import { createFileRoute } from "@tanstack/react-router";
import { JourneyHub } from "@/components/Journey";
import { JOURNEYS, pageHead } from "@/content/journeys";

export const Route = createFileRoute("/clouds/")({
  head: () => pageHead(JOURNEYS.clouds.title, JOURNEYS.clouds.intro),
  component: () => <JourneyHub place="clouds" />,
});

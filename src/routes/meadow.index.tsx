import { createFileRoute } from "@tanstack/react-router";
import { JourneyHub } from "@/components/Journey";
import { JOURNEYS, pageHead } from "@/content/journeys";

export const Route = createFileRoute("/meadow/")({
  head: () => pageHead(JOURNEYS.meadow.title, JOURNEYS.meadow.intro),
  component: () => <JourneyHub place="meadow" />,
});

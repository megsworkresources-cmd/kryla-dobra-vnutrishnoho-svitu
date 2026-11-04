import { createFileRoute } from "@tanstack/react-router";
import { JourneyHub } from "@/components/Journey";
import { JOURNEYS, pageHead } from "@/content/journeys";

export const Route = createFileRoute("/path/")({
  head: () => pageHead(JOURNEYS.path.title, JOURNEYS.path.intro),
  component: () => <JourneyHub place="path" />,
});

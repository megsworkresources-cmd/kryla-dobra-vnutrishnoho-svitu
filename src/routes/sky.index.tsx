import { createFileRoute } from "@tanstack/react-router";
import { JourneyHub } from "@/components/Journey";
import { JOURNEYS, pageHead } from "@/content/journeys";

export const Route = createFileRoute("/sky/")({
  head: () => pageHead(JOURNEYS.sky.title, JOURNEYS.sky.intro),
  component: () => <JourneyHub place="sky" />,
});

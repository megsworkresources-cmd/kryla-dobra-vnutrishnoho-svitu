import { createFileRoute } from "@tanstack/react-router";
import { QuestView } from "@/activities/quest";
import { pageHead } from "@/content/journeys";

export const Route = createFileRoute("/morning")({
  head: () => pageHead("Теплий ранок", "Прокинься разом із долиною — тихо й без поспіху."),
  component: () => <QuestView id="morning" />,
});

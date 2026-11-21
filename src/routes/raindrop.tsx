import { createFileRoute } from "@tanstack/react-router";
import { QuestView } from "@/activities/quest";
import { pageHead } from "@/content/journeys";

export const Route = createFileRoute("/raindrop")({
  head: () => pageHead("Пригоди дощової краплинки", "Мандруй із краплинкою від хмаринки до річки."),
  component: () => <QuestView id="raindrop" />,
});

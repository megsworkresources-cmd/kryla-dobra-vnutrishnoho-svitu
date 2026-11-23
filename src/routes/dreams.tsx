import { createFileRoute } from "@tanstack/react-router";
import { QuestView } from "@/activities/quest";
import { pageHead } from "@/content/journeys";

export const Route = createFileRoute("/dreams")({
  head: () => pageHead("Кольорові сни", "Розфарбуй нічне небо добрими снами."),
  component: () => <QuestView id="dreams" />,
});

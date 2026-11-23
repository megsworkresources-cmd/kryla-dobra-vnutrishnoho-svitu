import { createFileRoute } from "@tanstack/react-router";
import { QuestView } from "@/activities/quest";
import { pageHead } from "@/content/journeys";

export const Route = createFileRoute("/trails")({
  head: () => pageHead("Дослідники стежинок", "Йди стежкою, шукай сліди й слухай ліс."),
  component: () => <QuestView id="trails" />,
});

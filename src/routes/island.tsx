import { createFileRoute } from "@tanstack/react-router";
import { QuestView } from "@/activities/quest";
import { pageHead } from "@/content/journeys";

export const Route = createFileRoute("/island")({
  head: () => pageHead("Мій острівець спокою", "Збудуй свій тихий острівець — для тебе одного."),
  component: () => <QuestView id="island" />,
});

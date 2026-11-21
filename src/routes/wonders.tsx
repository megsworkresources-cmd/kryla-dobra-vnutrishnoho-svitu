import { createFileRoute } from "@tanstack/react-router";
import { QuestView } from "@/activities/quest";
import { pageHead } from "@/content/journeys";

export const Route = createFileRoute("/wonders")({
  head: () => pageHead("Світ маленьких див", "Подивись крізь чарівну лупу на крихітних сусідів."),
  component: () => <QuestView id="wonders" />,
});

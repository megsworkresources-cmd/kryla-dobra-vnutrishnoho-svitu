import { createFileRoute } from "@tanstack/react-router";
import { Helper } from "@/activities/helper";
import { pageHead } from "@/content/journeys";

export const Route = createFileRoute("/helper")({
  head: () =>
    pageHead("Помічник почуттів", "Розкажи, як ти почуваєшся — персонажі підкажуть вправу."),
  component: Helper,
});

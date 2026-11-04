import { createFileRoute, notFound } from "@tanstack/react-router";
import { JourneyActivity } from "@/components/Journey";
import { activityTitle, JOURNEYS, pageHead } from "@/content/journeys";

export const Route = createFileRoute("/meadow/$id")({
  loader: ({ params }) => {
    const title = activityTitle("meadow", params.id);
    if (!title) throw notFound();
    return { title };
  },
  head: ({ loaderData }) => pageHead(loaderData?.title ?? JOURNEYS.meadow.title, `Вправа: ${JOURNEYS.meadow.title}.`),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { title } = Route.useLoaderData();
  return <JourneyActivity place="meadow" id={id} title={title} />;
}

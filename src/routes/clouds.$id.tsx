import { createFileRoute, notFound } from "@tanstack/react-router";
import { JourneyActivity } from "@/components/Journey";
import { activityTitle, JOURNEYS, pageHead } from "@/content/journeys";

export const Route = createFileRoute("/clouds/$id")({
  loader: ({ params }) => {
    const title = activityTitle("clouds", params.id);
    if (!title) throw notFound();
    return { title };
  },
  head: ({ loaderData }) => pageHead(loaderData?.title ?? JOURNEYS.clouds.title, `Вправа: ${JOURNEYS.clouds.title}.`),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { title } = Route.useLoaderData();
  return <JourneyActivity place="clouds" id={id} title={title} />;
}

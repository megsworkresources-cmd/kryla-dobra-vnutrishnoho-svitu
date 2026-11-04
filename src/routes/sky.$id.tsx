import { createFileRoute, notFound } from "@tanstack/react-router";
import { JourneyActivity } from "@/components/Journey";
import { activityTitle, JOURNEYS, pageHead } from "@/content/journeys";

export const Route = createFileRoute("/sky/$id")({
  loader: ({ params }) => {
    const title = activityTitle("sky", params.id);
    if (!title) throw notFound();
    return { title };
  },
  head: ({ loaderData }) => pageHead(loaderData?.title ?? JOURNEYS.sky.title, `Вправа: ${JOURNEYS.sky.title}.`),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { title } = Route.useLoaderData();
  return <JourneyActivity place="sky" id={id} title={title} />;
}

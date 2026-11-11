import { createFileRoute, notFound } from "@tanstack/react-router";
import { JourneyActivity } from "@/components/Journey";
import { activityTitle, JOURNEYS, pageHead } from "@/content/journeys";

export const Route = createFileRoute("/studio/$id")({
  loader: ({ params }) => {
    const title = activityTitle("studio", params.id);
    if (!title) throw notFound();
    return { title };
  },
  head: ({ loaderData }) =>
    pageHead(loaderData?.title ?? JOURNEYS.studio.title, `Вправа: ${JOURNEYS.studio.title}.`),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { title } = Route.useLoaderData();
  return <JourneyActivity place="studio" id={id} title={title} />;
}

import { createFileRoute, notFound } from "@tanstack/react-router";
import { JourneyActivity } from "@/components/Journey";
import { activityTitle, JOURNEYS, pageHead } from "@/content/journeys";

export const Route = createFileRoute("/path/$id")({
  loader: ({ params }) => {
    const title = activityTitle("path", params.id);
    if (!title) throw notFound();
    return { title };
  },
  head: ({ loaderData }) =>
    pageHead(loaderData?.title ?? JOURNEYS.path.title, `Вправа: ${JOURNEYS.path.title}.`),
  component: Page,
});

function Page() {
  const { id } = Route.useParams();
  const { title } = Route.useLoaderData();
  return <JourneyActivity place="path" id={id} title={title} />;
}

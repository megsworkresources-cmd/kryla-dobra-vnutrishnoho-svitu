import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CATALOG } from "@/content/catalog";

export default defineTool({
  name: "list_activities",
  title: "List wellbeing activities",
  description:
    "Read the app-written Ukrainian exercise catalog, optionally filtered by place; no child records are accessible.",
  inputSchema: {
    place: z
      .enum(["forest", "meadow", "clouds", "sky", "studio", "path"])
      .optional()
      .describe("Optional place to filter by."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ place }) => {
    const activities = CATALOG.filter((a) => !place || a.place === place).map((a) => ({
      key: a.key,
      title: a.title,
      description: a.desc,
      path: `/${a.place}/${a.id}`,
    }));
    return {
      content: [{ type: "text", text: JSON.stringify(activities) }],
      structuredContent: { activities },
    };
  },
});

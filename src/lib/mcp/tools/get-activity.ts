import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { findActivity } from "@/content/catalog";

export default defineTool({
  name: "get_activity",
  title: "Look up a wellbeing activity",
  description:
    "Look up an app-written exercise by its catalog key and return its title, description and local address.",
  inputSchema: {
    key: z.string().min(1).max(80).describe("Exact activity key returned by list_activities."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ key }) => {
    const a = findActivity(key);
    if (!a) throw new ToolError("Unknown activity key. Use list_activities first.");
    const activity = {
      key: a.key,
      title: a.title,
      description: a.desc,
      path: `/${a.place}/${a.id}`,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(activity) }],
      structuredContent: { activity },
    };
  },
});

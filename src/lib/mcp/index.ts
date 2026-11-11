import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listActivities from "./tools/list-activities";
import getActivity from "./tools/get-activity";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "kryla-dobra-vnutrishnoho-svitu",
  title: "Kryla Dobra Vnutrishnoho Svitu",
  version: "0.1.0",
  instructions:
    "Read the Ukrainian wellbeing activity catalog. Participation is optional; do not diagnose or pressure children. These tools cannot access device-only drawings, progress, preferences or child text. Use list_activities before get_activity.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listActivities, getActivity],
});

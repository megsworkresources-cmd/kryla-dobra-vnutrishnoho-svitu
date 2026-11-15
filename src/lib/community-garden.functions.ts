import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { supabase } from "@/integrations/supabase/client";
import { cleanStages, PUBLIC_GARDEN_LIMIT } from "@/content/community";

/**
 * The only data a child's device may read about other families: how many
 * sunflowers are growing and at which coarse stage. No ids, no owners, no
 * names, drawings or activity records, and nothing is ever sent from here.
 *
 * Primary path is the stage-only projection RPC. If it is not deployed yet,
 * a narrow server-side read of opted-in stages keeps the garden working.
 */
export const readCommunityGarden = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("Cache-Control", "no-store");
  const projection = await supabase.rpc("read_public_sunflower_stages");
  if (!projection.error) {
    return { ok: true as const, stages: cleanStages(projection.data) };
  }
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("shared_sunflowers")
      .select("stage")
      .eq("sharing", true)
      .limit(PUBLIC_GARDEN_LIMIT);
    if (error) return { ok: false as const, stages: [] as number[] };
    return { ok: true as const, stages: cleanStages(data) };
  } catch {
    return { ok: false as const, stages: [] as number[] };
  }
});

import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { cleanStages } from "@/content/community";
import { supabaseProjectUrl, supabasePublishableKey } from "@/lib/supabase-env";

/**
 * The only data a child's device may read about other families: how many
 * sunflowers are growing and at which coarse stage. No ids, no owners, no
 * names, drawings or activity records, and nothing is ever sent from here.
 *
 * Only the stage-only projection RPC may serve public reads. If it is not
 * deployed yet, fail closed rather than bypassing row protection with admin access.
 */
export const readCommunityGarden = createServerFn({ method: "GET" }).handler(async () => {
  setResponseHeader("Cache-Control", "no-store");
  const url = supabaseProjectUrl();
  const key = supabasePublishableKey() ?? process.env["SUPABASE_ANON_KEY"];
  if (!url || !key) return { ok: false as const, stages: [] as number[] };
  try {
    const publicClient = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`)
            headers.delete("Authorization");
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });
    const { data, error } = await publicClient.rpc("read_public_sunflower_stages");
    if (error) return { ok: false as const, stages: [] as number[] };
    return { ok: true as const, stages: cleanStages(data) };
  } catch {
    return { ok: false as const, stages: [] as number[] };
  }
});

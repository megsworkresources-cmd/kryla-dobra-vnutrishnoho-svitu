import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sunflowerInput } from "./shared-garden.schema";

export const readGarden = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    setResponseHeader("Cache-Control", "no-store");
    const token = getRequestHeader("authorization")?.replace(/^Bearer /, "");
    if (!token) throw new Error("Unauthorized");
    const { data, error } = await context.supabase.auth.getUser(token);
    if (error || !data.user || data.user.is_anonymous) throw new Error("Unauthorized");
    const own = await context.supabase.from("shared_sunflowers").select("stage,sharing").eq("owner_id", context.userId).maybeSingle();
    const flowers = await context.supabase.rpc("read_shared_sunflowers");
    if (own.error || flowers.error) throw new Error("Garden unavailable");
    return { own: own.data ?? { stage: 0, sharing: false }, flowers: flowers.data ?? [] };
  });

export const shareSunflower = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => sunflowerInput.parse(input))
  .handler(async ({ data, context }) => {
    setResponseHeader("Cache-Control", "no-store");
    const token = getRequestHeader("authorization")?.replace(/^Bearer /, "");
    if (!token) throw new Error("Unauthorized");
    const verified = await context.supabase.auth.getUser(token);
    if (verified.error || !verified.data.user || verified.data.user.is_anonymous) throw new Error("Unauthorized");
    const result = await context.supabase.rpc("publish_sunflower", { new_stage: data.stage, opt_in: data.sharing });
    if (result.error) throw new Error("Garden unavailable");
    return { ok: true };
  });
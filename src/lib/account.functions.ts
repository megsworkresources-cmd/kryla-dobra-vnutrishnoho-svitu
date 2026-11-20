import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Apple requires in-app account deletion: removes the grown-up's shared
 * sunflower and account. The security-definer RPC deletes only the caller's own
 * rows, so no service-role key is needed; the admin call stays as a fallback
 * for deployments where the RPC migration has not been applied yet.
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error: rpcError } = await context.supabase.rpc("delete_my_account");
    if (!rpcError) return { ok: true as const };
    console.error(
      `[account] delete_my_account RPC failed [${rpcError.code ?? "?"}]: ${rpcError.message || "no message"}`,
    );

    await context.supabase.from("shared_sunflowers").delete().eq("owner_id", context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(context.userId);
    if (error) {
      // Status and code only: the key itself never reaches the logs.
      console.error(
        `[account] admin deleteUser failed [${error.status ?? "?"} ${error.code ?? "?"}]: ${error.message || "no message"}`,
      );
      return { ok: false as const };
    }
    return { ok: true as const };
  });

/** A grown-up flags an AI answer. Only the AI's own output is stored, never child text. */
export const reportAiAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ kind: z.enum(["story", "helper"]), content: z.string().min(1).max(4000) }))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("ai_reports")
      .insert({ user_id: context.userId, kind: data.kind, content: data.content });
    return { ok: !error };
  });

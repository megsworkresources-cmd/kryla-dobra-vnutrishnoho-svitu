import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Apple requires in-app account deletion: removes the grown-up's shared
 * sunflower and account. The security-definer RPC deletes only the caller's own
 * rows, so account deletion never needs a service-role key and has exactly one
 * path to audit; any failure is reported as a failure.
 */
export const deleteMyAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase.rpc("delete_my_account");
    if (error) {
      console.error(
        `[account] delete_my_account failed [${error.code ?? "?"}]: ${error.message || "no message"}`,
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

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const askHelper = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      text: z.string().trim().min(2).max(500),
      age: z.enum(["5-7", "8-10", "11-13"]),
      lang: z.enum(["uk", "en"]).default("uk"),
    }),
  )
  .handler(async ({ data, context }) => {
    const { allowAi } = await import("./ai-quota.server");
    if (!allowAi("helper", context.userId, 10, 60 * 60 * 1000))
      return { ok: false as const, error: "busy" };
    const { suggestActivity, SuggestError } = await import("./suggest.server");
    try {
      return {
        ok: true as const,
        suggestion: await suggestActivity(data.text, data.age, data.lang),
      };
    } catch (e) {
      return { ok: false as const, error: e instanceof SuggestError ? e.message : "fail" };
    }
  });

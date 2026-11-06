import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Server-side check: the bearer token is validated by the auth server before anything is returned. */
export const verifyCaregiver = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const email = typeof context.claims.email === "string" ? context.claims.email : null;
    return { userId: context.userId, email };
  });

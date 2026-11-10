import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";

/** Server-side check: the bearer token is validated by the auth server before anything is returned. */
export const verifyCaregiver = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    setResponseHeader("Cache-Control", "no-store");
    // Claims validate signature/expiry; getUser also checks the current account
    // with Auth rather than trusting an old identity or an anonymous account.
    const token = getRequestHeader("authorization")?.replace(/^Bearer /, "");
    if (!token) throw new Error("Unauthorized");
    const { data, error } = await context.supabase.auth.getUser(token);
    if (error || !data.user || data.user.is_anonymous || !data.user.email_confirmed_at) {
      throw new Error("Unauthorized");
    }
    return { userId: data.user.id, email: data.user.email ?? null };
  });

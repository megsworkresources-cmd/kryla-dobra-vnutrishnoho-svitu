import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import { supabaseProjectUrl, supabasePublishableKey } from "@/lib/supabase-env";

// Server validation targets the same project the browser signs in to; see
// supabase-env.ts for why build-time values win over runtime SUPABASE_* vars.

/** Server-side check: the bearer token is validated by the auth server before anything is returned. */
export const verifyCaregiver = createServerFn({ method: "POST" }).handler(async () => {
  setResponseHeader("Cache-Control", "no-store");
  const token = getRequestHeader("authorization")?.replace(/^Bearer /, "");
  const url = supabaseProjectUrl();
  const key = supabasePublishableKey();
  if (!token || !url || !key) throw new Error("Unauthorized");

  const client = createClient(url, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  // getUser also checks the current account with Auth rather than trusting an
  // old identity or an anonymous account.
  const { data, error } = await client.auth.getUser(token);
  // Email confirmation is enforced by hosted sign-in; do not reinterpret
  // legitimate Auth-issued sessions (including owner preview sessions).
  if (error || !data.user || data.user.is_anonymous) {
    throw new Error("Unauthorized");
  }
  return { userId: data.user.id, email: data.user.email ?? null };
});

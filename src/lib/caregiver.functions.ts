import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";

// The public project config is inlined at build time from the same values the
// browser uses, so server validation always targets the deployed project even
// when runtime SUPABASE_* env vars are missing or point at an internal host.
const SUPABASE_URL =
  import.meta.env["VITE_SUPABASE_URL"] ||
  (typeof process === "undefined" ? undefined : process.env["SUPABASE_URL"]);
const SUPABASE_KEY =
  import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
  (typeof process === "undefined" ? undefined : process.env["SUPABASE_PUBLISHABLE_KEY"]);

/** Server-side check: the bearer token is validated by the auth server before anything is returned. */
export const verifyCaregiver = createServerFn({ method: "POST" }).handler(async () => {
  setResponseHeader("Cache-Control", "no-store");
  const token = getRequestHeader("authorization")?.replace(/^Bearer /, "");
  if (!token || !SUPABASE_URL || !SUPABASE_KEY) throw new Error("Unauthorized");

  const client = createClient(SUPABASE_URL, SUPABASE_KEY, {
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

/**
 * Public Supabase project config for server-side code.
 *
 * `VITE_*` values are inlined at build time from the deployed project, so they
 * always match the backend the browser signs in to. Runtime `SUPABASE_*`
 * variables are only a fallback: when the runtime host is stale or points at an
 * internal host, token checks and admin calls silently target another project
 * and surface as "Unauthorized: Invalid token".
 */
const BUILD_URL = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
const BUILD_PUBLISHABLE_KEY = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as
  string | undefined;

function runtimeEnv(key: string): string | undefined {
  return typeof process === "undefined" ? undefined : process.env[key];
}

function host(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

let warnedAboutMismatch = false;

/** Names only hosts, never keys, so deployment logs can be audited safely. */
function warnIfRuntimeHostDiffers(publicUrl: string | undefined, runtimeUrl: string | undefined) {
  if (warnedAboutMismatch) return;
  const publicHost = host(publicUrl);
  const runtimeHost = host(runtimeUrl);
  if (!publicHost || !runtimeHost || publicHost === runtimeHost) return;
  warnedAboutMismatch = true;
  console.warn(
    `[Supabase] SUPABASE_URL points at ${runtimeHost} but this build uses ${publicHost}; using the build-time project.`,
  );
}

export function supabaseProjectUrl(): string | undefined {
  const runtimeUrl = runtimeEnv("SUPABASE_URL");
  warnIfRuntimeHostDiffers(BUILD_URL, runtimeUrl);
  return (BUILD_URL || runtimeUrl)?.replace(/\/+$/, "");
}

let warnedAboutKeyMismatch = false;

export function supabasePublishableKey(): string | undefined {
  const runtimeKey = runtimeEnv("SUPABASE_PUBLISHABLE_KEY");
  if (!warnedAboutKeyMismatch && BUILD_PUBLISHABLE_KEY && runtimeKey && runtimeKey !== BUILD_PUBLISHABLE_KEY) {
    warnedAboutKeyMismatch = true;
    console.warn(
      "[Supabase] SUPABASE_PUBLISHABLE_KEY differs from the built project's key; using the build-time key.",
    );
  }
  return BUILD_PUBLISHABLE_KEY || runtimeKey;
}

/** Service-role secrets stay runtime-only and are never inlined into a build. */
export function supabaseServiceRoleKey(): string | undefined {
  const key = runtimeEnv("SUPABASE_SERVICE_ROLE_KEY");
  if (key && (key === BUILD_PUBLISHABLE_KEY || key.startsWith("sb_publishable_"))) {
    console.error(
      "[Supabase] SUPABASE_SERVICE_ROLE_KEY holds a publishable key; admin account deletion cannot work.",
    );
  }
  return key;
}

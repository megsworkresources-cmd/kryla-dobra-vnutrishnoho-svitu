/**
 * Caregiver gate logic, kept free of framework imports so it can be unit-tested.
 * The decision trusts only the server's answer (verify), never a client flag.
 */
import { oauthReturnPath } from "./oauth-return-path";

export const SIGN_IN_PATH = "/caregiver-login";

/** Only allow same-origin, path-only return targets (no open redirects). */
export function safeReturnPath(raw: unknown): string {
  const path = oauthReturnPath(raw);
  return path === "/" ? "/parents" : path;
}

export interface Caregiver {
  userId: string;
  email: string | null;
}

export type GuardResult =
  { ok: true; caregiver: Caregiver } | { ok: false; redirectTo: string; returnTo: string };

export async function checkCaregiver(opts: {
  href: string;
  getToken: () => Promise<string | null>;
  verify: (token: string) => Promise<Caregiver>;
}): Promise<GuardResult> {
  const returnTo = safeReturnPath(opts.href);
  const deny = { ok: false as const, redirectTo: SIGN_IN_PATH, returnTo };
  const token = await opts.getToken().catch(() => null);
  if (!token) return deny;
  try {
    return { ok: true, caregiver: await opts.verify(token) };
  } catch {
    return deny;
  }
}

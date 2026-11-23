/** Account lifecycle helpers never read or change the child's device store. */
export const RECOVERY_KEY = "tyhe-caregiver-recovery";

const RESEND_KEY = "tyhe-caregiver-resend-until";
const RESEND_COOLDOWN_MS = 60_000;

/** Remaining resend cooldown in whole seconds, kept across reloads of this tab. */
export function resendCooldownLeft(now = Date.now()): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.sessionStorage.getItem(RESEND_KEY);
    const until = Number(raw);
    if (!raw || !Number.isFinite(until)) return 0;
    return Math.max(0, Math.ceil((until - now) / 1000));
  } catch {
    return 0;
  }
}

/** Stores the resend deadline so a reload cannot bypass it, and returns its seconds. */
export function startResendCooldown(now = Date.now()): number {
  if (typeof window === "undefined") return Math.ceil(RESEND_COOLDOWN_MS / 1000);
  try {
    window.sessionStorage.setItem(RESEND_KEY, String(now + RESEND_COOLDOWN_MS));
  } catch {
    /* storage is optional */
  }
  return Math.ceil(RESEND_COOLDOWN_MS / 1000);
}

export function clearResendCooldown(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(RESEND_KEY);
  } catch {
    /* storage is optional */
  }
}

export function authTransition(event: string) {
  return {
    invalidate: ["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED", "PASSWORD_RECOVERY"].includes(event),
    refetch: ["SIGNED_IN", "USER_UPDATED"].includes(event),
    recovery: event === "PASSWORD_RECOVERY",
    signedOut: event === "SIGNED_OUT",
  };
}

export function recoveryRequested(hash: string, saved: string | null): boolean {
  return new URLSearchParams(hash.replace(/^#/, "")).get("type") === "recovery" || saved === "1";
}

export async function signOutCaregiver(actions: {
  cancel: () => Promise<unknown>;
  clear: () => void;
  signOut: () => Promise<{ error: unknown }>;
  navigate: () => Promise<unknown>;
}) {
  await actions.cancel();
  actions.clear();
  const { error } = await actions.signOut();
  if (error) throw error;
  await actions.navigate();
}

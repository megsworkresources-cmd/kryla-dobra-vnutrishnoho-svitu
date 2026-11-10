/** Account lifecycle helpers never read or change the child's device store. */
export const RECOVERY_KEY = "tyhe-caregiver-recovery";

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
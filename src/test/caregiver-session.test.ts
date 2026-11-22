import { describe, expect, it, vi } from "vitest";
import {
  authTransition,
  clearResendCooldown,
  recoveryRequested,
  resendCooldownLeft,
  signOutCaregiver,
  startResendCooldown,
} from "@/lib/caregiver-session";

describe("caregiver session lifecycle", () => {
  it("revalidates sign-in and user updates", () => {
    expect(authTransition("SIGNED_IN")).toMatchObject({ invalidate: true, refetch: true });
    expect(authTransition("USER_UPDATED").invalidate).toBe(true);
  });
  it("never refetches private queries after sign-out", () => {
    expect(authTransition("SIGNED_OUT")).toMatchObject({
      invalidate: true,
      refetch: false,
      signedOut: true,
    });
  });
  it.each(["INITIAL_SESSION", "TOKEN_REFRESHED"])("does not thrash routes on %s", (event) => {
    expect(authTransition(event)).toMatchObject({ invalidate: false, refetch: false });
  });
  it("recognizes recovery without treating an ordinary sign-in as recovery", () => {
    expect(recoveryRequested("#type=recovery&access_token=example", null)).toBe(true);
    expect(recoveryRequested("", "1")).toBe(true);
    expect(recoveryRequested("#type=signup", null)).toBe(false);
    expect(authTransition("PASSWORD_RECOVERY").recovery).toBe(true);
  });
  it("keeps the resend cooldown across a reload until it expires", () => {
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
      expect(startResendCooldown()).toBe(60);
      // A fresh mount (a reload) still sees the running cooldown.
      expect(resendCooldownLeft()).toBe(60);
      vi.setSystemTime(Date.now() + 25_000);
      expect(resendCooldownLeft()).toBe(35);
      vi.setSystemTime(Date.now() + 40_000);
      expect(resendCooldownLeft()).toBe(0);
      clearResendCooldown();
      expect(resendCooldownLeft()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
  it("cancels requests and drops private caches before signing out and replacing navigation", async () => {
    const order: string[] = [];
    await signOutCaregiver({
      cancel: async () => {
        order.push("cancel");
      },
      clear: () => {
        order.push("clear");
      },
      signOut: async () => {
        order.push("signOut");
        return { error: null };
      },
      navigate: async () => {
        order.push("replace");
      },
    });
    expect(order).toEqual(["cancel", "clear", "signOut", "replace"]);
  });
  it("does not claim logout succeeded when auth rejects it", async () => {
    const navigate = vi.fn();
    await expect(
      signOutCaregiver({
        cancel: async () => {},
        clear: vi.fn(),
        signOut: async () => ({ error: new Error("offline") }),
        navigate,
      }),
    ).rejects.toThrow("offline");
    expect(navigate).not.toHaveBeenCalled();
  });
});

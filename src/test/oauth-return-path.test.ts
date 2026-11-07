import { describe, expect, it } from "vitest";
import { oauthReturnPath } from "@/lib/oauth-return-path";
import { safeReturnPath } from "@/lib/caregiver-guard";

describe("OAuth local return paths", () => {
  it("preserves the consent authorization and fragment through adult sign-in", () => {
    const path = "/.lovable/oauth/consent?authorization_id=example#decision";
    expect(oauthReturnPath(path)).toBe(path);
    expect(safeReturnPath(path)).toBe(path);
  });
  it.each(["//evil.invalid", "/\\evil.invalid", "/parents\n", "https://evil.invalid", null])("rejects unsafe target %s", (path) => {
    expect(oauthReturnPath(path)).toBe("/");
    expect(safeReturnPath(path)).toBe("/parents");
  });
});
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LangToggle } from "@/components/LangToggle";

describe("LangToggle", () => {
  it("keeps every class token separated, so the selected language keeps its visible background", () => {
    render(<LangToggle />);
    for (const button of screen.getAllByRole("button")) {
      const tokens = button.className.split(/\s+/);
      expect(tokens).toContain("press");
      // A glued token such as "pressbg-primary" would silently drop both classes.
      expect(button.className).not.toMatch(/press[a-z]/);
    }
    const selected = screen
      .getAllByRole("button")
      .find((b) => b.getAttribute("aria-pressed") === "true");
    expect(selected?.className.split(/\s+/)).toContain("bg-primary");
  });
});

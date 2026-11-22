import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Route } from "@/routes/resources";
import { update } from "@/lib/store";
import { RESOURCES } from "@/content/resources.i18n";

vi.mock("@/components/Scene", () => ({
  Scene: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Btn: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props} />,
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it.each(["uk", "en"] as const)(
  "requires adult confirmation before resource websites or phone links open (%s)",
  (lang) => {
    update((s) => ({ ...s, lang }));
    const Page = Route.options.component;
    if (!Page) throw new Error("Missing resources page");
    const open = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<Page />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "help.npa-ua.org" } });
    fireEvent.click(
      screen.getByRole("button", { name: lang === "uk" ? "Відвідати сайт ↗" : "Visit website ↗" }),
    );
    expect(open).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog").parentElement).toBe(document.body);
    fireEvent.click(screen.getByRole("button", { name: lang === "uk" ? "Не зараз" : "Not now" }));
    expect(open).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: lang === "uk" ? "Відвідати сайт ↗" : "Visit website ↗" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: lang === "uk" ? "Так, відкрити" : "Yes, open it" }),
    );
    expect(open).toHaveBeenLastCalledWith(
      RESOURCES.find((r) => r.id === "npa")?.url,
      "_blank",
      "noopener,noreferrer",
    );
    open.mockClear();
    fireEvent.click(screen.getByRole("button", { name: "116111" }));
    expect(open).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("button", { name: lang === "uk" ? "Так, відкрити" : "Yes, open it" }),
    );
    expect(open).toHaveBeenCalledWith("tel:116111", "_blank", "noopener,noreferrer");
  },
);

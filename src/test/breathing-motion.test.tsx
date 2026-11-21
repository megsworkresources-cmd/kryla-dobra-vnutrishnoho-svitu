import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { Breathing } from "@/activities/meadow";
import { update } from "@/lib/store";

vi.mock("@/components/Character", () => ({ CharacterSay: () => null }));
vi.mock("@/lib/speak", () => ({ speak: vi.fn(), stopSpeaking: vi.fn() }));
vi.mock("@/components/Scene", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/components/Scene")>()),
  DoneCard: ({ again }: { again: () => void }) => <button onClick={again}>Ще раз</button>,
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

for (const kind of ["flower", "wave"] as const) {
  it(`${kind} cancels its animation clock on pause and exit`, () => {
    update((s) => ({ ...s, lang: "uk", reduceMotion: false, voice: false }));
    const request = vi.fn(() => 42);
    const cancel = vi.fn();
    vi.stubGlobal("requestAnimationFrame", request);
    vi.stubGlobal("cancelAnimationFrame", cancel);
    const view = render(<Breathing kind={kind} />);
    fireEvent.click(screen.getByRole("button", { name: /^Почати$/ }));
    expect(request).toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /^Пауза$/ }));
    expect(cancel).toHaveBeenCalledWith(42);
    const pausedRequests = request.mock.calls.length;
    fireEvent.click(screen.getByRole("button", { name: /^Продовжити$/ }));
    expect(request.mock.calls.length).toBeGreaterThan(pausedRequests);
    view.unmount();
    expect(cancel).toHaveBeenCalledTimes(2);
  });

  it(`${kind} completes with saved reduced motion without scheduling visual frames`, () => {
    vi.useFakeTimers();
    update((s) => ({ ...s, lang: "uk", reduceMotion: true, voice: false }));
    const request = vi.fn(() => 42);
    vi.stubGlobal("requestAnimationFrame", request);
    render(<Breathing kind={kind} />);
    fireEvent.click(screen.getByRole("button", { name: /^Почати$/ }));
    expect(request).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(60000));
    expect(screen.queryByRole("button", { name: /^Пауза$/ })).toBeNull();
    expect(screen.getByRole("button", { name: "Ще раз" })).toBeInTheDocument();
  });
}

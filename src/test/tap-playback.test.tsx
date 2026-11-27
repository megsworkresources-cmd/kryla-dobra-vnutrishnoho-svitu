import type { ComponentProps, ReactNode } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Player } from "@/routes/watch";
import { Story } from "@/activities/sky";
import { CharacterSay } from "@/components/Character";
import { Route as CommunityGardenRoute } from "@/routes/community-garden";
import { Route as SharedGardenRoute } from "@/routes/_caregiver/shared-garden";
import { update } from "@/lib/store";

vi.mock("@/components/Scene", () => ({
  Btn: ({ children, ...props }: ComponentProps<"button">) => <button {...props}>{children}</button>,
  Scene: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  DoneCard: ({ text }: { text: string }) => <p>{text}</p>,
}));
vi.mock("@/lib/speak", () => ({
  speak: vi.fn(),
  stopSpeaking: vi.fn(),
  useSpeechState: () => "idle",
}));
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }));
// Pages link with the router; these tests mount them without a router tree.
vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  return {
    ...actual,
    Link: ({ to: _to, children, ...props }: ComponentProps<"a"> & { to?: string }) => (
      <a {...props}>{children}</a>
    ),
  };
});
vi.mock("@/lib/community-garden.functions", () => ({
  readCommunityGarden: () => Promise.resolve({ ok: true, stages: [3] }),
}));
vi.mock("@/lib/shared-garden.functions", () => ({
  readGarden: () =>
    Promise.resolve({
      own: { stage: 1, sharing: false },
      flowers: [{ flower_id: "f1", stage: 3 }],
    }),
  shareSunflower: () => Promise.resolve({ ok: true, capped: false }),
}));
vi.mock("@/components/GrownUpLink", () => ({
  GrownUpLink: ({ children }: { children?: ReactNode }) => <span>{children}</span>,
}));
vi.mock("@/components/SunflowerStoryLink", () => ({
  SunflowerStoryLink: ({ name }: { name: string }) => <span>{name}</span>,
}));

const clip = {
  id: "sunflower",
  title: "Соняшник, що шукав сонце",
  icon: "🌻",
  shots: [
    {
      img: "/first-scene.jpg",
      who: "solomiya" as const,
      text: "Біля білої хатки ріс маленький соняшник.",
      fx: "🌻",
    },
    {
      img: "/second-scene.jpg",
      who: "solomiya" as const,
      text: "Щоранку він повертав голівку до сонця.",
      fx: "☀️",
    },
    {
      img: "/third-scene.jpg",
      who: "solomiya" as const,
      text: "Одного дня хмарка сховала сонечко.",
      fx: "☁️",
    },
  ],
};

beforeEach(() => {
  update((s) => ({
    ...s,
    lang: "uk",
    sound: false,
    voice: false,
    reduceMotion: false,
  }));
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

/**
 * iPhone Safari refuses a play() that arrives after the tap's event has finished, so the
 * film snaps back to paused. Record whether the recording started while a real click was
 * still being dispatched: the window capture listener runs before React's handler, the
 * window bubble listener after it, and effects only ever run outside that window.
 */
function playbackInsideTheTap() {
  let inTap = false;
  const calls: { inTap: boolean; on: HTMLVideoElement }[] = [];
  const enter = () => {
    inTap = true;
  };
  const leave = () => {
    inTap = false;
  };
  window.addEventListener("click", enter, true);
  window.addEventListener("click", leave, false);
  vi.mocked(HTMLMediaElement.prototype.play).mockImplementation(function (this: HTMLVideoElement) {
    calls.push({ inTap, on: this });
    return Promise.resolve();
  });
  return {
    get calls() {
      return calls.length;
    },
    get started() {
      return calls.some((call) => call.inTap);
    },
    /**
     * The film still on screen after the tap was the one the gesture started. A button
     * that remounts the footage would otherwise pass by playing an element that is gone.
     */
    startedOnScreen() {
      const current = document.querySelector("video");
      return current !== null && calls.some((call) => call.inTap && call.on === current);
    },
    stop() {
      window.removeEventListener("click", enter, true);
      window.removeEventListener("click", leave, false);
    },
  };
}

it("starts the cartoon footage from the play toggle, inside the child's tap", () => {
  render(<Player clip={clip} onClose={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Пауза" }));
  const recorder = playbackInsideTheTap();
  fireEvent.click(screen.getByRole("button", { name: "Грати" }));
  recorder.stop();
  // A state-only toggle would let the effect call play() after the gesture, which Safari drops.
  expect(recorder.calls).toBeGreaterThan(0);
  expect(recorder.started).toBe(true);
  expect(screen.getByRole("button", { name: "Пауза" })).toBeInTheDocument();
});

it("starts the cartoon footage from a scene dot, inside the child's tap", () => {
  render(<Player clip={clip} onClose={vi.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Пауза" }));
  const recorder = playbackInsideTheTap();
  fireEvent.click(screen.getByRole("button", { name: "Сцена 2" }));
  recorder.stop();
  expect(recorder.started).toBe(true);
});

it("starts the night-sky story footage from «Дивитися», inside the child's tap", () => {
  render(<Story id="lantern" />);
  const recorder = playbackInsideTheTap();
  fireEvent.click(screen.getByRole("button", { name: "Дивитися" }));
  recorder.stop();
  expect(recorder.calls).toBeGreaterThan(0);
  expect(recorder.started).toBe(true);
  expect(screen.getByRole("button", { name: "Пауза" })).toBeInTheDocument();
});

it("starts the character loop from its play toggle, inside the child's tap", () => {
  render(<CharacterSay who="solomiya" text="Привіт" autoSpeak={false} />);
  fireEvent.click(screen.getByRole("button", { name: "Пауза" }));
  const recorder = playbackInsideTheTap();
  fireEvent.click(screen.getByRole("button", { name: "Грати" }));
  recorder.stop();
  expect(recorder.calls).toBeGreaterThan(0);
  expect(recorder.started).toBe(true);
  expect(screen.getByRole("button", { name: "Пауза" })).toBeInTheDocument();
});

/** Pages that read shared flowers need their own query client, like the router gives them. */
function mountPage(Page: () => ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <Page />
    </QueryClientProvider>,
  );
  return client;
}

it("starts the community garden's growth film from a flower tap, inside the child's tap", async () => {
  const Page = CommunityGardenRoute.options.component as () => ReactNode;
  mountPage(Page);
  const flower = await screen.findByRole("button", { name: /Квітка 1/ });
  fireEvent.click(screen.getByRole("button", { name: "Пауза" }));
  const recorder = playbackInsideTheTap();
  fireEvent.click(flower);
  recorder.stop();
  // Another flower's growth is already on screen: the tap has to start that same film.
  expect(recorder.startedOnScreen()).toBe(true);
});

it("starts the community garden's growth film when the flower is watered, inside the tap", async () => {
  const Page = CommunityGardenRoute.options.component as () => ReactNode;
  mountPage(Page);
  const water = await screen.findByRole("button", { name: "Полити соняшник" });
  fireEvent.click(screen.getByRole("button", { name: "Пауза" }));
  const recorder = playbackInsideTheTap();
  fireEvent.click(water);
  recorder.stop();
  // Watering moves the flower up a stage; the child should still see it grow from the tap.
  expect(recorder.startedOnScreen()).toBe(true);
});

it("starts the shared garden's growth film from a flower tap, inside the adult's tap", async () => {
  vi.spyOn(SharedGardenRoute, "useRouteContext").mockReturnValue({
    caregiver: { userId: "adult-test" },
  } as never);
  const Page = SharedGardenRoute.options.component as () => ReactNode;
  mountPage(Page);
  const flower = await screen.findByRole("button", { name: /Квітка 1/ });
  fireEvent.click(screen.getByRole("button", { name: "Пауза" }));
  const recorder = playbackInsideTheTap();
  fireEvent.click(flower);
  recorder.stop();
  expect(recorder.startedOnScreen()).toBe(true);
});

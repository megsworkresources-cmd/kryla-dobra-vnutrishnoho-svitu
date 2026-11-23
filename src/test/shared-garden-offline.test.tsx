import { cleanup, fireEvent, render, screen, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider, onlineManager } from "@tanstack/react-query";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Route } from "@/routes/_caregiver/shared-garden";
import { update } from "@/lib/store";

const mocks = vi.hoisted(() => ({
  read: vi.fn(),
  share: vi.fn(),
}));
vi.mock("@/lib/shared-garden.functions", () => ({
  readGarden: mocks.read,
  shareSunflower: mocks.share,
}));
vi.mock("@tanstack/react-start", () => ({ useServerFn: (fn: unknown) => fn }));
vi.mock("@/components/Scene", () => ({
  Scene: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Btn: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => <button {...props} />,
}));
vi.mock("@/components/StoryFilm", () => ({ StoryFilm: () => null }));
vi.mock("@/components/GrownUpLink", () => ({
  GrownUpLink: ({ children }: { children: React.ReactNode }) => <span>{children}</span>,
}));
vi.mock("@/components/SunflowerStoryLink", () => ({
  SunflowerStoryLink: ({ name }: { name: string }) => (
    <a href="/watch?film=sunflower" aria-label={`Open sunflower story for ${name}`}>
      Казка
    </a>
  ),
}));

let client: QueryClient;
function connect(online: boolean) {
  Object.defineProperty(navigator, "onLine", { configurable: true, value: online });
  onlineManager.setOnline(online);
  fireEvent(window, new Event(online ? "online" : "offline"));
}
beforeEach(() => {
  vi.clearAllMocks();
  update((s) => ({ ...s, lang: "uk" }));
  connect(true);
  vi.spyOn(Route, "useRouteContext").mockReturnValue({
    caregiver: { userId: "adult-test" },
  } as never);
  mocks.read.mockResolvedValue({ own: { stage: 1, sharing: false }, flowers: [] });
  mocks.share.mockResolvedValue({ ok: true, capped: false });
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => {
  cleanup();
  client.clear();
  onlineManager.setOnline(true);
  vi.restoreAllMocks();
});
function mount() {
  const Garden = Route.options.component;
  if (!Garden) throw new Error("Missing garden component");
  render(
    <QueryClientProvider client={client}>
      <Garden />
    </QueryClientProvider>,
  );
}

it("never queues offline sharing or presents cached sharing as confirmed; explicit reconnect opt-out works", async () => {
  mount();
  await screen.findByRole("checkbox");
  fireEvent.click(screen.getByRole("checkbox"));
  act(() => connect(false));
  const share = screen.getByRole("button", { name: "Поділитися соняшником" });
  expect(share).toBeDisabled();
  fireEvent.click(share);
  expect(mocks.share).not.toHaveBeenCalled();
  expect(screen.getByText("Поточний стан поширення не підтверджено.")).toBeInTheDocument();
  expect(client.getMutationCache().getAll()).toHaveLength(0);
  act(() => connect(true));
  await act(async () => {});
  expect(mocks.share).not.toHaveBeenCalled();
  mocks.read.mockResolvedValue({ own: { stage: 1, sharing: true }, flowers: [] });
  fireEvent.click(share);
  await screen.findByRole("button", { name: "Припинити поширення" });
  expect(mocks.share).toHaveBeenCalledWith({ data: { stage: expect.any(Number), sharing: true } });
  act(() => connect(false));
  expect(screen.getByRole("button", { name: "Припинити поширення" })).toBeDisabled();
  act(() => connect(true));
  mocks.read.mockResolvedValue({ own: { stage: 1, sharing: false }, flowers: [] });
  fireEvent.click(screen.getByRole("button", { name: "Припинити поширення" }));
  await waitFor(() =>
    expect(mocks.share).toHaveBeenLastCalledWith({ data: { stage: 0, sharing: false } }),
  );
  await screen.findByRole("checkbox");
});

it("an unannounced connection loss fails immediately instead of becoming a paused mutation", async () => {
  mount();
  await screen.findByRole("checkbox");
  fireEvent.click(screen.getByRole("checkbox"));
  Object.defineProperty(navigator, "onLine", { configurable: true, value: false });
  onlineManager.setOnline(false);
  fireEvent.click(screen.getByRole("button", { name: "Поділитися соняшником" }));
  await screen.findByRole("alert");
  expect(mocks.share).not.toHaveBeenCalled();
  expect(client.getMutationCache().getAll()[0]?.state).toMatchObject({
    status: "error",
    isPaused: false,
  });
  act(() => connect(true));
  await act(async () => {});
  expect(mocks.share).not.toHaveBeenCalled();
});

it("does not confirm cached sharing while a reconnect read is still pending", async () => {
  mocks.read.mockResolvedValue({ own: { stage: 1, sharing: true }, flowers: [] });
  mount();
  await screen.findByText("Соняшник поширено");
  act(() => connect(false));
  let resolveRead:
    ((value: { own: { stage: number; sharing: boolean }; flowers: [] }) => void) | undefined;
  mocks.read.mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveRead = resolve;
      }),
  );
  act(() => connect(true));
  await waitFor(() => expect(mocks.read).toHaveBeenCalledTimes(2));
  expect(screen.queryByText("Соняшник поширено")).not.toBeInTheDocument();
  expect(screen.getByText("Поточний стан поширення не підтверджено.")).toBeInTheDocument();
  if (!resolveRead) throw new Error("Reconnect did not request the garden");
  await act(async () => resolveRead?.({ own: { stage: 1, sharing: true }, flowers: [] }));
  await screen.findByText("Соняшник поширено");
});

it("a lost withdrawal response cannot present cached sharing as confirmed", async () => {
  mocks.read.mockResolvedValue({ own: { stage: 1, sharing: true }, flowers: [] });
  mocks.share.mockRejectedValue(new Error("Connection interrupted"));
  mount();
  await screen.findByText("Соняшник поширено");
  fireEvent.click(screen.getByRole("button", { name: "Припинити поширення" }));
  await screen.findByRole("alert");
  expect(screen.queryByText("Соняшник поширено")).not.toBeInTheDocument();
  expect(screen.getByText("Поточний стан поширення не підтверджено.")).toBeInTheDocument();
  expect(mocks.share).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole("button", { name: "Оновити сад" }));
  await screen.findByText("Соняшник поширено");
  expect(mocks.share).toHaveBeenCalledTimes(1);
});

it("provides a story link for the caregiver's sunflower and every shared flower", async () => {
  mocks.read.mockResolvedValue({
    own: { stage: 1, sharing: false },
    flowers: [
      { flower_id: "flower-one", stage: 2 },
      { flower_id: "flower-two", stage: 5 },
    ],
  });
  mount();

  await waitFor(() => {
    expect(screen.getAllByRole("link", { name: /Open sunflower story for/ })).toHaveLength(3);
  });
  const links = screen.getAllByRole("link", { name: /Open sunflower story for/ });
  expect(links.every((link) => link.getAttribute("href") === "/watch?film=sunflower")).toBe(true);
});

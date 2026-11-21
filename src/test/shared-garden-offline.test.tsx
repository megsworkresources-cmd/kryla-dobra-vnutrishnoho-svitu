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

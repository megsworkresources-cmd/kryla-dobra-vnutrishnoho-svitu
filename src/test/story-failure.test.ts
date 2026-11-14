import { expect, it, vi } from "vitest";
const stream = vi.fn();
vi.mock("ai", () => ({
  streamText: (...args: unknown[]) => stream(...args),
  Output: { object: vi.fn() },
  NoObjectGeneratedError: { isInstance: () => false },
}));
import { generateStory } from "@/lib/story.server";

const choices = {
  who: "solomiya",
  place: "sky",
  feeling: "calm",
  age: "8-10",
  lang: "en",
} as const;
it("reports missing credentials without an upstream request", async () => {
  await expect(generateStory(choices, undefined)).rejects.toMatchObject({
    status: 401,
    code: "config",
  });
  expect(stream).not.toHaveBeenCalled();
});
it("does not retry a denied provider request", async () => {
  stream.mockImplementationOnce(() => {
    throw Object.assign(new Error("denied"), { statusCode: 403 });
  });
  await expect(generateStory(choices, "test-key")).rejects.toMatchObject({
    status: 403,
    code: "denied",
  });
  expect(stream).toHaveBeenCalledTimes(1);
  expect(stream.mock.calls[0]?.[0].maxRetries).toBe(0);
});

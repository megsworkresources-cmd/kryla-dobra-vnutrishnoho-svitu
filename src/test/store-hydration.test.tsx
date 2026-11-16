import { render, waitFor } from "@testing-library/react";
import { expect, it } from "vitest";
import { careCount, update, useStore } from "@/lib/store";

const KEY = "tyhe-mistse-v1";

function Care() {
  const n = useStore((s) => careCount(s));
  return <p data-testid="care">{n}</p>;
}

const seed = (careSteps: number) =>
  localStorage.setItem(KEY, JSON.stringify({ careSteps }));

it("re-reads progress saved on the device when a page mounts", async () => {
  seed(0);
  const first = render(<Care />);
  expect(first.getByTestId("care")).toHaveTextContent("0");
  first.unmount();

  // Progress recorded on the device after the store was first read.
  seed(5);
  const second = render(<Care />);
  await waitFor(() => expect(second.getByTestId("care")).toHaveTextContent("5"));
});

it("keeps this session's own writes over an older device copy", () => {
  update((s) => ({ ...s, careSteps: 3 }));
  seed(9);
  const shown = render(<Care />);
  expect(shown.getByTestId("care")).toHaveTextContent("3");
});

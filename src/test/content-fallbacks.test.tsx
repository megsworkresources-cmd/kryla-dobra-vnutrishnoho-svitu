import { afterEach, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { CHARACTERS, cheerOf } from "@/content/characters";
import { PLACES, placeImage } from "@/content/places";
import { itemAtOr } from "@/content/list";
import { CartoonStage } from "@/components/CartoonStage";

afterEach(cleanup);
it("unknown places and empty place data retain the original welcome illustration", () => {
  const expected = placeImage("garden");
  expect(placeImage("missing")).toBe(expected);
  const saved = PLACES.splice(0);
  try {
    expect(placeImage("garden")).toBe(expected);
  } finally {
    PLACES.push(...saved);
  }
});
it("empty character replies use the character's existing comfort line", () => {
  const replies = CHARACTERS.olenka.cheer.splice(0);
  try {
    expect(cheerOf("olenka", NaN)).toBe(CHARACTERS.olenka.comfort);
  } finally {
    CHARACTERS.olenka.cheer.push(...replies);
  }
});
it("fixed-list recovery handles empty, negative and non-finite indices", () => {
  expect(itemAtOr([], 0, 440)).toBe(440);
  expect(itemAtOr([392, 440], -1, 523)).toBe(440);
  expect(itemAtOr([392, 440], NaN, 523)).toBe(392);
  expect(itemAtOr([392, 440], Infinity, 523)).toBe(392);
});
it("cartoon fallback scenes render despite a corrupt beat counter", () => {
  expect(() =>
    render(
      <CartoonStage
        clipId="rain"
        index={NaN}
        shot={{ img: placeImage("sky"), who: "olenka", text: "", fx: "🌻" }}
        playing={false}
        film={false}
      />,
    ),
  ).not.toThrow();
});

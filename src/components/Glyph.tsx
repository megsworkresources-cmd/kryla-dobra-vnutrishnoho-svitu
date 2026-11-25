import type { CSSProperties } from "react";

/**
 * Small drawn symbols for the app's icons and floating decorations.
 *
 * Everything here is part of the same storybook as the scenes: flat paper shapes,
 * rounded corners and the palette tokens, so a sunflower on a card and a
 * sunflower in the meadow are the same picture. Content keeps its emoji in prose
 * for other renderers, and this module turns the ones used as icons into art.
 */
export type GlyphName =
  | "sun"
  | "moon"
  | "star"
  | "sparkle"
  | "cloud"
  | "rain"
  | "leaf"
  | "flower"
  | "sunflower"
  | "heart"
  | "book"
  | "palette"
  | "lantern"
  | "tree"
  | "mushroom"
  | "butterfly"
  | "drop"
  | "bridge"
  | "home"
  | "map"
  | "kite"
  | "music"
  | "wind"
  | "seed"
  | "sprout"
  | "footprint"
  | "friend"
  | "hedgehog"
  | "bee"
  | "search"
  | "gamepad"
  | "screen"
  | "chat"
  | "check"
  | "ring"
  | "ball"
  | "bubble"
  | "cards"
  | "puzzle"
  | "tulip"
  | "blossom"
  | "clover"
  | "turtle"
  | "fox"
  | "squirrel"
  | "ladybird"
  | "firefly"
  | "fire"
  | "rainbow"
  | "jar"
  | "body"
  | "basket"
  | "hand"
  | "wave"
  | "square"
  | "brush"
  | "frame"
  | "pause"
  | "retry"
  | "heart-sky"
  | "heart-honey"
  | "heart-sage"
  | "whale"
  | "balloon"
  | "snail"
  | "ant"
  | "pebble"
  | "fish"
  | "teddy"
  | "sign"
  | "compass"
  | "feather"
  | "bird"
  | "log"
  | "hare"
  | "deer"
  | "shell"
  | "sand"
  | "palm"
  | "calm"
  | "hug"
  | "smile";

const BY_EMOJI: Record<string, GlyphName> = {
  "☀": "sun",
  "☀️": "sun",
  "🌤": "sun",
  "🌤️": "sun",
  "🌅": "sun",
  "🔆": "sun",
  "🌞": "sun",
  "🌙": "moon",
  "🌛": "moon",
  "⭐": "star",
  "🌟": "star",
  "✨": "sparkle",
  "💫": "sparkle",
  "☁": "cloud",
  "☁️": "cloud",
  "🌥": "cloud",
  "🌥️": "cloud",
  "🌧": "rain",
  "🌧️": "rain",
  "🌦": "rain",
  "💧": "drop",
  "🍃": "leaf",
  "🌿": "leaf",
  "🍂": "leaf",
  "🌼": "flower",
  "🌸": "blossom",
  "🌺": "blossom",
  "🌷": "tulip",
  "🍀": "clover",
  "🌻": "sunflower",
  "🌱": "sprout",
  "🫙": "jar",
  "🧺": "basket",
  "🐱": "friend",
  "🧒": "body",
  "🤗": "heart",
  "🌰": "seed",
  "💛": "heart-honey",
  "❤": "heart",
  "❤️": "heart",
  "💙": "heart-sky",
  "💚": "heart-sage",
  "💜": "heart",
  "🧡": "heart",
  "🤍": "heart",
  "💖": "heart",
  "📖": "book",
  "📚": "book",
  "📕": "book",
  "🎨": "palette",
  "🖌": "palette",
  "✏": "palette",
  "✏️": "palette",
  "🏮": "lantern",
  "💡": "lantern",
  "🕯": "lantern",
  "🕯️": "lantern",
  "🌲": "tree",
  "🌳": "tree",
  "🍄": "mushroom",
  "🦋": "butterfly",
  "🌉": "bridge",
  "🏡": "home",
  "🏠": "home",
  "🗺": "map",
  "🗺️": "map",
  "🪁": "kite",
  "🎶": "music",
  "🎵": "music",
  "♪": "music",
  "💨": "wind",
  "👣": "footprint",
  "🐰": "hare",
  "🐿": "squirrel",
  "🐿️": "squirrel",
  "🦊": "fox",
  "🐻": "friend",
  "🦉": "friend",
  "🕊": "friend",
  "🕊️": "friend",
  "🦔": "hedgehog",
  "🐝": "bee",
  "🐞": "ladybird",
  "🦗": "bee",
  "🐢": "turtle",
  "🔥": "fire",
  "🔍": "search",
  "🎮": "gamepad",
  "📺": "screen",
  "💬": "chat",
  "✅": "check",
  "⭕": "ring",
  "⚽": "ball",
  "🎾": "ball",
  "💤": "moon",
  "🌈": "rainbow",
  "💢": "wind",
  "🎉": "sparkle",
  "🫧": "bubble",
  "🃏": "cards",
  "🧩": "puzzle",
  "🌠": "star",
  "🥾": "footprint",
  "🏕": "home",
  "🏕️": "home",
  "❓": "chat",
  "✿": "flower",
  "❋": "clover",
  "✧": "sparkle",
  "❀": "blossom",
  "☂": "rain",
  "☾": "moon",
  "☆": "star",
  "★": "star",
  "♫": "music",
  "✎": "brush",
  "♡": "heart",
  "✋": "hand",
  "↗": "footprint",
  Ⅱ: "pause",
  "↔": "chat",
  "⌁": "puzzle",
  "↻": "retry",
  "○": "ring",
  "◇": "chat",
  "▢": "square",
  "⌒": "bridge",
  "🐋": "whale",
  "🐳": "whale",
  "🎈": "balloon",
  "🐌": "snail",
  "🐜": "ant",
  "🪨": "pebble",
  "🐟": "fish",
  "🐠": "fish",
  "🧸": "teddy",
  "🪧": "sign",
  "🧭": "compass",
  "🪶": "feather",
  "🐦": "bird",
  "🪵": "log",
  "🐇": "hare",
  "🦌": "deer",
  "🐚": "shell",
  "🏖": "sand",
  "🏖️": "sand",
  "🌴": "palm",
  "😌": "calm",
  "😊": "smile",
  "🌬": "wind",
  "🌬️": "wind",
};

/** The drawn symbol for an emoji used as an icon; unknown ones become a sparkle. */
function glyphFor(emoji: string): GlyphName {
  const key = emoji.trim();
  return BY_EMOJI[key] ?? BY_EMOJI[[...key][0] ?? ""] ?? "sparkle";
}

export function Glyph({
  name,
  emoji,
  className = "h-6 w-6",
  style,
}: {
  name?: GlyphName | undefined;
  /** Convenience: derive the symbol from an emoji the content already holds. */
  emoji?: string | undefined;
  className?: string;
  style?: CSSProperties;
}) {
  const glyph = name ?? (emoji ? glyphFor(emoji) : "sparkle");
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      style={style}
      aria-hidden
      focusable="false"
      data-glyph={glyph}
    >
      {ART[glyph]}
    </svg>
  );
}

const BODY = "var(--ink)";
const PETAL = "var(--paper)";
const HONEY = "var(--honey)";
const SAGE = "var(--sage)";
const SKY = "var(--sky)";
const MOON = "var(--moon)";
const LAVENDER = "var(--lavender)";
const ROSE = "var(--rose)";

const HEART =
  "M16 27C8 21 4 17.6 4 12.8 4 9 7 6.4 10.4 6.4c2.4 0 4.4 1.3 5.6 3.3 1.2-2 3.2-3.3 5.6-3.3C25 6.4 28 9 28 12.8c0 4.8-4 8.2-12 14.2z";

const ART: Record<GlyphName, React.ReactNode> = {
  sun: (
    <>
      <circle cx="16" cy="16" r="7.5" fill={HONEY} />
      {Array.from({ length: 8 }, (_, i) => (
        <rect
          key={i}
          x="15"
          y="1.5"
          width="2"
          height="4.5"
          rx="1"
          fill={HONEY}
          transform={`rotate(${i * 45} 16 16)`}
        />
      ))}
    </>
  ),
  moon: (
    <>
      <path
        d="M20 5a11 11 0 1 0 0 22 8.6 8.6 0 0 1 0-22z"
        fill={MOON}
        stroke={LAVENDER}
        strokeWidth="1.6"
        transform="rotate(12 16 16)"
      />
      <circle cx="24" cy="8" r="1.4" fill={MOON} opacity=".7" />
    </>
  ),
  star: (
    <path
      d="M16 3.5l3.5 8 8.5.8-6.4 5.6 1.9 8.4L16 21.9l-7.5 4.4 1.9-8.4L4 12.3l8.5-.8z"
      fill={HONEY}
    />
  ),
  sparkle: (
    <>
      <path d="M16 4l2.6 7.4L26 14l-7.4 2.6L16 24l-2.6-7.4L6 14l7.4-2.6z" fill={HONEY} />
      <circle cx="25" cy="25" r="2" fill={MOON} />
      <circle cx="7" cy="24" r="1.5" fill={MOON} opacity=".8" />
    </>
  ),
  cloud: (
    <>
      <path
        d="M9 23a5.5 5.5 0 0 1-.4-11 7.5 7.5 0 0 1 14.3-1.2A5.8 5.8 0 0 1 23 23z"
        fill={PETAL}
        stroke={SAGE}
        strokeWidth="1.3"
      />
      <path d="M11 23h11" stroke={SKY} strokeWidth="1.6" strokeLinecap="round" opacity=".45" />
    </>
  ),
  rain: (
    <>
      <path d="M9 18a5 5 0 0 1-.3-10 6.8 6.8 0 0 1 13-1.1A5.3 5.3 0 0 1 23 18z" fill={PETAL} />
      {[11, 16, 21].map((x, i) => (
        <path
          key={x}
          d={`M${x} 21l-1.4 4`}
          stroke={SKY}
          strokeWidth="2"
          strokeLinecap="round"
          opacity={i === 1 ? 1 : 0.7}
        />
      ))}
    </>
  ),
  leaf: (
    <>
      <path d="M6 26C6 14 14 6 26 6c0 12-8 20-20 20z" fill={SAGE} />
      <path d="M9 23C13 18 18 13 23 9" stroke={PETAL} strokeWidth="1.4" fill="none" opacity=".8" />
    </>
  ),
  flower: (
    <>
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse
          key={i}
          cx="16"
          cy="7.5"
          rx="3.2"
          ry="5.4"
          fill={PETAL}
          stroke={LAVENDER}
          strokeWidth="1.2"
          transform={`rotate(${i * 60} 16 16)`}
        />
      ))}
      <circle cx="16" cy="16" r="4" fill={HONEY} />
    </>
  ),
  sunflower: (
    <>
      {Array.from({ length: 10 }, (_, i) => (
        <ellipse
          key={i}
          cx="16"
          cy="6"
          rx="2.4"
          ry="5.2"
          fill={HONEY}
          transform={`rotate(${i * 36} 16 16)`}
        />
      ))}
      <circle cx="16" cy="16" r="5.2" fill={BODY} opacity=".82" />
    </>
  ),
  heart: <path d={HEART} fill={ROSE} />,
  "heart-sky": <path d={HEART} fill={SKY} />,
  "heart-honey": <path d={HEART} fill={HONEY} />,
  "heart-sage": <path d={HEART} fill={SAGE} />,
  book: (
    <>
      <path
        d="M5 7c4-1.4 8-1.2 11 1v18c-3-2.2-7-2.4-11-1z"
        fill={PETAL}
        stroke={SAGE}
        strokeWidth="1.4"
      />
      <path
        d="M27 7c-4-1.4-8-1.2-11 1v18c3-2.2 7-2.4 11-1z"
        fill={PETAL}
        stroke={SAGE}
        strokeWidth="1.4"
      />
    </>
  ),
  palette: (
    <>
      <path
        d="M16 4a12 12 0 0 0 0 24c3 0 3.4-2 2.2-3.4-1.2-1.6 0-3.6 2-3.6H25A4 4 0 0 0 28 17 12 12 0 0 0 16 4z"
        fill={PETAL}
        stroke={SAGE}
        strokeWidth="1.4"
      />
      <circle cx="11" cy="12" r="2" fill={ROSE} />
      <circle cx="17" cy="9.5" r="2" fill={HONEY} />
      <circle cx="22" cy="13" r="2" fill={SKY} />
      <circle cx="12" cy="18.5" r="2" fill={SAGE} />
    </>
  ),
  lantern: (
    <>
      <path d="M16 4v3" stroke={BODY} strokeWidth="1.8" strokeLinecap="round" />
      <rect x="10" y="7" width="12" height="3" rx="1.5" fill={BODY} opacity=".75" />
      <rect x="9.5" y="10" width="13" height="15" rx="4" fill={HONEY} />
      <circle cx="16" cy="17" r="3.4" fill={PETAL} />
      <rect x="11" y="25" width="10" height="3" rx="1.5" fill={BODY} opacity=".75" />
    </>
  ),
  tree: (
    <>
      <rect x="14.6" y="17" width="2.8" height="11" rx="1.4" fill={BODY} opacity=".7" />
      <path d="M16 3l9 12H7z" fill={SAGE} />
      <path d="M16 10l10 12H6z" fill={SAGE} opacity=".85" />
    </>
  ),
  mushroom: (
    <>
      <path d="M4 16a12 8 0 0 1 24 0z" fill={ROSE} />
      <circle cx="11" cy="12.5" r="1.7" fill={PETAL} />
      <circle cx="20" cy="11.5" r="1.3" fill={PETAL} />
      <rect
        x="13"
        y="16"
        width="6"
        height="11"
        rx="3"
        fill={PETAL}
        stroke={SAGE}
        strokeWidth="1.2"
      />
    </>
  ),
  butterfly: (
    <>
      <path d="M15 16C11 8 4 8 4.5 13.5 5 19 11 19 15 18z" fill={LAVENDER} />
      <path d="M17 16c4-8 11-8 10.5-2.5C27 19 21 19 17 18z" fill={SKY} />
      <path d="M15 17c-3 6-8 6-7.6 2.8C7.8 17 12 17 15 17.6z" fill={SKY} opacity=".8" />
      <path d="M17 17c3 6 8 6 7.6 2.8C24.2 17 20 17 17 17.6z" fill={LAVENDER} opacity=".8" />
      <rect x="15.2" y="12" width="1.8" height="11" rx=".9" fill={BODY} />
    </>
  ),
  drop: <path d="M16 4c5 7 8 10.6 8 14.4A8 8 0 0 1 8 18.4C8 14.6 11 11 16 4z" fill={SKY} />,
  bridge: (
    <>
      <path
        d="M3 20c3-8 23-8 26 0"
        stroke={SAGE}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
      <rect x="3" y="20" width="26" height="3.4" rx="1.7" fill={BODY} opacity=".7" />
      <path d="M8 23v5M16 23v5M24 23v5" stroke={BODY} strokeWidth="2" opacity=".5" />
    </>
  ),
  home: (
    <>
      <path d="M4 15L16 4l12 11z" fill={ROSE} />
      <rect
        x="7.5"
        y="15"
        width="17"
        height="13"
        rx="2.5"
        fill={PETAL}
        stroke={SAGE}
        strokeWidth="1.3"
      />
      <rect x="13.5" y="20" width="5" height="8" rx="1.6" fill={HONEY} />
    </>
  ),
  map: (
    <>
      <path d="M4 8l8-3 8 3 8-3v19l-8 3-8-3-8 3z" fill={PETAL} stroke={SAGE} strokeWidth="1.4" />
      <path d="M12 5v19M20 8v19" stroke={SAGE} strokeWidth="1.2" opacity=".7" />
      <circle cx="16" cy="14" r="2.6" fill={ROSE} />
    </>
  ),
  kite: (
    <>
      <path d="M16 3l9 9-9 10-9-10z" fill={SKY} />
      <path d="M16 3v19" stroke={PETAL} strokeWidth="1.2" opacity=".8" />
      <path d="M7 12h18" stroke={HONEY} strokeWidth="1.6" opacity=".9" />
      <path d="M16 22c1 3-1.5 5 0 7" stroke={SAGE} strokeWidth="1.6" fill="none" />
    </>
  ),
  music: (
    <>
      <ellipse cx="10" cy="23" rx="4.4" ry="3.4" fill={LAVENDER} />
      <ellipse cx="22" cy="20.5" rx="4.4" ry="3.4" fill={LAVENDER} />
      <path d="M14 23V9l12-2.5v13.5" stroke={LAVENDER} strokeWidth="2.2" fill="none" />
    </>
  ),
  wind: (
    <>
      {[11, 16, 21].map((y, i) => (
        <path
          key={y}
          d={`M5 ${y}h${14 + i * 3}a3.2 3.2 0 1 0-3.2-3.2`}
          stroke={SKY}
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity={i === 1 ? 1 : 0.6}
        />
      ))}
    </>
  ),
  seed: (
    <>
      <ellipse cx="16" cy="17" rx="7" ry="9" fill={ROSE} transform="rotate(-14 16 17)" />
      <path d="M14 9c1 5 1 10 0 15" stroke={PETAL} strokeWidth="1.4" fill="none" opacity=".8" />
    </>
  ),
  sprout: (
    <>
      <path d="M16 27V13" stroke={SAGE} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M16 15C11 15 8 12 8 8c5 0 8 3 8 7z" fill={SAGE} />
      <path d="M16 12c5 0 8-3 8-7-5 0-8 3-8 7z" fill={SAGE} opacity=".85" />
      <rect x="9" y="25" width="14" height="3" rx="1.5" fill={BODY} opacity=".35" />
    </>
  ),
  footprint: (
    <>
      <g transform="rotate(-18 11.6 12)">
        <ellipse cx="11.6" cy="13.4" rx="4.2" ry="6.8" fill={SAGE} />
        <circle cx="8.4" cy="5.2" r="1.5" fill={SAGE} />
        <circle cx="11.6" cy="4.4" r="1.6" fill={SAGE} />
        <circle cx="14.8" cy="5.4" r="1.4" fill={SAGE} />
      </g>
      <g transform="rotate(-18 21.4 23.4)" opacity=".78">
        <ellipse cx="21.4" cy="24.8" rx="3.8" ry="6" fill={SAGE} />
        <circle cx="18.6" cy="17.6" r="1.4" fill={SAGE} />
        <circle cx="21.4" cy="17" r="1.5" fill={SAGE} />
        <circle cx="24.2" cy="17.8" r="1.3" fill={SAGE} />
      </g>
    </>
  ),
  friend: (
    <>
      <circle cx="16" cy="17" r="8.5" fill={LAVENDER} />
      <ellipse cx="10" cy="8.5" rx="3" ry="4" fill={LAVENDER} transform="rotate(-16 10 8.5)" />
      <ellipse cx="22" cy="8.5" rx="3" ry="4" fill={LAVENDER} transform="rotate(16 22 8.5)" />
      <circle cx="13" cy="16" r="1.4" fill={BODY} />
      <circle cx="19" cy="16" r="1.4" fill={BODY} />
      <path
        d="M14 20q2 1.8 4 0"
        stroke={BODY}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  hedgehog: (
    <>
      <path d="M4 20a12 10 0 0 1 24 0z" fill={SAGE} />
      <circle cx="16" cy="21" r="7" fill={PETAL} />
      <circle cx="14" cy="20" r="1.3" fill={BODY} />
      <circle cx="19" cy="20" r="1.3" fill={BODY} />
      <circle cx="16.5" cy="23" r="1.6" fill={ROSE} />
    </>
  ),
  bee: (
    <>
      <ellipse cx="16" cy="17" rx="7" ry="6" fill={HONEY} />
      <path d="M11 13v8M16 11.5v11M21 13v8" stroke={BODY} strokeWidth="1.6" opacity=".7" />
      <ellipse cx="11" cy="9" rx="3.4" ry="2.4" fill={PETAL} transform="rotate(-24 11 9)" />
      <ellipse cx="21" cy="9" rx="3.4" ry="2.4" fill={PETAL} transform="rotate(24 21 9)" />
    </>
  ),
  search: (
    <>
      <circle cx="14" cy="14" r="8" fill="none" stroke={SAGE} strokeWidth="3" />
      <path d="M20 20l6 6" stroke={SAGE} strokeWidth="3.4" strokeLinecap="round" />
    </>
  ),
  gamepad: (
    <>
      <rect x="3" y="10" width="26" height="15" rx="7" fill={LAVENDER} />
      <path d="M11 14v7M7.5 17.5h7" stroke={PETAL} strokeWidth="2" strokeLinecap="round" />
      <circle cx="22" cy="15" r="1.8" fill={PETAL} />
      <circle cx="25" cy="19" r="1.8" fill={HONEY} />
    </>
  ),
  screen: (
    <>
      <rect x="4" y="7" width="24" height="16" rx="3" fill={SKY} />
      <path d="M13 12.5l6 3.5-6 3.5z" fill={PETAL} />
      <rect x="11" y="25" width="10" height="2.6" rx="1.3" fill={BODY} opacity=".6" />
    </>
  ),
  chat: (
    <>
      <path
        d="M5 8h22a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H14l-6 5v-5H5a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3z"
        fill={PETAL}
        stroke={SAGE}
        strokeWidth="1.6"
      />
      <circle cx="11" cy="16" r="1.6" fill={SAGE} />
      <circle cx="16" cy="16" r="1.6" fill={SAGE} />
      <circle cx="21" cy="16" r="1.6" fill={SAGE} />
    </>
  ),
  check: (
    <>
      <circle cx="16" cy="16" r="13" fill={SAGE} />
      <path
        d="M10 16.5l4.4 4.5L22.5 11"
        stroke={PETAL}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  ring: <circle cx="16" cy="16" r="11" fill="none" stroke={SAGE} strokeWidth="2.4" opacity=".55" />,
  ball: (
    <>
      <circle cx="16" cy="16" r="12" fill={HONEY} />
      <path
        d="M6 10c6 3 14 3 20 0M6 22c6-3 14-3 20 0"
        stroke={PETAL}
        strokeWidth="1.6"
        fill="none"
      />
    </>
  ),
  bubble: (
    <>
      <circle cx="13" cy="18" r="9" fill={SKY} opacity=".55" />
      <circle cx="22" cy="11" r="5.5" fill={SKY} opacity=".8" />
      <circle cx="10" cy="14" r="2.4" fill={PETAL} opacity=".9" />
    </>
  ),
  cards: (
    <>
      <rect
        x="4"
        y="8"
        width="14"
        height="19"
        rx="3"
        fill={PETAL}
        stroke={LAVENDER}
        strokeWidth="1.6"
        transform="rotate(-9 11 17)"
      />
      <rect
        x="14"
        y="6"
        width="14"
        height="19"
        rx="3"
        fill={PETAL}
        stroke={SAGE}
        strokeWidth="1.6"
        transform="rotate(8 21 15)"
      />
      <circle cx="21" cy="15" r="3" fill={HONEY} />
    </>
  ),
  puzzle: (
    <>
      <rect x="4" y="4" width="11" height="11" rx="3" fill={HONEY} />
      <rect x="17" y="4" width="11" height="11" rx="3" fill={SKY} />
      <rect x="4" y="17" width="11" height="11" rx="3" fill={SAGE} />
      <rect x="17" y="17" width="11" height="11" rx="3" fill={ROSE} />
    </>
  ),
  tulip: (
    <>
      <path d="M16 27V14" stroke={SAGE} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M10 8c0 5 2.6 8 6 8s6-3 6-8c-2 1.4-4 1.4-6 0-2 1.4-4 1.4-6 0z" fill={ROSE} />
      <ellipse cx="13" cy="24" rx="5" ry="2.6" fill={SAGE} transform="rotate(-18 13 24)" />
    </>
  ),
  blossom: (
    <>
      {Array.from({ length: 5 }, (_, i) => (
        <ellipse
          key={i}
          cx="16"
          cy="8"
          rx="4"
          ry="5.6"
          fill={LAVENDER}
          transform={`rotate(${i * 72} 16 16)`}
        />
      ))}
      <circle cx="16" cy="16" r="3.4" fill={HONEY} />
    </>
  ),
  clover: (
    <>
      {[
        [16, 8],
        [24, 16],
        [16, 24],
        [8, 16],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="6.4" fill={SAGE} opacity={i % 2 ? 0.9 : 1} />
      ))}
      <circle cx="16" cy="16" r="2.4" fill={PETAL} />
    </>
  ),
  turtle: (
    <>
      <ellipse cx="16" cy="19" rx="10" ry="7" fill={SAGE} />
      <path d="M16 12v14M8 16h16" stroke={PETAL} strokeWidth="1.2" opacity=".7" />
      <circle cx="26" cy="21" r="3.4" fill={SAGE} />
      <circle cx="27" cy="20" r="1" fill={BODY} />
      <rect x="7" y="24" width="4" height="4" rx="2" fill={SAGE} />
      <rect x="21" y="24" width="4" height="4" rx="2" fill={SAGE} />
    </>
  ),
  fox: (
    <>
      <path d="M6 7l6 4h8l6-4-1 11a10 10 0 0 1-18 0z" fill={ROSE} />
      <path d="M11 19q5 4 10 0-3 6-5 6t-5-6z" fill={PETAL} />
      <circle cx="12.5" cy="15.5" r="1.4" fill={BODY} />
      <circle cx="19.5" cy="15.5" r="1.4" fill={BODY} />
      <circle cx="16" cy="21" r="1.6" fill={BODY} />
    </>
  ),
  squirrel: (
    <>
      <path d="M22 6c5 2 7 7 5 12-2 4-6 5-8 3 4-1 6-4 6-8 0-3-1-5-3-7z" fill={ROSE} opacity=".85" />
      <ellipse cx="15" cy="18" rx="7" ry="8" fill={HONEY} />
      <circle cx="15" cy="9.5" r="5" fill={HONEY} />
      <circle cx="17" cy="8.6" r="1.2" fill={BODY} />
      <circle cx="13" cy="11.5" r="1" fill={BODY} opacity=".7" />
      <ellipse cx="12" cy="24" rx="4" ry="2.6" fill={SAGE} opacity=".8" />
    </>
  ),
  firefly: (
    <>
      <circle cx="16" cy="20" r="7" fill={HONEY} opacity=".22" />
      <circle cx="16" cy="20" r="3.4" fill={HONEY} />
      <ellipse
        cx="12"
        cy="14"
        rx="3.2"
        ry="4.6"
        fill={PETAL}
        stroke={SAGE}
        strokeWidth="1"
        transform="rotate(-24 12 14)"
      />
      <ellipse
        cx="20"
        cy="14"
        rx="3.2"
        ry="4.6"
        fill={PETAL}
        stroke={SAGE}
        strokeWidth="1"
        transform="rotate(24 20 14)"
      />
      <circle cx="8" cy="8" r="1.2" fill={MOON} />
      <circle cx="25" cy="9" r="1" fill={MOON} />
    </>
  ),
  ladybird: (
    <>
      <ellipse cx="16" cy="18" rx="10" ry="8.5" fill={ROSE} />
      <path d="M16 9.5c-3 0-5 1-5 1l5 7 5-7s-2-1-5-1z" fill={BODY} opacity=".85" />
      <path d="M16 18v8.5" stroke={BODY} strokeWidth="1.3" opacity=".7" />
      <circle cx="11.5" cy="20.5" r="1.6" fill={BODY} opacity=".8" />
      <circle cx="20.5" cy="20.5" r="1.6" fill={BODY} opacity=".8" />
      <circle cx="12.5" cy="15" r="1.3" fill={BODY} opacity=".8" />
      <circle cx="19.5" cy="15" r="1.3" fill={BODY} opacity=".8" />
    </>
  ),
  fire: (
    <>
      <path
        d="M16 4c5 5 8 8 8 13a8 8 0 0 1-16 0c0-3 1.6-5.5 3.6-7.5.4 2 1.2 3 2.4 3.5-.4-3.4.4-6 2-9z"
        fill={HONEY}
      />
      <path
        d="M16 18c2 2 3 3 3 5a3 3 0 0 1-6 0c0-1.4.8-2.4 2-3.2.3 1 .7 1.5 1.4 1.8-.3-1.3-.2-2.4-.4-3.6z"
        fill={ROSE}
      />
    </>
  ),
  rainbow: (
    <>
      {[
        { r: 11, c: ROSE },
        { r: 8, c: HONEY },
        { r: 5, c: SAGE },
      ].map(({ r, c }) => (
        <path
          key={r}
          d={`M${16 - r} 24a${r} ${r} 0 0 1 ${r * 2} 0`}
          stroke={c}
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </>
  ),
  jar: (
    <>
      <rect
        x="8"
        y="9"
        width="16"
        height="18"
        rx="4"
        fill={PETAL}
        stroke={SAGE}
        strokeWidth="1.4"
      />
      <rect x="10" y="5" width="12" height="4" rx="2" fill={HONEY} />
      <circle cx="14" cy="17" r="2" fill={SKY} opacity=".7" />
      <circle cx="19" cy="21" r="1.5" fill={LAVENDER} opacity=".8" />
    </>
  ),
  body: (
    <>
      <circle cx="16" cy="9" r="4.6" fill={HONEY} />
      <path d="M16 14c-4.4 0-7 3-7 7s2.6 7 7 7 7-3 7-7-2.6-7-7-7z" fill={SAGE} />
      <path
        d="M16 22l-2-1.8c-1-.9-.4-2.6 1-2.6.6 0 1 .3 1 .3s.4-.3 1-.3c1.4 0 2 1.7 1 2.6z"
        fill={PETAL}
      />
    </>
  ),
  basket: (
    <>
      <path d="M8 13h16l-2 12H10z" fill={HONEY} />
      <path d="M10 17h12M10.6 21h10.8" stroke={BODY} strokeWidth="1.2" opacity=".45" />
      <path d="M11 13a5 5 0 0 1 10 0" stroke={SAGE} strokeWidth="2" fill="none" />
    </>
  ),
  hand: (
    <>
      <rect x="9" y="12" width="3.6" height="9" rx="1.8" fill={HONEY} />
      <rect x="13" y="8" width="3.6" height="13" rx="1.8" fill={HONEY} />
      <rect x="17" y="9.5" width="3.6" height="11.5" rx="1.8" fill={HONEY} />
      <rect x="21" y="12" width="3.4" height="9" rx="1.7" fill={HONEY} />
      <path d="M9 17c0 6 3 10 8.6 10 4.4 0 6.8-3 6.8-7v-4z" fill={HONEY} />
    </>
  ),
  wave: (
    <>
      {[12, 17, 22].map((y, i) => (
        <path
          key={y}
          d={`M5 ${y}q5 -4 10 0t10 0`}
          stroke={SKY}
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          opacity={i === 1 ? 1 : 0.6}
        />
      ))}
    </>
  ),
  square: (
    <>
      <rect x="6" y="6" width="20" height="20" rx="5" fill="none" stroke={SAGE} strokeWidth="2.2" />
      <circle cx="6" cy="6" r="2.2" fill={HONEY} />
      <circle cx="26" cy="26" r="2.2" fill={HONEY} />
    </>
  ),
  brush: (
    <>
      <path d="M22 4l6 6-13 13-8 2 2-8z" fill={HONEY} />
      <path d="M9 17l6 6" stroke={PETAL} strokeWidth="1.6" opacity=".8" />
      <path d="M8 22l2 2" stroke={BODY} strokeWidth="2" strokeLinecap="round" opacity=".6" />
    </>
  ),
  frame: (
    <>
      <rect
        x="5"
        y="6"
        width="22"
        height="20"
        rx="3"
        fill={PETAL}
        stroke={SAGE}
        strokeWidth="1.6"
      />
      <circle cx="12" cy="13" r="2.6" fill={HONEY} />
      <path d="M8 22l6-7 5 6 3-3 3 4z" fill={SAGE} opacity=".8" />
    </>
  ),
  pause: (
    <>
      <rect x="9" y="7" width="5" height="18" rx="2.4" fill={SAGE} />
      <rect x="18" y="7" width="5" height="18" rx="2.4" fill={SAGE} />
    </>
  ),
  retry: (
    <>
      <path
        d="M26 16a10 10 0 1 1-3.6-7.7"
        stroke={SAGE}
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M22 4h6v6"
        stroke={SAGE}
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  whale: (
    <>
      <path
        d="M4 19c0-4.6 4.4-8 10-8s10 3.4 10 8c0 3.8-4 6.4-9 6.4C9 25.4 4 22.8 4 19z"
        fill={SKY}
      />
      <path d="M23 13l7-4v14l-7-4z" fill={SKY} opacity=".7" />
      <path
        d="M12 11c0-3 1.6-5 4-6"
        stroke={SKY}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="9.5" cy="17.5" r="1.4" fill={PETAL} />
      <path
        d="M12 22c2 1.6 4.6 1.6 6.6 0"
        stroke={PETAL}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
  balloon: (
    <>
      <ellipse cx="16" cy="12.5" rx="8" ry="9.5" fill={ROSE} />
      <path d="M16 22l-2 3h4z" fill={ROSE} />
      <path
        d="M16 25c2.4 2-2.4 4 0 6.5"
        stroke={SAGE}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
      />
      <ellipse
        cx="12.5"
        cy="8.5"
        rx="2"
        ry="3.2"
        fill={PETAL}
        opacity=".65"
        transform="rotate(-18 12.5 8.5)"
      />
    </>
  ),
  snail: (
    <>
      <path
        d="M3 25.6c0-2.8 2.2-4.6 5.4-4.6h11"
        stroke={SAGE}
        strokeWidth="4.4"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="18.4" cy="15.2" r="7.8" fill={HONEY} stroke={ROSE} strokeWidth="1.8" />
      <path
        d="M18.4 15.2a3 3 0 1 1 2.9 2.5"
        stroke={ROSE}
        strokeWidth="1.7"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="8.4" cy="14.2" r="3.6" fill={SAGE} />
      <circle cx="9.6" cy="13.4" r="1.1" fill={BODY} />
      <path
        d="M6.8 11l-1.8-3.6M10.4 11l1.6-3.6"
        stroke={SAGE}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </>
  ),
  ant: (
    <>
      <ellipse cx="8" cy="18" rx="3.2" ry="2.6" fill={BODY} />
      <ellipse cx="15" cy="18.6" rx="2.8" ry="2.4" fill={BODY} opacity=".92" />
      <ellipse cx="23" cy="19.4" rx="4.6" ry="3.4" fill={BODY} opacity=".8" />
      <path d="M6 16l-2.6-4M9.6 16l1.4-4.4" stroke={BODY} strokeWidth="1.3" strokeLinecap="round" />
      <path
        d="M13 20.6l-2.4 5M15 21v5M18 20.6l2.4 5M21 21.4l3 4.4"
        stroke={BODY}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity=".7"
      />
    </>
  ),
  pebble: (
    <>
      <path
        d="M6 22.6c-1.8 0-3.2-1.6-3.2-3.6 0-4.4 3.6-8 8-8 3.6 0 5.4 2.2 8.4 2.2 3.6 0 6.4 2.4 6.4 5.6 0 2.2-1.6 3.8-3.8 3.8z"
        fill={LAVENDER}
        stroke={SAGE}
        strokeWidth="1.3"
      />
      <path
        d="M11.4 12.8c1.8-1 3.8-.8 5 .4"
        stroke={PETAL}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        opacity=".9"
      />
      <path
        d="M4 25q4 2.2 8 0t8 0 8 0"
        stroke={SKY}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity=".85"
      />
    </>
  ),
  fish: (
    <>
      <path d="M4 16c4.4-5.4 13-5.4 17.4 0C17 21.4 8.4 21.4 4 16z" fill={SKY} />
      <path d="M21 16l7-4.4v8.8z" fill={SKY} opacity=".75" />
      <circle cx="9.6" cy="14.4" r="1.3" fill={PETAL} />
      <path
        d="M14 11.6c1.4 2.8 1.4 6 0 8.8"
        stroke={PETAL}
        strokeWidth="1.2"
        fill="none"
        opacity=".6"
      />
    </>
  ),
  teddy: (
    <>
      <circle cx="8.6" cy="8.6" r="3.4" fill={HONEY} />
      <circle cx="23.4" cy="8.6" r="3.4" fill={HONEY} />
      <circle cx="16" cy="11.6" r="7" fill={HONEY} />
      <ellipse cx="16" cy="22.4" rx="8" ry="7.6" fill={HONEY} />
      <ellipse cx="16" cy="23" rx="4" ry="4.4" fill={PETAL} />
      <circle cx="13" cy="10.8" r="1.2" fill={BODY} />
      <circle cx="19" cy="10.8" r="1.2" fill={BODY} />
      <circle cx="16" cy="14.4" r="1.6" fill={BODY} />
    </>
  ),
  sign: (
    <>
      <rect x="14.6" y="9" width="2.8" height="21" rx="1.4" fill={BODY} opacity=".65" />
      <path d="M5 5h17.5l5 4-5 4H5z" fill={PETAL} stroke={SAGE} strokeWidth="1.4" />
      <path d="M9 9h10.5" stroke={SAGE} strokeWidth="1.5" strokeLinecap="round" opacity=".7" />
    </>
  ),
  compass: (
    <>
      <circle cx="16" cy="16" r="12" fill={PETAL} stroke={SAGE} strokeWidth="2" />
      <path d="M21.4 10.6l-2.8 7.2-7.2 2.8 2.8-7.2z" fill={ROSE} />
      <circle cx="16" cy="16" r="1.7" fill={BODY} />
      <path
        d="M16 1.6v2M16 28.4v2M1.6 16h2M28.4 16h2"
        stroke={SAGE}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity=".55"
      />
    </>
  ),
  feather: (
    <>
      <path
        d="M16 27.4C10 23.2 6.2 18.6 6.2 14 6.2 8.8 9.6 4.6 15.2 3.4c.6 3.2.7 5.6.8 7.6.1-2 .4-4.4 1-7.2 5.4 1.4 8.2 5 8.2 10.2 0 4.6-3.6 9.2-9.2 13.4z"
        fill={LAVENDER}
      />
      <path d="M16 27V4.6" stroke={PETAL} strokeWidth="1.4" strokeLinecap="round" opacity=".95" />
      <path
        d="M16 20.6l-4 1M16 17l-4.6 1.2M16 13.4l-4.4 1.4M16 20.6l4-1M16 17l4.6 1.2M16 13.4l4.4 1.4"
        stroke={PETAL}
        strokeWidth="1"
        strokeLinecap="round"
        opacity=".65"
      />
    </>
  ),
  bird: (
    <>
      <ellipse cx="14.5" cy="18.5" rx="7.4" ry="5.6" fill={SKY} />
      <circle cx="22" cy="13.6" r="4.2" fill={SKY} />
      <path d="M26 13.4l5 1.8-5 1.8z" fill={HONEY} />
      <circle cx="23" cy="12.6" r="1.1" fill={BODY} />
      <path d="M12 15.4c-2.6-1-4.4-3-4.6-5.6 3.2.6 5.4 2.4 6.4 4.8z" fill={SKY} opacity=".7" />
      <path
        d="M8 20.6l-4 3M10 22.4l-2.6 4"
        stroke={SKY}
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity=".8"
      />
    </>
  ),
  log: (
    <>
      <path d="M8 11.6h13.6c4.2 0 6.8 2.4 6.8 5.6s-2.6 5.6-6.8 5.6H8z" fill={BODY} opacity=".55" />
      <path
        d="M12 15h10.6M12 20h9"
        stroke={BODY}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity=".3"
      />
      <ellipse cx="8" cy="17" rx="4.8" ry="6" fill={PETAL} stroke={SAGE} strokeWidth="1.5" />
      <ellipse
        cx="8"
        cy="17"
        rx="2.1"
        ry="2.8"
        fill="none"
        stroke={SAGE}
        strokeWidth="1.1"
        opacity=".75"
      />
      <circle cx="8" cy="17" r=".9" fill={SAGE} opacity=".7" />
      <path d="M19.4 10.2c1.2-1.6 3.2-1.4 3.8.2-1.4.8-3 .8-3.8-.2z" fill={SAGE} />
    </>
  ),
  hare: (
    <>
      <ellipse cx="16" cy="23" rx="7.6" ry="5.6" fill={PETAL} stroke={SAGE} strokeWidth="1.4" />
      <circle cx="16" cy="14.4" r="5.2" fill={PETAL} stroke={SAGE} strokeWidth="1.4" />
      <ellipse
        cx="13"
        cy="6"
        rx="2.1"
        ry="5"
        fill={PETAL}
        stroke={SAGE}
        strokeWidth="1.3"
        transform="rotate(-12 13 6)"
      />
      <ellipse
        cx="19.4"
        cy="6"
        rx="2.1"
        ry="5"
        fill={PETAL}
        stroke={SAGE}
        strokeWidth="1.3"
        transform="rotate(12 19.4 6)"
      />
      <ellipse
        cx="13"
        cy="6.2"
        rx="1"
        ry="3"
        fill={ROSE}
        opacity=".55"
        transform="rotate(-12 13 6.2)"
      />
      <ellipse
        cx="19.4"
        cy="6.2"
        rx="1"
        ry="3"
        fill={ROSE}
        opacity=".55"
        transform="rotate(12 19.4 6.2)"
      />
      <circle cx="14" cy="14" r="1.2" fill={BODY} />
      <circle cx="18" cy="14" r="1.2" fill={BODY} />
      <circle cx="16" cy="17.2" r="1.3" fill={ROSE} />
      <circle cx="10.6" cy="17" r="1.6" fill={ROSE} opacity=".3" />
      <circle cx="21.4" cy="17" r="1.6" fill={ROSE} opacity=".3" />
      <ellipse cx="16" cy="24.4" rx="4" ry="3.2" fill={HONEY} opacity=".28" />
    </>
  ),
  deer: (
    <>
      <path
        d="M10.6 12.4L7.6 5M10.6 9.6l-4-1.8M21.4 12.4l3-7.4M21.4 9.6l4-1.8"
        stroke={BODY}
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity=".8"
      />
      <ellipse cx="16" cy="19.4" rx="6.6" ry="8" fill={HONEY} />
      <ellipse cx="16" cy="25.6" rx="4.4" ry="3" fill={PETAL} />
      <circle cx="13.2" cy="17.4" r="1.3" fill={BODY} />
      <circle cx="18.8" cy="17.4" r="1.3" fill={BODY} />
      <circle cx="16" cy="25" r="1.5" fill={BODY} opacity=".85" />
    </>
  ),
  shell: (
    <>
      <path
        d="M16 27.2C7.8 25.8 4 19 5.8 12.2 6.8 8.2 10.4 5 16 5s9.2 3.2 10.2 7.2C28 19 24.2 25.8 16 27.2z"
        fill={ROSE}
      />
      <path
        d="M16 26.2V6.4M16 26.2L8.8 8.4M16 26.2l7.2-17.8M16 26.2L6.2 18.6M16 26.2l9.8-7.6"
        stroke={PETAL}
        strokeWidth="1.3"
        strokeLinecap="round"
        opacity=".85"
      />
      <path d="M12.2 27c.6-2.4 2-3.8 3.8-3.8s3.2 1.4 3.8 3.8" fill={PETAL} opacity=".7" />
    </>
  ),
  sand: (
    <>
      <circle cx="24.4" cy="7.6" r="3.6" fill={HONEY} />
      <path d="M2 19.4q7-4.6 14 0t14 0V30H2z" fill={HONEY} opacity=".75" />
      <path
        d="M2 19.4q7-4.6 14 0t14 0"
        stroke={HONEY}
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M5.4 22.6q3.4 2 6.8 0M19.8 23.4q3.4 2 6.8 0"
        stroke={SKY}
        strokeWidth="1.6"
        fill="none"
        strokeLinecap="round"
        opacity=".55"
      />
      <circle cx="9.6" cy="26.6" r="1.2" fill={ROSE} opacity=".8" />
      <circle cx="16" cy="28" r="1" fill={SAGE} opacity=".75" />
      <circle cx="22.6" cy="26.2" r="1.1" fill={LAVENDER} opacity=".9" />
    </>
  ),
  palm: (
    <>
      <path
        d="M13.6 28.6c.4-8 2.8-13 6.4-16"
        stroke={BODY}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity=".75"
      />
      <path d="M20 12.6c-5-3.4-9.6-2.6-13 1 4.6 1.4 9.4 1 13-1z" fill={SAGE} />
      <path d="M20 12.6c1.4-5.6-.6-9-4-10.6 1.2 4.4 1.2 7.8 4 10.6z" fill={SAGE} />
      <path d="M20 12.6c4.4-3.2 9-2.4 12.4 1.2-4.6 1.4-9.2 1-12.4-1.2z" fill={SAGE} />
      <path d="M20 12.6c3.4 4.2 3.6 8 1.4 11.6-1.4-4.4-2.6-8-1.4-11.6z" fill={SAGE} opacity=".85" />
      <circle cx="18.6" cy="15.4" r="1.7" fill={HONEY} />
    </>
  ),
  calm: (
    <>
      <circle cx="16" cy="16" r="12" fill={PETAL} stroke={SAGE} strokeWidth="1.8" />
      <path
        d="M10.4 15.4q2.2-2.4 4.4 0M17.2 15.4q2.2-2.4 4.4 0"
        stroke={BODY}
        strokeWidth="1.7"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M13 20.6q3 2.4 6 0"
        stroke={ROSE}
        strokeWidth="1.7"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="8.6" cy="19.6" r="2.2" fill={ROSE} opacity=".35" />
      <circle cx="23.4" cy="19.6" r="2.2" fill={ROSE} opacity=".35" />
    </>
  ),
  hug: (
    <>
      <path
        d="M3.6 11.6c1.2 8 5 12.6 12.4 14.6 7.4-2 11.2-6.6 12.4-14.6"
        stroke={SAGE}
        strokeWidth="3.2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M16 22.4c-3.4-2.6-5-4.4-5-6.6a3 3 0 0 1 5-2.4 3 3 0 0 1 5 2.4c0 2.2-1.6 4-5 6.6z"
        fill={ROSE}
      />
    </>
  ),
  smile: (
    <>
      <circle cx="16" cy="16" r="12" fill={PETAL} stroke={SAGE} strokeWidth="1.8" />
      <circle cx="12" cy="13.4" r="1.9" fill={BODY} />
      <circle cx="20" cy="13.4" r="1.9" fill={BODY} />
      <path
        d="M10.4 19.4q5.6 5.6 11.2 0"
        stroke={BODY}
        strokeWidth="1.9"
        fill="none"
        strokeLinecap="round"
      />
    </>
  ),
};

import { CHARACTERS, type CharId } from "@/content/characters";
import { placeImage } from "@/content/places";
import { Glyph, type GlyphName } from "./Glyph";

/**
 * Decorative storybook scene for the story activity. The choices already carry
 * their written labels and pressed states, so the whole picture is aria-hidden:
 * it adds atmosphere without adding content for a screen reader to parse twice.
 */
const PLACE_GLYPHS: Record<string, GlyphName[]> = {
  garden: ["sunflower", "leaf", "sparkle"],
  forest: ["leaf", "mushroom", "sparkle"],
  meadow: ["flower", "butterfly", "sparkle"],
  clouds: ["cloud", "sparkle", "sun"],
  sky: ["star", "moon", "sparkle"],
  studio: ["palette", "book", "sparkle"],
  path: ["footprint", "leaf", "sparkle"],
  safe: ["home", "lantern", "sparkle"],
};

export function StoryPreview({
  who,
  place,
  icon,
  showHero = false,
  compact = false,
}: {
  who?: CharId;
  place: string;
  icon: string;
  showHero?: boolean;
  /** Shorter banner for a closing card or a suggested activity. */
  compact?: boolean;
}) {
  const glyphs = PLACE_GLYPHS[place] ?? (["sparkle"] as GlyphName[]);
  return (
    <div
      aria-hidden
      className={`relative isolate overflow-hidden rounded-3xl bg-night shadow-soft ${
        compact ? "h-28 sm:h-32" : "h-40 sm:h-48"
      }`}
    >
      <img
        key={place}
        src={placeImage(place)}
        alt=""
        loading="eager"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover opacity-75 animate-kenburns"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-night/85 via-night/25 to-night/10" />
      <div className="absolute bottom-0 left-1/2 h-24 w-44 -translate-x-1/2 rounded-full bg-honey/25 blur-2xl" />

      {glyphs.map((glyph, i) => (
        <Glyph
          key={`${place}-${i}`}
          name={glyph}
          className="absolute h-7 w-7 animate-float sm:h-8 sm:w-8"
          style={{
            left: `${16 + i * 28}%`,
            top: `${18 + (i % 2) * 34}%`,
            animationDelay: `${i * 0.7}s`,
          }}
        />
      ))}

      <Glyph
        key={`${place}-${icon}`}
        emoji={icon}
        className="absolute right-4 top-4 h-9 w-9 animate-twinkle sm:h-10 sm:w-10"
      />

      {showHero && who && (
        <img
          key={`${who}-${place}`}
          src={CHARACTERS[who].image}
          alt=""
          loading="eager"
          decoding="async"
          className="absolute bottom-0 left-1/2 h-[88%] w-auto -translate-x-1/2 object-contain animate-talk drop-shadow-lg"
        />
      )}

      <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-night/80 to-transparent" />
    </div>
  );
}

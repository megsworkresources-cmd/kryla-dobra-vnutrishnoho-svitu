import { CHARACTERS, type CharId } from "@/content/characters";
import { placeImage } from "@/content/places";

/**
 * Decorative storybook scene for the story activity. The choices already carry
 * their written labels and pressed states, so the whole picture is aria-hidden:
 * it adds atmosphere without adding content for a screen reader to parse twice.
 */
const PLACE_GLYPHS: Record<string, string[]> = {
  garden: ["🌻", "🌿", "✨"],
  forest: ["🍃", "🍄", "✨"],
  meadow: ["🌼", "🦋", "✨"],
  clouds: ["☁️", "✨", "🌤️"],
  sky: ["⭐", "🌙", "✨"],
  studio: ["🎨", "✏️", "✨"],
  path: ["👣", "🍃", "✨"],
  safe: ["🏡", "🕯️", "✨"],
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
  const glyphs = PLACE_GLYPHS[place] ?? ["✨"];
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
        <span
          key={`${place}-${i}`}
          className="absolute animate-float text-xl sm:text-2xl"
          style={{
            left: `${16 + i * 28}%`,
            top: `${18 + (i % 2) * 34}%`,
            animationDelay: `${i * 0.7}s`,
          }}
        >
          {glyph}
        </span>
      ))}

      <span
        key={`${place}-${icon}`}
        className="absolute right-4 top-4 text-2xl animate-twinkle sm:text-3xl"
      >
        {icon}
      </span>

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

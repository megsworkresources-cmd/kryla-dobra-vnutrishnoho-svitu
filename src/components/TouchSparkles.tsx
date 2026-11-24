import { useEffect, useState } from "react";
import { Glyph, type GlyphName } from "./Glyph";

const GLYPHS: GlyphName[] = ["sparkle", "star", "flower", "heart", "moon"];
interface Burst {
  id: number;
  x: number;
  y: number;
}

/** A tiny, gentle sparkle burst wherever a child touches the screen. Hidden when "less motion" is on. */
export function TouchSparkles() {
  const [bursts, setBursts] = useState<Burst[]>([]);
  useEffect(() => {
    let n = 0;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const onDown = (e: PointerEvent) => {
      if (document.documentElement.classList.contains("reduce-motion")) return;
      const id = ++n;
      setBursts((b) => [...b.slice(-6), { id, x: e.clientX, y: e.clientY }]);
      const timer = setTimeout(() => {
        setBursts((b) => b.filter((x) => x.id !== id));
        timers.delete(timer);
      }, 800);
      timers.add(timer);
    };
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      timers.forEach(clearTimeout);
    };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-0 z-[60]" aria-hidden>
      {bursts.map((b) =>
        [0, 1, 2, 3, 4].map((k) => {
          const a = (k / 5) * Math.PI * 2 + b.id;
          return (
            <Glyph
              key={`${b.id}-${k}`}
              name={GLYPHS[(b.id + k) % GLYPHS.length]}
              className="absolute h-5 w-5 animate-sparkle"
              style={{
                left: b.x,
                top: b.y,
                ["--dx" as string]: `${Math.cos(a) * 34}px`,
                ["--dy" as string]: `${Math.sin(a) * 34}px`,
              }}
            />
          );
        }),
      )}
    </div>
  );
}

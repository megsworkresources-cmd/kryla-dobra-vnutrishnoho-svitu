import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Btn, Scene } from "@/components/Scene";
import { CharacterSay } from "@/components/Character";
import { pageHead } from "@/content/journeys";
import { SAFE_DRAW } from "@/content/play.i18n";
import type { Bi } from "@/content/adventures.i18n";
import { addDrawing, markDone } from "@/lib/store";
import { useLang, useT } from "@/lib/i18n";

export const Route = createFileRoute("/safe-drawing")({
  head: () =>
    pageHead("Що мені допомагає", "Намалюй, що допомагає тобі почуватися безпечно й затишно."),
  component: SafeDrawing,
});

const TOKENS = ["--primary", "--accent", "--rose", "--sky", "--ink"];

function SafeDrawing() {
  const t = useT();
  const lang = useLang();
  const L = (x: Bi) => (lang === "en" ? x.en : x.uk);
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [colors, setColors] = useState<string[]>([]);
  const [color, setColor] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    setColors(TOKENS.map((k) => cs.getPropertyValue(k).trim() || "gray"));
    const c = ref.current;
    if (!c) return;
    c.width = 800;
    c.height = 600;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.fillStyle = cs.getPropertyValue("--card").trim() || "white";
      ctx.fillRect(0, 0, 800, 600);
    }
  }, []);

  const at = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return [
      ((e.clientX - r.left) / r.width) * 800,
      ((e.clientY - r.top) / r.height) * 600,
    ] as const;
  };
  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const [x, y] = at(e);
    ctx.strokeStyle = colors[color] ?? "gray";
    ctx.lineWidth = 14;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y);
    ctx.stroke();
    setSaved(false);
  };
  const moveTo = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = ref.current?.getContext("2d");
    if (!drawing.current || !ctx) return;
    const [x, y] = at(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };
  const clear = () => {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle =
      getComputedStyle(document.documentElement).getPropertyValue("--card").trim() || "white";
    ctx.fillRect(0, 0, 800, 600);
    setSaved(false);
  };
  const save = () => {
    const c = ref.current;
    if (!c) return;
    addDrawing(c.toDataURL("image/jpeg", 0.7));
    markDone("safe-drawing");
    setSaved(true);
  };

  return (
    <Scene title="Що мені допомагає" back="/world" compact>
      <div className="space-y-4">
        <CharacterSay
          who="olenka"
          text={L(saved ? SAFE_DRAW.saved : SAFE_DRAW.intro)}
          mood={saved ? "cheer" : "talk"}
        />
        <div className="flex flex-wrap justify-center gap-2" aria-label={t("Ідеї")}>
          {SAFE_DRAW.ideas.map((x) => (
            <span key={x.uk} className="rounded-full bg-secondary px-3 py-1 text-sm">
              {L(x)}
            </span>
          ))}
        </div>
        <canvas
          ref={ref}
          aria-label={t("Полотно для малювання")}
          onPointerDown={down}
          onPointerMove={moveTo}
          onPointerUp={() => (drawing.current = false)}
          onPointerCancel={() => (drawing.current = false)}
          className="mx-auto block aspect-[4/3] w-full max-w-xl touch-none rounded-3xl shadow-soft"
        />
        <div className="flex flex-wrap items-center justify-center gap-2">
          {colors.map((c, k) => (
            <button
              key={k}
              type="button"
              aria-label={t("Колір {n}", { n: k + 1 })}
              aria-pressed={k === color}
              onClick={() => setColor(k)}
              className={`h-11 w-11 rounded-full border-4 ${k === color ? "border-foreground" : "border-card"}`}
              style={{ background: c }}
            />
          ))}
          <Btn variant="ghost" onClick={clear}>
            {t("Очистити")}
          </Btn>
          <Btn onClick={save}>{t("Зберегти в галерею")}</Btn>
        </div>
        <p className="paper-card p-4 text-sm">{L(SAFE_DRAW.note)}</p>
      </div>
    </Scene>
  );
}

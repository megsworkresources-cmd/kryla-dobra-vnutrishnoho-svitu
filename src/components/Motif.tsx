/**
 * A small animated picture for each exercise and for stories that have no
 * footage, so no page is a static wall of text. Purely decorative: the
 * activity always owns its captions and instructions.
 */
type Kind = "flower" | "wave" | "cloud" | "lantern" | "star" | "pencil" | "path" | "leaf";

const KIND_BY_ACTIVITY: Record<string, Kind> = {
  "meadow-flower": "flower",
  "meadow-wave": "wave",
  "meadow-relax": "leaf",
  "clouds-senses": "cloud",
  "clouds-release": "cloud",
  "clouds-haven": "leaf",
  "clouds-thoughts": "cloud",
  "clouds-anchor": "path",
  "sky-lantern": "lantern",
  "sky-bridge": "path",
  "sky-seed": "flower",
  "sky-rain": "cloud",
  "sky-sleep": "star",
  "sky-reflect": "star",
  "sky-sounds": "star",
  "studio-draw": "pencil",
  "studio-color": "flower",
  "studio-feel": "pencil",
  "studio-gallery": "pencil",
  "path-step": "path",
  "path-pause": "leaf",
  "path-talk": "cloud",
  "path-solve": "path",
  "path-mistake": "path",
};

const FALLBACK: Record<string, Kind> = {
  garden: "flower",
  meadow: "flower",
  forest: "leaf",
  clouds: "cloud",
  sky: "star",
  studio: "pencil",
  path: "path",
  safe: "leaf",
};

export function Motif({
  place,
  id,
  night,
}: {
  place: string;
  id: string;
  night?: boolean | undefined;
}) {
  const kind = KIND_BY_ACTIVITY[`${place}-${id}`] ?? FALLBACK[place] ?? "cloud";
  return (
    <div
      aria-hidden
      className={`relative h-24 overflow-hidden rounded-3xl ${night ? "bg-night/50" : "bg-secondary/60"}`}
    >
      <svg
        viewBox="0 0 320 96"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        focusable="false"
      >
        <Backdrop night={night} />
        {kind === "flower" && <Flower />}
        {kind === "wave" && <Wave />}
        {kind === "cloud" && <Cloud />}
        {kind === "lantern" && <Lantern />}
        {kind === "star" && <Stars />}
        {kind === "pencil" && <Pencil />}
        {kind === "path" && <Path />}
        {kind === "leaf" && <Leaf />}
      </svg>
    </div>
  );
}

const Backdrop = ({ night }: { night?: boolean | undefined }) => (
  <>
    <circle cx="268" cy="24" r="14" fill="var(--honey)" opacity={night ? 0.35 : 0.75} />
    {[24, 68, 118, 176, 232, 292].map((x, i) => (
      <circle
        key={x}
        cx={x}
        cy={14 + (i % 3) * 9}
        r="2"
        fill={night ? "var(--moon)" : "var(--sky)"}
        className="animate-twinkle"
        style={{ animationDelay: `${i * 0.4}s` }}
        opacity="0.8"
      />
    ))}
  </>
);

const Flower = () => (
  <g transform="translate(160 96)">
    <rect x="-3" y="-44" width="6" height="44" rx="3" fill="var(--sage)" />
    <ellipse cx="-14" cy="-18" rx="14" ry="6" fill="var(--sage)" transform="rotate(-22 -14 -18)" />
    <ellipse cx="14" cy="-26" rx="14" ry="6" fill="var(--sage)" transform="rotate(22 14 -26)" />
    <g className="animate-sway" style={{ transformOrigin: "0px -44px" }}>
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse
          key={i}
          cy="-58"
          rx="7"
          ry="15"
          fill="var(--honey)"
          transform={`rotate(${i * 45})`}
        />
      ))}
      <circle cy="-44" r="9" fill="var(--ink)" opacity="0.85" />
    </g>
  </g>
);

const Wave = () => (
  <>
    <g className="animate-wave-x" opacity="0.6">
      <path
        d="M-320 66 q40 -12 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 V120 H-320z"
        fill="var(--sky)"
      />
    </g>
    <g className="animate-wave-x-slow" opacity="0.7">
      <path
        d="M-320 76 q40 -10 80 0 t80 0 t80 0 t80 0 t80 0 t80 0 t80 0 V120 H-320z"
        fill="var(--primary)"
      />
    </g>
    <g transform="translate(150 56)" className="animate-float">
      <path d="M0 0 h26 l-6 8 h-14z" fill="var(--ink)" />
      <path d="M13 0 v-18 l10 13z" fill="var(--paper)" />
    </g>
  </>
);

const Cloud = () => (
  <>
    <g className="animate-cloud-sweep">
      <g fill="var(--paper)" opacity="0.9">
        <ellipse cx="70" cy="52" rx="34" ry="18" />
        <ellipse cx="100" cy="46" rx="26" ry="20" />
      </g>
      <g fill="var(--paper)" opacity="0.65">
        <ellipse cx="250" cy="34" rx="26" ry="13" />
        <ellipse cx="272" cy="30" rx="18" ry="14" />
      </g>
    </g>
    {[0, 1, 2].map((k) => (
      <circle
        key={k}
        cx={140 + k * 18}
        cy={72 - k * 8}
        r="2.5"
        fill="var(--primary)"
        className="animate-float"
        style={{ animationDelay: `${k * 0.7}s` }}
      />
    ))}
  </>
);

const Lantern = () => (
  <g transform="translate(160 20)">
    <path d="M0 0 v10" stroke="var(--ink)" strokeWidth="2" />
    <g className="animate-float">
      <rect x="-12" y="10" width="24" height="30" rx="6" fill="var(--honey)" opacity="0.9" />
      <rect x="-16" y="8" width="32" height="5" rx="2.5" fill="var(--ink)" opacity="0.8" />
      <circle cx="0" cy="25" r="6" fill="var(--paper)" className="animate-twinkle" />
    </g>
    {[0, 1, 2, 3].map((k) => (
      <circle
        key={k}
        cx={-20 + k * 13}
        cy={50 + (k % 2) * 6}
        r="1.8"
        fill="var(--honey)"
        className="animate-twinkle"
        style={{ animationDelay: `${k * 0.5}s` }}
      />
    ))}
  </g>
);

const Stars = () => (
  <>
    <circle
      cx="160"
      cy="54"
      r="26"
      fill="var(--honey)"
      opacity="0.18"
      className="animate-twinkle"
    />
    <g transform="translate(160 52)" className="animate-float">
      <path
        d="M0 -18 L5 -5 L18 -5 L8 3 L12 16 L0 8 L-12 16 L-8 3 L-18 -5 L-5 -5Z"
        fill="var(--honey)"
      />
    </g>
    {[110, 210, 232, 96].map((x, k) => (
      <path
        key={x}
        d="M0 -7 L2 -2 L7 0 L2 2 L0 7 L-2 2 L-7 0 L-2 -2Z"
        transform={`translate(${x} ${28 + (k % 2) * 22})`}
        fill="var(--moon)"
        className="animate-twinkle"
        style={{ animationDelay: `${k * 0.6}s` }}
      />
    ))}
  </>
);

const Pencil = () => (
  <g transform="translate(160 54)" className="animate-sway" style={{ transformOrigin: "0px 0px" }}>
    <g transform="rotate(-24)">
      <rect x="-40" y="-6" width="66" height="12" rx="3" fill="var(--primary)" />
      <path d="M26 -6 L42 0 L26 6z" fill="var(--honey)" />
      <rect x="-48" y="-6" width="10" height="12" rx="3" fill="var(--ink)" opacity="0.8" />
    </g>
    <path
      d="M-60 26 q22 -12 44 0 t44 0 t44 0"
      stroke="var(--sage)"
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
    />
  </g>
);

const Path = () => (
  <>
    <path
      d="M-10 96 q60 -30 110 -22 t110 -14 t110 6"
      stroke="var(--sage)"
      strokeWidth="14"
      fill="none"
      strokeLinecap="round"
      opacity="0.55"
    />
    {[54, 122, 196, 268].map((x, i) => (
      <ellipse
        key={x}
        cx={x}
        cy={82 - i * 6}
        rx="10"
        ry="4"
        fill="var(--paper)"
        opacity="0.85"
        className="animate-float"
        style={{ animationDelay: `${i * 0.6}s` }}
      />
    ))}
    <circle cx="288" cy="30" r="10" fill="var(--honey)" opacity="0.7" className="animate-twinkle" />
  </>
);

const Leaf = () => (
  <g transform="translate(160 96)">
    <path d="M0 0 q-6 -34 6 -60" stroke="var(--sage)" strokeWidth="5" fill="none" />
    {[0, 1, 2].map((k) => (
      <ellipse
        key={k}
        cx={k % 2 ? 18 : -18}
        cy={-20 - k * 16}
        rx="15"
        ry="6"
        fill="var(--sage)"
        transform={`rotate(${k % 2 ? 25 : -25} ${k % 2 ? 18 : -18} ${-20 - k * 16})`}
        className="animate-sway"
        style={{ animationDelay: `${k * 0.4}s` }}
      />
    ))}
    {[0, 1, 2, 3].map((k) => (
      <circle
        key={k}
        cx={-40 + k * 26}
        cy={-30 - (k % 2) * 14}
        r="3"
        fill="var(--honey)"
        className="animate-float"
        style={{ animationDelay: `${k * 0.8}s` }}
        opacity="0.8"
      />
    ))}
  </g>
);

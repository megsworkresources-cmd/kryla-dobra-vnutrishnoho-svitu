/** Animated emotion face drawn in SVG. Shape driven by brow/mouth/eyes (-1..1). */
export function Face({
  brow,
  mouth,
  eyes,
  className = "",
}: {
  brow: number;
  mouth: number;
  eyes: number;
  className?: string;
}) {
  const eyeR = 5 + eyes * 2.5;
  const eyeRy = eyes < -0.4 ? 1.5 : eyeR;
  const browTilt = brow * 6;
  const m = mouth * 14;
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      <circle cx="50" cy="50" r="46" fill="currentColor" opacity="0.18" />
      <g
        className="transition-all duration-500"
        stroke="var(--ink)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      >
        <path d={`M28 ${33 + browTilt} L42 ${33 - browTilt * 0.5}`} />
        <path d={`M58 ${33 - browTilt * 0.5} L72 ${33 + browTilt}`} />
        <path d={`M33 ${68 - m * 0.3} Q50 ${68 + m} 67 ${68 - m * 0.3}`} />
      </g>
      <ellipse cx="36" cy="45" rx={eyeR * 0.8} ry={eyeRy} fill="var(--ink)" />
      <ellipse cx="64" cy="45" rx={eyeR * 0.8} ry={eyeRy} fill="var(--ink)" />
      <circle cx="26" cy="58" r="5" fill="var(--rose)" opacity="0.5" />
      <circle cx="74" cy="58" r="5" fill="var(--rose)" opacity="0.5" />
    </svg>
  );
}

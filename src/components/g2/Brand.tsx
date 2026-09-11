/** G2.1 Interval: original outline lettering; no font or bitmap dependency. */
export function Wordmark({
  height = 26,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  return (
    <svg
      className={`g2-wordmark ${className}`}
      width={height * (333 / 80)}
      height={height}
      viewBox="0 0 333 80"
      fill="none"
      role="img"
      aria-label="NIVAR"
    >
      <g fill="currentColor">
        <path d="M0 76V4h12l40 51V4h12v72H52L12 25v51z" />
        <path d="M82 4h12v72H82z" />
        <path d="M109 4h13l22 55 22-55h13l-29 72h-12z" />
        <path d={height <= 18
          ? "M179 76l29-72h13l29 72h-13l-7-18h-29l5-12h20l-12-28-22 58z"
          : "M179 76l29-72h13l29 72h-13l-7-18h-29l4-11h21l-12-29-22 58z"} />
        <path fillRule="evenodd" d="M265 76V4h31c23 0 34 10 34 25 0 12-7 20-19 23l22 24h-16l-30-34h9c15 0 22-4 22-13s-7-14-22-14h-19v61z" />
      </g>
    </svg>
  );
}

interface EmblemDrawing {
  file: string;
  name: string;
  verb: string;
  micro: string;
  standard: string;
  circles?: [number, number, number][];
}
const EMBLEMS: Record<string, EmblemDrawing> = {
  hardware: {
    file: "hefesto", name: "Hefesto", verb: "Medir e construir",
    micro: "M15 35h34l-8 9H24zM29 44v10h8V44M20 57h24M23 25h19",
    standard: "M6 33h51l-11 13H19zM26 46v15h13V46M17 66h31M24 24l13-13 7 7-13 13zM32 27l17 18M15 20v5M10 24h5",
  },
  academy: {
    file: "perseu", name: "Perseu", verb: "Transmitir",
    micro: "M25 39q-4-11 7-18 0 8 7 13 5 7-7 12M23 47h18M29 48v16h6V48",
    standard: "M25 39q-10-13 9-26-2 12 8 18 9 10-6 16M21 49h22M25 54h14M29 54v21h6V54M12 19l5 5M52 19l-5 5M32 4v6",
  },
  software: {
    file: "ariadne", name: "Ariadne", verb: "Organizar",
    micro: "M13 60C26 60 14 26 31 26c21 0 24 21 7 21H24c-15 0-14 15 1 15h25",
    standard: "M9 63C26 63 13 20 33 20c24 0 27 24 6 24H22C4 44 7 67 26 67h28",
    circles: [[9,63,3],[54,67,3]],
  },
  advisory: {
    file: "socrates", name: "Sócrates", verb: "Questionar",
    micro: "M16 29h13v27H16M48 29H35v27h13M29 43h6",
    standard: "M8 24h18v39H8M56 24H38v39h18M18 31v24M46 31v24M26 44h12M28 20l4-4 4 4M28 68l4 4 4-4",
  },
  intelligence: {
    file: "argos", name: "Argos", verb: "Observar",
    micro: "M14 44q18-23 36 0-18 23-36 0z",
    standard: "M7 44q25-27 50 0-25 27-50 0zM12 23q20-14 40 0M12 65q20 14 40 0",
    circles: [[32,44,9],[32,44,2]],
  },
  house: {
    file: "diogenes", name: "Diógenes", verb: "Examinar",
    micro: "M24 38h16v20H24zM27 38v-5a5 5 0 0 1 10 0v5M22 58h20M32 44v8",
    standard: "M28 26h8v10M22 37h20v27H22zM27 37v-6a5 5 0 0 1 10 0v6M19 65h26M32 44v13M14 51H7M50 51h7M18 31l-5-5M46 31l5-5",
  },
};
export type FamilyEmblemVariant = "micro" | "standard" | "hero";
const OPTICAL_BOUNDS: Record<string, [string, string]> = {
  diogenes: ["18 24 28 38", "2 18 60 57"],
  argos: ["10 28 44 32", "2 10 60 68"],
  socrates: ["12 25 40 36", "3 12 58 64"],
  perseu: ["19 17 26 51", "6 0 52 80"],
  ariadne: ["9 20 46 47", "2 13 59 61"],
  hefesto: ["11 20 42 42", "1 6 62 67"],
};

export function FamilyEmblem({
  family,
  size = 48,
  variant = size <= 28 ? "micro" : size >= 200 ? "hero" : "standard",
  className = "",
  decorative = false,
}: {
  family: string;
  size?: number;
  variant?: FamilyEmblemVariant;
  className?: string;
  decorative?: boolean;
}) {
  const emblem = EMBLEMS[family] ?? EMBLEMS.house;
  const label = `${emblem.name} · ${emblem.verb}`;
  if (variant !== "hero") {
    const micro = variant === "micro";
    const circles = micro
      ? family === "intelligence" ? [[32,44,5]] : family === "software" ? [[13,60,3],[50,62,3]] : []
      : emblem.circles ?? [];
    return (
      <svg
        className={`g2-emblem g2-emblem--${variant} ${className}`}
        data-emblem-variant={variant}
        width={size}
        height={size}
        viewBox={OPTICAL_BOUNDS[emblem.file][micro ? 0 : 1]}
        fill="none"
        role={decorative ? undefined : "img"}
        aria-label={decorative ? undefined : label}
        aria-hidden={decorative || undefined}
      >
        <g stroke="currentColor" strokeWidth={micro ? 3 : 2.15} strokeLinecap="round" strokeLinejoin="round">
          <path d={micro ? emblem.micro : emblem.standard} />
          {circles.map(([cx,cy,r],i) => <circle key={i} cx={cx} cy={cy} r={r} />)}
        </g>
      </svg>
    );
  }
  return (
    <img
      className={`g2-emblem g2-emblem--hero ${className}`}
      data-emblem-variant="hero"
      src={`/g2/g21/emblems/${emblem.file}-hero-600.webp`}
      srcSet={`/g2/g21/emblems/${emblem.file}-hero-600.webp 600w, /g2/g21/emblems/${emblem.file}-hero-1200.webp 1200w`}
      sizes={`${size}px`}
      width={size}
      height={size}
      alt={decorative ? "" : label}
      aria-hidden={decorative || undefined}
      loading="lazy"
      decoding="async"
    />
  );
}

/** Original G2 vector lettering: entry, reference, valley, peak, return. */
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
      width={height * 5.15}
      height={height}
      viewBox="0 0 206 40"
      fill="none"
      role="img"
      aria-label="NIVAR"
    >
      <g stroke="currentColor" strokeWidth="4.6" strokeLinejoin="miter">
        <path d="M3 37V3L36 37V3M51 3V37M64 3L81 36L98 3M108 37L125 4L142 37M157 37V5H179C195 5 195 23 179 23H157M178 23L200 37" />
      </g>
    </svg>
  );
}

const EMBLEMS: Record<string, { file: string; name: string; verb: string }> = {
  hardware: { file: "hefesto", name: "Hefesto", verb: "Medir" },
  academy: { file: "perseu", name: "Perseu", verb: "Transmitir" },
  software: { file: "ariadne", name: "Ariadne", verb: "Organizar" },
  advisory: { file: "socrates", name: "Sócrates", verb: "Questionar" },
  intelligence: { file: "argos", name: "Argos", verb: "Observar" },
  house: { file: "diogenes", name: "Diógenes", verb: "Procurar" },
};
export function FamilyEmblem({
  family,
  size = 48,
}: {
  family: string;
  size?: number;
}) {
  const emblem = EMBLEMS[family] ?? EMBLEMS.house;
  return (
    <img
      className="g2-emblem"
      src={`/patronos/${emblem.file}-${size > 96 ? "384" : "192"}.webp`}
      width={size}
      height={size}
      alt={`${emblem.name} · ${emblem.verb}`}
      loading="lazy"
    />
  );
}

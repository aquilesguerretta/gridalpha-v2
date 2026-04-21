import { C, F } from '@/design/tokens';

type Zone = { name: string; price: string; delta: number };

const ZONES: Zone[] = [
  { name: 'WEST HUB', price: '35.90', delta: 0.30 },
  { name: 'PSEG',     price: '38.20', delta: 2.10 },
  { name: 'RECO',     price: '62.40', delta: 26.50 },
  { name: 'COMED',    price: '22.30', delta: -13.60 },
  { name: 'AEP',      price: '29.40', delta: -6.50 },
  { name: 'DOM',      price: '34.15', delta: -1.75 },
];

function Item({ z }: { z: Zone }) {
  const up = z.delta >= 0;
  const color = up ? C.alertNormal : C.alertCritical;
  const arrow = up ? '▲' : '▼';
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap">
      <span style={{ color: C.textSecondary }}>{z.name}</span>
      <span style={{ color: C.textPrimary }}>${z.price}</span>
      <span style={{ color }}>{arrow} {Math.abs(z.delta).toFixed(2)}</span>
    </span>
  );
}

function Row() {
  return (
    <div
      className="inline-flex items-center gap-8 px-4"
      style={{
        fontFamily: F.mono,
        fontSize: '14px',
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {ZONES.map((z, i) => (
        <span key={`${z.name}-${i}`} className="inline-flex items-center gap-8">
          <Item z={z} />
          <span style={{ color: 'rgba(241,241,243,0.15)' }}>·</span>
        </span>
      ))}
    </div>
  );
}

export function Ticker() {
  return (
    <div
      className="relative w-full overflow-hidden py-4"
      style={{
        borderTop: '1px solid rgba(255,255,255,0.07)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background:
          'linear-gradient(90deg, rgba(10,10,15,1) 0%, rgba(20,20,28,0.6) 50%, rgba(10,10,15,1) 100%)',
      }}
    >
      <div className="flex animate-ticker whitespace-nowrap">
        <Row />
        <Row />
        <Row />
      </div>
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-24"
        style={{ background: 'linear-gradient(90deg, #0A0A0F, transparent)' }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-24"
        style={{ background: 'linear-gradient(270deg, #0A0A0F, transparent)' }}
      />
      <style>{`
        @keyframes ga-ticker {
          0%   { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-33.333%, 0, 0); }
        }
        .animate-ticker { animation: ga-ticker 45s linear infinite; }
      `}</style>
    </div>
  );
}

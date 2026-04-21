import { C, F } from '@/design/tokens';
import { EDITORIAL_SURFACE_DEEP } from '@/design/editorial';
import { Reveal } from './Reveal';

const COLS: { header: string; items: string[] }[] = [
  { header: 'PRODUCT', items: ['Terminal', 'Simulate', 'Learn', 'Grid Atlas', 'Changelog'] },
  { header: 'MARKETS', items: ['United States · PJM', 'United States · MISO (soon)', 'Brasil · ONS', 'China · Provincial', 'The Roadmap'] },
  { header: 'RESOURCES', items: ['Documentation', 'API reference', 'The Alexandria Library', 'Status', 'Blog'] },
  { header: 'COMPANY', items: ['About', 'Founder', 'Contact', 'Careers', 'Terms & privacy'] },
];

function BoltHex({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M12 2 L21 7 L21 17 L12 22 L3 17 L3 7 Z" stroke={C.electricBlue} strokeWidth="1.3" fill="rgba(59,130,246,0.08)" />
      <path d="M13 7 L9 13 L12 13 L11 17 L15 11 L12 11 Z" fill={C.electricBlue} />
    </svg>
  );
}

export function Footer() {
  return (
    <footer style={{ background: EDITORIAL_SURFACE_DEEP, padding: '80px 80px 40px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div className="flex flex-col justify-between gap-16 lg:flex-row">
          <Reveal>
            <div style={{ maxWidth: 280 }}>
              <div className="flex items-center gap-3">
                <BoltHex />
                <span style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 24, color: C.textPrimary }}>
                  GridAlpha
                </span>
              </div>
              <p style={{ marginTop: 16, fontFamily: F.sans, fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
                The professional energy market view, made independent.
              </p>
            </div>
          </Reveal>

          <div className="grid flex-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" style={{ maxWidth: 760 }}>
            {COLS.map((c, i) => (
              <Reveal key={c.header} delay={i * 80}>
                <div>
                  <div
                    style={{
                      fontFamily: F.mono,
                      fontSize: 11,
                      letterSpacing: '0.12em',
                      color: 'rgba(255,255,255,0.45)',
                      marginBottom: 16,
                    }}
                  >
                    {c.header}
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {c.items.map((it) => (
                      <li key={it} style={{ lineHeight: 2.2 }}>
                        <a
                          href="#"
                          style={{
                            fontFamily: F.sans,
                            fontSize: 13,
                            color: 'rgba(255,255,255,0.72)',
                            textDecoration: 'none',
                            transition: 'color 150ms ease-out',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = C.textPrimary)}
                          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.72)')}
                        >
                          {it}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div
          className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center"
          style={{
            marginTop: 80,
            paddingTop: 32,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              fontFamily: F.mono,
              fontSize: 11,
              letterSpacing: '0.08em',
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            GRIDALPHA · BUILT FROM STATE COLLEGE, PENNSYLVANIA
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
            © 2026
          </div>
        </div>
      </div>
    </footer>
  );
}

import { C, F, S } from '@/design/tokens';

type Severity = 'critical' | 'warning';

type Anomaly = {
  severity: Severity;
  icon: string;
  label: string;
  detail?: string;
  zone?: string;
  market: string;
  sigma: string;
  time: string;
};

const MOCK_ANOMALIES: Anomaly[] = [
  {
    severity: 'critical',
    icon: '⚠',
    label: 'LMP DEVIATION',
    zone: 'WEST_HUB',
    market: 'PJM · WEST',
    sigma: '+2.3σ',
    time: '14:22',
  },
  {
    severity: 'warning',
    icon: '◆',
    label: 'LOAD FORECAST',
    detail: 'Divergence 3.2 GW above forecast',
    market: 'ERCOT · N',
    sigma: '+1.4σ',
    time: '14:08',
  },
  {
    severity: 'warning',
    icon: '◆',
    label: 'DA/RT SPREAD',
    detail: 'Widening at peak hour approach',
    market: 'CAISO · SP15',
    sigma: '+1.8σ',
    time: '13:55',
  },
];

function severityColor(severity: Severity): string {
  return severity === 'critical' ? C.alertCritical : C.falconGold;
}

export function AnomalyFeed() {
  return (
    <div
      style={{
        borderTop: `1px solid ${C.borderDefault}`,
        paddingTop: S.md,
      }}
    >
      {/* Eyebrow */}
      <div
        style={{
          fontFamily: F.mono,
          fontSize: '11px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: C.electricBlue,
          marginBottom: S.sm,
        }}
      >
        ANOMALY FEED · PJM · LIVE
      </div>

      {/* Rows */}
      <div>
        {MOCK_ANOMALIES.map((a, i) => {
          const accent = severityColor(a.severity);
          const isLast = i === MOCK_ANOMALIES.length - 1;
          return (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: S.md,
                padding: `${S.md} ${S.lg}`,
                borderLeft: `3px solid ${accent}`,
                borderBottom: isLast ? 'none' : `1px solid ${C.borderDefault}`,
              }}
            >
              <span
                style={{
                  fontFamily: F.mono,
                  fontSize: '13px',
                  color: accent,
                  width: '14px',
                  display: 'inline-flex',
                  justifyContent: 'center',
                }}
              >
                {a.icon}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: S.sm,
                  }}
                >
                  <span
                    style={{
                      fontFamily: F.mono,
                      fontSize: '11px',
                      letterSpacing: '0.12em',
                      color: C.textPrimary,
                      textTransform: 'uppercase',
                    }}
                  >
                    {a.label}
                  </span>
                  <span
                    style={{
                      fontFamily: F.mono,
                      fontSize: '11px',
                      fontWeight: 600,
                      color: accent,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {a.sigma}
                  </span>
                </div>
                {a.detail && (
                  <div
                    style={{
                      fontFamily: F.sans,
                      fontSize: '12px',
                      color: C.textSecondary,
                      marginTop: '2px',
                    }}
                  >
                    {a.detail}
                  </div>
                )}
              </div>

              <div
                style={{
                  fontFamily: F.mono,
                  fontSize: '10px',
                  color: C.textMuted,
                  textAlign: 'right',
                  letterSpacing: '0.08em',
                  whiteSpace: 'nowrap',
                }}
              >
                <div>{a.zone ?? a.market}</div>
                <div style={{ marginTop: '2px' }}>{a.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

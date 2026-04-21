import { useState } from 'react';
import { C, F, R } from '@/design/tokens';
import { CountUpInt, Reveal, useInViewOnce, useReducedMotion } from './Reveal';

type Tier = {
  label: string;
  badge: string;
  badgeColor: string;
  priceKind: 'int' | 'text';
  priceValue: number | string;
  suffix?: string;
  body: string;
  cta: string;
  ctaColor: string;
  highlighted?: boolean;
};

const TIERS: Tier[] = [
  {
    label: 'FREE',
    badge: 'Student',
    badgeColor: C.alertNormal,
    priceKind: 'int',
    priceValue: 0,
    suffix: 'forever',
    body: 'The Learn tier. Live explainer, historical sandbox, concept map, interview prep mode. For every student and early-career professional.',
    cta: 'Start learning →',
    ctaColor: C.alertNormal,
  },
  {
    label: 'PROFESSIONAL',
    badge: 'Most common',
    badgeColor: C.electricBlue,
    priceKind: 'int',
    priceValue: 99,
    suffix: 'per month',
    body: 'The full Terminal. Live LMP across the continental US, spark spread, battery arbitrage, Peregrine Intelligence with AI analysis, configurable alerts. For the trader, the analyst, the individual professional.',
    cta: 'Start 14-day trial →',
    ctaColor: C.electricBlue,
    highlighted: true,
  },
  {
    label: 'SIMULATE',
    badge: 'Q3 2026',
    badgeColor: 'rgba(255,255,255,0.45)',
    priceKind: 'int',
    priceValue: 299,
    suffix: 'per month',
    body: 'Professional, plus the asset optimization engine. Battery dispatch, industrial load shifting, tariff analysis, revenue attribution. For operators and industrial consumers.',
    cta: 'Join the waitlist →',
    ctaColor: C.electricBlue,
  },
  {
    label: 'ENTERPRISE',
    badge: 'IPPs & developers',
    badgeColor: 'rgba(255,255,255,0.45)',
    priceKind: 'text',
    priceValue: 'Custom',
    body: 'Simulate, plus historical data API access, interconnection queue intelligence, custom integrations, and direct support. For independent power producers and developers.',
    cta: 'Book a call →',
    ctaColor: C.electricBlue,
  },
];

function TierCard({ t, index }: { t: Tier; index: number }) {
  const [hover, setHover] = useState(false);
  const { ref, inView } = useInViewOnce<HTMLDivElement>(0.15);
  const reduced = useReducedMotion();
  const active = reduced ? true : inView;

  const baseBg = t.highlighted ? 'rgba(59,130,246,0.04)' : 'rgba(20,20,26,0.5)';
  const hoverBg = t.highlighted ? 'rgba(59,130,246,0.06)' : 'rgba(20,20,26,0.7)';

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: '1 1 0',
        minWidth: 240,
        maxWidth: 300,
        padding: 32,
        background: hover ? hoverBg : baseBg,
        border: `1px solid ${hover ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: R.xl,
        transition: 'background 200ms ease-out, border 200ms ease-out, opacity 500ms ease-out, transform 500ms ease-out',
        opacity: active ? 1 : 0,
        transform: active ? 'translateY(0)' : 'translateY(12px)',
        transitionDelay: reduced ? '0ms' : `${index * 80}ms`,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div className="flex items-center justify-between">
        <span style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.14em', color: t.highlighted ? C.textPrimary : 'rgba(255,255,255,0.72)' }}>
          {t.label}
        </span>
        <span style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.08em', color: t.badgeColor }}>
          {t.badge}
        </span>
      </div>

      <div style={{ marginTop: 24, display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span
          style={{
            fontFamily: F.display,
            fontSize: t.priceKind === 'text' ? 40 : 56,
            fontStyle: t.priceKind === 'text' ? 'italic' : 'normal',
            lineHeight: 1,
            color: C.textPrimary,
            letterSpacing: '-0.02em',
          }}
        >
          {t.priceKind === 'int' ? (
            <CountUpInt value={t.priceValue as number} prefix="$" />
          ) : (
            t.priceValue as string
          )}
        </span>
      </div>
      {t.suffix && (
        <div style={{ marginTop: 6, fontFamily: F.mono, fontSize: 12, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}>
          {t.suffix}
        </div>
      )}

      <p style={{ marginTop: 24, fontFamily: F.sans, fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.72)' }}>
        {t.body}
      </p>

      <a
        href="#"
        className="group inline-flex items-center gap-2"
        style={{
          marginTop: 32,
          fontFamily: F.sans,
          fontSize: 14,
          color: t.ctaColor,
          textDecoration: 'none',
        }}
      >
        <span>{t.cta.replace(' →', '')}</span>
        <span className="transition-transform duration-150 group-hover:translate-x-1">→</span>
      </a>
    </div>
  );
}

export function Pricing() {
  return (
    <section className="relative w-full px-8 py-32" style={{ maxWidth: '1280px', margin: '0 auto' }}>
      <Reveal>
        <div style={{ fontFamily: F.mono, fontSize: 11, letterSpacing: '0.18em', color: C.electricBlue }}>
          06 · PRICING
        </div>
      </Reveal>
      <Reveal delay={120}>
        <h2 style={{ margin: '20px 0 0 0', fontFamily: F.display, fontSize: 'clamp(40px, 5.5vw, 64px)', lineHeight: 1.05, letterSpacing: '-0.02em', color: C.textPrimary }}>
          <span style={{ display: 'block' }}>Simple pricing.</span>
          <span style={{ display: 'block', fontStyle: 'italic', color: 'rgba(255,255,255,0.45)' }}>Real value.</span>
        </h2>
      </Reveal>
      <Reveal delay={240}>
        <p style={{ marginTop: 24, fontFamily: F.sans, fontSize: 17, lineHeight: 1.55, color: 'rgba(255,255,255,0.55)', maxWidth: 520 }}>
          Start free. Scale when the work demands it.
        </p>
      </Reveal>

      <div
        className="flex flex-wrap justify-center gap-6"
        style={{ marginTop: 80, maxWidth: 1160, marginLeft: 'auto', marginRight: 'auto' }}
      >
        {TIERS.map((t, i) => (
          <TierCard key={t.label} t={t} index={i} />
        ))}
      </div>
    </section>
  );
}

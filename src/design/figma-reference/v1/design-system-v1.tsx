import { C, F } from './tokens';
import { Section1Numbers } from './components/ds/Section1Numbers';
import { Section2Labels } from './components/ds/Section2Labels';
import { Section3Cards } from './components/ds/Section3Cards';
import { Section4Charts } from './components/ds/Section4Charts';
import { Section5Tables } from './components/ds/Section5Tables';
import { Section6Feed } from './components/ds/Section6Feed';
import { Section7Controls } from './components/ds/Section7Controls';
import { Section8Nav } from './components/ds/Section8Nav';
import { Section9Map } from './components/ds/Section9Map';
import { Section10Overlays } from './components/ds/Section10Overlays';

export default function App() {
  return (
    <div style={{ background: C.bgEditorial, minHeight: '100vh', width: '100%' }}>
      <div style={{ width: '1440px', margin: '0 auto', color: C.textPrimary }}>
        {/* Canvas header */}
        <header style={{ padding: '96px 64px 64px' }}>
          <div style={{
            fontFamily: F.mono, fontSize: '11px', color: C.electricBlue,
            letterSpacing: '0.12em', marginBottom: '16px',
          }}>
            00 · SOURCE OF TRUTH
          </div>
          <h1 style={{
            fontFamily: F.serif, fontSize: '96px', color: C.textPrimary, margin: 0, lineHeight: 1, letterSpacing: '-0.01em',
          }}>
            GridAlpha Terminal
            <br />
            <span style={{ fontStyle: 'italic', color: C.textSecondary }}>component library.</span>
          </h1>
          <p style={{
            fontFamily: F.sans, fontSize: '16px', color: C.textSecondary, lineHeight: 1.6,
            marginTop: '24px', maxWidth: '640px',
          }}>
            Every component that will appear across Nest, Grid Atlas, Peregrine, Analytics, and Vault — defined here once,
            with variants documented. Discipline is the design system.
          </p>
          <div style={{ display: 'flex', gap: '24px', marginTop: '40px', fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em' }}>
            <span>CANVAS · 1440W</span>
            <span>BG · #0A0A0F</span>
            <span>TYPE · INSTRUMENT SERIF · INTER · GEIST MONO</span>
            <span>ACCENT · #3B82F6</span>
          </div>
        </header>

        <Section1Numbers />
        <Section2Labels />
        <Section3Cards />
        <Section4Charts />
        <Section5Tables />
        <Section6Feed />
        <Section7Controls />
        <Section8Nav />
        <Section9Map />
        <Section10Overlays />

        {/* Closing usage note */}
        <section style={{
          padding: '96px 64px 128px', borderTop: `1px solid ${C.borderDefault}`, marginTop: '32px',
        }}>
          <div style={{
            fontFamily: F.mono, fontSize: '11px', color: C.electricBlue,
            letterSpacing: '0.12em', marginBottom: '16px',
          }}>
            USAGE NOTES
          </div>
          <p style={{
            fontFamily: F.serif, fontStyle: 'italic', fontSize: '24px', color: C.textPrimary,
            lineHeight: 1.5, maxWidth: '880px', margin: 0,
          }}>
            "Every screen in the GridAlpha Terminal composes from these primitives. New variants are added here first,
            never inline on a screen. Discipline is the design system."
          </p>
        </section>
      </div>
    </div>
  );
}

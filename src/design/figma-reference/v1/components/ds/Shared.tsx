import { ReactNode } from 'react';
import { C, F } from '../../tokens';

export function SectionShell({ index, title, children }: { index: string; title: string; children: ReactNode }) {
  return (
    <section style={{ padding: '80px 64px', borderTop: `1px solid ${C.borderDefault}` }}>
      <div style={{ marginBottom: '48px' }}>
        <div style={{
          fontFamily: F.mono, fontSize: '11px', color: C.electricBlue,
          letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px',
        }}>
          {index} · COMPONENT LIBRARY
        </div>
        <h2 style={{ fontFamily: F.serif, fontSize: '56px', color: C.textPrimary, margin: 0, lineHeight: 1.05 }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

export function Annotation({ name, spec }: { name: string; spec: string }) {
  return (
    <div style={{ marginTop: '16px', maxWidth: '240px' }}>
      <div style={{
        fontFamily: F.mono, fontSize: '11px', color: C.textPrimary,
        letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px',
      }}>
        {name}
      </div>
      <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, lineHeight: 1.6 }}>
        {spec}
      </div>
    </div>
  );
}

export function Specimen({ children, name, spec, width }: { children: ReactNode; name: string; spec: string; width?: number | string }) {
  return (
    <div style={{ width: width ?? 'auto', flexShrink: 0 }}>
      <div style={{
        background: C.bgElevated, border: `1px solid ${C.borderDefault}`, borderRadius: '8px',
        padding: '32px', minHeight: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {children}
      </div>
      <Annotation name={name} spec={spec} />
    </div>
  );
}

export function Row({ children, gap = 24 }: { children: ReactNode; gap?: number }) {
  return <div style={{ display: 'flex', gap: `${gap}px`, flexWrap: 'wrap', alignItems: 'flex-start' }}>{children}</div>;
}

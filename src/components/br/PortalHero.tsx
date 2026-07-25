// PortalHero — ARCHITECT, Portal BR Wave 1.
//
// Título, subtítulo e o espaço reservado para a gravura em grande
// formato. A ilustração entra por `illustrationSlot`; nesta wave chega
// um placeholder. O espaço é reservado mesmo sem slot — a composição
// não pode reorganizar quando a gravura chegar.

import type { CSSProperties, ReactNode } from 'react';

// TODO: substituir por tokens do portal BR quando a wave visual chegar
const BR = {
  tinta: '#F2F2F0',
  tintaSuave: 'rgba(242,242,240,0.62)',
  fio: 'rgba(242,242,240,0.14)',
};

export interface PortalHeroProps {
  titulo: string;
  subtitulo: string;
  /** Gravura em grande formato. Espaço reservado mesmo quando ausente. */
  illustrationSlot?: ReactNode;
}

export function PortalHero({ titulo, subtitulo, illustrationSlot }: PortalHeroProps) {
  // Sem fontFamily declarada de propósito: a tipografia do portal é
  // decisão da wave visual. Declarar agora seria adivinhar.
  const tituloEstilo: CSSProperties = {
    margin: 0,
    fontSize: '42px',
    lineHeight: 1.12,
    letterSpacing: '-0.02em',
    fontWeight: 400,
    color: BR.tinta,
  };

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1.05fr) minmax(0, 0.95fr)',
        gap: '56px',
        alignItems: 'center',
        padding: '72px 0',
        borderBottom: `1px solid ${BR.fio}`,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h1 style={tituloEstilo}>{titulo}</h1>

        <p
          style={{
            margin: 0,
            maxWidth: '52ch',
            fontSize: '15px',
            lineHeight: 1.65,
            color: BR.tintaSuave,
          }}
        >
          {subtitulo}
        </p>
      </div>

      {/* Reserva de prancha para a gravura. Proporção fixa para que a
          entrada da ilustração não empurre o layout. */}
      <div
        style={{
          position: 'relative',
          minHeight: '300px',
          aspectRatio: '4 / 3',
          border: `1px solid ${BR.fio}`,
          borderRadius: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {illustrationSlot}
      </div>
    </section>
  );
}

export default PortalHero;

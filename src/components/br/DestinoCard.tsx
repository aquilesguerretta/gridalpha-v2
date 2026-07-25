// DestinoCard — ARCHITECT, Portal BR Wave 1.
//
// Dois estados visuais, nunca "ativo versus desabilitado":
//
//   disponivel — tinta cheia, fio pleno, clicável, chamada explícita.
//   em-breve   — traço mais leve, rótulo discreto, não clicável.
//
// Sem `disabled`, sem cinza morto, sem opacidade reduzida no bloco
// inteiro. Um destino em breve é antecipação declarada: ele se lê como
// promessa legível, não como botão quebrado. A hierarquia entre os dois
// estados é feita por peso de tinta e espessura de fio — o portal não
// gasta cor nisso.

import { useState } from 'react';
import { Link } from 'react-router-dom';

import type { DestinoBR } from '../../lib/data/br-destinos';

// TODO: substituir por tokens do portal BR quando a wave visual chegar
const BR = {
  campo: '#141418',
  tinta: '#F2F2F0',
  tintaSuave: 'rgba(242,242,240,0.62)',
  tintaFraca: 'rgba(242,242,240,0.34)',
  fio: 'rgba(242,242,240,0.16)',
  fioForte: 'rgba(242,242,240,0.34)',
  fioFraco: 'rgba(242,242,240,0.08)',
};

export interface DestinoCardProps {
  destino: DestinoBR;
}

export function DestinoCard({ destino }: DestinoCardProps) {
  const [sobre, setSobre] = useState(false);

  const disponivel = destino.status === 'disponivel' && destino.rota !== null;

  const corpo = (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h2
          style={{
            margin: 0,
            fontSize: '18px',
            lineHeight: 1.25,
            letterSpacing: '-0.01em',
            fontWeight: 400,
            color: disponivel ? BR.tinta : BR.tintaSuave,
          }}
        >
          {destino.titulo}
        </h2>

        <p
          style={{
            margin: 0,
            fontSize: '13px',
            lineHeight: 1.6,
            color: disponivel ? BR.tintaSuave : BR.tintaFraca,
          }}
        >
          {destino.descricao}
        </p>
      </div>

      {/* Rodapé do bloco separado por fio — o mesmo recurso de
          profundidade usado em toda parte neste sistema. */}
      <div
        style={{
          marginTop: '24px',
          paddingTop: '14px',
          borderTop: `1px solid ${disponivel ? BR.fio : BR.fioFraco}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        {disponivel ? (
          <>
            <span
              style={{
                fontSize: '11px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: BR.tinta,
              }}
            >
              Acessar
            </span>
            <span
              aria-hidden="true"
              style={{
                fontSize: '13px',
                color: BR.tinta,
                transform: sobre ? 'translateX(3px)' : 'none',
                transition: 'transform 140ms ease',
              }}
            >
              →
            </span>
          </>
        ) : (
          <span
            style={{
              fontSize: '10px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: BR.tintaFraca,
            }}
          >
            Em breve
          </span>
        )}
      </div>
    </>
  );

  const caixa = {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between' as const,
    minHeight: '196px',
    padding: '22px',
    borderRadius: 0,
  };

  if (!disponivel) {
    return (
      <article
        style={{
          ...caixa,
          border: `1px solid ${BR.fioFraco}`,
          background: 'transparent',
        }}
      >
        {corpo}
      </article>
    );
  }

  return (
    <Link
      // `rota` é string aqui — `disponivel` já garantiu que não é null.
      to={destino.rota as string}
      onMouseEnter={() => setSobre(true)}
      onMouseLeave={() => setSobre(false)}
      onFocus={() => setSobre(true)}
      onBlur={() => setSobre(false)}
      style={{
        ...caixa,
        border: `1px solid ${sobre ? BR.fioForte : BR.fio}`,
        background: BR.campo,
        textDecoration: 'none',
        transition: 'border-color 140ms ease',
      }}
    >
      {corpo}
    </Link>
  );
}

export default DestinoCard;

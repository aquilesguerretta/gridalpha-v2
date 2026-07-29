// RailToggle — o selo colapsado do rail direito.
//
// Reaproveita ring-track + ring-progress da Wave 1 como um selo circular
// pequeno preenchido pela porcentagem real de progresso — sem número
// impresso, o próprio arco é o dado. Mesma técnica de ModuloNode: fetch +
// inline, nunca <img>, porque é `currentColor` que faz o mesmo primitivo
// servir sobre qualquer campo, e é a herança de CSS através da fronteira
// HTML/SVG que faz `stroke-dashoffset` aplicado no `<span>` ancestral
// cascatear até o `<circle>` — mesmo mecanismo verificado na Wave 3.
//
// Um componente, dois papéis: abre o rail quando colapsado, fecha quando
// expandido. Quem posiciona é o chamador — este arquivo não sabe se está
// flutuando sobre a faixa fina ou sobre o painel aberto.

import { useEffect, useState } from 'react';
import { A, A2, AE } from '@/design/alexandria-tokens';

const BASE = '/alexandria/svg/nos-trilha';

// Mesmo cache de ModuloNode, mas próprio: os dois arquivos não se importam
// um do outro, e um Map de módulo é barato o bastante para duplicar em vez
// de criar acoplamento entre `navigation/` e `shell/`.
const cache = new Map<string, Promise<string>>();

function carregar(nome: string): Promise<string> {
  const existente = cache.get(nome);
  if (existente) return existente;
  const p = fetch(`${BASE}/${nome}.svg`)
    .then((r) => (r.ok ? r.text() : ''))
    .catch(() => '');
  cache.set(nome, p);
  return p;
}

function Anel({
  nome,
  cor,
  estilo,
}: {
  nome: string;
  cor: string;
  estilo?: React.CSSProperties;
}) {
  const [markup, setMarkup] = useState('');

  useEffect(() => {
    let vivo = true;
    carregar(nome).then((m) => {
      if (vivo) setMarkup(m);
    });
    return () => {
      vivo = false;
    };
  }, [nome]);

  return (
    <span
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, color: cor, ...estilo }}
      dangerouslySetInnerHTML={{ __html: markup }}
    />
  );
}

const TAMANHO = 36;

export interface RailToggleProps {
  /** 0–100. */
  percent: number;
  expanded: boolean;
  onClick: () => void;
}

export function RailToggle({ percent, expanded, onClick }: RailToggleProps) {
  const fracao = Math.max(0, Math.min(1, percent / 100));

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-label={`Progresso ${Math.round(percent)}% · ${expanded ? 'recolher' : 'expandir'} painel`}
      className="alx-rail-toggle"
      style={{
        position: 'relative',
        width: TAMANHO,
        height: TAMANHO,
        flex: 'none',
        background: 'none',
        border: 'none',
        borderRadius: '50%',
        padding: 0,
        cursor: 'pointer',
      }}
    >
      <Anel nome="ring-track" cor={A.fioSobreNavy} />
      <Anel
        nome="ring-progress"
        cor={A2.olivaSobreNavy}
        estilo={{
          strokeDasharray: 1,
          strokeDashoffset: 1 - fracao,
          // Rotação de −90° põe o início do arco no topo do selo, em vez
          // das 3 horas — mesma convenção do anel de progresso da Wave 3.
          transform: 'rotate(-90deg)',
          transition: `stroke-dashoffset ${AE.desenhoLongo} ${AE.easing}`,
        }}
      />

      <style>{`
        .alx-rail-toggle {
          opacity: 0.82;
          transition: opacity ${AE.hover} ${AE.easing};
        }
        .alx-rail-toggle:hover,
        .alx-rail-toggle:focus-visible {
          opacity: 1;
        }
        .alx-rail-toggle:focus-visible {
          outline: 1px solid ${A2.ouroSobreNavy};
          outline-offset: 3px;
        }
        @media (prefers-reduced-motion: reduce) {
          .alx-rail-toggle,
          .alx-rail-toggle span {
            transition: none !important;
          }
        }
      `}</style>
    </button>
  );
}

export default RailToggle;

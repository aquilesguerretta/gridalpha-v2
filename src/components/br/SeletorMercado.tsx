// SeletorMercado — ARCHITECT, Portal BR Wave 2 · Jaguar.
//
// Troca o prefixo de mercado da URL. Mercado é segmento de rota, não
// estado em store: o link é compartilhável, o bookmark funciona, e não
// há hidratação nem flash de mercado errado no primeiro paint.
//
// Wave 2: cores locais da Wave 1 substituídas pelos tokens Jaguar —
// o TODO da wave estrutural fecha aqui. Os ITENS não mudam: a spec
// (§4) confirma só o sistema de cor e o seletor discreto; item de
// menu segue não especificado.

import { useState, type CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { J, JF } from '../../design/jaguar-tokens';

export type MercadoId = 'br' | 'us';

interface Mercado {
  id: MercadoId;
  rotulo: string;
  rota: string;
}

// Estados Unidos aponta para `/us`, que hoje é alias da superfície de
// entrada americana existente. Quando o portal US ganhar página própria,
// só a rota muda — este componente não.
const MERCADOS: Mercado[] = [
  { id: 'br', rotulo: 'Brasil', rota: '/br' },
  { id: 'us', rotulo: 'Estados Unidos', rota: '/us' },
];

export interface SeletorMercadoProps {
  /** Mercado ativo. Se omitido, deriva do pathname. */
  ativo?: MercadoId;
}

export function SeletorMercado({ ativo }: SeletorMercadoProps) {
  const { pathname } = useLocation();
  const [sobre, setSobre] = useState<MercadoId | null>(null);

  const atual: MercadoId = ativo ?? (pathname.startsWith('/br') ? 'br' : 'us');

  const rotulo: CSSProperties = {
    fontFamily: JF.mono,
    fontSize: '10px',
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    color: J.tintaMuted,
  };

  return (
    <nav
      aria-label="Seleção de mercado"
      style={{ display: 'flex', alignItems: 'center', gap: '14px' }}
    >
      <span style={rotulo}>Mercado</span>

      <span
        aria-hidden="true"
        style={{ width: '1px', height: '12px', background: J.bordaDefault }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {MERCADOS.map((m) => {
          const selecionado = m.id === atual;
          const realcado = selecionado || sobre === m.id;

          return (
            <Link
              key={m.id}
              to={m.rota}
              aria-current={selecionado ? 'page' : undefined}
              onMouseEnter={() => setSobre(m.id)}
              onMouseLeave={() => setSobre(null)}
              onFocus={() => setSobre(m.id)}
              onBlur={() => setSobre(null)}
              style={{
                fontSize: '11px',
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                textDecoration: 'none',
                color: realcado ? J.tintaPrimaria : J.tintaSecundaria,
                borderRadius: 0,
                // O mercado ativo é marcado por fio embaixo, não por caixa
                // nem por pílula. Fio de 1px é toda a profundidade que este
                // sistema usa.
                borderBottom: `1px solid ${selecionado ? J.tintaPrimaria : 'transparent'}`,
                paddingBottom: '3px',
                transition: 'color 140ms ease, border-bottom-color 140ms ease',
              }}
            >
              {m.rotulo}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default SeletorMercado;

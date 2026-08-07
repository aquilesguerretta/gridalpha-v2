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

import { J, JT } from '../../design/jaguar-tokens';

export type MercadoId = 'br' | 'us';

interface Mercado {
  id: MercadoId;
  rotulo: string;
  rota: string;
}

// Topologia de Shell Wave 2: a entrada de Estados Unidos SAIU. O lado
// americano continua inteiro no disco e segue alcançável digitando
// `/us`, mas não é mais anunciado por navegação nenhuma — decisão do
// produto, não limitação técnica. Não virou item desabilitado nem
// "em breve": saiu da interface.
//
// `MercadoId` mantém `'us'` de propósito: o mercado existe como
// conceito e como rota; o que mudou é ele não ser oferecido aqui.
// Quando o portal US ganhar página própria, a entrada volta para esta
// lista e nada mais neste componente muda.
const MERCADOS: Mercado[] = [
  { id: 'br', rotulo: 'Brasil', rota: '/br' },
];

export interface SeletorMercadoProps {
  /** Mercado ativo. Se omitido, deriva do pathname. */
  ativo?: MercadoId;
}

export function SeletorMercado({ ativo }: SeletorMercadoProps) {
  const { pathname } = useLocation();
  const [sobre, setSobre] = useState<MercadoId | null>(null);

  const atual: MercadoId = ativo ?? (pathname.startsWith('/br') ? 'br' : 'us');

  // JT.rotulo (13px) — piso de texto de interface da Wave 3; os 10px
  // da Wave 2 saem. tintaSecundaria, não tintaMuted (contraste AA).
  const rotulo: CSSProperties = {
    ...JT.rotulo,
    color: J.tintaSecundaria,
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
                ...JT.nav,
                textDecoration: 'none',
                color: realcado ? J.tintaPrimaria : J.tintaSecundaria,
                borderRadius: 0,
                // Wave 3: o ativo ganha fio ocre de 2px — mais assertivo
                // que o hairline de tinta da Wave 2. O estado NÃO depende
                // do ocre para ser percebido (cor de texto + aria-current
                // carregam a informação); o fio é o acento com função.
                borderBottom: `2px solid ${selecionado ? J.acenteOcre : 'transparent'}`,
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

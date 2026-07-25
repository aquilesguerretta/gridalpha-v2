// AlexandriaHeader — faixa navy full-bleed no topo do produto.
//
// Regra da seção 4 aplicada aqui: elemento de navegação, busca e
// destaque NÃO recebe caixa por padrão. Item de nav ativo é marcado por
// fio de 1px embaixo — nunca por caixa, nunca por fundo. O campo de
// busca é fio embaixo e nada mais.
//
// Isso diverge do handoff de propósito: quatro dos cinco campos de
// busca do handoff têm container de quatro lados (L1181, L1356, L1660,
// L108). O quinto — a linha de consulta do ⌘K (L2038) — é só fio
// embaixo, e é esse o padrão que o brief manda seguir.

import { A, A2, AT, AS, AR, AE, ALAYOUT } from '../../../design/alexandria-tokens';

export interface AlexandriaNavItem {
  id: string;
  rotulo: string;
}

interface AlexandriaHeaderProps {
  itens?: AlexandriaNavItem[];
  itemAtivo?: string;
  onNavegar?: (id: string) => void;
  termoBusca?: string;
  onBuscar?: (termo: string) => void;
}

const NAV_PADRAO: AlexandriaNavItem[] = [
  { id: 'biblioteca', rotulo: 'Biblioteca' },
  { id: 'trilhas', rotulo: 'Trilhas' },
  { id: 'atlas', rotulo: 'Atlas' },
  { id: 'glossario', rotulo: 'Glossário' },
];

export function AlexandriaHeader({
  itens = NAV_PADRAO,
  itemAtivo = 'biblioteca',
  onNavegar,
  termoBusca = '',
  onBuscar,
}: AlexandriaHeaderProps) {
  return (
    <header
      style={{
        height: ALAYOUT.headerHeight,
        flex: `0 0 ${ALAYOUT.headerHeight}`,
        background: A.navy,
        borderBottom: `1px solid ${A.fioSobreNavy}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: AS.xl,
        padding: `0 ${AS.xl}`,
        borderRadius: AR.none,
      }}
    >
      {/* Marca — rosa dos ventos + wordmark + subtítulo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: AS.md, flex: 'none' }}>
        <img
          src="/alexandria/marca/rosa-sm-on-navy.png"
          alt=""
          width={30}
          height={30}
          style={{ display: 'block', flex: 'none' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ ...AT.h2, color: A.tintaSobreNavy, lineHeight: 1 }}>
            Alexandria
          </span>
          <span
            style={{
              ...AT.rotulo,
              fontSize: '8px',
              letterSpacing: '0.24em',
              color: A2.tintaMetadadoNavy,
              lineHeight: 1,
            }}
          >
            Atlas vivo da energia do Brasil
          </span>
        </div>
      </div>

      {/* Nav em linha única. Ativo = fio de 1px embaixo. Sem caixa. */}
      <nav style={{ display: 'flex', alignItems: 'center', gap: AS.xl, flex: 'none' }}>
        {itens.map((item) => {
          const ativo = item.id === itemAtivo;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavegar?.(item.id)}
              style={{
                ...AT.nav,
                color: ativo ? A.tintaSobreNavy : A2.tintaMetadadoNavy,
                background: 'none',
                border: 'none',
                borderBottom: `1px solid ${ativo ? A2.terracotaClara : 'transparent'}`,
                borderRadius: AR.none,
                padding: `0 0 ${AS.xs} 0`,
                cursor: 'pointer',
                transition: `color ${AE.estado} ${AE.easing}, border-color ${AE.estado} ${AE.easing}`,
              }}
            >
              {item.rotulo}
            </button>
          );
        })}
      </nav>

      {/* Busca — fio embaixo, nada mais. Sem container de quatro lados. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: AS.sm,
          flex: 'none',
          width: '250px',
          borderBottom: `1px solid ${A2.fioCampoSobreNavy}`,
          paddingBottom: AS.xs,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flex: 'none' }}>
          <circle cx="6" cy="6" r="4.5" stroke={A2.tintaMetadadoNavy} strokeWidth="1" />
          <line x1="9.5" y1="9.5" x2="12" y2="12" stroke={A2.tintaMetadadoNavy} strokeWidth="1" />
        </svg>
        <input
          value={termoBusca}
          onChange={(e) => onBuscar?.(e.target.value)}
          placeholder="Buscar no atlas…"
          style={{
            ...AT.dado,
            fontStyle: 'italic',
            flex: 1,
            minWidth: 0,
            background: 'none',
            border: 'none',
            borderRadius: AR.none,
            outline: 'none',
            color: A.tintaSobreNavy,
            padding: 0,
          }}
        />
      </div>
    </header>
  );
}

export default AlexandriaHeader;

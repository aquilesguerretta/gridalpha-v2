// RailRight — retrátil, sempre navy.
//
// ─────────────────────────────────────────────────────────────
// MECÂNICA (Wave 16) — leia antes de mudar a largura de qualquer coisa
// aqui.
//
// O rail tem dois estados: COLAPSADO (padrão de entrada em toda página) e
// EXPANDIDO. A decisão de mecânica, tomada vendo renderizado:
//
//   A faixa colapsada (`LARGURA_COLAPSADA`, em fluxo) é a ÚNICA coisa que
//   ocupa espaço no flexbox da linha [rail-esquerdo? · main · rail-
//   direito]. Ela nunca muda de largura. O painel completo (300px, todas
//   as cinco seções) é `position: absolute` dentro da linha — sai do
//   fluxo, não conta pro flex — e desliza por cima como overlay/drawer
//   quando expandido, em vez de empurrar o canvas.
//
// Por quê: um painel que expande e colapsa mudando o próprio flex-basis
// obriga o browser a recalcular o layout do canvas A CADA FRAME da
// animação — é o modo de falha que os brief nomeia. Com o painel como
// overlay, só a `transform` anima (composto, sem reflow), e o flex-basis
// da faixa fina nunca muda — o canvas nunca recalcula nada, nem durante a
// transição, nem em repouso.
//
// Isso também é o que cumpre a regra de que colapsado precisa reclamar
// ESPAÇO REAL: com a faixa fina em 64px em vez do painel de 300px, o
// canvas ganha os 236px de volta por reflow de flexbox de verdade — medido
// no fechamento da wave, não presumido.
//
// A faixa colapsada e o painel expandido usam o MESMO botão: `RailToggle`
// fica ancorado por posição absoluta, acima dos dois (z-index mais alto),
// e alterna entre eles. Não existem dois toggles — um clique no mesmo selo
// abre e fecha.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, type ReactNode } from 'react';
import { A, A2, AT, AS, AR, AE, ALAYOUT } from '../../../design/alexandria-tokens';
import { MOCK_USER_PROGRESS } from '../../../lib/data/alexandria-progress-mock';
import { RailToggle } from './RailToggle';

export interface RailRightSlots {
  progresso?: ReactNode;
  listaAulas?: ReactNode;
  proximaAula?: ReactNode;
  conquistas?: ReactNode;
  referencias?: ReactNode;
}

// Ordem fixa — a sequência é o contrato, não uma preferência.
const SECOES: { chave: keyof RailRightSlots; rotulo: string; vazio: string }[] = [
  { chave: 'progresso',   rotulo: 'Progresso',       vazio: 'Sem trilha em curso' },
  { chave: 'listaAulas',  rotulo: 'Lista de aulas',  vazio: 'Nenhuma aula carregada' },
  { chave: 'proximaAula', rotulo: 'Próxima aula',    vazio: 'Nada agendado' },
  { chave: 'conquistas',  rotulo: 'Conquistas',      vazio: 'Nenhuma conquista ainda' },
  { chave: 'referencias', rotulo: 'Referências',     vazio: 'Sem referências nesta tela' },
];

/** Largura da faixa em repouso. Não vem de `ALAYOUT` — é constante nova
 *  desta wave, e `alexandria-tokens.ts` é somente-leitura aqui. Grande o
 *  bastante para o selo de 36px com folga, pequena o bastante para o
 *  canvas reclamar espaço de verdade. */
const LARGURA_COLAPSADA = '64px';

/** Estado vazio de uma seção. Ver histórico de medição na Wave 14 — o
 *  problema não era tamanho, era peso ótico (itálico + baixo contraste). */
function Placeholder({ texto }: { texto: string }) {
  return (
    <span style={{ ...AT.dado, color: A2.tintaSobreNavySuave }}>
      {texto}
    </span>
  );
}

export function RailRight({ slots = {} }: { slots?: RailRightSlots }) {
  const [expandido, setExpandido] = useState(false);

  const percentual =
    MOCK_USER_PROGRESS.aulasTotal > 0
      ? Math.round((MOCK_USER_PROGRESS.aulasCompleted / MOCK_USER_PROGRESS.aulasTotal) * 100)
      : 0;

  const alternar = () => setExpandido((v) => !v);

  // ESC fecha — mesmo idioma de qualquer painel sobreposto. Só ouve
  // enquanto está aberto.
  useEffect(() => {
    if (!expandido) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpandido(false);
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [expandido]);

  return (
    <>
      {/* Faixa em fluxo — a ÚNICA peça que o flexbox da linha enxerga.
          Largura constante nos dois estados: é isto que garante reflow
          real no colapso e zero reflow durante a animação de expandir. */}
      <aside
        style={{
          width: LARGURA_COLAPSADA,
          flex: `0 0 ${LARGURA_COLAPSADA}`,
          background: A.navy,
          borderLeft: `1px solid ${A.fioSobreNavy}`,
          borderRadius: AR.none,
        }}
      />

      {/* Clique fora fecha. Só existe montado enquanto expandido — não
          intercepta clique nenhum com o painel fechado. */}
      {expandido && (
        <div
          aria-hidden="true"
          onClick={() => setExpandido(false)}
          style={{ position: 'absolute', inset: 0, zIndex: 4, cursor: 'default' }}
        />
      )}

      {/* Painel completo — overlay. `position: absolute` tira do cálculo
          de flex da linha; só `transform` anima. */}
      <div
        className="alx-rail-drawer"
        role="region"
        aria-label="Progresso, aulas e conquistas"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: ALAYOUT.railRight,
          background: A.navy,
          borderLeft: `1px solid ${A.fioSobreNavy}`,
          borderRadius: AR.none,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 5,
          transform: expandido ? 'translateX(0)' : 'translateX(100%)',
          transition: `transform ${AE.hover} ${AE.easing}`,
        }}
      >
        {/* Espaço reservado para o selo, que flutua por cima e não faz
            parte deste fluxo. Sem isso a primeira seção nasce atrás dele. */}
        <div aria-hidden="true" style={{ height: 60, flex: 'none' }} />

        {SECOES.map((secao, i) => (
          <section
            key={secao.chave}
            style={{
              padding: `${AS.lg} ${AS.xl}`,
              borderBottom: i < SECOES.length - 1 ? `1px solid ${A.fioSobreNavy}` : 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: AS.md,
            }}
          >
            <span style={{ ...AT.rotulo, color: A2.ouroSobreNavy }}>{secao.rotulo}</span>
            {slots[secao.chave] ?? <Placeholder texto={secao.vazio} />}
          </section>
        ))}
      </div>

      {/* Selo — sempre no mesmo lugar da linha, acima dos dois estados.
          É o único controle: abre a faixa, e dentro dela o mesmo clique
          fecha. */}
      <div style={{ position: 'absolute', top: AS.lg, right: '14px', zIndex: 10 }}>
        <RailToggle percent={percentual} expanded={expandido} onClick={alternar} />
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .alx-rail-drawer { transition: none !important; }
        }
      `}</style>
    </>
  );
}

export default RailRight;

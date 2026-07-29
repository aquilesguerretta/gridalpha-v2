// RailRight — some por completo quando fechado. Só existe como painel.
//
// ─────────────────────────────────────────────────────────────
// MECÂNICA — leia antes de mexer na largura de qualquer coisa aqui.
//
// Não há mais faixa fixa reservando espaço no flexbox. O único traço do
// rail em repouso é o botão flutuante (`RailToggle`, bússola) — tudo o
// mais é `position: absolute`, fora do cálculo de flex da linha
// [rail-esquerdo? · main · rail-direito]. Sem elemento em fluxo, o
// canvas (`flex: 1`) reclama a largura inteira sempre, não só quando
// colapsado.
//
// O painel completo (300px, cinco seções) continua sendo overlay/drawer
// — desliza por cima do canvas via `transform` ao abrir, nunca empurra o
// layout. Mesmo raciocínio de antes: animar a própria largura do rail
// obrigaria o browser a recalcular o canvas a cada frame; com overlay,
// só a `transform` anima (composto, sem reflow), e não existe mais
// elemento nenhum em fluxo cuja largura pudesse mudar.
// ─────────────────────────────────────────────────────────────

import { useEffect, useState, type ReactNode } from 'react';
import { A, A2, AT, AS, AR, AE, ALAYOUT } from '../../../design/alexandria-tokens';
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
      {/* Clique fora fecha. Só existe montado enquanto expandido — não
          intercepta clique nenhum com o painel fechado. */}
      {expandido && (
        <div
          aria-hidden="true"
          onClick={() => setExpandido(false)}
          style={{ position: 'absolute', inset: 0, zIndex: 4, cursor: 'default' }}
        />
      )}

      {/* Painel — overlay flutuante. Nasce fora da tela (translateX 100%)
          e desliza por cima do canvas; nunca é um elemento em fluxo. */}
      <div
        className="alx-rail-drawer"
        role="region"
        aria-label="Progresso, aulas e conquistas"
        style={{
          position: 'absolute',
          top: AS.lg,
          right: AS.lg,
          bottom: AS.lg,
          width: ALAYOUT.railRight,
          background: A.navy,
          border: `1px solid ${A.fioSobreNavy}`,
          borderRadius: AR.none,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 5,
          transform: expandido ? 'translateX(0)' : 'translateX(calc(100% + 24px))',
          transition: `transform ${AE.hover} ${AE.easing}`,
        }}
      >
        {/* Espaço reservado para o botão, que flutua por cima e não faz
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

      {/* Botão — bússola flutuante, sempre no mesmo lugar da linha,
          acima do painel. É o único controle: abre e fecha com o
          mesmo clique. */}
      <div style={{ position: 'absolute', top: AS.lg, right: AS.lg, zIndex: 10 }}>
        <RailToggle expanded={expandido} onClick={alternar} />
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

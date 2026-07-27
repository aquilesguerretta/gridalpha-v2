// DestinoCard — ARCHITECT, Portal BR Wave 2 · Jaguar.
//
// Cinco cards, mesma moldura e tamanho (spec §3). A hierarquia mora
// DENTRO do card, nos dois estados confirmados por protótipo:
//
//   disponível — prévia real da interface, nas cores reais do sistema
//                do destino. Conteúdo genuíno, não ilustração.
//   em breve   — planta baixa: retângulos vazios em traço fino ocre,
//                sem preenchimento, desenhando via stroke-dashoffset.
//                Sugere o layout do que existirá, sem fingir conteúdo.
//
// Clique tem o mesmo comportamento de zoom do hero — consistência de
// interação pela página inteira. Card em breve NÃO é disabled: abre o
// estado "em breve" em planta baixa, nunca link morto.

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { flushSync } from 'react-dom';

import { J, JF, JT } from '../../design/jaguar-tokens';
import type { DestinoBR } from '../../lib/data/br-destinos';

// Cores REAIS do sistema Alexandria, literais da spec §3 ("papel
// #F2E9D6, tinta navy #0D2340"). Hardcoded de propósito: importar de
// alexandria-tokens.ts é proibido — a prévia cita o destino, não
// acopla os dois sistemas.
const ALEXANDRIA_PAPEL = '#F2E9D6';
const ALEXANDRIA_TINTA = '#0D2340';

/** startViewTransition com checagem de suporte — mesma técnica do
 *  PortalBR; duplicado aqui de propósito (componente não importa de
 *  página). flushSync para o snapshot novo capturar o DOM atualizado.
 *  Reduced-motion pula a transição por inteiro: o kill-switch CSS do
 *  PortalBR desmonta junto com a página na navegação, então confiar
 *  nele deixaria o crossfade default do UA animar mesmo assim. */
function comTransicao(mudanca: () => void) {
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduzido && 'startViewTransition' in document) {
    document.startViewTransition(() => {
      flushSync(mudanca);
    });
  } else {
    mudanca();
  }
}

// ─── Planta baixa ────────────────────────────────────────────────────
// Um esboço de layout por destino — traço fino ocre, sem preenchimento.
// Cada forma leva pathLength=1 + data-traco; o CSS do PortalBR anima o
// stroke-dashoffset quando .jaguar-planta--visivel entra. Reduced
// motion cai para o estado final via a mesma folha.

interface Traco {
  el: 'rect' | 'line' | 'polyline';
  attrs: Record<string, string | number>;
}

const moldura: Traco = { el: 'rect', attrs: { x: 6, y: 6, width: 268, height: 138 } };

// viewBox 0 0 280 150. Cada destino sugere o próprio layout futuro.
const PLANTAS: Record<string, Traco[]> = {
  'terminal-brasil': [
    moldura,
    { el: 'line', attrs: { x1: 6, y1: 30, x2: 274, y2: 30 } },
    { el: 'line', attrs: { x1: 76, y1: 30, x2: 76, y2: 144 } },
    { el: 'rect', attrs: { x: 88, y: 42, width: 82, height: 42 } },
    { el: 'rect', attrs: { x: 180, y: 42, width: 82, height: 42 } },
    { el: 'rect', attrs: { x: 88, y: 94, width: 174, height: 38 } },
    { el: 'polyline', attrs: { points: '96,122 118,108 140,116 166,100 196,110 224,96 252,104' } },
  ],
  'energy-brief': [
    moldura,
    { el: 'line', attrs: { x1: 6, y1: 34, x2: 274, y2: 34 } },
    { el: 'rect', attrs: { x: 24, y: 48, width: 152, height: 12 } },
    { el: 'line', attrs: { x1: 24, y1: 76, x2: 176, y2: 76 } },
    { el: 'line', attrs: { x1: 24, y1: 90, x2: 176, y2: 90 } },
    { el: 'line', attrs: { x1: 24, y1: 104, x2: 176, y2: 104 } },
    { el: 'line', attrs: { x1: 24, y1: 118, x2: 148, y2: 118 } },
    { el: 'rect', attrs: { x: 192, y: 48, width: 64, height: 84 } },
  ],
  'conta-de-luz-express': [
    moldura,
    { el: 'rect', attrs: { x: 24, y: 20, width: 108, height: 20 } },
    { el: 'line', attrs: { x1: 24, y1: 58, x2: 256, y2: 58 } },
    { el: 'line', attrs: { x1: 24, y1: 74, x2: 256, y2: 74 } },
    { el: 'line', attrs: { x1: 24, y1: 90, x2: 256, y2: 90 } },
    { el: 'line', attrs: { x1: 24, y1: 106, x2: 256, y2: 106 } },
    { el: 'rect', attrs: { x: 168, y: 118, width: 88, height: 18 } },
  ],
  'diagnostico-energetico': [
    moldura,
    { el: 'rect', attrs: { x: 20, y: 20, width: 72, height: 44 } },
    { el: 'rect', attrs: { x: 104, y: 20, width: 72, height: 44 } },
    { el: 'rect', attrs: { x: 188, y: 20, width: 72, height: 44 } },
    { el: 'line', attrs: { x1: 20, y1: 84, x2: 216, y2: 84 } },
    { el: 'line', attrs: { x1: 20, y1: 100, x2: 184, y2: 100 } },
    { el: 'line', attrs: { x1: 20, y1: 116, x2: 244, y2: 116 } },
    { el: 'line', attrs: { x1: 20, y1: 132, x2: 152, y2: 132 } },
  ],
};

const PLANTA_GENERICA: Traco[] = [
  moldura,
  { el: 'line', attrs: { x1: 6, y1: 32, x2: 274, y2: 32 } },
  { el: 'rect', attrs: { x: 24, y: 48, width: 232, height: 36 } },
  { el: 'rect', attrs: { x: 24, y: 96, width: 108, height: 36 } },
  { el: 'rect', attrs: { x: 148, y: 96, width: 108, height: 36 } },
];

export interface PlantaBaixaProps {
  destinoId: string;
  /** Dispara o desenho do traço. */
  visivel: boolean;
  /** Altura do bloco em px; a largura acompanha o container. */
  altura?: number;
}

export function PlantaBaixa({ destinoId, visivel, altura = 150 }: PlantaBaixaProps) {
  const tracos = PLANTAS[destinoId] ?? PLANTA_GENERICA;
  return (
    <svg
      viewBox="0 0 280 150"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      className={`jaguar-planta${visivel ? ' jaguar-planta--visivel' : ''}`}
      style={{ width: '100%', height: `${altura}px`, display: 'block' }}
    >
      {tracos.map((t, i) => {
        const Tag = t.el;
        return (
          <Tag
            key={i}
            {...t.attrs}
            pathLength={1}
            data-traco
            fill="none"
            stroke={J.acenteOcre}
            strokeWidth={1}
            style={{ animationDelay: `${i * 90}ms` }}
          />
        );
      })}
    </svg>
  );
}

// ─── Card ────────────────────────────────────────────────────────────

export interface DestinoCardProps {
  destino: DestinoBR;
  /** Zoom "em breve" — mesmo comportamento do clique de região no hero. */
  onZoom?: (destino: DestinoBR) => void;
}

export function DestinoCard({ destino, onZoom }: DestinoCardProps) {
  const [sobre, setSobre] = useState(false);
  const navigate = useNavigate();

  // A planta baixa desenha AO ENTRAR EM VIEWPORT (spec §3), não no
  // mount — quem chega rolando do hero vê o traço acontecer. Uma vez
  // visto, fica desenhado.
  const quadroRef = useRef<HTMLElement | null>(null);
  const [visto, setVisto] = useState(false);
  useEffect(() => {
    const el = quadroRef.current;
    if (!el || visto) return;
    const io = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisto(true);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visto]);

  const disponivel = destino.status === 'disponivel' && destino.rota !== null;

  const quadro: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    background: J.papelRaised,
    border: `1px solid ${sobre ? J.bordaStrong : J.bordaDefault}`,
    borderRadius: 0,
    padding: 0,
    textAlign: 'left',
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'border-color 140ms ease',
  };

  const corpo = (
    <>
      {/* Prévia — a diferença entre os dois estados mora aqui. */}
      <div
        style={{
          height: '150px',
          borderBottom: `1px solid ${J.bordaDefault}`,
          overflow: 'hidden',
          background: disponivel ? ALEXANDRIA_PAPEL : 'transparent',
        }}
      >
        {disponivel ? <PreviaAlexandria /> : <PlantaBaixa destinoId={destino.id} visivel={visto} />}
      </div>

      <div
        style={{
          padding: '16px 18px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          flex: 1,
        }}
      >
        <h3 style={{ ...JT.h3, margin: 0, color: J.tintaPrimaria }}>{destino.titulo}</h3>
        <p style={{ ...JT.corpo, margin: 0, color: J.tintaSecundaria }}>{destino.descricao}</p>

        <div
          style={{
            marginTop: 'auto',
            paddingTop: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          {disponivel ? (
            <>
              <span style={{ ...JT.rotulo, color: J.tintaPrimaria }}>Acessar</span>
              <span
                aria-hidden="true"
                style={{
                  fontSize: '13px',
                  color: J.acenteOcre,
                  transform: sobre ? 'translateX(3px)' : 'none',
                  transition: 'transform 140ms ease',
                }}
              >
                →
              </span>
            </>
          ) : (
            // Badge com acenteOcreWash — o uso que a folha de tokens
            // prescreve para o wash. Ocre puro como TEXTO de 10px fica
            // em ~3:1 sobre os papéis e falha AA; a tinta cheia sobre o
            // wash passa com folga e o ocre segue presente no fio.
            <span
              style={{
                ...JT.rotulo,
                color: J.tintaPrimaria,
                background: J.acenteOcreWash,
                border: `1px solid ${J.bordaAcento}`,
                borderRadius: 0,
                padding: '3px 8px',
              }}
            >
              Em breve
            </span>
          )}
        </div>
      </div>
    </>
  );

  const eventos = {
    onMouseEnter: () => setSobre(true),
    onMouseLeave: () => setSobre(false),
    onFocus: () => setSobre(true),
    onBlur: () => setSobre(false),
  };

  if (disponivel) {
    const rota = destino.rota as string;
    return (
      <Link
        to={rota}
        ref={(el) => {
          quadroRef.current = el;
        }}
        {...eventos}
        onClick={(e) => {
          // Clique modificado (Ctrl/Cmd/Shift/Alt, botão do meio) fica
          // com o browser — nova aba/janela. Só o clique simples entra
          // na view transition: papel Jaguar cruza em fade para o papel
          // Alexandria, a razão de o portal ser claro.
          if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          comTransicao(() => navigate(rota));
        }}
        style={quadro}
      >
        {corpo}
      </Link>
    );
  }

  // Card em breve: <article> com botão esticado por cima, NÃO <button>
  // envolvendo o corpo — botão só aceita phrasing content, e o <h3> lá
  // dentro seria achatado da árvore de acessibilidade (navegação por
  // cabeçalho de leitor de tela perderia 4 dos 5 destinos).
  return (
    <article
      ref={(el) => {
        quadroRef.current = el;
      }}
      onMouseEnter={eventos.onMouseEnter}
      onMouseLeave={eventos.onMouseLeave}
      style={{ ...quadro, position: 'relative' }}
    >
      {corpo}
      <button
        type="button"
        aria-label={`${destino.titulo} — em breve; ver a planta do destino`}
        onFocus={eventos.onFocus}
        onBlur={eventos.onBlur}
        onClick={() => onZoom?.(destino)}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'transparent',
          border: 'none',
          borderRadius: 0,
          padding: 0,
          cursor: 'pointer',
          outlineColor: J.acenteOcre,
        }}
      />
    </article>
  );
}

/** Prévia real da Alexandria — cores do sistema dela (literais da spec
 *  §3) e conteúdo genuíno do hub vivo: os itens de nav do shell, o
 *  rótulo e o título da home, e a linha de acervo. Nada ilustrativo. */
function PreviaAlexandria(): ReactNode {
  const mono9: CSSProperties = {
    fontFamily: JF.mono,
    fontSize: '8px',
    letterSpacing: '0.20em',
    textTransform: 'uppercase',
  };
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          background: ALEXANDRIA_TINTA,
          padding: '7px 14px',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '10px',
        }}
      >
        <span style={{ ...mono9, fontSize: '9px', color: ALEXANDRIA_PAPEL }}>Alexandria</span>
        <span
          style={{
            ...mono9,
            color: ALEXANDRIA_PAPEL,
            opacity: 0.72,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            minWidth: 0,
          }}
        >
          Biblioteca · Trilhas · Atlas · Glossário
        </span>
      </div>
      <div
        style={{
          flex: 1,
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          gap: '5px',
        }}
      >
        <span style={{ ...mono9, color: ALEXANDRIA_TINTA, opacity: 0.6 }}>Fundações</span>
        <span style={{ fontSize: '15px', lineHeight: 1.25, color: ALEXANDRIA_TINTA }}>
          Atlas vivo da energia do Brasil
        </span>
        <span style={{ ...mono9, letterSpacing: '0.12em', color: ALEXANDRIA_TINTA, opacity: 0.55 }}>
          17 blocos · 3 trilhas · 106 gravuras
        </span>
      </div>
    </div>
  );
}

export default DestinoCard;

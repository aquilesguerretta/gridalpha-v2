// PortalBR — ARCHITECT, Portal BR Wave 2 · Jaguar.
//
// WAVE 5 · FASE 1 — inventário de arquivo (confirmado por leitura, não
// por suposição):
//   hero (H1/subtítulo/prompt/botão pular) — PortalHero.tsx
//   procedência do PLD — PortalHero.tsx (marca no mapa + barra)
//   grade de 3 colunas de Independência — FaixaIndependencia.tsx
//   DESTINOS — seção e grade AQUI (abaixo); célula em DestinoCard.tsx
//   RODAPÉ — inline AQUI (abaixo); não é componente separado
//   MAPA — SVG e palco em PortalHero.tsx; geometria em
//     src/lib/geo/brasil-outline.ts (dado, fora desta wave)
//   AcessoConta.tsx — terceiro bloco do header; entra na reskin para o
//     cabeçalho não ficar meio-tema no noturno
// jaguar-tokens.ts NÃO pode ser removido: /conta (fora da posse)
// também importa dele. O Portal apenas se desliga.
//
// Header fixo → hero (mapa que se constrói no scroll) → índice de
// destinos → faixa de independência (afirmativa, Wave 4) → rodapé real.
//
// A redação de negação da faixa foi REJEITADA em revisão de design; a
// versão afirmativa atual é copy do implementador sob a autorização
// aberta da Wave 4, sujeita a veto (commit isolado). O rodapé real
// saiu do esboço original na Wave 3 e ganhou colunas na Wave 4.
//
// SCROLL — segue o idioma do AlexandriaShell: quadro de 100vh, o <main>
// rola por dentro. O hero lê o scroll desse <main> via ref.
//
// TRANSIÇÃO DE CLIQUE — View Transitions API nativa (suporte
// cross-browser amplo desde out/2025 para transição same-document, que
// é o caso: SPA com React Router). Sem GSAP. Sem suporte, o DOM só
// atualiza sem animação — degradação limpa.
//
// TERMINAL BRASIL NÃO EXISTE AINDA — clique em região do hero (e nos
// cards em breve) pousa num estado leve de "em breve" na própria
// página, reaproveitando a linguagem de planta baixa do índice. Não é
// link morto nem rota nova (main.tsx não é posse desta wave). Quando
// o Terminal Brasil abrir, este overlay vira navegação real para
// /terminal-brasil?regiao=<sigla>. INFERÊNCIA do implementador,
// marcada como tal no fechamento da wave.

import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { flushSync } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';

// Tokens NIVAR — só arquivos de VARIÁVEL (:root + escopos de modo).
// base.css fica de fora DE PROPÓSITO: ele restila elemento global
// (body, h1-h6, a, barra de rolagem) e vazaria para as outras
// superfícies do app. O que o base.css daria (foco, seleção, link)
// entra escopado em [data-nv-page] no <style> abaixo.
import '../../design/nivar/fonts.css';
import '../../design/nivar/colors.css';
import '../../design/nivar/typography.css';
import '../../design/nivar/space.css';
import '../../design/nivar/motion.css';

import { DESTINOS_BR, type DestinoBR } from '../../lib/data/br-destinos';
import type { SubmercadoPath } from '../../lib/geo/brasil-outline';
import { DestinoCard, PlantaBaixa } from '../../components/br/DestinoCard';
import { FaixaIndependencia } from '../../components/br/FaixaIndependencia';
import { PortalHero } from '../../components/br/PortalHero';
import { SeletorMercado } from '../../components/br/SeletorMercado';
import { AcessoConta } from '../../components/br/AcessoConta';

// Medida máxima de prancha — decisão da Wave 1, mantida: 1200px.
const MEDIDA = '1200px';
const RESPIRO_LATERAL = '32px';

// ─── Papéis tipográficos NIVAR ──────────────────────────────────────
// O idioma do repo é estilo inline; os VALORES moram nos tokens CSS de
// src/design/nivar — aqui só referência var(), nunca literal de escala.
// `proc` espelha o .nv-proc do sistema (components/data/data.css); os
// literais de 10.5px/.06em são do PRÓPRIO componente, copiados, não
// inventados. Cada componente do Portal declara os papéis que usa —
// importar daqui criaria ciclo página→componente→página; a referência
// var() garante que o VALOR nunca diverge.
const NT = {
  /** Etiqueta versalete — Work Sans 500, 11px, +0.10em, caixa alta. */
  etiqueta: {
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    fontSize: 'var(--ts-etiqueta)',
    lineHeight: 'var(--lh-etiqueta)' as CSSProperties['lineHeight'],
    letterSpacing: 'var(--tr-etiqueta)',
    textTransform: 'uppercase',
  } satisfies CSSProperties,
  /** Procedência — mono versalete, tabular (idioma do Provenance). */
  proc: {
    fontFamily: 'var(--font-data)',
    fontWeight: 400,
    fontSize: '10.5px',
    lineHeight: 1.5,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    fontVariantNumeric: 'tabular-nums lining-nums',
  } satisfies CSSProperties,
  /** Corpo — Work Sans 400, 15px. */
  corpo: {
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--fw-corpo)' as CSSProperties['fontWeight'],
    fontSize: 'var(--ts-corpo)',
    lineHeight: 'var(--lh-corpo)' as CSSProperties['lineHeight'],
  } satisfies CSSProperties,
  /** Título de bloco — Zilla Slab 500, 19px. */
  titulo2: {
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--fw-display)' as CSSProperties['fontWeight'],
    fontSize: 'var(--ts-titulo-2)',
    lineHeight: 'var(--lh-titulo-2)' as CSSProperties['lineHeight'],
    letterSpacing: 'var(--tr-titulo-2)',
  } satisfies CSSProperties,
} as const;

/** Estado do overlay "em breve": destino + região opcional (via hero). */
interface ZoomEmBreve {
  titulo: string;
  destinoId: string;
  regiao?: SubmercadoPath;
}

// ─── Wordmark NIVAR — SVG INLINE, nunca <img> ───────────────────────
// Regra do sistema: SVG por <img src> é documento isolado — não recebe
// cor do hospedeiro nem participa do escopo de modo. As DUAS variantes
// moram no DOM e o CSS de modo alterna qual aparece: claro leva o
// gradiente de incandescência (assets/nivar-wordmark.svg, produção);
// noturno leva o traço de papel sólido (nivar-wordmark-papel.svg,
// FOUNDRY NIVAR Wave 2). Geometria copiada VERBATIM dos assets —
// aplicar, nunca recriar; a única adaptação é o sufixo no id do
// gradiente, porque o wordmark aparece duas vezes no documento
// (cabeçalho e rodapé) e id duplicado quebra a referência url(#…).

const WM_PATHS = (
  <>
    <path
      d="M22 112 C22 80 22 50 22 18 C54 40 60 92 108 112 C108 80 108 50 108 18"
      strokeWidth={16}
      data-wm-traco
    />
    <g strokeWidth={13}>
      <path d="M140 32 L140 112" data-wm-traco />
      <path d="M170 32 L200 112 L230 32" data-wm-traco />
      <path d="M254 112 L284 32 L314 112" data-wm-traco />
      <path d="M342 112 L342 32" data-wm-traco />
      <path d="M342 32 C378 32 394 44 386 56 C378 68 362 64 342 64" data-wm-traco />
      <path d="M370 62 C382 80 390 96 398 112" data-wm-traco />
    </g>
  </>
);

function WordmarkNivar({ altura, idSufixo }: { altura: number; idSufixo: string }) {
  const largura = Math.round(altura * (425 / 140));
  return (
    <span
      role="img"
      aria-label="NIVAR"
      style={{ display: 'inline-flex', flexShrink: 0, lineHeight: 0 }}
    >
      <svg
        className="nivar-wm nivar-wm--claro"
        viewBox="0 0 425 140"
        width={largura}
        height={altura}
        aria-hidden="true"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <defs>
          <linearGradient
            id={`incandescente-${idSufixo}`}
            gradientUnits="userSpaceOnUse"
            x1="22"
            y1="0"
            x2="400"
            y2="0"
          >
            <stop offset="0%" stopColor="#7A1F0D" />
            <stop offset="50%" stopColor="#C17D1F" />
            <stop offset="100%" stopColor="#F5C63C" />
          </linearGradient>
        </defs>
        <g
          fill="none"
          stroke={`url(#incandescente-${idSufixo})`}
          strokeLinecap="butt"
          strokeLinejoin="miter"
        >
          {WM_PATHS}
        </g>
      </svg>
      <svg
        className="nivar-wm nivar-wm--noturno"
        viewBox="0 0 425 140"
        width={largura}
        height={altura}
        aria-hidden="true"
        style={{ display: 'none', overflow: 'visible' }}
      >
        <g fill="none" stroke="#F6F2E9" strokeLinecap="butt" strokeLinejoin="miter">
          {WM_PATHS}
        </g>
      </svg>
    </span>
  );
}

/** startViewTransition com checagem de suporte. flushSync dentro do
 *  callback para o snapshot "novo" capturar o DOM já atualizado.
 *  Reduced-motion pula a transição — regra do projeto: estado final. */
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

export function PortalBR() {
  const mainRef = useRef<HTMLElement>(null);
  const painelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Identidade de documento da rota — o app compartilha um index.html
  // só; o título entra e sai com a página.
  useEffect(() => {
    const anterior = document.title;
    document.title = 'NIVAR — Portal Brasil';
    return () => {
      document.title = anterior;
    };
  }, []);
  // Quem tinha o foco quando o overlay abriu — restaurado no fechamento.
  const retornoFocoRef = useRef<HTMLElement | null>(null);
  const [zoom, setZoom] = useState<ZoomEmBreve | null>(null);

  // Modo de exibição — data-mode="noturno" remapeia SÓ os aliases
  // semânticos (colors.css); nenhum valor da escala de incandescência
  // muda. PENDÊNCIA REGISTRADA: o Portal não tem mecanismo de
  // persistência próprio (nenhum store, nenhum uso de storage nesta
  // superfície) — o modo vive em estado de página e volta ao claro na
  // recarga. Persistir é decisão de plataforma, não desta wave.
  const [modo, setModo] = useState<'claro' | 'noturno'>('claro');

  const abrirRegiao = useCallback((regiao: SubmercadoPath) => {
    retornoFocoRef.current = document.activeElement as HTMLElement | null;
    comTransicao(() =>
      setZoom({ titulo: 'Terminal Brasil', destinoId: 'terminal-brasil', regiao }),
    );
  }, []);

  const abrirDestino = useCallback((destino: DestinoBR) => {
    retornoFocoRef.current = document.activeElement as HTMLElement | null;
    comTransicao(() => setZoom({ titulo: destino.titulo, destinoId: destino.id }));
  }, []);

  const fechar = useCallback(() => {
    comTransicao(() => setZoom(null));
  }, []);

  // Gestão de foco do diálogo: entra no painel ao abrir, volta para o
  // elemento de origem ao fechar. Sem isso o foco fica atrás do
  // aria-modal e leitor de tela continua lendo a página coberta.
  useEffect(() => {
    if (zoom) {
      painelRef.current?.focus();
      return;
    }
    if (retornoFocoRef.current) {
      retornoFocoRef.current.focus();
      retornoFocoRef.current = null;
    }
  }, [zoom]);

  useEffect(() => {
    if (!zoom) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        fechar();
        return;
      }
      // Trap de Tab — o foco circula dentro do painel enquanto o
      // diálogo está aberto.
      if (e.key === 'Tab' && painelRef.current) {
        const focaveis = painelRef.current.querySelectorAll<HTMLElement>(
          'button, a[href], [tabindex]:not([tabindex="-1"])',
        );
        if (focaveis.length === 0) return;
        const primeiro = focaveis[0];
        const ultimo = focaveis[focaveis.length - 1];
        const ativo = document.activeElement;
        if (e.shiftKey && (ativo === primeiro || ativo === painelRef.current)) {
          e.preventDefault();
          ultimo.focus();
        } else if (!e.shiftKey && ativo === ultimo) {
          e.preventDefault();
          primeiro.focus();
        }
      }
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [zoom, fechar]);

  return (
    <div
      lang="pt-BR"
      data-nv-page=""
      data-mode={modo === 'noturno' ? 'noturno' : undefined}
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: 'var(--surface-page)',
        color: 'var(--text-body)',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--ts-corpo)',
        lineHeight: 'var(--lh-corpo)',
        borderRadius: 0,
        // O fundo NÃO entra em transition (regra: nunca anima cor de
        // fundo) — na troca de modo ele corta seco; texto e fio correm
        // os 150ms via as transições dos próprios elementos.
      }}
    >
      {/* A folha da página: o que o base.css do NIVAR daria em global
          (foco, seleção, link) entra AQUI, escopado em [data-nv-page],
          para não vazar às outras superfícies do app. O CSS do
          ModeToggle é o do próprio sistema, verbatim
          (components/navigation/navigation.css). As animações de
          view-transition e de planta baixa moram aqui porque
          pseudo-elemento e classe não aceitam estilo inline. */}
      <style>{`
        /* Escopo de página — foco e seleção do sistema. */
        [data-nv-page] :focus-visible {
          outline: 2px solid var(--accent-focus);
          outline-offset: 2px;
        }
        [data-nv-page] ::selection {
          background: var(--advisory);
          color: var(--tinta);
        }

        /* Alternância do wordmark por modo — as duas variantes moram no
           DOM; o data-mode decide qual aparece. */
        [data-mode="noturno"] .nivar-wm--claro { display: none !important; }
        [data-mode="noturno"] .nivar-wm--noturno { display: block !important; }

        /* ModeToggle — CSS do sistema, verbatim. Mono, sem caixa, sem
           ícone; ativo = texto forte + fio no acento da casa. */
        .nv-modo{display:flex;align-items:baseline;gap:8px}
        .nv-modo__op{font-family:var(--font-data);font-weight:400;font-size:11px;line-height:1.2;letter-spacing:.09em;text-transform:uppercase;color:var(--text-faint);background:none;border:0;border-bottom:1px solid transparent;padding:0 0 3px;cursor:pointer;transition:color var(--dur-estado) var(--ease),border-color var(--dur-estado) var(--ease)}
        .nv-modo__op:hover{color:var(--fg-hover)}
        .nv-modo__op--ativo{color:var(--text-strong);font-weight:500;border-bottom-color:var(--accent-house)}
        .nv-modo__sep{font-family:var(--font-data);font-size:11px;color:var(--rule-strong)}

        /* Link de lista (rodapé) — o tratamento de link do sistema:
           cor de link com sublinhado por fio que NUNCA some; no hover o
           texto muda de cor e o fio assume a cor do texto. */
        .nivar-flink {
          font-family: var(--font-body);
          font-weight: 400;
          font-size: var(--ts-corpo-2);
          line-height: var(--lh-corpo-2);
          color: var(--link);
          text-decoration: none;
          background: none;
          border: none;
          border-bottom: var(--fio) solid var(--link-fio);
          border-radius: 0;
          padding: 0;
          cursor: pointer;
          text-align: left;
          align-self: flex-start;
          transition: color var(--dur-hover) var(--ease), border-color var(--dur-hover) var(--ease);
        }
        .nivar-flink:hover, .nivar-flink:focus-visible {
          color: var(--link-hover);
          border-bottom-color: currentColor;
        }

        /* Textura de rede do rodapé — hairline a 5% nos DOIS
           substratos: traço de tinta sobre papel, traço de papel sobre
           tinta. Os hexes são a tinta (#14120F) e o papel (#F6F2E9) da
           escala, URL-encodados UMA vez (%23 — lição do bug da Wave 3,
           verificado por computed style no fechamento). */
        .nivar-textura-rede {
          position: absolute;
          inset: 0;
          opacity: 0.05;
          pointer-events: none;
          background-size: 56px 56px;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56'><path d='M0 0H56M0 0V56' stroke='%2314120F' stroke-width='0.6' fill='none'/><path d='M0 56L56 0' stroke='%2314120F' stroke-width='0.4' fill='none'/></svg>");
        }
        [data-mode="noturno"] .nivar-textura-rede {
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56'><path d='M0 0H56M0 0V56' stroke='%23F6F2E9' stroke-width='0.6' fill='none'/><path d='M0 56L56 0' stroke='%23F6F2E9' stroke-width='0.4' fill='none'/></svg>");
        }

        @keyframes nivar-zoom-in {
          from { opacity: 0; transform: scale(0.82); }
          to   { opacity: 1; transform: none; }
        }
        ::view-transition-new(nivar-painel) {
          animation: nivar-zoom-in 240ms cubic-bezier(0.2, 0, 0, 1) both;
        }
        @keyframes nivar-desenha { to { stroke-dashoffset: 0; } }
        .nivar-planta [data-traco] {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
        }
        .nivar-planta.nivar-planta--visivel [data-traco] {
          animation: nivar-desenha 700ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .nivar-planta [data-traco] {
            animation: none !important;
            stroke-dashoffset: 0 !important;
          }
          ::view-transition-old(root), ::view-transition-new(root),
          ::view-transition-group(nivar-painel),
          ::view-transition-old(nivar-painel),
          ::view-transition-new(nivar-painel) {
            animation: none !important;
          }
        }
      `}</style>

      <header
        style={{
          flexShrink: 0,
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          padding: `0 ${RESPIRO_LATERAL}`,
          borderBottom: 'var(--fio) solid var(--rule)',
          background: 'var(--surface-page)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <WordmarkNivar altura={24} idSufixo="cabecalho" />
          <span
            aria-hidden="true"
            style={{ width: '1px', height: '14px', background: 'var(--rule)' }}
          />
          <span style={{ ...NT.etiqueta, color: 'var(--text-muted)' }}>Brasil</span>
        </div>

        {/* Itens exatos de nav seguem não especificados (spec §4) — só
            o seletor confirmado, a porta de entrada da conta e o
            ModeToggle do sistema (mono, sem caixa, sem ícone). */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          <SeletorMercado ativo="br" />
          <span
            aria-hidden="true"
            style={{ width: '1px', height: '12px', background: 'var(--rule)' }}
          />
          <AcessoConta />
          <span
            aria-hidden="true"
            style={{ width: '1px', height: '12px', background: 'var(--rule)' }}
          />
          <div className="nv-modo" role="group" aria-label="Modo de exibição">
            <button
              type="button"
              className={`nv-modo__op${modo === 'claro' ? ' nv-modo__op--ativo' : ''}`}
              aria-pressed={modo === 'claro'}
              onClick={() => setModo('claro')}
            >
              claro
            </button>
            <span className="nv-modo__sep" aria-hidden="true">
              ·
            </span>
            <button
              type="button"
              className={`nv-modo__op${modo === 'noturno' ? ' nv-modo__op--ativo' : ''}`}
              aria-pressed={modo === 'noturno'}
              onClick={() => setModo('noturno')}
            >
              noturno
            </button>
          </div>
        </div>
      </header>

      {/* tabIndex={0}: o documento está travado em overflow hidden e
          este <main> é o único scroller — sem foco nele, teclado puro
          (setas/PageDown) não rola nada e a sequência do hero fica
          pulada por padrão. */}
      <main
        ref={mainRef}
        tabIndex={0}
        aria-label="Portal Brasil — conteúdo rolável"
        style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}
      >
        <div style={{ maxWidth: MEDIDA, margin: '0 auto', padding: `0 ${RESPIRO_LATERAL}` }}>
          <PortalHero
            titulo="Inteligência independente do setor elétrico brasileiro"
            subtitulo="Cinco destinos para quem precisa entender o mercado de energia do Brasil — dados, formação e análise. Um está aberto hoje; os outros chegam em sequência."
            scrollHost={mainRef}
            onRegiaoClick={abrirRegiao}
          />

          {/* Faixa de fatos — só o que é real hoje, em densidade de
              terminal. Nenhum número inventado. */}
          <section
            aria-label="O portal em números"
            style={{
              borderTop: 'var(--fio) solid var(--rule)',
              borderBottom: 'var(--fio) solid var(--rule)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0 32px',
              padding: '14px 0',
            }}
          >
            {[
              '4 submercados no SIN',
              'Geografia IBGE · malhas v3',
              `${DESTINOS_BR.length} destinos · ${DESTINOS_BR.filter((d) => d.status === 'disponivel').length} aberto hoje`,
              'PLD ilustrativo até o Terminal Brasil',
            ].map((fato, i) => (
              <span
                key={fato}
                style={{
                  ...NT.proc,
                  color: i === 0 ? 'var(--accent-house)' : 'var(--text-muted)',
                  padding: '4px 0',
                }}
              >
                {fato}
              </span>
            ))}
          </section>

          <section
            aria-label="Destinos"
            style={{
              // Teto de espaçamento do sistema: 32px, inclusive entre
              // seções — os 40/64px do Jaguar saem.
              padding: '32px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            {/* Cabeçalho de seção do sistema: número · título · fio ·
                nota à direita, numa linha de baseline. Número em mono,
                dois dígitos, no acento da casa. */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
              <span style={{ ...NT.proc, fontWeight: 500, color: 'var(--accent-house)' }}>01</span>
              <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }}>Destinos</span>
              <span
                aria-hidden="true"
                style={{ flex: 1, borderTop: 'var(--fio) solid var(--rule)', alignSelf: 'center' }}
              />
              <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>
                1 aberto · 4 em construção
              </span>
            </div>

            {/* Cinco cards, mesma moldura e tamanho — spec §3. O peso
                igual é da especificação; a hierarquia mora DENTRO do
                card (prévia real vs. planta baixa), não no grid. */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
              }}
            >
              {DESTINOS_BR.map((d) => (
                <DestinoCard key={d.id} destino={d} onZoom={abrirDestino} />
              ))}
            </div>
          </section>

          {/* Versão afirmativa (Wave 4) — copy do implementador,
              sujeita a veto; ver cabeçalho do componente. */}
          <FaixaIndependencia />
        </div>

        {/* Rodapé real (Wave 3) — do esboço do design original:
            papelSunken, textura sutil de rede, citação de fonte em
            Geist Mono. Desacoplado da FaixaIndependencia, que segue
            TODO aguardando copy revisada. */}
        <footer
          style={{
            position: 'relative',
            borderTop: 'var(--fio) solid var(--rule-strong)',
            background: 'var(--surface-sunken)',
            overflow: 'hidden',
          }}
        >
          {/* Textura de rede — malha hairline a 5%, com variante por
              substrato na folha da página (tinta sobre papel, papel
              sobre tinta). */}
          <span aria-hidden="true" className="nivar-textura-rede" />
          <div
            style={{
              position: 'relative',
              maxWidth: MEDIDA,
              margin: '0 auto',
              padding: `32px ${RESPIRO_LATERAL}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '32px',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                  maxWidth: '320px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <WordmarkNivar altura={17} idSufixo="rodape" />
                  <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }}>Portal Brasil</span>
                </div>
                <span style={{ ...NT.corpo, fontSize: 'var(--ts-corpo-2)', color: 'var(--text-body)' }}>
                  Análise independente do mercado de energia.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }}>Destinos</span>
                {DESTINOS_BR.map((d) =>
                  d.status === 'disponivel' && d.rota ? (
                    <Link
                      key={d.id}
                      className="nivar-flink"
                      to={d.rota}
                      onClick={(e) => {
                        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
                          return;
                        e.preventDefault();
                        comTransicao(() => navigate(d.rota as string));
                      }}
                    >
                      {d.titulo}
                    </Link>
                  ) : (
                    <button
                      key={d.id}
                      type="button"
                      className="nivar-flink"
                      onClick={() => abrirDestino(d)}
                    >
                      {d.titulo} · em breve
                    </button>
                  ),
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }}>Mercados</span>
                {/* Topologia de Shell Wave 2: a linha de Estados Unidos
                    saiu daqui, como saiu do seletor do cabeçalho. O
                    mercado americano continua existindo em `/us`; deixou
                    de ser anunciado. A coluna fica com a única afirmação
                    que hoje é verdadeira. */}
                <span
                  style={{
                    ...NT.corpo,
                    fontSize: 'var(--ts-corpo-2)',
                    color: 'var(--text-body)',
                  }}
                >
                  Brasil — você está aqui
                </span>
              </div>
            </div>

            <div
              style={{
                borderTop: 'var(--fio) solid var(--rule)',
                paddingTop: '18px',
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: '20px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
                <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }}>Fontes</span>
                <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>
                  ONS · ANEEL · CCEE · EPE
                </span>
              </div>
              {/* Provenância do que está renderizado HOJE: a geografia é
                  IBGE; o dado de mercado ainda é ilustrativo — e o
                  trecho ilustrativo leva o idioma do sistema
                  (--ilustrativa-fg/-fio), nunca cor de aviso. */}
              <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>
                Geografia IBGE ·{' '}
                <span
                  style={{
                    color: 'var(--ilustrativa-fg)',
                    fontWeight: 500,
                    borderBottom: 'var(--fio) solid var(--ilustrativa-fio)',
                    paddingBottom: '1px',
                  }}
                >
                  dados de mercado ilustrativos
                </span>{' '}
                · {new Date().getFullYear()}
              </span>
            </div>
          </div>
        </footer>
      </main>

      {/* Overlay "em breve" — destino do clique-zoom enquanto o
          Terminal Brasil (e os demais) não existem. */}
      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${zoom.titulo} — em breve`}
          onClick={fechar}
          style={{
            position: 'fixed',
            inset: 0,
            // Scrim derivado da tinta da escala — o diálogo do sistema
            // esmaece o fundo, nunca sombra.
            background: 'color-mix(in srgb, var(--tinta) 40%, transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px',
            zIndex: 40,
          }}
        >
          <div
            ref={painelRef}
            tabIndex={-1}
            onClick={(e) => e.stopPropagation()}
            style={{
              outline: 'none',
              viewTransitionName: 'nivar-painel',
              width: 'min(560px, 100%)',
              background: 'var(--surface-raised)',
              border: 'var(--fio) solid var(--rule-strong)',
              borderRadius: 0,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Tag do sistema — retângulo de fio, sem preenchimento. */}
                <span
                  style={{
                    ...NT.etiqueta,
                    color: 'var(--text-muted)',
                    border: 'var(--fio) solid var(--tag-fio)',
                    borderRadius: 0,
                    padding: '4px 8px',
                    alignSelf: 'flex-start',
                  }}
                >
                  Em breve
                </span>
                <h2
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 'var(--fw-display)' as CSSProperties['fontWeight'],
                    fontSize: 'var(--ts-titulo)',
                    lineHeight: 'var(--lh-titulo)',
                    letterSpacing: 'var(--tr-titulo)',
                    margin: 0,
                    color: 'var(--text-strong)',
                  }}
                >
                  {zoom.titulo}
                </h2>
              </div>
              <button
                type="button"
                onClick={fechar}
                aria-label="Fechar"
                style={{
                  fontFamily: 'var(--font-data)',
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                  background: 'none',
                  border: 'var(--fio) solid var(--rule)',
                  borderRadius: 0,
                  padding: '4px 10px',
                  cursor: 'pointer',
                  transition: 'color var(--dur-hover) var(--ease), border-color var(--dur-hover) var(--ease)',
                }}
              >
                ×
              </button>
            </div>

            {/* A mesma linguagem de planta baixa do índice — layout
                prometido em traço, não conteúdo fingido. */}
            <PlantaBaixa destinoId={zoom.destinoId} visivel altura={200} />

            {zoom.regiao && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '10px',
                  paddingTop: '14px',
                  borderTop: 'var(--fio) solid var(--rule)',
                }}
              >
                <span style={{ ...NT.etiqueta, color: 'var(--accent-house)' }}>Região</span>
                <span
                  style={{ ...NT.corpo, fontSize: 'var(--ts-corpo-2)', color: 'var(--text-body)' }}
                >
                  {zoom.regiao.nome}
                  <span style={{ fontFamily: 'var(--font-data)', color: 'var(--text-muted)' }}>
                    {' '}
                    · {zoom.regiao.sigla}
                  </span>
                </span>
                <span
                  style={{ ...NT.corpo, fontSize: 'var(--ts-corpo-2)', color: 'var(--text-muted)' }}
                >
                  — abrirá contextualizado por esta região.
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PortalBR;

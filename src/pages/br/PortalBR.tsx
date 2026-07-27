// PortalBR — ARCHITECT, Portal BR Wave 2 · Jaguar.
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

import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';

import { J, JF, JT } from '../../design/jaguar-tokens';
import { DESTINOS_BR, type DestinoBR } from '../../lib/data/br-destinos';
import type { SubmercadoPath } from '../../lib/geo/brasil-outline';
import { DestinoCard, PlantaBaixa } from '../../components/br/DestinoCard';
import { FaixaIndependencia } from '../../components/br/FaixaIndependencia';
import { PortalHero } from '../../components/br/PortalHero';
import { SeletorMercado } from '../../components/br/SeletorMercado';

// Medida máxima de prancha — decisão da Wave 1, mantida: 1200px.
const MEDIDA = '1200px';
const RESPIRO_LATERAL = '32px';

/** Estado do overlay "em breve": destino + região opcional (via hero). */
interface ZoomEmBreve {
  titulo: string;
  destinoId: string;
  regiao?: SubmercadoPath;
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
    document.title = 'GridAlpha — Portal Brasil';
    return () => {
      document.title = anterior;
    };
  }, []);
  // Quem tinha o foco quando o overlay abriu — restaurado no fechamento.
  const retornoFocoRef = useRef<HTMLElement | null>(null);
  const [zoom, setZoom] = useState<ZoomEmBreve | null>(null);

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
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: J.papelBase,
        color: J.tintaPrimaria,
        fontFamily: JF.sans,
        borderRadius: 0,
      }}
    >
      {/* Geist Sans existe em public/fonts mas nenhum @font-face o
          declara — o portal injeta o próprio, como o AlexandriaShell
          injeta as fontes dele. index.html não é posse desta wave.
          As animações de view-transition e de planta baixa moram aqui
          porque pseudo-elementos ::view-transition-* não aceitam
          estilo inline. */}
      <style>{`
        @font-face {
          font-family: 'Geist Sans';
          src: url('/fonts/Geist-Variable.woff2') format('woff2');
          font-weight: 100 900;
          font-style: normal;
          font-display: swap;
        }
        @keyframes jaguar-zoom-in {
          from { opacity: 0; transform: scale(0.82); }
          to   { opacity: 1; transform: none; }
        }
        ::view-transition-new(jaguar-painel) {
          animation: jaguar-zoom-in 240ms cubic-bezier(0.2, 0, 0, 1) both;
        }
        .jaguar-flink {
          font-size: 13px;
          letter-spacing: 0.02em;
          /* tintaPrimaria, não secundaria: sobre papelSunken a tinta a
             60% fica em 4,28:1 — abaixo de AA (achado da revisão). O
             hover fala por sublinhado, não por cor. */
          color: ${J.tintaPrimaria};
          text-decoration: none;
          background: none;
          border: none;
          border-radius: 0;
          padding: 0;
          cursor: pointer;
          text-align: left;
          font-family: inherit;
          outline-color: ${J.acenteOcreEscuro};
        }
        .jaguar-flink:hover, .jaguar-flink:focus-visible {
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        @keyframes jaguar-desenha { to { stroke-dashoffset: 0; } }
        .jaguar-planta [data-traco] {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
        }
        .jaguar-planta.jaguar-planta--visivel [data-traco] {
          animation: jaguar-desenha 700ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .jaguar-planta [data-traco] {
            animation: none !important;
            stroke-dashoffset: 0 !important;
          }
          ::view-transition-old(root), ::view-transition-new(root),
          ::view-transition-group(jaguar-painel),
          ::view-transition-old(jaguar-painel),
          ::view-transition-new(jaguar-painel) {
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
          borderBottom: `1px solid ${J.bordaDefault}`,
          background: J.papelBase,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontSize: '16px',
              fontWeight: 500,
              letterSpacing: '-0.01em',
              color: J.tintaPrimaria,
            }}
          >
            GridAlpha
          </span>
          <span
            aria-hidden="true"
            style={{ width: '1px', height: '14px', background: J.bordaDefault }}
          />
          {/* tintaSecundaria, não ocre: acenteOcre como texto fica em
              ~2,9:1 sobre papelBase — o ocre vive em traço e wash. */}
          <span style={{ ...JT.rotulo, color: J.tintaSecundaria }}>Brasil</span>
        </div>

        {/* Itens exatos de nav seguem não especificados (spec §4) —
            só o seletor confirmado. */}
        <SeletorMercado ativo="br" />
      </header>

      {/* tabIndex={0}: o documento está travado em overflow hidden e
          este <main> é o único scroller — sem foco nele, teclado puro
          (setas/PageDown) não rola nada e a sequência do hero fica
          pulada por padrão. */}
      <main
        ref={mainRef}
        tabIndex={0}
        aria-label="Portal Brasil — conteúdo rolável"
        style={{ flex: 1, minHeight: 0, overflowY: 'auto', outlineColor: J.acenteOcreEscuro }}
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
              borderTop: `1px solid ${J.bordaDefault}`,
              borderBottom: `1px solid ${J.bordaDefault}`,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0 40px',
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
                  ...JT.rotulo,
                  color: i === 0 ? J.acenteOcreEscuro : J.tintaSecundaria,
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
              padding: '40px 0 64px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
              <span style={{ ...JT.rotulo, color: J.tintaSecundaria }}>Destinos</span>
              <span style={{ ...JT.rotulo, color: J.acenteOcreEscuro }}>
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
            borderTop: `1px solid ${J.bordaStrong}`,
            background: J.papelSunken,
            overflow: 'hidden',
          }}
        >
          {/* Textura de rede — malha hairline de tinta, teto de 5%. */}
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
                `<svg xmlns='http://www.w3.org/2000/svg' width='56' height='56'><path d='M0 0H56M0 0V56' stroke='#1C140D' stroke-width='0.6' fill='none'/><path d='M0 56L56 0' stroke='#1C140D' stroke-width='0.4' fill='none'/></svg>`,
              )}")`,
              backgroundSize: '56px 56px',
              opacity: 0.05,
              pointerEvents: 'none',
            }}
          />
          <div
            style={{
              position: 'relative',
              maxWidth: MEDIDA,
              margin: '0 auto',
              padding: `36px ${RESPIRO_LATERAL} 40px`,
              display: 'flex',
              flexDirection: 'column',
              gap: '22px',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '40px',
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
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: 500,
                      letterSpacing: '-0.01em',
                      color: J.tintaPrimaria,
                    }}
                  >
                    GridAlpha
                  </span>
                  <span style={{ ...JT.rotulo, color: J.tintaPrimaria }}>Portal Brasil</span>
                </div>
                <span style={{ fontSize: '14px', lineHeight: 1.55, color: J.tintaPrimaria }}>
                  Análise independente do mercado de energia.
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ ...JT.rotulo, color: J.tintaPrimaria }}>Destinos</span>
                {DESTINOS_BR.map((d) =>
                  d.status === 'disponivel' && d.rota ? (
                    <Link
                      key={d.id}
                      className="jaguar-flink"
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
                      className="jaguar-flink"
                      onClick={() => abrirDestino(d)}
                    >
                      {d.titulo} · em breve
                    </button>
                  ),
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <span style={{ ...JT.rotulo, color: J.tintaPrimaria }}>Mercados</span>
                <span style={{ fontSize: '13px', color: J.tintaPrimaria }}>
                  Brasil — você está aqui
                </span>
                <Link className="jaguar-flink" to="/us">
                  Estados Unidos
                </Link>
              </div>
            </div>

            <div
              style={{
                borderTop: `1px solid ${J.bordaDefault}`,
                paddingTop: '18px',
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: '20px',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px', flexWrap: 'wrap' }}>
                <span style={{ ...JT.rotulo, color: J.tintaPrimaria }}>Fontes</span>
                <span style={{ ...JT.rotulo, color: J.tintaPrimaria }}>ONS · ANEEL · CCEE · EPE</span>
              </div>
              {/* Provenância do que está renderizado HOJE: a geografia é
                  IBGE; o dado de mercado ainda é ilustrativo. */}
              <span style={{ fontFamily: JF.mono, fontSize: '13px', color: J.tintaPrimaria }}>
                Geografia IBGE · dados de mercado ilustrativos · {new Date().getFullYear()}
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
            background: 'rgba(28,20,13,0.32)',
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
              viewTransitionName: 'jaguar-painel',
              width: 'min(560px, 100%)',
              background: J.papelOverlay,
              border: `1px solid ${J.bordaStrong}`,
              borderRadius: 0,
              padding: '28px',
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
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <span
                  style={{
                    ...JT.rotulo,
                    // tintaPrimaria: sobre papelOverlay, ocre escuro no
                    // wash fica em 4,43:1 — abaixo de AA (revisão).
                    color: J.tintaPrimaria,
                    background: J.acenteOcreWash,
                    border: `1px solid ${J.bordaAcento}`,
                    borderRadius: 0,
                    padding: '3px 8px',
                    alignSelf: 'flex-start',
                  }}
                >
                  Em breve
                </span>
                <h2 style={{ ...JT.h2, margin: 0, color: J.tintaPrimaria }}>{zoom.titulo}</h2>
              </div>
              <button
                type="button"
                onClick={fechar}
                aria-label="Fechar"
                style={{
                  fontFamily: JF.mono,
                  fontSize: '14px',
                  color: J.tintaSecundaria,
                  background: 'none',
                  border: `1px solid ${J.bordaDefault}`,
                  borderRadius: 0,
                  padding: '4px 10px',
                  cursor: 'pointer',
                }}
              >
                ✕
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
                  borderTop: `1px solid ${J.bordaDefault}`,
                }}
              >
                <span style={{ ...JT.rotulo, color: J.acenteOcreEscuro }}>Região</span>
                <span style={{ fontSize: '14px', color: J.tintaPrimaria }}>
                  {zoom.regiao.nome}
                  <span style={{ fontFamily: JF.mono, color: J.tintaSecundaria }}>
                    {' '}
                    · {zoom.regiao.sigla}
                  </span>
                </span>
                <span style={{ fontSize: '14px', color: J.tintaSecundaria }}>
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

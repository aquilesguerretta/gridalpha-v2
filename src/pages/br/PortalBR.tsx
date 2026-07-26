// PortalBR — ARCHITECT, Portal BR Wave 2 · Jaguar.
//
// Header fixo → hero (mapa que se constrói no scroll) → índice de
// destinos → [faixa de independência: ABERTA] → [rodapé: ABERTO].
//
// As duas seções abertas são decisão de design, não esquecimento: a
// redação de negação da faixa foi REJEITADA e a copy nova não existe;
// o rodapé foi pausado junto. Nenhuma das duas é preenchida por
// adivinhação aqui — spec §4.
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

import { J, JF } from '../../design/jaguar-tokens';
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
 *  callback para o snapshot "novo" capturar o DOM já atualizado. */
function comTransicao(mudanca: () => void) {
  if ('startViewTransition' in document) {
    document.startViewTransition(() => {
      flushSync(mudanca);
    });
  } else {
    mudanca();
  }
}

export function PortalBR() {
  const mainRef = useRef<HTMLElement>(null);
  const [zoom, setZoom] = useState<ZoomEmBreve | null>(null);

  const abrirRegiao = useCallback((regiao: SubmercadoPath) => {
    comTransicao(() =>
      setZoom({ titulo: 'Terminal Brasil', destinoId: 'terminal-brasil', regiao }),
    );
  }, []);

  const abrirDestino = useCallback((destino: DestinoBR) => {
    comTransicao(() => setZoom({ titulo: destino.titulo, destinoId: destino.id }));
  }, []);

  const fechar = useCallback(() => {
    comTransicao(() => setZoom(null));
  }, []);

  useEffect(() => {
    if (!zoom) return;
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') fechar();
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [zoom, fechar]);

  return (
    <div
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
              fontSize: '15px',
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
          <span
            style={{
              fontFamily: JF.mono,
              fontSize: '10px',
              letterSpacing: '0.20em',
              textTransform: 'uppercase',
              color: J.acenteOcre,
            }}
          >
            Brasil
          </span>
        </div>

        {/* Itens exatos de nav seguem não especificados (spec §4) —
            só o seletor confirmado. */}
        <SeletorMercado ativo="br" />
      </header>

      <main ref={mainRef} style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <div style={{ maxWidth: MEDIDA, margin: '0 auto', padding: `0 ${RESPIRO_LATERAL}` }}>
          <PortalHero
            titulo="Inteligência independente do setor elétrico brasileiro"
            subtitulo="Cinco destinos para quem precisa entender o mercado de energia do Brasil — dados, formação e análise. Um está aberto hoje; os outros chegam em sequência."
            scrollHost={mainRef}
            onRegiaoClick={abrirRegiao}
          />

          <section
            aria-label="Destinos"
            style={{
              padding: '40px 0 64px',
              borderTop: `1px solid ${J.bordaDefault}`,
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <span
              style={{
                fontFamily: JF.mono,
                fontSize: '10px',
                letterSpacing: '0.20em',
                textTransform: 'uppercase',
                color: J.tintaMuted,
              }}
            >
              Destinos
            </span>

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

          {/* ABERTO — spec §4. A copy de negação foi rejeitada; a
              afirmativa não existe ainda. O componente rende null. */}
          <FaixaIndependencia />
        </div>

        {/* TODO: aguardando copy revisada — rodapé pausado junto com a
            faixa de independência (spec §4). O esboço de protótipo
            (papelSunken, textura de rede, fontes ONS/ANEEL/CCEE/EPE em
            Geist Mono) volta à mesa com ela. Fio mínimo até lá. */}
        <footer style={{ borderTop: `1px solid ${J.bordaDefault}` }}>
          <div
            style={{
              maxWidth: MEDIDA,
              margin: '0 auto',
              padding: `24px ${RESPIRO_LATERAL}`,
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: '20px',
            }}
          >
            <span style={{ fontSize: '12px', color: J.tintaSecundaria }}>GridAlpha</span>
            <span
              style={{
                fontFamily: JF.mono,
                fontSize: '10px',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: J.tintaMuted,
              }}
            >
              {new Date().getFullYear()}
            </span>
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
            onClick={(e) => e.stopPropagation()}
            style={{
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
                    fontFamily: JF.mono,
                    fontSize: '10px',
                    letterSpacing: '0.20em',
                    textTransform: 'uppercase',
                    color: J.acenteOcre,
                  }}
                >
                  Em breve
                </span>
                <h2
                  style={{
                    margin: 0,
                    fontSize: '22px',
                    fontWeight: 500,
                    letterSpacing: '-0.01em',
                    color: J.tintaPrimaria,
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
                <span
                  style={{
                    fontFamily: JF.mono,
                    fontSize: '10px',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    color: J.tintaMuted,
                  }}
                >
                  Região
                </span>
                <span style={{ fontSize: '13px', color: J.tintaPrimaria }}>
                  {zoom.regiao.nome}
                  <span style={{ fontFamily: JF.mono, color: J.tintaSecundaria }}>
                    {' '}
                    · {zoom.regiao.sigla}
                  </span>
                </span>
                <span style={{ fontSize: '12px', color: J.tintaSecundaria }}>
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

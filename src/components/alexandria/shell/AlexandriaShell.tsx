// AlexandriaShell — composição invariante do produto.
//
//   header navy full-bleed
//   ├─ [rail esquerdo creme, opcional, 232px]
//   ├─ canvas creme (textura de fibra a 4%)
//   └─ rail direito navy, 300px
//   rodapé navy com faixa de blueprint
//
// Raio zero em tudo. Sem box-shadow — profundidade vem de fio de 1px.
// Sem Tailwind em superfície nenhuma da Alexandria.

import { useEffect, type ReactNode } from 'react';
import { A, AS, AR, AE, ATEXTURA, AFONT_HREF } from '../../../design/alexandria-tokens';
import { AlexandriaHeader, type AlexandriaNavItem } from './AlexandriaHeader';
import { RailLeft } from './RailLeft';
import { RailRight, type RailRightSlots } from './RailRight';
import { AlexandriaFooter } from './AlexandriaFooter';

export interface AlexandriaShellProps {
  children: ReactNode;              // canvas central creme
  showLeftRail?: boolean;           // default false
  leftRailContent?: ReactNode;
  rightRailSlots?: RailRightSlots;
  navItens?: AlexandriaNavItem[];
  navAtivo?: string;
  onNavegar?: (id: string) => void;
}

// Cinzel e Lora não são carregadas pelo index.html do projeto (que só
// traz Instrument Serif + Geist para o terminal). index.html não é
// território desta wave, então o shell injeta o próprio <link> uma
// única vez. Playfair Display fica de fora de propósito — é o defeito
// conhecido do handoff, com 36 declarações lá.
const FONT_LINK_ID = 'alx-fontes';

function useFontesAlexandria() {
  useEffect(() => {
    if (document.getElementById(FONT_LINK_ID)) return;
    const link = document.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    link.href = AFONT_HREF;
    document.head.appendChild(link);
    // Sem cleanup: outras telas da Alexandria reaproveitam o mesmo link,
    // e remover no unmount causaria flash de fallback ao navegar.
  }, []);
}

export function AlexandriaShell({
  children,
  showLeftRail = false,
  leftRailContent,
  rightRailSlots,
  navItens,
  navAtivo,
  onNavegar,
}: AlexandriaShellProps) {
  useFontesAlexandria();

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: A.cremePapel,
        color: A.tintaSobreCreme,
        borderRadius: AR.none,
        overflow: 'hidden',
      }}
    >
      <AlexandriaHeader
        itens={navItens}
        itemAtivo={navAtivo}
        onNavegar={onNavegar}
      />

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {showLeftRail && <RailLeft>{leftRailContent}</RailLeft>}

        {/* Canvas central creme. A fibra fica numa camada própria para
            que a opacidade de 4% não afete o conteúdo. */}
        <main
          style={{
            position: 'relative',
            flex: 1,
            minWidth: 0,
            background: A.cremePapel,
            overflowY: 'auto',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: ATEXTURA.fibraUrl,
              backgroundSize: ATEXTURA.fibraTile,
              opacity: ATEXTURA.fibraOpacidade,
              pointerEvents: 'none',
            }}
          />
          {/* Medida máxima da prancha. Sem ela, em 3440px os blocos de
              conteúdo esticam para ~3000px e a tela vira landing page de
              SaaS — o modo de falha que o brief nomeia. O handoff não
              cobre ultrawide: as maquetes são frames fixos de 1440px,
              onde o canvas mede ~908px depois dos dois rails. 1120px
              mantém a proporção de prancha e centraliza como página de
              monografia. */}
          <div
            style={{
              position: 'relative',
              maxWidth: '1120px',
              margin: '0 auto',
              padding: `${AS.xxl} ${AS.xxl}`,
            }}
          >
            {children}
          </div>
        </main>

        <RailRight slots={rightRailSlots} />
      </div>

      <AlexandriaFooter />

      {/* prefers-reduced-motion cai para o ESTADO FINAL, nunca para
          vazio: dashoffset 0 = traço inteiro desenhado. Um leitor que
          desliga animação vê o atlas pronto, não uma página em branco. */}
      <style>{`
        @keyframes alx-draw { from { stroke-dashoffset: 1 } to { stroke-dashoffset: 0 } }
        .alx-draw {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: alx-draw ${AE.desenhoCurto} ${AE.easing} forwards;
        }
        .alx-draw-long { animation-duration: ${AE.desenhoLongo}; }
        @media (prefers-reduced-motion: reduce) {
          .alx-draw, .alx-draw-long {
            animation: none !important;
            stroke-dashoffset: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default AlexandriaShell;

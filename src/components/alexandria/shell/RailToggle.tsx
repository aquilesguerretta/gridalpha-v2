// RailToggle — o botão flutuante que abre e fecha o rail direito.
//
// Bússola, não selo de progresso: `icon-compass-simple-on-cream.png` da
// biblioteca de ícones — glifo de tinta navy com brilho suave, pensado
// pra campo claro. Verificado por decodificação de pixel antes de usar:
// 1024×1024, RGBA de verdade (canto = alpha 0, centro = alpha ~248), não
// o cinza que a prévia de arquivo mostra por padrão.
//
// O botão carrega o PRÓPRIO disco creme — não herda o campo de trás. Sem
// isso, a bússola (calibrada só pra campo claro; não existe variante
// "on-navy" no acervo) ficaria ilegível quando o painel abre e o disco
// passa a flutuar sobre o navy do drawer em vez do creme do canvas.
// Círculo pleno é a única exceção sancionada ao raio zero do sistema.
//
// A agulha gira 90° ao abrir — a mesma animação que revela o painel,
// não uma segunda animação por cima dela.
//
// PADDING INTERNO DO PNG, MEDIDO — o arquivo carrega o glifo real
// ocupando só ~62% do canvas de 1024×1024 (bounding box de alpha > 10
// varrida pixel a pixel: 636×648 dentro de 1024×1024). Renderizar o
// `<img>` do tamanho do botão deixa uma coroa de vazio transparente em
// volta da bússola — era exatamente o "está muito pequeno" do retorno.
// A correção não é aumentar o botão: é renderizar o `<img>` MAIOR que o
// próprio botão e cortar o excesso em círculo (`overflow: hidden` +
// `border-radius: 50%` no container) — o glifo passa a preencher o
// disco de verdade, e o botão continua pequeno.

import { A, AE } from '@/design/alexandria-tokens';

const ICONE = '/alexandria/icones/icon-compass-simple-on-cream.png';

// Pequeno, para não colidir com o painel (ver RailRight.tsx) — o
// retorno pediu "a bola tem que ficar pequena não overlap".
const DIAMETRO = 40;

// Maior que DIAMETRO de propósito. 62% de preenchimento no arquivo
// original significa que, pra o glifo ocupar ~78% do disco de 40px
// (≈31px visíveis), o <img> precisa renderizar a ~50px e estourar a
// caixa — o overflow correspondente (10px) é cortado pelo círculo.
const ICONE_TAMANHO = 50;

export interface RailToggleProps {
  expanded: boolean;
  onClick: () => void;
}

export function RailToggle({ expanded, onClick }: RailToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-label={expanded ? 'Fechar painel de progresso' : 'Abrir painel de progresso'}
      className="alx-rail-toggle"
      style={{
        width: DIAMETRO,
        height: DIAMETRO,
        flex: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: A.cremePapel,
        border: `1px solid ${A.fioSobreCreme}`,
        borderRadius: '50%',
        // Corta o excesso do <img> (que renderiza maior que o botão de
        // propósito) numa moldura perfeitamente circular.
        overflow: 'hidden',
        padding: 0,
        cursor: 'pointer',
      }}
    >
      <img
        src={ICONE}
        alt=""
        aria-hidden="true"
        width={ICONE_TAMANHO}
        height={ICONE_TAMANHO}
        className="alx-rail-toggle-agulha"
        style={{
          display: 'block',
          width: ICONE_TAMANHO,
          height: ICONE_TAMANHO,
          objectFit: 'contain',
          transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
        }}
      />

      <style>{`
        .alx-rail-toggle {
          transition: border-color ${AE.hover} ${AE.easing};
        }
        .alx-rail-toggle:hover,
        .alx-rail-toggle:focus-visible {
          border-color: ${A.terracota};
        }
        .alx-rail-toggle:focus-visible {
          outline: 1px solid ${A.terracota};
          outline-offset: 3px;
        }
        .alx-rail-toggle-agulha {
          transition: transform ${AE.hover} ${AE.easing};
        }
        @media (prefers-reduced-motion: reduce) {
          .alx-rail-toggle, .alx-rail-toggle-agulha { transition: none !important; }
        }
      `}</style>
    </button>
  );
}

export default RailToggle;

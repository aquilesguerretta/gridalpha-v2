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
// WAVE 6 · FASE 1 — pontos de inserção confirmados:
//   tese — entre H1 e subtítulo, nos DOIS layouts do PortalHero
//   pular apresentação — sai por completo (decisão do Aquiles; o
//     prompt "Role — o mapa se constrói" fica)
//   MethodDisclosure — ancorado na procedência do PLD (barraPld do
//     PortalHero), componente do sistema, nunca modal
//   conflito de interesse — seção nova AQUI, imediatamente antes de
//     <FaixaIndependencia/>, reusando o padrão de grade dela; a
//     numeração de seção desloca (Conflito=02, Independência=03)
//
// WAVE 8 · FASE 1 — caminhos e fonte de dado confirmados:
//   DESTINOS é INLINE aqui (seção + grid); só a célula é componente
//     (DestinoCard.tsx). A faixa de família substitui a seção inteira.
//   PADRÃO DE SUB-ROTA — modelo é src/pages/alexandria/AlexandriaRouter
//     .tsx: main.tsx casa `/alexandria/*`, o componente delega a um
//     router com <Route index> + paths RELATIVOS + <Route path="*">.
//     Replicado como `/br/*` → PortalBRRouter, com `familia/:familiaId`
//     no lugar de `trilha/:trilhaId`. Convenção herdada, não inventada.
//   MAPA FAMÍLIA→PRODUTO NÃO EXISTIA — br-destinos.ts é lista plana de
//     cinco produtos sem atributo de família, e o PRODUCT_CATALOG do
//     backend é a mesma lista de ids (é o que UMA conta ativa, não o
//     mapa público). Autorado nesta wave em src/lib/data/br-familias.ts.
//   "China & Hardware" não existe no sistema: "China" só aparece como
//     MERCADO GEOGRÁFICO no subtree americano. Nada a propagar.
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
// Números REAIS do produto aberto — derivados do catálogo da
// Alexandria (leitura, nunca modificação): se o currículo crescer, a
// landing acompanha sozinha. Nenhum número digitado.
import { ALEXANDRIA_TRILHAS } from '../../lib/data/alexandria-trilhas';
import { ALEXANDRIA_BLOCKS } from '../../lib/data/alexandria-blocks';
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
  /** Título de seção — Zilla Slab 500, 32px. */
  display3: {
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--fw-display)' as CSSProperties['fontWeight'],
    fontSize: 'var(--ts-display-3)',
    lineHeight: 'var(--lh-display-3)' as CSSProperties['lineHeight'],
    letterSpacing: 'var(--tr-display-3)',
  } satisfies CSSProperties,
} as const;

// ─── Conflito de interesse (Wave 6) ─────────────────────────────────
// Copy do war room, verbatim. O conflito é descrito por ESTRUTURA —
// nenhum nome de empresa, em coluna nenhuma, nunca.
interface ColunaConflito {
  id: string;
  titulo: string;
  detalhe: string;
}

const CONFLITO: ColunaConflito[] = [
  {
    id: 'recomendacao-nasce-da-venda',
    titulo: 'A recomendação nasce da venda',
    detalhe:
      'A maior parte do mercado é traduzida por quem também vende energia ou intermedia contrato. A recomendação e a receita saem do mesmo lugar.',
  },
  {
    id: 'contrato-remunera-o-parecer',
    titulo: 'O contrato remunera o parecer',
    detalhe:
      'Consultoria paga por comissão sobre contrato tem interesse direto no fechamento — o incentivo aponta para o resultado, não para a precisão da leitura.',
  },
  {
    id: 'quem-paga-nao-decide',
    titulo: 'Quem paga a conta não decide',
    detalhe: 'O consumidor livre paga a conta de uma decisão que não tomou.',
  },
];

// ─── O mercado agora (revisão pós-Wave 6) — AMOSTRA ILUSTRATIVA ─────
// Os mesmos valores-base mock que o hero usa (PLD_REGIONAL_MOCK do
// PortalHero), com séries DETERMINÍSTICAS derivadas por composição de
// senos — nenhum feed de PLD existe no front. O rótulo na tela diz
// "amostra ilustrativa" no idioma do sistema, e o MethodDisclosure do
// hero declara o método. Sem Math.random e sem Date: a amostra é
// estável entre renders e recargas, citável e reencontrável.
interface SubmercadoAmostra {
  id: string;
  sigla: string;
  nome: string;
  base: number;
  seed: number;
}

const SUBMERCADOS_AMOSTRA: SubmercadoAmostra[] = [
  { id: 'sudesteCentroOeste', sigla: 'SE/CO', nome: 'Sudeste/Centro-Oeste', base: 138.72, seed: 1 },
  { id: 'sul', sigla: 'S', nome: 'Sul', base: 141.1, seed: 2 },
  { id: 'nordeste', sigla: 'NE', nome: 'Nordeste', base: 129.8, seed: 3 },
  { id: 'norte', sigla: 'N', nome: 'Norte', base: 132.45, seed: 4 },
];

interface PeriodoAmostra {
  id: string;
  rotulo: string;
  pontos: number;
  inicio: string;
}

const PERIODOS_AMOSTRA: PeriodoAmostra[] = [
  { id: '24h', rotulo: '24 H', pontos: 24, inicio: 'há 24 horas' },
  { id: '7d', rotulo: '7 D', pontos: 56, inicio: 'há 7 dias' },
  { id: '30d', rotulo: '30 D', pontos: 60, inicio: 'há 30 dias' },
];

function serieIlustrativa(base: number, seed: number, pontos: number): number[] {
  return Array.from({ length: pontos }, (_, i) => {
    const oscila =
      Math.sin(i * 0.55 + seed * 1.7) * 0.045 +
      Math.sin(i * 0.19 + seed) * 0.05 +
      Math.cos(i * 0.08 + seed * 0.6) * 0.025;
    return base * (1 + oscila);
  });
}

const formatoBRL = (v: number) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** O N da casa — a mesma geometria do wordmark, para o loader da
 *  prévia do terminal (peça Colapso/boot do especimen). */
const N_CASA_D = 'M22 112 C22 80 22 50 22 18 C54 40 60 92 108 112 C108 80 108 50 108 18';

/** Entrou na tela uma vez (IntersectionObserver, dispara uma vez e
 *  desconecta — mesmo padrão do DestinoCard). */
function useEntrouNaTela<T extends HTMLElement>(limiar = 0.25) {
  const ref = useRef<T | null>(null);
  const [visto, setVisto] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || visto) return;
    const io = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) {
          setVisto(true);
          io.disconnect();
        }
      },
      { threshold: limiar },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visto, limiar]);
  return { ref, visto };
}

/** Contador que sobe com smoothstep quando entra na tela — a peça
 *  bScore do especimen (1400ms), em rAF. Reduced-motion nasce pronto. */
function ContadorVivo({ valor, reduzido }: { valor: number; reduzido: boolean }) {
  const { ref, visto } = useEntrouNaTela<HTMLSpanElement>(0.4);
  const [mostrado, setMostrado] = useState(reduzido ? valor : 0);
  useEffect(() => {
    if (!visto || reduzido) {
      if (reduzido) setMostrado(valor);
      return;
    }
    const DUR = 1400;
    let raf = 0;
    let inicio: number | null = null;
    const passo = (ts: number) => {
      if (inicio === null) inicio = ts;
      const p = Math.min(1, (ts - inicio) / DUR);
      const suave = p * p * (3 - 2 * p);
      setMostrado(Math.round(valor * suave));
      if (p < 1) raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [visto, valor, reduzido]);
  return (
    <span
      ref={ref}
      data-numeric
      style={{
        fontFamily: 'var(--font-data)',
        fontWeight: 'var(--fw-dado-forte)' as CSSProperties['fontWeight'],
        fontSize: 'var(--ts-dado-1)',
        lineHeight: 'var(--lh-dado-1)' as CSSProperties['lineHeight'],
        letterSpacing: 'var(--tr-dado-1)',
        fontVariantNumeric: 'tabular-nums',
        color: 'var(--accent-house)',
      }}
    >
      {mostrado.toLocaleString('pt-BR')}
    </span>
  );
}

/** Geometria da série no viewBox 0 0 720 210 — eixo à esquerda e
 *  embaixo, sem grade decorativa (regra do TimeSeriesChart). */
function geometriaSerie(serie: number[]) {
  const X0 = 52;
  const X1 = 708;
  const Y0 = 18;
  const Y1 = 166;
  const vMin = Math.min(...serie);
  const vMax = Math.max(...serie);
  const px = (i: number) => X0 + (i / (serie.length - 1)) * (X1 - X0);
  const py = (v: number) => Y1 - ((v - vMin) / (vMax - vMin || 1)) * (Y1 - Y0);
  return {
    d: serie.map((v, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(''),
    vMin,
    vMax,
    px,
    py,
  };
}

// Sinal tipográfico do sistema: '−' (menos verdadeiro), nunca hífen.
const formatoPct = (v: number) =>
  `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} %`;

type Direcao = 'alta' | 'baixa' | 'neutro';
const direcaoDe = (pct: number): Direcao => (pct > 0.15 ? 'alta' : pct < -0.15 ? 'baixa' : 'neutro');
const GLIFO_DIRECAO: Record<Direcao, string> = { alta: '↑', baixa: '↓', neutro: '→' };
const COR_DIRECAO: Record<Direcao, string> = {
  alta: 'var(--data-alta)',
  baixa: 'var(--data-baixa)',
  neutro: 'var(--data-neutro)',
};

// ─── Como a NIVAR lê o mercado — os quatro passos ───────────────────
// Copy do implementador sob a carta branca da revisão, sujeita a veto.
// Sem promessa de economia, sem "você", sem nome de concorrente.
interface PassoLeitura {
  id: string;
  titulo: string;
  detalhe: string;
}

const PASSOS_LEITURA: PassoLeitura[] = [
  {
    id: 'fonte-publica',
    titulo: 'Fonte pública',
    detalhe: 'ONS, CCEE, ANEEL e EPE publicam o dado bruto do setor. É de lá que tudo parte.',
  },
  {
    id: 'ingestao-com-data',
    titulo: 'Ingestão com data',
    detalhe: 'Cada série entra com fonte e recorte temporal declarados — método antes do número.',
  },
  {
    id: 'leitura-independente',
    titulo: 'Leitura independente',
    detalhe: 'A análise separa o que o número diz do que o vendedor quer que ele diga.',
  },
  {
    id: 'entrega-a-quem-le',
    titulo: 'Entrega a quem lê',
    detalhe: 'Relatório, diagnóstico e formação — pagos por quem os recebe, nunca por comissão.',
  },
];

// ─── Perguntas diretas (FAQ) — copy do implementador, sujeita a veto.
// Toda resposta é verificável contra o estado real do produto hoje.
interface PerguntaDireta {
  id: string;
  pergunta: string;
  resposta: string;
}

const PERGUNTAS_DIRETAS: PerguntaDireta[] = [
  {
    id: 'vende-energia',
    pergunta: 'A NIVAR vende energia ou intermedia contrato?',
    resposta:
      'Não. Não vende energia, não intermedia contrato, não recebe comissão. A única receita é o trabalho analítico pago por quem o recebe.',
  },
  {
    id: 'de-onde-vem-o-dado',
    pergunta: 'De onde vem o dado?',
    resposta:
      'De fonte pública — ONS, CCEE, ANEEL, EPE e IBGE — sempre com origem e recorte temporal citados onde o número aparece.',
  },
  {
    id: 'o-que-esta-aberto',
    pergunta: 'O que está aberto hoje?',
    resposta:
      'A Alexandria, biblioteca de formação em energia. Terminal Brasil, Energy Brief, Conta de Luz Express e Diagnóstico Energético estão em construção.',
  },
  {
    id: 'quanto-custa',
    pergunta: 'Quanto custa criar conta?',
    resposta:
      'Nada. Criar conta é gratuito, e ativar um produto aberto também — até o lançamento comercial.',
  },
  {
    id: 'numeros-reais',
    pergunta: 'Os números desta página são reais?',
    resposta:
      'A geografia é IBGE, real. Os valores de PLD são amostra ilustrativa, marcados como tal — leitura ao vivo chega com o Terminal Brasil.',
  },
];

// ─── A Alexandria em números — derivado, nunca digitado ─────────────
const ALEXANDRIA_STATS = (() => {
  const trilhas = ALEXANDRIA_TRILHAS.length;
  const modulos = ALEXANDRIA_BLOCKS.length;
  const aulas = ALEXANDRIA_TRILHAS.reduce((soma, t) => soma + (t.totalAulas ?? 0), 0);
  return [
    { rotulo: 'trilhas de formação', valor: trilhas },
    { rotulo: 'módulos catalogados', valor: modulos },
    { rotulo: 'aulas confirmadas', valor: aulas },
  ];
})();

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

// Sete traços — a mesma contagem que a peça "Energização" do especimen
// escreve em sequência (o traço escreve, letra a letra). O desenho de
// primeiro paint reusa exatamente essa peça: stroke-dashoffset por
// traço em --dur-desenho, escalonado, easing único. pathLength=1
// normaliza o comprimento — o dasharray não depende de medição.
const WM_TRACOS: ReadonlyArray<{ d: string; w: number }> = [
  { d: 'M22 112 C22 80 22 50 22 18 C54 40 60 92 108 112 C108 80 108 50 108 18', w: 16 },
  { d: 'M140 32 L140 112', w: 13 },
  { d: 'M170 32 L200 112 L230 32', w: 13 },
  { d: 'M254 112 L284 32 L314 112', w: 13 },
  { d: 'M342 112 L342 32', w: 13 },
  { d: 'M342 32 C378 32 394 44 386 56 C378 68 362 64 342 64', w: 13 },
  { d: 'M370 62 C382 80 390 96 398 112', w: 13 },
];

const WM_PATHS = (
  <>
    {WM_TRACOS.map((t, i) => (
      <path
        key={i}
        d={t.d}
        strokeWidth={t.w}
        pathLength={1}
        data-wm-traco
        style={{ animationDelay: `${i * 90}ms` }}
      />
    ))}
  </>
);

// REVISÃO PÓS-WAVE 6 (pedido direto do Aquiles): a variante de papel
// saiu — o wordmark é o COLORIDO nos dois modos, como o próprio
// especimen de movimento renderiza sobre tinta. O gradiente é da marca
// e não aceita troca de cor; sobre os dois substratos ele é a marca,
// não texto de interface.
function WordmarkNivar({ altura, idSufixo }: { altura: number; idSufixo: string }) {
  const largura = Math.round(altura * (425 / 140));
  return (
    <span
      role="img"
      aria-label="NIVAR"
      style={{ display: 'inline-flex', flexShrink: 0, lineHeight: 0 }}
    >
      <svg
        className="nivar-wm"
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

  // O mercado agora (amostra ilustrativa): submercado ativo, período,
  // linha sob o cursor. Selecionar linha da tabela É selecionar a
  // série do gráfico — um mecanismo, não dois.
  const [subAtivo, setSubAtivo] = useState('sudesteCentroOeste');
  const [periodoAtivo, setPeriodoAtivo] = useState('24h');
  const [linhaSobre, setLinhaSobre] = useState<string | null>(null);

  // Perguntas diretas — várias podem estar abertas ao mesmo tempo.
  const [perguntasAbertas, setPerguntasAbertas] = useState<ReadonlySet<string>>(new Set());
  const alternarPergunta = useCallback((id: string) => {
    setPerguntasAbertas((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) novo.delete(id);
      else novo.add(id);
      return novo;
    });
  }, []);

  // ─── Boot da prévia do terminal ───────────────────────────────────
  // A prévia LIGA quando entra na tela: loader da casa (1,4s, a única
  // animação de transform do sistema — é a marca) → a interface acende
  // com os desenhos de sempre (eixos, linha em 1200ms, valores) →
  // estado vivo (relógio de DEMONSTRAÇÃO ticando, ponto respirando).
  // Reduced-motion nasce direto em 'vivo', parado.
  const reduzidoPagina = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )[0];
  const { ref: terminalRef, visto: terminalVisto } = useEntrouNaTela<HTMLDivElement>(0.3);
  const [bootTerminal, setBootTerminal] = useState<'espera' | 'loader' | 'vivo'>(
    reduzidoPagina ? 'vivo' : 'espera',
  );
  // Dois efeitos DE PROPÓSITO: se o mesmo efeito setasse 'loader' e
  // agendasse o timer, a própria mudança de estado re-dispararia o
  // efeito e o cleanup mataria o timer — o boot ficaria preso no
  // loader (bug pego pela suíte de verificação, não por leitura).
  useEffect(() => {
    if (terminalVisto && bootTerminal === 'espera') setBootTerminal('loader');
  }, [terminalVisto, bootTerminal]);
  useEffect(() => {
    if (bootTerminal !== 'loader') return;
    const t = window.setTimeout(() => setBootTerminal('vivo'), 1700);
    return () => window.clearTimeout(t);
  }, [bootTerminal]);

  // Relógio SINTÉTICO da prévia — reprodução de demonstração, nunca
  // hora real fingindo ser feed. Ticka só no estado vivo.
  const [segundoDemo, setSegundoDemo] = useState(0);
  useEffect(() => {
    if (bootTerminal !== 'vivo' || reduzidoPagina) return;
    const i = window.setInterval(() => setSegundoDemo((s) => (s + 1) % 60), 1000);
    return () => window.clearInterval(i);
  }, [bootTerminal, reduzidoPagina]);

  // Passos e contadores — entram quando aparecem.
  const { ref: passosRef, visto: passosVistos } = useEntrouNaTela<HTMLDivElement>(0.25);

  // Primeiro paint — a marca escreve (peça "Energização"). O boot é
  // ESTADO, não CSS puro, de propósito: com CSS puro, alternar o modo
  // faria o wordmark redesenhar a cada volta ao claro (display:none →
  // block reinicia animação), e troca de modo é mudança de estado,
  // nunca replay de marca. Reduced-motion nasce pronto.
  const [bootando, setBootando] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    if (!bootando) return;
    // 700ms de traço + 6 × 90ms de escalonamento + folga.
    const t = window.setTimeout(() => setBootando(false), 1500);
    return () => window.clearTimeout(t);
  }, [bootando]);

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

  // Derivados da amostra — baratos (≤ 60 pontos), recomputados por
  // render; determinísticos, então nunca divergem entre renders.
  const periodoSel = PERIODOS_AMOSTRA.find((p) => p.id === periodoAtivo) ?? PERIODOS_AMOSTRA[0];
  const subSel = SUBMERCADOS_AMOSTRA.find((s) => s.id === subAtivo) ?? SUBMERCADOS_AMOSTRA[0];
  const serieSel = serieIlustrativa(subSel.base, subSel.seed, periodoSel.pontos);
  const geo = geometriaSerie(serieSel);

  return (
    <div
      lang="pt-BR"
      data-nv-page=""
      data-mode={modo === 'noturno' ? 'noturno' : undefined}
      className={bootando ? 'nivar-boot' : undefined}
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

        /* ModeToggle — CSS do sistema, verbatim. Mono, sem caixa, sem
           ícone; ativo = texto forte + fio no acento da casa. */
        .nv-modo{display:flex;align-items:baseline;gap:8px}
        .nv-modo__op{font-family:var(--font-data);font-weight:400;font-size:11px;line-height:1.2;letter-spacing:.09em;text-transform:uppercase;color:var(--text-faint);background:none;border:0;border-bottom:1px solid transparent;padding:0 0 3px;cursor:pointer;transition:color var(--dur-estado) var(--ease),border-color var(--dur-estado) var(--ease)}
        .nv-modo__op:hover{color:var(--fg-hover)}
        .nv-modo__op--ativo{color:var(--text-strong);font-weight:500;border-bottom-color:var(--accent-house)}
        .nv-modo__sep{font-family:var(--font-data);font-size:11px;color:var(--rule-strong)}

        /* MethodDisclosure — CSS do sistema (components/data/data.css),
           verbatim, no subconjunto que o Portal usa. Divulgação de
           metodologia inline, ancorada na procedência — nunca modal. */
        .nv-metodo{display:grid;gap:0;max-width:480px}
        .nv-metodo__ancora{display:grid;justify-items:start;gap:7px}
        .nv-metodo__gatilho{justify-self:start;white-space:nowrap;font-family:var(--font-data);font-weight:500;font-size:10.5px;line-height:1.5;letter-spacing:.06em;text-transform:uppercase;color:var(--text-muted);background:none;border:0;border-bottom:var(--fio) solid var(--rule-strong);border-radius:0;padding:0 0 1px;cursor:pointer;transition:color var(--dur-hover) var(--ease),border-color var(--dur-hover) var(--ease)}
        .nv-metodo__gatilho:hover{color:var(--fg-hover);border-bottom-color:var(--fio-hover)}
        .nv-metodo__painel{display:grid;gap:9px;padding-top:11px;background:var(--surface-page)}
        .nv-metodo__fio-desenho{display:block;width:100%;height:1px;overflow:visible}
        .nv-metodo__fio-desenho line{stroke:var(--rule-heavy);stroke-width:1;vector-effect:non-scaling-stroke;stroke-dasharray:1000;stroke-dashoffset:1000;animation:nv-fio-desenha var(--dur-desenho) var(--ease) forwards}
        .nv-metodo__corpo{display:grid;opacity:0;animation:nv-surge var(--dur-hover) var(--ease) 140ms forwards}
        .nv-metodo__linha{display:grid;grid-template-columns:158px minmax(0,1fr);gap:3px 14px;padding:7px 0;border-bottom:var(--fio) solid var(--rule)}
        .nv-metodo__rot{font-family:var(--font-data);font-weight:500;font-size:9.5px;line-height:1.7;letter-spacing:.09em;text-transform:uppercase;color:var(--text-faint)}
        .nv-metodo__v{font-family:var(--font-body);font-weight:300;font-size:13px;line-height:1.5;color:var(--text-body);margin:0;text-wrap:pretty}
        .nv-metodo__v--dado{font-family:var(--font-data);font-weight:400;font-size:11.5px;line-height:1.55;letter-spacing:.03em;color:var(--text-strong);font-variant-numeric:tabular-nums lining-nums}
        .nv-metodo__premissas{display:grid;gap:4px;margin:0;padding:0;list-style:none}
        .nv-metodo__premissas li{font-family:var(--font-body);font-weight:300;font-size:13px;line-height:1.5;color:var(--text-body);padding-left:18px;position:relative}
        .nv-metodo__premissas li::before{content:"—";position:absolute;left:0;color:var(--text-faint)}
        @keyframes nv-surge{to{opacity:1}}
        @keyframes nv-fio-desenha{to{stroke-dashoffset:0}}
        @media (prefers-reduced-motion: reduce) {
          .nv-metodo__fio-desenho line{animation:none;stroke-dashoffset:0}
          .nv-metodo__corpo{animation:none;opacity:1}
        }

        /* Button — CSS do sistema (components/actions/button.css),
           verbatim no subconjunto usado. O preenchimento do primário
           muda de estado mas NÃO entra na transition — troca seca,
           como a regra manda. */
        .nv-btn{display:inline-flex;align-items:center;gap:8px;font-family:var(--font-body);font-size:13px;font-weight:500;letter-spacing:.02em;line-height:1;padding:9px 16px;border:var(--fio) solid transparent;border-radius:0;background:none;cursor:pointer;text-align:left;text-decoration:none;transition:color var(--dur-hover) var(--ease),border-color var(--dur-hover) var(--ease),opacity var(--dur-hover) var(--ease)}
        .nv-btn:focus-visible{outline:2px solid var(--accent-focus);outline-offset:2px}
        .nv-btn__glifo{font-family:var(--font-data);font-size:12px;line-height:1}
        .nv-btn--primario{background:var(--btn-primario-bg);border-color:var(--btn-primario-fio);color:var(--btn-primario-fg)}
        .nv-btn--primario:hover{background:var(--btn-primario-bg-hover);border-color:var(--btn-primario-fio-hover);color:var(--btn-primario-fg)}
        .nv-btn--primario:active{background:var(--btn-primario-bg-press);border-color:var(--btn-primario-fio-press);transition-duration:var(--dur-estado)}
        .nv-btn--secundario{border-color:var(--rule-heavy);color:var(--text-strong)}
        .nv-btn--secundario:hover{color:var(--fg-hover);border-color:var(--fio-hover)}
        .nv-btn--secundario:active{color:var(--fg-press);border-color:var(--fio-press);transition-duration:var(--dur-estado)}

        /* Corrente — o pulso atravessa o fio (peça 03 do especimen):
           janela de traço percorrendo o caminho em velocidade
           constante. Loop usa --ease-loop (linear), a única exceção
           declarada do easing. */
        @keyframes nivar-pulso { to { stroke-dashoffset: -1.12; } }
        .nivar-pulso {
          stroke-dasharray: 0.12 1.12;
          stroke-dashoffset: 0.12;
          animation: nivar-pulso 1400ms var(--ease-loop) infinite;
        }

        /* Loader da casa (peça Colapso/boot) — o N da marca entrando
           por transform. TRANSFORM SÓ NA MARCA: esta é a exceção única
           do sistema, com traço constante via non-scaling-stroke. */
        @keyframes nivar-loader-entra {
          from { transform: scale(0.12) rotate(-720deg); }
          to   { transform: scale(1) rotate(0deg); }
        }
        .nivar-loader-n {
          transform-origin: 50% 50%;
          animation: nivar-loader-entra 1400ms var(--ease) forwards;
        }

        /* Ponto "ao vivo" da prévia — respiração por opacidade em
           loop (peça Ao vivo), nunca cor de status. */
        @keyframes nivar-vivo { 0%, 45% { opacity: 1; } 55%, 90% { opacity: 0.25; } 100% { opacity: 1; } }
        .nivar-vivo-ponto { animation: nivar-vivo 3000ms var(--ease-loop) infinite; }

        /* Entrada escalonada de passos/contadores por viewport. */
        .nivar-passo { opacity: 0; animation: nv-surge var(--dur-hover) var(--ease) forwards; }

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

        /* Primeiro paint — a marca escreve (peça "Energização" do
           especimen): cada um dos sete traços desenha por
           stroke-dashoffset em --dur-desenho, escalonado 90ms, easing
           único. Só enquanto .nivar-boot está no root — o estado sai
           depois do boot e a troca de modo nunca redispara o desenho. */
        @keyframes nivar-wm-desenha { to { stroke-dashoffset: 0; } }
        .nivar-boot .nivar-wm [data-wm-traco] {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: nivar-wm-desenha var(--dur-desenho) var(--ease) forwards;
        }

        /* Surgimento do painel "em breve" — OPACIDADE PURA. O zoom com
           scale da Wave 2 sai: o sistema não anima escala em elemento
           de interface (transform é exclusivo do loader da marca). */
        @keyframes nivar-painel-surge {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        ::view-transition-new(nivar-painel) {
          animation: nivar-painel-surge var(--dur-hover) var(--ease) both;
        }

        /* Planta baixa dos destinos — o estado de carregamento do
           sistema é revelação por desenho: fio crescendo em
           --dur-desenho, easing único, nunca shimmer. */
        @keyframes nivar-desenha { to { stroke-dashoffset: 0; } }
        .nivar-planta [data-traco] {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
        }
        .nivar-planta.nivar-planta--visivel [data-traco] {
          animation: nivar-desenha var(--dur-desenho) var(--ease) forwards;
        }

        /* Série da amostra — desenho longo do sistema (1200ms), easing
           único; o ponto final surge DEPOIS que a linha termina. As
           durações vêm de token, então reduced-motion colapsa sozinho. */
        .nivar-serie-linha {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: nivar-desenha var(--dur-desenho-longo) var(--ease) forwards;
        }
        .nivar-serie-ponto {
          opacity: 0;
          animation: nv-surge var(--dur-hover) var(--ease) var(--dur-desenho-longo) forwards;
        }
        /* Verbete do glossário — revelação por surgimento, tokens. */
        .nivar-verbete {
          opacity: 0;
          animation: nv-surge var(--dur-hover) var(--ease) forwards;
        }
        @media (prefers-reduced-motion: reduce) {
          .nivar-planta [data-traco],
          .nivar-wm [data-wm-traco] {
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

      {/* Fio-gradiente de 4px demarcando o topo do documento — o ÚNICO
          uso de gradiente que o sistema permite fora do traço da marca,
          e exatamente onde ele permite. É a assinatura que o especimen
          carrega no topo, nos dois modos. */}
      <span
        aria-hidden="true"
        style={{
          flexShrink: 0,
          height: '4px',
          background: 'var(--gradiente-incandescente)',
        }}
      />
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
          <WordmarkNivar altura={30} idSufixo="cabecalho" />
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

          {/* ─── 01 · Prévia do Terminal Brasil ────────────────────────
              O demo do produto, sem portão, logo abaixo do hero — a
              janela é ESCURA SEMPRE (escopo data-mode próprio:
              identidade de terminal, independente do modo da página) e
              LIGA quando entra na tela: loader da casa → interface
              acende com os desenhos do sistema → estado vivo com
              relógio de DEMONSTRAÇÃO. A tabela dos quatro submercados
              É o seletor da série; o período vive no cabeçalho do
              gráfico. */}
          <section
            aria-label="Prévia do Terminal Brasil — amostra ilustrativa"
            style={{
              padding: '32px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
              <span style={{ ...NT.proc, fontWeight: 500, color: 'var(--accent-house)' }}>01</span>
              <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }}>
                Prévia do Terminal Brasil
              </span>
              <span
                aria-hidden="true"
                style={{ flex: 1, borderTop: 'var(--fio) solid var(--rule)', alignSelf: 'center' }}
              />
              <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>
                em construção · a prévia liga sozinha
              </span>
            </div>

            <div
              ref={terminalRef}
              data-mode="noturno"
              style={{
                background: 'var(--surface-page)',
                color: 'var(--text-body)',
                border: 'var(--fio) solid var(--rule-strong)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Barra de título do terminal */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  padding: '10px 16px',
                  borderBottom: 'var(--fio) solid var(--rule)',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                  {/* O marcador de "ao vivo" do sistema: círculo pleno
                      de 6px em NEUTRO quente, nunca colorido. Aqui ele
                      respira porque a prévia está reproduzindo. */}
                  <span
                    aria-hidden="true"
                    className={bootTerminal === 'vivo' ? 'nivar-vivo-ponto' : undefined}
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: 'var(--text-muted)',
                      opacity: bootTerminal === 'vivo' ? 1 : 0.35,
                    }}
                  />
                  <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>
                    Reprodução de demonstração ·{' '}
                    <span data-numeric style={{ fontVariantNumeric: 'tabular-nums' }}>
                      14:30:{String(segundoDemo).padStart(2, '0')} BRT
                    </span>
                  </span>
                </span>
                <span style={{ ...NT.proc, color: 'var(--text-strong)' }}>
                  Terminal Brasil · prévia
                </span>
              </div>

              {bootTerminal !== 'vivo' ? (
                /* Boot — o N da casa entra por transform (a exceção
                   única do sistema: transform SÓ na marca), com traço
                   constante e o gradiente de incandescência. */
                <div
                  style={{
                    minHeight: '340px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {bootTerminal === 'loader' && (
                    <svg
                      viewBox="10 6 110 118"
                      width={72}
                      height={76}
                      aria-hidden="true"
                      style={{ overflow: 'visible' }}
                    >
                      <defs>
                        <linearGradient
                          id="incandescente-terminal"
                          gradientUnits="userSpaceOnUse"
                          x1="22"
                          y1="0"
                          x2="108"
                          y2="0"
                        >
                          <stop offset="0%" stopColor="#7A1F0D" />
                          <stop offset="50%" stopColor="#C17D1F" />
                          <stop offset="100%" stopColor="#F5C63C" />
                        </linearGradient>
                      </defs>
                      <path
                        className="nivar-loader-n"
                        d={N_CASA_D}
                        fill="none"
                        stroke="url(#incandescente-terminal)"
                        strokeWidth={16}
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  )}
                </div>
              ) : (
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'flex-end',
                      gap: '12px',
                    }}
                  >
                    {/* Segmentado de período — mono versalete com
                        separador ·, o registro do PeriodSegment. */}
                    <div className="nv-modo" role="group" aria-label="Período da amostra">
                      {PERIODOS_AMOSTRA.map((per, i) => (
                        <span key={per.id} style={{ display: 'inline-flex', gap: '8px' }}>
                          {i > 0 && (
                            <span className="nv-modo__sep" aria-hidden="true">
                              ·
                            </span>
                          )}
                          <button
                            type="button"
                            className={`nv-modo__op${periodoAtivo === per.id ? ' nv-modo__op--ativo' : ''}`}
                            aria-pressed={periodoAtivo === per.id}
                            onClick={() => setPeriodoAtivo(per.id)}
                          >
                            {per.rotulo}
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '16px',
                      alignItems: 'stretch',
                    }}
                  >
              {/* Gráfico — série de UMA cor (--serie-linha: tinta no
                  claro, intelligence no noturno), eixo em mono, sem
                  grade decorativa. A linha redesenha em 1200ms a cada
                  troca de submercado ou período. */}
              <figure
                style={{
                  flex: '1.6 1 460px',
                  minWidth: 0,
                  margin: 0,
                  border: 'var(--fio) solid var(--rule)',
                  padding: '16px 16px 8px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <figcaption
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  <span style={{ ...NT.titulo2, color: 'var(--text-strong)' }}>
                    PLD · {subSel.nome}
                  </span>
                  <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>
                    R$/MWh ·{' '}
                    <span
                      style={{
                        color: 'var(--ilustrativa-fg)',
                        fontWeight: 500,
                        borderBottom: 'var(--fio) solid var(--ilustrativa-fio)',
                        paddingBottom: '1px',
                      }}
                    >
                      amostra ilustrativa
                    </span>
                  </span>
                </figcaption>
                <svg
                  viewBox="0 0 720 210"
                  role="img"
                  aria-label={`Série ilustrativa de PLD para ${subSel.nome}, período ${periodoSel.rotulo}`}
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                >
                  <line
                    x1={52}
                    y1={12}
                    x2={52}
                    y2={170}
                    strokeWidth={0.8}
                    style={{ stroke: 'var(--rule-strong)' }}
                  />
                  <line
                    x1={52}
                    y1={170}
                    x2={708}
                    y2={170}
                    strokeWidth={0.8}
                    style={{ stroke: 'var(--rule-strong)' }}
                  />
                  <text
                    x={46}
                    y={geo.py(geo.vMax) + 3}
                    textAnchor="end"
                    fontSize={9}
                    style={{
                      fontFamily: 'var(--font-data)',
                      fill: 'var(--text-faint)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatoBRL(geo.vMax)}
                  </text>
                  <text
                    x={46}
                    y={geo.py(geo.vMin) + 3}
                    textAnchor="end"
                    fontSize={9}
                    style={{
                      fontFamily: 'var(--font-data)',
                      fill: 'var(--text-faint)',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatoBRL(geo.vMin)}
                  </text>
                  <text
                    x={52}
                    y={190}
                    fontSize={9}
                    style={{ fontFamily: 'var(--font-data)', fill: 'var(--text-faint)' }}
                  >
                    {periodoSel.inicio}
                  </text>
                  <text
                    x={708}
                    y={190}
                    textAnchor="end"
                    fontSize={9}
                    style={{ fontFamily: 'var(--font-data)', fill: 'var(--text-faint)' }}
                  >
                    agora
                  </text>
                  <path
                    key={`linha-${subAtivo}-${periodoAtivo}`}
                    className="nivar-serie-linha"
                    d={geo.d}
                    fill="none"
                    strokeWidth={1.4}
                    pathLength={1}
                    style={{ stroke: 'var(--serie-linha)' }}
                  />
                  <circle
                    key={`ponto-${subAtivo}-${periodoAtivo}`}
                    className="nivar-serie-ponto"
                    cx={geo.px(serieSel.length - 1)}
                    cy={geo.py(serieSel[serieSel.length - 1])}
                    r={3.2}
                    style={{ fill: 'var(--serie-ponto)' }}
                  />
                </svg>
              </figure>

              {/* Tabela dos quatro submercados — a linha É o seletor da
                  série. Zebra no hover, fio de acento no selecionado. */}
              <div
                role="group"
                aria-label="Submercados — selecione para ver a série"
                style={{
                  flex: '1 1 340px',
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignSelf: 'flex-start',
                  border: 'var(--fio) solid var(--rule)',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(96px, 1.3fr) 82px 78px minmax(120px, 1fr)',
                    gap: '12px',
                    padding: '8px 12px',
                    borderBottom: 'var(--fio) solid var(--rule)',
                  }}
                >
                  {['Submercado', 'PLD médio', 'Variação', 'Banda'].map((c, i) => (
                    <span
                      key={c}
                      style={{
                        ...NT.proc,
                        color: 'var(--text-faint)',
                        textAlign: i === 0 ? 'left' : 'right',
                      }}
                    >
                      {c}
                    </span>
                  ))}
                </div>
                {SUBMERCADOS_AMOSTRA.map((s) => {
                  const serie = serieIlustrativa(s.base, s.seed, periodoSel.pontos);
                  const media = serie.reduce((a, b) => a + b, 0) / serie.length;
                  const pct = ((serie[serie.length - 1] - serie[0]) / serie[0]) * 100;
                  const dir = direcaoDe(pct);
                  const selecionado = s.id === subAtivo;
                  const sobre = linhaSobre === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={selecionado}
                      onClick={() => setSubAtivo(s.id)}
                      onMouseEnter={() => setLinhaSobre(s.id)}
                      onMouseLeave={() => setLinhaSobre(null)}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(96px, 1.3fr) 82px 78px minmax(120px, 1fr)',
                        gap: '12px',
                        alignItems: 'baseline',
                        padding: '9px 12px',
                        background: sobre && !selecionado ? 'var(--zebra)' : 'transparent',
                        border: 'none',
                        borderBottom: 'var(--fio) solid var(--rule)',
                        borderLeft: `2px solid ${selecionado ? 'var(--accent-house)' : 'transparent'}`,
                        borderRadius: 0,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition:
                          'border-color var(--dur-estado) var(--ease), color var(--dur-estado) var(--ease)',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: 'var(--font-body)',
                          fontWeight: selecionado ? 500 : 400,
                          fontSize: 'var(--ts-corpo-2)',
                          color: selecionado ? 'var(--text-strong)' : 'var(--text-muted)',
                        }}
                      >
                        {s.sigla}
                      </span>
                      <span
                        data-numeric
                        style={{
                          fontFamily: 'var(--font-data)',
                          fontSize: 'var(--ts-dado-4)',
                          fontVariantNumeric: 'tabular-nums',
                          color: 'var(--text-strong)',
                          textAlign: 'right',
                        }}
                      >
                        {formatoBRL(media)}
                      </span>
                      {/* TrendInline do sistema: glifo + delta na cor de
                          DIREÇÃO de mercado (alta/baixa/neutro), nunca
                          verde/vermelho de UI. */}
                      <span
                        data-numeric
                        title={
                          dir === 'alta' ? 'em alta' : dir === 'baixa' ? 'em baixa' : 'sem variação'
                        }
                        style={{
                          fontFamily: 'var(--font-data)',
                          fontWeight: 500,
                          fontSize: 'var(--ts-dado-5)',
                          fontVariantNumeric: 'tabular-nums',
                          color: COR_DIRECAO[dir],
                          textAlign: 'right',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <span aria-hidden="true">{GLIFO_DIRECAO[dir]}</span> {formatoPct(pct)}
                      </span>
                      <span
                        data-numeric
                        style={{
                          fontFamily: 'var(--font-data)',
                          fontSize: 'var(--ts-dado-5)',
                          fontVariantNumeric: 'tabular-nums',
                          color: 'var(--text-muted)',
                          textAlign: 'right',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {formatoBRL(Math.min(...serie))} – {formatoBRL(Math.max(...serie))}
                      </span>
                    </button>
                  );
                })}
                <span style={{ ...NT.proc, color: 'var(--text-faint)', padding: '8px 12px' }}>
                  Divisão de submercado: ONS · valores R$/MWh
                </span>
              </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ─── 02 · Como a NIVAR lê o mercado ────────────────────────
              Quatro passos sob um fio energizado — a peça Corrente do
              especimen: o pulso atravessa o fio frio, em loop linear.
              Copy do implementador, sujeita a veto. */}
          <section
            aria-label="Como a NIVAR lê o mercado"
            style={{
              padding: '32px 0',
              borderTop: 'var(--fio) solid var(--rule)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
              <span style={{ ...NT.proc, fontWeight: 500, color: 'var(--accent-house)' }}>02</span>
              <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }}>
                Como a NIVAR lê o mercado
              </span>
              <span
                aria-hidden="true"
                style={{ flex: 1, borderTop: 'var(--fio) solid var(--rule)', alignSelf: 'center' }}
              />
              <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>
                da fonte pública à entrega
              </span>
            </div>

            <div ref={passosRef} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* O fio que liga os quatro passos, com o pulso de
                  corrente viajando — só quando a seção está na tela e
                  sem reduced-motion (o pulso é loop; reduzido não
                  ganha loop, ganha o fio desenhado). */}
              <svg
                viewBox="0 0 1000 12"
                preserveAspectRatio="none"
                aria-hidden="true"
                style={{ width: '100%', height: '12px', display: 'block' }}
              >
                <line
                  x1={6}
                  y1={6}
                  x2={994}
                  y2={6}
                  strokeWidth={1}
                  style={{ stroke: 'var(--rule-strong)' }}
                />
                {[6, 335, 665, 994].map((x) => (
                  <circle key={x} cx={x} cy={6} r={3} style={{ fill: 'var(--rule-heavy)' }} />
                ))}
                {passosVistos && !reduzidoPagina && (
                  <line
                    className="nivar-pulso"
                    x1={6}
                    y1={6}
                    x2={994}
                    y2={6}
                    strokeWidth={2}
                    pathLength={1}
                    style={{ stroke: 'var(--accent-house)' }}
                  />
                )}
              </svg>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  columnGap: '32px',
                  rowGap: '20px',
                }}
              >
                {PASSOS_LEITURA.map((p, i) => (
                  <div
                    key={p.id}
                    className={passosVistos ? 'nivar-passo' : undefined}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      opacity: passosVistos ? undefined : 0,
                      animationDelay: `${i * 150}ms`,
                    }}
                  >
                    <span style={{ ...NT.proc, fontWeight: 500, color: 'var(--accent-house)' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h3 style={{ ...NT.titulo2, margin: 0, color: 'var(--text-strong)' }}>
                      {p.titulo}
                    </h3>
                    <p style={{ ...NT.corpo, margin: 0, color: 'var(--text-muted)' }}>{p.detalhe}</p>
                  </div>
                ))}
              </div>
            </div>
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
              borderTop: 'var(--fio) solid var(--rule)',
            }}
          >
            {/* Cabeçalho de seção do sistema: número · título · fio ·
                nota à direita, numa linha de baseline. Número em mono,
                dois dígitos, no acento da casa. */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
              <span style={{ ...NT.proc, fontWeight: 500, color: 'var(--accent-house)' }}>03</span>
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

          {/* ─── 04 · A Alexandria em números ──────────────────────────
              A prova social honesta de um produto pré-lançamento: o
              tamanho REAL do que já está aberto, derivado do catálogo
              (nenhum número digitado), contando com smoothstep quando
              entra na tela — a peça bScore. */}
          <section
            aria-label="A Alexandria em números"
            style={{
              padding: '32px 0',
              borderTop: 'var(--fio) solid var(--rule)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
              <span style={{ ...NT.proc, fontWeight: 500, color: 'var(--accent-house)' }}>04</span>
              <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }}>
                A Alexandria em números
              </span>
              <span
                aria-hidden="true"
                style={{ flex: 1, borderTop: 'var(--fio) solid var(--rule)', alignSelf: 'center' }}
              />
              <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>
                o produto aberto hoje
              </span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                borderTop: 'var(--fio) solid var(--rule)',
                borderBottom: 'var(--fio) solid var(--rule)',
              }}
            >
              {ALEXANDRIA_STATS.map((s, i) => (
                <div
                  key={s.rotulo}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    padding: '20px 24px',
                    borderLeft: i > 0 ? 'var(--fio) solid var(--rule)' : 'none',
                  }}
                >
                  <ContadorVivo valor={s.valor} reduzido={reduzidoPagina} />
                  <span style={{ ...NT.etiqueta, color: 'var(--text-muted)' }}>{s.rotulo}</span>
                </div>
              ))}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '20px 24px',
                  borderLeft: 'var(--fio) solid var(--rule)',
                }}
              >
                {(() => {
                  const alexandria = DESTINOS_BR.find((d) => d.id === 'alexandria');
                  return alexandria && alexandria.rota ? (
                    <Link
                      className="nv-btn nv-btn--secundario"
                      to={alexandria.rota}
                      onClick={(e) => {
                        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
                          return;
                        e.preventDefault();
                        comTransicao(() => navigate(alexandria.rota as string));
                      }}
                    >
                      Entrar na Alexandria
                      <span className="nv-btn__glifo" aria-hidden="true">
                        →
                      </span>
                    </Link>
                  ) : null;
                })()}
                <span style={{ ...NT.proc, color: 'var(--text-faint)' }}>
                  Contagem derivada do catálogo extraído
                </span>
              </div>
            </div>
          </section>

          {/* Conflito de interesse (Wave 6) — imediatamente ANTES da
              Independência, no MESMO padrão de grade dela: mesma
              tipografia, mesmo espaçamento, mesmo tratamento de fio,
              zero componente novo. A Independência renumera 02→03. */}
          <section
            aria-labelledby="br-conflito"
            style={{
              padding: '32px 0',
              borderTop: 'var(--fio) solid var(--rule)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
                <span style={{ ...NT.proc, fontWeight: 500, color: 'var(--accent-house)' }}>
                  05
                </span>
                <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }} id="br-conflito">
                  Conflito de interesse
                </span>
                <span
                  aria-hidden="true"
                  style={{
                    flex: 1,
                    borderTop: 'var(--fio) solid var(--rule)',
                    alignSelf: 'center',
                  }}
                />
              </div>
              <h2 style={{ ...NT.display3, margin: 0, color: 'var(--text-strong)' }}>
                O tradutor é parte interessada.
              </h2>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                columnGap: '32px',
                rowGap: '24px',
                borderTop: 'var(--fio) solid var(--rule)',
                borderBottom: 'var(--fio) solid var(--rule)',
                padding: '20px 0 24px',
              }}
            >
              {CONFLITO.map((c) => (
                <div
                  key={c.id}
                  style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  <h3 style={{ ...NT.titulo2, margin: 0, color: 'var(--text-strong)' }}>
                    {c.titulo}
                  </h3>
                  <p style={{ ...NT.corpo, margin: 0, color: 'var(--text-muted)' }}>
                    {c.detalhe}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Versão afirmativa (Wave 4) — copy do implementador,
              sujeita a veto; ver cabeçalho do componente. */}
          <FaixaIndependencia />

          {/* ─── 07 · Perguntas diretas ────────────────────────────────
              FAQ honesto — toda resposta verificável contra o estado
              real do produto. Marcador +/− em mono, nunca chevron
              girando; várias podem estar abertas. */}
          <section
            aria-labelledby="br-perguntas"
            style={{
              padding: '32px 0',
              borderTop: 'var(--fio) solid var(--rule)',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
              <span style={{ ...NT.proc, fontWeight: 500, color: 'var(--accent-house)' }}>07</span>
              <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }} id="br-perguntas">
                Perguntas diretas
              </span>
              <span
                aria-hidden="true"
                style={{ flex: 1, borderTop: 'var(--fio) solid var(--rule)', alignSelf: 'center' }}
              />
              <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>
                respostas verificáveis, sem promessa
              </span>
            </div>

            <div style={{ borderTop: 'var(--fio) solid var(--rule)' }}>
              {PERGUNTAS_DIRETAS.map((q) => {
                const aberta = perguntasAbertas.has(q.id);
                return (
                  <div key={q.id} style={{ borderBottom: 'var(--fio) solid var(--rule)' }}>
                    <button
                      type="button"
                      aria-expanded={aberta}
                      onClick={() => alternarPergunta(q.id)}
                      style={{
                        width: '100%',
                        display: 'grid',
                        gridTemplateColumns: '1fr 24px',
                        gap: '16px',
                        alignItems: 'baseline',
                        padding: '14px 0',
                        background: 'none',
                        border: 'none',
                        borderRadius: 0,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ ...NT.titulo2, color: 'var(--text-strong)' }}>
                        {q.pergunta}
                      </span>
                      <span
                        aria-hidden="true"
                        style={{
                          fontFamily: 'var(--font-data)',
                          fontSize: '14px',
                          color: 'var(--text-muted)',
                          textAlign: 'right',
                        }}
                      >
                        {aberta ? '−' : '+'}
                      </span>
                    </button>
                    {aberta && (
                      <div
                        className="nivar-verbete"
                        style={{ padding: '0 0 16px', maxWidth: '68ch' }}
                      >
                        <p style={{ ...NT.corpo, margin: 0, color: 'var(--text-body)' }}>
                          {q.resposta}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ─── CTA final — a ação repetida no fim, como no topo ──────
              Botão primário do sistema (preenchimento brasa, troca de
              fundo SECA) + secundário; redutor de risco em procedência,
              factual: criar conta É gratuito (Identidade Wave 9). */}
          <section
            aria-label="Criar conta"
            style={{
              margin: '0 0 32px',
              borderTop: 'var(--fio) solid var(--rule-heavy)',
              borderBottom: 'var(--fio) solid var(--rule-heavy)',
              padding: '28px 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '52ch' }}>
              <h2 style={{ ...NT.display3, margin: 0, color: 'var(--text-strong)' }}>
                A leitura independente começa com uma conta.
              </h2>
              <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>
                Gratuita · ativação de produto sem custo até o lançamento
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <Link className="nv-btn nv-btn--primario" to="/criar-conta">
                Criar conta gratuita
              </Link>
              <Link className="nv-btn nv-btn--secundario" to="/entrar">
                Entrar
              </Link>
            </div>
          </section>
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
                  <WordmarkNivar altura={20} idSufixo="rodape" />
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

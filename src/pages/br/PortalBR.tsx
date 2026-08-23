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
// WAVE 9 · FASE 1 — estado real confirmado:
//   TODAS as seções descontinuadas são INLINE AQUI. portalChrome.tsx
//     tem ZERO delas — a extração da Wave 8 levou só wordmark + folha
//     de CSS. Exceção: Independência é o componente FaixaIndependencia.
//   NÃO EXISTE arquivo "página Academy": a Wave 8 fez UM componente
//     parametrizado (FamiliaPage.tsx, useParams → familiaPorId) para
//     as cinco rotas. O conteúdo da Alexandria entra lá CONDICIONADO a
//     familia.id === 'academy', para as outras quatro (NUNCA MODIFICAR
//     nesta wave) renderizarem exatamente igual.
//   RODAPÉ é inline aqui; a coluna "Destinos" mapeia DESTINOS_BR.
//   Dois textos envelhecem com o corte e a Fase 4 os trata: a faixa de
//     fatos cita "até o Terminal Brasil" (que sai) e "N destinos".

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
import { FAMILIAS_BR } from '../../lib/data/br-familias';
import type { SubmercadoPath } from '../../lib/geo/brasil-outline';
// DestinoCard saiu do import na Wave 8 junto com a grade de cinco
// cards — o COMPONENTE fica no disco, intocado, para a página de
// família reusar se quiser card de produto depois. PlantaBaixa
// continua, porque o overlay "em breve" ainda a usa.
import { PlantaBaixa } from '../../components/br/DestinoCard';
import { FaixaFamilias } from '../../components/br/FaixaFamilias';
import { PortalHero } from '../../components/br/PortalHero';
import { FOLHA_PORTAL, WordmarkNivar } from '../../components/br/portalChrome';
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
      <style>{FOLHA_PORTAL}</style>

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



          {/* ─── 03 · Famílias (Wave 8) ────────────────────────────────
              A grade de cinco cards de PRODUTO saiu; a faixa de cinco
              FAMÍLIAS COMERCIAIS entra no lugar, mantendo o número de
              seção 03 — a numeração NÃO desloca, e nenhuma outra seção
              precisou ser renumerada. A casa marca a família, não o
              produto (arquitetura de marca do design system); os cinco
              produtos continuam existindo, agora dentro da página da
              família a que pertencem. */}
          <section
            aria-label="Famílias"
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
                dois dígitos, no acento da casa. A nota é DERIVADA dos
                dois catálogos, nunca digitada. */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
              <span style={{ ...NT.proc, fontWeight: 500, color: 'var(--accent-house)' }}>03</span>
              <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }}>Famílias</span>
              <span
                aria-hidden="true"
                style={{ flex: 1, borderTop: 'var(--fio) solid var(--rule)', alignSelf: 'center' }}
              />
              <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>
                {FAMILIAS_BR.length} famílias ·{' '}
                {DESTINOS_BR.filter((d) => d.status === 'disponivel').length} produto aberto
              </span>
            </div>

            <FaixaFamilias />
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

// FamiliaPage — ARCHITECT, Portal BR Wave 8.
//
// A página de uma família comercial. UM componente, cinco rotas — não
// cinco arquivos quase idênticos: a diferença entre as famílias é DADO
// (`br-familias.ts`), não estrutura. Quando uma família crescer o
// bastante para precisar de composição própria, ela ganha o arquivo
// dela e a rota aponta para lá; até então, cinco cópias divergiriam na
// primeira correção feita em uma só.
//
// MÍNIMA POR DECISÃO: nome, frase de domínio, parágrafo e a lista de
// produtos com estado. Nada de gráfico, nada de prévia, nada de número
// inventado — a página cresce conforme cada produto sai do papel.
//
// PRODUTO NUNCA É INVENTADO: a lista sai de `produtosDaFamilia()`, que
// resolve ids contra `DESTINOS_BR`. Família sem produto catalogado
// (Hardware, hoje) declara isso em texto em vez de mostrar prateleira
// vazia sem explicação — a mesma honestidade de nulo do resto do
// projeto.

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { flushSync } from 'react-dom';

// Tokens NIVAR — só arquivos de VARIÁVEL, como o PortalBR. base.css
// fica de fora: restila elemento global e vazaria para outras
// superfícies; o que ele daria entra escopado em FOLHA_PORTAL.
import '../../design/nivar/fonts.css';
import '../../design/nivar/colors.css';
import '../../design/nivar/typography.css';
import '../../design/nivar/space.css';
import '../../design/nivar/motion.css';

import { FOLHA_PORTAL, WordmarkNivar } from '../../components/br/portalChrome';
import { familiaPorId, produtosDaFamilia } from '../../lib/data/br-familias';
// Números REAIS do produto aberto — derivados do catálogo da
// Alexandria (LEITURA, nunca modificação): se o currículo crescer, a
// página acompanha sozinha. Migrados da landing na Wave 9.
import { ALEXANDRIA_TRILHAS } from '../../lib/data/alexandria-trilhas';
import { ALEXANDRIA_BLOCKS } from '../../lib/data/alexandria-blocks';

// ─── Gravura da Alexandria (Wave 10) ─────────────────────────────────
// O mesmo arquivo que ilustrava o card do destino na landing antes da
// Wave 8 — confirmado presente no disco na Fase 1, não é referência
// morta. A cor de papel é a do sistema ALEXANDRIA, literal: a gravura
// tem cantos transparentes e foi desenhada para esse fundo. Hardcoded
// de propósito, como o DestinoCard já fazia — importar
// `alexandria-tokens.ts` é proibido, e aqui a página CITA o produto,
// não acopla os dois sistemas.
const ALEXANDRIA_GRAVURA_SRC = '/alexandria/gravuras/alexandria-gravura.png';
const ALEXANDRIA_PAPEL = '#F2E9D6';

const MEDIDA = '1200px';
const RESPIRO_LATERAL = '32px';

// Papéis tipográficos — declarados localmente, como todo componente do
// Portal faz (ver a razão em portalChrome.tsx e PortalBR.tsx).
const NT = {
  etiqueta: {
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    fontSize: 'var(--ts-etiqueta)',
    lineHeight: 'var(--lh-etiqueta)' as CSSProperties['lineHeight'],
    letterSpacing: 'var(--tr-etiqueta)',
    textTransform: 'uppercase',
  } satisfies CSSProperties,
  proc: {
    fontFamily: 'var(--font-data)',
    fontWeight: 400,
    fontSize: '10.5px',
    lineHeight: 1.5,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    fontVariantNumeric: 'tabular-nums lining-nums',
  } satisfies CSSProperties,
  display3: {
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--fw-display)' as CSSProperties['fontWeight'],
    fontSize: 'var(--ts-display-3)',
    lineHeight: 'var(--lh-display-3)' as CSSProperties['lineHeight'],
    letterSpacing: 'var(--tr-display-3)',
  } satisfies CSSProperties,
  titulo2: {
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--fw-display)' as CSSProperties['fontWeight'],
    fontSize: 'var(--ts-titulo-2)',
    lineHeight: 'var(--lh-titulo-2)' as CSSProperties['lineHeight'],
    letterSpacing: 'var(--tr-titulo-2)',
  } satisfies CSSProperties,
  lede: {
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--fw-corpo-leve)' as CSSProperties['fontWeight'],
    fontSize: 'var(--ts-lede)',
    lineHeight: 'var(--lh-lede)' as CSSProperties['lineHeight'],
    letterSpacing: 'var(--tr-lede)',
  } satisfies CSSProperties,
  corpo: {
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--fw-corpo)' as CSSProperties['fontWeight'],
    fontSize: 'var(--ts-corpo)',
    lineHeight: 'var(--lh-corpo)' as CSSProperties['lineHeight'],
  } satisfies CSSProperties,
} as const;

// ─── Migrado da landing na Wave 9 ────────────────────────────────────
// "A Alexandria em números" saiu do Portal e passou a viver aqui, na
// família a que o produto pertence. O conteúdo é o mesmo, verbatim: a
// contagem é DERIVADA dos catálogos (nenhum número digitado) e conta
// com smoothstep ao entrar na tela — a peça bScore do especimen.

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

/** Contador que sobe com smoothstep quando entra na tela (1400ms), em
 *  rAF. Reduced-motion nasce pronto. */
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

/** Derivado, nunca digitado. */
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

export function FamiliaPage() {
  const { familiaId } = useParams<{ familiaId: string }>();
  const navigate = useNavigate();
  const [modo, setModo] = useState<'claro' | 'noturno'>('claro');
  const reduzidoPagina = useState(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  )[0];

  const familia = familiaId ? familiaPorId(familiaId) : undefined;

  // Identidade de documento — entra e sai com a página, como o Portal.
  useEffect(() => {
    const anterior = document.title;
    document.title = familia ? `NIVAR — ${familia.nome}` : 'NIVAR — Portal Brasil';
    return () => {
      document.title = anterior;
    };
  }, [familia]);

  // Id desconhecido volta para o Portal em vez de renderizar uma
  // família vazia. O router já tem catch-all; isto cobre `/br/familia/x`
  // com um id que não existe no catálogo.
  useEffect(() => {
    if (!familia) navigate('/br', { replace: true });
  }, [familia, navigate]);

  if (!familia) return null;

  const produtos = produtosDaFamilia(familia);
  // Só a Academy ganha o bloco de números da Alexandria; as outras
  // quatro renderizam sem ele — o arquivo é compartilhado, o conteúdo
  // não. Com a seção "As outras famílias" fora (Wave 10), a numeração
  // não tem mais buraco: Academy fecha em 01·02, as demais em 01.
  const ehAcademy = familia.id === 'academy';

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
      }}
    >
      <style>{FOLHA_PORTAL}</style>

      {/* Faixa incandescente do topo — a mesma do Portal, o único
          gradiente que o sistema permite fora do traço da marca. */}
      <span
        aria-hidden="true"
        style={{ flexShrink: 0, height: '4px', background: 'var(--gradiente-incandescente)' }}
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
          <Link
            to="/br"
            aria-label="NIVAR — voltar ao Portal Brasil"
            onClick={(e) => {
              if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              comTransicao(() => navigate('/br'));
            }}
            style={{ display: 'inline-flex', textDecoration: 'none', border: 'none' }}
          >
            <WordmarkNivar altura={30} idSufixo="familia-cabecalho" />
          </Link>
          <span
            aria-hidden="true"
            style={{ width: '1px', height: '14px', background: 'var(--rule)' }}
          />
          <span style={{ ...NT.etiqueta, color: 'var(--text-muted)' }}>{familia.nome}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          <Link
            className="nv-btn nv-btn--secundario"
            to="/br"
            onClick={(e) => {
              if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              e.preventDefault();
              comTransicao(() => navigate('/br'));
            }}
          >
            <span className="nv-btn__glifo" aria-hidden="true">
              ←
            </span>
            Portal Brasil
          </Link>
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

      <main
        tabIndex={0}
        aria-label={`${familia.nome} — conteúdo rolável`}
        style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}
      >
        <div style={{ maxWidth: MEDIDA, margin: '0 auto', padding: `0 ${RESPIRO_LATERAL}` }}>
          {/* Identidade da família — o marcador na cor real, o nome, a
              linha de domínio VERBATIM do design system e o parágrafo. */}
          <section
            aria-label={`${familia.nome} — a família`}
            style={{
              padding: '32px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Cor da família como FIO e marcador, nunca como texto:
                  advisory lê 1,9:1 e intelligence 1,4:1 sobre papel. */}
              <span
                aria-hidden="true"
                style={{ width: '22px', height: '3px', background: familia.hex, flexShrink: 0 }}
              />
              <span style={{ ...NT.etiqueta, color: 'var(--text-muted)' }}>Família</span>
            </span>
            <h1 style={{ ...NT.display3, margin: 0, color: 'var(--text-strong)' }}>
              {familia.nome}
            </h1>
            <p style={{ ...NT.lede, margin: 0, color: 'var(--text-muted)', maxWidth: '62ch' }}>
              {familia.dominio}
            </p>
            <p style={{ ...NT.corpo, margin: 0, color: 'var(--text-body)', maxWidth: '62ch' }}>
              {familia.paragrafo}
            </p>
          </section>

          {/* Produtos — estado ABERTO ou EM CONSTRUÇÃO, resolvido do
              catálogo real. Aberto vira link de verdade; em construção
              é etiqueta, nunca link morto. */}
          <section
            aria-label="Produtos da família"
            style={{
              padding: '32px 0',
              borderTop: 'var(--fio) solid var(--rule)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
              <span style={{ ...NT.proc, fontWeight: 500, color: 'var(--accent-house)' }}>01</span>
              <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }}>Produtos</span>
              <span
                aria-hidden="true"
                style={{ flex: 1, borderTop: 'var(--fio) solid var(--rule)', alignSelf: 'center' }}
              />
              <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>
                {produtos.length === 0
                  ? 'nenhum catalogado'
                  : `${produtos.length} no catálogo`}
              </span>
            </div>

            {produtos.length === 0 ? (
              /* Estado vazio DECLARADO — contorno tracejado, o mesmo
                 registro de "ainda não existe" que o resto do sistema
                 usa. Nunca inventar produto para preencher. */
              <div
                style={{
                  border: `var(--fio) dashed ${familia.hex}`,
                  padding: '24px',
                  maxWidth: '62ch',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <span style={{ ...NT.etiqueta, color: 'var(--text-muted)' }}>
                  Prateleira vazia
                </span>
                <p style={{ ...NT.corpo, margin: 0, color: 'var(--text-muted)' }}>
                  Nenhum produto desta família está catalogado no repositório hoje. A família
                  existe na arquitetura de marca; a página cresce quando o primeiro produto dela
                  sair do papel.
                </p>
              </div>
            ) : (
              <div style={{ borderTop: 'var(--fio) solid var(--rule)' }}>
                {produtos.map((p) => {
                  const aberto = p.status === 'disponivel' && p.rota !== null;
                  return (
                    // Peso igual é o certo aqui: isto é LINHA DE LISTA
                    // (nome · descrição · estado), no registro do
                    // DataTable do sistema — "tabela de bordas
                    // colapsadas", que não tem célula focal. Marcar uma
                    // coluna como dominante inventaria hierarquia onde
                    // a leitura é horizontal.
                    // gridalpha-detect-disable-next-line equal-weight-grid
                    <div
                      key={p.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(180px, 260px) minmax(0, 1fr) auto',
                        gap: '16px 24px',
                        alignItems: 'baseline',
                        padding: '18px 0',
                        borderBottom: 'var(--fio) solid var(--rule)',
                        borderLeft: `2px solid ${familia.hex}`,
                        paddingLeft: '16px',
                      }}
                    >
                      <h2 style={{ ...NT.titulo2, margin: 0, color: 'var(--text-strong)' }}>
                        {p.titulo}
                      </h2>
                      <p style={{ ...NT.corpo, margin: 0, color: 'var(--text-muted)' }}>
                        {p.descricao}
                      </p>
                      {aberto ? (
                        <Link
                          className="nv-btn nv-btn--primario"
                          to={p.rota as string}
                          onClick={(e) => {
                            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
                              return;
                            e.preventDefault();
                            comTransicao(() => navigate(p.rota as string));
                          }}
                        >
                          Aberto
                          <span className="nv-btn__glifo" aria-hidden="true">
                            →
                          </span>
                        </Link>
                      ) : (
                        /* Tag do sistema — retângulo de fio, sem
                           preenchimento. Não é botão: não há para onde ir. */
                        <span
                          style={{
                            ...NT.etiqueta,
                            color: 'var(--text-muted)',
                            border: 'var(--fio) solid var(--tag-fio)',
                            borderRadius: 0,
                            padding: '4px 8px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Em construção
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ─── 02 · A Alexandria em números (migrado na Wave 9) ─────
              Saiu da landing e passou a viver na família a que o produto
              pertence. Só a Academy renderiza este bloco; as outras
              quatro famílias não têm nada aqui. O tamanho REAL do que já
              está aberto, derivado do catálogo — nenhum número digitado
              — contando com smoothstep ao entrar na tela. */}
          {ehAcademy && (
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
              {/* A gravura do produto — sobre o papel real do sistema
                  Alexandria, `contain` para nunca esticar, e os cantos
                  transparentes revelando o papel por baixo. Retrato do
                  outro produto: o papel viaja junto e NÃO inverte com o
                  modo, porque é citação, não superfície do Portal. */}
              <div
                style={{
                  background: ALEXANDRIA_PAPEL,
                  border: 'var(--fio) solid var(--rule)',
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={ALEXANDRIA_GRAVURA_SRC}
                  alt="Bússola, mapa do Brasil e torre de transmissão — gravura da Alexandria"
                  style={{
                    width: '100%',
                    maxWidth: '520px',
                    height: 'auto',
                    objectFit: 'contain',
                    display: 'block',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
                <span style={{ ...NT.proc, fontWeight: 500, color: 'var(--accent-house)' }}>
                  02
                </span>
                <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }}>
                  A Alexandria em números
                </span>
                <span
                  aria-hidden="true"
                  style={{ flex: 1, borderTop: 'var(--fio) solid var(--rule)', alignSelf: 'center' }}
                />
                <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>o produto aberto hoje</span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  borderTop: 'var(--fio) solid var(--rule)',
                  borderBottom: 'var(--fio) solid var(--rule)',
                }}
              >
                {ALEXANDRIA_STATS.map((st, i) => (
                  <div
                    key={st.rotulo}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                      padding: '20px 24px',
                      borderLeft: i > 0 ? 'var(--fio) solid var(--rule)' : 'none',
                    }}
                  >
                    <ContadorVivo valor={st.valor} reduzido={reduzidoPagina} />
                    <span style={{ ...NT.etiqueta, color: 'var(--text-muted)' }}>{st.rotulo}</span>
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
                    const alexandria = produtos.find((d) => d.id === 'alexandria');
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
          )}

        </div>

        <footer
          style={{
            position: 'relative',
            borderTop: 'var(--fio) solid var(--rule-strong)',
            background: 'var(--surface-sunken)',
            overflow: 'hidden',
          }}
        >
          <span aria-hidden="true" className="nivar-textura-rede" />
          <div
            style={{
              position: 'relative',
              maxWidth: MEDIDA,
              margin: '0 auto',
              padding: `24px ${RESPIRO_LATERAL}`,
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'wrap',
            }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
              <WordmarkNivar altura={17} idSufixo="familia-rodape" />
              <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }}>{familia.nome}</span>
            </span>
            <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>
              Fontes · ONS · ANEEL · CCEE · EPE
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default FamiliaPage;

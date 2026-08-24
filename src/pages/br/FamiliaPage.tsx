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

import { useEffect, useState, type CSSProperties } from 'react';
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
// A camada de profundidade por produto (Solar Proposal Validator
// Wave 2, Fase 1): substitui os dois condicionais hardcoded
// (`ehAcademy`, `ehAdvisory`) por um slot declarado em módulo próprio.
// A gravura, os contadores e a copy dos blocos migraram para lá — o
// conteúdo visível é o mesmo; o mecanismo é que mudou.
import { blocosDosProdutos } from '../../components/br/blocosFamilia';

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
  // A camada de profundidade: um bloco por produto que DECLARA o slot
  // em `blocosFamilia.tsx`, na ordem dos produtos da família. A
  // numeração de seção deriva daqui — 01 é a lista de produtos, os
  // blocos seguem em 02, 03… conforme existirem. Era este o defeito
  // que os dois condicionais hardcoded escondiam: `02` digitado em
  // dois lugares do mesmo arquivo.
  const blocos = blocosDosProdutos(produtos);

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

          {/* ─── Camada de profundidade — um bloco por produto ────────
              Declarada em `blocosFamilia.tsx`, renderizada na ordem dos
              produtos da família, com o número de seção DERIVADO da
              posição — nunca digitado. Família cujos produtos não
              declaram bloco nenhum fecha em 01 sozinho, como antes. */}
          {blocos.map((bloco, i) => {
            const numero = String(2 + i).padStart(2, '0');
            const destino = produtos.find((d) => d.id === bloco.produtoId);
            const rota = destino?.rota ?? null;
            const Antes = bloco.Antes;
            const Corpo = bloco.Corpo;
            return (
              <section
                key={bloco.produtoId}
                aria-label={bloco.ariaLabel}
                style={{
                  padding: '32px 0',
                  borderTop: 'var(--fio) solid var(--rule)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                }}
              >
                {Antes ? <Antes /> : null}

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '14px' }}>
                  <span style={{ ...NT.proc, fontWeight: 500, color: 'var(--accent-house)' }}>
                    {numero}
                  </span>
                  <span style={{ ...NT.etiqueta, color: 'var(--text-strong)' }}>
                    {bloco.titulo}
                  </span>
                  <span
                    aria-hidden="true"
                    style={{
                      flex: 1,
                      borderTop: 'var(--fio) solid var(--rule)',
                      alignSelf: 'center',
                    }}
                  />
                  <span style={{ ...NT.proc, color: 'var(--text-muted)' }}>{bloco.nota}</span>
                </div>

                {Corpo ? (
                  <Corpo produtos={produtos} reduzido={reduzidoPagina} />
                ) : (
                  <>
                    {bloco.colunas.length > 0 && (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                          borderTop: 'var(--fio) solid var(--rule)',
                          borderBottom: 'var(--fio) solid var(--rule)',
                        }}
                      >
                        {bloco.colunas.map((col, ci) => (
                          <div
                            key={col.k}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px',
                              padding: '20px 24px',
                              borderLeft: ci > 0 ? 'var(--fio) solid var(--rule)' : 'none',
                            }}
                          >
                            <span style={{ ...NT.etiqueta, color: 'var(--text-muted)' }}>
                              {col.k}
                            </span>
                            <p style={{ ...NT.corpo, margin: 0, color: 'var(--text-body)' }}>
                              {col.v}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {(bloco.ctaRotulo && rota) || bloco.ctaNota ? (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          flexWrap: 'wrap',
                        }}
                      >
                        {/* A rota vem do CATÁLOGO, nunca digitada aqui.
                            Produto sem rota não ganha link morto — só a
                            nota, se houver. */}
                        {bloco.ctaRotulo && rota ? (
                          <Link
                            className="nv-btn nv-btn--secundario"
                            to={rota}
                            onClick={(e) => {
                              if (
                                e.button !== 0 ||
                                e.metaKey ||
                                e.ctrlKey ||
                                e.shiftKey ||
                                e.altKey
                              )
                                return;
                              e.preventDefault();
                              comTransicao(() => navigate(rota));
                            }}
                          >
                            {bloco.ctaRotulo}
                            <span className="nv-btn__glifo" aria-hidden="true">
                              →
                            </span>
                          </Link>
                        ) : null}
                        {bloco.ctaNota ? (
                          <span style={{ ...NT.proc, color: 'var(--text-faint)' }}>
                            {bloco.ctaNota}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                  </>
                )}
              </section>
            );
          })}
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

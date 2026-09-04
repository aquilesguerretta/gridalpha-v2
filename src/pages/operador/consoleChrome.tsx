// src/pages/operador/consoleChrome.tsx
// ARCHITECT — Portal do Operador Wave 2, Fase 3.
//
// O chassi do console: moldura, cabeçalho, lateral por família e a área
// de trabalho. As quatro telas do console (fila, fila por produto e os
// três detalhes) montam daqui.
//
// ─── É O MESMO SISTEMA, OUTRO INSTRUMENTO ────────────────────────────
// Vocabulário NIVAR igual ao do Portal — raio zero, zero sombra, fio de
// 1px, dois modos por `data-mode`. O que muda é a ESCOLHA de componente:
// o Portal usa cartão e prosa, o console usa tabela e mono tabular. A
// leitura está em `docs/operador-recon-frontend.md` §5.2 — a deriva
// começaria se o console quisesse um raio ou uma sombra "porque é
// interno", não por ter layout próprio.
//
// Densidade maior não pede exceção de regra: o piso de 40-60 elementos
// por tela do AGENTS.md é PISO, e `.nv-tab--zebra` já é vocabulário de
// tabela longa.
//
// ─── SEM GATE, E A TELA DIZ ISSO ─────────────────────────────────────
// `PlatformUser` não tem papel (recon Wave 1 §1.3), e a CURSOR mediu
// que o gate real do backend é por env (`ADVISORY_OPERATOR_EMAIL`), que
// o frontend não conhece nem pode replicar. Esta superfície é alcançável
// por endereço digitado. A tarja de aviso não é decoração: console sem
// gate que não avisa é pior que console sem gate.
//
// Um gate por lista de e-mail no cliente foi considerado e REJEITADO na
// recon: daria a aparência da proteção sem a substância, porque a
// recusa real é do endpoint, não da tela.

import { useCallback, useState, type CSSProperties } from 'react';
import { flushSync } from 'react-dom';
import { Link, Outlet, useMatch, useNavigate } from 'react-router-dom';

import '../../design/nivar/fonts.css';
import '../../design/nivar/colors.css';
import '../../design/nivar/typography.css';
import '../../design/nivar/space.css';
import '../../design/nivar/motion.css';

import { FOLHA_PORTAL, WordmarkNivar } from '../../components/br/portalChrome';
import { EstilosTabela } from '../../components/nivar/tabela';
import { familiasComFila, nomeDoProduto, produtoComFilaPorId } from '../../lib/operador/catalogo';

export const RESPIRO_LATERAL = '32px';
const LARGURA_LATERAL = '224px';

/** Papéis tipográficos, referenciando os tokens do NIVAR — nunca
 *  literal de escala. Declarados aqui e não importados de `ContaShell`
 *  pela mesma razão que `blocosFamilia.tsx` declara os seus: componente
 *  não importa de página, e o ciclo página→componente→página é o que
 *  essa duplicação deliberada evita. */
export const CT = {
  eyebrow: {
    fontFamily: 'var(--font-data)',
    fontWeight: 500,
    fontSize: '10.5px',
    lineHeight: 1.2,
    letterSpacing: '.11em',
    textTransform: 'uppercase',
  } satisfies CSSProperties,
  etiqueta: {
    fontFamily: 'var(--font-body)',
    fontWeight: 500,
    fontSize: 'var(--ts-etiqueta)',
    lineHeight: 'var(--lh-etiqueta)' as CSSProperties['lineHeight'],
    letterSpacing: 'var(--tr-etiqueta)',
    textTransform: 'uppercase',
  } satisfies CSSProperties,
  titulo: {
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--fw-display)' as CSSProperties['fontWeight'],
    fontSize: 'var(--ts-titulo)',
    lineHeight: 'var(--lh-titulo)' as CSSProperties['lineHeight'],
    letterSpacing: 'var(--tr-titulo)',
  } satisfies CSSProperties,
  titulo2: {
    fontFamily: 'var(--font-display)',
    fontWeight: 'var(--fw-display)' as CSSProperties['fontWeight'],
    fontSize: 'var(--ts-titulo-2)',
    lineHeight: 'var(--lh-titulo-2)' as CSSProperties['lineHeight'],
    letterSpacing: 'var(--tr-titulo-2)',
  } satisfies CSSProperties,
  corpo: {
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--fw-corpo)' as CSSProperties['fontWeight'],
    fontSize: 'var(--ts-corpo)',
    lineHeight: 'var(--lh-corpo)' as CSSProperties['lineHeight'],
  } satisfies CSSProperties,
  nota: {
    fontFamily: 'var(--font-body)',
    fontWeight: 'var(--fw-corpo)' as CSSProperties['fontWeight'],
    fontSize: 'var(--ts-nota)',
    lineHeight: 'var(--lh-nota)' as CSSProperties['lineHeight'],
  } satisfies CSSProperties,
  /** Dado em mono tabular — idade, data, contagem. */
  dado: {
    fontFamily: 'var(--font-data)',
    fontWeight: 400,
    fontSize: '12px',
    lineHeight: 1.4,
    fontVariantNumeric: 'tabular-nums lining-nums',
  } satisfies CSSProperties,
} as const;

/** startViewTransition com checagem de suporte. Mesma duplicação
 *  deliberada de `blocosFamilia.tsx:78` e `DestinoCard.tsx:60` —
 *  reduced-motion pula a transição por inteiro. */
export function comTransicao(mudanca: () => void) {
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduzido && 'startViewTransition' in document) {
    document.startViewTransition(() => {
      flushSync(mudanca);
    });
  } else {
    mudanca();
  }
}

/** Regras do console que precisam de pseudo-classe — inline não alcança
 *  `:hover` nem `:focus-visible`. Mesmo idioma de `EstilosConta` e
 *  `FOLHA_PORTAL`: copiar as regras no subconjunto usado, com valores do
 *  sistema por `var()`, nunca literal de escala. */
function EstilosConsole() {
  return (
    <style>{`
      .op-nav{display:block;text-decoration:none;border:0;border-left:2px solid transparent;padding:7px 12px;transition:color var(--dur-hover) var(--ease),border-color var(--dur-hover) var(--ease),background var(--dur-hover) var(--ease)}
      .op-nav:hover{color:var(--fg-hover);background:var(--zebra)}
      .op-nav:focus-visible{outline:var(--fio-forte) solid var(--accent-focus);outline-offset:-2px}
      .op-nav--ativo{border-left-color:var(--accent-house);background:var(--zebra)}
      .op-familia{display:block;padding:0 12px 6px;border-bottom:var(--fio) solid var(--rule)}
      .op-aviso{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 10px;padding:7px ${RESPIRO_LATERAL};border-bottom:var(--fio) solid var(--rule-strong);background:var(--zebra)}
    `}</style>
  );
}

/** O chassi é ROTA DE LAYOUT, não componente que cada view monta.
 *
 *  Foi construído como componente na primeira passada da Fase 3 e o
 *  clique real derrubou: cada view montava a própria `ConsoleShell`, e
 *  como o estado de modo mora aqui, **trocar de produto voltava a tela
 *  para o modo claro**. Não aparece em código — só medindo
 *  `data-mode` depois de navegar.
 *
 *  Como layout, monta uma vez e as views trocam no `<Outlet />`: o modo
 *  sobrevive, e a lateral não repinta a cada navegação. O contexto e o
 *  produto ativo saem do PRÓPRIO endereço (`useMatch`) em vez de virem
 *  por prop — uma view não deveria precisar dizer ao shell onde ela
 *  está, isso já está na URL. */
export function ConsoleLayout() {
  const [modo, setModo] = useState<'claro' | 'noturno'>('claro');
  const navigate = useNavigate();
  const familias = familiasComFila();

  // `useParams()` num layout route não enxerga os segmentos das rotas
  // filhas — o casamento explícito é o que dá o `:produtoId` aqui.
  const dentroDeProduto = useMatch('/operador/:produtoId/*');
  const produtoAtivo = dentroDeProduto?.params.produtoId;
  const produto = produtoAtivo ? produtoComFilaPorId(produtoAtivo) : undefined;
  const contexto = produto ? nomeDoProduto(produto.produtoId) : undefined;

  const ir = useCallback(
    (destino: string) => (e: React.MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      comTransicao(() => navigate(destino));
    },
    [navigate],
  );

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
      <EstilosTabela />
      <EstilosConsole />

      <span
        aria-hidden="true"
        style={{ flexShrink: 0, height: '4px', background: 'var(--gradiente-incandescente)' }}
      />

      <header
        style={{
          flexShrink: 0,
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          padding: `0 ${RESPIRO_LATERAL}`,
          borderBottom: 'var(--fio) solid var(--rule)',
          background: 'var(--surface-page)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <Link
            to="/br"
            aria-label="NIVAR — voltar ao Portal Brasil"
            onClick={ir('/br')}
            style={{ display: 'inline-flex', textDecoration: 'none', border: 'none' }}
          >
            <WordmarkNivar altura={26} idSufixo="op-cabecalho" />
          </Link>
          <span aria-hidden="true" style={{ width: '1px', height: '14px', background: 'var(--rule)' }} />
          <Link
            to="/operador"
            onClick={ir('/operador')}
            style={{ ...CT.etiqueta, color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            Console do operador
          </Link>
          {contexto ? (
            <>
              <span aria-hidden="true" style={{ ...CT.dado, color: 'var(--rule-strong)' }}>
                /
              </span>
              <span
                style={{
                  ...CT.etiqueta,
                  color: 'var(--text-strong)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {contexto}
              </span>
            </>
          ) : null}
        </div>

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
      </header>

      {/* A ausência de verificação é declarada, não escondida. */}
      <div className="op-aviso" role="note">
        <span style={{ ...CT.eyebrow, color: 'var(--ilustrativa-fg)' }}>Sem verificação de operador</span>
        <span style={{ ...CT.nota, color: 'var(--text-muted)' }}>
          Esta superfície não checa papel de operador — a sessão da plataforma não carrega esse
          campo. O gate entra na wave de ligação, junto com o endpoint de fila.
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <nav
          aria-label="Famílias e produtos com fila"
          style={{
            flexShrink: 0,
            width: LARGURA_LATERAL,
            borderRight: 'var(--fio) solid var(--rule)',
            padding: '18px 0',
            overflowY: 'auto',
            background: 'var(--surface-page)',
          }}
        >
          <Link
            to="/operador"
            onClick={ir('/operador')}
            className={`op-nav${produtoAtivo === undefined ? ' op-nav--ativo' : ''}`}
            style={{
              ...CT.etiqueta,
              color: produtoAtivo === undefined ? 'var(--text-strong)' : 'var(--text-muted)',
              marginBottom: '18px',
            }}
          >
            Fila completa
          </Link>

          {familias.map(({ familia, produtos }) => (
            <div key={familia.id} style={{ marginBottom: '18px' }}>
              <span
                className="op-familia"
                style={{ ...CT.eyebrow, color: 'var(--text-faint)' }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    display: 'inline-block',
                    width: '6px',
                    height: '6px',
                    marginRight: '7px',
                    background: familia.token,
                    verticalAlign: 'middle',
                  }}
                />
                {familia.nome}
              </span>
              <div style={{ paddingTop: '6px' }}>
                {produtos.map(({ fila, destino }) => (
                  <Link
                    key={fila.produtoId}
                    to={`/operador/${fila.produtoId}`}
                    onClick={ir(`/operador/${fila.produtoId}`)}
                    className={`op-nav${produtoAtivo === fila.produtoId ? ' op-nav--ativo' : ''}`}
                    style={{
                      ...CT.corpo,
                      fontSize: '13px',
                      color:
                        produtoAtivo === fila.produtoId
                          ? 'var(--text-strong)'
                          : 'var(--text-body)',
                    }}
                  >
                    {destino.titulo}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          {/* Família sem fila não vira aba vazia — ela não está na lista.
              A nota explica a ausência em vez de deixá-la inexplicada. */}
          <p
            style={{
              ...CT.nota,
              fontSize: '11px',
              color: 'var(--text-faint)',
              padding: `0 12px`,
              margin: 0,
              borderTop: 'var(--fio) solid var(--rule)',
              paddingTop: '12px',
            }}
          >
            Só aparece família cujo produto recebe pedido. Hoje é Advisory. Academy, Software e
            Intelligence têm produto, mas nenhum recebe submissão; Hardware tem a prateleira vazia.
          </p>
        </nav>

        <main
          style={{
            flex: 1,
            minWidth: 0,
            overflowY: 'auto',
            padding: `24px ${RESPIRO_LATERAL} 48px`,
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

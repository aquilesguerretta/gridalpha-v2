// src/pages/operador/consoleChrome.tsx
// ARCHITECT — Portal do Operador, revisão visual pós-Wave 2.
//
// O chassi do console: masthead em tinta, faixa incandescente, lateral
// retrátil em papel com as cinco famílias, e a área de trabalho.
//
// ─── O QUE MUDOU, E POR QUÊ ──────────────────────────────────────────
// O Aquiles olhou a primeira versão e disse: "header horrível,
// hierarquia horrível, sidebar tem que ser retrátil, tudo quadrado,
// tudo preso, parece IA". Seis leitores varreram o sistema inteiro
// (skill NIVAR, guidelines, calibragem, Portal BR, Alexandria, terminal,
// e o próprio console) e convergiram num diagnóstico: o que lia como
// gerado era UNIFORMIDADE — peso igual, fio igual em tudo, rótulo em
// versalete em todo lugar, três caixas iguais, interface que se explica
// em cada seção, controle morto por toda parte. Nenhum deles disse
// "arredonde".
//
// A receita de masthead JÁ EXISTIA no sistema, na prova de calibragem
// (guidelines/calibragem-01-cor-tipografia.html:12-17): tinta, wordmark
// a 44px, subtítulo Work Sans 300 em 52ch, bloco meta à direita em mono
// com a linha-chave em intelligence, e a faixa de 4px ABAIXO — o "fio de
// 4px demarcando o topo de um documento". O console usava um quarto
// dela. Agora usa inteira.
//
// ─── A LATERAL É PAPEL, E ISSO FOI DECISÃO ───────────────────────────
// Os leitores discordaram aqui. O do NIVAR mediu que advisory e
// intelligence só leem como cor sobre tinta (1,9:1 e 1,4:1 sobre
// papel). O da Alexandria registrou que "sidebar escuro à esquerda é o
// oposto do sistema — e a regra falhou duas vezes". O crítico pediu uma
// única região de tinta por tela.
//
// A resolução: a tinta vai no MASTHEAD (onde o sistema já a põe) e a
// lateral fica em papel. As cinco famílias entram pela MARCA, em
// currentColor na cor da própria família — que é o único lugar em que a
// cor de família é permitida sobre papel (readme.md:60: "só fio, marca e
// preenchimento"), e é precedente da faixa de famílias do Portal. O nome
// fica em tinta e carrega a legibilidade; o traço carrega a identidade.
//
// ─── RECOLHER: A LARGURA SALTA, O RÓTULO SURGE ───────────────────────
// Os seis leitores concordaram: posição de layout nunca anima
// (motion.css:12-13; terminal-motion.md:64-66; .dc.html:302). Animar a
// largura faria a tabela refluir quadro a quadro — "o sistema penando".
// A largura troca por passo, o rótulo surge por opacidade (nv-surge), o
// glifo não gira. O estado vive em localStorage.
//
// ─── UMA AUSÊNCIA DECLARADA POR TELA, NUM SELO ───────────────────────
// A tarja de "sem verificação de operador" em toda tela era faixa cheia
// de brasa, e o crítico foi direto: "frase que começa com 'Esta
// superfície' é documentação, não interface". A ausência continua
// declarada — uma linha no bloco meta do masthead, em mono faint. A
// razão inteira mora em docs/operador-console-contratos.md §1.3.

import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { flushSync } from 'react-dom';
import { Link, Outlet, useMatch, useNavigate } from 'react-router-dom';

import '../../design/nivar/fonts.css';
import '../../design/nivar/colors.css';
import '../../design/nivar/typography.css';
import '../../design/nivar/space.css';
import '../../design/nivar/motion.css';

import { FOLHA_PORTAL, WordmarkNivar } from '../../components/br/portalChrome';
import { EstilosTabela } from '../../components/nivar/tabela';
import { Figura, PATRONO_DA_CASA, PATRONO_DA_FAMILIA } from '../../components/nivar/patrono';
import { familiaPorId } from '../../lib/data/br-familias';
import {
  familiasParaLateral,
  nomeDoProduto,
  produtoComFilaPorId,
  PRODUTOS_COM_FILA,
} from '../../lib/operador/catalogo';
import { pendentes } from '../../lib/operador/mock';

export const RESPIRO_LATERAL = '40px';
const LATERAL_ABERTA = '272px';
const LATERAL_RECOLHIDA = '72px';
const CHAVE_LATERAL = 'nivar.operador.lateral';

/** Papéis tipográficos do console. Três registros nítidos, como o
 *  sistema pede (tipo-pareamento.card.html): Zilla Slab 600 para
 *  título, Work Sans 300 para olho e deck, JetBrains Mono para dado e
 *  rótulo. A primeira versão do console nunca usou 600 nem 300 — e foi
 *  por isso que tudo tinha o mesmo peso. */
export const CT = {
  /** Display — Zilla 600, 32px. O título de uma tela. */
  display: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: 'var(--ts-display-3)',
    lineHeight: 'var(--lh-display-3)',
    letterSpacing: 'var(--tr-display-3)',
  } satisfies CSSProperties,
  /** Título de seção — Zilla 600, 19px. Toda seção tem NOME, não etiqueta. */
  tituloSecao: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: '19px',
    lineHeight: 1.24,
    letterSpacing: '-.006em',
  } satisfies CSSProperties,
  /** Nome de item — Zilla 500, 14px. Família na lateral, produto na linha. */
  nome: {
    fontFamily: 'var(--font-display)',
    fontWeight: 500,
    fontSize: '14px',
    lineHeight: 1.2,
    letterSpacing: '-.005em',
  } satisfies CSSProperties,
  /** Deck / olho — Work Sans 300, 19px. A linha de identidade sob um número. */
  lede: {
    fontFamily: 'var(--font-body)',
    fontWeight: 300,
    fontSize: 'var(--ts-lede)',
    lineHeight: 'var(--lh-lede)' as CSSProperties['lineHeight'],
  } satisfies CSSProperties,
  /** Corpo — Work Sans 400, 15px. */
  corpo: {
    fontFamily: 'var(--font-body)',
    fontWeight: 400,
    fontSize: 'var(--ts-corpo)',
    lineHeight: 'var(--lh-corpo)' as CSSProperties['lineHeight'],
  } satisfies CSSProperties,
  /** Corpo leve — Work Sans 300, 13,5px. Nota que acompanha, não que explica. */
  corpoLeve: {
    fontFamily: 'var(--font-body)',
    fontWeight: 300,
    fontSize: 'var(--ts-corpo-2)',
    lineHeight: 'var(--lh-corpo-2)' as CSSProperties['lineHeight'],
  } satisfies CSSProperties,
  /** Eyebrow — mono 500, 10,5px versalete. NO MÁXIMO dois papéis por tela. */
  eyebrow: {
    fontFamily: 'var(--font-data)',
    fontWeight: 500,
    fontSize: '10.5px',
    lineHeight: 1.5,
    letterSpacing: '.09em',
    textTransform: 'uppercase',
  } satisfies CSSProperties,
  /** Dado — mono 400, 12,5px tabular. */
  dado: {
    fontFamily: 'var(--font-data)',
    fontWeight: 400,
    fontSize: '12.5px',
    lineHeight: 1.4,
    fontVariantNumeric: 'tabular-nums lining-nums',
  } satisfies CSSProperties,
  /** Número-herói — mono 500, 40px, preso ao próprio sufixo. */
  heroi: {
    fontFamily: 'var(--font-data)',
    fontWeight: 500,
    fontSize: 'var(--ts-dado-1)',
    lineHeight: 'var(--lh-dado-1)',
    letterSpacing: '-.02em',
    fontVariantNumeric: 'tabular-nums lining-nums',
  } satisfies CSSProperties,
} as const;

/** startViewTransition com checagem de suporte. Mesma duplicação
 *  deliberada de `blocosFamilia.tsx:78` — componente não importa de
 *  página. Reduced-motion pula a transição. */
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

/** As regras do console que precisam de pseudo-classe ou de atributo
 *  de estado. Valores do sistema por var(), nunca literal de escala.
 *  Sem crase em comentário: isto é um template literal. */
function EstilosConsole() {
  return (
    <style>{`
      /* ─── MASTHEAD — receita da calibragem, em tinta ────────────── */
      .op-mast{display:grid;grid-template-columns:1fr auto;align-items:end;gap:32px;padding:20px ${RESPIRO_LATERAL} 16px;background:var(--surface-ink);color:var(--text-invert)}
      /* Wordmark da casa + fio vertical + NOME desta superfície em Zilla.
         O nome estava enterrado num parágrafo; a superfície precisa se
         apresentar no mesmo olhar em que a casa se apresenta. */
      .op-mast__id{display:flex;align-items:center;gap:16px}
      .op-mast__diogenes{margin-right:2px}
      .op-mast__sep{width:1px;height:26px;background:var(--fio-tinta);flex:none}
      .op-mast__nome{font-family:var(--font-display);font-weight:500;font-size:19px;line-height:1.2;letter-spacing:-.006em;color:var(--text-invert)}
      [data-mode="noturno"] .op-mast{background:var(--surface-raised)}
      .op-mast__sub{margin:9px 0 0;font-family:var(--font-body);font-weight:300;font-size:var(--ts-corpo-2);line-height:var(--lh-corpo-2);color:var(--text-invert-muted);max-width:60ch}
      .op-mast__meta{display:grid;gap:4px;justify-items:end;text-align:right;font-family:var(--font-data);font-weight:500;font-size:10.5px;line-height:1.5;letter-spacing:.09em;text-transform:uppercase;color:var(--text-invert-faint)}
      .op-mast__meta b{color:var(--intelligence);font-weight:500}
      .op-mast__meta .op-mast__n{color:var(--text-invert);font-variant-numeric:tabular-nums lining-nums}
      .op-mast .nv-modo{margin-top:6px}
      .op-mast .nv-modo__op{color:var(--text-invert-faint)}
      .op-mast .nv-modo__op:hover{color:var(--intelligence)}
      .op-mast .nv-modo__op--ativo{color:var(--text-invert);border-bottom-color:var(--intelligence)}
      .op-mast .nv-modo__sep{color:var(--fio-tinta)}
      .op-mast a{color:inherit;text-decoration:none}
      /* A faixa incandescente fecha o masthead por baixo: o topo do
         documento, como a calibragem faz. Único gradiente da tela. */
      .op-bar{height:4px;background:var(--gradiente-incandescente);flex:none}

      /* ─── CORPO — lateral de largura DISCRETA, main flui ────────── */
      .op-corpo{flex:1;display:grid;grid-template-columns:${LATERAL_ABERTA} minmax(0,1fr);min-height:0}
      [data-lateral="recolhida"] .op-corpo{grid-template-columns:${LATERAL_RECOLHIDA} minmax(0,1fr)}

      /* ─── LATERAL — papel, texto com fio, nunca caixa ───────────── */
      .op-lat{display:flex;flex-direction:column;min-height:0;overflow-y:auto;overflow-x:hidden;border-right:var(--fio) solid var(--rule-strong);background:var(--surface-page);padding:22px 0 18px}
      .op-lat__fila{display:flex;align-items:center;gap:12px;padding:8px 18px 8px 14px;margin:0 0 16px;border-left:2px solid transparent;text-decoration:none;color:var(--text-strong);transition:color var(--dur-hover) var(--ease),border-color var(--dur-hover) var(--ease)}
      .op-lat__fila:hover{color:var(--fg-hover)}
      .op-lat__fila[aria-current="page"]{border-left-color:var(--accent-house)}
      .op-lat__fam{margin:0 0 12px}
      /* Cabeça de família: marca + nome + fio que enche — o divisor com
         rótulo do sistema, com a marca no lugar do versalete. A cor da
         família entra SÓ na marca. */
      .op-lat__cab{display:grid;grid-template-columns:auto auto 1fr;align-items:center;gap:12px;padding:0 18px 0 14px;color:var(--text-strong);text-decoration:none}
      .op-lat__cab .op-lat__fio{height:var(--fio);background:var(--rule)}
      /* O patrono é o botão da família, e aparece INTEIRO sempre —
         "mostrar a todos" foi o pedido. A primeira passada apagava as
         famílias sem fila a 60% e elas viravam fantasma sobre o papel;
         o estado já está dito em texto, a figura não precisa repeti-lo. */
      .op-lat__figura{opacity:1}
      .op-lat__fam[data-estado="sem-fila"] .op-lat__cab,.op-lat__fam[data-estado="prateleira-vazia"] .op-lat__cab{color:var(--text-muted)}
      .op-lat__item{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:6px 18px 6px 70px;border-left:2px solid transparent;text-decoration:none;color:var(--text-body);font-family:var(--font-body);font-weight:400;font-size:13.5px;line-height:1.3;letter-spacing:.01em;transition:color var(--dur-hover) var(--ease),border-color var(--dur-hover) var(--ease)}
      .op-lat__item:hover{color:var(--fg-hover)}
      .op-lat__item[aria-current="page"]{color:var(--text-strong);font-weight:500;border-left-color:var(--fam)}
      .op-lat__item[data-sem-fila]{color:var(--text-faint);cursor:default}
      .op-lat__item:focus-visible,.op-lat__fila:focus-visible,.op-lat__toggle:focus-visible{outline:2px solid var(--accent-focus);outline-offset:-2px}
      .op-lat__n{font-family:var(--font-data);font-weight:400;font-size:11px;letter-spacing:.06em;color:var(--text-faint);font-variant-numeric:tabular-nums lining-nums;flex:none}
      .op-lat__vazia{display:block;padding:5px 18px 4px 70px;font-family:var(--font-data);font-weight:400;font-size:10.5px;letter-spacing:.06em;color:var(--text-faint)}
      .op-lat__toggle{margin:auto 0 0;padding:10px 18px 0 16px;background:none;border:0;border-top:var(--fio) solid var(--rule);text-align:left;font-family:var(--font-data);font-weight:400;font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:var(--text-faint);cursor:pointer;transition:color var(--dur-hover) var(--ease)}
      .op-lat__toggle:hover{color:var(--fg-hover)}

      /* Rótulo surge por opacidade quando a lateral abre. A largura já
         saltou; o que se vê chegar é o texto. */
      .op-lat__rotulo{opacity:0;animation:nv-surge var(--dur-hover) var(--ease) 60ms forwards}

      /* ─── RECOLHIDA: só as marcas, empilhadas ───────────────────── */
      [data-lateral="recolhida"] .op-lat__rotulo,[data-lateral="recolhida"] .op-lat__n,[data-lateral="recolhida"] .op-lat__fio,[data-lateral="recolhida"] .op-lat__item,[data-lateral="recolhida"] .op-lat__vazia{display:none}
      [data-lateral="recolhida"] .op-lat__fila{padding:8px 0 8px 13px;gap:0;margin-bottom:12px}
      [data-lateral="recolhida"] .op-lat__cab{grid-template-columns:auto;padding:6px 0 6px 13px;border-left:2px solid transparent}
      [data-lateral="recolhida"] .op-lat__fam{margin:0}
      [data-lateral="recolhida"] .op-lat__fam[data-ativa] .op-lat__cab{border-left-color:var(--fam)}
      [data-lateral="recolhida"] .op-lat__toggle{padding-left:0;text-align:center}

      /* ─── MAIN ─────────────────────────────────────────────────── */
      .op-main{min-width:0;min-height:0;overflow-y:auto;padding:26px ${RESPIRO_LATERAL} 64px;view-transition-name:op-painel}
      ::view-transition-old(op-painel){animation:none}
      ::view-transition-new(op-painel){animation:nivar-painel-surge var(--dur-hover) var(--ease) both}

      /* ─── TABELA no console: só divisor horizontal ──────────────
         A versão anterior somava caixa + grade vertical + zebra + thead
         sombreado + tfoot sombreado para sete linhas. O leitor do
         terminal: "tabela só com divisor horizontal". */
      .op-main .nv-tab{border:0}
      .op-main .nv-tab th+th,.op-main .nv-tab td+td{border-left:0}
      .op-main .nv-tab thead th{background:none;border-bottom:var(--fio) solid var(--rule-heavy);padding:0 12px 9px;color:var(--text-faint)}
      .op-main .nv-tab thead th:first-child,.op-main .nv-tab tbody td:first-child{padding-left:0}
      .op-main .nv-tab thead th:last-child,.op-main .nv-tab tbody td:last-child{padding-right:0}
      .op-main .nv-tab td{padding:11px 12px;border-bottom-color:var(--rule)}
      .op-main .nv-tab--zebra tbody tr:nth-child(even){background:none}
      .op-main .nv-tab th.nv-ord .nv-ord__b{padding:0 12px 9px}
      .op-main .nv-tab th.nv-ord:first-child .nv-ord__b{padding-left:0}
      .op-main .nv-tab th.nv-ord:last-child .nv-ord__b{padding-right:0}
      .op-main .nv-tab th.nv-ord.nv-num .nv-ord__b{justify-content:flex-start;gap:7px}
      .op-main .nv-tab th.nv-ord.nv-num .nv-ord__rot{flex:0 0 auto}
      /* O glifo de ordenação só aparece na coluna ativa e no hover —
         cinco setas permanentes eram ruído no cabeçalho. */
      .op-main .nv-ord__marca{opacity:0;transition:opacity var(--dur-hover) var(--ease)}
      .op-main .nv-ord--ativa .nv-ord__marca,.op-main .nv-ord__b:hover .nv-ord__marca{opacity:1}
      /* A linha em hover leva o acento do CONTEXTO (a família aberta),
         não a brasa genérica. */
      .op-main .nv-tab--hover tbody tr:hover{border-left-color:var(--acento-contexto,var(--accent-focus))}

      /* ─── FILA: coluna principal + trilho. Abaixo de 1380px o trilho
             desce para baixo da tabela — com ele ao lado, a coluna
             Cliente caía a 129px e todo nome quebrava. ─────────────── */
      .op-fila{display:grid;grid-template-columns:minmax(0,1fr) 232px;gap:0 48px;align-items:start;max-width:1240px}
      .op-fila__trilho{padding-top:8px}
      @media (max-width:1380px){
        .op-fila{grid-template-columns:minmax(0,1fr);gap:32px 0}
        .op-fila__trilho{padding-top:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 40px;align-items:start}
        .op-fila__trilho>p:first-child{grid-column:1 / -1}
      }

      /* ─── CABEÇALHO DE SEÇÃO — número · título · fio · nota ─────
         verbatim de structure.css, o fio a -4px para sentar no meio
         óptico da altura-x. */
      .op-sech{display:grid;grid-template-columns:auto auto 1fr auto;align-items:baseline;gap:14px;margin:0 0 14px}
      .op-sech__n{font-family:var(--font-data);font-weight:500;font-size:13px;line-height:1.2;font-variant-numeric:tabular-nums lining-nums;color:var(--acento-contexto,var(--accent-house))}
      .op-sech__t{font-family:var(--font-display);font-weight:600;font-size:19px;line-height:1.24;letter-spacing:-.006em;color:var(--text-strong);margin:0}
      .op-sech__fio{height:1px;background:var(--rule);transform:translateY(-4px)}
      .op-sech__nota{font-family:var(--font-data);font-weight:500;font-size:10.5px;line-height:1.5;letter-spacing:.09em;text-transform:uppercase;color:var(--text-faint);text-align:right;max-width:44ch;margin:0}

      /* ─── CAMPO INERTE — linha de base, não caixa ───────────────── */
      .op-campo{display:flex;align-items:baseline;justify-content:space-between;gap:10px;padding:6px 0 5px;border-bottom:var(--fio) solid var(--rule-strong);color:var(--text-faint);font-family:var(--font-body);font-weight:300;font-size:13.5px;line-height:1.4}
      .op-campo--longo{min-height:calc(var(--linhas,4) * 22px);align-items:flex-start}

      @media (prefers-reduced-motion: reduce){
        .op-lat__rotulo{animation:none;opacity:1}
      }
    `}</style>
  );
}

function lerLateral(): 'aberta' | 'recolhida' {
  try {
    return window.localStorage.getItem(CHAVE_LATERAL) === 'recolhida' ? 'recolhida' : 'aberta';
  } catch {
    return 'aberta';
  }
}

export function ConsoleLayout() {
  const [modo, setModo] = useState<'claro' | 'noturno'>('claro');
  const [lateral, setLateral] = useState<'aberta' | 'recolhida'>(lerLateral);
  const navigate = useNavigate();

  // Primeiro paint — o wordmark se escreve (peça "energização" do
  // especimen de movimento, já em produção no Portal). Só uma vez: a
  // troca de modo nunca redispara.
  const [bootando, setBootando] = useState(
    () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    if (!bootando) return;
    const t = window.setTimeout(() => setBootando(false), 1500);
    return () => window.clearTimeout(t);
  }, [bootando]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CHAVE_LATERAL, lateral);
    } catch {
      /* sem storage: fica só na sessão */
    }
  }, [lateral]);

  const dentroDeProduto = useMatch('/operador/:produtoId/*');
  const produtoAtivo = dentroDeProduto?.params.produtoId;
  const produto = produtoAtivo ? produtoComFilaPorId(produtoAtivo) : undefined;
  const familiaAtiva = produto ? familiaPorId(produto.familiaId) : undefined;
  const contexto = produto ? nomeDoProduto(produto.produtoId) : undefined;
  const familias = familiasParaLateral();
  const totalPendentes = pendentes();

  const ir = useCallback(
    (destino: string) => (e: React.MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      comTransicao(() => navigate(destino));
    },
    [navigate],
  );

  const recolhida = lateral === 'recolhida';

  return (
    <div
      lang="pt-BR"
      data-nv-page=""
      data-mode={modo === 'noturno' ? 'noturno' : undefined}
      data-lateral={lateral}
      className={bootando ? 'nivar-boot' : undefined}
      style={
        {
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background: 'var(--surface-page)',
          color: 'var(--text-body)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--ts-corpo)',
          lineHeight: 'var(--lh-corpo)',
          // A família aberta é o acento da tela inteira — um só, vindo
          // do ancestral (--acento-contexto, readme.md).
          '--acento-contexto': familiaAtiva?.token ?? 'var(--accent-house)',
        } as CSSProperties
      }
    >
      <style>{FOLHA_PORTAL}</style>
      <EstilosTabela />
      <EstilosConsole />

      <header className="op-mast">
        <div>
          <div className="op-mast__id">
            <Link to="/br" aria-label="NIVAR — voltar ao Portal Brasil" onClick={ir('/br')} style={{ display: 'inline-flex', alignItems: 'center', gap: '14px' }}>
              <Figura patrono={PATRONO_DA_CASA} tamanho={52} decorativo className="op-mast__diogenes" />
              <WordmarkNivar altura={34} idSufixo="op-mast" />
            </Link>
            <span className="op-mast__sep" aria-hidden="true" />
            <span className="op-mast__nome">Console do operador</span>
          </div>
          <p className="op-mast__sub">
            Os pedidos que chegam dos produtos com fila, lidos por uma pessoa. A idade de cada um é
            tempo decorrido, nunca prazo.
          </p>
        </div>
        <div className="op-mast__meta">
          <b>{contexto ?? 'Fila completa'}</b>
          <span>
            {familiaAtiva ? `${familiaAtiva.nome} · ` : 'Advisory · '}
            {PRODUTOS_COM_FILA.length} produtos com fila
          </span>
          <span>
            <span className="op-mast__n">{totalPendentes}</span> aguardando leitura
          </span>
          {/* A ausência, declarada UMA vez — em vez de faixa cheia em
              toda tela. */}
          <span>Amostra ilustrativa · sem verificação de operador</span>
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
      <div className="op-bar" aria-hidden="true" />

      <div className="op-corpo">
        <nav className="op-lat" aria-label="Famílias e produtos">
          <Link
            to="/operador"
            className="op-lat__fila"
            aria-current={produtoAtivo === undefined ? 'page' : undefined}
            onClick={ir('/operador')}
            title={recolhida ? 'Fila completa' : undefined}
          >
            <Figura patrono={PATRONO_DA_CASA} tamanho={44} decorativo className="op-lat__figura" />
            <span className="op-lat__rotulo" style={{ ...CT.nome, flex: 1 }}>
              Fila completa
            </span>
            {totalPendentes > 0 ? <span className="op-lat__n">{totalPendentes}</span> : null}
          </Link>

          {familias.map(({ familia, estado, produtos }) => {
            const ativa = familiaAtiva?.id === familia.id;
            // Recolhida, a marca é o link: leva ao primeiro produto com
            // fila da família, ou a lugar nenhum se ela não tem fila.
            const primeiroComFila = produtos.find((p) => p.fila)?.destino.id;
            const alvoRecolhida = primeiroComFila ? `/operador/${primeiroComFila}` : undefined;
            const cabeca = (
              <>
                <Figura
                  patrono={PATRONO_DA_FAMILIA[familia.id]}
                  tamanho={44}
                  decorativo={!recolhida}
                  className="op-lat__figura"
                />
                <span className="op-lat__rotulo" style={CT.nome}>
                  {familia.nome}
                </span>
                <span className="op-lat__fio" aria-hidden="true" />
              </>
            );
            return (
              <section
                key={familia.id}
                className="op-lat__fam"
                data-estado={estado}
                data-ativa={ativa ? '' : undefined}
                style={{ '--fam': familia.token } as CSSProperties}
                aria-label={familia.nome}
              >
                {recolhida && alvoRecolhida ? (
                  <Link className="op-lat__cab" to={alvoRecolhida} onClick={ir(alvoRecolhida)} title={familia.nome}>
                    {cabeca}
                  </Link>
                ) : (
                  <div className="op-lat__cab" title={recolhida ? `${familia.nome} · sem fila` : undefined}>
                    {cabeca}
                  </div>
                )}

                {estado === 'prateleira-vazia' ? (
                  <span className="op-lat__vazia">prateleira vazia</span>
                ) : (
                  produtos.map(({ destino, fila }) =>
                    fila ? (
                      <Link
                        key={destino.id}
                        to={`/operador/${destino.id}`}
                        className="op-lat__item"
                        aria-current={produtoAtivo === destino.id ? 'page' : undefined}
                        onClick={ir(`/operador/${destino.id}`)}
                      >
                        <span className="op-lat__rotulo">{destino.titulo}</span>
                        {pendentes(destino.id) > 0 ? (
                          <span className="op-lat__n">{pendentes(destino.id)}</span>
                        ) : null}
                      </Link>
                    ) : (
                      <span key={destino.id} className="op-lat__item" data-sem-fila="" title="Este produto não recebe pedido">
                        <span className="op-lat__rotulo">{destino.titulo}</span>
                        <span className="op-lat__n">sem fila</span>
                      </span>
                    ),
                  )
                )}
              </section>
            );
          })}

          <button
            type="button"
            className="op-lat__toggle"
            onClick={() => setLateral(recolhida ? 'aberta' : 'recolhida')}
            aria-expanded={!recolhida}
            aria-label={recolhida ? 'Expandir a lateral' : 'Recolher a lateral'}
          >
            {recolhida ? '→' : '← recolher'}
          </button>
        </nav>

        <main className="op-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

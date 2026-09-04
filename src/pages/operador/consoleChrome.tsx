// src/pages/operador/consoleChrome.tsx
// ARCHITECT — Portal do Operador, revisão visual pós-Wave 2.
//
// O chassi do console: masthead em tinta, faixa incandescente, lateral
// retrátil em papel com os seis patronos, e a área de trabalho.
//
// ─── O QUE MUDOU, E POR QUÊ ──────────────────────────────────────────
// O Aquiles olhou a primeira versão e disse: "header horrível,
// hierarquia horrível, sidebar tem que ser retrátil, tudo quadrado,
// tudo preso, parece IA". Seis leitores varreram o sistema inteiro e
// convergiram num diagnóstico: o que lia como gerado era UNIFORMIDADE —
// peso igual, fio igual em tudo, rótulo em versalete em todo lugar,
// três caixas iguais, interface que se explica em cada seção, controle
// morto por toda parte. Nenhum deles disse "arredonde".
//
// Depois, quatro revisores com lentes distintas (diretor de arte,
// tipógrafo, cor e material, operador) olharam as capturas REAIS e cada
// achado passou por refutadores. O que sobreviveu e entrou aqui:
//
//  · A INTERFACE NARRAVA A SI MESMA em nove lugares por tela. Saiu: o
//    subtítulo-doutrina do masthead, o deck do herói, a prosa do
//    trilho, a rota de API no pé do parecer. Ficou só o que AFIRMA.
//  · OS NÚMEROS SE CONTRADIZIAM: "6 aguardando" no masthead a 90px de
//    "4 aguardam" no herói. Um nome por contagem, sempre: "na fila" (7),
//    "por ler" (6 = aguardando + sem estado), "aguardando" (4).
//  · NUMERAL DE SEÇÃO EM AMARELO SOBRE PAPEL (1,9:1) — o erro que o
//    próprio readme chama de número um. Numeral em --accent-house.
//  · OITO PAPÉIS DE CAIXA ALTA por tela; o teto é dois. Ficou: th da
//    tabela e o eyebrow acima do h1. O resto desceu para caixa baixa.
//  · NÉVOA DE ESCALA: sete tamanhos entre 10,5 e 15px. Três degraus e
//    nenhum outro: 11 (etiqueta), 13 (mono de dado), 15 (sans).
//  · O toggle de tema ocupava a posição terminal do masthead. Foi para
//    o pé da lateral, ao lado de "recolher" — preferência não é meta.
//
// A receita de masthead é a da prova de calibragem do sistema
// (guidelines/calibragem-01-cor-tipografia.html:12-17): tinta, wordmark
// a 40px, uma linha Work Sans 300 embaixo, bloco meta à direita em mono
// com a linha-chave em intelligence, e a faixa de 4px ABAIXO — o fio de
// 4px demarcando o topo de um documento.
//
// ─── A LATERAL É PAPEL, COM OS PATRONOS COMO BOTÃO ───────────────────
// A tinta vai no masthead (onde o sistema já a põe) e a lateral fica em
// papel — "sidebar escuro à esquerda é o oposto do sistema, e a regra
// falhou duas vezes" (registro da Alexandria). As famílias entram pelos
// PATRONOS que o Aquiles desenhou, inteiros, sempre — o pedido foi
// "mostrar a todos". Família sem fila é UMA linha: patrono, nome, fio,
// "sem fila". A família viva domina por massa, não por cor.
//
// ─── RECOLHER: A LARGURA SALTA, O RÓTULO SURGE ───────────────────────
// Posição de layout nunca anima (motion.css; terminal-motion.md;
// especimen .dc.html). A largura troca por passo, o rótulo surge por
// opacidade, o glifo não gira. O estado vive em localStorage.

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
import { familiasParaLateral, nomeDoProduto, produtoComFilaPorId, PRODUTOS_COM_FILA } from '../../lib/operador/catalogo';
import { FILA_MOCK, pendentes } from '../../lib/operador/mock';

export const RESPIRO_LATERAL = '40px';
const LATERAL_ABERTA = '288px';
const LATERAL_RECOLHIDA = '72px';
const CHAVE_LATERAL = 'nivar.operador.lateral';

/** Papéis tipográficos do console — três registros nítidos (Zilla 600
 *  para título, Work Sans 300/400 para olho e corpo, JetBrains Mono para
 *  dado e etiqueta) e, abaixo do lede, TRÊS degraus e nenhum outro:
 *  11px etiqueta em caixa alta, 13px mono de dado, 15px sans. A névoa de
 *  sete tamanhos entre 10,5 e 15 era o que fazia tudo abaixo do título
 *  ler como "texto pequeno" indistinto. */
export const CT = {
  /** Display — Zilla 600, 32px. O título de uma tela. */
  display: {
    fontFamily: 'var(--font-display)',
    fontWeight: 600,
    fontSize: 'var(--ts-display-3)',
    lineHeight: 'var(--lh-display-3)',
    letterSpacing: 'var(--tr-display-3)',
  } satisfies CSSProperties,
  /** Nome — Zilla 500, 15px. Família e "Fila completa" na lateral. */
  nome: {
    fontFamily: 'var(--font-display)',
    fontWeight: 500,
    fontSize: '15px',
    lineHeight: 1.2,
    letterSpacing: '-.005em',
  } satisfies CSSProperties,
  /** Lede — Work Sans 300, 19px. */
  lede: {
    fontFamily: 'var(--font-body)',
    fontWeight: 300,
    fontSize: 'var(--ts-lede)',
    lineHeight: 1.4,
  } satisfies CSSProperties,
  /** Corpo — Work Sans 400, 15px. */
  corpo: {
    fontFamily: 'var(--font-body)',
    fontWeight: 400,
    fontSize: '15px',
    lineHeight: 1.45,
  } satisfies CSSProperties,
  /** Corpo leve — Work Sans 300, 15px. Nota que acompanha, não que explica. */
  corpoLeve: {
    fontFamily: 'var(--font-body)',
    fontWeight: 300,
    fontSize: '15px',
    lineHeight: 1.45,
  } satisfies CSSProperties,
  /** Etiqueta — mono 500, 11px caixa alta. EXATAMENTE dois papéis por
   *  tela: o th da tabela e o eyebrow acima do h1. */
  eyebrow: {
    fontFamily: 'var(--font-data)',
    fontWeight: 500,
    fontSize: '11px',
    lineHeight: 1.5,
    letterSpacing: '.12em',
    textTransform: 'uppercase',
  } satisfies CSSProperties,
  /** Dado — mono 400, 13px tabular, caixa baixa. Data, idade, id,
   *  contagem, unidade, estado. */
  dado: {
    fontFamily: 'var(--font-data)',
    fontWeight: 400,
    fontSize: '13px',
    lineHeight: 1.4,
    letterSpacing: '.01em',
    fontVariantNumeric: 'tabular-nums lining-nums',
  } satisfies CSSProperties,
  /** Número-herói — mono 500, 40px, preso ao próprio rótulo. */
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
 *  deliberada de blocosFamilia.tsx — componente não importa de página. */
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
 *  de estado. Valores do sistema por var(). Sem crase em comentário:
 *  isto é um template literal. */
function EstilosConsole() {
  return (
    <style>{`
      /* ─── MASTHEAD — receita da calibragem, em tinta ────────────── */
      .op-mast{display:grid;grid-template-columns:1fr auto;align-items:end;gap:32px;padding:22px ${RESPIRO_LATERAL} 18px;background:var(--surface-ink);color:var(--text-invert)}
      /* No noturno o masthead sobe DOIS degraus (tinta-4), nao um: com
         tinta-2 ele media 1,07:1 contra o chao e perdia a ancora que
         tem no claro. tinta-4 e primitivo ja declarado no sistema. */
      [data-mode="noturno"] .op-mast{background:var(--tinta-4)}
      .op-mast__id{display:inline-flex;align-items:center;gap:14px}
      .op-mast__sub{margin:8px 0 0;font-family:var(--font-body);font-weight:300;font-size:15px;line-height:1.4;color:var(--text-invert-muted)}
      .op-mast__meta{display:grid;gap:3px;justify-items:end;text-align:right;font-family:var(--font-data);font-weight:400;font-size:13px;line-height:1.45;letter-spacing:.01em;color:var(--text-invert-faint);font-variant-numeric:tabular-nums lining-nums}
      .op-mast__meta b{color:var(--intelligence);font-weight:500}
      .op-mast__meta .op-mast__n{color:var(--text-invert);font-weight:500}
      .op-mast a{color:inherit;text-decoration:none}
      /* A faixa incandescente fecha o masthead por baixo: o topo do
         documento, como a calibragem faz. Unico gradiente da tela. */
      .op-bar{height:4px;background:var(--gradiente-incandescente);flex:none}

      /* ─── CORPO — lateral de largura DISCRETA, main flui ────────── */
      .op-corpo{flex:1;display:grid;grid-template-columns:${LATERAL_ABERTA} minmax(0,1fr);min-height:0}
      [data-lateral="recolhida"] .op-corpo{grid-template-columns:${LATERAL_RECOLHIDA} minmax(0,1fr)}

      /* ─── LATERAL — papel com trama hairline, texto com fio ─────── */
      .op-lat{position:relative;display:flex;flex-direction:column;min-height:0;overflow:hidden;border-right:var(--fio) solid var(--rule-strong);background:var(--surface-page)}
      /* Material em vez de tom: a lateral media 1,00:1 contra a pagina
         e so o fio a desenhava. A malha hairline do sistema (5%) da
         materialidade sem escurecer nada. */
      .op-lat__trama{position:absolute;inset:0;opacity:.05;pointer-events:none;z-index:0}
      .op-lat__rolo{position:relative;z-index:1;flex:1;min-height:0;overflow-y:auto;overflow-x:hidden;padding:28px 0 12px}
      .op-lat__fila{display:flex;align-items:center;gap:12px;height:48px;padding:0 18px 0 14px;margin:0 0 12px;border-left:2px solid transparent;text-decoration:none;color:var(--text-strong);transition:color var(--dur-hover) var(--ease),border-color var(--dur-hover) var(--ease)}
      .op-lat__fila:hover{color:var(--fg-hover)}
      .op-lat__fila[aria-current="page"]{border-left-color:var(--accent-house)}
      .op-lat__fam{margin:0 0 8px}
      /* Cabeca de familia: patrono + nome + fio + (sem fila). 48px de
         altura sempre; familia sem fila e SO esta linha. */
      .op-lat__cab{display:grid;grid-template-columns:auto auto 1fr auto;align-items:center;gap:12px;height:48px;padding:0 18px 0 14px;color:var(--text-strong);text-decoration:none;border-left:2px solid transparent}
      .op-lat__cab .op-lat__fio{height:var(--fio);background:var(--rule)}
      .op-lat__fam[data-estado="sem-fila"] .op-lat__cab,.op-lat__fam[data-estado="prateleira-vazia"] .op-lat__cab{color:var(--text-muted)}
      .op-lat__item{display:flex;align-items:baseline;justify-content:space-between;gap:10px;height:32px;padding:0 18px 0 64px;border-left:2px solid transparent;text-decoration:none;color:var(--text-body);font-family:var(--font-body);font-weight:400;font-size:15px;line-height:32px;transition:color var(--dur-hover) var(--ease),border-color var(--dur-hover) var(--ease)}
      .op-lat__item:hover{color:var(--fg-hover)}
      .op-lat__item[aria-current="page"]{color:var(--text-strong);font-weight:500;border-left-color:var(--fam)}
      .op-lat__item:focus-visible,.op-lat__fila:focus-visible,.op-lat__cab:focus-visible,.op-lat__toggle:focus-visible{outline:2px solid var(--accent-focus);outline-offset:-2px}
      .op-lat__n{font-family:var(--font-data);font-weight:400;font-size:13px;letter-spacing:.01em;color:var(--text-faint);font-variant-numeric:tabular-nums lining-nums;flex:none;white-space:nowrap}
      /* Pe da lateral: recolher a esquerda, tema a direita, na mesma
         baseline — preferencia mora aqui, nao no masthead. */
      .op-lat__pe{position:relative;z-index:1;flex:none;display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:12px 18px 14px 16px;border-top:var(--fio) solid var(--rule)}
      .op-lat__toggle{background:none;border:0;padding:0;font-family:var(--font-data);font-weight:400;font-size:13px;letter-spacing:.01em;color:var(--text-faint);cursor:pointer;transition:color var(--dur-hover) var(--ease)}
      .op-lat__toggle:hover{color:var(--fg-hover)}
      .op-lat__pe .nv-modo__op{text-transform:none;letter-spacing:.01em;font-size:13px;font-weight:400}
      .op-lat__pe .nv-modo__op--ativo{font-weight:500}
      .op-lat__pe .nv-modo__sep{font-size:13px}

      /* Rotulo surge por opacidade quando a lateral abre. A largura ja
         saltou; o que se ve chegar e o texto. */
      .op-lat__rotulo{opacity:0;animation:nv-surge var(--dur-hover) var(--ease) 60ms forwards}
      /* Nome nunca quebra nem sobrepoe o item de baixo: uma linha, reticencias. */
      .op-lat__item .op-lat__rotulo{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}

      /* ─── RECOLHIDA: so os patronos, empilhados ─────────────────── */
      [data-lateral="recolhida"] .op-lat__rotulo,[data-lateral="recolhida"] .op-lat__fio,[data-lateral="recolhida"] .op-lat__item,[data-lateral="recolhida"] .op-lat__cab .op-lat__n,[data-lateral="recolhida"] .op-lat__pe .nv-modo{display:none}
      [data-lateral="recolhida"] .op-lat__fila{display:grid;grid-template-columns:auto;justify-items:center;gap:2px;height:auto;padding:6px 0 4px 13px;margin-bottom:8px}
      [data-lateral="recolhida"] .op-lat__fila .op-lat__n{font-size:10px}
      [data-lateral="recolhida"] .op-lat__cab{grid-template-columns:auto;padding:0 0 0 13px}
      [data-lateral="recolhida"] .op-lat__fam{margin:0 0 4px}
      [data-lateral="recolhida"] .op-lat__fam[data-ativa] .op-lat__cab{border-left-color:var(--fam)}
      [data-lateral="recolhida"] .op-lat__pe{justify-content:center;padding-left:0;padding-right:0}

      /* ─── MAIN ─────────────────────────────────────────────────── */
      .op-main{min-width:0;min-height:0;overflow-y:auto;padding:28px ${RESPIRO_LATERAL} 64px;view-transition-name:op-painel}
      ::view-transition-old(op-painel){animation:none}
      ::view-transition-new(op-painel){animation:nivar-painel-surge var(--dur-hover) var(--ease) both}

      /* Pagina = coluna principal + trilho de 232px, SEM max-width: a
         borda direita do trilho coincide com a do bloco meta do
         masthead em qualquer viewport — uma regua direita so. */
      .op-pagina{display:grid;grid-template-columns:minmax(0,1fr) 232px;gap:0 48px;align-items:start}
      .op-trilho{padding-top:6px}
      @media (max-width:1380px){
        .op-pagina{grid-template-columns:minmax(0,1fr);gap:32px 0}
        .op-trilho{padding-top:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 40px;align-items:start}
        .op-trilho>p:first-child{grid-column:1 / -1}
      }

      /* ─── TABELA no console: so divisor horizontal ─────────────── */
      .op-main .nv-tab{border:0;max-width:1120px}
      .op-main .nv-tab th+th,.op-main .nv-tab td+td{border-left:0}
      .op-main .nv-tab thead th{background:none;border-bottom:var(--fio) solid var(--rule-heavy);padding:0 12px 9px;font-size:11px;letter-spacing:.12em;color:var(--text-faint)}
      .op-main .nv-tab thead th:first-child,.op-main .nv-tab tbody td:first-child{padding-left:0}
      .op-main .nv-tab thead th:last-child,.op-main .nv-tab tbody td:last-child{padding-right:0}
      .op-main .nv-tab td{height:40px;padding:0 12px;border-bottom-color:var(--rule);vertical-align:baseline;font-size:15px}
      .op-main .nv-tab td.nv-num{font-size:13px}
      .op-main .nv-tab--zebra tbody tr:nth-child(even){background:none}
      .op-main .nv-tab th.nv-ord .nv-ord__b{padding:0 12px 9px;font-size:11px;letter-spacing:.12em}
      .op-main .nv-tab th.nv-ord:first-child .nv-ord__b{padding-left:0}
      .op-main .nv-tab th.nv-ord:last-child .nv-ord__b{padding-right:0}
      .op-main .nv-tab th.nv-ord.nv-num .nv-ord__b{justify-content:flex-start;gap:7px}
      .op-main .nv-tab th.nv-ord.nv-num .nv-ord__rot{flex:0 0 auto}
      .op-main .nv-ord__marca{opacity:0;transition:opacity var(--dur-hover) var(--ease)}
      .op-main .nv-ord--ativa .nv-ord__marca,.op-main .nv-ord__b:hover .nv-ord__marca{opacity:1}
      .op-main .nv-tab--hover tbody tr:hover{border-left-color:var(--acento-contexto,var(--accent-focus))}
      /* O nome do cliente e link sem sublinhado em repouso — a linha
         inteira e o alvo; sete sublinhados mais fortes que sete
         divisores eram catorze fios para sete registros. */
      .op-main .nv-tab a.op-cliente{color:var(--text-strong);text-decoration:none;border-bottom:1px solid transparent;transition:border-color var(--dur-hover) var(--ease),color var(--dur-hover) var(--ease)}
      .op-main .nv-tab tbody tr:hover a.op-cliente{border-bottom-color:var(--fio-hover);color:var(--fg-hover)}

      /* ─── CABECALHO DE SECAO — numero · titulo · fio · nota ─────
         O numeral em --accent-house: brasa sobre papel (8,7:1),
         intelligence sobre tinta no noturno. Nunca a cor da familia
         como TEXTO — 1,9:1, o erro numero um do sistema. */
      .op-sech{display:grid;grid-template-columns:auto auto 1fr auto;align-items:baseline;gap:14px;margin:0 0 14px}
      .op-sech__n{font-family:var(--font-data);font-weight:500;font-size:13px;line-height:1.2;font-variant-numeric:tabular-nums lining-nums;color:var(--accent-house)}
      .op-sech__t{font-family:var(--font-display);font-weight:600;font-size:19px;line-height:1.24;letter-spacing:-.006em;color:var(--text-strong);margin:0}
      .op-sech--grande .op-sech__t{font-size:24px;line-height:1.16;letter-spacing:-.01em}
      .op-sech__fio{height:1px;background:var(--rule);transform:translateY(-4px)}
      .op-sech__nota{font-family:var(--font-data);font-weight:400;font-size:13px;line-height:1.4;letter-spacing:.01em;color:var(--text-faint);text-align:right;white-space:nowrap;margin:0;font-variant-numeric:tabular-nums lining-nums}

      /* ─── CAMPO INERTE — linha de base, nao caixa ───────────────── */
      .op-campo{display:flex;align-items:baseline;justify-content:space-between;gap:10px;height:32px;line-height:32px;border-bottom:var(--fio) solid var(--rule-strong);color:var(--text-faint);font-family:var(--font-body);font-weight:300;font-size:15px}
      /* Linha rotulada: rotulo + campo apoiados no MESMO fio, altura
         fixa de 32 — o passo era desigual (29/33) por causa da unidade. */
      .op-linha{display:grid;grid-template-columns:max-content minmax(0,1fr);gap:0 20px;align-items:baseline;height:32px;line-height:32px;border-bottom:var(--fio) solid var(--rule)}
      .op-linha__rot{font-family:var(--font-body);font-weight:400;font-size:15px;color:var(--text-muted);white-space:nowrap}
      .op-linha__v{display:flex;align-items:baseline;justify-content:space-between;gap:10px;font-family:var(--font-body);font-weight:400;font-size:15px;color:var(--text-body);min-width:0}
      .op-linha__v--vazio{color:var(--text-faint);font-weight:300}
      .op-linha__un{font-family:var(--font-data);font-size:13px;color:var(--text-faint);flex:none}
      /* Bloco pautado — o lugar do parecer: hairlines a cada 24px e nada
         escrito. Placeholder-frase no lugar do bloco era o slop mais
         literal da tela. */
      .op-pautado{height:calc(var(--linhas,6) * 24px);background-image:repeating-linear-gradient(to bottom,transparent 0 23px,var(--rule) 23px 24px)}

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
  // especimen de movimento, já em produção no Portal). Só uma vez.
  const [bootando, setBootando] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
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
  // Um nome por contagem: "na fila" é tudo; "por ler" é o que ainda não
  // foi entregue (aguardando + sem estado). "Aguardando" só nomeia os
  // que têm o estado submitted — e isso vive na fila, não aqui.
  const naFila = FILA_MOCK.length;
  const porLer = pendentes();

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
          fontSize: '15px',
          lineHeight: 1.45,
          // A família aberta é o acento da tela — SÓ em fio de 2px,
          // nunca em texto.
          '--acento-contexto': familiaAtiva?.token ?? 'var(--accent-house)',
        } as CSSProperties
      }
    >
      <style>{FOLHA_PORTAL}</style>
      <EstilosTabela />
      <EstilosConsole />

      <header className="op-mast">
        <div>
          <Link to="/br" aria-label="NIVAR — voltar ao Portal Brasil" onClick={ir('/br')} className="op-mast__id">
            <Figura patrono={PATRONO_DA_CASA} tamanho={52} decorativo />
            <WordmarkNivar altura={40} idSufixo="op-mast" />
          </Link>
          <p className="op-mast__sub">Console do operador</p>
        </div>
        <div className="op-mast__meta">
          <b>{contexto ?? 'Fila completa'}</b>
          <span>
            {familiaAtiva ? familiaAtiva.nome : 'Advisory'} · {PRODUTOS_COM_FILA.length} produtos com fila
          </span>
          <span>
            <span className="op-mast__n">{naFila}</span> na fila · <span className="op-mast__n">{porLer}</span> por ler
          </span>
          {/* A ausência, declarada UMA vez por tela. */}
          <span>amostra ilustrativa · sem verificação de operador</span>
        </div>
      </header>
      <div className="op-bar" aria-hidden="true" />

      <div className="op-corpo">
        <nav className="op-lat" aria-label="Famílias e produtos">
          <span className="op-lat__trama nivar-textura-rede" aria-hidden="true" />
          <div className="op-lat__rolo">
            <Link
              to="/operador"
              className="op-lat__fila"
              aria-current={produtoAtivo === undefined ? 'page' : undefined}
              onClick={ir('/operador')}
              title={recolhida ? `Fila completa · ${porLer} por ler` : undefined}
            >
              <Figura patrono={PATRONO_DA_CASA} tamanho={44} decorativo />
              <span className="op-lat__rotulo" style={{ ...CT.nome, flex: 1 }}>
                Fila completa
              </span>
              {porLer > 0 ? (
                <span className="op-lat__n" aria-label={`${porLer} por ler`}>
                  {porLer}
                </span>
              ) : null}
            </Link>

            {familias.map(({ familia, estado, produtos }) => {
              const ativa = familiaAtiva?.id === familia.id;
              const comFila = estado === 'com-fila';
              const primeiroComFila = produtos.find((p) => p.fila)?.destino.id;
              const alvo = primeiroComFila ? `/operador/${primeiroComFila}` : undefined;
              const cabeca = (
                <>
                  <Figura patrono={PATRONO_DA_FAMILIA[familia.id]} tamanho={44} decorativo={!recolhida} />
                  <span className="op-lat__rotulo" style={CT.nome}>
                    {familia.nome}
                  </span>
                  <span className="op-lat__fio" aria-hidden="true" />
                  {/* Uma palavra só para ausência, no slot da contagem. */}
                  {comFila ? <span /> : <span className="op-lat__n">sem fila</span>}
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
                  {recolhida && alvo ? (
                    <Link className="op-lat__cab" to={alvo} onClick={ir(alvo)} title={familia.nome}>
                      {cabeca}
                    </Link>
                  ) : (
                    <div className="op-lat__cab" title={recolhida ? `${familia.nome} · sem fila` : undefined}>
                      {cabeca}
                    </div>
                  )}
                  {comFila
                    ? produtos
                        .filter((p) => p.fila)
                        .map(({ destino }) => (
                          <Link
                            key={destino.id}
                            to={`/operador/${destino.id}`}
                            className="op-lat__item"
                            aria-current={produtoAtivo === destino.id ? 'page' : undefined}
                            onClick={ir(`/operador/${destino.id}`)}
                          >
                            <span className="op-lat__rotulo">{destino.titulo}</span>
                            {pendentes(destino.id) > 0 ? (
                              <span className="op-lat__n" aria-label={`${pendentes(destino.id)} por ler`}>
                                {pendentes(destino.id)}
                              </span>
                            ) : null}
                          </Link>
                        ))
                    : null}
                </section>
              );
            })}
          </div>

          <div className="op-lat__pe">
            <button
              type="button"
              className="op-lat__toggle"
              onClick={() => setLateral(recolhida ? 'aberta' : 'recolhida')}
              aria-expanded={!recolhida}
              aria-label={recolhida ? 'Expandir a lateral' : 'Recolher a lateral'}
            >
              {recolhida ? '→' : '← recolher'}
            </button>
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
        </nav>

        <main className="op-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

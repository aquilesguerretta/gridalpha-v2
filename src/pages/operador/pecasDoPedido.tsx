// pecasDoPedido — ARCHITECT, Portal do Operador, revisão visual pós-Wave 2.
//
// As peças que as três telas de detalhe compartilham: o cabeçalho do
// caso em três registros, o cabeçalho de seção do sistema, a linha de
// leitura, o campo inerte como linha de base, e o lugar do documento.
//
// ─── O QUE SAIU, E POR QUÊ ───────────────────────────────────────────
// · A nota "inerte nesta wave" repetida cinco vezes por tela. A
//   ausência agora se declara UMA vez, no deck do cabeçalho.
// · Os cinco botões mortos por tela (baixar, anexar, acrescentar). O
//   crítico: "controle morto não se renderiza". A rota de download e a
//   de entrega existem no backend e entram com o pedido real; até lá,
//   o arquivo é dado (nome · tipo), não botão.
// · O retângulo tracejado como campo. Campo é linha de base; caixa só
//   onde há fronteira real. O único que continua caixa é o documento.
// · O wireframe de página dentro de uma caixa de 420px — era o maior
//   elemento da tela e não carregava dado. O lugar do documento agora é
//   uma folha calma, na proporção A4, com nome e tipo, e uma linha.
//
// A decisão do Aquiles de manter os campos de trabalho INERTES fica de
// pé — são linhas de base vazias, e o deck diz por quê uma vez.

import type { CSSProperties, ReactNode } from 'react';

import { CT } from './consoleChrome';
import { formatarData, formatarIdade, idadePorExtenso } from '../../lib/operador/idade';
import { AGORA_DA_AMOSTRA, type PedidoNaFila } from '../../lib/operador/mock';

/** Cabeçalho do caso em TRÊS registros — eyebrow rastreado, display,
 *  deck leve — a tríade que a Alexandria e a calibragem usam. A versão
 *  anterior empilhava quatro rótulos em 90px e dizia o nome do produto
 *  três vezes. */
export function CabecalhoDoPedido({
  pedido,
  produto,
  deck,
}: {
  pedido: PedidoNaFila;
  produto: string;
  /** A frase que diz o que chegou e em que ponto está. Derivada, não
   *  digitada, por quem monta. */
  deck: string;
}) {
  return (
    <header
      style={{
        marginBottom: '30px',
        paddingBottom: '18px',
        borderBottom: 'var(--fio) solid var(--rule-heavy)',
      }}
    >
      <p style={{ ...CT.eyebrow, color: 'var(--text-faint)', margin: '0 0 8px' }}>
        {produto}
        <span aria-hidden="true" style={{ margin: '0 8px', color: 'var(--rule-strong)' }}>
          ·
        </span>
        {pedido.id}
      </p>
      <h1 style={{ ...CT.display, color: 'var(--text-strong)', margin: 0 }}>{pedido.cliente}</h1>
      <p style={{ ...CT.lede, color: 'var(--text-muted)', margin: '10px 0 0', maxWidth: '58ch', textWrap: 'pretty' } as CSSProperties}>
        {deck}
      </p>
      <p style={{ ...CT.dado, color: 'var(--text-faint)', margin: '12px 0 0', display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
        <span>enviado {formatarData(pedido.criadoEm)}</span>
        <span aria-hidden="true" style={{ color: 'var(--rule-strong)' }}>·</span>
        <span title={idadePorExtenso(pedido.criadoEm, AGORA_DA_AMOSTRA)}>
          espera há {formatarIdade(pedido.criadoEm, AGORA_DA_AMOSTRA)}
        </span>
        <span aria-hidden="true" style={{ color: 'var(--rule-strong)' }}>·</span>
        {/* A única declaração de ausência desta tela. */}
        <span>amostra · campos de trabalho inertes até a ligação</span>
      </p>
    </header>
  );
}

/** Cabeçalho de seção do sistema: número · título · fio · nota. O
 *  número vem da POSIÇÃO, nunca digitado. Toda seção tem NOME em Zilla,
 *  não etiqueta em versalete — "eyebrow de 10px não é título de nada". */
export function Secao({
  numero,
  titulo,
  nota,
  grande,
  children,
  style,
  'data-focal': dataFocal,
}: {
  numero: number;
  titulo: string;
  nota?: string;
  /** Título a 24px — a seção que é o PONTO da tela. */
  grande?: boolean;
  children: ReactNode;
  style?: CSSProperties;
  'data-focal'?: string;
}) {
  return (
    <section data-focal={dataFocal} style={style}>
      <div className="op-sech">
        <span className="op-sech__n">{String(numero).padStart(2, '0')}</span>
        <h2 className="op-sech__t" style={grande ? { fontSize: '24px', lineHeight: 1.16, letterSpacing: '-.01em' } : undefined}>
          {titulo}
        </h2>
        <span className="op-sech__fio" aria-hidden="true" />
        {nota ? <p className="op-sech__nota">{nota}</p> : <span />}
      </div>
      {children}
    </section>
  );
}

/** Linha rótulo/valor de leitura, alinhada por baseline. Rótulo em Work
 *  Sans 500 12px (não versalete — a tela já gastou os dois papéis de
 *  caixa alta). Valor ausente vira "sem dado". */
export function Linha({
  rotulo,
  valor,
  unidade,
  larguraRotulo = '176px',
}: {
  rotulo: string;
  valor: ReactNode;
  unidade?: string;
  larguraRotulo?: string;
}) {
  const vazio = valor === null || valor === undefined || valor === '';
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `${larguraRotulo} minmax(0,1fr)`,
        gap: '3px 16px',
        alignItems: 'baseline',
        padding: '8px 0',
        borderBottom: 'var(--fio) solid var(--rule)',
      }}
    >
      <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '12px', lineHeight: 1.5, color: 'var(--text-muted)' }}>
        {rotulo}
      </span>
      <span style={{ ...CT.corpo, fontSize: '14px', color: vazio ? 'var(--text-faint)' : 'var(--text-body)' }}>
        {vazio ? 'sem dado' : valor}
        {!vazio && unidade ? (
          <span style={{ ...CT.dado, color: 'var(--text-faint)', marginLeft: '6px' }}>{unidade}</span>
        ) : null}
      </span>
    </div>
  );
}

/** Campo de trabalho INERTE — uma linha de base com o que vai ali, em
 *  Work Sans 300 faint. Não é caixa: caixa lê como formulário de
 *  cadastro; linha de base lê como folha de trabalho. */
export function CampoInerte({ placeholder, linhas = 1, unidade }: { placeholder: string; linhas?: number; unidade?: string }) {
  return (
    <div
      aria-disabled="true"
      className={`op-campo${linhas > 1 ? ' op-campo--longo' : ''}`}
      style={linhas > 1 ? ({ '--linhas': linhas } as CSSProperties) : undefined}
    >
      <span style={{ flex: 1, minWidth: 0 }}>{placeholder}</span>
      {unidade ? <span style={{ ...CT.dado, color: 'var(--text-faint)' }}>{unidade}</span> : null}
    </div>
  );
}

/** Uma linha de campo com rótulo à esquerda e a linha de base à direita
 *  — a anatomia da fatura é uma pilha destas. */
export function CampoRotulado({ rotulo, unidade, placeholder = '' }: { rotulo: string; unidade?: string; placeholder?: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '176px minmax(0,1fr)', gap: '16px', alignItems: 'baseline' }}>
      <span style={{ fontFamily: 'var(--font-body)', fontWeight: 500, fontSize: '12px', lineHeight: 1.5, color: 'var(--text-muted)', paddingTop: '6px' }}>
        {rotulo}
      </span>
      <CampoInerte placeholder={placeholder} unidade={unidade} />
    </div>
  );
}

/** O lugar do documento do cliente — placeholder DECLARADO, decisão do
 *  Aquiles: a exibição de PDF é wave própria (recon Wave 1 §4.4), e meio
 *  visualizador esconderia o tamanho da peça que falta.
 *
 *  É a única CAIXA das telas de detalhe, porque o documento é a única
 *  fronteira real. Uma folha na proporção A4, fio de 1px, o nome e o
 *  tipo, e uma linha em mono dizendo o que ela não faz. */
export function LugarDoDocumento({ arquivo }: { arquivo: string }) {
  const ext = arquivo.split('.').pop()?.toLowerCase() ?? '';
  const tipo = ext === 'pdf' ? 'PDF' : ext ? ext.toUpperCase() : 'arquivo';
  return (
    <figure
      style={{
        margin: 0,
        width: '100%',
        maxWidth: '300px',
        aspectRatio: '210 / 297',
        border: 'var(--fio) solid var(--rule-strong)',
        background: 'var(--surface-raised)',
        display: 'grid',
        gridTemplateRows: '1fr auto',
        padding: '18px',
      }}
    >
      <div style={{ display: 'grid', alignContent: 'center', justifyItems: 'start', gap: '6px' }}>
        <span style={{ ...CT.eyebrow, color: 'var(--text-faint)' }}>Exibição em wave própria</span>
        <span style={{ ...CT.corpoLeve, color: 'var(--text-muted)', maxWidth: '26ch', textWrap: 'pretty' } as CSSProperties}>
          O documento não é renderizado aqui; abre pelo download quando o pedido for real.
        </span>
      </div>
      <figcaption style={{ borderTop: 'var(--fio) solid var(--rule)', paddingTop: '10px' }}>
        <span style={{ ...CT.nome, display: 'block', color: 'var(--text-strong)', wordBreak: 'break-all' }}>{arquivo}</span>
        <span style={{ ...CT.dado, color: 'var(--text-faint)' }}>{tipo}</span>
      </figcaption>
    </figure>
  );
}

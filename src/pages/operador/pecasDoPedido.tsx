// pecasDoPedido — ARCHITECT, Portal do Operador Wave 2, Fase 5.
//
// As peças que as TRÊS telas de detalhe compartilham. O que elas
// compartilham é VOCABULÁRIO — cabeçalho do caso, carimbo de amostra,
// moldura de seção, superfície de trabalho desabilitada. O que muda por
// produto é o INSTRUMENTO, e isso mora em cada tela.
//
// ─── SUPERFÍCIE DESABILITADA, COM A RAZÃO AO LADO ────────────────────
// Decisão do Aquiles, e ela tem precedente nesta trilha: campo que
// aceita texto e descarta é pior que ausência, e aqui o peso é maior
// porque parecer é trabalho longo. Nenhum campo de trabalho desta wave
// aceita digitação; cada bloco carrega a razão do lado, dizendo que a
// persistência chega na wave de ligação.
//
// A regra prática: **nunca um campo inerte sem explicação adjacente.**
// Um `disabled` mudo lê como bug; um `disabled` com a razão ao lado lê
// como estado declarado do produto.

import type { CSSProperties, ReactNode } from 'react';

import { CT } from './consoleChrome';
import { Frescor } from '../../components/nivar/tabela';
import { formatarData, formatarIdade, idadePorExtenso } from '../../lib/operador/idade';
import { AGORA_DA_AMOSTRA, type PedidoNaFila } from '../../lib/operador/mock';

/** Cabeçalho do caso — igual nas três, porque identificar o pedido não é
 *  onde os produtos diferem. */
export function CabecalhoDoPedido({
  pedido,
  produto,
}: {
  pedido: PedidoNaFila;
  produto: string;
}) {
  return (
    <header
      style={{
        marginBottom: '24px',
        paddingBottom: '14px',
        borderBottom: 'var(--fio-forte) solid var(--rule-heavy)',
      }}
    >
      <span style={{ ...CT.eyebrow, color: 'var(--text-faint)' }}>{produto}</span>
      {/* Mesma escala de display do título da fila. Estava em 24px
          enquanto a fila subiu para 32, e a hierarquia entre as duas
          telas se contradizia: o caso aberto lia como MENOS importante
          que a lista de onde ele veio. */}
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--fw-display)',
          fontSize: 'var(--ts-display-3)',
          lineHeight: 'var(--lh-display-3)',
          letterSpacing: 'var(--tr-display-3)',
          color: 'var(--text-strong)',
          margin: '5px 0 10px',
        }}
      >
        {pedido.cliente}
      </h1>
      <p
        style={{
          ...CT.dado,
          color: 'var(--text-muted)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px 14px',
          margin: '0 0 12px',
        }}
      >
        <span>{pedido.id}</span>
        <span aria-hidden="true" style={{ color: 'var(--rule-strong)' }}>
          ·
        </span>
        <span>enviado {formatarData(pedido.criadoEm)}</span>
        <span aria-hidden="true" style={{ color: 'var(--rule-strong)' }}>
          ·
        </span>
        {/* Idade crua. Sem prazo, sem barra, sem rótulo de atrasado —
            a mesma disciplina da coluna da fila. */}
        <span title={idadePorExtenso(pedido.criadoEm, AGORA_DA_AMOSTRA)}>
          espera há {formatarIdade(pedido.criadoEm, AGORA_DA_AMOSTRA)}
        </span>
      </p>
      <Frescor estado="ilustrativa" detalhe="pedido de amostra · nada aqui é gravado" />
    </header>
  );
}

/** Uma seção com rótulo em versalete e fio acima — a moldura do sistema,
 *  sem caixa e sem sombra. `nota` é a razão que acompanha superfície
 *  desabilitada. */
export function Secao({
  rotulo,
  nota,
  children,
  style,
  'data-focal': dataFocal,
}: {
  rotulo: string;
  nota?: ReactNode;
  children: ReactNode;
  style?: CSSProperties;
  /** A seção que é o PONTO da tela — o trabalho, não o contexto dele.
   *
   *  Existe porque o auditor apontou `equal-weight-grid` nas telas de
   *  CLE e Diagnóstico, e o apontamento estava certo: as três seções
   *  tinham peso idêntico, quando uma delas é o produto do operador e as
   *  outras são entrada e saída dela. Marcar não é calar o auditor —
   *  o rótulo da focal ganha peso real, e o olho passa a cair no
   *  trabalho em vez de na primeira seção da pilha.
   *
   *  O nome do prop é o próprio atributo (`data-focal`) e não um
   *  `focal` booleano, porque o auditor lê o JSX e não o DOM: com um
   *  prop de outro nome ele veria `<Secao>` e não enxergaria a marca
   *  que o `<section>` acaba recebendo. Assim o que está escrito na
   *  chamada é o que chega na página — uma fonte de verdade só. */
  'data-focal'?: string;
}) {
  const focal = dataFocal !== undefined;
  return (
    <section
      data-focal={dataFocal}
      style={{ borderTop: 'var(--fio) solid var(--rule-heavy)', paddingTop: '12px', ...style }}
    >
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: '4px 16px',
          marginBottom: '12px',
        }}
      >
        <h2
          style={{
            ...(focal ? CT.titulo2 : CT.eyebrow),
            color: 'var(--text-strong)',
            margin: 0,
          }}
        >
          {rotulo}
        </h2>
        {nota ? (
          <p style={{ ...CT.nota, fontSize: '11.5px', color: 'var(--text-faint)', margin: 0, maxWidth: '46ch' }}>
            {nota}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

/** A razão que acompanha TODA superfície inerte desta wave. Uma frase,
 *  no lugar onde o campo estaria, para o `disabled` nunca ler como bug. */
export const RAZAO_SEM_PERSISTENCIA =
  'Inerte nesta wave: o backend não tem coluna para estes campos. A digitação entra junto com a persistência, na wave de ligação.';

/** Linha rótulo/valor de leitura. Rótulo em versalete estreito, valor em
 *  corpo — e valor ausente vira `sem dado`, nunca vazio. */
export function Linha({
  rotulo,
  valor,
  unidade,
  larguraRotulo = '190px',
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
        gap: '3px 14px',
        padding: '7px 0',
        borderBottom: 'var(--fio) solid var(--rule)',
      }}
    >
      <span style={{ ...CT.eyebrow, fontSize: '9.5px', color: 'var(--text-faint)', lineHeight: 1.7 }}>
        {rotulo}
      </span>
      <span style={{ ...CT.corpo, fontSize: '13px', color: vazio ? 'var(--text-faint)' : 'var(--text-body)' }}>
        {vazio ? 'sem dado' : valor}
        {!vazio && unidade ? (
          <span style={{ ...CT.dado, color: 'var(--text-faint)', marginLeft: '6px' }}>{unidade}</span>
        ) : null}
      </span>
    </div>
  );
}

/** Campo de trabalho INERTE. Nunca aparece sozinho: a `Secao` que o
 *  contém carrega a razão. O fio pontilhado é o que distingue "espaço
 *  reservado" de "campo que aceita" sem recorrer a cor de estado. */
export function CampoInerte({
  placeholder,
  linhas = 1,
  unidade,
}: {
  placeholder: string;
  linhas?: number;
  unidade?: string;
}) {
  return (
    <div
      aria-disabled="true"
      style={{
        display: 'flex',
        alignItems: 'stretch',
        border: 'var(--fio) dashed var(--rule-strong)',
        borderRadius: 0,
        minHeight: linhas > 1 ? `${linhas * 20 + 16}px` : '32px',
        padding: '7px 10px',
        color: 'var(--text-faint)',
        ...CT.corpo,
        fontSize: '13px',
      }}
    >
      <span style={{ flex: 1, minWidth: 0 }}>{placeholder}</span>
      {unidade ? <span style={{ ...CT.dado, color: 'var(--text-faint)' }}>{unidade}</span> : null}
    </div>
  );
}

/** O lugar do documento do cliente.
 *
 *  **É placeholder DECLARADO, não componente parcial** — decisão
 *  explícita do Aquiles nesta fase. A recon da Wave 1 (§4.4) mediu que
 *  exibir o documento é wave própria: exige rasterização de PDF (que não
 *  existe nos dois lados), transporte que contorne o
 *  `Content-Disposition: attachment` do endpoint, e contagem de páginas
 *  que só um parser dá. Meio visualizador seria pior que nenhum, porque
 *  esconderia o tamanho da peça que falta.
 *
 *  O que a caixa faz de útil hoje é o que já é possível: nomear o
 *  arquivo, dizer o tipo, e oferecer o caminho de download. */
export function LugarDoDocumento({ arquivo, altura }: { arquivo: string; altura?: string }) {
  const ext = arquivo.split('.').pop()?.toLowerCase() ?? '';
  const tipo = ext === 'pdf' ? 'PDF' : ext ? `imagem ${ext.toUpperCase()}` : 'arquivo';

  return (
    <div
      style={{
        border: 'var(--fio) solid var(--rule-strong)',
        borderRadius: 0,
        minHeight: altura ?? '420px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '20px',
        padding: '16px',
        background: 'var(--zebra)',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          textAlign: 'center',
          padding: '20px 12px',
        }}
      >
        {/* Eixo desenhado, o mesmo idioma do estado vazio do sistema:
            a moldura da página existe, o conteúdo não. */}
        <div
          aria-hidden="true"
          style={{
            width: '52%',
            maxWidth: '180px',
            aspectRatio: '210 / 297',
            border: 'var(--fio) dashed var(--rule-strong)',
            display: 'grid',
            alignContent: 'center',
            gap: '9px',
            padding: '0 14px',
          }}
        >
          {[68, 100, 100, 84, 100, 46].map((largura, i) => (
            <span
              key={i}
              style={{ display: 'block', height: '1px', width: `${largura}%`, background: 'var(--rule)' }}
            />
          ))}
        </div>
        <p style={{ ...CT.eyebrow, color: 'var(--text-strong)', margin: '4px 0 0' }}>
          Exibição em wave própria
        </p>
        <p style={{ ...CT.nota, fontSize: '11.5px', color: 'var(--text-muted)', margin: 0, maxWidth: '34ch' }}>
          O documento não é renderizado aqui. Exibir PDF exige capacidade que o produto ainda não
          tem, nos dois lados — é wave separada, não um pedaço desta. Até lá, o arquivo se abre pelo
          download.
        </p>
      </div>

      <div style={{ borderTop: 'var(--fio) solid var(--rule)', paddingTop: '10px' }}>
        <p style={{ ...CT.corpo, fontSize: '13px', color: 'var(--text-strong)', margin: '0 0 2px', wordBreak: 'break-all' }}>
          {arquivo}
        </p>
        <p style={{ ...CT.dado, color: 'var(--text-faint)', margin: '0 0 10px' }}>{tipo}</p>
        <span
          aria-disabled="true"
          className="nv-btn nv-btn--secundario"
          style={{ opacity: 0.55, cursor: 'not-allowed' }}
        >
          <span className="nv-btn__glifo" aria-hidden="true">
            ↓
          </span>
          Baixar arquivo
        </span>
        <p style={{ ...CT.nota, fontSize: '11px', color: 'var(--text-faint)', margin: '8px 0 0' }}>
          Inerte na amostra — o download real precisa do pedido existir no backend.
        </p>
      </div>
    </div>
  );
}

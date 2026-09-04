// detalheSolar — ARCHITECT, Portal do Operador Wave 2, Fase 5.
//
// Solar Proposal Validator. **Largura inteira, livro-razão da proposta:
// uma linha por afirmação, classificada pela natureza.**
//
// ─── ISTO NÃO É UI INVENTADA — É A COPY PÚBLICA VIRANDO FERRAMENTA ───
// A página do produto (`SolarProposalValidatorPage.tsx:829` e `:834`) já
// promete ao cliente, na letra:
//
//   · duas TRILHAS de leitura — a regulatória "verifica porte,
//     modalidade e regime de compensação"; a técnica "confronta geração
//     estimada, degradação e trajetória tarifária contra referência
//     citável";
//   · "cada linha classificada pela NATUREZA — fato com fonte, premissa
//     ancorada, premissa não ancorada ou embutida por omissão";
//   · "com as PERGUNTAS DE NEGOCIAÇÃO e a BASE NORMATIVA citada".
//
// As colunas abaixo são exatamente esses quatro eixos. Os quatro valores
// de natureza são literais da copy, não escala inventada por mim.
//
// ─── POR QUE TABELA, E NÃO DUAS COLUNAS COMO A CLE ───────────────────
// Uma proposta comercial NÃO é padronizada: cada vendedor afirma o que
// quer, num número variável de alegações. A tela precisa ser uma lista
// que CRESCE, não um formulário de campos fixos. E como cada linha
// carrega quatro atributos comparáveis entre si, a varredura vertical
// por coluna alinhada é o instrumento certo — que é literalmente o que
// `.nv-tab` faz, e a razão pela qual portei o grupo na Fase 2.
//
// O documento vira FAIXA FINA no topo, não metade da tela: aqui ele é
// ponto de partida, não objeto de leitura campo a campo como a fatura.

import { CT } from './consoleChrome';
import { Tabela, type ColunaTabela } from '../../components/nivar/tabela';
import {
  CabecalhoDoPedido,
  CampoInerte,
  RAZAO_SEM_PERSISTENCIA,
  Secao,
} from './pecasDoPedido';
import {
  LIVRO_RAZAO_MOCK,
  NATUREZAS_SOLAR,
  type LinhaProposta,
  type PedidoNaFila,
} from '../../lib/operador/mock';

/** Seletor de natureza, inerte. Mostra os quatro valores da copy em vez
 *  de esconder num dropdown fechado: o operador precisa ver a escala
 *  inteira para classificar, e a escala é o produto. */
function EscolhaNatureza() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 12px' }} aria-disabled="true">
      {NATUREZAS_SOLAR.map((n) => (
        <span
          key={n}
          style={{
            ...CT.dado,
            fontSize: '10.5px',
            color: 'var(--text-faint)',
            borderBottom: 'var(--fio) dashed var(--rule-strong)',
            paddingBottom: '1px',
            whiteSpace: 'nowrap',
          }}
        >
          {n}
        </span>
      ))}
    </div>
  );
}

export function DetalheSolar({ pedido, produto }: { pedido: PedidoNaFila; produto: string }) {
  const linhas = LIVRO_RAZAO_MOCK[pedido.id] ?? [];

  const colunas: ColunaTabela<LinhaProposta>[] = [
    {
      chave: 'trilha',
      rotulo: 'Trilha',
      celula: (l) => (
        <span style={{ ...CT.dado, fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.09em' }}>
          {l.trilha}
        </span>
      ),
    },
    {
      chave: 'afirmacao',
      rotulo: 'O que a proposta afirma',
      celula: (l) => <span style={{ color: 'var(--text-strong)' }}>{l.afirmacao}</span>,
    },
    { chave: 'natureza', rotulo: 'Natureza', celula: () => <EscolhaNatureza /> },
    {
      chave: 'pergunta',
      rotulo: 'Pergunta de negociação',
      celula: () => <CampoInerte placeholder="O que perguntar ao vendedor." linhas={2} />,
    },
    {
      chave: 'base',
      rotulo: 'Base normativa',
      celula: () => <CampoInerte placeholder="REN, lei, norma." linhas={2} />,
    },
  ];

  return (
    <>
      <CabecalhoDoPedido pedido={pedido} produto={produto} />

      {/* O documento como faixa fina — ponto de partida, não objeto de
          estudo campo a campo. */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px 20px',
          border: 'var(--fio) solid var(--rule-strong)',
          background: 'var(--zebra)',
          padding: '10px 14px',
          marginBottom: '26px',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: '4px 12px', minWidth: 0 }}>
          <span style={{ ...CT.corpo, fontSize: '13px', color: 'var(--text-strong)', wordBreak: 'break-all' }}>
            {pedido.arquivo ?? 'sem arquivo'}
          </span>
          <span aria-hidden="true" style={{ ...CT.dado, color: 'var(--rule-strong)' }}>
            ·
          </span>
          <span style={{ ...CT.nota, fontSize: '11.5px', color: 'var(--text-muted)' }}>
            A exibição do documento é wave própria. Até lá, abre pelo download.
          </span>
        </div>
        <span
          aria-disabled="true"
          className="nv-btn nv-btn--secundario"
          style={{ opacity: 0.55, cursor: 'not-allowed', flex: 'none' }}
        >
          <span className="nv-btn__glifo" aria-hidden="true">
            ↓
          </span>
          Baixar proposta
        </span>
      </div>

      <div style={{ display: 'grid', gap: '26px' }}>
        {/* A FOCAL desta tela: o livro-razão nao e uma secao entre tres,
            e o produto. Conclusao e entregavel sao o que se faz DEPOIS
            dele. Estava em 10,5px, do mesmo tamanho das outras duas. */}
        <Secao
          data-focal=""
          rotulo="Livro-razão da proposta"
          nota={RAZAO_SEM_PERSISTENCIA}
          style={{ borderTop: 'none', paddingTop: 0 }}
        >
          <p style={{ ...CT.nota, fontSize: '11.5px', color: 'var(--text-muted)', margin: '0 0 12px', maxWidth: '76ch' }}>
            Uma linha por afirmação da proposta, em duas trilhas — regulatória e técnica —, cada
            uma classificada pela natureza, com a pergunta de negociação e a base normativa. É o que
            a página pública promete ao cliente, virado ferramenta de trabalho.
          </p>

          {linhas.length > 0 ? (
            <Tabela colunas={colunas} linhas={linhas} chaveDe={(l) => l.id} hover={false} />
          ) : (
            <p style={{ ...CT.nota, color: 'var(--text-faint)' }}>
              Nenhuma linha extraída ainda nesta amostra.
            </p>
          )}

          <div style={{ marginTop: '12px' }}>
            <span
              aria-disabled="true"
              className="nv-btn nv-btn--secundario"
              style={{ opacity: 0.55, cursor: 'not-allowed' }}
            >
              <span className="nv-btn__glifo" aria-hidden="true">
                +
              </span>
              Acrescentar linha
            </span>
            <p style={{ ...CT.nota, fontSize: '11px', color: 'var(--text-faint)', margin: '8px 0 0', maxWidth: '58ch' }}>
              O número de linhas é do documento, não da tela — uma proposta afirma o que o vendedor
              quiser. Por isso lista que cresce, e não formulário de campos fixos.
            </p>
          </div>
        </Secao>

        <Secao rotulo="Conclusão" nota={RAZAO_SEM_PERSISTENCIA}>
          <CampoInerte placeholder="O parecer sobre esta proposta." linhas={6} />
        </Secao>

        <Secao
          rotulo="Entregável"
          nota="A rota de entrega EXISTE no backend (POST …/deliverable), igual à da CLE. O que falta é o pedido ser real."
        >
          <span
            aria-disabled="true"
            className="nv-btn nv-btn--secundario"
            style={{ opacity: 0.55, cursor: 'not-allowed' }}
          >
            <span className="nv-btn__glifo" aria-hidden="true">
              ↑
            </span>
            Anexar parecer em PDF
          </span>
        </Secao>
      </div>
    </>
  );
}

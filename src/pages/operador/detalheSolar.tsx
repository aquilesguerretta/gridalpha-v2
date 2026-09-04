// detalheSolar — ARCHITECT, Portal do Operador, revisão visual pós-Wave 2.
//
// Solar Proposal Validator. **Largura inteira, livro-razão da proposta:
// uma linha por afirmação, classificada pela natureza.**
//
// Não é UI inventada — é a copy pública virando ferramenta
// (SolarProposalValidatorPage.tsx:829 e :834): duas trilhas (regulatória
// e técnica), "cada linha classificada pela natureza — fato com fonte,
// premissa ancorada, premissa não ancorada ou embutida por omissão — com
// as perguntas de negociação e a base normativa citada". As colunas são
// esses quatro eixos; os quatro valores são literais dela.
//
// Tabela, e não formulário, porque proposta comercial NÃO é
// padronizada: o número de linhas é do documento. O documento vira uma
// linha de dado sob o cabeçalho — aqui ele é ponto de partida, não
// objeto de leitura campo a campo como a fatura.

import { CT } from './consoleChrome';
import { Tabela, type ColunaTabela } from '../../components/nivar/tabela';
import { CabecalhoDoPedido, CampoInerte, Secao } from './pecasDoPedido';
import { formatarIdade } from '../../lib/operador/idade';
import { AGORA_DA_AMOSTRA, LIVRO_RAZAO_MOCK, NATUREZAS_SOLAR, type LinhaProposta, type PedidoNaFila } from '../../lib/operador/mock';

/** As quatro naturezas da copy, UMA vez, como legenda da seção — a
 *  escala é o produto, mas repetida em cada linha virava dezesseis
 *  linhas de mono cinza. Cada linha recebe um campo só. */
function LegendaNatureza() {
  return (
    <p style={{ ...CT.dado, fontSize: '11.5px', color: 'var(--text-muted)', margin: '0 0 14px', display: 'flex', flexWrap: 'wrap', gap: '4px 0' }}>
      <span style={{ color: 'var(--text-faint)', marginRight: '10px' }}>natureza, por linha:</span>
      {NATUREZAS_SOLAR.map((n, i) => (
        <span key={n}>
          {i > 0 ? <span aria-hidden="true" style={{ margin: '0 9px', color: 'var(--rule-strong)' }}>·</span> : null}
          <span style={{ color: 'var(--text-body)' }}>{n}</span>
        </span>
      ))}
    </p>
  );
}

export function DetalheSolar({ pedido, produto }: { pedido: PedidoNaFila; produto: string }) {
  const linhas = LIVRO_RAZAO_MOCK[pedido.id] ?? [];
  const deck = `Uma proposta comercial de sistema solar, esperando leitura há ${formatarIdade(pedido.criadoEm, AGORA_DA_AMOSTRA)}. ${linhas.length} ${linhas.length === 1 ? 'afirmação extraída' : 'afirmações extraídas'}, em duas trilhas.`;

  const colunas: ColunaTabela<LinhaProposta>[] = [
    {
      chave: 'trilha',
      rotulo: 'Trilha',
      celula: (l) => <span style={{ ...CT.eyebrow, color: 'var(--text-muted)' }}>{l.trilha}</span>,
    },
    {
      chave: 'afirmacao',
      rotulo: 'O que a proposta afirma',
      celula: (l) => <span style={{ ...CT.corpo, fontSize: '14px', color: 'var(--text-strong)' }}>{l.afirmacao}</span>,
    },
    { chave: 'natureza', rotulo: 'Natureza', celula: () => <CampoInerte placeholder="uma das quatro" /> },
    { chave: 'pergunta', rotulo: 'Pergunta de negociação', celula: () => <CampoInerte placeholder="o que perguntar ao vendedor" linhas={2} /> },
    { chave: 'base', rotulo: 'Base normativa', celula: () => <CampoInerte placeholder="REN, lei, norma" linhas={2} /> },
  ];

  return (
    <div style={{ maxWidth: '1180px' }}>
      <CabecalhoDoPedido pedido={pedido} produto={produto} deck={deck} />

      {/* O documento como dado, não como caixa nem botão. */}
      <p style={{ ...CT.dado, color: 'var(--text-muted)', margin: '-14px 0 30px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <span style={{ ...CT.nome, color: 'var(--text-strong)' }}>{pedido.arquivo}</span>
        <span aria-hidden="true" style={{ color: 'var(--rule-strong)' }}>·</span>
        <span>exibição e download com o pedido real</span>
      </p>

      <div style={{ display: 'grid', gap: '34px' }}>
        <Secao numero={1} titulo="Livro-razão da proposta" grande data-focal="" nota={`${linhas.length} linhas · cresce com o documento`}>
          <LegendaNatureza />
          {linhas.length > 0 ? (
            <Tabela colunas={colunas} linhas={linhas} chaveDe={(l) => l.id} zebra={false} hover={false} />
          ) : (
            <p style={{ ...CT.corpoLeve, color: 'var(--text-faint)' }}>Nenhuma linha extraída ainda nesta amostra.</p>
          )}
        </Secao>

        <Secao numero={2} titulo="Conclusão" nota="PDF do parecer entra com o pedido real">
          <CampoInerte placeholder="O parecer sobre esta proposta." linhas={6} />
        </Secao>
      </div>
    </div>
  );
}

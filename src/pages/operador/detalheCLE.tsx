// detalheCLE — ARCHITECT, Portal do Operador, revisão visual pós-Wave 2.
//
// Conta de Luz Express. **Duas colunas: o documento fixo à esquerda, a
// leitura à direita.** A fatura é documento PADRONIZADO — os mesmos
// campos toda vez, olhando para a peça —, então a tela é bancada.
//
// Os dez campos saem da copy pública do produto
// (ContaDeLuzExpressPage.tsx:843): "modalidade tarifária, demanda
// contratada e medida, tributos e encargos". Ordem de leitura da fatura.
//
// Cada seção tem NÚMERO e NOME; a focal (o parecer, que é o trabalho)
// tem o título grande. Nenhum botão morto: a rota de entrega existe e
// entra com o pedido real — a nota da seção diz isso numa linha.

import { CabecalhoDoPedido, CampoInerte, CampoRotulado, LugarDoDocumento, Secao } from './pecasDoPedido';
import { formatarIdade } from '../../lib/operador/idade';
import { AGORA_DA_AMOSTRA, ANATOMIA_FATURA, type PedidoNaFila } from '../../lib/operador/mock';

export function DetalheCLE({ pedido, produto }: { pedido: PedidoNaFila; produto: string }) {
  const deck =
    pedido.status === 'ready'
      ? `Fatura lida e parecer entregue. Chegou há ${formatarIdade(pedido.criadoEm, AGORA_DA_AMOSTRA)}.`
      : `Uma fatura de concessionária, esperando leitura há ${formatarIdade(pedido.criadoEm, AGORA_DA_AMOSTRA)}. Os mesmos campos de toda fatura, na ordem em que aparecem nela.`;

  return (
    <div style={{ maxWidth: '1180px' }}>
      <CabecalhoDoPedido pedido={pedido} produto={produto} deck={deck} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 300px) minmax(0, 1fr)',
          gap: '0 56px',
          alignItems: 'start',
        }}
      >
        <div style={{ position: 'sticky', top: 0 }}>
          <Secao numero={1} titulo="O que chegou">
            {pedido.arquivo ? <LugarDoDocumento arquivo={pedido.arquivo} /> : null}
          </Secao>
        </div>

        <div style={{ display: 'grid', gap: '34px' }}>
          <Secao numero={2} titulo="Anatomia da fatura" nota="os mesmos campos, toda fatura">
            <div style={{ display: 'grid', gap: '4px' }}>
              {ANATOMIA_FATURA.map((campo) => (
                <CampoRotulado key={campo.chave} rotulo={campo.rotulo} unidade={campo.unidade} />
              ))}
            </div>
          </Secao>

          <Secao numero={3} titulo="Parecer" grande data-focal="" nota="o contraditório vai junto, não depois">
            <CampoInerte placeholder="O parecer sobre esta fatura, com o argumento que o contesta." linhas={8} />
            <p
              style={{
                fontFamily: 'var(--font-data)',
                fontSize: '11px',
                letterSpacing: '.06em',
                color: 'var(--text-faint)',
                margin: '10px 0 0',
              }}
            >
              PDF do parecer entra por POST …/deliverable, com o pedido real.
            </p>
          </Secao>
        </div>
      </div>
    </div>
  );
}

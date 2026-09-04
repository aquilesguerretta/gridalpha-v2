// detalheDiagnostico — ARCHITECT, Portal do Operador, revisão visual pós-Wave 2.
//
// Diagnóstico Energético. **Coluna única de leitura: a ficha e o fio.**
//
// Três fatos medidos nas recons de Wave 1, cada um removendo uma peça
// que os outros dois produtos têm: não há arquivo (o caso É o texto que
// o cliente digitou); não há entregável (nem endpoint nem coluna — a
// resposta É a mensagem); e há conversa ligada ao caso (o único dos três
// com origin_*). Daí coluna estreita, largura de leitura, e o fio como
// seção focal.

import type { CSSProperties } from 'react';

import { CT } from './consoleChrome';
import { CabecalhoDoPedido, CampoInerte, Linha, Secao } from './pecasDoPedido';
import { formatarIdade, idadePorExtenso } from '../../lib/operador/idade';
import { AGORA_DA_AMOSTRA, FICHAS_MOCK, FIO_MOCK, type PedidoNaFila } from '../../lib/operador/mock';

export function DetalheDiagnostico({ pedido, produto }: { pedido: PedidoNaFila; produto: string }) {
  const ficha = FICHAS_MOCK[pedido.id];
  const fio = FIO_MOCK[pedido.id] ?? [];
  const deck = `Uma ficha de quatro campos, sem arquivo, esperando há ${formatarIdade(pedido.criadoEm, AGORA_DA_AMOSTRA)}. ${
    fio.length ? `${fio.length} ${fio.length === 1 ? 'mensagem' : 'mensagens'} no fio.` : 'O cliente enviou o escopo e não escreveu.'
  } Este produto não tem entregável — a resposta é a mensagem.`;

  return (
    <div style={{ maxWidth: '68ch' }}>
      <CabecalhoDoPedido pedido={pedido} produto={produto} deck={deck} />

      <div style={{ display: 'grid', gap: '34px' }}>
        <Secao numero={1} titulo="A ficha" nota="só leitura">
          {ficha ? (
            <>
              <Linha rotulo="Setor" valor={ficha.sector} />
              <Linha rotulo="Consumo mensal" valor={ficha.monthlyConsumptionBand} />
              {/* null é "não sei dizer", e o backend converte string vazia
                  em null de propósito. A tela repete a distinção. */}
              <Linha
                rotulo="Modalidade tarifária"
                valor={ficha.tariffModality ?? <span style={{ color: 'var(--text-faint)' }}>o cliente não soube dizer</span>}
              />
              <blockquote
                style={{
                  margin: '18px 0 0',
                  padding: '2px 0 2px 16px',
                  borderLeft: '2px solid var(--acento-contexto)',
                }}
              >
                <p style={{ ...CT.lede, fontSize: '17px', color: 'var(--text-body)', margin: 0, textWrap: 'pretty' } as CSSProperties}>
                  {ficha.concern}
                </p>
                <footer style={{ ...CT.dado, color: 'var(--text-faint)', marginTop: '8px' }}>a preocupação, nas palavras dele</footer>
              </blockquote>
            </>
          ) : (
            <p style={{ ...CT.corpoLeve, color: 'var(--text-faint)' }}>Ficha ausente nesta amostra.</p>
          )}
        </Secao>

        <Secao numero={2} titulo="O fio" grande data-focal="" nota="a resposta deste produto é a mensagem">
          {fio.length > 0 ? (
            <ol style={{ listStyle: 'none', margin: '0 0 22px', padding: 0, display: 'grid', gap: '18px' }}>
              {fio.map((m) => {
                const daCasa = m.role !== 'customer';
                return (
                  <li key={m.id} style={{ display: 'grid', gridTemplateColumns: '96px minmax(0,1fr)', gap: '16px', alignItems: 'baseline' }}>
                    <span style={{ ...CT.eyebrow, color: daCasa ? 'var(--text-strong)' : 'var(--text-faint)' }}>
                      {daCasa ? 'NIVAR' : 'cliente'}
                      <span style={{ display: 'block', ...CT.dado, fontSize: '11px', textTransform: 'none', letterSpacing: 0, color: 'var(--text-faint)', marginTop: '2px' }} title={idadePorExtenso(m.createdAt, AGORA_DA_AMOSTRA)}>
                        há {formatarIdade(m.createdAt, AGORA_DA_AMOSTRA)}
                      </span>
                    </span>
                    <p style={{ ...CT.corpo, color: 'var(--text-body)', margin: 0, textWrap: 'pretty' } as CSSProperties}>{m.body}</p>
                  </li>
                );
              })}
            </ol>
          ) : null}
          <CampoInerte placeholder="Responder ao cliente." linhas={4} />
          <p style={{ fontFamily: 'var(--font-data)', fontSize: '11px', letterSpacing: '.06em', color: 'var(--text-faint)', margin: '10px 0 0' }}>
            POST /api/operator/conversations/…/messages existe; entra com o papel de operador na sessão.
          </p>
        </Secao>
      </div>
    </div>
  );
}

// detalheDiagnostico — ARCHITECT, Portal do Operador Wave 2, Fase 5.
//
// Diagnóstico Energético. **Coluna única de leitura: a ficha e o fio.**
//
// ─── POR QUE ESTA FORMA É A MAIS DIFERENTE DAS TRÊS ──────────────────
// Três fatos medidos, todos das recons de Wave 1, e cada um remove uma
// peça que os outros dois produtos têm:
//
//  1. **Não há arquivo.** `src/lib/diagnostico/api.ts` é cliente próprio,
//     sem `source` — o caso É o texto que o cliente digitou. Sem
//     documento, não há o que pôr numa segunda coluna: a bancada de duas
//     colunas da CLE aqui seria metade vazia.
//  2. **Não há entregável.** A recon da CURSOR (H4) mediu: este produto
//     não tem endpoint NEM coluna de entrega. A tela DECLARA isso em vez
//     de mostrar um slot que não leva a lugar nenhum — que é a diferença
//     entre ausência declarada e botão que mente.
//  3. **Há conversa ligada ao caso.** É o único dos três em que
//     `originKind`/`originId` amarram um fio ao pedido. A resposta deste
//     produto É a mensagem, então o fio é o instrumento principal, não
//     um acessório no rodapé.
//
// Daí: coluna estreita, largura de leitura, tipografia de texto. É texto
// de gente, não dado em grade.
//
// ─── O COMPOSITOR É INERTE, COM A RAZÃO AO LADO ──────────────────────
// Mesma disciplina das outras duas telas. Aqui pesa mais: uma resposta
// ao cliente é trabalho longo, e campo que aceita e descarta é pior que
// ausência.

import { CT } from './consoleChrome';
import { CabecalhoDoPedido, CampoInerte, Linha, Secao } from './pecasDoPedido';
import { formatarIdade, idadePorExtenso } from '../../lib/operador/idade';
import {
  AGORA_DA_AMOSTRA,
  FICHAS_MOCK,
  FIO_MOCK,
  type PedidoNaFila,
} from '../../lib/operador/mock';

const LARGURA_LEITURA = '68ch';

export function DetalheDiagnostico({
  pedido,
  produto,
}: {
  pedido: PedidoNaFila;
  produto: string;
}) {
  const ficha = FICHAS_MOCK[pedido.id];
  const fio = FIO_MOCK[pedido.id] ?? [];

  return (
    <div style={{ maxWidth: LARGURA_LEITURA }}>
      <CabecalhoDoPedido pedido={pedido} produto={produto} />

      <div style={{ display: 'grid', gap: '26px' }}>
        <Secao rotulo="A ficha" style={{ borderTop: 'none', paddingTop: 0 }}>
          <p style={{ ...CT.nota, fontSize: '11.5px', color: 'var(--text-muted)', margin: '0 0 10px' }}>
            Os quatro campos que o cliente preencheu. Só leitura — quem escreveu foi ele.
          </p>
          {ficha ? (
            <>
              <Linha rotulo="Setor" valor={ficha.sector} />
              <Linha rotulo="Consumo mensal" valor={ficha.monthlyConsumptionBand} />
              {/* `null` é "não sei dizer", e o backend converte string
                  vazia em `null` de propósito — "não sei" nunca viaja
                  como texto. A tela repete a distinção em vez de
                  achatá-la num traço mudo. */}
              <Linha
                rotulo="Modalidade tarifária"
                valor={
                  ficha.tariffModality ?? (
                    <span style={{ color: 'var(--text-faint)' }}>
                      o cliente não soube dizer
                    </span>
                  )
                }
              />
              <div style={{ paddingTop: '14px' }}>
                <span style={{ ...CT.eyebrow, fontSize: '9.5px', color: 'var(--text-faint)' }}>
                  A preocupação, nas palavras dele
                </span>
                <p
                  style={{
                    ...CT.corpo,
                    color: 'var(--text-body)',
                    margin: '8px 0 0',
                    paddingLeft: '14px',
                    borderLeft: 'var(--fio) solid var(--rule-strong)',
                    textWrap: 'pretty',
                  }}
                >
                  {ficha.concern}
                </p>
              </div>
            </>
          ) : (
            <p style={{ ...CT.nota, color: 'var(--text-faint)' }}>Ficha ausente nesta amostra.</p>
          )}
        </Secao>

        {/* A FOCAL desta tela, e por razao medida: sem entregavel, a
            mensagem no fio E a resposta deste produto. */}
        <Secao
          data-focal=""
          rotulo="O fio"
          nota="A conversa é do domínio de PLATAFORMA, não deste produto — o backend a modelou com origem opaca, e CLE e Solar herdam sem reescrever. Hoje só o Diagnóstico liga um fio ao caso."
        >
          {fio.length > 0 ? (
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '14px' }}>
              {fio.map((m) => {
                // `role` vem do SERVIDOR: `customer` é o dono da conta,
                // qualquer outro papel é operador. Quem é a casa não é
                // decisão da tela.
                const daCasa = m.role !== 'customer';
                return (
                  <li
                    key={m.id}
                    style={{
                      paddingLeft: '14px',
                      borderLeft: `2px solid ${daCasa ? 'var(--accent-house)' : 'var(--rule-strong)'}`,
                    }}
                  >
                    <p
                      style={{
                        ...CT.dado,
                        fontSize: '10.5px',
                        color: 'var(--text-faint)',
                        textTransform: 'uppercase',
                        letterSpacing: '.09em',
                        margin: '0 0 4px',
                      }}
                    >
                      {daCasa ? 'NIVAR' : 'cliente'}
                      <span aria-hidden="true" style={{ margin: '0 8px', color: 'var(--rule-strong)' }}>
                        ·
                      </span>
                      <span title={idadePorExtenso(m.createdAt, AGORA_DA_AMOSTRA)}>
                        há {formatarIdade(m.createdAt, AGORA_DA_AMOSTRA)}
                      </span>
                    </p>
                    <p style={{ ...CT.corpo, color: 'var(--text-body)', margin: 0, textWrap: 'pretty' }}>
                      {m.body}
                    </p>
                  </li>
                );
              })}
            </ol>
          ) : (
            <p style={{ ...CT.nota, color: 'var(--text-faint)', margin: 0 }}>
              Nenhuma mensagem ainda. O cliente enviou o escopo e não escreveu.
            </p>
          )}

          <div style={{ marginTop: '18px' }}>
            <CampoInerte placeholder="Responder ao cliente." linhas={4} />
            <p style={{ ...CT.nota, fontSize: '11px', color: 'var(--text-faint)', margin: '8px 0 0' }}>
              Inerte nesta wave. O endpoint de mensagem do operador EXISTE
              (<code style={{ ...CT.dado, fontSize: '11px' }}>POST /api/operator/conversations/…/messages</code>) — o
              que falta é o pedido ser real e a sessão carregar papel de operador.
            </p>
          </div>
        </Secao>

        {/* A ausência de entregável é o achado, não um buraco. */}
        <Secao rotulo="Entrega">
          <p style={{ ...CT.corpo, fontSize: '13px', color: 'var(--text-body)', margin: 0, textWrap: 'pretty' }}>
            <strong style={{ fontWeight: 500 }}>Este produto não tem entregável.</strong> Não existe
            endpoint nem coluna de entrega para o Diagnóstico Energético, ao contrário de Conta de
            Luz Express e Solar Proposal Validator. A resposta ao cliente é a mensagem no fio acima —
            não há PDF a anexar.
          </p>
          <p style={{ ...CT.nota, fontSize: '11.5px', color: 'var(--text-faint)', margin: '10px 0 0', textWrap: 'pretty' }}>
            Se a intenção do produto for entregar um documento, isso é coluna e rota novas no
            backend — decisão em aberto, registrada na recon da CURSOR. A tela declara a ausência em
            vez de mostrar um botão que não leva a lugar nenhum.
          </p>
        </Secao>
      </div>
    </div>
  );
}

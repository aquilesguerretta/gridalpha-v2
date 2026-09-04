// detalheCLE — ARCHITECT, Portal do Operador Wave 2, Fase 5.
//
// Conta de Luz Express. **Duas colunas: o documento fixo à esquerda, a
// leitura à direita.**
//
// ─── POR QUE ESTA FORMA, E NÃO OUTRA ─────────────────────────────────
// A fatura de concessionária é documento PADRONIZADO: o operador extrai
// os mesmos campos toda vez, na mesma ordem, olhando para a peça. Isso
// é bancada — a peça de um lado, a leitura do outro, as duas no campo de
// visão ao mesmo tempo. Rolar para conferir um número contra o
// documento é o atrito que a coluna fixa remove.
//
// É a diferença dura para o Solar, cujo documento é argumento e não
// formulário, e para o Diagnóstico, que não tem documento nenhum.
//
// ─── OS CAMPOS SAEM DA COPY PÚBLICA, NÃO DE PALPITE ──────────────────
// `ANATOMIA_FATURA` é derivada do passo 2 da própria página do produto
// (`ContaDeLuzExpressPage.tsx:843`): "Modalidade tarifária, demanda
// contratada e medida, tributos e encargos." A ordem é a da leitura da
// fatura, não alfabética.
//
// ─── TUDO INERTE, COM A RAZÃO AO LADO ────────────────────────────────
// Nenhum campo aceita digitação nesta wave, e cada seção diz por quê.

import { CT } from './consoleChrome';
import {
  CabecalhoDoPedido,
  CampoInerte,
  LugarDoDocumento,
  RAZAO_SEM_PERSISTENCIA,
  Secao,
} from './pecasDoPedido';
import { ANATOMIA_FATURA, type PedidoNaFila } from '../../lib/operador/mock';

export function DetalheCLE({ pedido, produto }: { pedido: PedidoNaFila; produto: string }) {
  return (
    <>
      <CabecalhoDoPedido pedido={pedido} produto={produto} />

      <div
        style={{
          display: 'grid',
          // A coluna do documento tem largura FIXA e a da leitura estica:
          // a peça tem proporção de papel e não deve deformar com a
          // janela; o texto do parecer, sim, ganha com a largura.
          gridTemplateColumns: 'minmax(300px, 380px) minmax(0, 1fr)',
          gap: '28px',
          alignItems: 'start',
        }}
      >
        {/* ESQUERDA — o documento, fixo enquanto a direita rola. */}
        <div style={{ position: 'sticky', top: 0 }}>
          <h2 style={{ ...CT.eyebrow, color: 'var(--text-strong)', margin: '0 0 10px' }}>
            O que chegou
          </h2>
          {pedido.arquivo ? (
            <LugarDoDocumento arquivo={pedido.arquivo} />
          ) : (
            <p style={{ ...CT.nota, color: 'var(--text-faint)' }}>Nenhum arquivo neste pedido.</p>
          )}
        </div>

        {/* DIREITA — a leitura. */}
        <div style={{ display: 'grid', gap: '26px' }}>
          <Secao
            rotulo="Anatomia da fatura"
            nota={RAZAO_SEM_PERSISTENCIA}
            style={{ borderTop: 'none', paddingTop: 0 }}
          >
            <p style={{ ...CT.nota, fontSize: '11.5px', color: 'var(--text-muted)', margin: '0 0 12px', maxWidth: '58ch' }}>
              Os mesmos campos em toda fatura, na ordem em que aparecem no documento. É o que
              distingue ler uma fatura de ler uma proposta.
            </p>
            <div style={{ display: 'grid', gap: '8px' }}>
              {ANATOMIA_FATURA.map((campo) => (
                <div
                  key={campo.chave}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(140px, 180px) minmax(0, 1fr)',
                    gap: '10px',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{ ...CT.eyebrow, fontSize: '9.5px', color: 'var(--text-faint)', lineHeight: 1.5 }}
                  >
                    {campo.rotulo}
                  </span>
                  <CampoInerte placeholder="—" unidade={campo.unidade} />
                </div>
              ))}
            </div>
          </Secao>

          {/* A FOCAL desta tela. A anatomia e entrada e o entregavel e
              saida; o parecer e o trabalho. */}
          <Secao rotulo="Parecer" nota={RAZAO_SEM_PERSISTENCIA} data-focal="">
            <p style={{ ...CT.nota, fontSize: '11.5px', color: 'var(--text-muted)', margin: '0 0 12px', maxWidth: '58ch' }}>
              A conclusão vem com o contraditório junto, não depois — é o que a página pública do
              produto promete ao cliente.
            </p>
            <CampoInerte placeholder="O parecer sobre esta fatura." linhas={7} />
          </Secao>

          <Secao
            rotulo="Entregável"
            nota="A rota de entrega EXISTE no backend (POST …/deliverable). O que falta é o pedido ser real: na amostra não há id para anexar nada."
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
      </div>
    </>
  );
}

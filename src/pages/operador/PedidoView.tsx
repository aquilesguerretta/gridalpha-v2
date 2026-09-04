// PedidoView — ARCHITECT, Portal do Operador Wave 2, Fase 3.
//
// O detalhe de um pedido. Despacha por NATUREZA do que o cliente mandou,
// não por id de produto — as três formas saem de fato medido nas recons
// de Wave 1, e a natureza é o nome desse fato
// (`src/lib/operador/catalogo.ts`).
//
// FASE 3 monta o despacho e o esqueleto. As três formas entram na Fase 5,
// depois de o Aquiles opinar sobre a proposta da Fase 1
// (`docs/operador-console-contratos.md` §4).

import { useLocation, useParams } from 'react-router-dom';

import { CT } from './consoleChrome';
import { nomeDoProduto, produtoComFilaPorId } from '../../lib/operador/catalogo';

export function PedidoView() {
  const { pedidoId } = useParams<{ pedidoId: string }>();
  const { pathname } = useLocation();
  const segmento = pathname.replace(/^\/operador\/?/, '').split('/')[0];
  const produto = produtoComFilaPorId(segmento);

  // O router só declara esta rota para produto do catálogo; o guarda
  // existe para o TypeScript, não para o usuário.
  if (!produto) return null;

  const nome = nomeDoProduto(produto.produtoId);

  return (
    <>
      <span style={{ ...CT.eyebrow, color: 'var(--text-faint)' }}>{nome}</span>
      <h1 style={{ ...CT.titulo, color: 'var(--text-strong)', margin: '4px 0 2px' }}>
        Pedido {pedidoId}
      </h1>
      <p style={{ ...CT.corpo, color: 'var(--text-muted)', maxWidth: '64ch' }}>
        A forma desta tela depende da natureza do que o cliente manda —{' '}
        <strong style={{ fontWeight: 500 }}>{produto.natureza}</strong>. As três formas entram na
        Fase 5.
      </p>
    </>
  );
}

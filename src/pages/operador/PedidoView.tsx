// PedidoView — ARCHITECT, Portal do Operador Wave 2, Fases 3 e 5.
//
// O detalhe de um pedido. **Despacha por NATUREZA do que o cliente
// mandou, não por id de produto.**
//
// A distinção não é estilística. Se despachasse por id, acrescentar um
// quarto produto Advisory exigiria decidir de novo, do zero, que forma
// ele tem. Despachando por natureza, o produto novo declara no catálogo
// se recebe documento padronizado, documento aberto ou ficha — e herda a
// forma que corresponde. As três naturezas saem de fato medido nas
// recons de Wave 1 (`src/lib/operador/catalogo.ts`).
//
// As três formas foram propostas na Fase 1
// (`docs/operador-console-contratos.md` §4) e aprovadas antes de
// qualquer linha ser escrita.

import { useLocation, useParams } from 'react-router-dom';

import { CT } from './consoleChrome';
import { DetalheCLE } from './detalheCLE';
import { DetalheSolar } from './detalheSolar';
import { DetalheDiagnostico } from './detalheDiagnostico';
import { EstadoVazio } from '../../components/nivar/tabela';
import { nomeDoProduto, produtoComFilaPorId } from '../../lib/operador/catalogo';
import { pedidoPorId } from '../../lib/operador/mock';

export function PedidoView() {
  const { pedidoId } = useParams<{ pedidoId: string }>();
  const { pathname } = useLocation();
  const segmento = pathname.replace(/^\/operador\/?/, '').split('/')[0];
  const produto = produtoComFilaPorId(segmento);

  // O router só declara esta rota para produto do catálogo; o guarda
  // existe para o TypeScript, não para o usuário.
  if (!produto) return null;

  const nome = nomeDoProduto(produto.produtoId);
  const pedido = pedidoId ? pedidoPorId(pedidoId) : undefined;

  // Id que não está na amostra é endereço plausível sem dado por trás —
  // e nesta wave isso é o normal, não erro: a fila é mock. Dizer isso é
  // melhor que um 404, que afirmaria que o endereço não existe.
  if (!pedido || pedido.produtoId !== produto.produtoId) {
    return (
      <>
        <span style={{ ...CT.eyebrow, color: 'var(--text-faint)' }}>{nome}</span>
        <h1 style={{ ...CT.display, color: 'var(--text-strong)', margin: '4px 0 16px' }}>
          {pedidoId}
        </h1>
        <EstadoVazio
          variante="sem-dado"
          etiqueta="Fora da amostra"
          titulo="Este pedido não está na amostra."
          corpo="A fila desta wave é uma amostra fixa, não uma consulta. Um identificador que não está nela não tem o que exibir — o que muda quando o endpoint de fila existir."
        />
      </>
    );
  }

  switch (produto.natureza) {
    case 'documento-padronizado':
      return <DetalheCLE pedido={pedido} produto={nome} />;
    case 'documento-aberto':
      return <DetalheSolar pedido={pedido} produto={nome} />;
    case 'ficha':
      return <DetalheDiagnostico pedido={pedido} produto={nome} />;
  }
}

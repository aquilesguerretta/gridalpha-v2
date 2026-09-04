// FilaView — ARCHITECT, Portal do Operador Wave 2, Fase 3.
//
// A fila de pedidos. Serve `/operador` (tudo) e `/operador/<produto>`
// (um produto), porque a diferença entre as duas é um FILTRO, não uma
// tela.
//
// Não valida `produtoId`: o `OperadorRouter` só declara rota para
// produto que existe no catálogo de fila, então um id desconhecido nunca
// chega aqui — cai no catch-all e devolve 404 real.
//
// FASE 3 monta o chassi e o estado vazio. A tabela com dado mock entra
// na Fase 4.

import { useLocation } from 'react-router-dom';

import { CT } from './consoleChrome';
import { EstadoVazio } from '../../components/nivar/tabela';
import { nomeDoProduto, produtoComFilaPorId } from '../../lib/operador/catalogo';

export function FilaView() {
  // O produto sai do endereço, não de prop: a rota é a fonte de qual
  // fila está aberta, e derivar dela evita o par view/shell discordarem.
  const { pathname } = useLocation();
  const segmento = pathname.replace(/^\/operador\/?/, '').split('/')[0];
  const produto = segmento ? produtoComFilaPorId(segmento) : undefined;

  const titulo = produto ? nomeDoProduto(produto.produtoId) : 'Fila completa';

  return (
    <>
      <h1 style={{ ...CT.titulo, color: 'var(--text-strong)', margin: '0 0 2px' }}>{titulo}</h1>
      <p style={{ ...CT.nota, color: 'var(--text-muted)', margin: '0 0 20px', maxWidth: '68ch' }}>
        {produto
          ? 'Os pedidos deste produto, do mais antigo ao mais recente.'
          : 'Todos os pedidos que chegaram, de todos os produtos com fila, do mais antigo ao mais recente.'}
      </p>

      <EstadoVazio
        variante="sem-dado"
        etiqueta="Sem fila"
        titulo="A superfície existe. O endereço de fila ainda não."
        corpo={
          produto
            ? `Nenhum pedido de ${titulo} para exibir. O backend não tem endpoint que liste submissões de todos os clientes — o que existe hoje é escopado à conta de quem pede.`
            : 'Nenhum pedido para exibir. O backend não tem endpoint que liste submissões de todos os clientes — o que existe hoje é escopado à conta de quem pede.'
        }
        meta="Dado mock entra na Fase 4 · endpoint real na wave de ligação"
      />
    </>
  );
}

// FilaView — ARCHITECT, Portal do Operador, revisão visual pós-Wave 2.
//
// A fila de pedidos. Serve /operador (tudo) e /operador/<produto> (um
// produto): a diferença é um filtro, não uma tela.
//
// ─── HERO à esquerda, o patrono preside, trilho à direita ────────────
// O número é HERO de verdade: preso ao rótulo na mesma baseline, com
// UMA linha de dado embaixo em mono ("4 aguardam leitura · 1 entregue ·
// 2 sem estado") — o deck de duas linhas de prosa saiu na revisão: tinha
// mais massa que o dígito e repetia o que o trilho lista. O patrono da
// família aberta (ou Diógenes, pela casa) preside o bloco.
//
// ─── UM NOME POR CONTAGEM ────────────────────────────────────────────
// "na fila" = todos; "por ler" = aguardando + sem estado; "aguardando"
// = só status submitted. A versão anterior dizia "6 aguardando" no
// masthead a 90px de "4 aguardam" no herói.
//
// ─── IDADE, NUNCA PRAZO ──────────────────────────────────────────────
// Tempo decorrido cru, cor única, ordenação padrão do mais antigo.
// A frase de doutrina aparece uma vez, no pé da tabela, em mono.

import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { CT, comTransicao } from './consoleChrome';
import { LinhaDoTrilho } from './pecasDoPedido';
import { EstadoVazio, Frescor, Tabela, type ColunaTabela, type Ordem } from '../../components/nivar/tabela';
import { Figura, PATRONO_DA_CASA, PATRONO_DA_FAMILIA } from '../../components/nivar/patrono';
import { familiaPorId } from '../../lib/data/br-familias';
import { nomeDoProduto, produtoComFilaPorId } from '../../lib/operador/catalogo';
import { AGORA_DA_AMOSTRA, filaDe, type PedidoNaFila } from '../../lib/operador/mock';
import { formatarData, formatarIdade, idadePorExtenso, medirIdade } from '../../lib/operador/idade';

/** Estado em mono caixa baixa — sem pílula, sem cor de status. */
function Estado({ status }: { status: PedidoNaFila['status'] }) {
  if (status === null) {
    return (
      <span style={{ ...CT.dado, color: 'var(--text-faint)' }} title="Este produto não tem campo de estado no backend.">
        sem estado
      </span>
    );
  }
  return (
    <span style={{ ...CT.dado, color: status === 'submitted' ? 'var(--text-strong)' : 'var(--text-muted)' }}>
      {status === 'submitted' ? 'aguardando' : 'entregue'}
    </span>
  );
}

export function FilaView() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const segmento = pathname.replace(/^\/operador\/?/, '').split('/')[0];
  const produto = segmento ? produtoComFilaPorId(segmento) : undefined;
  const titulo = produto ? nomeDoProduto(produto.produtoId) : 'Fila completa';
  const familia = produto ? familiaPorId(produto.familiaId) : undefined;
  const patrono = familia ? PATRONO_DA_FAMILIA[familia.id] : PATRONO_DA_CASA;

  const [ordenadaPor, setOrdenadaPor] = useState('idade');
  const [ordem, setOrdem] = useState<Ordem>('desc');

  const linhas = useMemo(() => {
    const base = [...filaDe(produto?.produtoId)];
    const sinal = ordem === 'asc' ? 1 : -1;
    const texto = (a: string, b: string) => a.localeCompare(b, 'pt-BR') * sinal;
    return base.sort((a, b) => {
      switch (ordenadaPor) {
        case 'produto':
          return texto(nomeDoProduto(a.produtoId), nomeDoProduto(b.produtoId));
        case 'cliente':
          return texto(a.cliente, b.cliente);
        case 'estado':
          if (a.status === b.status) return 0;
          if (a.status === null) return 1;
          if (b.status === null) return -1;
          return texto(a.status, b.status);
        case 'enviado':
        case 'idade':
          return (medirIdade(a.criadoEm, AGORA_DA_AMOSTRA).ms - medirIdade(b.criadoEm, AGORA_DA_AMOSTRA).ms) * sinal;
        default:
          return 0;
      }
    });
  }, [produto?.produtoId, ordenadaPor, ordem]);

  const aguardando = linhas.filter((p) => p.status === 'submitted').length;
  const entregues = linhas.filter((p) => p.status === 'ready').length;
  const semEstado = linhas.filter((p) => p.status === null).length;
  const porLer = aguardando + semEstado;
  const maisAntigo = linhas.reduce<PedidoNaFila | undefined>(
    (pior, p) => (!pior || medirIdade(p.criadoEm, AGORA_DA_AMOSTRA).ms > medirIdade(pior.criadoEm, AGORA_DA_AMOSTRA).ms ? p : pior),
    undefined,
  );

  // A linha de dado sob o número — derivada, em tokens.
  const tokens: string[] = [];
  if (aguardando) tokens.push(`${aguardando} ${aguardando === 1 ? 'aguarda' : 'aguardam'} leitura`);
  if (entregues) tokens.push(`${entregues} ${entregues === 1 ? 'entregue' : 'entregues'}`);
  if (semEstado) tokens.push(`${semEstado} sem estado`);

  const pesoIdade = ordenadaPor === 'idade' ? 500 : 400;

  const colunas: ColunaTabela<PedidoNaFila>[] = [
    ...(produto
      ? []
      : [
          {
            chave: 'produto',
            rotulo: 'Produto',
            ordenavel: true,
            largura: '190px',
            celula: (p: PedidoNaFila) => <span style={{ ...CT.corpo, color: 'var(--text-muted)' }}>{nomeDoProduto(p.produtoId)}</span>,
          },
        ]),
    {
      chave: 'cliente',
      rotulo: 'Cliente',
      ordenavel: true,
      celula: (p) => (
        <Link
          className="op-cliente"
          to={`/operador/${p.produtoId}/${p.id}`}
          onClick={(e) => {
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            comTransicao(() => navigate(`/operador/${p.produtoId}/${p.id}`));
          }}
          style={{ ...CT.corpo, fontWeight: 500 }}
        >
          {p.cliente}
        </Link>
      ),
    },
    { chave: 'enviado', rotulo: 'Enviado', numerico: true, ordenavel: true, largura: '124px', celula: (p) => formatarData(p.criadoEm) },
    { chave: 'estado', rotulo: 'Estado', ordenavel: true, largura: '124px', celula: (p) => <Estado status={p.status} /> },
    {
      chave: 'idade',
      rotulo: 'Idade',
      numerico: true,
      ordenavel: true,
      largura: '96px',
      celula: (p) => (
        <span title={idadePorExtenso(p.criadoEm, AGORA_DA_AMOSTRA)} style={{ fontWeight: pesoIdade }}>
          {formatarIdade(p.criadoEm, AGORA_DA_AMOSTRA)}
        </span>
      ),
    },
  ];

  if (linhas.length === 0) {
    return (
      <EstadoVazio
        variante="sem-dado"
        etiqueta={titulo}
        titulo="Nenhum pedido neste produto."
        corpo="A amostra não tem pedido aqui. Quando o endpoint de fila existir, esta tela lerá o dado real."
      />
    );
  }

  return (
    <div className="op-pagina">
      <div style={{ minWidth: 0 }}>
        <header
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1fr) auto',
            gap: '0 28px',
            alignItems: 'center',
            paddingLeft: '18px',
            borderLeft: '2px solid var(--acento-contexto)',
            marginBottom: '28px',
            maxWidth: '1120px',
          }}
        >
          <div style={{ display: 'grid', gap: '8px' }}>
            <p style={{ display: 'flex', alignItems: 'baseline', gap: '12px', margin: 0 }}>
              <span style={{ ...CT.heroi, color: 'var(--text-strong)' }}>{linhas.length}</span>
              <span style={{ ...CT.dado, color: 'var(--text-muted)' }}>
                {linhas.length === 1 ? 'pedido' : 'pedidos'}
                {produto ? ` · ${titulo}` : ' na fila'}
              </span>
            </p>
            <p style={{ ...CT.dado, color: 'var(--text-body)', margin: 0, display: 'flex', flexWrap: 'wrap', gap: '4px 0' }}>
              {tokens.map((t, i) => (
                <span key={t} style={{ whiteSpace: 'nowrap' }}>
                  {i > 0 ? (
                    <span aria-hidden="true" style={{ margin: '0 10px', color: 'var(--rule-strong)' }}>
                      ·
                    </span>
                  ) : null}
                  {t}
                </span>
              ))}
            </p>
          </div>
          {/* O patrono preside a fila. Figura, não ícone. */}
          <Figura patrono={patrono} tamanho={112} style={{ marginRight: '8px' }} />
        </header>

        <Tabela
          colunas={colunas}
          linhas={linhas}
          chaveDe={(p) => p.id}
          zebra={false}
          ordenadaPor={ordenadaPor}
          ordem={ordem}
          onOrdenar={(chave, proxima) => {
            setOrdenadaPor(chave);
            setOrdem(proxima);
          }}
        />
        {/* A doutrina, uma vez, em mono, no pé. */}
        <p style={{ ...CT.dado, color: 'var(--text-faint)', margin: '12px 0 0', maxWidth: '1120px' }}>
          idade = tempo decorrido, nunca prazo · do mais antigo ao mais recente
        </p>
      </div>

      <aside className="op-trilho" aria-label="Leitura da fila">
        <p style={{ ...CT.eyebrow, color: 'var(--text-faint)', margin: '0 0 4px' }}>Leitura</p>
        <LinhaDoTrilho rotulo="Por ler" valor={String(porLer)} forte />
        <LinhaDoTrilho rotulo="Aguardando" valor={String(aguardando)} />
        <LinhaDoTrilho rotulo="Entregues" valor={String(entregues)} />
        <LinhaDoTrilho rotulo="Sem estado" valor={String(semEstado)} title="O Diagnóstico Energético não tem campo de estado no backend." />
        {maisAntigo ? <LinhaDoTrilho rotulo="Mais antigo" valor={formatarIdade(maisAntigo.criadoEm, AGORA_DA_AMOSTRA)} /> : null}
        <div style={{ marginTop: '16px' }}>
          <Frescor estado="ilustrativa" detalhe="nome do cliente é da amostra" />
        </div>
      </aside>
    </div>
  );
}

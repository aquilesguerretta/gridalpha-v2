// FilaView — ARCHITECT, Portal do Operador, revisão visual pós-Wave 2.
//
// A fila de pedidos. Serve `/operador` (tudo) e `/operador/<produto>`
// (um produto): a diferença é um filtro, não uma tela.
//
// ─── COMPOSIÇÃO: HERO à esquerda, trilho à direita ───────────────────
// A versão anterior abria com um "7 PEDIDOS" gigante e uma tira de três
// células iguais — que é, palavra por palavra, o anti-padrão "stats
// section with oversized floating numbers and tiny labels" do próprio
// skill (terminal-antipatterns.md). O número agora é HERO de verdade:
// preso ao sufixo, com uma linha de identidade em Work Sans 300 embaixo
// que DIZ o que o número contém — quatro aguardam, um foi entregue, dois
// sem estado. Um número aparece uma vez; a tira sumiu.
//
// O trilho da direita existe por assimetria com função: a página estava
// "presa à esquerda com vazio à direita". O trilho leva o que era nota
// solta sob a tabela — as contagens como lista, a explicação de "sem
// estado", o selo — para um lugar próprio, e a coluna principal fica só
// com o dado.
//
// ─── IDADE, NUNCA PRAZO ──────────────────────────────────────────────
// Tempo decorrido cru, cor única, ordenação padrão do mais antigo. Zero
// barra, zero rótulo de atrasado. O raciocínio está em lib/operador/idade.ts.

import { useMemo, useState, type CSSProperties } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { CT, comTransicao } from './consoleChrome';
import { EstadoVazio, Frescor, Tabela, type ColunaTabela, type Ordem } from '../../components/nivar/tabela';
import { nomeDoProduto, produtoComFilaPorId } from '../../lib/operador/catalogo';
import { AGORA_DA_AMOSTRA, filaDe, type PedidoNaFila } from '../../lib/operador/mock';
import { formatarData, formatarIdade, idadePorExtenso, medirIdade } from '../../lib/operador/idade';

/** Rótulo de estado em texto puro — sem pílula, sem cor de status. O
 *  backend só tem dois valores; o terceiro caso (produto SEM o campo)
 *  se declara em vez de virar estado inventado. */
function Estado({ status }: { status: PedidoNaFila['status'] }) {
  if (status === null) {
    return (
      <span style={{ ...CT.dado, color: 'var(--text-faint)' }} title="Este produto não tem campo de estado no backend.">
        sem estado
      </span>
    );
  }
  return (
    <span
      style={{
        ...CT.eyebrow,
        color: status === 'submitted' ? 'var(--text-strong)' : 'var(--text-muted)',
      }}
    >
      {status === 'submitted' ? 'aguardando' : 'entregue'}
    </span>
  );
}

/** Uma linha do trilho: rótulo à esquerda, valor mono à direita, fio
 *  embaixo. Lista, não célula. */
function LinhaDoTrilho({ rotulo, valor, forte }: { rotulo: string; valor: string; forte?: boolean }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: '12px',
        padding: '7px 0',
        borderBottom: 'var(--fio) solid var(--rule)',
      }}
    >
      <span style={{ ...CT.corpoLeve, color: forte ? 'var(--text-strong)' : 'var(--text-muted)' }}>{rotulo}</span>
      <span style={{ ...CT.dado, color: forte ? 'var(--text-strong)' : 'var(--text-body)', fontWeight: forte ? 500 : 400 }}>
        {valor}
      </span>
    </div>
  );
}

export function FilaView() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const segmento = pathname.replace(/^\/operador\/?/, '').split('/')[0];
  const produto = segmento ? produtoComFilaPorId(segmento) : undefined;
  const titulo = produto ? nomeDoProduto(produto.produtoId) : 'Fila completa';

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
          return (
            (medirIdade(a.criadoEm, AGORA_DA_AMOSTRA).ms - medirIdade(b.criadoEm, AGORA_DA_AMOSTRA).ms) * sinal
          );
        default:
          return 0;
      }
    });
  }, [produto?.produtoId, ordenadaPor, ordem]);

  const aguardando = linhas.filter((p) => p.status === 'submitted').length;
  const entregues = linhas.filter((p) => p.status === 'ready').length;
  const semEstado = linhas.filter((p) => p.status === null).length;
  const maisAntigo = linhas.reduce<PedidoNaFila | undefined>(
    (pior, p) =>
      !pior || medirIdade(p.criadoEm, AGORA_DA_AMOSTRA).ms > medirIdade(pior.criadoEm, AGORA_DA_AMOSTRA).ms ? p : pior,
    undefined,
  );

  // A linha de identidade é DERIVADA das contagens — nunca digitada.
  const partes: string[] = [];
  if (aguardando) partes.push(`${aguardando} ${aguardando === 1 ? 'aguarda' : 'aguardam'} leitura`);
  if (entregues) partes.push(`${entregues} ${entregues === 1 ? 'entregue' : 'entregues'}`);
  if (semEstado) partes.push(`${semEstado} sem campo de estado`);
  const identidade = partes.length ? partes.join(', ') + '.' : 'Nenhum pedido.';

  const colunas: ColunaTabela<PedidoNaFila>[] = [
    ...(produto
      ? []
      : [
          {
            chave: 'produto',
            rotulo: 'Produto',
            ordenavel: true,
            largura: '190px',
            celula: (p: PedidoNaFila) => (
              <span style={{ color: 'var(--text-muted)' }}>{nomeDoProduto(p.produtoId)}</span>
            ),
          },
        ]),
    {
      chave: 'cliente',
      rotulo: 'Cliente',
      ordenavel: true,
      celula: (p) => (
        <Link
          to={`/operador/${p.produtoId}/${p.id}`}
          onClick={(e) => {
            if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            comTransicao(() => navigate(`/operador/${p.produtoId}/${p.id}`));
          }}
          style={{
            ...CT.nome,
            color: 'var(--text-strong)',
            textDecoration: 'none',
            borderBottom: '1px solid var(--rule-strong)',
            paddingBottom: '1px',
          }}
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
        <span title={idadePorExtenso(p.criadoEm, AGORA_DA_AMOSTRA)} style={{ fontWeight: 500 }}>
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
    <div className="op-fila">
      <div style={{ minWidth: 0 }}>
        {/* HERO — número preso ao sufixo, fio de 2px na cor da família
            aberta à esquerda, identidade embaixo. */}
        <header
          style={{
            display: 'grid',
            gap: '6px',
            paddingLeft: '18px',
            borderLeft: '2px solid var(--acento-contexto)',
            marginBottom: '26px',
          }}
        >
          <p style={{ display: 'flex', alignItems: 'baseline', gap: '10px', margin: 0 }}>
            <span style={{ ...CT.heroi, color: 'var(--text-strong)' }}>{linhas.length}</span>
            <span style={{ ...CT.eyebrow, color: 'var(--text-muted)', fontSize: '11.5px' }}>
              {linhas.length === 1 ? 'pedido' : 'pedidos'}
              {produto ? ` · ${titulo}` : ' na fila'}
            </span>
          </p>
          <p style={{ ...CT.lede, color: 'var(--text-muted)', margin: 0, maxWidth: '52ch', textWrap: 'pretty' } as CSSProperties}>
            {identidade} Do mais antigo ao mais recente — a idade é tempo decorrido, não prazo.
          </p>
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
      </div>

      {/* TRILHO — o que era nota solta vira lista com fio. */}
      <aside className="op-fila__trilho" aria-label="Leitura da fila">
        <p style={{ ...CT.eyebrow, color: 'var(--text-faint)', margin: '0 0 6px' }}>Leitura</p>
        <LinhaDoTrilho rotulo="Aguardando" valor={String(aguardando)} forte />
        <LinhaDoTrilho rotulo="Entregues" valor={String(entregues)} />
        <LinhaDoTrilho rotulo="Sem campo de estado" valor={String(semEstado)} />
        {maisAntigo ? (
          <LinhaDoTrilho rotulo="Mais antigo" valor={formatarIdade(maisAntigo.criadoEm, AGORA_DA_AMOSTRA)} />
        ) : null}

        <p style={{ ...CT.corpoLeve, color: 'var(--text-muted)', margin: '18px 0 0', textWrap: 'pretty' } as CSSProperties}>
          <span style={{ fontWeight: 500, color: 'var(--text-body)' }}>Sem estado</span> não é falha: o
          Diagnóstico Energético não tem campo de estado no backend. Os outros dois têm dois.
        </p>
        <p style={{ ...CT.corpoLeve, color: 'var(--text-muted)', margin: '10px 0 18px', textWrap: 'pretty' } as CSSProperties}>
          O nome do cliente é da amostra — a listagem real devolve identificador opaco.
        </p>
        <Frescor estado="ilustrativa" detalhe="endpoint de fila por vir" />
      </aside>
    </div>
  );
}

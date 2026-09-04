// FilaView — ARCHITECT, Portal do Operador Wave 2, Fases 3 e 4.
//
// A fila de pedidos. Serve `/operador` (tudo) e `/operador/<produto>`
// (um produto), porque a diferença entre as duas é um FILTRO, não uma
// tela.
//
// Não valida o segmento de produto: o `OperadorRouter` só declara rota
// para produto que existe no catálogo de fila, então id desconhecido
// nunca chega aqui — cai no catch-all e devolve 404 real.
//
// ─── IDADE, NUNCA PRAZO ──────────────────────────────────────────────
// A coluna de idade mostra tempo decorrido cru, em cor única, e é a
// ordenação padrão (mais antigo no topo). Nenhuma barra, nenhum rótulo
// de atrasado, nenhum prazo — a NIVAR não assumiu compromisso de prazo
// com cliente nenhum. O raciocínio inteiro está em `lib/operador/idade.ts`.
//
// ─── DADO MOCK, DECLARADO ────────────────────────────────────────────
// `<Frescor estado="ilustrativa">` no topo. Não é aviso improvisado: é o
// carimbo que o próprio sistema usa para dado que não é apuração real
// (`components/data/data.css`, `.nv-frescor--ilustrativa`), e é a
// linguagem que o AGENTS.md fixa para ausência de fonte.

import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { CT, comTransicao } from './consoleChrome';
import { EstadoVazio, Frescor, Tabela, type ColunaTabela, type Ordem } from '../../components/nivar/tabela';
import { nomeDoProduto, produtoComFilaPorId } from '../../lib/operador/catalogo';
import { AGORA_DA_AMOSTRA, filaDe, type PedidoNaFila } from '../../lib/operador/mock';
import { formatarData, formatarIdade, idadePorExtenso, medirIdade } from '../../lib/operador/idade';

/** A tabela não estica até a borda da janela. Cinco colunas em 1590px
 *  jogam "enviado" e "idade" a 200px do dado que descrevem, e a
 *  varredura vertical — a única razão de existir tabela densa — morre.
 *  Esta medida mantém as colunas juntas o bastante para o olho descer
 *  uma coluna sem perder a linha. */
const MEDIDA_DA_FILA = '1140px';

/** Rótulo de estado. O backend só tem dois valores, e o terceiro caso —
 *  produto SEM o campo — se declara em vez de virar um estado inventado
 *  (`src/lib/diagnostico/api.ts:27`). */
function Estado({ status }: { status: PedidoNaFila['status'] }) {
  if (status === null) {
    return (
      <span
        style={{ ...CT.dado, color: 'var(--text-faint)' }}
        title="Este produto não tem campo de estado no backend."
      >
        sem estado
      </span>
    );
  }
  const forte = status === 'submitted';
  return (
    <span
      style={{
        ...CT.dado,
        color: forte ? 'var(--text-strong)' : 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '.09em',
        fontSize: '10.5px',
      }}
    >
      {status === 'submitted' ? 'aguardando' : 'entregue'}
    </span>
  );
}

export function FilaView() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // O produto sai do endereço, não de prop: a rota é a fonte de qual
  // fila está aberta, e derivar dela evita view e chassi discordarem.
  const segmento = pathname.replace(/^\/operador\/?/, '').split('/')[0];
  const produto = segmento ? produtoComFilaPorId(segmento) : undefined;
  const titulo = produto ? nomeDoProduto(produto.produtoId) : 'Fila completa';

  // Padrão: idade decrescente — o mais antigo no topo. É a única ordem
  // que um operador quer ao abrir a tela, e ainda assim NÃO é promessa
  // de nada: é ordenação, não fila de prioridade contratada.
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
          // `null` vai para o fim em asc: ausência não se ordena junto
          // com valor, e enfiá-la entre 'ready' e 'submitted' fingiria
          // que é um terceiro estado.
          if (a.status === b.status) return 0;
          if (a.status === null) return 1;
          if (b.status === null) return -1;
          return texto(a.status, b.status);
        case 'enviado':
        case 'idade':
          // Ordena pelo NÚMERO, nunca pelo texto formatado: "3 d 4 h"
          // ordenado como string põe 12 min antes de 3 d.
          return (
            (medirIdade(a.criadoEm, AGORA_DA_AMOSTRA).ms -
              medirIdade(b.criadoEm, AGORA_DA_AMOSTRA).ms) *
            sinal
          );
        default:
          return 0;
      }
    });
  }, [produto?.produtoId, ordenadaPor, ordem]);

  const colunas: ColunaTabela<PedidoNaFila>[] = [
    ...(produto
      ? []
      : [
          {
            chave: 'produto',
            rotulo: 'Produto',
            ordenavel: true,
            celula: (p: PedidoNaFila) => nomeDoProduto(p.produtoId),
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
          style={{ color: 'inherit', textDecoration: 'none', borderBottom: '1px solid var(--rule-strong)' }}
        >
          {p.cliente}
        </Link>
      ),
    },
    {
      chave: 'enviado',
      rotulo: 'Enviado',
      numerico: true,
      ordenavel: true,
      celula: (p) => formatarData(p.criadoEm),
    },
    { chave: 'estado', rotulo: 'Estado', ordenavel: true, celula: (p) => <Estado status={p.status} /> },
    {
      chave: 'idade',
      rotulo: 'Idade',
      numerico: true,
      ordenavel: true,
      // `title` e `aria-label` levam a medida por extenso: a forma curta
      // é boa para varrer com o olho e ruim para ouvir.
      celula: (p) => (
        <span title={idadePorExtenso(p.criadoEm, AGORA_DA_AMOSTRA)}>
          {formatarIdade(p.criadoEm, AGORA_DA_AMOSTRA)}
        </span>
      ),
    },
  ];

  const semNada = linhas.length === 0;

  // As três contagens do resumo. Sem cor por estado — `no-semaforo` vale
  // aqui como em todo lugar, e "aguardando" não é vermelho.
  const aguardando = linhas.filter((p) => p.status === 'submitted').length;
  const entregues = linhas.filter((p) => p.status === 'ready').length;
  const semEstado = linhas.filter((p) => p.status === null).length;

  // A idade do mais antigo da fila — o rodapé devolve o extremo depois
  // da varredura, sem que ninguém precise reler a primeira linha.
  const maisAntigo = linhas.reduce(
    (pior, p) =>
      medirIdade(p.criadoEm, AGORA_DA_AMOSTRA).ms > medirIdade(pior.criadoEm, AGORA_DA_AMOSTRA).ms
        ? p
        : pior,
    linhas[0],
  );

  return (
    <div style={{ maxWidth: MEDIDA_DA_FILA }}>
      {/* BLOCO DE TÍTULO — o foco da tela.
          Antes: h1 de 24px e o número de pedidos enterrado numa linha de
          10,5px. Não havia onde o olho pousar. Agora o título usa a
          escala de display (32px) e a CONTAGEM é numeral mono de 40px,
          que é o dado que o operador quer antes de qualquer outro. */}
      <header
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: '12px 32px',
          paddingBottom: '14px',
          borderBottom: 'var(--fio-forte) solid var(--rule-heavy)',
          marginBottom: '2px',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 'var(--fw-display)',
              fontSize: 'var(--ts-display-3)',
              lineHeight: 'var(--lh-display-3)',
              letterSpacing: 'var(--tr-display-3)',
              color: 'var(--text-strong)',
              margin: 0,
            }}
          >
            {titulo}
          </h1>
          <p style={{ ...CT.nota, color: 'var(--text-muted)', margin: '7px 0 0', maxWidth: '58ch' }}>
            {produto
              ? 'Os pedidos deste produto, do mais antigo ao mais recente.'
              : 'Todos os pedidos que chegaram, de todos os produtos com fila.'}{' '}
            A coluna de idade é tempo decorrido, nunca prazo.
          </p>
        </div>

        <p
          style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '9px',
            margin: 0,
            flex: 'none',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-data)',
              fontWeight: 500,
              fontSize: 'var(--ts-dado-1)',
              lineHeight: 'var(--lh-dado-1)',
              letterSpacing: '-.03em',
              color: 'var(--text-strong)',
              fontVariantNumeric: 'tabular-nums lining-nums',
            }}
          >
            {linhas.length}
          </span>
          <span style={{ ...CT.eyebrow, color: 'var(--text-faint)' }}>
            {linhas.length === 1 ? 'pedido' : 'pedidos'}
          </span>
        </p>
      </header>

      <div style={{ margin: '10px 0 22px' }}>
        <Frescor estado="ilustrativa" detalhe="o endpoint de fila ainda não existe" />
      </div>

      {/* TIRA DE RESUMO — três contagens em mono grande. Entrou porque a
          tela terminava a tabela e deixava ~600px de creme morto: nada
          para o olho fazer, e nenhuma leitura agregada da fila. */}
      {!semNada ? (
        <div className="op-resumo" style={{ marginBottom: '26px' }}>
          <div className="op-resumo__cel" data-focal="">
            <span className="op-resumo__n">{aguardando}</span>
            <span className="op-resumo__rot">Aguardando leitura</span>
          </div>
          <div className="op-resumo__cel">
            <span className="op-resumo__n">{entregues}</span>
            <span className="op-resumo__rot">Parecer entregue</span>
          </div>
          <div className="op-resumo__cel">
            <span className="op-resumo__n">{semEstado}</span>
            <span className="op-resumo__rot">Sem campo de estado</span>
          </div>
        </div>
      ) : null}

      {semNada ? (
        <EstadoVazio
          variante="sem-dado"
          etiqueta="Sem fila"
          titulo="Nenhum pedido neste produto."
          corpo="A amostra não tem pedido para este produto. Quando o endpoint de fila existir, esta tela lerá o dado real."
        />
      ) : (
        <>
          <Tabela
            colunas={colunas}
            linhas={linhas}
            chaveDe={(p) => p.id}
            ordenadaPor={ordenadaPor}
            ordem={ordem}
            onOrdenar={(chave, proxima) => {
              setOrdenadaPor(chave);
              setOrdem(proxima);
            }}
            rodape={{
              [produto ? 'cliente' : 'produto']: `${linhas.length} ${linhas.length === 1 ? 'pedido' : 'pedidos'}`,
              idade: maisAntigo ? formatarIdade(maisAntigo.criadoEm, AGORA_DA_AMOSTRA) : null,
            }}
          />
          <p style={{ ...CT.nota, color: 'var(--text-faint)', maxWidth: '68ch', marginTop: '12px' }}>
            <strong style={{ fontWeight: 500 }}>sem estado</strong> não é falha de leitura:
            Diagnóstico Energético não tem campo de estado no backend, ao contrário de Conta de Luz
            Express e Solar Proposal Validator, que têm dois. O nome do cliente é da amostra — a
            listagem real devolve identificador opaco, sem nome.
          </p>
        </>
      )}
    </div>
  );
}

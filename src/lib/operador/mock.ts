// src/lib/operador/mock.ts
// ARCHITECT — Portal do Operador Wave 2, Fase 4.
//
// A fila de amostra. **Nada aqui é dado real, e a tela diz isso** — o
// carimbo `.nv-frescor--ilustrativa` fica no topo de toda superfície que
// consome este módulo.
//
// ─── ZERO REDE ───────────────────────────────────────────────────────
// Este arquivo não importa cliente de API e não faz `fetch`. O endpoint
// de fila não existe: a recon da CURSOR mediu que
// `GET {prefixo}/submissions` é escopado à conta de quem pede, e que
// `GET /api/operator/conversations` lista conversa, não submissão. A
// wave de ligação troca este módulo por leitura real.
//
// ─── O FORMATO SEGUE O CONTRATO REAL, NÃO O CONTRÁRIO ────────────────
// Os campos abaixo são os que os clientes de verdade já devolvem
// (`src/lib/submissoes/api.ts:39-51` e `src/lib/diagnostico/api.ts:29`),
// para a wave de ligação ser troca de origem e não reescrita de tela:
//
//   · `status` só existe em CLE e Solar, e só assume 'submitted' ou
//     'ready'. Diagnóstico NÃO TEM o campo — aqui ele é `null`, e a
//     coluna declara a ausência em vez de inventar um terceiro valor.
//   · `createdAt` é ISO, como vem do backend.
//   · `deliveredAt` só é preenchido com `status: 'ready'`.
//
// ─── O NOME DO CLIENTE É A MAIOR LICENÇA DESTE ARQUIVO ───────────────
// O backend devolve `userId` OPACO — a recon da CURSOR mediu que a
// listagem não faz join com `users`, então nome e e-mail não chegam. Os
// nomes abaixo são inventados para a coluna ter forma; na wave de
// ligação, ou o join existe, ou a coluna passa a declarar ausência como
// o `status` do Diagnóstico já faz. Registrado para ninguém confundir
// "a tela mostra" com "o dado existe".

/** Uma linha da fila. União dos três produtos: o que é específico de um
 *  vira campo opcional, e o que um produto não tem é `null` explícito —
 *  nunca ausência silenciosa. */
export interface PedidoNaFila {
  id: string;
  produtoId: string;
  /** Inventado — o backend não devolve nome (ver cabeçalho). */
  cliente: string;
  /** ISO, como o backend devolve. */
  criadoEm: string;
  /** `null` para produto sem vocabulário de estado (Diagnóstico). */
  status: 'submitted' | 'ready' | null;
  entregueEm: string | null;
  /** Nome do arquivo que chegou. `null` quando o produto não recebe
   *  arquivo — que é o caso do Diagnóstico, e é a diferença que faz a
   *  tela de detalhe dele ter outra forma. */
  arquivo: string | null;
}

/** Base fixa para os carimbos. Data ABSOLUTA e não `Date.now()` menos
 *  N: com base móvel a fila mudaria de idade a cada render, e uma
 *  captura de tela nunca bateria com a seguinte. O `agora` da amostra
 *  viaja junto, para as idades serem estáveis e reproduzíveis. */
export const AGORA_DA_AMOSTRA = new Date('2026-09-03T14:00:00-03:00');

const h = (horas: number) =>
  new Date(AGORA_DA_AMOSTRA.getTime() - horas * 3_600_000).toISOString();

export const FILA_MOCK: PedidoNaFila[] = [
  {
    id: 'cle-8f2a',
    produtoId: 'conta-de-luz-express',
    cliente: 'Metalúrgica Vale Verde',
    criadoEm: h(103),
    status: 'submitted',
    entregueEm: null,
    arquivo: 'fatura-julho.pdf',
  },
  {
    id: 'sol-3c71',
    produtoId: 'solar-proposal-validator',
    cliente: 'Condomínio Alto da Serra',
    criadoEm: h(76),
    status: 'submitted',
    entregueEm: null,
    arquivo: 'proposta-comercial.pdf',
  },
  {
    id: 'dia-0b19',
    produtoId: 'diagnostico-energetico',
    cliente: 'Frigorífico Serra Azul',
    criadoEm: h(52),
    status: null,
    entregueEm: null,
    arquivo: null,
  },
  {
    id: 'cle-1d44',
    produtoId: 'conta-de-luz-express',
    cliente: 'Padaria Trigo de Ouro',
    criadoEm: h(29),
    status: 'ready',
    entregueEm: h(4),
    arquivo: 'conta-agosto.jpg',
  },
  {
    id: 'dia-77e3',
    produtoId: 'diagnostico-energetico',
    cliente: 'Lavanderia Industrial Nortex',
    criadoEm: h(11),
    status: null,
    entregueEm: null,
    arquivo: null,
  },
  {
    id: 'sol-9a05',
    produtoId: 'solar-proposal-validator',
    cliente: 'Hotel Praia do Meio',
    criadoEm: h(3),
    status: 'submitted',
    entregueEm: null,
    arquivo: 'orcamento-solar-v2.pdf',
  },
  {
    id: 'cle-5e60',
    produtoId: 'conta-de-luz-express',
    cliente: 'Clínica São Bento',
    criadoEm: h(0.4),
    status: 'submitted',
    entregueEm: null,
    arquivo: 'fatura.png',
  },
];

/** A fila de um produto, ou tudo. Filtro, não consulta. */
export function filaDe(produtoId?: string): PedidoNaFila[] {
  return produtoId ? FILA_MOCK.filter((p) => p.produtoId === produtoId) : FILA_MOCK;
}

export function pedidoPorId(id: string): PedidoNaFila | undefined {
  return FILA_MOCK.find((p) => p.id === id);
}

/** Quantos pedidos ainda não foram respondidos. É o número do indicador
 *  de notificação do console — o outro canal (e-mail) já existe e é do
 *  backend. `null` de status conta como não respondido: o Diagnóstico
 *  não tem estado, mas tem pedido esperando. */
export function pendentes(produtoId?: string): number {
  return filaDe(produtoId).filter((p) => p.status !== 'ready').length;
}

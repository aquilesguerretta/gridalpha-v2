// AlexandriaRouter — roteador interno do produto.
//
//   /alexandria                                   → hub das três trilhas
//   /alexandria/trilha/:trilhaId                  → caminho de expedição
//   /alexandria/trilha/:trilhaId/modulo/:moduloId → lista de aula
//
// ─────────────────────────────────────────────────────────────
// DADO INLINE — PENDÊNCIA DE FRONTEIRA
//
// FOUNDRY Wave 3 não fechou: `src/lib/data/alexandria-progress-mock.ts`
// e `alexandria-badges.ts` não existem, e `MOCK_USER_PROGRESS` /
// `ALEXANDRIA_BADGES` não aparecem em lugar nenhum de `src/lib/`.
//
// O brief autoriza dado inline estruturalmente idêntico ao tipo. É o que
// está abaixo: tipado contra `UserProgress`, `Badge` e `UserBadgeProgress`
// de `src/lib/types/alexandria.ts`, sem nenhum campo inventado.
//
// Quando FOUNDRY Wave 3 entrar, este bloco sai inteiro e viram imports.
// Os consumidores não mudam — todos leem daqui, não de literais espalhados.
// ─────────────────────────────────────────────────────────────

import { Route, Routes, useParams } from 'react-router-dom';
import { AlexandriaShell } from '@/components/alexandria/shell/AlexandriaShell';
import { TrilhasHub } from '@/components/alexandria/navigation/TrilhasHub';
import type {
  Badge,
  CurriculumLevel,
  CurriculumModule,
  CurriculumTrack,
  UserBadgeProgress,
  UserProgress,
} from '@/lib/types/alexandria';
import { ALEXANDRIA_TRILHAS } from '@/lib/data/alexandria-trilhas';

// ── Aulas concluídas por módulo ──────────────────────────────
// Só módulos com `totalAulas` conhecido podem ter progresso: não existe
// "3 de null". Módulo 01 fechado, 02 em curso, 03 intocado.
export const AULAS_CONCLUIDAS_POR_MODULO: Record<string, number> = {
  'modulo-01': 9,
  'modulo-02': 4,
  'modulo-03': 0,
};

/** Aulas confirmadas por nível — soma só o que tem fonte.
 *  Nível 1 = 9 + 10 + 10 = 29 em 3 dos 5 módulos. Níveis 2 e 3 = 0
 *  módulos com fonte, então o denominador é desconhecido, não zero. */
const AULAS_CONHECIDAS_POR_NIVEL: Record<CurriculumLevel, number | null> = {
  1: 29,
  2: null,
  3: null,
};

function percentualDoNivel(level: CurriculumLevel): number {
  const total = AULAS_CONHECIDAS_POR_NIVEL[level];
  if (total === null || total === 0) return 0;
  const trilha = ALEXANDRIA_TRILHAS.find((t) => t.level === level);
  if (!trilha) return 0;
  const feitas = trilha.moduleIds.reduce(
    (soma, id) => soma + (AULAS_CONCLUIDAS_POR_MODULO[id] ?? 0),
    0,
  );
  return Math.round((feitas / total) * 100);
}

const AULAS_FEITAS = Object.values(AULAS_CONCLUIDAS_POR_MODULO).reduce((a, b) => a + b, 0);

export const ALEXANDRIA_BADGES: Badge[] = [
  {
    id: 'badge-primeiro-circuito',
    name: 'Primeiro circuito',
    criterion: 'Concluir as 9 aulas do Módulo 01 — Física de Energia e Eletricidade',
    category: 'conteudo',
    expReward: 120,
    iconAsset: null,
  },
  {
    id: 'badge-leitor-de-rede',
    name: 'Leitor de rede',
    criterion: 'Concluir as 10 aulas do Módulo 02 — Como Funciona uma Rede Elétrica',
    category: 'conteudo',
    expReward: 140,
    iconAsset: null,
  },
  {
    id: 'badge-cartografo',
    name: 'Cartógrafo',
    criterion: 'Abrir ao menos uma aula em cada um dos quatro submercados do SIN',
    category: 'exploracao',
    expReward: 80,
    iconAsset: null,
  },
  {
    id: 'badge-fator-de-potencia',
    name: 'Fator de potência',
    criterion: 'Atingir 0,92 de FP médio em simulação tarifária',
    category: 'dominio',
    expReward: 200,
    iconAsset: null,
  },
];

export const MOCK_BADGE_PROGRESS: UserBadgeProgress[] = [
  { badgeId: 'badge-primeiro-circuito', status: 'conquistado', earnedAt: '2026-07-14' },
  { badgeId: 'badge-leitor-de-rede', status: 'bloqueado', earnedAt: null },
  { badgeId: 'badge-cartografo', status: 'bloqueado', earnedAt: null },
  { badgeId: 'badge-fator-de-potencia', status: 'bloqueado', earnedAt: null },
];

export const MOCK_USER_PROGRESS: UserProgress = {
  aulasCompleted: AULAS_FEITAS,
  // Piso confirmado, não total do currículo: 14 dos 17 módulos não têm
  // fonte de contagem. O rótulo na UI diz "confirmadas", nunca "total".
  aulasTotal: 29,
  exp: 120,
  badgesEarned: MOCK_BADGE_PROGRESS.filter((b) => b.status === 'conquistado').length,
  badgesTotal: ALEXANDRIA_BADGES.length,
  byLevel: {
    1: percentualDoNivel(1),
    2: percentualDoNivel(2),
    3: percentualDoNivel(3),
  },
  bySubmercado: {
    norte: { completed: 0, total: 0 },
    nordeste: { completed: 0, total: 0 },
    'sudeste-centro-oeste': { completed: 2, total: 6 },
    sul: { completed: 1, total: 4 },
  },
  studyStreakDays: 6,
};

// ── Estado de módulo ─────────────────────────────────────────
//
// 'em-producao' e 'bloqueado' são estados DIFERENTES e nunca se
// confundem visualmente:
//   bloqueado   → o conteúdo existe, ainda não chegou a vez do aluno.
//   em-producao → o conteúdo não existe. `totalAulas` é null e não há
//                 número honesto a mostrar.
export type EstadoModulo =
  | 'concluido'
  | 'em-andamento'
  | 'desbloqueado'
  | 'bloqueado'
  | 'em-producao';

export interface ModuloComEstado {
  modulo: CurriculumModule;
  estado: EstadoModulo;
  /** Aulas feitas. null quando o módulo está em produção — não é 0. */
  aulasFeitas: number | null;
}

/** Deriva o estado de cada módulo da trilha, em ordem.
 *
 *  Progressão: um módulo com conteúdo abre quando todos os módulos com
 *  conteúdo anteriores a ele estão concluídos. Módulo em produção NÃO
 *  tranca a fila — ele não existe, então não pode ser pré-requisito de
 *  nada. Sem isso, um módulo sem HTML congelaria a trilha inteira. */
export function estadosDaTrilha(modulos: CurriculumModule[]): ModuloComEstado[] {
  let anterioresConcluidos = true;

  return modulos.map((modulo) => {
    if (modulo.totalAulas === null) {
      // Não mexe em `anterioresConcluidos`: em produção não é obstáculo.
      return { modulo, estado: 'em-producao' as const, aulasFeitas: null };
    }

    const feitas = AULAS_CONCLUIDAS_POR_MODULO[modulo.id] ?? 0;
    let estado: EstadoModulo;

    if (feitas >= modulo.totalAulas) {
      estado = 'concluido';
    } else if (feitas > 0) {
      estado = 'em-andamento';
      anterioresConcluidos = false;
    } else if (anterioresConcluidos) {
      estado = 'desbloqueado';
      anterioresConcluidos = false;
    } else {
      estado = 'bloqueado';
    }

    return { modulo, estado, aulasFeitas: feitas };
  });
}

/** Trilha sugerida pelo `?trilha=` do portal BR.
 *
 *  O parâmetro indica TRACK — mercado de entrada — não uma trilha exata.
 *  Retorna a primeira trilha daquele track, ou null. Nunca filtra: o hub
 *  mostra as três sempre.
 *
 *  Nota: nenhuma trilha tem track 'usa' hoje (a Trilha 3 é 'brasil'),
 *  então `?trilha=usa` cai em null e o hub simplesmente não destaca
 *  nada — sem tela vazia, sem erro. */
export function trilhaSugerida(track: CurriculumTrack | null): string | null {
  if (!track) return null;
  return ALEXANDRIA_TRILHAS.find((t) => t.track === track)?.id ?? null;
}

interface AlexandriaRouterProps {
  trackDeEntrada: CurriculumTrack | null;
}

export function AlexandriaRouter({ trackDeEntrada }: AlexandriaRouterProps) {
  const sugerida = trilhaSugerida(trackDeEntrada);

  return (
    <Routes>
      <Route index element={<HubRoute trilhaSugeridaId={sugerida} />} />
      <Route path="trilha/:trilhaId" element={<TrilhaRoute />} />
      <Route path="trilha/:trilhaId/modulo/:moduloId" element={<ModuloRoute />} />
      <Route path="*" element={<HubRoute trilhaSugeridaId={sugerida} />} />
    </Routes>
  );
}

// Placeholders de rota — substituídos pelas Fases 2-5. Cada rota monta o
// próprio shell porque a configuração de rail varia entre hub e trilha.
function HubRoute({ trilhaSugeridaId }: { trilhaSugeridaId: string | null }) {
  return (
    <AlexandriaShell>
      <TrilhasHub trilhaSugeridaId={trilhaSugeridaId} />
    </AlexandriaShell>
  );
}
function TrilhaRoute() {
  const { trilhaId } = useParams();
  return (
    <AlexandriaShell>
      <span>caminho de expedição · {trilhaId}</span>
    </AlexandriaShell>
  );
}
function ModuloRoute() {
  const { trilhaId, moduloId } = useParams();
  return (
    <AlexandriaShell>
      <span>lista de aula · {trilhaId} · {moduloId}</span>
    </AlexandriaShell>
  );
}

export default AlexandriaRouter;

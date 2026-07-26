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

import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { AlexandriaShell } from '@/components/alexandria/shell/AlexandriaShell';
import { TrilhasHub } from '@/components/alexandria/navigation/TrilhasHub';
import { CaminhoExpedicao } from '@/components/alexandria/navigation/CaminhoExpedicao';
import { ModuloAulaList } from '@/components/alexandria/navigation/ModuloAulaList';
import { A, A2, AT, AS, AR } from '@/design/alexandria-tokens';
import type {
  Badge,
  CurriculumLevel,
  CurriculumModule,
  CurriculumTrack,
  SubmercadoTag,
  UserBadgeProgress,
  UserProgress,
} from '@/lib/types/alexandria';
import {
  ALEXANDRIA_TRILHAS,
  getModuleById,
  getModulesByTrilha,
  getTrilhaById,
} from '@/lib/data/alexandria-trilhas';

// ── Aulas concluídas por módulo ──────────────────────────────
// Só módulos com `totalAulas` conhecido podem ter progresso: não existe
// "3 de null". Módulo 01 fechado, 02 em curso, 03 intocado.
export const AULAS_CONCLUIDAS_POR_MODULO: Record<string, number> = {
  'modulo-01': 9,
  'modulo-02': 4,
  'modulo-03': 0,
};

/** Aulas confirmadas por nível — soma só o que tem fonte.
 *  Nível 1 = 9 + 10 + 10 = 29 em 3 dos 5 módulos. Níveis 2 e 3 não têm
 *  nenhum módulo com fonte, então o denominador é desconhecido, não zero. */
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
      <Route path="trilha/:trilhaId/modulo/:moduloId/aula/:aulaNumero" element={<AulaRoute />} />
      <Route path="*" element={<HubRoute trilhaSugeridaId={sugerida} />} />
    </Routes>
  );
}

// ── Rotas ────────────────────────────────────────────────────
// Cada rota monta o próprio shell porque a configuração de rail varia.

function HubRoute({ trilhaSugeridaId }: { trilhaSugeridaId: string | null }) {
  return (
    <AlexandriaShell>
      <TrilhasHub trilhaSugeridaId={trilhaSugeridaId} />
    </AlexandriaShell>
  );
}

function TrilhaRoute() {
  const { trilhaId } = useParams();
  const navigate = useNavigate();
  const trilha = trilhaId ? getTrilhaById(trilhaId) : null;

  if (!trilha) return <NaoEncontrado titulo="Trilha não encontrada" />;

  const itens = estadosDaTrilha(getModulesByTrilha(trilha.id));

  return (
    <AlexandriaShell
      // Recorte regional só existe em trilha de mercado brasileiro. A
      // Trilha 1 é 'universal' e não carrega submercado — por isso o rail
      // esquerdo aparece quando é aplicável, não sempre.
      showLeftRail={trilha.track === 'brasil'}
      leftRailContent={<CoberturaSubmercado />}
      rightRailSlots={{
        progresso: <SlotProgresso nivel={trilha.level} />,
        listaAulas: <SlotModulos itens={itens} />,
        proximaAula: <SlotProxima itens={itens} />,
        conquistas: <SlotConquistas />,
        referencias: <SlotReferencias />,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: AS.xl }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: AS.sm }}>
          <Voltar rotulo="← Todas as trilhas" para="/alexandria" />
          <span style={{ ...AT.rotulo, color: A.terracota }}>Nível {trilha.level}</span>
          <h1 style={{ ...AT.h1, color: A.tintaSobreCreme, margin: 0 }}>{trilha.title}</h1>
        </div>

        <CaminhoExpedicao
          itens={itens}
          onAbrirModulo={(id) => navigate(`/alexandria/trilha/${trilha.id}/modulo/${id}`)}
        />
      </div>
    </AlexandriaShell>
  );
}

function ModuloRoute() {
  const { trilhaId, moduloId } = useParams();
  const trilha = trilhaId ? getTrilhaById(trilhaId) : null;
  const modulo = moduloId ? getModuleById(moduloId) : null;

  if (!trilha || !modulo || modulo.trilhaId !== trilha.id) {
    return <NaoEncontrado titulo="Módulo não encontrado" />;
  }

  const itens = estadosDaTrilha(getModulesByTrilha(trilha.id));
  const item = itens.find((i) => i.modulo.id === modulo.id)!;

  return (
    <AlexandriaShell
      showLeftRail={trilha.track === 'brasil'}
      leftRailContent={<CoberturaSubmercado />}
      rightRailSlots={{
        progresso: <SlotProgresso nivel={trilha.level} />,
        listaAulas: <SlotModulos itens={itens} />,
        proximaAula: <SlotProxima itens={itens} />,
        conquistas: <SlotConquistas />,
        referencias: <SlotReferencias />,
      }}
    >
      <ModuloAulaList
        item={item}
        trilha={trilha}
        onAbrirAula={(numero) =>
          navigate(`/alexandria/trilha/${trilha.id}/modulo/${modulo.id}/aula/${numero}`)
        }
      />
    </AlexandriaShell>
  );
}

/** Placeholder do viewer de aula — a wave seguinte constrói de verdade.
 *  Existe para que o clique numa aula tenha destino real em vez de
 *  cair no catch-all e voltar pro hub sem explicação. */
function AulaRoute() {
  const { trilhaId, moduloId, aulaNumero } = useParams();
  const trilha = trilhaId ? getTrilhaById(trilhaId) : null;
  const modulo = moduloId ? getModuleById(moduloId) : null;

  if (!trilha || !modulo || modulo.trilhaId !== trilha.id) {
    return <NaoEncontrado titulo="Aula não encontrada" />;
  }

  const numero = Number(aulaNumero);
  const total = modulo.totalAulas;
  if (!Number.isInteger(numero) || numero < 1 || total === null || numero > total) {
    return <NaoEncontrado titulo="Aula não encontrada" />;
  }

  const itens = estadosDaTrilha(getModulesByTrilha(trilha.id));

  return (
    <AlexandriaShell
      showLeftRail={trilha.track === 'brasil'}
      leftRailContent={<CoberturaSubmercado />}
      rightRailSlots={{
        progresso: <SlotProgresso nivel={trilha.level} />,
        listaAulas: <SlotModulos itens={itens} />,
        proximaAula: <SlotProxima itens={itens} />,
        conquistas: <SlotConquistas />,
        referencias: <SlotReferencias />,
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: AS.lg }}>
        <Voltar
          rotulo={`← ${modulo.title}`}
          para={`/alexandria/trilha/${trilha.id}/modulo/${modulo.id}`}
        />
        <span style={{ ...AT.rotulo, color: A.terracota }}>
          Aula {numero} de {total}
        </span>
        <h1 style={{ ...AT.h1, color: A.tintaSobreCreme, margin: 0 }}>{modulo.title}</h1>
        <div
          style={{
            borderLeft: `3px solid ${A.fioSobreCreme}`,
            padding: `${AS.md} ${AS.xl}`,
            display: 'flex',
            flexDirection: 'column',
            gap: AS.sm,
          }}
        >
          <span style={{ ...AT.h3, color: A.tintaSuave, letterSpacing: '0.08em' }}>
            Viewer de aula — wave seguinte
          </span>
          <span style={{ ...AT.corpo, fontSize: '14px', color: A.tintaSuave, maxWidth: '58ch' }}>
            A rota existe e a numeração é real. O player de vídeo, a apostila e
            os instrumentos entram quando o viewer for construído.
          </span>
        </div>
      </div>
    </AlexandriaShell>
  );
}

// ── Peças compartilhadas ─────────────────────────────────────

function Voltar({ rotulo, para }: { rotulo: string; para: string }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => navigate(para)}
      style={{
        ...AT.rotulo,
        alignSelf: 'flex-start',
        color: A2.tintaMetadado,
        background: 'none',
        border: 'none',
        borderRadius: AR.none,
        padding: 0,
        cursor: 'pointer',
      }}
    >
      {rotulo}
    </button>
  );
}

function NaoEncontrado({ titulo }: { titulo: string }) {
  return (
    <AlexandriaShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: AS.md }}>
        <span style={{ ...AT.rotulo, color: A.terracota }}>Sem registro</span>
        <h1 style={{ ...AT.h1, color: A.tintaSobreCreme, margin: 0 }}>{titulo}</h1>
        <p style={{ ...AT.corpo, color: A.tintaSuave, margin: 0, fontSize: '15px' }}>
          Nenhum registro do currículo corresponde a esse endereço.
        </p>
        <Voltar rotulo="← Todas as trilhas" para="/alexandria" />
      </div>
    </AlexandriaShell>
  );
}

const NOME_SUBMERCADO: Record<SubmercadoTag, string> = {
  norte: 'Norte',
  nordeste: 'Nordeste',
  'sudeste-centro-oeste': 'Sudeste / C.-Oeste',
  sul: 'Sul',
};

/** Cobertura por submercado — painel de leitura, não filtro.
 *
 *  O brief pede "filtro de submercado (se aplicável)". Filtrar de verdade
 *  exige `submercados[]` no nível da AULA, e `CurriculumAula` ainda não tem
 *  dado real: a FOUNDRY Wave 2 shipou estrutura e contagem, não conteúdo.
 *  Um controle que parece filtrar e não filtra é pior que um painel
 *  honesto — mesma disciplina de não inventar contagem de aula. Vira
 *  filtro na wave em que a aula existir. */
function CoberturaSubmercado() {
  const entradas = Object.entries(MOCK_USER_PROGRESS.bySubmercado) as [
    SubmercadoTag,
    { completed: number; total: number },
  ][];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: AS.md, padding: `0 ${AS.lg}` }}>
      <span style={{ ...AT.rotulo, color: A.terracota }}>Cobertura regional</span>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {entradas.map(([tag, v], i) => (
          <div
            key={tag}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: AS.sm,
              padding: `${AS.sm} 0`,
              borderTop: i > 0 ? `1px solid ${A2.fioClaroSobreCreme}` : 'none',
            }}
          >
            <span style={{ ...AT.dado, fontSize: '12px', color: A.tintaSobreCreme }}>
              {NOME_SUBMERCADO[tag]}
            </span>
            <span style={{ ...AT.dado, fontSize: '12px', color: A.tintaSuave }}>
              {v.total > 0 ? `${v.completed}/${v.total}` : '—'}
            </span>
          </div>
        ))}
      </div>

      <span
        style={{
          ...AT.dado,
          fontSize: '11px',
          fontStyle: 'italic',
          lineHeight: 1.5,
          color: A2.tintaMetadado,
        }}
      >
        Recorte por submercado vira filtro quando a aula tiver dado regional.
      </span>
    </div>
  );
}

function SlotProgresso({ nivel }: { nivel: CurriculumLevel }) {
  const pct = MOCK_USER_PROGRESS.byLevel[nivel];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: AS.sm }}>
      <div style={{ height: '5px', background: A.fioSobreNavy, borderRadius: AR.none }}>
        <div
          style={{
            width: `${pct}%`,
            height: '5px',
            background: A2.olivaSobreNavy,
            borderRadius: AR.none,
          }}
        />
      </div>
      <span style={{ ...AT.dado, fontSize: '12px', color: A.tintaSobreNavy }}>
        {pct}% deste nível
      </span>
      <span style={{ ...AT.dado, fontSize: '11px', color: A2.tintaMetadadoNavy }}>
        {MOCK_USER_PROGRESS.aulasCompleted} de {MOCK_USER_PROGRESS.aulasTotal} aulas confirmadas
        {' · '}
        {MOCK_USER_PROGRESS.studyStreakDays} dias seguidos
      </span>
    </div>
  );
}

const PONTO_ESTADO: Record<EstadoModulo, string> = {
  concluido: A2.olivaSobreNavy,
  'em-andamento': A2.terracotaClara,
  desbloqueado: A2.ouroSobreNavy,
  bloqueado: A.fioSobreNavy,
  'em-producao': A.terracota,
};

function SlotModulos({ itens }: { itens: ModuloComEstado[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {itens.map((item, i) => (
        <div
          key={item.modulo.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: AS.sm,
            padding: `${AS.sm} 0`,
            borderTop: i > 0 ? `1px solid ${A.fioSobreNavy}` : 'none',
          }}
        >
          <span
            style={{
              flex: 'none',
              width: '7px',
              height: '7px',
              borderRadius: AR.circulo,
              background: PONTO_ESTADO[item.estado],
            }}
          />
          <span
            style={{
              ...AT.dado,
              fontSize: '12px',
              color: item.estado === 'bloqueado' ? A2.tintaMetadadoNavy : A.tintaSobreNavy,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {item.modulo.number}. {item.modulo.title}
          </span>
        </div>
      ))}
    </div>
  );
}

function SlotProxima({ itens }: { itens: ModuloComEstado[] }) {
  const proximo = itens.find((i) => i.estado === 'em-andamento' || i.estado === 'desbloqueado');

  if (!proximo) {
    return (
      <span style={{ ...AT.dado, fontStyle: 'italic', color: A2.tintaMetadadoNavy }}>
        Nada disponível nesta trilha
      </span>
    );
  }

  const total = proximo.modulo.totalAulas ?? 0;
  const numero = (proximo.aulasFeitas ?? 0) + 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: AS.xs }}>
      <span style={{ ...AT.dado, fontSize: '12px', color: A2.ouroSobreNavy }}>
        Aula {numero} de {total}
      </span>
      <span style={{ ...AT.dado, fontSize: '12px', color: A.tintaSobreNavy, lineHeight: 1.5 }}>
        {proximo.modulo.title}
      </span>
    </div>
  );
}

function SlotConquistas() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {ALEXANDRIA_BADGES.map((badge, i) => {
        const prog = MOCK_BADGE_PROGRESS.find((p) => p.badgeId === badge.id);
        const conquistado = prog?.status === 'conquistado';
        return (
          <div
            key={badge.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              padding: `${AS.sm} 0`,
              borderTop: i > 0 ? `1px solid ${A.fioSobreNavy}` : 'none',
            }}
          >
            <span
              style={{
                ...AT.dado,
                fontSize: '12px',
                color: conquistado ? A2.olivaSobreNavy : A2.tintaMetadadoNavy,
              }}
            >
              {badge.name} {conquistado ? '·' : ''} {conquistado ? `+${badge.expReward} XP` : ''}
            </span>
            <span
              style={{
                ...AT.dado,
                fontSize: '11px',
                lineHeight: 1.45,
                color: A2.tintaMetadadoNavy,
              }}
            >
              {badge.criterion}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function SlotReferencias() {
  return (
    <span style={{ ...AT.dado, fontStyle: 'italic', color: A2.tintaMetadadoNavy, lineHeight: 1.5 }}>
      Documentos de apoio aparecem junto com a aula.
    </span>
  );
}

export default AlexandriaRouter;

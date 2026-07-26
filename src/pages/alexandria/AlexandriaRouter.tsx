// AlexandriaRouter — roteador interno do produto.
//
//   /alexandria                                   → hub das três trilhas
//   /alexandria/trilha/:trilhaId                  → caminho de expedição
//   /alexandria/trilha/:trilhaId/modulo/:moduloId → lista de aula
//
// Progresso e insígnias vêm da FOUNDRY Wave 3, que fechou durante esta
// wave. O dado inline que existia aqui antes foi removido — ele
// divergia em dois pontos, e a FOUNDRY estava certa nos dois:
//
//   1. aulasCompleted era 13; o correto é 12 (Módulo 01 inteiro = 9,
//      mais 3 das 10 do Módulo 02).
//   2. bySubmercado tinha totais inventados (2/6 e 1/4). A FOUNDRY zera
//      todos os quatro totais, e o motivo é o mesmo princípio desta
//      wave: `CurriculumAula` não tem registro nenhum, então não existe
//      aula para contar por submercado e qualquer total seria invenção.

import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { AlexandriaShell } from '@/components/alexandria/shell/AlexandriaShell';
import { TrilhasHub } from '@/components/alexandria/navigation/TrilhasHub';
import { CaminhoExpedicao } from '@/components/alexandria/navigation/CaminhoExpedicao';
import { ModuloAulaList } from '@/components/alexandria/navigation/ModuloAulaList';
import { A, A2, AT, AS, AR } from '@/design/alexandria-tokens';
import type {
  CurriculumLevel,
  CurriculumModule,
  CurriculumTrack,
  SubmercadoTag,
} from '@/lib/types/alexandria';
import {
  ALEXANDRIA_TRILHAS,
  getModuleById,
  getModulesByTrilha,
  getTrilhaById,
} from '@/lib/data/alexandria-trilhas';
import { ALEXANDRIA_BADGES } from '@/lib/data/alexandria-badges';
import { MOCK_BADGE_PROGRESS, MOCK_USER_PROGRESS } from '@/lib/data/alexandria-progress-mock';

export { MOCK_USER_PROGRESS };

/** Repartição por módulo das `aulasCompleted` da FOUNDRY.
 *
 *  `MOCK_USER_PROGRESS.aulasCompleted` é 12 e o próprio arquivo declara a
 *  decomposição: "Módulo 01 inteiro (9 aulas) + 3 das 10 do Módulo 02".
 *  O contrato `UserProgress` é agregado e não carrega essa repartição,
 *  mas o estado de nó precisa dela. Reproduzo a decomposição declarada e
 *  travo a soma contra o agregado logo abaixo, para os dois não
 *  divergirem em silêncio se a FOUNDRY mudar o número.
 *
 *  Só módulo com `totalAulas` conhecido pode aparecer aqui: não existe
 *  "3 de null". */
export const AULAS_CONCLUIDAS_POR_MODULO: Record<string, number> = {
  'modulo-01': 9,
  'modulo-02': 3,
  'modulo-03': 0,
};

if (import.meta.env.DEV) {
  const soma = Object.values(AULAS_CONCLUIDAS_POR_MODULO).reduce((a, b) => a + b, 0);
  if (soma !== MOCK_USER_PROGRESS.aulasCompleted) {
    console.warn(
      `[alexandria] AULAS_CONCLUIDAS_POR_MODULO soma ${soma} mas ` +
        `MOCK_USER_PROGRESS.aulasCompleted é ${MOCK_USER_PROGRESS.aulasCompleted}. ` +
        'A repartição por módulo saiu de sincronia com o agregado da FOUNDRY.',
    );
  }
}

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
  const navigate = useNavigate();
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

/** O catálogo da FOUNDRY tem 13 insígnias — listar todas com critério
 *  transformaria o rail num paredão. Mostra as conquistadas primeiro, corta
 *  em 4, e diz quantas restam. */
const LIMITE_CONQUISTAS = 4;

function SlotConquistas() {
  const conquistadoDe = (id: string) =>
    MOCK_BADGE_PROGRESS.find((p) => p.badgeId === id)?.status === 'conquistado';

  const ordenadas = [...ALEXANDRIA_BADGES].sort(
    (a, b) => Number(conquistadoDe(b.id)) - Number(conquistadoDe(a.id)),
  );
  const visiveis = ordenadas.slice(0, LIMITE_CONQUISTAS);
  const restantes = ordenadas.length - visiveis.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span
        style={{
          ...AT.dado,
          fontSize: '11px',
          color: A2.tintaMetadadoNavy,
          paddingBottom: AS.sm,
        }}
      >
        {MOCK_USER_PROGRESS.badgesEarned} de {MOCK_USER_PROGRESS.badgesTotal} conquistadas
      </span>

      {visiveis.map((badge, i) => {
        const conquistado = conquistadoDe(badge.id);
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

      {restantes > 0 && (
        <span
          style={{
            ...AT.dado,
            fontSize: '11px',
            fontStyle: 'italic',
            color: A2.tintaMetadadoNavy,
            paddingTop: AS.sm,
            borderTop: `1px solid ${A.fioSobreNavy}`,
          }}
        >
          + {restantes} no catálogo
        </span>
      )}
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

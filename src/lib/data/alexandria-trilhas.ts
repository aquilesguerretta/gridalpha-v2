import type {
  CurriculumLevel,
  CurriculumModule,
  CurriculumTrilha,
} from '@/lib/types/alexandria';
import { getBlocksByLevel } from './alexandria-blocks';

/** Contagem real de aulas, extraída do HTML de cada módulo em
 *  `Alexandria modulos/`. Um bloco só entra aqui quando o HTML existe.
 *
 *  Método de contagem — três sinais independentes, todos concordando:
 *  1. marcadores `.aula-marker` com `Aula NN` (aulas reais)
 *  2. marcadores `.aula-marker` com `§ ...` (aparato: filosofia, mapa,
 *     caso, quiz, glossário, checklist — mesma classe `.aula`, não são aula)
 *  3. o que o próprio hero anuncia em prosa
 *
 *  | módulo | `.aula` bruto | `Aula NN` | `§` aparato | hero        |
 *  | ------ | ------------- | --------- | ----------- | ----------- |
 *  | 01     | 19            | 9         | 10          | "Nove aulas"|
 *  | 02     | 20            | 10        | 10          | "Dez aulas" |
 *  | 03     | 20            | 10        | 10          | "Dez aulas" |
 *  | 04     | —             | 7         | 10          | "Sete aulas"|
 *  | 05     | —             | 6         | 10          | mapa de 6   |
 *
 *  Os Módulos 04 e 05 não entram na coluna de `.aula` bruto porque não
 *  usam essa marcação: a fonte dos dois tem vocabulário próprio (`sec-id`
 *  delimita seção, e `class="aula"` ocorre ZERO vez). A contagem vem das
 *  divisões `sec-id` — 17 no Módulo 04 (7 aulas + 10 aparato) e 16 no
 *  Módulo 05 (6 aulas + 10 aparato). O § MAP do 04 anuncia "Sete aulas"; o
 *  do 05 desenha um mapa com seis cartões, um por aula, e os seis títulos
 *  batem 1:1 com os `<h3>` da fonte. LYCEUM Waves 24 e 25.
 *
 *  Blocos 06-17 ficam fora deste mapa de propósito — não têm HTML no
 *  repositório, e estimar seria inventar. */
const AULAS_POR_BLOCO: Record<string, number> = {
  'bloco-01': 9,   // Física de Energia e Eletricidade
  'bloco-02': 10,  // Como Funciona uma Rede Elétrica
  'bloco-03': 10,  // Tecnologias de Geração
  'bloco-04': 7,   // Economia de Mercados de Energia
  'bloco-05': 6,   // Regulação e Desenho de Mercados
};

const TRILHA_ID_BY_LEVEL: Record<CurriculumLevel, string> = {
  1: 'trilha-fundamentos-universais',
  2: 'trilha-setor-eletrico-brasileiro',
  3: 'trilha-especializacao-estrategica',
};

/** Um módulo por bloco, 1:1. `id` carrega o índice global do bloco, para
 *  ser estável se as trilhas forem reagrupadas depois; `number` é a
 *  posição de exibição dentro da trilha ("Módulo 3 de 7"). Para o Nível 1
 *  os dois coincidem, o que bate com os nomes dos arquivos de origem
 *  (`alexandria_modulo01.html` = bloco-01 = módulo 1 da trilha 1).
 *  Título vem do bloco — nunca digitado de novo, nunca diverge. */
function buildModules(level: CurriculumLevel): CurriculumModule[] {
  const blocks = getBlocksByLevel(level);
  const trilhaId = TRILHA_ID_BY_LEVEL[level];

  return blocks.map((block, index) => ({
    id: `modulo-${String(block.number).padStart(2, '0')}`,
    trilhaId,
    number: index + 1,
    totalInTrilha: blocks.length,
    title: block.title,
    blockId: block.id,
    totalAulas: AULAS_POR_BLOCO[block.id] ?? null,
  }));
}

/** Os 17 módulos, um por bloco do Currículo Definitivo. */
export const ALEXANDRIA_MODULES: CurriculumModule[] = [
  ...buildModules(1),
  ...buildModules(2),
  ...buildModules(3),
];

/** Soma só o que tem fonte. null quando nenhum módulo da trilha tem
 *  contagem — 'desconhecido', não 'zero'. */
function sumKnownAulas(modules: CurriculumModule[]): number | null {
  const known = modules.filter((m): m is CurriculumModule & { totalAulas: number } =>
    m.totalAulas !== null,
  );
  return known.length > 0 ? known.reduce((sum, m) => sum + m.totalAulas, 0) : null;
}

/** Uma trilha por nível — decisão v1. O tipo permite trilha
 *  transversal a níveis no futuro (ex: por persona); esta
 *  é a estrutura mais simples defensável para o primeiro ship.
 *
 *  Procedência dos títulos, os três estados são diferentes:
 *
 *  - Nível 1 — LITERAL CONFIRMADO. Aparece na forma exata
 *    'Nível 1 — Fundamentos Universais' no rodapé dos Módulos 02 e 03, e
 *    como 'Nível 1 · Fundamentos Universais · Módulo NN' no hero dos três.
 *  - Nível 2 — NÃO CONFIRMADO. Herdado do brief da Wave 2, derivado da
 *    descrição em prosa do currículo.
 *  - Nível 3 — NÃO CONFIRMADO. O brief o declara literal, mas não há
 *    ocorrência em nenhuma fonte disponível.
 *
 *  As seis menções a 'Nível' nos três HTML são todas ao Nível 1 — os
 *  módulos dos Níveis 2 e 3 ainda não têm HTML, e o
 *  GridAlpha_Curriculo_Definitivo.docx não está no repositório. Os títulos
 *  2 e 3 ficam válidos por decisão, não por extração; reconfirmar quando a
 *  fonte primária entrar.
 *
 *  Contagem de aula por trilha, no fechamento da Wave 2:
 *  - Nível 1 → 29 aulas confirmadas em 3 dos 5 módulos. Parcial.
 *  - Nível 2 → nenhum dos 7 módulos tem HTML. Desconhecida.
 *  - Nível 3 → nenhum dos 5 módulos tem HTML. Desconhecida. */
function buildTrilha(
  level: CurriculumLevel,
  title: string,
  description: string,
  track: CurriculumTrilha['track'],
): CurriculumTrilha {
  const modules = ALEXANDRIA_MODULES.filter(
    (m) => m.trilhaId === TRILHA_ID_BY_LEVEL[level],
  );

  return {
    id: TRILHA_ID_BY_LEVEL[level],
    title,
    description,
    level,
    track,
    language: 'pt-BR',
    moduleIds: modules.map((m) => m.id),
    totalAulas: sumKnownAulas(modules),
    totalAulasPartial: modules.some((m) => m.totalAulas === null),
  };
}

export const ALEXANDRIA_TRILHAS: CurriculumTrilha[] = [
  buildTrilha(
    1,
    'Fundamentos Universais',
    'Física de energia, redes, tecnologias de geração, economia e regulação de mercado — a base que qualquer profissional de energia precisa, em qualquer país.',
    'universal',
  ),
  buildTrilha(
    2,
    'Setor Elétrico Brasileiro',
    'Instituições, matriz, mercado ACR/ACL, tarifas e geopolítica — o diferencial competitivo, onde mora a maior densidade do currículo.',
    'brasil',
  ),
  buildTrilha(
    3,
    'Especialização Estratégica',
    'Análise financeira, biocombustíveis, petróleo e gás, tendências e cenário internacional — o que diferencia de qualquer outro fundador estudante.',
    'brasil',
  ),
];

/** Helpers de consulta — mesma convenção de `alexandria-blocks.ts`. */
export const getTrilhaById = (id: string) =>
  ALEXANDRIA_TRILHAS.find((t) => t.id === id) ?? null;

export const getTrilhaByLevel = (level: CurriculumLevel) =>
  ALEXANDRIA_TRILHAS.find((t) => t.level === level) ?? null;

export const getModuleById = (id: string) =>
  ALEXANDRIA_MODULES.find((m) => m.id === id) ?? null;

export const getModulesByTrilha = (trilhaId: string) =>
  ALEXANDRIA_MODULES.filter((m) => m.trilhaId === trilhaId);

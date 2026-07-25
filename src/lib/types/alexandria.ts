// src/lib/types/alexandria.ts
// FOUNDRY contract — Alexandria, produto educacional standalone.
//
// NÃO confundir com src/lib/types/curriculum.ts, que pertence ao Vault
// legado do terminal e permanece travado até a Alexandria nova atingir
// paridade de conteúdo. Os dois coexistem de propósito.
//
// Consumidores desta wave: LYCEUM (shell, viewer, exercícios),
// e qualquer wave futura de conteúdo curricular da Alexandria.

/** Trilha de conteúdo. Universal se repete em qualquer mercado;
 *  brasil e usa carregam a peculiaridade de cada polo energético. */
export type CurriculumTrack = 'universal' | 'brasil' | 'usa';

export type CurriculumLanguage = 'pt-BR' | 'en';

/** Nível de profundidade do Currículo Definitivo.
 *  1 = fundamentos universais · 2 = setor elétrico brasileiro
 *  3 = especialização estratégica */
export type CurriculumLevel = 1 | 2 | 3;

/** Tipos de exercício observados nas telas de referência.
 *  'calculo' cobre o Bloco Especial de Matemática Operacional. */
export type ActivityKind = 'objetiva' | 'discursiva' | 'estudo-de-caso' | 'calculo';

/** Os quatro submercados do SIN. Usado para marcar cobertura
 *  regional de uma aula — nem toda aula tem recorte regional. */
export type SubmercadoTag =
  | 'norte'
  | 'nordeste'
  | 'sudeste-centro-oeste'
  | 'sul';

/** Prioridade declarada no Currículo Definitivo.
 *  'confirmar' = fonte primária não confirma, pendente de verificação. */
export type BlockPriority =
  | 'maxima'
  | 'alta'
  | 'media-alta'
  | 'media'
  | 'confirmar';

/** Dificuldade da aula. Mapeia para a tag visual
 *  Básico / Intermediário / Avançado das telas de referência. */
export type AulaDifficulty = 'basico' | 'intermediario' | 'avancado';

/** Bloco do Currículo Definitivo. São 17, fixos.
 *  O bloco é a unidade de conteúdo; o módulo é a unidade de navegação.
 *  Um módulo referencia um bloco. */
export interface CurriculumBlock {
  id: string;                        // 'bloco-01' .. 'bloco-17'
  number: number;                    // 1-17
  level: CurriculumLevel;
  title: string;
  track: CurriculumTrack;
  /** Prefixo de 3 letras da biblioteca de gravuras ('fis-', 'red-', ...).
   *  null onde a metáfora visual ainda não foi decidida. */
  illustrationPrefix: string | null;
  priority: BlockPriority;
  /** null onde o Currículo Definitivo não declara carga horária. */
  estimatedHoursMin: number | null;
  estimatedHoursMax: number | null;
}

/** Trilha — o agrupamento de mais alto nível que o aluno escolhe.
 *  Ex: "Fundamentos do SIN", "Operação e mercados de energia". */
export interface CurriculumTrilha {
  id: string;
  title: string;
  description: string;
  level: CurriculumLevel;
  track: CurriculumTrack;
  language: CurriculumLanguage;
  moduleIds: string[];
  totalAulas: number;
}

/** Módulo — subdivisão da trilha. Exibido como "Módulo 3 de 6". */
export interface CurriculumModule {
  id: string;
  trilhaId: string;
  number: number;
  totalInTrilha: number;
  title: string;
  blockId: string;                   // referência a CurriculumBlock
}

/** Aula — a unidade que o aluno consome. Exibida como "Aula 8". */
export interface CurriculumAula {
  id: string;
  moduleId: string;
  number: number;
  totalInModule: number;
  title: string;
  subtitle: string | null;
  track: CurriculumTrack;
  language: CurriculumLanguage;
  durationMinutes: number;
  difficulty: AulaDifficulty;
  /** Vazio quando a aula não tem recorte regional. */
  submercados: SubmercadoTag[];
  /** Eixo de categorização transversal aos níveis.
   *  Ex: 'Preço e mercado', 'Regulação', 'Tarifas', 'Operação do SIN'. */
  competencies: string[];
  /** Nomes de arquivo da biblioteca de gravuras, sem caminho.
   *  Ex: 'ger-03-turbina-francis-corte.png' */
  illustrations: string[];
  video: LessonVideo | null;
  activities: LessonActivity[];
  /** Documentos de referência ligados à aula. */
  references: LessonReference[];
}

export interface LessonVideo {
  id: string;
  url: string;
  provider: 'vimeo' | 'youtube' | 'self-hosted' | 'other';
  title: string;
  durationSeconds: number;
  captionsUrl: string | null;
  /** Caminho do poster estático exibido antes do play. */
  posterAsset: string | null;
}

export interface LessonActivity {
  id: string;
  kind: ActivityKind;
  prompt: string;
  points: number;
  /** Formato específico por kind. LYCEUM tipa em detalhe quando
   *  construir cada mecânica — deixado solto de propósito porque
   *  as mecânicas ainda não foram especificadas. */
  config: Record<string, unknown>;
}

/** Documento de apoio: PDF, planilha, link externo.
 *  Alimenta a seção "Material de apoio" e a Biblioteca. */
export interface LessonReference {
  id: string;
  title: string;
  source: string;                    // 'ONS', 'EPE', 'CCEE', 'ANEEL', ...
  kind: 'pdf' | 'xlsx' | 'csv' | 'link';
  url: string;
  sizeBytes: number | null;
  publishedAt: string | null;        // ISO date
}

/** Badge com critério mensurável. As telas de referência mostram
 *  critérios como "Atinja 0,92 de FP médio em simulação tarifária" —
 *  o critério é dado, não texto decorativo. */
export interface Badge {
  id: string;
  name: string;
  criterion: string;
  category: 'conteudo' | 'exploracao' | 'dominio';
  expReward: number;
  /** Ícone de centro do badge. A moldura é única e composta por CSS.
   *  null enquanto a biblioteca de ícones de badge não existe. */
  iconAsset: string | null;
}

export interface UserBadgeProgress {
  badgeId: string;
  status: 'bloqueado' | 'conquistado';
  earnedAt: string | null;
}

export interface Certificate {
  id: string;
  levelCompleted: CurriculumLevel;
  trilhaId: string;
  issuedAt: string;                  // ISO date
  /** Padrão: 'alx-{track}-{level}-{sequencial}'. */
  verificationId: string;
  totalAulas: number;
  totalHours: number;
  scorePercent: number;
}

/** Progresso agregado do aluno. Alimenta o painel de progresso
 *  e o rail direito de toda tela. */
export interface UserProgress {
  aulasCompleted: number;
  aulasTotal: number;
  exp: number;
  badgesEarned: number;
  badgesTotal: number;
  byLevel: Record<CurriculumLevel, number>;   // percentual 0-100
  bySubmercado: Record<SubmercadoTag, { completed: number; total: number }>;
  studyStreakDays: number;
}

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

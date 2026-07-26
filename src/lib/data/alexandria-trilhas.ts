import type { CurriculumTrilha } from '@/lib/types/alexandria';

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
 *  fonte primária entrar. */
export const ALEXANDRIA_TRILHAS: CurriculumTrilha[] = [
  {
    id: 'trilha-fundamentos-universais',
    title: 'Fundamentos Universais',
    description: 'Física de energia, redes, tecnologias de geração, economia e regulação de mercado — a base que qualquer profissional de energia precisa, em qualquer país.',
    level: 1,
    track: 'universal',
    language: 'pt-BR',
    // Preenchidos na Fase 3 a partir da contagem real dos HTML.
    moduleIds: [],
    totalAulas: null,
    totalAulasPartial: true,
  },
  {
    id: 'trilha-setor-eletrico-brasileiro',
    title: 'Setor Elétrico Brasileiro',
    description: 'Instituições, matriz, mercado ACR/ACL, tarifas e geopolítica — o diferencial competitivo, onde mora a maior densidade do currículo.',
    level: 2,
    track: 'brasil',
    language: 'pt-BR',
    moduleIds: [],
    totalAulas: null,
    totalAulasPartial: true,
  },
  {
    id: 'trilha-especializacao-estrategica',
    title: 'Especialização Estratégica',
    description: 'Análise financeira, biocombustíveis, petróleo e gás, tendências e cenário internacional — o que diferencia de qualquer outro fundador estudante.',
    level: 3,
    track: 'brasil',
    language: 'pt-BR',
    moduleIds: [],
    totalAulas: null,
    totalAulasPartial: true,
  },
];

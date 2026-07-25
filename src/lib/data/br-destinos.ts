// src/lib/data/br-destinos.ts
// ARCHITECT — Portal BR Wave 1.
//
// Catálogo dos cinco destinos do lado brasileiro do GridAlpha. Um está
// disponível hoje; os outros quatro são antecipação declarada, não
// indisponibilidade — o DestinoCard trata os dois estados como leituras
// visuais distintas, nunca como "ativo" versus "desabilitado".
//
// Alexandria fica fora do prefixo de mercado de propósito: ela tem trilhas
// universal / brasil / usa. O portal BR aponta pra ela passando a trilha
// brasileira como padrão; o portal US futuro apontará pra mesma rota com
// trilha americana.
//
// DISCIPLINA DE LINGUAGEM, NÃO-NEGOCIÁVEL: nenhuma descrição promete
// economia garantida. "Oportunidades a validar", nunca "economize X%".
// Regra do projeto — vale em todo texto de face pública.

export type DestinoStatus = 'disponivel' | 'em-breve';

export interface DestinoBR {
  id: string;
  titulo: string;
  descricao: string;
  status: DestinoStatus;
  /** Rota interna quando disponível; null quando em breve. */
  rota: string | null;
}

export const DESTINOS_BR: DestinoBR[] = [
  {
    id: 'alexandria',
    titulo: 'Alexandria',
    descricao:
      'Biblioteca de energia — do zero à fluência profissional no setor elétrico brasileiro.',
    status: 'disponivel',
    rota: '/alexandria?trilha=brasil',
  },
  {
    id: 'terminal-brasil',
    titulo: 'Terminal Brasil',
    descricao:
      'PLD por submercado, dados do ONS, reservatórios e matriz elétrica em tempo real.',
    status: 'em-breve',
    rota: null,
  },
  {
    id: 'energy-brief',
    titulo: 'Energy Brief',
    descricao: 'Boletim semanal de inteligência do mercado de energia brasileiro.',
    status: 'em-breve',
    rota: null,
  },
  {
    id: 'conta-de-luz-express',
    titulo: 'Conta de Luz Express',
    descricao:
      'Análise independente de fatura industrial — modalidade, demanda e oportunidades a validar.',
    status: 'em-breve',
    rota: null,
  },
  {
    id: 'diagnostico-energetico',
    titulo: 'Diagnóstico Energético',
    descricao: 'Análise 360° do custo energético de uma operação industrial.',
    status: 'em-breve',
    rota: null,
  },
];

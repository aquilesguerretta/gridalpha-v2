// alexandria-glossario.ts
// Glossário Alexandria — os 38 verbetes do § Lex do Módulo 01.
//
// Fonte: `Alexandria modulos/alexandria_modulo01.html`, seção § Lex
// (L2520-2681) — `details.glossary-item` com `.term`, `.unit` e
// `.glossary-content` extraídos por parsing determinístico. Termo, etiqueta
// e definição são literais; HTML inline (<b>) e entidades preservados.
//
// DIVERGÊNCIA DA FONTE, registrada e não corrigida: a prosa do § Lex diz
// «Vinte e oito termos», mas o markup tem 38 `glossary-item`. A contagem
// real vence a prosa.
//
// `aulaIds` — cruzamento contra o corpo REAL das nove aulas
// (`MODULO_01_CORPO` + lead + título em alexandria-modulo-01-content.ts),
// método das Waves 4-5: varredura por padrão + leitura das frases nos casos
// de julgamento. Regras aplicadas:
//   · Palavra do termo, não símbolo de unidade — 'Volt' não mapeia toda
//     aula que escreve 'V'; senão vira ruído.
//   · Sentido do verbete, não colisão de palavra. Excluídos após leitura:
//     'oferta e demanda' (aula 03 — sentido sistêmico, não o conceito
//     tarifário), 'diretor de energia' (aula 06 — cargo), 'mercado livre
//     potencial' e 'ineficiência' (substring), 'motores mais eficientes'
//     (aula 06 — adjetivo incidental).
//   · Vazio é honesto: CCEE, CUSD e PLD são definidos no § Lex mas o corpo
//     do Módulo 01 não os usa. Ficam no glossário sem link de aula.

import type { GlossaryTerm } from '@/lib/types/alexandria';

export const ALEXANDRIA_GLOSSARIO: GlossaryTerm[] = [
  {
    id: "gl-ampere-a",
    term: "Ampere (A)",
    unit: "Corrente",
    definition:
      "Unidade de medida de corrente elétrica — o fluxo de carga que atravessa um condutor por segundo. Analogia hidráulica: vazão de água. Em instalações industriais, cargas grandes (motores, britadores, fornos) puxam alta corrente especialmente quando operam em tensões mais baixas.",
    aulaIds: ["aula-01-02"],
  },
  {
    id: "gl-banco-de-capacitores",
    term: "Banco de capacitores",
    unit: "Solução · FP",
    definition:
      "Conjunto de capacitores instalado próximo à carga industrial para fornecer localmente a potência reativa exigida por equipamentos indutivos. Eleva o fator de potência medido e reduz cobrança regulatória de excedente reativo. Exige diagnóstico técnico antes da especificação — compensação excessiva cria FP capacitivo, também problemático.",
    aulaIds: ["aula-01-07"],
  },
  {
    id: "gl-ccee",
    term: "CCEE",
    unit: "Instituição",
    definition:
      "Câmara de Comercialização de Energia Elétrica. Pessoa jurídica de direito privado, sob autorização da ANEEL, responsável pela contabilização e liquidação de operações de compra e venda de energia, e pela apuração do PLD (Preço de Liquidação das Diferenças). Atua nos ambientes ACR e ACL.",
    aulaIds: [],
  },
  {
    id: "gl-corrente-alternada-ac",
    term: "Corrente alternada (AC)",
    unit: "Forma de onda",
    definition:
      "Corrente elétrica cujo sentido alterna periodicamente. No Brasil, a frequência da rede pública é de 60 Hz — sessenta ciclos por segundo. Base de toda a rede pública de transmissão e distribuição moderna, porque permite elevação e redução de tensão por transformadores.",
    aulaIds: ["aula-01-02", "aula-01-03", "aula-01-06"],
  },
  {
    id: "gl-corrente-continua-dc",
    term: "Corrente contínua (DC)",
    unit: "Forma de onda",
    definition:
      "Corrente elétrica com fluxo em direção principal constante. Usada em baterias, painéis solares antes do inversor, eletrônica embarcada e transmissão HVDC de longa distância. Retoma relevância com a expansão de solar, BESS e tecnologias correlatas.",
    aulaIds: ["aula-01-02", "aula-01-03"],
  },
  {
    id: "gl-cusd",
    term: "CUSD",
    unit: "Contrato",
    definition:
      "Contrato de Uso do Sistema de Distribuição. Documento entre consumidor do Grupo A e distribuidora que formaliza demanda contratada, tensão de fornecimento, modalidade tarifária e demais condições de uso da rede. Fonte primária ao analisar qualquer cliente industrial.",
    aulaIds: [],
  },
  {
    id: "gl-dec-fec",
    term: "DEC / FEC",
    unit: "Continuidade · coletivos",
    definition:
      "<b>DEC</b> — Duração Equivalente de interrupção por unidade Consumidora. Tempo médio de interrupção por consumidor no período (horas/ano). <b>FEC</b> — Frequência Equivalente de interrupção por unidade Consumidora. Número médio de interrupções por consumidor no período. São indicadores coletivos que avaliam a qualidade do serviço de toda a distribuidora.",
    aulaIds: ["aula-01-09"],
  },
  {
    id: "gl-demanda",
    term: "Demanda",
    unit: "kW",
    definition:
      "Potência ativa exigida ou requerida por uma unidade consumidora em determinado intervalo de medição (tipicamente 15 minutos integralizados). Distinta do consumo (kWh), reflete a capacidade instantânea exigida da rede.",
    aulaIds: ["aula-01-01", "aula-01-05", "aula-01-06"],
  },
  {
    id: "gl-demanda-contratada",
    term: "Demanda contratada",
    unit: "kW",
    definition:
      "Capacidade em kW reservada contratualmente pelo consumidor do Grupo A junto à distribuidora. Cobrada integralmente todo mês, mesmo se não usada. Dimensionamento exige histórico de 12 meses, sazonalidade e planos de expansão.",
    aulaIds: ["aula-01-05"],
  },
  {
    id: "gl-dic-fic-dmic-dicri",
    term: "DIC / FIC / DMIC / DICRI",
    unit: "Continuidade · individuais",
    definition:
      "Indicadores individuais de continuidade — medem interrupções daquela unidade consumidora específica. <b>DIC</b>: duração total de interrupção. <b>FIC</b>: número de interrupções. <b>DMIC</b>: maior interrupção contínua. <b>DICRI</b>: DIC em dia crítico. Têm limites regulatórios cuja violação pode gerar compensação à unidade consumidora.",
    aulaIds: ["aula-01-09"],
  },
  {
    id: "gl-eficiencia",
    term: "Eficiência",
    unit: "Razão",
    definition:
      "Razão entre energia útil entregue e energia de entrada. Nenhum sistema real é 100% eficiente — parte da energia vira calor, vibração, ruído, perdas magnéticas e mecânicas. Em instalações industriais, eficiência de equipamento velho é uma das primeiras frentes legítimas de redução de custo.",
    aulaIds: ["aula-01-09"],
  },
  {
    id: "gl-energia",
    term: "Energia",
    unit: "kWh, MWh",
    definition:
      "Capacidade de realizar trabalho ou produzir transformação. Em eletricidade, energia é potência integrada no tempo (kWh = kW × h). É a grandeza cobrada como \"consumo\" na fatura.",
    aulaIds: ["aula-01-01", "aula-01-03", "aula-01-04", "aula-01-05", "aula-01-07", "aula-01-09"],
  },
  {
    id: "gl-fator-de-capacidade-fc",
    term: "Fator de capacidade (FC)",
    unit: "Geração",
    definition:
      "Razão entre a geração efetiva e a geração máxima teórica de uma usina, no período. Mede quanto da capacidade instalada foi efetivamente convertida em energia. Difere drasticamente por tecnologia: nuclear 85–95%, hidro BR ~50%, solar fotovoltaica BR ~25%, térmica peaker &lt;15%.",
    aulaIds: ["aula-01-08"],
  },
  {
    id: "gl-fator-de-carga-fc",
    term: "Fator de carga (FC)",
    unit: "Razão",
    definition:
      "Razão entre demanda média e demanda máxima de uma unidade consumidora. Mede quão bem a instalação aproveita a capacidade reservada. Operação contínua: 0,70–0,90. Operação concentrada com picos: 0,15–0,40. FC baixo não é necessariamente erro — pode refletir processo produtivo legítimo.",
    aulaIds: ["aula-01-05"],
  },
  {
    id: "gl-fator-de-potencia-fp",
    term: "Fator de potência (FP)",
    unit: "cos φ",
    definition:
      "Razão entre potência ativa (kW) e potência aparente (kVA). Em regime senoidal, equivale ao cosseno do ângulo de defasagem entre tensão e corrente. Referência prática regulatória brasileira para Grupo A: mínimo 0,92, indutivo ou capacitivo. Abaixo desse valor pode haver cobrança por excedente reativo.",
    aulaIds: ["aula-01-02", "aula-01-07"],
  },
  {
    id: "gl-frequencia",
    term: "Frequência",
    unit: "Hz",
    definition:
      "Número de ciclos por segundo de uma corrente alternada. No Brasil, 60 Hz. Funciona como termômetro físico do equilíbrio em tempo real entre geração e consumo — desvios indicam descasamento e disparam ações operacionais do ONS.",
    aulaIds: ["aula-01-03", "aula-01-09"],
  },
  {
    id: "gl-grupo-a",
    term: "Grupo A",
    unit: "Classificação",
    definition:
      "Classe de consumidores atendidos em alta ou média tensão (≥ 2,3 kV) — indústrias, grandes comércios. Subdivide-se em A1, A2, A3, A3a, A4 e AS por nível de tensão. Estrutura tarifária binômia (consumo + demanda). Todo o universo industrial relevante da GridAlpha está aqui.",
    aulaIds: ["aula-01-06", "aula-01-07"],
  },
  {
    id: "gl-grupo-b",
    term: "Grupo B",
    unit: "Classificação",
    definition:
      "Classe de consumidores atendidos em baixa tensão (&lt; 2,3 kV) — residências, pequenos comércios, pequenas propriedades rurais. Estrutura tarifária monômia (essencialmente kWh × tarifa).",
    aulaIds: ["aula-01-06"],
  },
  {
    id: "gl-harmonicos",
    term: "Harmônicos",
    unit: "Qualidade",
    definition:
      "Distorções na forma de onda elétrica em múltiplos da frequência fundamental. Comuns em cargas não lineares — drives de velocidade variável, inversores, fontes eletrônicas, máquinas de solda. Causam aquecimento, disparo de proteções, redução de vida útil. Tratamento técnico envolve filtros passivos ou ativos.",
    aulaIds: ["aula-01-07", "aula-01-09"],
  },
  {
    id: "gl-kva",
    term: "kVA",
    unit: "Potência aparente",
    definition:
      "Quilovolt-ampere. Unidade de potência aparente — combinação vetorial de potência ativa (kW) e reativa (kVAr). É o \"tamanho elétrico total\" que a rede precisa entregar à instalação. Dimensiona transformadores e cabos.",
    aulaIds: ["aula-01-02", "aula-01-07"],
  },
  {
    id: "gl-kvar",
    term: "kVAr",
    unit: "Potência reativa",
    definition:
      "Quilovolt-ampere reativo. Unidade de potência reativa — circula entre rede e equipamentos para sustentar campos magnéticos e elétricos sem realizar trabalho útil no eixo da máquina. Necessária para motores e transformadores, mas excessiva degrada o fator de potência.",
    aulaIds: ["aula-01-02", "aula-01-07"],
  },
  {
    id: "gl-kw",
    term: "kW",
    unit: "Potência ativa",
    definition:
      "Quilowatt. Unidade de potência ativa — a parcela da potência elétrica que realiza trabalho útil (gira eixo, esquenta forno, aciona esteira). 1 kW = 1.000 W. Não confundir com kWh, que é energia.",
    aulaIds: ["aula-01-01", "aula-01-02", "aula-01-05", "aula-01-06", "aula-01-07"],
  },
  {
    id: "gl-kwh",
    term: "kWh",
    unit: "Energia",
    definition:
      "Quilowatt-hora. Unidade de energia equivalente a um quilowatt durante uma hora. É a grandeza que aparece como \"consumo\" em qualquer fatura elétrica. kWh = kW × h.",
    aulaIds: ["aula-01-01", "aula-01-06"],
  },
  {
    id: "gl-lei-de-ohm",
    term: "Lei de Ohm",
    unit: "V = I × R",
    definition:
      "Relação fundamental entre tensão (V), corrente (I) e resistência (R) em um circuito elétrico. Junto com P = I² × R (perdas resistivas) e P = V × I (potência em DC), forma o tripé de qualquer cálculo elétrico de instalação.",
    aulaIds: ["aula-01-02"],
  },
  {
    id: "gl-modalidade-tarifaria",
    term: "Modalidade tarifária",
    unit: "Tarifa",
    definition:
      "Forma de estruturação tarifária aplicável ao consumidor. Para Grupo A: <b>Verde</b> (demanda única, mas tarifa de energia diferenciada por horário), <b>Azul</b> (demanda diferenciada por horário ponta/fora-ponta), e <b>Branca</b> (apenas Grupo B em casos específicos). A escolha tem impacto direto na fatura e exige análise do perfil operacional.",
    aulaIds: ["aula-01-05"],
  },
  {
    id: "gl-ons",
    term: "ONS",
    unit: "Operador",
    definition:
      "Operador Nacional do Sistema Elétrico. Pessoa jurídica de direito privado responsável pela coordenação e controle da operação das instalações de geração e transmissão de energia elétrica no Sistema Interligado Nacional (SIN). É quem mantém o batimento de 60 Hz da rede em tempo real.",
    aulaIds: ["aula-01-03"],
  },
  {
    id: "gl-perdas-tecnicas",
    term: "Perdas técnicas",
    unit: "Físicas",
    definition:
      "Perdas físicas no sistema elétrico — aquecimento de cabos, perdas em transformadores, perdas magnéticas, perdas mecânicas, perdas de conversão. Reconhecidas pela ANEEL nos processos de revisão tarifária e embutidas na componente fio da TUSD.",
    aulaIds: ["aula-01-02", "aula-01-04"],
  },
  {
    id: "gl-perdas-nao-tecnicas",
    term: "Perdas não técnicas",
    unit: "Comerciais",
    definition:
      "Perdas comerciais e operacionais — furto de energia, fraude no medidor, ligações clandestinas, erro de medição, inadimplência, problemas cadastrais. Afetam tarifas via ressarcimento parcial reconhecido em revisão. Concentram-se especialmente em centros urbanos do Norte e Nordeste.",
    aulaIds: ["aula-01-04"],
  },
  {
    id: "gl-pld",
    term: "PLD",
    unit: "Preço · CCEE",
    definition:
      "Preço de Liquidação das Diferenças. Preço de curto prazo da energia, apurado pela CCEE com base no Custo Marginal de Operação (CMO) calculado pelos modelos de despacho. Usado para liquidação financeira de diferenças entre energia contratada e energia medida. Tema-chave dos próximos módulos.",
    aulaIds: [],
  },
  {
    id: "gl-potencia",
    term: "Potência",
    unit: "W, kW, MW",
    definition:
      "Taxa instantânea de uso, geração ou transformação de energia. Unidade SI é o watt (W). Difere de energia: potência mede velocidade; energia mede volume acumulado.",
    aulaIds: ["aula-01-01", "aula-01-02", "aula-01-04", "aula-01-07", "aula-01-08"],
  },
  {
    id: "gl-prodist",
    term: "PRODIST",
    unit: "Procedimentos · ANEEL",
    definition:
      "Procedimentos de Distribuição de Energia Elétrica no Sistema Elétrico Nacional. Conjunto de documentos normativos que regulam tecnicamente o setor de distribuição. O <b>Módulo 8</b> trata especificamente de Qualidade do Fornecimento (continuidade, tensão, fator de potência, harmônicos).",
    aulaIds: ["aula-01-07", "aula-01-09"],
  },
  {
    id: "gl-ren-aneel-1-000-2021",
    term: "REN ANEEL 1.000/2021",
    unit: "Norma",
    definition:
      "Resolução Normativa ANEEL nº 1.000, de 7 de dezembro de 2021. Estabelece as regras de prestação do serviço público de distribuição de energia elétrica. Em vigor desde 3 de janeiro de 2022, substituiu a REN 414/2010. É a base regulatória atual para a relação distribuidora–consumidor.",
    aulaIds: ["aula-01-05", "aula-01-07"],
  },
  {
    id: "gl-tensao",
    term: "Tensão",
    unit: "V, kV",
    definition:
      "Diferença de potencial elétrico entre dois pontos de um circuito. Analogia hidráulica: pressão da água. Unidade SI é o volt (V). Define grupo tarifário no Brasil: Grupo B (baixa tensão, &lt; 2,3 kV) ou Grupo A (média/alta tensão, ≥ 2,3 kV).",
    aulaIds: ["aula-01-01", "aula-01-02", "aula-01-03", "aula-01-04", "aula-01-05", "aula-01-06", "aula-01-07", "aula-01-09"],
  },
  {
    id: "gl-trifasico",
    term: "Trifásico",
    unit: "Sistema",
    definition:
      "Sistema de fornecimento em corrente alternada com três fases defasadas em 120°. Padrão industrial. Permite maior potência, maior eficiência em motores, e melhor equilíbrio de carga. Praticamente todo consumidor relevante do Grupo A é atendido em trifásico.",
    aulaIds: ["aula-01-02", "aula-01-06", "aula-01-09"],
  },
  {
    id: "gl-tusd",
    term: "TUSD",
    unit: "Tarifa",
    definition:
      "Tarifa de Uso do Sistema de Distribuição. Componente tarifária que remunera o uso da infraestrutura de distribuição. Subdivide-se em TUSD-fio (rede física e perdas) e TUSD-demanda (capacidade reservada). Separada da TE (Tarifa de Energia) que remunera a energia em si.",
    aulaIds: ["aula-01-04"],
  },
  {
    id: "gl-ufer",
    term: "UFER",
    unit: "Cobrança · reativo",
    definition:
      "Unidade de Faturamento de Energia Reativa. Cobrança histórica aplicada ao consumidor do Grupo A quando o fator de potência opera abaixo do limite regulatório (referência 0,92). Hoje regulada no contexto da REN ANEEL 1.000/2021 e normativos complementares. Aparece em linha específica da fatura.",
    aulaIds: ["aula-01-07"],
  },
  {
    id: "gl-volt-v",
    term: "Volt (V)",
    unit: "Tensão",
    definition:
      "Unidade de medida de tensão elétrica. 1 V = 1 J/C (joule por coulomb). Em escala industrial, valores típicos no Brasil: 127/220 V (BT), 13,8 kV (A4), 69 kV (A3), 138 kV (A2), 230 kV+ (A1).",
    aulaIds: ["aula-01-02"],
  },
  {
    id: "gl-watt-w",
    term: "Watt (W)",
    unit: "Potência",
    definition:
      "Unidade SI de potência. 1 W = 1 J/s (joule por segundo). Em circuitos DC: W = V × A. Em escala industrial usa-se kW (1.000 W) ou MW (1.000.000 W).",
    aulaIds: ["aula-01-01", "aula-01-02"],
  },
];

/** Verbetes em que a aula aparece — para a página da aula referenciar. */
export const getTermosByAula = (aulaId: string): GlossaryTerm[] =>
  ALEXANDRIA_GLOSSARIO.filter((t) => t.aulaIds.includes(aulaId));

export const getTermoById = (id: string): GlossaryTerm | undefined =>
  ALEXANDRIA_GLOSSARIO.find((t) => t.id === id);

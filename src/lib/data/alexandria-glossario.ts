// alexandria-glossario.ts
// Glossário Alexandria — os § Lex dos módulos extraídos.
//
// ── MÓDULO 01 (Wave 8) — 38 verbetes ──────────────────────────
// Fonte: `Alexandria modulos/alexandria_modulo01.html`, seção § Lex
// (L2520-2681) — `details.glossary-item` com `.term`, `.unit` e
// `.glossary-content` extraídos por parsing determinístico. Termo, etiqueta
// e definição são literais; HTML inline (<b>) e entidades preservados.
//
// DIVERGÊNCIA DA FONTE, registrada e não corrigida: a prosa do § Lex diz
// «Vinte e oito termos», mas o markup tem 38 `glossary-item`. A contagem
// real vence a prosa.
//
// `aulaIds` do Módulo 01 — cruzamento contra o corpo REAL das nove aulas
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
//
// ── MÓDULOS 02-08 (Wave 34) ───────────────────────────────────
// Contagens medidas na fonte, prosa e markup CONCORDANDO em todos:
//   M02 65 · M03 63 (vocabulário antigo, `details.glossary-item`)
//   M04 58 · M05 72 · M06 99 · M07 118 · M08 124 (vocabulário novo:
//   § Lex > details agrupados por categoria > p > span.term; o rótulo da
//   categoria — "Formação de preço e despacho" — vira o `unit`, sem a
//   contagem "· N termos"; o ponto final DENTRO do span.term é pontuação
//   de frase e foi removido do termo).
// No M04 o `.term` bruto dá 76 porque a classe também aparece no CORPO —
// a contagem §Lex-escopada dá os 58 que a prosa anuncia.
//
// Ids namespaçados por módulo (`gl-m02-…`): o mesmo termo pode ser
// definido em § Lex de módulos diferentes com definição própria (PLD nos
// M01 e M04, p.ex.) — são verbetes distintos, não duplicata a fundir.
// Os 38 do Módulo 01 mantêm os ids originais (`gl-…`), intocados.
//
// `aulaIds` dos M02-08 — âncora por ESTRUTURA, não por varredura de
// corpo: o termo ancora quando aparece (frase exata, fronteira de
// palavra, sem acento/caixa) no título, subtítulo ou num cabeçalho de
// seção (`kind: 'titulo'`) da aula, lidos do arquivo de conteúdo TS
// real. Cabeçalho é assunto; menção em prosa pode ser incidental — a
// regra é mais conservadora que a leitura de corpo da Wave 8, e o
// resultado de cada âncora foi auditado a olho antes de entrar.
// Termo sem âncora estrutural fica `aulaIds: []`, honestamente.

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

  // ── Modulo 02 (Wave 34) ──────────────────────────────
  {
    id: "gl-m02-alimentador",
    term: "Alimentador",
    unit: "Distribuição",
    definition:
      "Circuito de média tensão que sai de uma subestação de distribuição e abastece uma região — bairros, distritos industriais, zonas rurais. A falha de um alimentador desliga todos os consumidores a jusante; por isso religadores e seletividade são desenhados nesse nível.",
    aulaIds: [],
  },
  {
    id: "gl-m02-barramento",
    term: "Barramento",
    unit: "Subestação",
    definition:
      "Condutor comum que interliga os circuitos dentro de uma subestação. A configuração do barramento (simples, duplo, em anel) define a flexibilidade de manobra e a confiabilidade da instalação inteira — é decisão de projeto, não detalhe.",
    aulaIds: [],
  },
  {
    id: "gl-m02-bipolo",
    term: "Bipolo",
    unit: "HVDC",
    definition:
      "Configuração padrão dos grandes elos de corrente contínua: dois polos (positivo e negativo) operando em conjunto, com capacidade de seguir transmitindo parcialmente se um polo falhar. Os elos de Itaipu (±600 kV), Madeira (±600 kV) e Belo Monte (±800 kV) são bipolos.",
    aulaIds: [],
  },
  {
    id: "gl-m02-black-start",
    term: "Black start",
    unit: "Ancilar",
    definition:
      "Capacidade de uma usina partir sem alimentação externa e energizar trechos da rede do zero após um colapso amplo. Define a velocidade da recomposição: unidades black start acendem ilhas, que sincronizam entre si até o sistema inteiro voltar.",
    aulaIds: [],
  },
  {
    id: "gl-m02-cag",
    term: "CAG",
    unit: "Controle",
    definition:
      "Controle Automático de Geração — a regulação secundária de frequência. Comandado pelos centros de operação do ONS, redistribui geração em escala de minutos para devolver a frequência a 60,00 Hz e os intercâmbios entre áreas aos valores programados, recompondo a reserva consumida pela regulação primária.",
    aulaIds: [],
  },
  {
    id: "gl-m02-ccee",
    term: "CCEE",
    unit: "Instituição",
    definition:
      "Câmara de Comercialização de Energia Elétrica. Contabiliza e liquida as operações de compra e venda do setor e publica o PLD. No vocabulário deste módulo: o ONS decide o despacho físico; a CCEE fecha as contas financeiras que resultam dele — inclusive o rateio do ESS.",
    aulaIds: [],
  },
  {
    id: "gl-m02-cmo",
    term: "CMO",
    unit: "Preço",
    definition:
      "Custo Marginal de Operação — o custo de atender 1 MWh adicional de carga, apurado por submercado pela cadeia de modelos NEWAVE/DECOMP/DESSEM, com CVU auditado para térmicas e valor da água para hidrelétricas. É a base de cálculo do PLD, que o limita por piso e teto regulatórios.",
    aulaIds: [],
  },
  {
    id: "gl-m02-congestionamento",
    term: "Congestionamento",
    unit: "Rede",
    definition:
      "Condição em que o fluxo desejado excede o limite de um elemento da rede, obrigando redespacho fora da ordem de mérito (constrained-on/off). Entre submercados, separa os PLDs e aparece como spread; dentro de um submercado, o modelo de preço não o enxerga — o sobrecusto vira ESS rateado entre consumidores.",
    aulaIds: ["aula-02-10"],
  },
  {
    id: "gl-m02-constrained-on-constrained-off",
    term: "Constrained-on / constrained-off",
    unit: "Operação",
    definition:
      "Os dois lados do redespacho: <b>constrained-on</b> é a usina cara acionada fora da ordem de mérito por necessidade da rede; <b>constrained-off</b> é a usina barata impedida de gerar pela restrição. A compensação do constrained-off de eólicas e solares no NE é a disputa regulatória mais quente do tema no Brasil.",
    aulaIds: [],
  },
  {
    id: "gl-m02-curtailment",
    term: "Curtailment",
    unit: "Operação",
    definition:
      "Corte de geração disponível — tipicamente renovável — determinado pelo operador. No Brasil, classificado por <b>razão elétrica</b> (segurança/limites de rede) ou <b>razão energética</b> (excesso de oferta). Cresceu fortemente no Nordeste após as restrições operativas de 2023 e a expansão renovável acima do ritmo do escoamento.",
    aulaIds: ["aula-02-10"],
  },
  {
    id: "gl-m02-curva-de-carga",
    term: "Curva de carga",
    unit: "Operação",
    definition:
      "Representação da demanda ao longo do tempo — o retrato de como o consumo respira no dia, na semana, no ano. Residencial tem picos de manhã e noite; industrial pode ser 24/7, em turnos ou sazonal. O SIN soma todos os perfis.",
    aulaIds: ["aula-02-04"],
  },
  {
    id: "gl-m02-curva-liquida",
    term: "Curva líquida",
    unit: "Operação",
    definition:
      "Carga total menos a geração variável (solar e eólica) — o que sobra para a geração despachável atender. Afunda no meio do dia com o sol a pino e dispara no pôr do sol, criando a rampa do fim da tarde, a janela mais tensa da operação moderna.",
    aulaIds: ["aula-02-04"],
  },
  {
    id: "gl-m02-cust-cusd",
    term: "CUST / CUSD",
    unit: "Contratos",
    definition:
      "Contratos de Uso do Sistema de <b>Transmissão</b> (com o ONS, para conectados à Rede Básica) e de <b>Distribuição</b> (com a distribuidora local). Definem a fronteira institucional de quem paga TUST e quem paga TUSD. O CUSD é fonte primária em qualquer diagnóstico de cliente industrial.",
    aulaIds: [],
  },
  {
    id: "gl-m02-cvu",
    term: "CVU",
    unit: "R$/MWh",
    definition:
      "Custo Variável Unitário de uma usina termelétrica — combustível e custos variáveis por MWh, declarado e auditado. É o que posiciona cada térmica na ordem de mérito do despacho brasileiro — no modelo de custo auditado, a usina não oferta preço: declara custo e é fiscalizada.",
    aulaIds: [],
  },
  {
    id: "gl-m02-decomp",
    term: "DECOMP",
    unit: "Modelo",
    definition:
      "Modelo de médio prazo da cadeia de planejamento da operação: detalha a decisão do NEWAVE em horizonte de meses e semanas, conectando a política de uso dos reservatórios à programação que o DESSEM refinará em base horária.",
    aulaIds: [],
  },
  {
    id: "gl-m02-despacho-centralizado",
    term: "Despacho centralizado",
    unit: "Operação",
    definition:
      "Regime em que o operador do sistema — não o dono da usina — decide quem gera, quanto e quando, com base em custos auditados e otimização. É o modelo brasileiro, em contraste com mercados de ofertas onde o despacho emerge de lances dos agentes.",
    aulaIds: [],
  },
  {
    id: "gl-m02-dessem",
    term: "DESSEM",
    unit: "Modelo",
    definition:
      "Modelo de programação diária da operação, com resolução horária (e rede elétrica representada). Desde 2021 é dele que saem o CMO horário e, por consequência, o PLD horário publicado pela CCEE.",
    aulaIds: [],
  },
  {
    id: "gl-m02-disjuntor",
    term: "Disjuntor",
    unit: "Equipamento",
    definition:
      "Equipamento de manobra capaz de interromper correntes de curto-circuito. Comandado pelos relés de proteção, abre o circuito em poucos ciclos (dezenas de milissegundos), isolando a falta. A dupla relé + disjuntor é o sistema imunológico da rede.",
    aulaIds: [],
  },
  {
    id: "gl-m02-dit",
    term: "DIT",
    unit: "Rede",
    definition:
      "Demais Instalações de Transmissão — ativos de transmissoras em tensão inferior a 230 kV (tipicamente 69–138 kV), fora da Rede Básica. Zona intermediária que conecta a malha principal às distribuidoras e a grandes consumidores.",
    aulaIds: ["aula-02-01"],
  },
  {
    id: "gl-m02-erac",
    term: "ERAC",
    unit: "Proteção sistêmica",
    definition:
      "Esquema Regional de Alívio de Carga: corte automático e escalonado de blocos de consumo quando a frequência afunda além dos limiares (primeiro estágio tipicamente na casa de 58,5 Hz, conforme a região). Última linha de defesa — sacrifica parte da carga para evitar o colapso do sistema inteiro.",
    aulaIds: [],
  },
  {
    id: "gl-m02-ess",
    term: "ESS",
    unit: "Encargo",
    definition:
      "Encargos de Serviços do Sistema — a conta dos custos de operação que não cabem no preço de energia: despacho fora da ordem de mérito por restrição elétrica ou segurança energética, serviços ancilares e afins. Rateado entre consumidores na liquidação da CCEE. É onde o congestionamento interno do submercado se esconde.",
    aulaIds: [],
  },
  {
    id: "gl-m02-fio-b",
    term: "Fio B",
    unit: "Tarifa",
    definition:
      "Componente da TUSD que remunera os ativos e a operação da rede da própria distribuidora — em oposição ao Fio A, que repassa custos de transmissão a montante. Em discussões de reforma tarifária e de MMGD, \"quem paga o Fio B\" é a pergunta central.",
    aulaIds: ["aula-02-10"],
  },
  {
    id: "gl-m02-grid-forming-grid-following",
    term: "Grid-forming / grid-following",
    unit: "Tecnologia",
    definition:
      "Duas filosofias de controle de inversores. Grid-following segue uma referência de tensão e frequência que já existe na rede; grid-forming ajuda a criar essa referência — comportamento essencial em sistemas com alta penetração renovável e pouca máquina síncrona.",
    aulaIds: [],
  },
  {
    id: "gl-m02-hvdc",
    term: "HVDC",
    unit: "Tecnologia",
    definition:
      "High-Voltage Direct Current — transmissão em corrente contínua de alta tensão. Vence o AC em três situações: distâncias muito longas, interligação de sistemas assíncronos (Itaipu 50 Hz) e travessias submarinas. O Brasil opera alguns dos elos mais longos do mundo.",
    aulaIds: ["aula-02-02"],
  },
  {
    id: "gl-m02-ilhamento",
    term: "Ilhamento",
    unit: "Estabilidade",
    definition:
      "Separação elétrica de uma parte da rede, que passa a operar como ilha e precisa equilibrar sozinha sua geração e carga. Desequilíbrio grande derruba a ilha; ilhamento intencional e controlado, por outro lado, é a base de microrredes e de etapas da recomposição.",
    aulaIds: [],
  },
  {
    id: "gl-m02-inercia",
    term: "Inércia",
    unit: "Física do sistema",
    definition:
      "Energia cinética armazenada nas massas girantes sincronizadas (turbinas, rotores), sacada automaticamente quando há desbalanço — freia a variação de frequência e compra tempo para os controles. Geração conectada por inversor não contribui inércia naturalmente, tornando o sistema mais sensível a perdas de geração.",
    aulaIds: ["aula-02-08"],
  },
  {
    id: "gl-m02-inflexibilidade",
    term: "Inflexibilidade",
    unit: "Operação",
    definition:
      "Parcela mínima de geração que uma usina (tipicamente térmica) declara não poder reduzir por razões técnicas ou contratuais. Geração inflexível entra no balanço mesmo fora do mérito — e em cenários de excesso, compete com renovável e contribui para curtailment.",
    aulaIds: [],
  },
  {
    id: "gl-m02-intercambio",
    term: "Intercâmbio",
    unit: "Operação",
    definition:
      "Fluxo de energia entre subsistemas/submercados pelos grandes troncos de interligação. Quando o intercâmbio satura, os submercados se separam em preço — o spread de PLD é o sintoma visível. Monitorar intercâmbios é monitorar a costura do SIN.",
    aulaIds: [],
  },
  {
    id: "gl-m02-microrrede",
    term: "Microrrede",
    unit: "Rede moderna",
    definition:
      "Sistema local — geração distribuída, bateria, geração de apoio e controle inteligente — capaz de operar conectado à rede principal ou ilhado dela. Aplicações típicas: hospitais, mineração, data centers, comunidades isoladas. Exige engenharia de controle e proteção, não só equipamentos.",
    aulaIds: [],
  },
  {
    id: "gl-m02-mmgd",
    term: "MMGD",
    unit: "Geração",
    definition:
      "Micro e Minigeração Distribuída — majoritariamente solar em telhado, conectada na rede de distribuição e compensada via créditos. Dezenas de GW instalados que o operador enxerga como redução de carga, deprimindo a demanda líquida do meio-dia e criando a rampa do pôr do sol.",
    aulaIds: [],
  },
  {
    id: "gl-m02-n-1",
    term: "N-1",
    unit: "Critério",
    definition:
      "Critério de segurança: o sistema deve suportar a perda de qualquer elemento único (linha, transformador, gerador) sem corte de carga nem violação de limites. Protege contra falhas simples — não contra modos de falha comuns que levam vários elementos de uma vez, como em Itaberá/2009.",
    aulaIds: ["aula-02-08"],
  },
  {
    id: "gl-m02-newave",
    term: "NEWAVE",
    unit: "Modelo",
    definition:
      "Modelo de longo prazo (horizonte de anos) da cadeia de planejamento: decide a política ótima de uso dos reservatórios sob incerteza hidrológica, gerando a função de custo futuro da água que ancora todo o despacho hidrotérmico brasileiro.",
    aulaIds: [],
  },
  {
    id: "gl-m02-ons",
    term: "ONS",
    unit: "Instituição",
    definition:
      "Operador Nacional do Sistema Elétrico (Lei 9.648/1998). Associação civil sem fins lucrativos, fiscalizada pela ANEEL, que opera o SIN: despacho centralizado, intercâmbios, segurança, administração da transmissão (CUST) e planejamento da operação, sob os Procedimentos de Rede. Não vende energia, não tarifa, não regula, não constrói.",
    aulaIds: ["aula-02-06"],
  },
  {
    id: "gl-m02-ordem-de-merito",
    term: "Ordem de mérito",
    unit: "Operação",
    definition:
      "Princípio universal do despacho econômico: empilhar a oferta do menor para o maior custo variável e despachar até cobrir a demanda. A usina marginal — a última necessária para fechar o balanço — define o custo marginal do sistema: no Brasil, o CMO, base do PLD.",
    aulaIds: ["aula-02-05"],
  },
  {
    id: "gl-m02-parcela-variavel",
    term: "Parcela Variável",
    unit: "Transmissão",
    definition:
      "Desconto aplicado à RAP da transmissora quando a instalação fica indisponível ou opera com restrição. É o instrumento que transforma \"receita por disponibilidade\" em incentivo real: linha parada é receita perdida.",
    aulaIds: [],
  },
  {
    id: "gl-m02-perdas-nao-tecnicas",
    term: "Perdas não técnicas",
    unit: "Rede",
    definition:
      "Energia injetada e não faturada por furto (\"gatos\"), fraude de medição ou falhas de cadastro/faturamento. Concentradas na baixa tensão, com enorme variância regional. O nível regulatório reconhecido pela ANEEL é repassado à tarifa; o excedente sai da margem da distribuidora.",
    aulaIds: ["aula-02-09"],
  },
  {
    id: "gl-m02-perdas-tecnicas",
    term: "Perdas técnicas",
    unit: "Rede",
    definition:
      "Dissipação física inevitável do transporte: efeito Joule (I²R) em condutores e perdas de núcleo em transformadores. Crescem nos níveis baixos de tensão, onde a corrente é alta. Ordem de ~2% na Rede Básica e várias vezes isso na distribuição.",
    aulaIds: ["aula-02-09"],
  },
  {
    id: "gl-m02-pld",
    term: "PLD",
    unit: "R$/MWh · preview",
    definition:
      "Preço de Liquidação das Diferenças — o preço spot brasileiro, publicado pela CCEE por submercado e por hora: na essência, o CMO da cadeia de modelos submetido a piso e teto homologados anualmente pela ANEEL. Dissecação completa no Bloco 9.",
    aulaIds: [],
  },
  {
    id: "gl-m02-pmo-pdo",
    term: "PMO / PDO",
    unit: "Operação",
    definition:
      "Programa Mensal e Programa Diário da Operação — os dois elos da cascata de planejamento do ONS. O PMO fixa diretrizes de geração térmica e intercâmbios com discretização semanal; o PDO transforma a diretriz em programação horária do dia seguinte, que o tempo real executa e corrige.",
    aulaIds: ["aula-02-06"],
  },
  {
    id: "gl-m02-ponto-de-conexao",
    term: "Ponto de conexão",
    unit: "Fronteira",
    definition:
      "Fronteira física e contratual entre a rede da concessionária e a instalação do consumidor. Define tensão de fornecimento (logo, grupo tarifário), local da medição de faturamento, referência dos indicadores de qualidade (PRODIST M8) e a divisa de titularidade de ativos e perdas.",
    aulaIds: ["aula-02-03"],
  },
  {
    id: "gl-m02-procedimentos-de-rede",
    term: "Procedimentos de Rede",
    unit: "Norma",
    definition:
      "Corpo normativo público elaborado pelo ONS e homologado pela ANEEL que disciplina a operação do SIN: conexão, planejamento da operação, operação em tempo real, proteção, recomposição e serviços ancilares. Fonte primária obrigatória para qualquer afirmação operativa em conversa técnica.",
    aulaIds: [],
  },
  {
    id: "gl-m02-rampa",
    term: "Rampa",
    unit: "Operação",
    definition:
      "Velocidade de variação da carga líquida que a geração despachável precisa acompanhar, medida em GW por hora. A rampa do fim da tarde — solar caindo enquanto o consumo residencial sobe — é a mais severa do dia e valoriza hidro flexível, baterias e resposta da demanda.",
    aulaIds: [],
  },
  {
    id: "gl-m02-rap",
    term: "RAP",
    unit: "Transmissão",
    definition:
      "Receita Anual Permitida — a remuneração da concessionária de transmissão, definida no leilão (vence a menor RAP) e paga por disponibilidade ao longo da concessão (tipicamente 30 anos). Independe do MWh transportado; sofre desconto de Parcela Variável por indisponibilidade.",
    aulaIds: [],
  },
  {
    id: "gl-m02-recomposicao",
    term: "Recomposição",
    unit: "Operação",
    definition:
      "Processo coordenado de religar o sistema após uma perturbação ampla: unidades black start energizam trechos, usinas sincronizam, cargas retornam em blocos, ilhas se reconectam. Segue procedimentos pré-estudados — religar tudo de uma vez derrubaria o sistema de novo.",
    aulaIds: [],
  },
  {
    id: "gl-m02-rede-basica",
    term: "Rede Básica",
    unit: "Rede",
    definition:
      "Conjunto das instalações de transmissão em tensão igual ou superior a 230 kV. Operada centralizadamente pelo ONS, acessada via CUST e remunerada via TUST. Abaixo dela: DIT e redes de distribuição. A fronteira dos 230 kV é fronteira de regime jurídico, operador e cobrança.",
    aulaIds: ["aula-02-01"],
  },
  {
    id: "gl-m02-regulacao-primaria",
    term: "Regulação primária",
    unit: "Controle",
    definition:
      "Resposta automática e local dos reguladores de velocidade das usinas ao desvio de frequência, em escala de segundos. Estanca a queda (ou subida) em um valor estável — porém fora de 60,00 Hz; quem devolve ao valor nominal é a regulação secundária (CAG).",
    aulaIds: [],
  },
  {
    id: "gl-m02-rele-de-protecao",
    term: "Relé de proteção",
    unit: "Equipamento",
    definition:
      "Dispositivo que monitora continuamente grandezas elétricas e, ao detectar uma falta, comanda a abertura de disjuntores em milissegundos. A coordenação entre relés implementa a seletividade. Atuação incorreta de proteção é gatilho recorrente de grandes perturbações — inclusive no 15/08/2023.",
    aulaIds: [],
  },
  {
    id: "gl-m02-religador",
    term: "Religador",
    unit: "Proteção",
    definition:
      "Equipamento de distribuição que desliga ao detectar falta e tenta religar automaticamente após instantes. Resolve a maioria das faltas, que são temporárias — galho, animal, descarga atmosférica — sem deslocar equipe, e precisa de coordenação para não religar sobre falta permanente.",
    aulaIds: [],
  },
  {
    id: "gl-m02-reserva-girante",
    term: "Reserva girante",
    unit: "Reserva",
    definition:
      "Capacidade já sincronizada ao sistema — usinas girando abaixo do máximo — pronta para elevar geração em segundos. É a primeira reserva a responder depois da inércia e da regulação primária. Exemplo: usina a 80 MW podendo gerar 100 carrega 20 MW de reserva girante.",
    aulaIds: [],
  },
  {
    id: "gl-m02-reserva-operativa",
    term: "Reserva operativa",
    unit: "Reserva",
    definition:
      "Margem de capacidade mantida disponível para cobrir variações de carga, erros de previsão e contingências, mobilizável em minutos. Junto da girante (segundos) e da fria (horas), forma o colchão que permite ao sistema absorver sustos — e que custa dinheiro mesmo parado.",
    aulaIds: [],
  },
  {
    id: "gl-m02-resiliencia",
    term: "Resiliência",
    unit: "Confiabilidade",
    definition:
      "Capacidade de resistir, adaptar-se e recuperar-se depois que a falha acontece — complementar à confiabilidade, que busca evitá-la. Um sistema resiliente isola rápido, mantém cargas críticas, recompõe em etapas e aprende com o evento.",
    aulaIds: [],
  },
  {
    id: "gl-m02-resposta-da-demanda",
    term: "Resposta da demanda",
    unit: "Rede moderna",
    definition:
      "Ajuste voluntário de consumo para ajudar o sistema ou reduzir custo: deslocar produção para fora do pico, reduzir carga na rampa, mudar horários de bombeamento. Transforma a demanda de passiva em recurso operacional — e, em desenhos maduros, em receita.",
    aulaIds: [],
  },
  {
    id: "gl-m02-rocof",
    term: "RoCoF",
    unit: "Hz/s",
    definition:
      "Rate of Change of Frequency — a taxa inicial de variação da frequência após um desbalanço, inversamente proporcional à inércia do sistema (RoCoF ∝ ΔP/2H). Métrica central da discussão sobre penetração de inversores: menos inércia, RoCoF maior, menos tempo para os controles agirem.",
    aulaIds: [],
  },
  {
    id: "gl-m02-scada",
    term: "SCADA",
    unit: "Sistema",
    definition:
      "Supervisory Control and Data Acquisition — a camada de telemetria e telecomando que leva o estado de cada subestação aos centros de operação em tempo real e permite manobras remotas. É o sistema nervoso que torna possível operar um continente de uma sala.",
    aulaIds: ["aula-02-06"],
  },
  {
    id: "gl-m02-seccionadora",
    term: "Seccionadora",
    unit: "Subestação",
    definition:
      "Chave que isola trechos para manutenção criando separação visível e segura. Não interrompe corrente de falha — essa função é do disjuntor. Confundir os dois equipamentos é o erro clássico que denuncia quem nunca pisou numa subestação.",
    aulaIds: [],
  },
  {
    id: "gl-m02-seletividade",
    term: "Seletividade",
    unit: "Proteção",
    definition:
      "Princípio de coordenação da proteção: isolar a menor região possível, no menor tempo possível, deixando o resto do sistema intacto. Quando a seletividade falha, eventos locais escalam — o ingrediente clássico do apagão em cascata.",
    aulaIds: [],
  },
  {
    id: "gl-m02-servicos-ancilares",
    term: "Serviços ancilares",
    unit: "Ancilar",
    definition:
      "Funções que não são venda de energia, mas sem as quais a rede não opera com segurança: controle de frequência (regulação primária e secundária), suporte de tensão e reativos, reservas de potência e black start. Coordenados pelo ONS e remunerados conforme regras setoriais.",
    aulaIds: ["aula-02-07"],
  },
  {
    id: "gl-m02-sin",
    term: "SIN",
    unit: "Sistema",
    definition:
      "Sistema Interligado Nacional — a malha eletroenergética que conecta geração e carga em escala continental, atendendo a quase totalidade do consumo do país, dividida em quatro subsistemas (SE/CO, S, NE, N) que coincidem com os submercados de preço.",
    aulaIds: ["aula-02-01"],
  },
  {
    id: "gl-m02-sinal-locacional",
    term: "Sinal locacional",
    unit: "Conceito",
    definition:
      "Incentivo econômico que diferencia agentes pela posição na malha. No desenho brasileiro ele mora no fio — a TUST nodal, anual e estável — e não no preço da energia, que é zonal por submercado. Gerador longe da carga tende a pagar mais pelo uso da transmissão.",
    aulaIds: ["aula-02-10"],
  },
  {
    id: "gl-m02-smf",
    term: "SMF",
    unit: "Medição",
    definition:
      "Sistema de Medição para Faturamento — o conjunto de medidores e requisitos técnicos, no ponto de conexão, que lastreia a contabilização na CCEE para agentes do mercado. Sem SMF adequado, não há migração ao ACL.",
    aulaIds: [],
  },
  {
    id: "gl-m02-subestacao",
    term: "Subestação",
    unit: "Rede",
    definition:
      "Instalação onde a rede transforma (tensão), manobra (disjuntores e seccionadoras), protege (relés) e mede/telecomanda (SCADA). As articulações do sistema — entre a usina e a tomada existem, tipicamente, de quatro a sete delas.",
    aulaIds: ["aula-02-03"],
  },
  {
    id: "gl-m02-submercado",
    term: "Submercado",
    unit: "Mercado",
    definition:
      "Zona de apuração do PLD — quatro no Brasil, coincidentes com os subsistemas do SIN. Dentro do submercado, preço único (restrições internas viram ESS); entre submercados, os preços se separam quando os intercâmbios saturam.",
    aulaIds: [],
  },
  {
    id: "gl-m02-tusd",
    term: "TUSD",
    unit: "Tarifa",
    definition:
      "Tarifa de Uso do Sistema de Distribuição — o pedágio pago à distribuidora local por todo conectado à sua rede, inclusive consumidores livres. Para o Grupo A, cobrada em demanda (R$/kW) e energia (R$/MWh); carrega Fio B, repasses (Fio A/TUST), encargos e perdas reconhecidas.",
    aulaIds: ["aula-02-10"],
  },
  {
    id: "gl-m02-tust",
    term: "TUST",
    unit: "Tarifa",
    definition:
      "Tarifa de Uso do Sistema de Transmissão — paga por geradores e grandes consumidores conectados à Rede Básica (via CUST). Calculada por metodologia nodal: o valor depende da localização do agente na malha — o sinal locacional brasileiro.",
    aulaIds: ["aula-02-10"],
  },
  {
    id: "gl-m02-valor-da-agua",
    term: "Valor da água",
    unit: "R$/MWh",
    definition:
      "Custo de oportunidade de turbinar água hoje em vez de guardá-la para o futuro — calculado pela cadeia NEWAVE/DECOMP/DESSEM, não declarado por agente. É o que posiciona a hidroeletricidade na ordem de mérito e, na maior parte das horas, o que efetivamente precifica o Brasil.",
    aulaIds: ["aula-02-05"],
  },

  // ── Modulo 03 (Wave 34) ──────────────────────────────
  {
    id: "gl-m03-aerogerador",
    term: "Aerogerador",
    unit: "Eólica",
    definition:
      "O conjunto turbina eólica completo: rotor (pás + cubo), nacele (multiplicadora ou acionamento direto, gerador, controle) e torre. As máquinas modernas onshore passam de 100 m de altura de cubo e diâmetros de rotor acima de 150 m — altura e área existem por causa do cubo da velocidade.",
    aulaIds: [],
  },
  {
    id: "gl-m03-afluencia",
    term: "Afluência",
    unit: "Hidro",
    definition:
      "A vazão de água que chega a um aproveitamento hidrelétrico num período. É a \"receita\" física da usina: o fio d'água a converte imediatamente; o reservatório escolhe entre turbinar e estocar.",
    aulaIds: [],
  },
  {
    id: "gl-m03-arbitragem-de-energia",
    term: "Arbitragem (de energia)",
    unit: "Armazenamento",
    definition:
      "Comprar (carregar) energia na hora barata e vender (descarregar) na hora cara. É a aplicação clássica da bateria de 2–4 horas: barriga solar do meio-dia → rampa do fim da tarde. O valor capturado é o spread entre as horas, menos as perdas do ciclo.",
    aulaIds: [],
  },
  {
    id: "gl-m03-autoproducao",
    term: "Autoprodução",
    unit: "Regulatório",
    definition:
      "Regime em que o consumidor gera (ou participa de geração) para consumo próprio, com tratamento regulatório e de encargos específico. Os desenhos e limiares de enquadramento — inclusive por participação societária em usina remota — mudaram nos últimos anos: item permanente de verificação vigente antes de qualquer estudo.",
    aulaIds: [],
  },
  {
    id: "gl-m03-bagaco-de-cana",
    term: "Bagaço de cana",
    unit: "Biomassa",
    definition:
      "Resíduo fibroso da moagem da cana, queimado em caldeiras de cogeração no setor sucroenergético. Combustível \"grátis\" do ponto de vista da usina (subproduto), disponível no calendário da safra — abril a novembro no Centro-Sul.",
    aulaIds: [],
  },
  {
    id: "gl-m03-balbina",
    term: "Balbina",
    unit: "História",
    definition:
      "UHE no Amazonas (anos 1980) que virou o anti-exemplo do setor: área alagada enorme para potência pequena. Trauma formativo citado em todo debate de licenciamento — parte da explicação de por que o país migrou para o fio d'água.",
    aulaIds: [],
  },
  {
    id: "gl-m03-bess",
    term: "BESS",
    unit: "Armazenamento",
    definition:
      "Battery Energy Storage System — sistema de armazenamento por baterias, tipicamente lítio (química LFP dominante), com inversores e controle. Definido por dois números independentes: potência (MW) e energia (MWh).",
    aulaIds: [],
  },
  {
    id: "gl-m03-canibalizacao",
    term: "Canibalização",
    unit: "Economia",
    definition:
      "Erosão do preço capturado por uma fonte variável à medida que sua própria penetração cresce: cada novo MW solar gera nas mesmas horas dos anteriores, derrubando o preço justamente quando a fonte produz. Custo médio em queda com receita unitária em queda mais rápida — o limite nº 3 do LCOE.",
    aulaIds: [],
  },
  {
    id: "gl-m03-capex",
    term: "CAPEX",
    unit: "Economia",
    definition:
      "Capital expenditure — o investimento de construção do ativo. Nas fontes da Família 1 (hidro, eólica, solar, nuclear) domina o custo total; anualizado pelo CRF, é o numerador principal do LCOE.",
    aulaIds: [],
  },
  {
    id: "gl-m03-ccc",
    term: "CCC",
    unit: "Encargo",
    definition:
      "Conta de Consumo de Combustíveis — encargo setorial que socializa nacionalmente o sobrecusto da geração (majoritariamente a diesel/óleo) dos sistemas isolados. O mecanismo do \"paradoxo amazônico\": todo consumidor do SIN ajuda a pagar a energia mais cara do país.",
    aulaIds: [],
  },
  {
    id: "gl-m03-cgh",
    term: "CGH",
    unit: "Hidro",
    definition:
      "Central Geradora Hidrelétrica — aproveitamento hidrelétrico de pequeno porte (até 5 MW), com registro simplificado na ANEEL. Junto das PCHs, compõe a hidreletricidade de pequena escala do país.",
    aulaIds: [],
  },
  {
    id: "gl-m03-ciclo-combinado",
    term: "Ciclo combinado",
    unit: "Térmica",
    definition:
      "Configuração em que o calor de exaustão da turbina a gás gera vapor para uma segunda turbina. Eficiência de 55–60% — o melhor rendimento térmico do portfólio — em troca de partida mais lenta e CAPEX maior. Vocação: rodar muitas horas.",
    aulaIds: ["aula-03-06"],
  },
  {
    id: "gl-m03-ciclo-simples",
    term: "Ciclo simples",
    unit: "Térmica",
    definition:
      "Turbina a gás em ciclo aberto: queima, gira, exausta. Eficiência de 35–40%, partida em minutos, CAPEX baixo. Vocação: ponta, emergência, flexibilidade — a máquina que cobra caro por hora e barato por existir.",
    aulaIds: ["aula-03-06"],
  },
  {
    id: "gl-m03-cogeracao",
    term: "Cogeração",
    unit: "Térmica",
    definition:
      "Produção combinada de eletricidade e calor útil de processo a partir do mesmo combustível. É o desenho padrão da biomassa sucroenergética: a caldeira fornece vapor à usina de açúcar/etanol e o excedente vira eletricidade exportada.",
    aulaIds: [],
  },
  {
    id: "gl-m03-crf",
    term: "CRF",
    unit: "Finanças",
    definition:
      "Capital Recovery Factor — fator que converte um investimento em parcelas anuais equivalentes dada uma taxa (WACC) e uma vida útil: CRF = r(1+r)ⁿ / ((1+r)ⁿ − 1). Com r = 10% e n = 25 anos, ≈ 0,11 — cada real de CAPEX \"custa\" 11 centavos por ano.",
    aulaIds: [],
  },
  {
    id: "gl-m03-curtailment",
    term: "Curtailment",
    unit: "Operação",
    definition:
      "Corte de geração renovável disponível por restrição de escoamento ou excesso sistêmico — energia de custo zero desperdiçada por falta de fio ou de demanda. Cresceu no NE com o boom eólico-solar; quem arca com o custo segue em disputa regulatória.",
    aulaIds: [],
  },
  {
    id: "gl-m03-curva-de-potencia",
    term: "Curva de potência",
    unit: "Eólica",
    definition:
      "O gráfico potência × velocidade do vento de cada modelo de turbina: zero até o cut-in (~3 m/s), subida cúbica até a nominal (~12 m/s), platô de potência cheia até o cut-out (~25 m/s), desligamento acima. O documento que casa máquina com sítio.",
    aulaIds: [],
  },
  {
    id: "gl-m03-cut-in-cut-out",
    term: "Cut-in / cut-out",
    unit: "Eólica",
    definition:
      "Velocidades de vento de partida (~3 m/s) e de desligamento por segurança (~25 m/s) de um aerogerador. Entre elas, a máquina extrai energia seguindo a curva de potência.",
    aulaIds: [],
  },
  {
    id: "gl-m03-cvu",
    term: "CVU",
    unit: "Despacho",
    definition:
      "Custo Variável Unitário — o custo declarado e homologado de gerar 1 MWh adicional numa térmica, dominado pelo combustível (preço × heat rate) mais O&M variável. Ordena a pilha de despacho e, na margem, forma o preço de curto prazo.",
    aulaIds: [],
  },
  {
    id: "gl-m03-densidade-energetica",
    term: "Densidade energética",
    unit: "Física",
    definition:
      "Energia contida por unidade de massa ou volume do combustível. O extremo é o urânio: uma pastilha equivale a toneladas de carvão — a razão física do CVU baixíssimo e do CAPEX altíssimo da nuclear.",
    aulaIds: [],
  },
  {
    id: "gl-m03-despachabilidade",
    term: "Despachabilidade",
    unit: "Atributo",
    definition:
      "Capacidade de gerar sob comando do operador, não sob condição do recurso. Combina controlabilidade, velocidade de resposta e duração sustentável (limitada pelo estoque: água, combustível, carga da bateria). O atributo que separa as famílias do portfólio.",
    aulaIds: [],
  },
  {
    id: "gl-m03-ear",
    term: "EAR",
    unit: "Hidro",
    definition:
      "Energia Armazenada — quanto de energia equivalente existe estocado nos reservatórios, publicado diariamente pelo ONS por subsistema, em % da capacidade máxima. O indicador antecedente do humor do preço e da bandeira.",
    aulaIds: [],
  },
  {
    id: "gl-m03-eficiencia-de-ciclo-round-trip",
    term: "Eficiência de ciclo (round-trip)",
    unit: "Armazenamento",
    definition:
      "Razão entre a energia descarregada e a energia consumida para carregar uma bateria — 85–90% típico em lítio. O \"pedágio\" da viagem no tempo: perde-se energia para ganhar deslocamento temporal.",
    aulaIds: [],
  },
  {
    id: "gl-m03-ena",
    term: "ENA",
    unit: "Hidro",
    definition:
      "Energia Natural Afluente — a afluência convertida em energia equivalente, geralmente expressa em % da média de longo termo (MLT). É a \"chuva em MWh\": o dial que o INST·03 manipula e que o mercado acompanha semanalmente.",
    aulaIds: [],
  },
  {
    id: "gl-m03-energia-firme-firmeza",
    term: "Energia firme / firmeza",
    unit: "Atributo",
    definition:
      "Capacidade de sustentar entrega nas condições críticas — a estiagem, a noite sem vento, o pico. O atributo escasso do sistema moderno: abundância de energia média com escassez de firmeza é o resumo da matriz pós-fio d'água.",
    aulaIds: ["aula-03-03"],
  },
  {
    id: "gl-m03-fator-de-capacidade",
    term: "Fator de capacidade",
    unit: "Métrica",
    definition:
      "Energia gerada ÷ (potência instalada × horas do período). A lente que converte MW de manchete em MWh de realidade: ~50–55% hidro, 40–55% eólica NE, 25–30% solar com tracker, 85–90% nuclear, e — para térmicas — o diário do despacho, não atributo da máquina.",
    aulaIds: [],
  },
  {
    id: "gl-m03-fio-b",
    term: "Fio B",
    unit: "Tarifa",
    definition:
      "Parcela da TUSD que remunera os ativos da própria distribuidora. Virou protagonista na MMGD: a Lei 14.300 instituiu sua cobrança gradual dos novos sistemas compensados — o \"pedágio\" pela rede que o prosumidor usa como bateria virtual.",
    aulaIds: [],
  },
  {
    id: "gl-m03-fio-d-agua",
    term: "Fio d'água",
    unit: "Hidro",
    definition:
      "Hidrelétrica sem reservatório de regularização relevante: gera conforme a vazão chega. Trade-off deliberado — menos área alagada, menos firmeza. O padrão das grandes usinas brasileiras pós-2000 (Belo Monte, Jirau, Santo Antônio).",
    aulaIds: ["aula-03-03"],
  },
  {
    id: "gl-m03-fissao-nuclear",
    term: "Fissão nuclear",
    unit: "Nuclear",
    definition:
      "Quebra controlada de núcleos pesados (urânio-235) liberando calor, que gera vapor e move turbina. Tecnicamente, a nuclear é uma térmica cujo combustível tem densidade energética extrema — daí CVU baixo e CAPEX dominante.",
    aulaIds: [],
  },
  {
    id: "gl-m03-garantia-fisica",
    term: "Garantia física",
    unit: "Regulatório",
    definition:
      "O lastro de energia que cada usina pode comercializar, calculado pelo MME/EPE a partir da contribuição da usina ao suprimento em condições críticas. Distinta do FC verificado: é métrica regulatória de contratação, não de operação. Protagonista no Bloco de mercados.",
    aulaIds: [],
  },
  {
    id: "gl-m03-gnl",
    term: "GNL",
    unit: "Térmica",
    definition:
      "Gás Natural Liquefeito — gás resfriado para transporte marítimo, regaseificado em terminais. Dá flexibilidade de suprimento ao preço do mercado global: foi o GNL spot que empurrou CVUs acima de R$ 1.000/MWh na crise de 2021.",
    aulaIds: [],
  },
  {
    id: "gl-m03-gsf",
    term: "GSF",
    unit: "Hidro · preview",
    definition:
      "Generation Scaling Factor — razão entre a geração hidráulica efetiva e a garantia física do conjunto de usinas do mecanismo de rateio hidrológico. GSF abaixo de 1 = risco hidrológico virando exposição financeira dos geradores. Tratamento completo no Bloco de mercados.",
    aulaIds: [],
  },
  {
    id: "gl-m03-heat-rate",
    term: "Heat rate",
    unit: "Térmica",
    definition:
      "Quanta energia de combustível a máquina consome por MWh elétrico gerado — o inverso da eficiência. Multiplicado pelo preço do combustível, dá o coração do CVU: a térmica como conversor de preço de combustível em preço de energia.",
    aulaIds: [],
  },
  {
    id: "gl-m03-inercia-sincrona",
    term: "Inércia síncrona",
    unit: "Estabilidade",
    definition:
      "Energia cinética das massas girantes acopladas à rede (hidro, térmicas, nuclear), que amortece variações de frequência nos primeiros segundos de um desbalanço. Eólica e solar conectam por inversores e não a fornecem nativamente — o desafio de estabilidade do Módulo 02 que o portfólio precisa repor.",
    aulaIds: [],
  },
  {
    id: "gl-m03-inflexibilidade",
    term: "Inflexibilidade",
    unit: "Despacho",
    definition:
      "Geração mínima obrigatória de uma usina, por restrição técnica ou contratual (take-or-pay de combustível). Térmica inflexível roda mesmo sem mérito econômico, deslocando fonte mais barata — sobrecusto que vira encargo (ESS).",
    aulaIds: ["aula-03-06"],
  },
  {
    id: "gl-m03-itaipu",
    term: "Itaipu",
    unit: "Âncora",
    definition:
      "UHE binacional Brasil–Paraguai no rio Paraná: 14 GW, vinte unidades, historicamente na casa de 8–10% do consumo elétrico brasileiro (número vivo, varia com hidrologia). O símbolo da era dos grandes reservatórios — embora seja, a rigor, usina com regularização limitada que depende da cascata a montante.",
    aulaIds: ["aula-03-02"],
  },
  {
    id: "gl-m03-lei-14-300-2022",
    term: "Lei 14.300/2022",
    unit: "Regulatório",
    definition:
      "O marco legal da micro e minigeração distribuída: consolidou o SCEE, garantiu transição para sistemas existentes e instituiu a cobrança gradual do Fio B dos novos. O divisor de águas do boom de telhado brasileiro.",
    aulaIds: [],
  },
  {
    id: "gl-m03-lei-15-097-2025",
    term: "Lei 15.097/2025",
    unit: "Regulatório",
    definition:
      "O marco legal da geração eólica offshore no Brasil: regime de outorga de áreas marítimas. Sancionada com vetos a dispositivos alheios ao tema (\"jabutis\") cujo destino no Congresso é item vivo de acompanhamento.",
    aulaIds: [],
  },
  {
    id: "gl-m03-lcoe",
    term: "LCOE",
    unit: "Economia",
    definition:
      "Levelized Cost of Energy — custo total da vida útil descontado ÷ energia total descontada, em R$/MWh. Régua útil entre projetos da mesma natureza; perigosa entre famílias diferentes. Quatro limites: ignora atributos, FC térmico circular, cega ao valor temporal, ignora integração.",
    aulaIds: ["aula-03-10"],
  },
  {
    id: "gl-m03-lrcap",
    term: "LRCAP",
    unit: "Leilão",
    definition:
      "Leilão de Reserva de Capacidade — certame que contrata potência (MW) disponível, não energia. A edição 2026 – Armazenamento (Portaria MME 136/2026) é a estreia das baterias: certames em 2 e 4/dez/2026, contratos de 15 anos, suprimento a partir de ago/2028 (vivo — verificar).",
    aulaIds: [],
  },
  {
    id: "gl-m03-mlt",
    term: "MLT",
    unit: "Hidro",
    definition:
      "Média de Longo Termo — a média histórica de afluências usada como referência. \"ENA a 75% da MLT\" = chove(u) três quartos do normal; é a linguagem padrão dos boletins hidrológicos.",
    aulaIds: [],
  },
  {
    id: "gl-m03-mmgd",
    term: "MMGD",
    unit: "Solar",
    definition:
      "Micro (até 75 kW) e Minigeração Distribuída (acima disso, até os limites legais por modalidade): geração junto à carga, compensada via SCEE. A \"usina invisível\" — dezenas de GW que aparecem ao operador como redução de carga, competindo contra a tarifa cheia de varejo.",
    aulaIds: ["aula-03-05"],
  },
  {
    id: "gl-m03-micrositing",
    term: "Micrositing",
    unit: "Eólica",
    definition:
      "Posicionamento fino de cada aerogerador dentro do parque. Como a potência cresce com o cubo da velocidade, diferenças locais pequenas de vento viram diferenças grandes de energia — engenharia de detalhe que vale fortunas.",
    aulaIds: [],
  },
  {
    id: "gl-m03-must-run",
    term: "Must-run",
    unit: "Despacho",
    definition:
      "Geração que entra na base da pilha independentemente de preço: renováveis variáveis (custo variável ~zero), inflexibilidades técnicas e contratuais. O bloco que o despacho \"recebe pronto\" antes de otimizar o resto.",
    aulaIds: [],
  },
  {
    id: "gl-m03-nacele",
    term: "Nacele",
    unit: "Eólica",
    definition:
      "A \"casa de máquinas\" no topo da torre eólica: eixo, multiplicadora (quando há), gerador e sistemas de controle e giro (yaw). Pesa dezenas de toneladas a mais de 100 m de altura — parte do porquê de logística ser gargalo da fonte.",
    aulaIds: [],
  },
  {
    id: "gl-m03-o-m",
    term: "O&M",
    unit: "Economia",
    definition:
      "Operação e Manutenção — custos recorrentes do ativo, divididos em fixos (R$/kW·ano, existem mesmo parado) e variáveis (R$/MWh, proporcionais à geração). Segundo termo do numerador do LCOE.",
    aulaIds: [],
  },
  {
    id: "gl-m03-ordem-de-merito",
    term: "Ordem de mérito",
    unit: "Despacho",
    definition:
      "A fila de despacho por custo variável crescente: must-run e CVU ~zero na base, valor da água posicionando a hidro, térmicas por CVU no topo. A fonte marginal — a última a entrar — define o custo marginal do sistema. Fundamento do Módulo 02, esqueleto do INST·06.",
    aulaIds: [],
  },
  {
    id: "gl-m03-pch",
    term: "PCH",
    unit: "Hidro",
    definition:
      "Pequena Central Hidrelétrica — aproveitamento de até 30 MW com características definidas em regulação, historicamente beneficiado como fonte incentivada. Junto das CGHs, soma alguns GW distribuídos pelo interior.",
    aulaIds: [],
  },
  {
    id: "gl-m03-piso-do-pld",
    term: "Piso do PLD",
    unit: "Preço",
    definition:
      "Valor mínimo regulatório do preço de curto prazo, recalculado anualmente pela ANEEL (na casa de R$ 60/MWh — vivo). É onde o preço \"encosta\" nas horas de sobra estrutural — o sintoma do meio-dia solar.",
    aulaIds: [],
  },
  {
    id: "gl-m03-repotenciacao",
    term: "Repotenciação",
    unit: "Ativo",
    definition:
      "Substituir máquinas antigas por tecnologia atual no mesmo sítio — turbinas eólicas maiores no mesmo parque, rotores e geradores novos em hidrelétricas. Compra energia adicional sem novo sítio: o \"retrofit\" do setor de geração.",
    aulaIds: [],
  },
  {
    id: "gl-m03-reversivel-uhr",
    term: "Reversível (UHR)",
    unit: "Armazenamento",
    definition:
      "Usina Hidrelétrica Reversível: bombeia água morro acima nas horas baratas e turbina nas caras — armazenamento por gravidade, padrão mundial para deslocamento longo. Sem projeto de grande porte operando no Brasil; em estudo no planejamento (vivo).",
    aulaIds: [],
  },
  {
    id: "gl-m03-scee",
    term: "SCEE",
    unit: "Solar",
    definition:
      "Sistema de Compensação de Energia Elétrica — o \"saldo\" da MMGD: energia injetada vira crédito que abate consumo, nas regras e prazos da Lei 14.300. A leitura correta de créditos na fatura é item de auditoria do CLE.",
    aulaIds: [],
  },
  {
    id: "gl-m03-sistemas-isolados",
    term: "Sistemas isolados",
    unit: "Operação",
    definition:
      "Localidades fora do SIN — concentradas na Amazônia — supridas localmente, em geral a diesel/óleo, com sobrecusto socializado pela CCC. A fronteira mais óbvia para solar + bateria substituir combustível caro.",
    aulaIds: [],
  },
  {
    id: "gl-m03-smr",
    term: "SMR",
    unit: "Nuclear",
    definition:
      "Small Modular Reactor — reatores nucleares pequenos e modulares, fabricados em série, prometendo atacar exatamente o problema de prazo e capital da nuclear tradicional. Em demonstração no mundo; horizonte distante no Brasil.",
    aulaIds: [],
  },
  {
    id: "gl-m03-take-or-pay",
    term: "Take-or-pay",
    unit: "Contrato",
    definition:
      "Cláusula de suprimento de combustível em que se paga um volume mínimo, consumido ou não. Transforma custo variável em afundado e gera térmica contratualmente inflexível — a \"atleta de pernas amarradas\" que distorce a ordem de mérito.",
    aulaIds: [],
  },
  {
    id: "gl-m03-tracker",
    term: "Tracker",
    unit: "Solar",
    definition:
      "Rastreador de eixo que gira os módulos seguindo o sol. Eleva o FC da UFV para 25–30% e alarga o \"ombro\" da geração diária — CAPEX adicional que quase sempre se paga em sítios de boa irradiação.",
    aulaIds: [],
  },
  {
    id: "gl-m03-transicao-justa",
    term: "Transição justa",
    unit: "Política",
    definition:
      "O conjunto de políticas para regiões e trabalhadores dependentes de cadeias fósseis em desativação — no Brasil, o carvão de SC/RS. Lembrete de que tecnologia de geração também é geografia social e política regional.",
    aulaIds: [],
  },
  {
    id: "gl-m03-tucurui",
    term: "Tucuruí",
    unit: "Âncora",
    definition:
      "UHE no rio Tocantins (PA), ~8,5 GW — a maior usina 100% brasileira. Parte da geração de gigantes com reservatório construída sob lógica de Estado entre os anos 1960 e 1990.",
    aulaIds: ["aula-03-02"],
  },
  {
    id: "gl-m03-ufv",
    term: "UFV",
    unit: "Solar",
    definition:
      "Usina Fotovoltaica centralizada — dezenas a centenas de MW vendendo no atacado (leilão ou mercado livre), concentrada onde irradiação é alta e terra é barata. Mesma física da MMGD, régua econômica oposta.",
    aulaIds: ["aula-03-05"],
  },
  {
    id: "gl-m03-uhe",
    term: "UHE",
    unit: "Hidro",
    definition:
      "Usina Hidrelétrica de grande porte (acima dos limites de PCH). O bloco dominante da matriz: ~103 GW somando as centralizadas (SIGA — vivo), entre reservatórios históricos e fio d'água recentes.",
    aulaIds: [],
  },
  {
    id: "gl-m03-valor-da-agua",
    term: "Valor da água",
    unit: "Despacho",
    definition:
      "Custo de oportunidade de turbinar hoje versus guardar para a estiagem, calculado pelos modelos oficiais — o \"CVU implícito\" que posiciona a hidro com reservatório na ordem de mérito. Visto pelo lado do ativo: é o estoque que dá à usina o direito de escolher quando gerar.",
    aulaIds: ["aula-03-02"],
  },
  {
    id: "gl-m03-vertimento",
    term: "Vertimento",
    unit: "Hidro",
    definition:
      "Água liberada pelo vertedouro sem passar pelas turbinas — energia potencial descartada, por reservatório cheio ou restrição operativa. O análogo hidráulico do curtailment.",
    aulaIds: [],
  },
  {
    id: "gl-m03-wacc",
    term: "WACC",
    unit: "Finanças",
    definition:
      "Weighted Average Cost of Capital — o custo médio ponderado do capital que desconta os fluxos do projeto. Em ativos de CAPEX dominante, é a variável mais pesada do LCOE: cada ponto de WACC vale mais que qualquer otimização de engenharia — a matemática que condenou Angra 3.",
    aulaIds: [],
  },
];

/** Verbetes em que a aula aparece — para a página da aula referenciar. */
export const getTermosByAula = (aulaId: string): GlossaryTerm[] =>
  ALEXANDRIA_GLOSSARIO.filter((t) => t.aulaIds.includes(aulaId));

export const getTermoById = (id: string): GlossaryTerm | undefined =>
  ALEXANDRIA_GLOSSARIO.find((t) => t.id === id);

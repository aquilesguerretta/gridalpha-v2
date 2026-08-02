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
];

/** Verbetes em que a aula aparece — para a página da aula referenciar. */
export const getTermosByAula = (aulaId: string): GlossaryTerm[] =>
  ALEXANDRIA_GLOSSARIO.filter((t) => t.aulaIds.includes(aulaId));

export const getTermoById = (id: string): GlossaryTerm | undefined =>
  ALEXANDRIA_GLOSSARIO.find((t) => t.id === id);

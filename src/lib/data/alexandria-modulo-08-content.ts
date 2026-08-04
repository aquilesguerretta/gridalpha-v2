// alexandria-modulo-08-content.ts
// Bloco 8 — Matriz Elétrica. Nível 2, track 'brasil'. Terceiro módulo
// da Trilha 2.
//
// CATÁLOGO CONFIRMADO na FOUNDRY, não presumido:
// { id: 'bloco-08', level: 2, track: 'brasil', illustrationPrefix: 'mat-' }.
//
// EXTRAÍDO de `Alexandria modulos/alexandria_modulo08.html` — 326.382
// bytes (219.053 de markup + 98.898 de <script>).
//
// TESE DA FONTE: "Não existe a matriz elétrica brasileira" — fontes
// diferentes medem universo, período e grandeza diferentes.
//
// ── VOCABULÁRIO MEDIDO ────────────────────────────────────────
// Seletores dos Módulos 01-03: ZERO. É o vocabulário dos Módulos 04-07.
//
// ── CONTAGEM REAL ─────────────────────────────────────────────
// 17 seções = 7 aulas + 10 de aparato. 146 blocos de apostila.
// §Ex "Doze exercícios" = 12 <details>; §Lex "124 termos" = 124 .term.
//
// ── `src-card`: ESTRUTURA QUE OS MÓDULOS ANTERIORES NÃO TÊM ───
// A Aula 02 organiza as seis fontes em fichas (`src-card`): cabeçalho
// + 7 linhas chave/valor cada. A Aula 06 tem mais duas. São 8 fichas e
// 52 pares no total, e o mapeamento herdado das waves anteriores os
// descartava em SILÊNCIO — a Aula 02 fechava com 4 blocos contra 17-30
// das outras, e foi essa anomalia que denunciou a perda. Cada ficha
// virou um `titulo` (nome + tag da fonte) mais uma `tabela` de duas
// colunas. Com a correção, 130 → 146 blocos.
//
// ── INSTRUMENTOS: SÓ O INST · 04 PORTADO (LYCEUM Wave 34) ─────
// A fonte tem ONZE `<div class="inst">` — um no § MAP (fora de aula) e
// dez de aula, com as Aulas 01, 02 e 03 tendo dois cada. TODOS geram
// campos e dados por script (o markup traz só containers vazios), e
// cada um carrega objeto de estado e lógica próprios (`I1`..`I11`), de
// 4.8k a 21.5k chars.
//
// O `Inst · 04` ("Reconstrutor de matriz · desenhe as duas pizzas de
// memória") era MECÂNICA NOVA no sistema — a própria fonte declara: "é
// o único do sistema Alexandria que exige que você PRODUZA a resposta
// antes de ver a correção". A Wave 34 construiu o modo de correção sob
// demanda no `InstrumentPanel` (campo `correcaoSobDemanda` no contrato)
// e portou ESTE instrumento, autorizado pelo Aquiles como exceção
// pontual à posse da wave. O toggle de rodada da fonte virou DOIS
// instrumentos empilhados (Rodada 1 · Capacidade, Rodada 2 · Geração) —
// "primeiro em capacidade, depois em geração" expresso em layout; cada
// um com seu "Corrigir esta rodada", referência e calculadora próprias.
// O painel de referência EDITÁVEL da fonte (details "abra só depois de
// tentar") não foi portado: aqui a referência vive em código e
// atualizar é editar `M08_INST04_REF`; a proveniência foi preservada
// no note visível.
//
// Os OUTROS DEZ instrumentos seguem não portados (`instruments: []`
// nas demais aulas) — pendência registrada, escopo travado pelo
// próprio Aquiles nesta wave.
//
// ── GRAVURA: 2 de 8, e o prefixo do catálogo só casa em parte ──
// A biblioteca `mat-` é de CARGA INDUSTRIAL (correia de mineração,
// forno de arco, cuba eletrolítica, pivô de irrigação, saneamento),
// enquanto o Bloco 8 trata de matriz de geração, sazonalidade e
// transmissão. Só duas têm seção dedicada na fonte:
//   A5 mat-08-gerador-diesel-isolado — "Sistemas isolados atendem
//      localidades não conectadas ao sistema interligado, sobretudo na
//      Amazônia… o diesel dominava a geração isolada em 2025".
//   A6 mat-03-racks-data-center — "A carga que ainda não existe. Data
//      centers entraram na conversa de planejamento brasileira em 2025…
//      da ordem de 800 megawatts".
// As outras seis não foram forçadas. Entre os falsos positivos
// descartados por leitura de frase, um novo para a série: /cimento/
// casa com "cres·cimento".
//
// ── video: null, MEDIDO ───────────────────────────────────────
// Zero <video>, <iframe>, youtube, vimeo e .mp4 no arquivo inteiro.

import type { CurriculumAula, Instrument, LessonActivity } from '@/lib/types/alexandria';
import type { AulaBloco } from './alexandria-modulo-01-content';

// ── INST · 04 — referência e tolerância, literais do <script> (I4.ref /
// I4.tol). Exportadas porque a calculadora importa DAQUI (mesma direção
// que MODULO_06_TRAUMA_CICATRIZ) — uma fonte de verdade só, sem cópia
// que possa divergir. Chaves já no id de campo do painel.
// Proveniência (da própria fonte): balanço energético nacional, relatório
// síntese, ano-base 2025, publicado em junho de 2026; consulta 1º de
// agosto de 2026.
export const M08_INST04_REF: Record<'cap' | 'ger', Record<string, number>> = {
  cap: { 'i4-hid': 42.2, 'i4-sol': 24.8, 'i4-eol': 13.3, 'i4-bio': 6.7, 'i4-fos': 12.2, 'i4-nuc': 0.8 },
  ger: { 'i4-hid': 51.7, 'i4-sol': 11.4, 'i4-eol': 15.0, 'i4-bio': 8.1, 'i4-fos': 11.8, 'i4-nuc': 2.0 },
};
export const M08_INST04_TOL = 3;

/** As seis fontes na ordem declarada da fonte (`I4.fontes`) — a ordem
 *  importa: a checagem de "ordem das fontes" itera nesta sequência. */
export const M08_INST04_FONTES: { id: string; nome: string }[] = [
  { id: 'i4-hid', nome: 'Hidrelétrica' },
  { id: 'i4-sol', nome: 'Solar' },
  { id: 'i4-eol', nome: 'Eólica' },
  { id: 'i4-bio', nome: 'Biomassa' },
  { id: 'i4-fos', nome: 'Térmica fóssil' },
  { id: 'i4-nuc', nome: 'Nuclear' },
];

const i4Campos = () =>
  M08_INST04_FONTES.map((f) => ({
    id: f.id,
    label: f.nome,
    unit: '% da pizza',
    kind: 'number' as const,
    defaultValue: '' as const, // nasce vazio na fonte (placeholder "—")
    min: 0,
    max: 100,
    step: 0.1,
  }));

const i4Saidas = [
  { id: 'i4-acertos', label: 'Fontes dentro da tolerância', unit: 'de 6' },
  { id: 'i4-err', label: 'Erro absoluto total', unit: 'pp' },
  { id: 'i4-soma', label: 'Sua soma', unit: '%' },
];

// Textos literais da fonte. O intro vai na rodada 1; o disclaimer e a
// proveniência fecham a rodada 2 — o conjunto aparece exatamente uma vez
// no par, em ordem de leitura. A quarta leitura do original ("Ordem das
// fontes · Correta/Incorreta") é TEXTO e não cabe em `valores` — o
// veredito a carrega, mesma limitação registrada nas Waves 19/24/25/29.
const I4_INTRO =
  'Este é o instrumento que atende diretamente o critério de domínio, e é o único do sistema Alexandria que exige que você <b>produza</b> a resposta antes de ver a correção. Sem consultar as fichas acima: estime a fatia de cada fonte, primeiro em capacidade, depois em geração. O instrumento devolve o erro por fonte, o erro total e o diagnóstico do seu viés.';
const I4_RODADA_CAP =
  '<b>Rodada de capacidade instalada.</b> Estime a fatia de cada fonte na potência nominal instalada, no conceito amplo — incluindo geração distribuída e autoprodução. Pense em tamanho de parque, não em energia produzida.';
const I4_RODADA_GER =
  '<b>Rodada de geração efetiva.</b> Agora estime a fatia de cada fonte na energia efetivamente produzida ao longo de um ano. Se você repetir os mesmos números da rodada anterior, vai errar sistematicamente — e o padrão do erro é exatamente o que o instrumento existe para revelar.';
const I4_DISC =
  'Didático/ilustrativo. A tolerância de acerto é de 3 pontos percentuais por fonte, escolhida porque abaixo disso o exercício vira decoreba de decimal, que é exatamente o que este módulo não quer treinar. O que conta é a ordem e a ordem de grandeza.';
const I4_PROV =
  '<b>Fonte da referência:</b> balanço energético nacional, relatório síntese, ano-base 2025, publicado em junho de 2026, complementado pelo anuário estatístico de energia elétrica do mesmo ciclo. <b>Consulta:</b> 1º de agosto de 2026.';

const M08_INST_04: Instrument[] = [
  {
    id: 'm08-inst-04-cap',
    kind: 'reconstrutor',
    title: 'Reconstrutor de matriz · desenhe as duas pizzas de memória — 1 · Capacidade instalada',
    formula: null,
    fields: i4Campos(),
    outputs: i4Saidas,
    note: `${I4_INTRO}<br><br>${I4_RODADA_CAP}`,
    correcaoSobDemanda: {
      botaoRotulo: 'Corrigir esta rodada',
      referencia: M08_INST04_REF.cap,
      tolerancia: M08_INST04_TOL,
      normalizar: { rotulo: 'Normalizar para 100%', alvo: 100 },
      zerarRotulo: 'Zerar',
    },
  },
  {
    id: 'm08-inst-04-ger',
    kind: 'reconstrutor',
    title: 'Reconstrutor de matriz · desenhe as duas pizzas de memória — 2 · Geração efetiva',
    formula: null,
    fields: i4Campos(),
    outputs: i4Saidas,
    note: `${I4_RODADA_GER}<br><br>${I4_DISC}<br><br>${I4_PROV}`,
    correcaoSobDemanda: {
      botaoRotulo: 'Corrigir esta rodada',
      referencia: M08_INST04_REF.ger,
      tolerancia: M08_INST04_TOL,
      normalizar: { rotulo: 'Normalizar para 100%', alvo: 100 },
      zerarRotulo: 'Zerar',
    },
  },
];

// ── INST · 02 — Conversor de três eixos (LYCEUM Wave 38) ──────
// Os doze campos da fonte são seis pares (capacidade GW + fator de
// capacidade %) num `field-grid` de dois inputs por linha. O painel tem
// um input por campo, então o par vira dois campos nomeados.
//
// As duas pizzas SVG e as duas legendas não têm slot no painel. O que
// elas mostram de NUMÉRICO — a fatia de cada fonte em cada pizza — sai
// como saída em vez de ser descartado; é o mesmo julgamento que a Wave
// 37 aplicou aos `src-card` quando descobriu a perda silenciosa. O que
// se perde é só o desenho, não o dado.
/** As seis fontes do INST 02 com a fotografia de 2025 declarada na fonte
 *  (`I2.src`) — capacidade em GW e fator de capacidade em %. Exportada
 *  porque a calculadora importa DAQUI, mesma direção de `M08_INST04_REF`:
 *  uma fonte de verdade só, sem cópia que possa divergir.
 *  A cor por fonte do original é da pizza SVG e não tem consumidor aqui. */
export const M08_INST02_SRC: { k: string; nome: string; cap: number; fc: number }[] = [
  { k: 'hid', nome: 'Hidrelétrica', cap: 110.2, fc: 41.6 },
  { k: 'sol', nome: 'Solar', cap: 64.8, fc: 15.5 },
  { k: 'eol', nome: 'Eólica', cap: 34.7, fc: 38.3 },
  { k: 'bio', nome: 'Biomassa', cap: 17.5, fc: 41.1 },
  { k: 'fos', nome: 'Térmica fóssil', cap: 31.8, fc: 27.5 },
  { k: 'nuc', nome: 'Nuclear', cap: 2.0, fc: 90.4 },
];

const I2_INTRO =
  'Digite a capacidade instalada e o fator de capacidade de cada fonte. O instrumento devolve as duas pizzas e marca em dourado toda fonte que <b>trocou de posição</b> entre elas. Os valores iniciais são a fotografia de 2025 declarada abaixo; substitua qualquer um deles e a lição continua funcionando — é essa a razão de o instrumento existir.';
const I2_SRCNOTE =
  '<b>Referência inicial:</b> capacidade e geração por fonte no conceito amplo do balanço energético, ano-base 2025, publicado em junho de 2026; fatores de capacidade derivados da razão entre as duas séries. Consulta em 1º de agosto de 2026.';
const I2_DISC =
  'Didático/ilustrativo. O cálculo usa capacidade média do período implícita nos valores digitados; não modela entrada de usinas ao longo do ano, indisponibilidade nem corte de geração. Serve para ensinar a relação entre as grandezas, não para dimensionar projeto.';

const M08_INST_02: Instrument[] = [
  {
    id: 'm08-inst-02',
    kind: 'comparador',
    title: 'Conversor de três eixos · as duas pizzas lado a lado',
    formula: 'TWh/ano = GW × (FC ÷ 100) × 8,76',
    fields: M08_INST02_SRC.flatMap((s) => [
      {
        id: `i2c-${s.k}`,
        label: `${s.nome} · capacidade`,
        unit: 'GW',
        kind: 'number' as const,
        defaultValue: s.cap,
        min: 0,
        max: 400,
        step: 0.1,
      },
      {
        id: `i2f-${s.k}`,
        label: `${s.nome} · fator de capacidade`,
        unit: '%',
        kind: 'number' as const,
        defaultValue: s.fc,
        min: 0,
        max: 100,
        step: 0.1,
      },
    ]),
    outputs: [
      { id: 'i2-cap-tot', label: 'Capacidade total', unit: 'GW' },
      { id: 'i2-ger-tot', label: 'Geração implícita', unit: 'TWh/ano' },
      { id: 'i2-fc-med', label: 'Fator de capacidade médio', unit: '%' },
      { id: 'i2-trocas', label: 'Fontes que trocam de posição', unit: null },
      ...M08_INST02_SRC.map((s) => ({
        id: `i2-a-${s.k}`,
        label: `Pizza 1 · capacidade · ${s.nome}`,
        unit: '%',
      })),
      ...M08_INST02_SRC.map((s) => ({
        id: `i2-b-${s.k}`,
        label: `Pizza 2 · geração · ${s.nome}`,
        unit: '%',
      })),
    ],
    note: `${I2_INTRO}<br><br>${I2_SRCNOTE}<br><br>${I2_DISC}`,
  },
];

export const MODULO_08_LEAD: Record<string, string> = {
  'aula-08-01': "Esta aula não tem um único número decorável, e isso é intencional. Ela ensina as três perguntas que você faz antes de aceitar qualquer estatística de matriz — e quem as faz automaticamente nunca mais cita o número errado na conversa errada.",
  'aula-08-02': "Esta aula não reensina como uma turbina funciona — isso é o Módulo 03. Ela responde a três perguntas diferentes: quanto de cada fonte existe, onde ela está, e por que a soma tem a forma que tem .",
  'aula-08-03': "A pizza anual é uma média, e média esconde o que importa. O sistema elétrico não opera na média: ele opera em cada meia hora, e é nessas meia horas que a forma da matriz se revela — inclusive nas horas em que sobra energia que ninguém consegue usar.",
  'aula-08-04': "Reservatório hidrelétrico é estoque de energia medido em meses, às vezes em anos. Nenhuma tecnologia de bateria disponível chega perto dessa duração. É o ativo que dá ao Brasil uma flexibilidade que quase nenhum sistema tem — e é o mesmo ativo que expõe o país a um risco que quase nenhum sistema corre.",
  'aula-08-05': "O melhor vento do Brasil e o maior consumo do Brasil não estão no mesmo lugar, e nunca estarão. Toda a Aula 05 é sobre o que existe entre os dois — e sobre o que acontece quando o que existe não é suficiente.",
  'aula-08-06': "A última milha é monopólio natural por área de concessão, e concessão é contrato com data de vencimento. Entre 2025 e 2031 vence cerca de uma vintena desses contratos, todos sob o mesmo marco de renovação — e o que aconteceu com dois deles ensina mais sobre risco de concessão que qualquer teoria.",
  'aula-08-07': "Fechar este bloco decorando os percentuais de 2025 seria o pior resultado possível. O que fica é outra coisa: saber quais forças estão em movimento, em que direção, e em qual série pública cada uma deixa rastro.",
};

/** 146 blocos nas sete aulas, na ordem do documento. */
export const MODULO_08_CORPO: Record<string, AulaBloco[]> = {
  'aula-08-01': [
    { kind: 'titulo', numero: "1.1", texto: "Eixo 1 — potência mede tamanho, energia mede utilização" },
    { kind: 'paragrafo', html: "Capacidade instalada é a potência nominal do conjunto de equipamentos aptos a gerar, medida em megawatts ou gigawatts. É um <strong>estoque</strong>, fotografado numa data. Responde à pergunta \"quanto o parque poderia entregar sob condições de projeto\", e não à pergunta \"quanto ele entregou\"." },
    { kind: 'paragrafo', html: "Geração efetiva é energia acumulada num período, medida em megawatt-hora, gigawatt-hora ou terawatt-hora. É um <strong>fluxo</strong>. Um gerador de cem megawatts operando a plena potência durante uma hora produz cem megawatt-hora. O mesmo gerador operando em média a quarenta megawatts ao longo de um ano produz aproximadamente trezentos e cinquenta gigawatt-hora." },
    { kind: 'paragrafo', html: "A razão entre a energia que a usina efetivamente produziu e a energia que ela produziria se operasse à potência nominal durante todo o período é o <strong>fator de capacidade</strong>. Ele é a ponte entre as duas grandezas, e é a única coisa desta aula que você precisa saber calcular de cabeça." },
    { kind: 'paragrafo', html: "Daí decorre a consequência que organiza o bloco inteiro: fontes com fator de capacidade alto ocupam fatia maior na pizza de geração do que na pizza de capacidade, e fontes com fator baixo, o contrário</b>. A hidro sobe quando você troca de pizza. A solar despenca. A eólica sobe um pouco. A térmica se move conforme a hidrologia e o custo do combustível daquele ano, e por isso é a única cuja direção não é previsível sem olhar o contexto." },
    { kind: 'paragrafo', html: "A conclusão que <em>não</em> se tira daí é que a solar seja ineficiente. A tecnologia converte um recurso que só existe de dia, e a potência nominal de um módulo é medida no pico. Chamar isso de ineficiência é usar a métrica errada para a pergunta. Painel solar tem fator de capacidade baixo pelo mesmo motivo que um guarda-chuva tem fator de utilização baixo: o insumo não está disponível o tempo todo, e ninguém acha que isso desqualifica o guarda-chuva." },
    { kind: 'nota', tom: "neutro", label: "Capacidade não é geração · três níveis", html: "<b>Criança de 12 anos.</b> Capacidade é o tamanho do motor. Geração é quanto ele realmente trabalhou durante o ano. Duas pessoas podem ter carros do mesmo tamanho e uma rodar dez vezes mais que a outra — não porque o carro é melhor, mas porque uma mora longe do trabalho e a outra mora perto. Quando alguém te disser que uma fonte de energia é grande, pergunte se ela está falando do tamanho do motor ou da quilometragem.<br/><b>Executivo.</b> Gigawatt mede o parque disponível; terawatt-hora mede a produção do período. A utilização entre um e outro depende de quatro coisas: o recurso natural, a disponibilidade técnica do equipamento, a decisão de despacho e a restrição de rede. Duas consequências comerciais imediatas: um projeto não se avalia por potência, se avalia por energia entregue no ponto relevante e pelo perfil horário dessa entrega; e o anúncio de \"tantos gigawatts contratados\" não informa quanta energia entra no sistema sem que se saiba o fator de capacidade esperado e a data real de entrada em operação.<br/><b>Especialista.</b> A compatibilização correta exige tratar a capacidade como série, não como ponto: potência efetivamente disponível mês a mês, ponderada pelas datas de entrada em operação comercial, líquida de indisponibilidade programada e forçada. O fator resultante ainda mistura causas heterogêneas — recurso primário, disponibilidade, inflexibilidade contratual, ordem de mérito e corte por restrição — e por isso não é diagnóstico, é sintoma. Para análise de projeto separam-se o fator de capacidade potencial, calculado sobre a geração verificada somada à frustrada, e o realizado, e a diferença entre os dois é a medida direta da exposição a restrição de rede. Adicionalmente, o ponto de medição importa: geração bruta, líquida de serviços auxiliares, ou injetada na barra produzem denominadores diferentes." },
    { kind: 'titulo', numero: "1.2", texto: "Eixo 2 — elétrica e energética diferem em quarenta pontos" },
    { kind: 'paragrafo', html: "A matriz <strong>energética</strong> contabiliza toda a energia usada na economia: petróleo e derivados, gás natural, biomassa, eletricidade, carvão, etanol e o resto. Inclui o combustível que move caminhão, o calor de forno industrial e o gás de cozinha. A matriz <strong>elétrica</strong> trata apenas da eletricidade gerada, importada, distribuída e consumida." },
    { kind: 'paragrafo', html: "Em 2025, a renovabilidade da matriz elétrica ficou em 86,8%, enquanto a da matriz energética se manteve próxima de cinquenta por cento. A diferença existe porque transporte e calor industrial ainda dependem fortemente de combustíveis líquidos e gasosos, enquanto a eletricidade brasileira parte de uma base hidrelétrica que nenhum outro país de porte comparável tem." },
    { kind: 'tabela', linhas: [["Pergunta","Matriz energética","Matriz elétrica"],["O que mede","Toda a energia disponibilizada e consumida no país","Somente eletricidade gerada, importada e consumida"],["Unidades típicas","tep, milhões de tep, joules","MW, GW, MWh, GWh, TWh, MW médios"],["Renovabilidade em 2025","Próxima de 50% da oferta interna de energia","86,8% da oferta interna de energia elétrica"],["Erro clássico","Usar a renovabilidade elétrica para dizer que a economia inteira já é quase noventa por cento renovável","Usar consumo de combustível de transporte para descrever a geração elétrica"]] },
    { kind: 'paragrafo', html: "Este é o erro mais audível da matéria porque ele muda a conclusão política. Quem diz que o Brasil \"já é oitenta e sete por cento renovável\" está dizendo algo verdadeiro sobre a tomada e falso sobre o país. Metade da energia que a economia brasileira consome ainda é fóssil, e ela está no tanque, não no fio. É por isso que eletrificação de processo industrial e de transporte é a alavanca de descarbonização que sobra — não porque a eletricidade brasileira precise melhorar, mas porque ela já é limpa e o resto não é." },
    { kind: 'nota', tom: "neutro", label: "Números vivos · verificar na fonte antes de uso externo", html: "A renovabilidade elétrica de 86,8% refere-se a 2025 e caiu 1,4 ponto percentual em relação a 2024, quando foi de 88,2% — a queda acompanha a menor geração hidráulica do ano e o maior despacho térmico. É série anual: reabra o balanço energético antes de citar. Verificado em 1º de agosto de 2026." },
    { kind: 'titulo', numero: "1.3", texto: "Eixo 3 — o recorte, que é invisível e decide tudo" },
    { kind: 'paragrafo', html: "O terceiro eixo não aparece no gráfico e é o que mais produz discussão inútil. Ele responde a três perguntas: <em>qual universo</em>, <em>qual data-base</em> e <em>qual método</em>." },
    { kind: 'tabela', linhas: [["Universo","O que inclui","Para que serve"],["Conceito amplo do balanço","Geração centralizada, autoprodução e micro e minigeração distribuída","Contabilidade energética nacional e comparação entre fontes"],["Sistema interligado supervisionado","Usinas conectadas e representadas na operação do operador nacional; a geração distribuída entra por estimativa, não por comando","Planejamento e operação física do sistema"],["Geração centralizada regulatória","Empreendimentos outorgados e cadastrados na agência, sem geração distribuída","Acompanhamento de outorgas, obras e fiscalização"],["Base do plano decenal","Referência de partida do exercício de planejamento, com metodologia própria","Projeção de expansão e comparação entre cenários"]] },
    { kind: 'paragrafo', html: "Quatro universos, quatro totais nacionais, todos corretos. Repare que a diferença entre o maior e o menor não é ruído: é a geração distribuída inteira, mais a autoprodução, mais a defasagem entre outorga e operação. São dezenas de gigawatts de diferença conceitual, e nenhuma das bases está escondendo nada — todas declaram o universo, e é por isso que o hábito de ler a nota de rodapé antes de reproduzir o total é a diferença entre analista e repetidor." },
    { kind: 'paragrafo', html: "Ao recorte de universo somam-se o recorte temporal — ano civil ou ano móvel de doze meses, dado preliminar ou verificado — e o recorte de método: capacidade fiscalizada ou outorgada, geração bruta ou líquida de serviços auxiliares, medida na barra da usina ou no centro de gravidade do submercado, com ou sem a parcela de energia importada de usina binacional." },
    { kind: 'nota', tom: "gold", label: "A pergunta que resolve noventa por cento das divergências", html: "Quando duas fontes dão percentuais diferentes para a mesma fonte no mesmo ano, a primeira hipótese <b>não</b> é que uma esteja errada. É que estão usando recortes diferentes. Verifique universo, data-base e método antes de escolher um lado. Só depois de os três coincidirem é que divergência vira erro." },
    { kind: 'nota', tom: "neutro", label: "Onde isso entra no produto", html: "Os três eixos são a especificação de metadado de qualquer painel do <b>Brazil Pulse</b>. Todo número exibido carrega, no rodapé do painel, universo, data-base e método — e a série muda de rótulo quando o usuário troca o recorte, em vez de mudar de valor em silêncio. É uma decisão de produto que custa espaço de tela e compra credibilidade: nenhum concorrente que também vende energia tem incentivo para expor o quanto o próprio número depende da convenção escolhida." },
  ],
  'aula-08-02': [
    { kind: 'paragrafo', html: "As seis fichas abaixo têm campos idênticos e na mesma ordem. Isso não é formatação: é o que permite leitura lateral, que é metade do valor desta aula. Ler as seis fichas na vertical ensina cada fonte. Ler o mesmo campo nas seis fichas ensina o sistema." },
    { kind: 'titulo', numero: null, texto: "Hidrelétrica · Renovável · despachável · estocável" },
    { kind: 'tabela', linhas: [["Participação em capacidade","A maior fatia isolada, mas abaixo da metade — cerca de 42% no conceito amplo em 2025, contra mais de metade uma década antes. A queda é diluição, não desmobilização: a capacidade hidrelétrica cresceu pouco enquanto a de outras fontes explodiu."],["Participação em geração","Cerca de 52% em 2025, após queda de 4,8% no ano. Sobe dez pontos ao trocar de pizza — o maior salto de todas as fontes."],["Fator de capacidade típico","Faixa de 45% a 60%, com forte variação interanual. Não é limitação técnica: é decisão de despacho somada à hidrologia do ano."],["Concentração geográfica","Bacia do Paraná no Sudeste/Centro-Oeste concentra o armazenamento; grandes usinas a fio d'água no Norte, nos rios Madeira e Xingu; São Francisco no Nordeste; Iguaçu e Uruguai no Sul."],["Perfil sazonal","Segue o regime de chuvas de cada bacia. Período úmido do Sudeste/Centro-Oeste vai de novembro a abril; o seco, de maio a outubro. A diversidade entre bacias é o que a integração nacional existe para aproveitar."],["Perfil intradiário","Modulável dentro do dia quando há reservatório — é a fonte que cobre a rampa do fim de tarde. Usinas a fio d'água têm modulação limitada, e todas têm piso: vazão mínima, estabilidade e operação das máquinas impedem redução indefinida."],["O que a faz crescer ou parar","Cresce por repotenciação e modernização, muito pouco por usina nova — licenciamento, impacto socioambiental e escassez de sítios com regularização travam a expansão clássica. Para por hidrologia adversa e por restrição de uso múltiplo da água."]] },
    { kind: 'titulo', numero: null, texto: "Eólica · Renovável · variável · não estocável" },
    { kind: 'tabela', linhas: [["Participação em capacidade","Cerca de 13% em 2025, com 34,7 GW instalados após expansão de 17,5% no ano."],["Participação em geração","Cerca de 15%, com 116,5 TWh em 2025 e crescimento de 8,2%. Sobe ligeiramente ao trocar de pizza — o recurso brasileiro é excepcional em comparação internacional."],["Fator de capacidade típico","Faixa de 35% a 50% nos bons sítios do Nordeste; menor no Sul e em sítios de interior. A energia disponível no vento cresce aproximadamente com o cubo da velocidade, então diferenças pequenas de vento médio produzem diferenças grandes de produção — um fator \"do Nordeste\" não se aplica a qualquer município."],["Concentração geográfica","Fortemente concentrada no Nordeste, com o litoral do Rio Grande do Norte e do Ceará e o interior da Bahia e do Piauí como polos. Sul tem parque relevante e regime diferente."],["Perfil sazonal","No Nordeste, os ventos se fortalecem no segundo semestre — a chamada safra dos ventos, com pico entre julho e setembro. Coincide com o período seco do Sudeste/Centro-Oeste, e essa coincidência é o fato mais elegante da matriz brasileira."],["Perfil intradiário","Tende a ser mais forte à noite e de madrugada em boa parte do Nordeste — comportamento oposto ao da solar, e por isso complementar dentro do próprio dia. Não é regra universal: varia por sítio e por estação."],["O que a faz crescer ou parar","Cresceu por leilão, por contrato de longo prazo e por custo declinante. Passou a parar por outra razão: capacidade de escoamento e de absorção. O limite relevante deixou de ser a turbina e passou a ser a rede e o balanço carga-geração."]] },
    { kind: 'titulo', numero: null, texto: "Solar fotovoltaica · Renovável · variável · maioria fora do comando central" },
    { kind: 'tabela', linhas: [["Participação em capacidade","Cerca de 25% no conceito amplo em 2025 — a segunda maior categoria isolada, com 64,8 GW após expansão de 33,7% no ano. Desse total, mais de dois terços é micro e minigeração distribuída."],["Participação em geração","Cerca de 11%, com 88,1 TWh e crescimento de 24,7%. Despenca catorze pontos ao trocar de pizza — a maior queda de todas as fontes, e a origem do erro de leitura mais comum do setor."],["Fator de capacidade típico","Faixa de 20% a 30%. A potência nominal é medida no pico de irradiância; a produção só existe de dia e cai com nuvem, sujeira e temperatura de módulo."],["Concentração geográfica","Centralizada concentrada no Nordeste e no norte de Minas Gerais. Distribuída espalhada por todo o país, seguindo tarifa, renda e número de unidades consumidoras — é a única fonte cuja geografia acompanha o consumo em vez do recurso."],["Perfil sazonal","Variação anual modesta comparada às demais. É a fonte mais previsível em base sazonal e a menos previsível em base horária."],["Perfil intradiário","Concentrada entre nove e dezesseis horas, com pico ao meio-dia. É essa concentração — e não o volume anual — que reorganiza a operação do sistema, porque toda a produção chega na mesma janela e some antes do pico de consumo."],["O que a faz crescer ou parar","Cresce por custo de módulo, por compensação de energia na distribuição e por prazo curto de implantação. A parcela distribuída não é comandada pelo operador nacional, então ela não \"para\" por decisão sistêmica — quem para é a centralizada, que é a única sob controle."]] },
    { kind: 'titulo', numero: null, texto: "Térmica a biomassa · Renovável · despachável dentro do processo industrial" },
    { kind: 'tabela', linhas: [["Participação em capacidade","Entra agregada ao total térmico nas séries de capacidade, o que é uma armadilha de leitura: a categoria \"térmica\" da pizza de capacidade mistura biomassa com fóssil, enquanto a pizza de geração as separa."],["Participação em geração","Ordem de 8% da matriz elétrica, com recorde sucessivo. Bagaço de cana e licor preto respondem pela quase totalidade — o primeiro no setor sucroenergético, o segundo em papel e celulose."],["Fator de capacidade típico","Faixa de 35% a 55%, limitada pela safra e pelo processo industrial, não pelo equipamento. Boa parte é cogeração: vapor e eletricidade produzidos conjuntamente."],["Concentração geográfica","São Paulo, Goiás, Minas Gerais e Mato Grosso do Sul para cana; Sul, Sudeste e Bahia para celulose."],["Perfil sazonal","Segue a safra da cana, concentrada de abril a novembro no Centro-Sul — ou seja, dentro do período seco. É a segunda complementaridade estrutural da matriz, e é frequentemente esquecida na conversa que só fala de vento."],["Perfil intradiário","Relativamente plano dentro do dia de operação da usina, com alguma modulação possível quando o processo industrial permite."],["O que a faz crescer ou parar","Cresce com investimento em caldeira de alta pressão e com preço de energia que justifique exportar excedente em vez de só atender a planta. Para com entressafra, com preço de açúcar e etanol que redirecione a cana, e com limitação de conexão local."]] },
    { kind: 'titulo', numero: null, texto: "Térmica fóssil — gás, carvão e derivados · Não renovável · despachável · combustível contratado" },
    { kind: 'tabela', linhas: [["Participação em capacidade","Agregada ao total térmico. É a fonte cuja fatia de capacidade menos informa sobre sua importância, porque ela existe justamente para não ser usada o tempo todo."],["Participação em geração","Ordem de 10% somando gás, carvão e derivados de petróleo em 2025, com o gás natural crescendo mais de vinte por cento no ano — o crescimento é o espelho direto da queda hidrelétrica."],["Fator de capacidade típico","Extremamente variável, de menos de 10% a mais de 70%. É a única fonte em que o fator baixo pode ser sinal de sistema saudável, não de ativo ocioso."],["Concentração geográfica","Gás no Sudeste, Nordeste e litoral com acesso a gasoduto ou terminal; carvão no Sul, junto às jazidas; derivados de petróleo em sistemas isolados e em atendimento local de segurança."],["Perfil sazonal","Contracíclico à hidrologia. Sobe no período seco e em ano de afluência fraca. Não tem sazonalidade própria — tem sazonalidade emprestada da água."],["Perfil intradiário","Ciclo combinado é mais eficiente e adequado a operação prolongada; ciclo simples e motores respondem mais rápido e sustentam rampa. Parte da geração é inflexível por contrato ou por requisito técnico, e gera mesmo quando o sistema não precisa."],["O que a faz crescer ou parar","Cresce quando o sistema precisa de potência e flexibilidade que renovável variável não entrega. Para por custo variável, por preço e disponibilidade de combustível e por ordem de mérito. A inflexibilidade contratada é o único caso em que ela não para mesmo devendo parar."]] },
    { kind: 'titulo', numero: null, texto: "Nuclear · Não renovável · baixa emissão · base" },
    { kind: 'tabela', linhas: [["Participação em capacidade","Menos de 1% — cerca de 2 GW em duas unidades."],["Participação em geração","Cerca de 2%, com 15,8 TWh em 2025. Dobra de fatia ao trocar de pizza, pelo fator de capacidade alto."],["Fator de capacidade típico","Faixa de 75% a 90% fora de parada programada. É o maior fator de capacidade do parque brasileiro."],["Concentração geográfica","Um único sítio, no litoral sul do Rio de Janeiro."],["Perfil sazonal","Nenhuma sazonalidade de recurso. A variação anual vem de parada programada para reabastecimento e manutenção."],["Perfil intradiário","Plano. Baixa flexibilidade relativa por projeto e por regime operacional."],["O que a faz crescer ou parar","Participação pequena não significa irrelevância: a saída simultânea das unidades altera reserva e atendimento regional. Cresce ou não cresce por decisão de política, intensidade de capital e prazo, não por mercado de curto prazo."]] },
    { kind: 'nota', tom: "neutro", label: "Números vivos · verificar na fonte antes de uso externo", html: "Todos os percentuais e volumes destas seis fichas referem-se a <b>2025</b>, no conceito amplo do balanço energético publicado em junho de 2026, e foram verificados em 1º de agosto de 2026. As faixas de fator de capacidade são ordens de grandeza para leitura, não parâmetros de projeto. A solar é a que envelhece mais rápido: cresceu um terço em um único ano." },
    { kind: 'paragrafo', html: "Dois vieses aparecem quase sempre na primeira rodada, e vale saber deles antes de tentar. O primeiro é <strong>subestimar a térmica em capacidade</strong>: como ela gera pouco em ano bom, a intuição a encolhe, e ela é maior do que parece justamente porque existe para os anos ruins. O segundo é <strong>superestimar a solar em geração</strong>: ela é a fonte mais visível, a que mais aparece em notícia e a que mais cresce em potência, e essa saliência empurra a estimativa de energia para cima. Se você errar nessas duas direções, errou como todo mundo erra — e agora sabe por quê." },
    { kind: 'nota', tom: "neutro", label: "Onde isso entra no produto", html: "A ficha de campo fixo é a estrutura de dados de um painel de fonte no <b>Brasil Terminal</b>: sete campos idênticos por fonte, populados por série pública, permitindo comparação lateral automática. E o reconstrutor é o raro objeto de produto que também é objeto de marketing — é a peça que circula sozinha, porque quem a usa erra, descobre que errou e quer contar para alguém." },
  ],
  'aula-08-03': [
    { kind: 'titulo', numero: "3.1", texto: "Escala do ano — três safras que não coincidem" },
    { kind: 'paragrafo', html: "Três recursos primários brasileiros têm sazonalidade marcada, e as três curvas estão defasadas entre si. Essa defasagem não é sorte: é geografia física, e é a razão de a expansão eólica no Nordeste ter sido tão eficiente do ponto de vista sistêmico, para além de ter sido barata." },
    { kind: 'tabela', linhas: [["Recurso","Quando é forte","Onde","Contra o que ele compensa"],["Chuva","Novembro a abril no Sudeste/Centro-Oeste; regimes distintos no Norte, Nordeste e Sul","Bacia do Paraná concentra o armazenamento","É a referência: o resto se mede contra ela"],["Vento","Segundo semestre, com pico entre julho e setembro em boa parte do Nordeste","Litoral do Rio Grande do Norte e do Ceará; interior da Bahia e do Piauí","Compensa o período seco do Sudeste/Centro-Oeste — poupa água quando a água é mais cara"],["Cana","Safra de abril a novembro no Centro-Sul","São Paulo, Goiás, Minas Gerais, Mato Grosso do Sul","Também cai dentro do período seco, e por isso é a segunda complementaridade estrutural"],["Sol","Variação anual modesta","Nordeste e norte de Minas para centralizada; todo o país para distribuída","Não compensa nada na escala anual — a contribuição dele está na escala do dia"]] },
    { kind: 'paragrafo', html: "Essa é a leitura que separa quem entende a matriz de quem só a descreve: a solar não tem papel sazonal e o vento não tem papel intradiário confiável</b>. Cada recurso resolve um problema numa escala de tempo e é inútil ou até prejudicial na outra. Somar potência de fontes que resolvem o mesmo problema na mesma hora não diversifica coisa nenhuma — só empilha excedente na mesma janela." },
    { kind: 'paragrafo', html: "A complementaridade tampouco é perfeita. Ela varia por localização e por ano, e não elimina os momentos de baixa simultânea. E há uma limitação que a prosa costuma omitir: <strong>duas fontes podem ser complementares no tempo e estar separadas por dois mil quilômetros</strong>. Sem capacidade de intercâmbio, a complementaridade estatística não vira benefício físico. É por isso que a Aula 05 existe." },
    { kind: 'titulo', numero: "3.2", texto: "Escala do dia — a carga líquida e a rampa" },
    { kind: 'paragrafo', html: "A carga que o operador nacional enxerga não é o consumo da sociedade. É o consumo <em>menos</em> a geração que ele não comanda — sobretudo a micro e minigeração distribuída, que produz atrás do medidor e reduz a energia retirada da rede sem que ninguém precise pedir. Esse resultado é a <strong>carga líquida</strong>, e o formato dela é o fato operacional mais importante da matriz brasileira contemporânea." },
    { kind: 'paragrafo', html: "O mecanismo é a soma de duas coisas simples. Primeira: a irradiação solar está disponível aproximadamente entre nove e dezesseis horas, com pico ao meio-dia. Segunda: o consumo residencial e comercial tem pico no início da noite, quando iluminação, climatização e retorno para casa se somam. Como a produção solar cessa antes de o consumo cair, o sistema enfrenta duas transições difíceis por dia: uma depressão da carga líquida no meio do dia e uma <strong>rampa</strong> de subida acentuada no fim da tarde." },
    { kind: 'nota', tom: "gold", label: "Por que este módulo não usa o apelido consagrado", html: "Esse fenômeno recebeu um apelido pitoresco em outro mercado elétrico, e o apelido viajou. Nós o descrevemos pelas próprias propriedades por dois motivos. O primeiro é de rigor: o apelido descreve a curva de <em>um</em> sistema com composição, latitude e hábito de consumo específicos, e a curva brasileira não é aquela. O segundo é de método: quem aprende o apelido decora um desenho; quem aprende a física do recurso somada ao hábito de consumo consegue prever o desenho de qualquer sistema, inclusive de um que ainda não existe." },
    { kind: 'paragrafo', html: "O operador nacional organiza a análise dessa curva em quatro patamares, e essa é a nomenclatura que vale a pena carregar porque é a que aparece nos documentos oficiais." },
    { kind: 'tabela', linhas: [["Patamar","Faixa horária","Carga líquida","Potencial solar","O que acontece ali"],["P1","00h00 – 06h59","Baixa","Baixo","Vento pode estar alto e a hidráulica opera no mínimo. Praticamente não há corte de geração."],["P2","07h00 – 08h59 e 16h00 – 17h59","Baixa a média","Médio","Transições. É onde a rampa da tarde começa e onde o corte aparece de forma intermitente."],["P3","09h00 – 15h59","Baixa","Elevado","A janela crítica. Toda a oferta solar chega junto enquanto a carga líquida está no fundo. É aqui que o corte de geração se concentra."],["P4","18h00 – 23h59","Alta","Baixo","Pico de consumo sem sol. Exige rampa de hidráulica, térmica, armazenamento e intercâmbio. Praticamente não há corte."]] },
    { kind: 'paragrafo', html: "Guarde a assimetria entre P3 e P4, porque ela resume o problema do sistema brasileiro atual em duas linhas: <strong>sobra energia no P3 e falta potência no P4</strong>. Não é o mesmo problema visto de dois ângulos — são dois problemas diferentes, com soluções diferentes, que acontecem no mesmo dia com seis horas de distância." },
    { kind: 'nota', tom: "neutro", label: "Complementaridade · três níveis", html: "<b>Criança de 12 anos.</b> Imagina um time em que um jogador é ótimo no primeiro tempo e cansa no segundo, e outro é devagar no começo e forte no fim. Sozinho, nenhum dos dois joga a partida inteira bem. Juntos, o time nunca fica sem alguém bom em campo. Energia funciona assim: o sol trabalha no meio do dia, o vento trabalha à noite e em certos meses do ano, e a água guarda força para os momentos em que os outros dois falham ao mesmo tempo.<br/><b>Executivo.</b> Complementaridade significa que os perfis de produção não se movem juntos. Correlação baixa entre fontes reduz a variabilidade do portfólio; correlação negativa é ainda melhor. Ela ocorre em quatro dimensões — diária, sazonal, espacial e operacional — e o benefício econômico é evitar a construção de capacidade redundante e reduzir o consumo de água e de combustível. Duas ressalvas comerciais importam: diversificação tecnológica não é diversificação horária, porque acrescentar solar em vários estados não diversifica nada se o pico ocorre na mesma janela; e complementaridade sem transmissão disponível não se realiza fisicamente, por mais elegante que seja no gráfico.<br/><b>Especialista.</b> Formalmente, o ganho vem da matriz de covariância do portfólio de geração contra o perfil de carga, avaliada na resolução temporal em que a restrição opera — o que significa resolução horária ou semi-horária, nunca média mensal. Três consequências operacionais: a métrica relevante não é a correlação média entre séries, e sim o comportamento nas caudas, porque a adequação é determinada pelos eventos de baixa simultânea; o valor marginal de uma unidade adicional de uma fonte declina à medida que a penetração daquela fonte cresce, o que torna a expansão correlacionada progressivamente menos valiosa e eventualmente de soma zero; e a complementaridade espacial só se converte em benefício sistêmico até o limite de intercâmbio da interligação relevante, ponto a partir do qual o excedente vira corte por confiabilidade em vez de energia entregue." },
    { kind: 'paragrafo', html: "Alterne para \"domingo de sol\" e observe o que muda. A carga cai porque a indústria e o comércio estão parados. A geração solar não cai, porque o sol não sabe que dia é. A geração distribuída também não cai, e ela não está sob comando de ninguém. O resultado é que o pior dia do sistema não é o dia mais quente nem o mais frio — é o domingo ensolarado de feriado prolongado</b>, quando a oferta está no máximo e a demanda no mínimo ao mesmo tempo." },
    { kind: 'titulo', numero: "3.3", texto: "O calendário do sistema" },
    { kind: 'paragrafo', html: "Juntando as três escalas, o ano do sistema elétrico brasileiro tem um formato reconhecível, e vale carregá-lo na cabeça do mesmo jeito que se carrega a forma das pizzas." },
    { kind: 'nota', tom: "neutro", label: "Onde isso entra no produto", html: "As curvas sobrepostas e o perfil intradiário são, literalmente, a especificação funcional de um painel de geração por fonte e por submercado no <b>Brazil Pulse</b> — inclusive a decisão de exibir carga e carga líquida como duas séries distintas, que é o detalhe que a maioria dos painéis do mercado omite e que muda a interpretação de tudo o que está acima. O calendário sazonal, por sua vez, é o que transforma um dashboard em ferramenta de decisão: não basta mostrar o número de hoje, é preciso mostrar em que ponto do ciclo anual o número de hoje está." },
  ],
  'aula-08-04': [
    { kind: 'titulo', numero: "4.1", texto: "Duas grandezas que apontam para lados opostos" },
    { kind: 'paragrafo', html: "Todo mundo que acompanha o setor conhece \"o nível dos reservatórios\". Quase ninguém percebe que essa expressão esconde <strong>duas</strong> grandezas independentes, que respondem a perguntas diferentes e podem se mover em direções opostas no mesmo mês." },
    { kind: 'tabela', linhas: [["","Energia natural afluente","Energia armazenada"],["Natureza","Fluxo — quanta energia está chegando agora","Estoque — quanta energia está guardada"],["O que converte","Vazões afluentes em energia potencial equivalente","Volume útil dos reservatórios em energia equivalente"],["Como se lê","Percentual da média de longo termo daquele mês e daquele subsistema","Percentual do volume útil máximo do subsistema"],["Responde a","\"Choveu quanto, em relação ao normal para esta época?\"","\"Quanto ainda dá para gastar antes de a situação apertar?\""],["Velocidade","Muda semana a semana e é volátil","Muda lentamente e carrega a história dos meses anteriores"]] },
    { kind: 'paragrafo', html: "A média de longo termo é o valor histórico esperado da afluência para aquele mês e aquele subsistema. Ela é a régua contra a qual a afluência é lida, e é regionalizada e mensal — comparar a afluência de julho no Nordeste com a média anual do Brasil não significa nada." },
    { kind: 'paragrafo', html: "A situação verificada em junho de 2026 é o exemplo perfeito da independência entre as duas grandezas, e é por isso que ela entra aqui:" },
    { kind: 'tabela', linhas: [["Subsistema","Afluência (% da média de longo termo)","Energia armazenada (% do volume útil)","Leitura"],["Sudeste/Centro-Oeste","93%","66%","Chegando quase o normal, com estoque médio. É o subsistema que concentra cerca de setenta por cento da capacidade de armazenamento do país, então é o número que mais importa."],["Sul","82%","63%","Regime próprio, pouca regularização, alta volatilidade."],["Nordeste","59%","89%","Fluxo fraco, estoque alto. Chegando pouco, mas com muita água guardada."],["Norte","58%","95%","Mesma configuração, ainda mais acentuada."]] },
    { kind: 'nota', tom: "neutro", label: "Números vivos · verificar na fonte antes de uso externo", html: "Valores de <b>junho de 2026</b>, reportados ao comitê de monitoramento do setor elétrico, com afluência de 82% da média de longo termo no sistema como um todo. O armazenamento do sistema interligado abriu a semana de 20 de julho de 2026 em 70,7%. Esses números mudam <b>diariamente</b> — o informe diário da operação do operador nacional publica o valor de ontem. Consulta em 1º de agosto de 2026. Nunca cite nível de reservatório sem data." },
    { kind: 'paragrafo', html: "Olhe o Nordeste e o Sudeste/Centro-Oeste lado a lado. O Nordeste tem quase o dobro do estoque relativo do Sudeste, com uma afluência que é dois terços da dele. Quem lê apenas armazenamento conclui que o Nordeste está confortável e o Sudeste apertado. Quem lê apenas afluência conclui o inverso. As duas leituras isoladas são igualmente inúteis, porque estoque alto com fluxo fraco é uma situação que se deteriora e estoque médio com fluxo normal é uma situação que se sustenta</b>. A leitura correta precisa das duas dimensões simultaneamente — que é exatamente o que o instrumento abaixo faz." },
    { kind: 'titulo', numero: "4.2", texto: "O piso que ninguém vê" },
    { kind: 'paragrafo', html: "Hidrelétrica não pode ser reduzida indefinidamente. Existem vazões mínimas obrigatórias por licença ambiental, requisitos de navegação e abastecimento, limites de estabilidade e exigências operativas das máquinas. Some a isso o fato de a geração hidráulica ser o principal instrumento de controle de frequência do sistema, e o resultado é um <strong>piso de geração hidráulica</strong> abaixo do qual o operador não desce." },
    { kind: 'paragrafo', html: "Esse piso é invisível na conversa pública e é a causa direta de um fenômeno que a Aula 05 vai detalhar. Quando, numa hora de carga líquida muito baixa, a soma da geração distribuída, da solar centralizada, da eólica, da térmica inflexível e da hidráulica no piso ultrapassa a necessidade do sistema, alguém precisa parar de gerar. E quem para não é quem chegou por último nem quem é mais caro — é quem está sob comando do operador</b>. A geração distribuída não está." },
    { kind: 'nota', tom: "neutro", label: "Hidro-dependência · três níveis", html: "<b>Criança de 12 anos.</b> Imagina uma caixa d'água enorme no alto do morro. Quando chove muito, ela enche e você pode usar água à vontade por meses. Quando chove pouco, ela vai baixando devagar e você precisa economizar hoje para não faltar depois. Ter a caixa é ótimo, porque quase ninguém tem. Mas depender dela é arriscado, porque você não manda na chuva — e se chover pouco por dois anos seguidos, a caixa não se enche de novo só porque você quer.<br/><b>Executivo.</b> O reservatório é armazenamento plurianual de energia a custo marginal quase nulo, e ele dá ao sistema brasileiro flexibilidade e reserva que sistemas sem hidráulica precisam comprar com combustível ou com bateria. O contrapeso é exposição: o estoque depende de um recurso que não se contrata, e a mesma seca que reduz a geração barata aumenta o despacho térmico caro. Para uma empresa, a consequência prática é que a condição hidrológica é uma variável de risco de custo de energia tão relevante quanto o câmbio, e ela é pública, medida e acompanhável — o que significa que não acompanhá-la é escolha, não limitação.<br/><b>Especialista.</b> A regularização plurianual é o ativo estratégico, e ela vem se degradando por três vetores simultâneos: a expansão do parque hidrelétrico ocorreu predominantemente a fio d'água nas últimas duas décadas, o que aumenta capacidade sem aumentar armazenamento; a participação hidrelétrica na geração declina por diluição, reduzindo a energia disponível para transferir entre estações; e a variabilidade climática amplia a dispersão dos extremos, o que importa mais que a mudança na média, porque o dimensionamento de adequação é governado pela cauda. Some-se o requisito de geração mínima, que transforma o próprio ativo de flexibilidade em restrição durante as horas de sobreoferta, e o resultado é um sistema cuja característica definidora opera em direções opostas conforme a hora do dia e o mês do ano." },
    { kind: 'titulo', numero: "4.3", texto: "A vantagem e a vulnerabilidade são o mesmo fato" },
    { kind: 'paragrafo', html: "Vale enunciar isso sem eufemismo, porque é a resposta a uma das perguntas de decisor mais frequentes que existem sobre o Brasil." },
    { kind: 'tabela', linhas: [["O fato","Lido como vantagem","Lido como vulnerabilidade"],["Metade da eletricidade vem de uma fonte renovável e despachável","Intensidade de carbono baixa sem sacrificar controlabilidade; reserva e rampa sem queimar combustível","Concentração em um recurso único cuja disponibilidade é climática e não contratável"],["O estoque é plurianual","Absorve um ano ruim sem crise; permite planejar entre estações","Também demora anos para se recompor — uma única estação chuvosa boa pode não bastar"],["O parque é integrado nacionalmente","Aproveita diversidade hidrológica entre bacias distantes","Seca espacialmente ampla anula o benefício e correlaciona os subsistemas"],["A hidráulica equilibra a renovável variável","Absorve rampa e variação sem custo de combustível","Tem piso: nas horas de sobreoferta ela deixa de ser solução e vira parte do problema"]] },
    { kind: 'paragrafo', html: "Duas siglas comerciais nascem dessa realidade física e vale saber o que elas são, sem entrar no mérito — isso é matéria do próximo bloco. O <strong>mecanismo de realocação de energia</strong> compartilha a geração hidrelétrica entre participantes para reduzir a exposição de cada usina à hidrologia individual. O <strong>fator de ajuste</strong> desse mecanismo compara a geração agregada alocável com a garantia física do conjunto. Ambos existem porque usinas em cascata sob despacho centralizado não controlam individualmente a própria produção — é uma solução comercial para um fato físico." },
    { kind: 'nota', tom: "neutro", label: "Onde isso entra no produto", html: "O termômetro bidimensional é a base de qualquer indicador de condição sistêmica do <b>Brazil Pulse</b>, e a decisão de projeto que ele carrega é a que mais diferencia o painel: exibir estoque e fluxo como duas dimensões de um plano, e não como duas linhas independentes numa lista de indicadores. Um número só, colorido de verde ou vermelho, é o formato que a maioria dos painéis adota e é o que faz o leitor tirar a conclusão errada com confiança." },
  ],
  'aula-08-05': [
    { kind: 'titulo', numero: "5.1", texto: "A malha e os submercados" },
    { kind: 'paragrafo', html: "O sistema interligado nacional conecta geração e consumo da maior parte do território por uma rede de escala continental. Ao fim de 2025 o país contava com cerca de 181,8 mil quilômetros de linhas de transmissão, com 5,6 mil quilômetros adicionados no ano. A integração permite compartilhar reserva, aproveitar diversidade hidrológica e somar fontes; também propaga perturbação e exige coordenação centralizada." },
    { kind: 'paragrafo', html: "O sistema <strong>não</strong> é uma placa de cobre. Limites físicos de transmissão separam regiões e condicionam a operação, e é sobre esses limites que se definem os quatro submercados." },
    { kind: 'tabela', linhas: [["Submercado","Característica","Papel no sistema"],["Sudeste/Centro-Oeste","Maior concentração de carga e de reservatórios; indústria e centros urbanos","Principal centro de consumo e de armazenamento hidráulico; é o destino da maioria dos intercâmbios"],["Sul","Hidrologia própria e descolada das demais, eólica relevante, carga industrial e agrícola forte","Alterna importação e exportação conforme água, vento e carga — o mais bidirecional dos quatro"],["Nordeste","Grande expansão eólica e solar; carga menor que o potencial de oferta em vários períodos","Exportador renovável e foco dos limites de escoamento e do corte de geração"],["Norte","Grandes hidrelétricas a fio d'água, longas distâncias, integração amazônica complexa","Exporta blocos sazonais e conecta empreendimentos remotos"]] },
    { kind: 'paragrafo', html: "Submercado é zona de contabilização e de preço, não fronteira administrativa — as bordas seguem topologia elétrica e não coincidem com as cinco regiões geográficas. E há uma separação que confunde muita gente competente: <strong>contrato de energia não determina o caminho físico dos elétrons</strong>. Uma indústria no Sudeste pode contratar uma eólica no Nordeste; comercialmente existe um contrato e uma exposição de submercado, fisicamente a rede equilibra o conjunto e a energia que entra naquela fábrica é a que estava mais perto. Essa separação entre o comercial e o físico é o que torna possível o mercado livre — e é o que torna necessário haver limites de intercâmbio na conta." },
    { kind: 'titulo', numero: "5.2", texto: "Os corredores estruturantes" },
    { kind: 'paragrafo', html: "Três arranjos de transmissão organizam a topologia brasileira e vale saber o que cada um resolve." },
    { kind: 'tabela', linhas: [["Corredor","O que conecta","Qual problema resolveu","Que risco criou"],["Eixo Norte-Sul","Norte e Nordeste ao Sudeste/Centro-Oeste, em corrente alternada","Transformou sistemas regionais numa rede nacional e permitiu transferir excedente sazonal entre bacias com regimes distintos","Saturação ou falha divide eletricamente o país e eleva custo local; não é uma linha, é um conjunto de corredores e reforços"],["Bipolos do Madeira","Complexo hidrelétrico de Rondônia ao Sudeste, em corrente contínua de alta tensão","Escoou grande bloco por distância muito longa com perda reduzida e fluxo controlável","Dependência de estações conversoras; a perda de um bipolo é contingência de magnitude elevada"],["Bipolos de Belo Monte","Complexo do Xingu ao Sudeste, em corrente contínua de alta tensão","Mesmo princípio, com entrega em pontos distintos da rede para distribuir o impacto","Mesma dependência, somada à necessidade de o destino ter capacidade de receber o bloco"]] },
    { kind: 'paragrafo', html: "A corrente contínua aparece quando a distância é grande e o que se quer é levar um bloco de A para B com controle de fluxo. A corrente alternada aparece quando o que se quer é integrar a malha. As duas coexistem e resolvem problemas diferentes — não é uma escolha entre tecnologias, é uma escolha entre funções." },
    { kind: 'titulo', numero: "5.3", texto: "Concentração da malha — e como ler o número corretamente" },
    { kind: 'paragrafo', html: "A malha de transmissão brasileira é concentrada, e o número que circula sobre isso é um caso-escola de recorte mal declarado. A <strong>AXIA Energia</strong> — companhia que até 2025 operava sob a marca Eletrobras e que foi privatizada em 2022 — informou, ao fim de 2025, cerca de 74,8 mil quilômetros de linhas, dos quais 69,3 mil acima de 230 quilovolts, e uma participação de mercado de 37% <strong>no segmento acima de 230 quilovolts</strong>, incluindo participações em sociedades de propósito específico. A mesma companhia informou 43,9 gigawatts de capacidade de geração, correspondentes a 17% do total do país — percentual calculado <strong>excluindo</strong> a usina binacional e a nuclear." },
    { kind: 'paragrafo', html: "Repare no que acontece quando esses qualificadores caem. \"Trinta e sete por cento das linhas do país\" é uma afirmação diferente de \"trinta e sete por cento das linhas acima de 230 quilovolts, incluindo participações societárias\" — a primeira é aproximadamente verdadeira por coincidência aritmética e conceitualmente errada. E \"dezessete por cento da capacidade do país\" muda de valor conforme o denominador inclua ou não a binacional e a nuclear. Nenhum dos dois números é falso; ambos são inutilizáveis sem a nota de rodapé." },
    { kind: 'nota', tom: "gold", label: "Regra de leitura", html: "Percentual de participação de mercado divulgado por empresa vem quase sempre com denominador escolhido. A pergunta não é \"esse número é verdade\" — é <b>\"esse número é verdade sobre o quê\"</b>. Procure a nota de rodapé antes de reproduzir; ela existe, e o fato de existir é o que torna a divulgação correta." },
    { kind: 'paragrafo', html: "A concentração em si é fato descritível de estrutura de mercado: torna a companhia central para reforço, modernização e disponibilidade da rede. Se isso é bom ou ruim é avaliação, e avaliação fica fora deste ativo. O que é analiticamente relevante é a consequência estrutural — cronograma de obra, capacidade de execução e prioridade de investimento de um único agente têm efeito sistêmico desproporcional. Vale registrar, pela mesma disciplina, que a companhia informou ter migrado para portfólio de geração integralmente renovável em 2025 após alienar suas termelétricas a gás, o que reduz sua capacidade instalada e altera a composição do denominador em qualquer série que a inclua." },
    { kind: 'titulo', numero: "5.4", texto: "Sistemas isolados e a data que tem cinco respostas" },
    { kind: 'paragrafo', html: "Sistemas isolados atendem localidades não conectadas ao sistema interligado, sobretudo na Amazônia. Respondem por menos de meio por cento da geração nacional, com perfil muito mais fóssil que a média — o diesel dominava a geração isolada em 2025. A média nacional renovável esconde realidades locais completamente diferentes, e essa é uma das melhores demonstrações de por que média é uma estatística perigosa." },
    { kind: 'paragrafo', html: "Em setembro de 2025, Roraima deixou de ser o último estado fora do sistema interligado. A linha entre Manaus e Boa Vista custou cerca de R$ 2,6 bilhões, tem aproximadamente 725 quilômetros em circuito duplo de 500 quilovolts e atravessa terra indígena e nove municípios. Conectou cerca de 209 mil unidades consumidoras e reduziu drasticamente o consumo do sistema isolado do estado." },
    { kind: 'paragrafo', html: "E agora o ponto pedagógico, que é maior que o fato: essa interligação tem cinco datas, todas corretas, para perguntas diferentes</b>." },
    { kind: 'tabela', linhas: [["Data","O que aconteceu","Quem pergunta isso"],["3 de setembro de 2025","Emissão da licença de operação","Quem acompanha licenciamento ambiental"],["10 de setembro de 2025","Início dos testes de energização, em cerimônia na sede do operador nacional","Imprensa e comunicação institucional — é a data que circula"],["16 de setembro de 2025","Interligação física efetiva, às 7h23; o estado deixa de importar energia do sistema vizinho","Quem estuda a operação do sistema"],["Outubro de 2025","Início da operação comercial","Quem acompanha a série de consumo"],["1º de janeiro de 2026","Passa a ser considerado efetivamente interligado para fins de comercialização, por despacho da agência de dezembro de 2025","Quem contabiliza, liquida ou migra consumidor"]] },
    { kind: 'paragrafo', html: "Se você citar a data errada para a pergunta certa, não está errado — está impreciso de um jeito que só quem conhece o assunto percebe. É a mesma disciplina do recorte da Aula 01, aplicada ao tempo em vez de à quantidade." },
    { kind: 'paragrafo', html: "Há um segundo ensinamento nessa obra, e ele é sobre cronograma. O estudo técnico que recomendou a interligação de Boa Vista é de 2010; o leilão que a contratou, de 2011; a energização, de 2025. <strong>Quinze anos entre a recomendação e a energia.</strong> Licenciamento, servidão, litígio e execução não são detalhes de implementação — são a variável dominante do prazo de qualquer obra de transmissão brasileira, e qualquer projeção que assuma cronograma nominal está errada por construção." },
    { kind: 'titulo', numero: "5.5", texto: "O gargalo e o corte" },
    { kind: 'paragrafo', html: "Quando a geração de uma região excede o que a carga local consome mais o que a rede consegue exportar, alguém precisa parar de gerar. Essa redução tem nome regulatório e três causas juridicamente distintas, definidas pela regulação vigente:" },
    { kind: 'tabela', linhas: [["Causa","O que é","Exemplo típico","O que resolve"],["Confiabilidade elétrica","Limite de carregamento de linha, de tensão, de estabilidade ou de contingência","Exportação do Nordeste limitada para evitar colapso de tensão após contingência","Reforço de rede, compensação reativa, controles e modelos dinâmicos corretos"],["Razão energética","Oferta instantânea maior que a carga somada ao piso de geração das fontes que não podem parar","Domingo ensolarado com muita geração distribuída e carga baixa","Flexibilidade, armazenamento, resposta da demanda e moderação da expansão correlacionada"],["Indisponibilidade externa","Falha ou manutenção em instalação necessária ao escoamento","Transformador ou linha fora de serviço","Reparo, redundância, disciplina de manutenção — e é a única das três com mecanismo de ressarcimento definido"]] },
    { kind: 'paragrafo', html: "A distinção entre as duas primeiras é a mais mal compreendida do setor, e ela decide política pública. Corte por confiabilidade é problema de <em>rede</em>: mais linha resolve. Corte por razão energética é problema de <em>balanço</em>: mais linha não resolve nada, porque a energia não tem para onde ir em lugar nenhum do país naquela hora. Construir transmissão para resolver corte energético é responder à pergunta errada com dinheiro." },
    { kind: 'nota', tom: "neutro", label: "Números vivos · verificar na fonte antes de uso externo", html: "O corte de geração eólica e solar centralizada no Brasil evoluiu de patamar próximo de 0,1% em 2021 para cerca de 20% em 2025, passando por aproximadamente 0,5% em 2022, 3,6% em 2023 e 9,3% em 2024. Em 2025, a repartição por causa foi de aproximadamente <b>54% por razão energética, 33% por confiabilidade e 13% por indisponibilidade externa</b>. Série em transformação rápida e com mudança metodológica ao longo do período — até março de 2024 as restrições consideravam apenas usinas eólicas, e as fotovoltaicas passaram a integrar a série a partir de abril daquele ano. Verificado em 1º de agosto de 2026." },
    { kind: 'paragrafo', html: "O operador nacional publicou o exercício contrafactual que encerra o debate sobre a causa. Simulando o ano de 2024 com geração distribuída igual a zero, a restrição por razão energética cairia de aproximadamente 4.330 gigawatt-hora para 7,6 gigawatt-hora, e a restrição média de 493 megawatts médios para menos de 1. Num cenário alternativo de rateio proporcional entre todas as fontes, incluindo a distribuída, a energia restrita das centralizadas cairia à metade. Não é opinião de agente interessado — é aritmética de balanço horário sobre dado público." },
    { kind: 'paragrafo', html: "O que esse resultado diz não é que a geração distribuída seja indesejável. Diz que o corte recai integralmente sobre quem está sob comando, e quem está sob comando não é quem causa o desequilíbrio</b>. Quem produz atrás do medidor não é chamado a reduzir porque o operador não tem como pedir. É um problema de desenho de regra, não de tecnologia, e é uma das agendas regulatórias mais quentes do setor agora." },
    { kind: 'paragrafo', html: "Sobre o horizonte: o plano da operação elétrica de médio prazo indicou, para o ciclo 2026-2030, cerca de 5.301 quilômetros de novas linhas e 24.314 megavolt-ampère de capacidade adicional de transformação, com investimento estimado em R$ 28,1 bilhões, dos quais R$ 22,7 bilhões em empreendimentos indicados pela primeira vez — e projetou o limite de recebimento do Sudeste/Centro-Oeste a partir do Norte e Nordeste evoluindo de 18.500 megawatts em janeiro de 2026 para 23.000 em janeiro de 2030. Compare com o ciclo anterior, que indicou 1.260 quilômetros e R$ 7,6 bilhões: <strong>o esforço de reforço quadruplicou em um ciclo</strong>. Isso não é aceleração de ambição; é reconhecimento de que a expansão da geração andou mais rápido que a da rede." },
    { kind: 'nota', tom: "neutro", label: "Onde isso entra no produto", html: "O mapa de gargalos e a série de corte por causa são a camada de restrição sobre o mapa do <b>Brasil Terminal</b> — e é a camada que nenhuma plataforma vinculada a comercializadora tem incentivo para destacar, porque ela mostra que a energia contratada e a energia entregue podem divergir por razões que não estão no contrato. Para o diagnóstico industrial, a pergunta operacional é direta: qual é o gargalo mais próximo da planta, e o que ele significa para a confiabilidade e para o preço local." },
  ],
  'aula-08-06': [
    { kind: 'titulo', numero: "6.1", texto: "Por que é monopólio, e o que isso significa para quem migra" },
    { kind: 'paragrafo', html: "Distribuição transforma alta e média tensão em níveis de uso, conecta consumidores e geração distribuída, mede energia, restabelece falha e cobra tarifa regulada. Duplicar postes e cabos para permitir concorrência seria ineficiente, então a atividade é outorgada com exclusividade territorial e regulada em contrapartida — obrigação de universalização, de continuidade e de modicidade." },
    { kind: 'paragrafo', html: "A consequência prática que mais gera mal-entendido comercial: o consumidor livre escolhe de quem compra a energia, e continua usando e pagando a rede local</b>. Migrar para o ambiente livre muda fornecedor e contrato; não muda alimentador, não muda qualidade local, não elimina a fatura de uso do sistema e não protege contra queda por tempestade. Empresa que migra achando que se desligou da distribuidora descobre isso no primeiro evento climático." },
    { kind: 'nota', tom: "neutro", label: "Monopólio de rede e escolha de fornecedor · três níveis", html: "<b>Criança de 12 anos.</b> É como a rua na frente da sua casa. Você pode escolher em qual mercado comprar comida, mas a comida vai chegar pela mesma rua, e quem cuida da rua é sempre a mesma empresa. Se a rua tiver um buraco, não adianta trocar de mercado. Você continua precisando que alguém conserte a rua — e essa pessoa você não escolhe.<br/><b>Executivo.</b> A rede é infraestrutura essencial de acesso não replicável, então a competição existe na energia e não no fio. Para um consumidor de alta tensão isso significa que a decisão de migrar afeta a componente de energia da conta e a exposição de mercado, e deixa intactas a componente de uso do sistema, a qualidade do fornecimento e o risco de interrupção. Duas implicações de gestão: a diligência sobre a distribuidora local — indicadores de continuidade, plano de investimento, situação da concessão — continua valendo depois da migração; e o custo de interrupção precisa ser precificado separadamente do preço da energia, porque são riscos com donos diferentes.<br/><b>Especialista.</b> A separação entre o fio e a energia é o resultado do desmembramento vertical, e ela produz uma assimetria pouco explorada: o consumidor livre negocia num mercado contestável a parcela em que tem alternativa e permanece cativo, sem instrumento de escolha, na parcela em que a falha tem maior custo operacional. O contrato de uso do sistema de distribuição e a regulação de qualidade são os únicos vetores de proteção nessa parcela, e ambos operam ex post, por indicador e compensação, não ex ante por seleção. Daí decorre que a análise de risco de suprimento de uma planta crítica precisa incorporar o desempenho e a solidez da concessionária local como variável independente do preço contratado — inclusive o estágio do contrato de concessão e a existência de processo sancionador em curso." },
    { kind: 'paragrafo', html: "A propriedade do setor é mista e essa mistura é fato de estrutura, não avaliação. Há concessionárias inteiramente privadas, como a Enel São Paulo e a Light; há companhias de capital aberto com participação estatal relevante remanescente, como a <strong>Cemig</strong>, controlada pelo estado de Minas Gerais, e a <strong>Copel</strong>, que passou por corporativização em 2023 e deixou de ter o estado do Paraná como controlador, mantendo-o como acionista relevante; e há permissionárias e cooperativas de pequeno porte. A consequência analítica é que o horizonte de decisão de investimento e a tolerância a risco variam com a estrutura de controle, e que renovação de concessão é evento político além de técnico." },
    { kind: 'paragrafo', html: "Sobre quantas distribuidoras existem: <strong>é pergunta de recorte, não de fato</strong>. O total muda conforme se contem apenas concessionárias, ou se incluam permissionárias e cooperativas de eletrificação rural regularizadas. As respostas circulantes variam de pouco mais de quarenta a mais de cento e trinta, e todas podem estar corretas para a definição que adotam. Para análise séria, o mapa de áreas de atuação e o relatório de indicadores da agência prevalecem sobre número memorizado de relatório antigo." },
    { kind: 'titulo', numero: "6.2", texto: "Como se mede o desempenho de uma rede" },
    { kind: 'tabela', linhas: [["Indicador","O que mede","O que ele esconde"],["Duração equivalente de interrupção","Quantas horas, em média, cada unidade consumidora ficou sem energia no período","É média: um desempenho aceitável convive com cauda ruim de restabelecimento em tempestade severa"],["Frequência equivalente de interrupção","Quantas vezes, em média, cada unidade foi interrompida","Não distingue interrupção de dois minutos de interrupção de dois dias"],["Indicadores individuais","Duração, frequência e maior interrupção contínua da unidade específica","São o que interessa a uma planta industrial, e quase ninguém os acompanha"],["Perdas técnicas","Energia dissipada fisicamente em condutores, transformadores e equipamentos","São inevitáveis e previsíveis; o que varia é o quanto o projeto da rede as minimiza"],["Perdas não técnicas","Furto, fraude, erro de medição, de cadastro e de faturamento","A regulação reconhece na tarifa apenas um limite considerado eficiente; o excedente sai do caixa da empresa"]] },
    { kind: 'paragrafo', html: "A distinção entre perda reconhecida e perda real é o ponto econômico que explica o primeiro caso desta aula. Se a meta regulatória for irrealista para a área de concessão, a concessão perde sustentabilidade financeira. Se for permissiva, o consumidor que paga subsidia quem furta. O ajuste dessa meta é técnico, social, policial e regulatório ao mesmo tempo, e não existe solução que seja só um dos quatro." },
    { kind: 'titulo', numero: "6.3", texto: "O mesmo instrumento, dois desfechos" },
    { kind: 'paragrafo', html: "Os contratos de distribuição que vencem entre 2025 e 2031 seguem um marco de renovação estabelecido por decreto federal de 2024, com recomendação da agência baseada em critérios de qualidade e de solidez econômico-financeira, e decisão final do ministério. É o mesmo instrumento nos dois casos abaixo. O resultado foi oposto." },
    { kind: 'titulo', numero: null, texto: "Caso A · Light — região metropolitana do Rio de Janeiro · Arco fechado" },
    { kind: 'tabela', linhas: [["O que caracteriza a área","Alta densidade urbana, violência, informalidade e perdas não técnicas estruturalmente elevadas. Atende cerca de 4,3 milhões de unidades consumidoras em 31 municípios fluminenses, e opera na região desde 1904."],["A crise","Pedido de recuperação judicial em 12 de maio de 2023, com passivo da ordem de R$ 11 bilhões. O pedido foi apresentado pela Light S.A. , a holding, e não pela Light Serviços de Eletricidade, a distribuidora — a legislação impede concessionária de serviço público de recorrer ao instrumento enquanto a concessão está ativa."],["A reação regulatória","Termo de intimação em julho de 2023, por o plano apresentado não assegurar recuperação econômico-financeira inequívoca, com monitoramento em regime diferenciado e preservação das obrigações setoriais e de qualidade."],["O desfecho","Plano de recuperação aprovado em 2024. Recomendação favorável à renovação aprovada por unanimidade pela agência em novembro de 2025, com um voto de fundamentação divergente. Termo aditivo assinado com o ministério em maio de 2026, prorrogando a concessão por 30 anos, de 4 de junho de 2026 a 4 de junho de 2056. Pedido judicial de encerramento da recuperação apresentado em julho de 2026."],["O que o caso ensina","Risco da holding e risco da concessão são coisas separadas e precisam ser analisados separadamente. E o novo contrato incorporou, pela primeira vez, tratamento contratual específico para áreas com furto de energia — ou seja, o problema econômico que causou a crise virou parâmetro do instrumento que a encerrou."]] },
    { kind: 'titulo', numero: null, texto: "Caso B · Enel Distribuição São Paulo — região metropolitana de São Paulo · Arco aberto" },
    { kind: 'tabela', linhas: [["O que caracteriza a área","O maior centro de carga do país, com arborização urbana densa e exposição crescente a eventos climáticos severos. A concessionária é a antiga Eletropaulo, adquirida pelo grupo italiano em 2018; o contrato de concessão é de 1998, com vigência de 30 anos."],["A crise","Interrupções prolongadas recorrentes após eventos climáticos desde 2023, com tempo elevado de atendimento emergencial e aumento de interrupções superiores a 24 horas."],["A reação regulatória","Fiscalização intensificada e penalidades ao longo de 2025. Em 7 de abril de 2026, a diretoria colegiada decidiu pela instauração de processo administrativo de caducidade , com prazo de defesa escrita, e determinou a suspensão da análise de renovação do contrato."],["O estágio atual","Pedido de reconsideração negado pelo diretor-geral. Manifestação com considerações finais protocolada pela concessionária em julho de 2026, questionando os pressupostos técnicos e jurídicos. Recurso com julgamento previsto para agosto de 2026, cujo resultado pode manter, anular ou arquivar o processo."],["O que o caso ensina","Caducidade não ocorre por manchete. Existe rito, contraditório, prazo, defesa e recurso, e o desfecho é recomendação ao poder concedente, não decisão isolada do regulador. Indicador médio anual aceitável não afasta a caracterização de serviço inadequado quando a falha se concentra na cauda: a fiscalização se apoiou em desempenho comparado em eventos climáticos semelhantes, não só em indicador regulatório."]] },
    { kind: 'nota', tom: "neutro", label: "Números vivos · verificar na fonte antes de uso externo", html: "O Caso B é <b>processo em curso</b>. O estágio descrito acima é o verificado em 1º de agosto de 2026, e há julgamento previsto para agosto — este parágrafo pode estar desatualizado no momento em que você o lê. Consulte a agência antes de afirmar qualquer coisa sobre o desfecho. Descrever processo administrativo em andamento como decisão consumada é o erro mais comum e mais caro desta matéria." },
    { kind: 'titulo', numero: "6.4", texto: "Quem consome, quanto e em que formato" },
    { kind: 'paragrafo', html: "O consumo de energia elétrica na rede no Brasil foi de aproximadamente 566,7 terawatt-hora em 2025, com crescimento de cerca de 0,9%. A distribuição por classe:" },
    { kind: 'tabela', linhas: [["Classe","TWh na rede","Parcela","Leitura"],["Industrial","199,3","~35%","Maior classe no ano, forte presença no ambiente livre, e a que mais se move com o ciclo econômico"],["Residencial","179,6","~32%","Muitos consumidores, altíssima sensibilidade a temperatura e a renda"],["Comercial","104,0","~18%","Climatização e serviços; migração acelerada ao ambiente livre"],["Rural","32,4","~6%","Irrigação e bombeamento, com sazonalidade agrícola própria"],["Serviço público","17,8","~3%","Água, esgoto e transporte"],["Poder público","17,4","~3%","Prédios e instalações governamentais"],["Iluminação pública","12,7","~2%","Carga estritamente noturna, em queda por eficiência"],["Consumo próprio","3,4","~1%","Uso interno de agentes e instalações classificadas"]] },
    { kind: 'paragrafo', html: "Duas leituras importam mais que a tabela. A primeira: a indústria é a maior classe no <em>ano</em>, mas o consumo residencial já superou o industrial em vários <em>meses</em> desde 2024, impulsionado por onda de calor e climatização. A frase \"a indústria é a maior classe\" está ficando dependente da escala temporal em que se pergunta — e essa é a mesma disciplina de recorte da Aula 01, aplicada a consumo." },
    { kind: 'paragrafo', html: "A segunda: o ambiente livre respondeu por cerca de 45% do consumo em 2025, contra cerca de 55% do regulado, que recuou 3,5% no ano. A migração não reduz consumo físico — move consumo entre ambientes contábeis. Ler queda do mercado regulado como queda de consumo é erro de leitura, não achado." },
    { kind: 'titulo', numero: "6.5", texto: "A carga que ainda não existe" },
    { kind: 'paragrafo', html: "Data centers entraram na conversa de planejamento brasileira em 2025 com uma assimetria difícil de exagerar. A carga de data centers efetivamente operando no país era da ordem de <strong>800 megawatts</strong>. Os pedidos de conexão em análise no ministério saltaram de aproximadamente 19,8 gigawatts em setembro de 2025 para 26,2 gigawatts em novembro do mesmo ano, após a criação de um regime especial de tributação para o setor. A fila é cerca de trinta vezes o parque instalado, e o montante pedido representaria mais de um quarto de toda a demanda de energia do país." },
    { kind: 'paragrafo', html: "Duas coisas precisam ser ditas juntas, e a ordem importa. A primeira: pedido de estudo de conexão não é projeto, e a fração desses gigawatts que efetivamente se materializa no horizonte decenal é objeto de incerteza declarada pelo próprio planejador. A segunda: mesmo a fração que se materializar não resolve o corte de geração sozinha. O operador simulou a adição de aproximadamente 4 gigawatts de grandes consumidores e obteve redução inferior a 800 megawatts médios no corte total. A razão é temporal e locacional — carga constante não coincide com todas as horas e todos os lugares de excedente, e restrição elétrica permanece onde ela existe." },
    { kind: 'paragrafo', html: "O regime especial exige uso de energia de fontes limpas ou renováveis e eficiência hídrica verificada anualmente. A frase que resume a dificuldade técnica de atender a isso é curta: ter energia limpa no balanço anual não é ter energia firme no instante em que os servidores a demandam</b>. Contratar renovável e ter continuidade são dois problemas, e o segundo é resolvido por conexão firme, redundância e armazenamento, não por contrato." },
    { kind: 'nota', tom: "neutro", label: "Onde isso entra no produto", html: "O perfil de consumo por classe e por setor conecta diretamente com o <b>Diagnóstico Energético</b>, que é a porta de entrada comercial. A pergunta que ele responde não é quanto a empresa consome — é <em>com que formato</em>, porque é o formato que determina demanda contratada, exposição horária e qual fonte casa com a operação. E o caso B desta aula estabelece a regra de conduta do produto: processo administrativo em curso se descreve como processo em curso, nunca como desfecho, em nenhum material." },
  ],
  'aula-08-07': [
    { kind: 'titulo', numero: "7.1", texto: "Força 1 — a hidro está sendo diluída, não desmontada" },
    { kind: 'paragrafo', html: "A participação hidrelétrica na geração caiu de patamar superior a sessenta por cento para cerca de metade em pouco mais de uma década. A leitura errada é que se está desmontando a hidráulica. A leitura correta é aritmética: a capacidade hidrelétrica cresceu pouco enquanto a das outras fontes explodiu</b>, e uma fatia encolhe quando a pizza cresce, mesmo que o pedaço continue do mesmo tamanho." },
    { kind: 'paragrafo', html: "O que isso muda de fato não é o volume de energia hidráulica — é a <strong>proporção de energia estocável no sistema</strong>. Cada gigawatt de eólica ou solar adicionado sem armazenamento correspondente reduz a fração do sistema que pode transferir energia entre estações. E como a expansão hidrelétrica das últimas duas décadas foi predominantemente a fio d'água, a capacidade cresceu mais que o armazenamento até dentro da própria fonte." },
    { kind: 'paragrafo', html: "<strong>Onde ver:</strong> série anual de capacidade e de geração por fonte no balanço energético; série histórica de energia armazenada por subsistema no portal aberto do operador. A primeira sai uma vez por ano com ano-base no ano anterior; a segunda é diária." },
    { kind: 'titulo', numero: "7.2", texto: "Força 2 — parte crescente da geração está fora de comando" },
    { kind: 'paragrafo', html: "A micro e minigeração distribuída passou de menos de dez gigawatts para dezenas de gigawatts em poucos anos, e sua produção reduz a carga que o operador enxerga sem que ele possa comandá-la. Essa é a mudança estrutural mais rápida da matriz brasileira e a que menos aparece nos gráficos, precisamente porque ela é <em>subtraída</em> da curva em vez de somada a ela." },
    { kind: 'paragrafo', html: "O rastro mensurável é o corte de geração: de patamar próximo de zero em 2021 para cerca de vinte por cento das fontes eólica e solar centralizada em 2025, com a razão energética já respondendo pela maior parcela e projeção de dominar quase totalmente os cortes no fim da década. E o rastro contrafactual, calculado pelo próprio operador sobre dado público, é o que fecha o argumento: sem geração distribuída, o corte por razão energética de 2024 teria sido praticamente nulo." },
    { kind: 'paragrafo', html: "<strong>Onde ver:</strong> série de restrição de geração e de carga por subsistema no portal aberto do operador; relatório de acompanhamento de expansão e base de outorgas da agência para a evolução do parque; caderno específico de micro e minigeração distribuída do plano decenal para a projeção." },
    { kind: 'titulo', numero: "7.3", texto: "Força 3 — a geração anda mais rápido que a rede" },
    { kind: 'paragrafo', html: "A terceira força é de cronograma, e é a mais previsível das três. Uma usina eólica ou solar se constrói em um a dois anos. Uma linha de transmissão leva de cinco a quinze, porque licenciamento, servidão, litígio e execução não comprimem. O descompasso não é falha de planejamento — é diferença estrutural de prazo entre dois tipos de obra que precisam entrar juntos." },
    { kind: 'paragrafo', html: "O rastro é o salto de indicação de obra entre ciclos consecutivos do plano da operação: de aproximadamente 1.260 quilômetros e R$ 7,6 bilhões num ciclo para aproximadamente 5.301 quilômetros e R$ 28,1 bilhões no seguinte. E o rastro histórico é a linha de Roraima: quinze anos entre a recomendação técnica e a energização." },
    { kind: 'paragrafo', html: "<strong>Onde ver:</strong> sumário executivo do plano da operação elétrica de médio prazo, publicado anualmente pelo operador; plano de outorgas de transmissão do ministério; resultados dos leilões de transmissão da agência." },
    { kind: 'titulo', numero: "7.4", texto: "Duas armadilhas de série temporal" },
    { kind: 'paragrafo', html: "Você agora sabe onde estão os dados — isso foi o Módulo 07 — e sabe o que perguntar antes de aceitá-los — isso foi a Aula 01. Falta a última camada, que é onde analista experiente ainda erra." },
    { kind: 'tabela', linhas: [["Armadilha","O que acontece","Como evitar"],["Preliminar tratado como verificado","Dado operativo e resenha mensal são conjunturais e passam por consolidação. O fechamento anual pode divergir do somatório dos meses.","Declarar sempre se o valor é operativo, preliminar ou consolidado. Para série anual, esperar a publicação de fechamento; para monitoramento, usar o mensal sabendo que ele é provisório."],["Emenda de séries de edições diferentes","Metodologia, universo e classificação mudam entre edições. Colar o começo de uma série antiga no fim de uma nova produz um gráfico bonito com um degrau que não existiu na realidade.","Antes de emendar, checar mudança de metodologia declarada na edição nova. Quando houver, usar a série retropolada que a própria fonte publica, ou marcar a quebra explicitamente no gráfico."]] },
    { kind: 'paragrafo', html: "A segunda armadilha tem um exemplo concreto e recente neste próprio bloco: até março de 2024, a série de restrição de geração considerava apenas usinas eólicas; as fotovoltaicas entraram a partir de abril daquele ano. Quem monta o gráfico de 2021 a 2025 sem marcar essa quebra está exibindo, no mesmo eixo, dois universos diferentes — e a inclinação da curva incorpora a mudança de metodologia como se fosse fenômeno físico." },
    { kind: 'titulo', numero: "7.5", texto: "O que sobra quando os números vencerem" },
    { kind: 'paragrafo', html: "Daqui a dezoito meses, praticamente todo valor numérico deste módulo estará desatualizado. É por isso que ele foi escrito assim, e é isso que sobra:" },
    { kind: 'lista', itens: ["Capacidade é estoque de potência, geração é fluxo de energia, e o fator de capacidade é a única ponte entre os dois","Matriz elétrica e matriz energética diferem em cerca de quarenta pontos de renovabilidade, e trocá-las é o erro mais audível da matéria","Todo número de matriz depende de universo, data-base e método, e divergência entre fontes é primeiro hipótese de recorte, só depois hipótese de erro","A ordem das fontes muda entre as duas pizzas, e a direção da mudança é previsível pelo fator de capacidade de cada uma","A complementaridade opera em três escalas independentes, e cada recurso resolve o problema de uma delas e é inútil nas outras","Sobra energia no meio do dia e falta potência no início da noite, e são dois problemas distintos com seis horas de distância","Estoque e fluxo hidrológico são grandezas independentes que podem apontar em direções opostas no mesmo mês","Corte por confiabilidade se resolve com rede; corte por razão energética não se resolve com rede em lugar nenhum","Complementaridade sem capacidade de intercâmbio não se converte em benefício físico","Concessão é ativo com prazo, e processo administrativo em curso nunca se descreve como desfecho","Geração se constrói em anos e transmissão em décadas, e o descompasso é estrutural, não conjuntural"] },
    { kind: 'nota', tom: "neutro", label: "Onde isso entra no produto", html: "Este bloco é o mais diretamente convertível em funcionalidade de todo o currículo, porque a matriz é literalmente aquilo que um terminal de inteligência energética exibe. E a Trava 1 encontra aqui sua fundamentação quantitativa: toda a matéria-prima usada neste módulo é dado público e aberto. Uma nova camada independente consegue reconstruir a matriz brasileira inteira sem contrato de acesso, sem permissão e sem depender de quem também vende energia — o que torna a independência analítica um fato de arquitetura de dados, e não uma promessa de marketing." },
  ],
};

/** Os doze exercícios do § Ex. Nenhum tem TAG de aula: o único que
 *  cita aula o faz em prosa dentro do gabarito ("é o recorte da Aula
 *  01 aplicado ao tempo"), que é referência de conteúdo e não posse —
 *  mesma leitura que a Wave 25 fez no Módulo 05. */
export const MODULO_08_EXERCICIOS_SOLTOS: LessonActivity[] = [
  {
    id: "m08-ex-01",
    kind: 'discursiva' as const,
    prompt: "",
    points: 1,
    config: { tag: "01 · Sem consultar nada: qual fonte tem fatia maior em geração do que em capacidade, e por quê?", gabarito: "Resposta: hidrelétrica, com folga — sobe cerca de dez pontos entre uma pizza e outra. Nuclear também sobe, proporcionalmente ainda mais, mas de uma base pequena. Eólica sobe ligeiramente. Por quê: todas têm fator de capacidade acima da média ponderada do parque. A hidráulica soma recurso abundante e despachabilidade; a nuclear opera como base com o maior fator do parque brasileiro; a eólica tem recurso brasileiro excepcional em comparação internacional. O que a resposta completa acrescenta: a térmica fóssil é a única cuja direção não se prevê sem contexto, porque a fatia dela em geração depende da hidrologia e do custo de combustível daquele ano específico." },
  },
  {
    id: "m08-ex-02",
    kind: 'discursiva' as const,
    prompt: "",
    points: 1,
    config: { tag: "02 · Estime, em ordem e com fatia aproximada, as cinco maiores fontes em capacidade instalada no conceito amplo. Depois as cinco maiores em geração. Quantas trocaram de posição?", gabarito: "Ordem em capacidade: hidrelétrica primeiro, com pouco mais de quarenta por cento; solar em segundo, com cerca de um quarto; térmica agregada em terceiro, perto de vinte por cento; eólica em quarto, na casa dos treze; nuclear em quinto, abaixo de um por cento. Ordem em geração: hidrelétrica primeiro, com cerca de metade; eólica em segundo, na casa dos quinze; solar em terceiro, na casa dos onze; biomassa em torno de oito e gás em torno de oito, disputando o quarto lugar; nuclear em torno de dois. Trocas: a mais importante é solar e eólica invertendo entre segundo e terceiro. A térmica se desagrega em geração — biomassa e fósseis aparecem separadas — o que por si só reordena o meio da tabela. Critério de acerto: a ordem e a ordem de grandeza. Errar o decimal não é erro; errar a ordem ou não explicar a troca é." },
  },
  {
    id: "m08-ex-03",
    kind: 'discursiva' as const,
    prompt: "",
    points: 1,
    config: { tag: "03 · Uma usina de 300 MW gerou 1.200 GWh em um ano. Qual o fator de capacidade, e o que ele sugere sobre a fonte?", gabarito: "Conta: 300 MW × 8.760 h = 2.628 GWh de energia teórica máxima. 1.200 ÷ 2.628 ≈ 45,7% . O que sugere: está na faixa alta de eólica de bom sítio, na faixa típica de hidrelétrica e na faixa alta de biomassa. Está muito acima de solar e muito abaixo de nuclear. O que a resposta completa acrescenta: a conta acima assume que os 300 MW estiveram disponíveis o ano inteiro. Se a usina entrou em operação em julho, o denominador correto é aproximadamente metade, e o fator real dobra. Antes de interpretar qualquer fator de capacidade, pergunte a data de entrada em operação comercial." },
  },
  {
    id: "m08-ex-04",
    kind: 'discursiva' as const,
    prompt: "",
    points: 1,
    config: { tag: "04 · Desenhe de cabeça o perfil de um domingo ensolarado de outubro no sistema. O que acontece em cada um dos quatro patamares?", gabarito: "P1, madrugada: carga baixa, sem sol, eólica possivelmente alta, hidráulica no piso. Praticamente sem corte. P2 da manhã: sol começa a subir, carga ainda baixa porque é domingo. Corte começa a aparecer. P3, meio do dia: a janela crítica. Solar centralizada e distribuída no máximo, carga no mínimo semanal, hidráulica já no piso, térmica inflexível gerando. Corte de geração no pico do ano. P4, início da noite: sol some rápido, carga sobe. Rampa acentuada exigindo hidráulica, térmica, armazenamento e intercâmbio em poucas horas. Corte desaparece. O que a resposta completa acrescenta: o pior dia do sistema não é o mais quente nem o mais frio — é o domingo ensolarado de feriado prolongado, quando oferta máxima e demanda mínima coincidem." },
  },
  {
    id: "m08-ex-05",
    kind: 'discursiva' as const,
    prompt: "",
    points: 1,
    config: { tag: "05 · Alguém afirma que a matriz brasileira é 88% renovável. O que você pergunta antes de aceitar?", gabarito: "As três perguntas, nesta ordem: primeiro, elétrica ou energética — se for energética, o número está errado por quase quarenta pontos. Segundo, capacidade ou geração — os dois percentuais existem e não coincidem. Terceiro, qual ano e qual universo — conceito amplo com distribuída e autoprodução, ou somente centralizada em operação. O que a resposta completa acrescenta: a série anual é declinante nos últimos anos, então um número correto de dois anos atrás está errado hoje. Errar este exercício é a falha mais grave possível neste bloco, porque ele é o bloco inteiro em uma pergunta." },
  },
  {
    id: "m08-ex-06",
    kind: 'discursiva' as const,
    prompt: "",
    points: 1,
    config: { tag: "06 · Dois relatórios mostram a solar com 25% num e 11% noutro, no mesmo ano. Qual está errado?", gabarito: "Provavelmente nenhum. O primeiro é capacidade instalada no conceito amplo; o segundo é geração efetiva. A diferença é exatamente o fator de capacidade da fonte. Como confirmar: verificar unidade — GW contra TWh —, ano-base e universo. Só quando os três coincidirem é que divergência vira erro de uma das fontes." },
  },
  {
    id: "m08-ex-07",
    kind: 'discursiva' as const,
    prompt: "",
    points: 1,
    config: { tag: "07 · A AXIA Energia informa deter 37% das linhas de transmissão do país. Como você lê esse número?", gabarito: "Procure a nota de rodapé antes de reproduzir. No caso concreto, o percentual refere-se ao segmento acima de 230 quilovolts e inclui participações em sociedades de propósito específico — dois qualificadores que mudam o significado da frase. Por que importa: o denominador de participação de mercado divulgada por empresa é quase sempre escolhido, e a escolha é legítima e declarada. O problema nasce quando o qualificador cai na reprodução. A pergunta não é se o número é verdade — é sobre o que ele é verdade." },
  },
  {
    id: "m08-ex-08",
    kind: 'discursiva' as const,
    prompt: "",
    points: 1,
    config: { tag: "08 · Uma reportagem diz que a interligação de Roraima ocorreu em 10 de setembro de 2025. Está certo?", gabarito: "Está certo para uma das cinco perguntas possíveis — é a data da cerimônia de início dos testes de energização. A interligação física efetiva foi em 16 de setembro; a operação comercial começou em outubro; a licença de operação é de 3 de setembro; e para fins de comercialização o sistema passou a ser considerado interligado a partir de 1º de janeiro de 2026, por despacho da agência. O que a resposta completa acrescenta: é o recorte da Aula 01 aplicado ao tempo. Citar a data errada para a pergunta certa não é erro factual — é imprecisão que só quem conhece o assunto percebe, e é exatamente por isso que ela vale a pena evitar." },
  },
  {
    id: "m08-ex-09",
    kind: 'discursiva' as const,
    prompt: "",
    points: 1,
    config: { tag: "09 · A geração hidrelétrica caiu cerca de 5% num ano e a renovabilidade da matriz elétrica caiu 1,4 ponto. O que aconteceu?", gabarito: "Leitura causal: a energia que a água deixou de produzir foi substituída em parte por renováveis variáveis — solar e eólica cresceram no mesmo ano — e em parte por térmica despachável, com destaque para o gás natural, que cresceu mais de vinte por cento. A parcela térmica fóssil da substituição é o que derruba a renovabilidade. O que a resposta completa acrescenta: a renovabilidade não caiu por decisão de política nem por desmonte de renovável. Caiu por hidrologia. É indicador que oscila com a chuva, e ler queda de renovabilidade como retrocesso de transição energética é erro de atribuição de causa." },
  },
  {
    id: "m08-ex-10",
    kind: 'discursiva' as const,
    prompt: "",
    points: 1,
    config: { tag: "10 · Uma série mostra o corte de geração indo de 0,1% em 2021 para cerca de 20% em 2025. O que explica a inclinação?", gabarito: "Três causas somadas, e uma armadilha. Primeira causa: crescimento da capacidade variável em ritmo superior ao da carga e ao da rede, concentrado no Nordeste. Segunda: revisão dos modelos dinâmicos das usinas após uma perturbação relevante de 2023, que reduziu a capacidade de escoamento calculada. Terceira: crescimento acelerado da geração distribuída, que rebaixa a carga líquida sem estar sob comando. A armadilha: até março de 2024 a série considerava apenas usinas eólicas; as fotovoltaicas entraram depois. Parte da inclinação é mudança de universo, não fenômeno. Um gráfico honesto marca a quebra." },
  },
  {
    id: "m08-ex-11",
    kind: 'discursiva' as const,
    prompt: "",
    points: 1,
    config: { tag: "11 · O Nordeste aparece com afluência em 59% da média de longo termo e armazenamento em 89% do volume útil. Como você lê isso?", gabarito: "Estoque alto, fluxo fraco. Está entrando bem menos água que o normal para aquele mês, e ainda há muita energia guardada. É situação confortável no presente e em deterioração se o fluxo não se recuperar. O que a resposta completa acrescenta: nenhuma das duas grandezas isolada permite o diagnóstico. Armazenamento sozinho sugere conforto; afluência sozinha sugere alarme. E há uma terceira dimensão — a posição no ciclo anual: estoque alto entrando no período seco tem significado oposto a estoque alto entrando no período úmido." },
  },
  {
    id: "m08-ex-12",
    kind: 'discursiva' as const,
    prompt: "",
    points: 1,
    config: { tag: "12 · O consumo do mercado regulado caiu 3,5% e o do livre subiu. O consumo brasileiro caiu?", gabarito: "Não. O consumo total na rede cresceu cerca de 0,9% no ano. A queda do regulado é efeito da migração de consumidores para o ambiente livre, que redistribui consumo entre ambientes contábeis sem alterar o consumo físico. O que a resposta completa acrescenta: para medir consumo real, use o total na rede ou o consumo final do balanço, e declare qual dos dois. Para medir dinâmica de mercado, use a repartição por ambiente. Misturar os dois produz a conclusão errada com dado correto — que é o modo mais difícil de errar de detectar." },
  },
];

export const MODULO_08_AULAS: CurriculumAula[] = [
  {
    id: 'aula-08-01',
    moduleId: 'modulo-08',
    number: 1,
    totalInModule: 7,
    title: "Seis pizzas para a mesma pergunta",
    subtitle: "Os três eixos · a aula que vem antes de qualquer número",
    track: 'brasil',
    language: 'pt-BR',
    durationMinutes: null,
    difficulty: null,
    submercados: [],
    competencies: [],
    illustrations: [],
    video: null,
    references: [],
    activities: [],
    // Inst · 02 da fonte. O Inst · 03 é da mesma aula e entra a seguir.
    instruments: M08_INST_02,
  },
  {
    id: 'aula-08-02',
    moduleId: 'modulo-08',
    number: 2,
    totalInModule: 7,
    title: "Seis fontes, dois rankings, uma troca que explica tudo",
    subtitle: "A matriz por fonte · quanto, onde, e por que a ordem muda",
    track: 'brasil',
    language: 'pt-BR',
    durationMinutes: null,
    difficulty: null,
    submercados: [],
    competencies: [],
    illustrations: [],
    video: null,
    references: [],
    activities: [],
    // Inst · 04 da fonte, nas duas rodadas — ver o bloco M08_INST_04 acima.
    instruments: M08_INST_04,
  },
  {
    id: 'aula-08-03',
    moduleId: 'modulo-08',
    number: 3,
    totalInModule: 7,
    title: "A matriz muda de forma três vezes: no ano, no dia e na hora",
    subtitle: "Sazonalidade e complementaridade · três escalas de tempo",
    track: 'brasil',
    language: 'pt-BR',
    durationMinutes: null,
    difficulty: null,
    submercados: [],
    competencies: [],
    illustrations: [],
    video: null,
    references: [],
    activities: [],
    instruments: [],
  },
  {
    id: 'aula-08-04',
    moduleId: 'modulo-08',
    number: 4,
    totalInModule: 7,
    title: "O maior sistema de armazenamento de energia do mundo não tem uma bateria",
    subtitle: "Hidro-dependência · a mesma característica é vantagem e vulnerabilidade",
    track: 'brasil',
    language: 'pt-BR',
    durationMinutes: null,
    difficulty: null,
    submercados: [],
    competencies: [],
    illustrations: [],
    video: null,
    references: [],
    activities: [],
    instruments: [],
  },
  {
    id: 'aula-08-05',
    moduleId: 'modulo-08',
    number: 5,
    totalInModule: 7,
    title: "O recurso está a dois mil quilômetros da carga",
    subtitle: "Transmissão e gargalos · onde a energia trava",
    track: 'brasil',
    language: 'pt-BR',
    durationMinutes: null,
    difficulty: null,
    submercados: [],
    competencies: [],
    illustrations: ["mat-08-gerador-diesel-isolado.png"],
    video: null,
    references: [],
    activities: [],
    instruments: [],
  },
  {
    id: 'aula-08-06',
    moduleId: 'modulo-08',
    number: 6,
    totalInModule: 7,
    title: "Dois casos, um decreto, desfechos opostos",
    subtitle: "Distribuição e consumo · a concessão como ativo com prazo",
    track: 'brasil',
    language: 'pt-BR',
    durationMinutes: null,
    difficulty: null,
    submercados: [],
    competencies: [],
    illustrations: ["mat-03-racks-data-center.png"],
    video: null,
    references: [],
    activities: [],
    instruments: [],
  },
  {
    id: 'aula-08-07',
    moduleId: 'modulo-08',
    number: 7,
    totalInModule: 7,
    title: "Três forças, e o que cada uma já mudou de forma mensurável",
    subtitle: "Síntese · a matriz é fluxo, não foto",
    track: 'brasil',
    language: 'pt-BR',
    durationMinutes: null,
    difficulty: null,
    submercados: [],
    competencies: [],
    illustrations: [],
    video: null,
    references: [],
    activities: [],
    instruments: [],
  },
];

export const getAulaModulo08 = (id: string): CurriculumAula | undefined =>
  MODULO_08_AULAS.find((a) => a.id === id);

// alexandria-instrument-calculators.ts
// A lógica de cálculo dos instrumentos: sete do Módulo 01, nove do Módulo 02.
//
// PORTADA do `<script>` de cada HTML em `Alexandria modulos/`, não
// rederivada. Onde o original faz algo estranho, o comportamento foi
// PRESERVADO e sinalizado em comentário — corrigir matemática que já está
// em produção é decisão de conteúdo, não de código.
//
// O `formula` do tipo `Instrument` é rótulo de exibição ("kWh = kW × h"),
// não expressão executável. O cálculo é este código; nada aqui avalia
// string.
//
// CHAVES: o Módulo 01 ocupa `inst-01`..`inst-06` + `lab-01`; o Módulo 02
// entra namespaçado como `m02-inst-01`..`m02-inst-09`. Sem o prefixo os
// nove sobrescreveriam seis — a fonte numera os instrumentos por módulo,
// reiniciando do 01.

/** Entradas por id de campo → saídas por id de saída.
 *  Saída qualitativa (o `-interp` / `-status` do original) sai em
 *  `veredito`, fora do mapa numérico. */
export type ResultadoInstrumento = {
  valores: Record<string, number>;
  veredito?: string;
};

/** Uma entrada de campo. String é legítima: `InstrumentField.defaultValue`
 *  é `number | string` no contrato da FOUNDRY, e todo campo `kind:'select'`
 *  entrega string — tanto numérica ('500' kV) quanto categórica ('ger').
 *
 *  Era `number` puro até a Wave 18. O Módulo 01 não tem nenhum select, por
 *  isso o buraco nunca apareceu; o Módulo 02 tem seis, e com eles o painel
 *  entregava `undefined` e as saídas nasciam `NaN`/`∞` até o aluno mexer
 *  no controle. */
export type EntradaInstrumento = number | string;

export type CalculateFn = (
  inputs: Record<string, EntradaInstrumento>,
) => ResultadoInstrumento;

/** Coerção numérica. Campo ausente, vazio ou não-numérico vira 0 — o
 *  mesmo que `parseFloat(x) || 0` fazia nos originais. */
const n = (v: EntradaInstrumento | undefined): number => {
  const x = typeof v === 'string' ? Number(v) : v;
  return Number.isFinite(x) ? (x as number) : 0;
};

/** Reproduz o `parseFloat(x) || <fallback>` dos originais, onde ZERO
 *  também cai no fallback. Preservado por fidelidade, não por acordo:
 *  é o que faz campo vazio virar 1 em vez de estado de espera. */
const nOu = (v: EntradaInstrumento | undefined, fallback: number): number => {
  const x = typeof v === 'string' ? Number(v) : v;
  return Number.isFinite(x) && x !== 0 ? (x as number) : fallback;
};

/** Sazonalidade de afluência hidrológica, índice mensal jan→dez.
 *  Literal do `<script>` do Módulo 03 (`var SHAPE`), compartilhada pelos
 *  INST 03 (bateria do Brasil) e INST 04 (reservatório × fio d'água) —
 *  é a mesma chuva caindo nas duas simulações, que é justamente o ponto
 *  pedagógico do comparador. */
const SHAPE_AFLUENCIA = [1.55, 1.55, 1.45, 1.25, 0.85, 0.65, 0.55, 0.5, 0.55, 0.7, 1.0, 1.4];


/** ── Constantes do Módulo 04, literais do <script> da fonte ──
 *
 *  Limites do PLD com citação regulatória no próprio original:
 *  "limites regulatórios vigentes 2026 — ANEEL Despacho 3.850/2025". */
const PLD_MIN = 57.31;
const PLD_MAX_HORARIO = 1611.04;
const PLD_MAX_ESTRUTURAL = 785.27;

/** Consumo de referência das simulações de portfólio (MWh/mês). */
const CONS_M04 = 10000;

/** Sazonalidade de pressão hidrológica do INST 02 (jan→dez). */
const SEAS_M04_PLD = [0.55, 0.5, 0.55, 0.65, 0.85, 1.0, 1.15, 1.25, 1.3, 1.2, 0.95, 0.7];

/** Onda mensal de PLD do INST 05 — desvio em torno da média, em ±R$. */
const WAVE_M04 = [-0.85, -1.0, -0.75, -0.4, 0.1, 0.5, 0.8, 1.0, 0.9, 0.55, 0.05, -0.5];

/** Sazonalidade e rampa de choque do INST 07. */
const SEAS_M04_PORT = [0.75, 0.72, 0.78, 0.85, 1.0, 1.12, 1.22, 1.3, 1.32, 1.2, 1.0, 0.82];
const RAMP_M04 = [0, 0, 0, 0, 0, 0, 0.3, 0.55, 0.8, 1.0, 0.7, 0.35];

/** Preço das três camadas do portfólio (R$/MWh). */
const PL_A_M04 = 330;
const PL_B_M04 = 348;
const PL_C_M04 = 366;

/** Fila de lances do leilão do INST 04 — FIXA na fonte. */
const BIDS_M04 = [
  { nome: 'Solar A', mw: 500, p: 170 },
  { nome: 'Eólica B', mw: 400, p: 195 },
  { nome: 'Hidro C', mw: 150, p: 230 },
  { nome: 'Gás D', mw: 600, p: 265 },
  { nome: 'Biomassa E', mw: 120, p: 280 },
  { nome: 'Térmica F', mw: 300, p: 340 },
];

const MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const clamp04 = (v: number, a: number, b: number) => Math.min(Math.max(v, a), b);

/** Formatadores do original, portados para o veredito sair idêntico. */
const num = (v: number, d = 0) =>
  v.toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const brl = (v: number) => 'R$ ' + Math.round(v).toLocaleString('pt-BR');
const brl2 = (v: number) =>
  'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const mi = (v: number) => {
  const a = Math.abs(v);
  if (a >= 1e9) return 'R$ ' + (v / 1e9).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' bi';
  if (a >= 1e6) return 'R$ ' + (v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 2 }) + ' mi';
  if (a >= 1e3) return 'R$ ' + (v / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 0 }) + ' mil';
  return 'R$ ' + Math.round(v).toLocaleString('pt-BR');
};

export const INSTRUMENT_CALCULATORS: Record<string, CalculateFn> = {
  // ── INST 01 · kWh = kW × h ────────────────────────────────
  // Original: `(parseFloat(kw.value) || 0) * (parseFloat(h.value) || 0)`
  'inst-01': (i) => ({
    valores: { 'i01-out': n(i['i01-kw']) * n(i['i01-h']) },
  }),

  // ── INST 02 · Lei de Ohm ──────────────────────────────────
  // O original resolve a incógnita conforme quais 2 dos 3 campos estão
  // preenchidos, e quando os três estão preenchidos faz checagem de
  // coerência com tolerância de 1%.
  //
  // SINALIZADO, não corrigido: no original os handlers de V e de I
  // limpam `R.value` quando o próprio campo é esvaziado — o handler de R
  // não limpa nada. A assimetria não tem justificativa aparente e some
  // nesta porta, porque aqui a função é pura e não mexe em campo do
  // usuário. O resultado do cálculo é idêntico; só o efeito colateral de
  // limpar campo alheio não foi portado. Decisão de conteúdo se deve
  // voltar.
  'inst-02': (i): ResultadoInstrumento => {
    const V = n(i['i02-v']);
    const I = n(i['i02-i']);
    const R = n(i['i02-r']);
    const temV = V > 0;
    const temI = I > 0;
    const temR = R > 0;
    const preenchidos = [temV, temI, temR].filter(Boolean).length;

    if (preenchidos < 2) return { valores: {}, veredito: 'Aguardando 2 valores...' };

    if (temI && temR && !temV) {
      const v = I * R;
      return { valores: { 'i02-v': v }, veredito: `V = I × R = ${v.toFixed(2)} V` };
    }
    if (temV && temR && !temI) {
      const a = V / R;
      return { valores: { 'i02-i': a }, veredito: `I = V ÷ R = ${a.toFixed(2)} A` };
    }
    if (temV && temI && !temR) {
      const r = V / I;
      return { valores: { 'i02-r': r }, veredito: `R = V ÷ I = ${r.toFixed(3)} Ω` };
    }
    const esperado = I * R;
    const dif = Math.abs(esperado - V) / V;
    return {
      valores: {},
      veredito: dif < 0.01 ? `Coerente: ${V.toFixed(0)} V` : 'Inconsistente — limpe um campo',
    };
  },

  // ── INST 03 · Perdas resistivas ───────────────────────────
  // Original: `P = I * I * R`
  'inst-03': (i) => ({
    valores: { 'i03-out': n(i['i03-i']) ** 2 * n(i['i03-r']) },
  }),

  // ── INST 04 · Demanda média e fator de carga ──────────────
  // Original: Pmed = E/T · FC = Pmed/Pmax, com faixas de interpretação.
  //
  // SINALIZADO, não corrigido: o original usa `parseFloat(h.value) || 1`
  // e `parseFloat(pmax.value) || 1`. Campo vazio vira 1, não zero — então
  // apagar "Horas do período" produz um FC enorme em vez de um estado de
  // espera. Comportamento preservado por fidelidade.
  'inst-04': (i) => {
    const E = n(i['i04-kwh']);
    const T = nOu(i['i04-h'], 1);
    const Pmax = nOu(i['i04-pmax'], 1);
    const Pmed = E / T;
    const FC = Pmax > 0 ? Pmed / Pmax : 0;

    let veredito: string;
    if (FC >= 0.7)
      veredito =
        'Bom aproveitamento da capacidade contratada. Operação contínua, carga estável. Pouca oportunidade em ajuste de demanda — focar em outras frentes (energia, FP, modalidade tarifária).';
    else if (FC >= 0.4)
      veredito =
        'Operação em turnos ou com sazonalidade moderada. Possível oportunidade em gestão de carga e deslocamento operacional, a validar com 12 meses de histórico.';
    else if (FC >= 0.15)
      veredito =
        'Fator de carga baixo: muitos picos altos em relação ao uso médio. Pode indicar partidas simultâneas, operação concentrada em poucas horas ou demanda mal dimensionada — investigar antes de recomendar mudança contratual.';
    else
      veredito =
        'FC muito baixo: padrão raro. Pode indicar erro de medição, contratação superdimensionada, ou operação muito atípica. Recomenda-se auditoria completa antes de qualquer decisão.';

    return { valores: { 'i04-pmed': Pmed, 'i04-fc': FC, 'i04-fcp': FC * 100 }, veredito };
  },

  // ── INST 05 · Triângulo de potência ───────────────────────
  // Original: kva = √(kW² + kVAr²) · fp = kW/kVA · φ = atan2(kvar, kw).
  // A faixa de cor do FP no original: ≥0.92 verde · ≥0.85 ouro · resto
  // vermelho — é o mesmo limiar regulatório de 0,92 da Aula 07.
  'inst-05': (i) => {
    const kw = n(i['i05-kw']);
    const kvar = n(i['i05-kvar']);
    const kva = Math.sqrt(kw * kw + kvar * kvar);
    const fp = kva > 0 ? kw / kva : 1;
    const grausTotais = (Math.atan2(kvar, kw) * 180) / Math.PI;
    return {
      valores: { 'tri-kw': kw, 'tri-kvar': kvar, 'tri-kva': kva, 'tri-fp': fp, 'tri-angulo': grausTotais },
      veredito:
        fp >= 0.92
          ? 'FP dentro do mínimo regulatório de 0,92.'
          : fp >= 0.85
            ? 'FP abaixo de 0,92 — sujeito a cobrança de reativo excedente.'
            : 'FP crítico — cobrança de reativo relevante e kVA exigido bem acima do útil.',
    };
  },

  // ── INST 06 · Fator de capacidade ─────────────────────────
  // Original: FC = geração ÷ (capacidade × horas), com seis faixas.
  //
  // SINALIZADO, não corrigido: mesmo `|| 1` do INST 04 em "horas".
  'inst-06': (i) => {
    const C = n(i['i06-cap']);
    const G = n(i['i06-gen']);
    const T = nOu(i['i06-h'], 1);
    const max = C * T;
    const FC = max > 0 ? G / max : 0;

    let veredito: string;
    if (FC >= 0.85)
      veredito =
        'Faixa típica de nuclear ou térmica a carvão operando como base load. Geração praticamente contínua o ano inteiro.';
    else if (FC >= 0.55)
      veredito =
        'Faixa de térmica de base (carvão, gás natural CCGT) ou hidrelétrica em ano hidrológico favorável.';
    else if (FC >= 0.4)
      veredito =
        'Faixa típica de hidrelétrica brasileira (média anual) ou eólica em região de bom regime de ventos (Nordeste).';
    else if (FC >= 0.25)
      veredito =
        'Faixa típica de eólica em regiões de vento moderado ou solar fotovoltaica com tracker em Nordeste BR.';
    else if (FC >= 0.15)
      veredito =
        'Faixa típica de solar fotovoltaica em latitudes brasileiras. Compare com FCs típicos abaixo.';
    else
      veredito =
        'Fator de capacidade muito baixo — característico de térmica peaker (acionada apenas em horas críticas).';

    return { valores: { 'i06-fc': FC * 100 }, veredito };
  },

  // ── LAB 01 · Comparador de perfil elétrico ────────────────
  // Original, verbatim nos coeficientes:
  //   energia   = (kwh / 1000) * tarifa
  //   demanda   = D * 25
  //   reativo   = FP < 0.92 ? (0.92 - FP) * kwh * 0.4 : 0
  //   adicPonta = energia * (ponta% / 100) * 0.5
  //   total     = soma
  //
  // O próprio original comenta: "Coeficientes didáticos (NÃO usar para
  // cálculos reais de fatura)". Preservado como está e repetido na nota
  // do instrumento, que é o que o aluno lê na tela.
  'lab-01': (i) => {
    const kwh = n(i['lab-kwh']);
    const tarifa = n(i['lab-tarifa']);

    const lado = (p: 'a' | 'b') => {
      const D = n(i[`lab-${p}-dem`]);
      const FP = nOu(i[`lab-${p}-fp`], 1);
      const PCT = n(i[`lab-${p}-ponta`]) / 100;

      const energia = (kwh / 1000) * tarifa;
      const demanda = D * 25;
      const reativo = FP < 0.92 ? (0.92 - FP) * kwh * 0.4 : 0;
      const adicPonta = energia * PCT * 0.5;
      return {
        [`lab-${p}-energia`]: energia,
        [`lab-${p}-demanda`]: demanda,
        [`lab-${p}-reativo`]: reativo,
        [`lab-${p}-adicponta`]: adicPonta,
        [`lab-${p}-total`]: energia + demanda + reativo + adicPonta,
      };
    };

    const a = lado('a');
    const b = lado('b');
    const dif = b['lab-b-total'] - a['lab-a-total'];
    return {
      valores: { ...a, ...b },
      veredito:
        dif === 0
          ? 'Mesmo kWh, mesma fatura — os perfis coincidem.'
          : `Mesmo kWh, diferença de R$ ${Math.abs(Math.round(dif)).toLocaleString('pt-BR')} por mês. O perfil elétrico é a diferença.`,
    };
  },

  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 02 — Como Funciona uma Rede Elétrica (LYCEUM Wave 18)
  //
  // Portados do `<script>` de `alexandria_modulo02.html`. Os nove são
  // vinculados a aula — não há `LAB` solto como no Módulo 01.
  //
  // QUIRK DA FONTE, sinalizado e não corrigido: a numeração `INST · NN`
  // do cabeçalho não bate com o prefixo dos ids internos. INST · 04 usa
  // `i08-*`, INST · 05 usa `i04-*`, INST · 06 usa `i09-*`, INST · 07 usa
  // `i05-*`, INST · 08 usa `i06-*`, INST · 09 usa `i07-*`. É resíduo de
  // reordenação das aulas; os ids internos são o que o script referencia,
  // então são eles que valem aqui.
  // ══════════════════════════════════════════════════════════════════

  // ── M02 · INST 01 · Explorador · Camadas da rede ──────────
  // Consulta pura, sem cálculo: o original só troca texto de seis células
  // conforme a pill ativa. Sem número a devolver, `valores` vai vazio e a
  // camada escolhida sai no veredito. Os seis textos por camada são
  // conteúdo, não cálculo — vivem no HTML e não foram duplicados aqui.
  'm02-inst-01': (i) => ({
    valores: {},
    veredito: String(i['i01-pills'] ?? 'ger'),
  }),

  // ── M02 · INST 02 · Simulador · Perdas na transmissão ─────
  // Original, verbatim:
  //   I    = P·1e6 / (√3 · V·1000 · 0,95)
  //   R    = rk[V] · D          (rk = Ω/km por nível de tensão)
  //   loss = 3 · R · I² / N / 1e6      [MW]
  //   pct  = loss / P · 100
  //   yr   = min(loss,P) · 8760 · 0,55 · 250   [R$/ano]
  'm02-inst-02': (i) => {
    // Ω/km típicos por nível de tensão — tabela literal do original.
    const rk: Record<number, number> = { 138: 0.16, 230: 0.09, 345: 0.045, 500: 0.022, 765: 0.011 };
    const P = n(i['i02-p']);
    const D = n(i['i02-d']);
    const V = n(i['i02-v']);
    const N = n(i['i02-n']) || 1;
    const I = (P * 1e6) / (Math.sqrt(3) * V * 1000 * 0.95);
    const R = (rk[V] ?? 0) * D;
    const loss = (3 * R * I * I) / N / 1e6;
    const pct = P > 0 ? (loss / P) * 100 : 0;
    // O original EXIBE a perda limitada ao bloco transmitido (`lossShown`),
    // mas calcula `pct` com a perda crua — por isso o rótulo "> 100 %"
    // existe. Preservado: o teto é de exibição, não do modelo.
    const lossShown = Math.min(loss, P);
    const yr = lossShown * 8760 * 0.55 * 250;

    let veredito: string;
    if (pct > 30)
      veredito =
        'Inviável. Nessa configuração as perdas consomem a maior parte do bloco — é por isso que essa linha não existe no mundo real. Suba o nível de tensão ou adicione circuitos e veja o quadrado da corrente trabalhar a seu favor.';
    else if (pct > 8)
      veredito =
        'Caro. Perdas acima do razoável para um tronco. Em projeto real, subir a tensão ou adicionar um circuito tende a se pagar só com a energia que deixa de virar calor.';
    else
      veredito =
        'Dentro da faixa de engenharia. Este é o tipo de compromisso capital × perdas que desenhou os troncos reais do SIN.';

    return {
      valores: { 'i02-i': I, 'i02-loss': lossShown, 'i02-pct': pct, 'i02-yr': yr },
      veredito,
    };
  },

  // ── M02 · INST 03 · Cadeia de transformação · por perfil ──
  // O original soma as perdas típicas de cada trecho da cadeia conforme o
  // perfil de consumidor. Os trechos são dado, não cálculo — a soma é a
  // única aritmética. Percentuais literais do original.
  //
  // A própria nota do instrumento avisa: "Percentuais ilustrativos de
  // ordem de grandeza por trecho". Preservados como estão.
  'm02-inst-03': (i) => {
    const base = [0.5, 1.8, 0.4]; // SE elevadora · tronco · SE abaixadora
    const extra: Record<string, number[]> = {
      a2: [0.4],
      a4: [0.8, 0.5, 1.6],
      bt: [0.8, 0.5, 1.6, 1.5, 2.9],
    };
    const perfil = String(i['i03-pills'] ?? 'a2');
    const total = [...base, ...(extra[perfil] ?? extra.a2)].reduce((s, x) => s + x, 0);
    return { valores: { 'i03-total': total }, veredito: perfil };
  },

  // ── M02 · INST 04 · Curva líquida e a rampa do fim da tarde
  // (ids internos `i08-*` — ver quirk no cabeçalho da seção)
  //
  // Original: perfil horário `f[25]` fixo · solar senoidal elevada a 1.5
  // entre 6h e 18h · net = carga − solar. Devolve mínimo da líquida, a
  // maior rampa horária e a solar no pico.
  'm02-inst-04': (i) => {
    const f = [
      0.72, 0.7, 0.68, 0.67, 0.67, 0.68, 0.72, 0.78, 0.84, 0.88, 0.9, 0.91, 0.9,
      0.89, 0.88, 0.88, 0.9, 0.95, 1.0, 0.99, 0.95, 0.9, 0.83, 0.77, 0.72,
    ];
    const pico = nOu(i['i08-pico'], 95);
    const S = n(i['i08-solar']);
    const cond = n(i['i08-ceu']);
    const net: number[] = [];
    for (let h = 0; h <= 24; h++) {
      const L = pico * f[h];
      const s =
        h >= 6 && h <= 18
          ? S * cond * Math.pow(Math.max(0, Math.sin((Math.PI * (h - 6)) / 12)), 1.5)
          : 0;
      net.push(L - s);
    }
    let minNet = Infinity;
    let minH = 0;
    for (let h = 0; h <= 24; h++) if (net[h] < minNet) { minNet = net[h]; minH = h; }
    let rampa = -Infinity;
    let rH = 0;
    for (let h = 0; h < 24; h++) {
      const d = net[h + 1] - net[h];
      if (d > rampa) { rampa = d; rH = h; }
    }
    const solPico = S * cond;

    let veredito: string;
    if (rampa > 10)
      veredito =
        'Rampa crítica. É substituir uma Itaipu de geração em sessenta minutos — hidro flexível, térmicas, baterias e intercâmbios subindo juntos, com o operador contando reserva.';
    else if (minNet < 35)
      veredito =
        'Carga líquida mínima muito baixa. Com inflexibilidades e renovável compulsória, sobra geração no meio do dia: CMO no piso, risco de excesso e de corte de renovável.';
    else if (rampa > 6)
      veredito =
        'Rampa exigente no pôr do sol. Dentro da capacidade do parque flexível, mas é esta janela que valoriza bateria, resposta da demanda e a hidro com reservatório.';
    else
      veredito =
        'Dia tranquilo. Com pouca solar, a curva líquida quase coincide com a total e a transição do fim da tarde é suave.';

    return {
      valores: { 'i08-min': minNet, 'i08-minh': minH, 'i08-rampa': rampa, 'i08-rampah': rH, 'i08-solpico': solPico },
      veredito,
    };
  },

  // ── M02 · INST 05 · Despacho por ordem de mérito ──────────
  // (ids internos `i04-*`)
  //
  // Original: pilha de 10 usinas ordenada por custo; must-run (hidro fio
  // d'água, eólica, solar, nuclear) sempre despachado. Se a demanda for
  // menor que o must-run, corta na ordem solar → eólica → fio d'água e o
  // CMO vai ao piso; senão, empilha até cobrir e a marginal define o CMO.
  //
  // `va` (valor da água) = clamp(650 − 6,2·reservatório, PISO, 650).
  'm02-inst-05': (i) => {
    const PISO = 61;
    const D = n(i['i04-dem']);
    const v = n(i['i04-vento']);
    const s = n(i['i04-sol']);
    const r = n(i['i04-res']);
    const va = Math.max(PISO, Math.min(650, Math.round(650 - 6.2 * r)));

    const stack = [
      { id: 'hfio', name: "Hidro fio d'água", cap: 13, cost: 1, must: true },
      { id: 'eol', name: 'Eólica', cap: (22 * v) / 100, cost: 0, must: true },
      { id: 'sol', name: 'Solar (UFV + MMGD)', cap: (25 * s) / 100, cost: 0, must: true },
      { id: 'nuc', name: 'Nuclear', cap: 2, cost: 30, must: true },
      { id: 'hres', name: 'Hidro reservatório', cap: 42, cost: va, must: false },
      { id: 'gn1', name: 'GN eficiente', cap: 9, cost: 190, must: false },
      { id: 'car', name: 'Carvão', cap: 2.5, cost: 280, must: false },
      { id: 'gn2', name: 'GN flexível', cap: 9, cost: 340, must: false },
      { id: 'ole', name: 'Óleo / diesel', cap: 4.5, cost: 950, must: false },
      { id: 'gnl', name: 'GNL spot / importação', cap: 3, cost: 1200, must: false },
    ].sort((a, b) => a.cost - b.cost);

    const disp: Record<string, number> = {};
    const mustCap = stack.filter((p) => p.must).reduce((t, p) => t + p.cap, 0);
    let marg: (typeof stack)[number] | null = null;
    let cut = 0;
    let deficit = 0;
    let cmo: number;

    if (D <= mustCap) {
      let excess = mustCap - D;
      stack.forEach((p) => { disp[p.id] = p.must ? p.cap : 0; });
      for (const id of ['sol', 'eol', 'hfio']) {
        const c = Math.min(excess, disp[id] ?? 0);
        disp[id] -= c;
        excess -= c;
        cut += c;
      }
      cmo = PISO;
    } else {
      let rem = D;
      stack.forEach((p) => {
        const dd = Math.min(p.cap, rem);
        disp[p.id] = dd;
        if (dd > 1e-9) marg = p;
        rem -= dd;
      });
      deficit = rem > 1e-6 ? rem : 0;
      cmo = marg ? Math.max(PISO, (marg as { cost: number }).cost) : PISO;
    }

    const term = ['gn1', 'car', 'gn2', 'ole', 'gnl'].reduce((t, id) => t + (disp[id] ?? 0), 0);
    const margId = marg ? (marg as { id: string }).id : null;

    let veredito: string;
    if (deficit > 0)
      veredito =
        'Déficit — a pilha esgotou. No mundo real isso é corte de carga: ERAC, racionamento, manchete.';
    else if (cut > 0)
      veredito =
        'Excedente renovável cortado. Geração compulsória maior que a demanda — CMO no piso e curtailment. É a fotografia do Nordeste em madrugada ventosa de baixa carga.';
    else if (margId === 'hres')
      veredito =
        'Hidro na margem — CMO = valor da água. O estado normal do Brasil: o preço não é o custo de queimar combustível hoje, é o custo de não ter água amanhã.';
    else if (margId === 'gn1' || margId === 'car' || margId === 'gn2')
      veredito =
        'Térmica na margem. Estiagem e/ou noite sem vento e sol: cada GW adicional sobe um degrau da pilha. É o regime em que bandeira tarifária e PLD sobem juntos.';
    else if (margId === 'ole' || margId === 'gnl')
      veredito =
        'Topo da pilha — óleo e GNL na margem, padrão de crise hídrica como 2021. O sistema atende, mas a que preço.';
    else veredito = 'Renovável e nuclear cobrem a carga. CMO no piso.';

    return { valores: { 'i04-cmo': cmo, 'i04-term': term, 'i04-cut': cut, 'i04-deficit': deficit }, veredito };
  },

  // ── M02 · INST 06 · Bateria: potência × energia ───────────
  // (ids internos `i09-*`)
  // Original: h = E / P, com `parseFloat(mwEl.value) || 1`.
  //
  // SINALIZADO, não corrigido: o mesmo `|| 1` dos INST 04 e 06 do Módulo
  // 01 — potência vazia vira 1 MW em vez de estado de espera.
  'm02-inst-06': (i) => {
    const P = nOu(i['i09-mw'], 1);
    const E = n(i['i09-mwh']);
    const h = E / P;
    const voc =
      h < 1
        ? 'Regulação rápida · serviços ancilares'
        : h <= 3
          ? 'Corte de pico · arbitragem curta'
          : 'Rampa do fim da tarde · deslocamento de energia';
    const veredito =
      h < 1
        ? 'Tanque curto: potência sem fôlego. Vocação para resposta rápida, não para atravessar o pico. E o princípio de sempre: bateria não gera, desloca.'
        : h <= 3
          ? 'O formato clássico para cortar pico de demanda e arbitrar as horas caras. Bateria não gera — desloca energia do horário em que sobra para o horário em que falta.'
          : 'Perfil de rampa: carrega na barriga solar do meio-dia e descarrega das 17h às 21h. É a logística temporal que a curva líquida pede.';
    return { valores: { 'i09-h': h }, veredito: `${voc} — ${veredito}` };
  },

  // ── M02 · INST 07 · Excursão de frequência ────────────────
  // (ids internos `i05-*`)
  // Original:
  //   rocof = (ΔP/P)·60 / (2H)
  //   nadir = 60 − (ΔP/P)·60·1,8 / (2H)
  //
  // SINALIZADO, não corrigido: a fonte tem DUAS saídas de veredito neste
  // instrumento — um `.readout` rotulado "Veredito" (`i05-status`, texto
  // curto) e um `.verdict` separado (`i05-verdict`, texto longo). Não são
  // duplicata acidental: carregam conteúdo diferente. Ambas preservadas —
  // o texto curto vai em `valores` não é possível (é string), então sai
  // concatenado no veredito, com o rótulo curto na frente.
  'm02-inst-07': (i) => {
    const DP = n(i['i05-dp']);
    const P = nOu(i['i05-carga'], 1);
    const H = n(i['i05-h']);
    const rocof = ((DP / P) * 60) / (2 * H);
    const nadir = 60 - ((DP / P) * 60 * 1.8) / (2 * H);

    let curto: string;
    let longo: string;
    if (nadir < 57.5) {
      curto = 'Colapso parcial';
      longo =
        'Nadir abaixo de 57,5 Hz. Múltiplos estágios de ERAC e risco de colapso parcial — milhões de consumidores desligados automaticamente para salvar o restante.';
    } else if (nadir < 58.5) {
      curto = 'ERAC dispara';
      longo =
        'O afundamento cruza o primeiro estágio (~58,5 Hz): blocos de carga são cortados sem nenhum humano no circuito. O sistema sobrevive sacrificando consumo — é o desenho funcionando, não falhando.';
    } else if (nadir < 59.5) {
      curto = 'Severo, contido';
      longo =
        'Inércia + regulação primária seguram o nadir acima do ERAC; a reserva foi consumida e o CAG recompõe nos minutos seguintes. Margem curta.';
    } else {
      curto = 'Estabilizado';
      longo =
        'Excursão absorvida. A inércia limita o RoCoF, a regulação primária estanca a queda e o CAG devolve o sistema a 60,00 Hz. Rotina de operador.';
    }
    return { valores: { 'i05-rocof': rocof, 'i05-nadir': nadir }, veredito: `${curto} — ${longo}` };
  },

  // ── M02 · INST 08 · Perda embutida na conta ───────────────
  // (ids internos `i06-*`)
  // Original: inj = C / (1 − P) · perd = inj − C · custo = perd · T.
  // O guarda `P < 1` evita divisão por zero quando o percentual chega a
  // 100 %; acima disso o original devolve a própria medição.
  'm02-inst-08': (i) => {
    const C = n(i['i06-c']);
    const P = n(i['i06-p']) / 100;
    const T = n(i['i06-t']);
    const inj = P < 1 ? C / (1 - P) : C;
    const perd = inj - C;
    return { valores: { 'i06-inj': inj, 'i06-perd': perd, 'i06-rs': perd * T } };
  },

  // ── M02 · INST 09 · Dois submercados, um fio ──────────────
  // (ids internos `i07-*`)
  //
  // Original: despacha NE+SE como sistema único; se o fluxo resultante
  // couber no limite do intercâmbio, preço único. Se saturar, resolve o SE
  // isolado e precifica cada lado — é o mecanismo do spread de PLD.
  // Demanda do NE é constante (DNE = 12 GW) no modelo.
  'm02-inst-09': (i) => {
    const PISO = 61;
    const DNE = 12;
    const W = n(i['i07-vento']);
    const DSE = n(i['i07-dse']);
    const L = n(i['i07-lim']);

    const despacha = (stack: { cap: number; cost: number }[], dem: number) => {
      let rem = dem;
      let marg: { cap: number; cost: number } | null = null;
      const disp: number[] = [];
      for (const p of stack) {
        const d = Math.min(p.cap, Math.max(0, rem));
        disp.push(d);
        if (d > 1e-9) marg = p;
        rem -= d;
      }
      return { disp, marg, rem };
    };

    const joint = [
      { cap: W, cost: 0 },
      { cap: 38, cost: 160 },
      { cap: 14, cost: 360 },
      { cap: 8, cost: 480 },
      { cap: 99, cost: 980 },
    ];
    const rj = despacha(joint, DNE + DSE);
    const genNE = rj.disp[0] + rj.disp[3];
    const flow = genNE - DNE;

    let pne: number;
    let pse: number;
    let cut: number;
    let f: number;
    let sat: boolean;

    if (Math.abs(flow) <= L + 1e-9) {
      f = flow;
      sat = false;
      pne = pse = Math.max(PISO, rj.marg ? rj.marg.cost : PISO);
      cut = W - rj.disp[0];
    } else {
      sat = true;
      f = flow > 0 ? L : -L;
      const demNE = Math.max(0, DNE + f);
      if (demNE <= W + 1e-9) {
        cut = W - demNE;
        pne = PISO;
      } else {
        cut = 0;
        const tneed = demNE - W;
        pne = tneed <= 8 + 1e-9 ? 480 : 980;
      }
      const rse = despacha(
        [{ cap: 38, cost: 160 }, { cap: 14, cost: 360 }, { cap: 99, cost: 980 }],
        DSE - f,
      );
      pse = Math.max(PISO, rse.marg ? rse.marg.cost : PISO);
    }

    let veredito: string;
    if (!sat)
      veredito =
        'Intercâmbio com folga: preço único. A usina marginal de um lado precifica os dois — os submercados se comportam como um sistema só.';
    else if (cut > 1e-9)
      veredito =
        'Fio cheio + vento sobrando: corte no NE enquanto o SE despacha térmica. Os preços se separam, o gerador eólico perde receita e a disputa do constrained-off entra em cena.';
    else if (f > 0)
      veredito =
        'Intercâmbio saturado: submercados separados. O NE exporta no limite físico; o SE completa com geração própria mais cara. O spread de PLD é o preço visível do congestionamento.';
    else
      veredito =
        'Vento fraco: o NE importa até o limite. Com o fio saturado no sentido contrário, é o NE que fica caro enquanto o SE segue mais barato. Congestionamento não tem lado fixo.';

    return { valores: { 'i07-ne': pne, 'i07-se': pse, 'i07-flow': f, 'i07-cut': cut }, veredito };
  },

  // ══════════════════════════════════════════════════════════════════
  // MÓDULO 03 — Tecnologias de Geração (LYCEUM Wave 19)
  //
  // Portados do `<script>` de `alexandria_modulo03.html`. Os nove são
  // vinculados a aula. Namespace `m03-` pelo mesmo motivo do `m02-`: a
  // fonte reinicia a numeração `INST · NN` a cada módulo.
  //
  // Aqui a numeração interna BATE com o cabeçalho (INST · 04 usa `i04-*`),
  // ao contrário do Módulo 02, onde estava embaralhada.
  //
  // `SHAPE` — sazonalidade de afluência (índice mensal, jan→dez) usada
  // pelos INST 03 e 04. Literal do original.
  // ══════════════════════════════════════════════════════════════════

  // ── M03 · INST 01 · Matriz nas duas lentes ────────────────
  // Consulta pura: o original só troca a pilha desenhada e o veredito
  // conforme a lente. As participações são conteúdo (vivem no HTML), não
  // cálculo — não duplicadas aqui.
  'm03-inst-01': (i) => ({
    valores: {},
    veredito: String(i['i01-pills'] ?? 'cap'),
  }),

  // ── M03 · INST 02 · FC × energia anual ────────────────────
  // Original: gwh = MW·8760·FC/100/1000 · heq = 8760·FC/100
  //           pct = gwh / 550000 · 100   (550 TWh = consumo anual BR)
  'm03-inst-02': (i) => {
    const MW = n(i['i02-mw']);
    const FC = n(i['i02-fc']);
    const gwh = (MW * 8760 * FC) / 100 / 1000;
    const heq = (8760 * FC) / 100;
    const pct = (gwh / 550000) * 100;
    const veredito =
      FC < 35
        ? 'Perfil de fonte variável. Nenhum é melhor: são produtos diferentes. A pergunta certa nunca é quantos MW — é quantos MWh, quando, e com que firmeza.'
        : FC < 70
          ? 'Faixa de hidro, eólica premium ou térmica bem despachada. Para térmica esse número não é atributo da máquina — é o diário de quantas vezes o sistema precisou dela.'
          : 'Território de base. Só nuclear e térmicas rodando quase sempre vivem aqui.';
    return { valores: { 'i02-gwh': gwh, 'i02-heq': heq, 'i02-pct': pct }, veredito };
  },

  // ── M03 · INST 03 · A bateria do Brasil (EAR) ─────────────
  // Simula 12 meses: geração alvo 1 p.u./mês, estoque limitado a CAPAC=5.
  // Devolve a EAR mínima do ano, o mês em que ocorre e quantos meses
  // ficaram abaixo de 30%.
  'm03-inst-03': (i) => {
    const CAPAC = 5;
    const ena = nOu(i['i03-ena'], 100) / 100;
    let ear = (nOu(i['i03-ear'], 60) / 100) * CAPAC;
    let minP = 999;
    let minM = 0;
    let termM = 0;
    let deficit = 0;
    for (let m = 0; m < 12; m++) {
      const inflow = SHAPE_AFLUENCIA[m] * ena;
      const gen = Math.min(1, ear + inflow);
      if (gen < 0.999) deficit += 1 - gen;
      ear = Math.min(CAPAC, Math.max(0, ear + inflow - gen));
      const pct = (ear / CAPAC) * 100;
      if (pct < minP) { minP = pct; minM = m; }
      if (pct < 30) termM++;
    }
    const veredito =
      deficit > 0.05
        ? 'Estoque zerado: território de racionamento. A bateria do Brasil esvaziou antes da chuva voltar — é o desenho de 2001.'
        : minP < 12
          ? 'O desenho de 2021. O estoque não zera, mas o valor da água dispara e térmicas a CVU altíssimo rodam meses. A bateria salvou o suprimento — cobrando caro.'
          : minP < 30
            ? 'Ano apertado. Térmica pesada para poupar água, preço de curto prazo nervoso — o regime em que o mercado vigia o boletim de ENA toda semana.'
            : 'Ano confortável: a bateria faz o trabalho dela. Carrega na estação úmida, descarrega na seca.';
    return {
      valores: { 'i03-min': minP, 'i03-mes': minM, 'i03-term': termM },
      veredito,
    };
  },

  // ── M03 · INST 04 · Reservatório × fio d'água ─────────────
  // COMPARADOR — estreia do tipo. Um campo, cinco saídas: cabe no modelo.
  // Duas usinas didáticas sob a MESMA afluência: a fio d'água gera o que
  // o rio manda (teto na turbina); a de reservatório tenta sustentar
  // entrega constante usando o estoque.
  'm03-inst-04': (i) => {
    const FIO_CAP = 1.6;
    const RES_CAP = 4;
    const ena = nOu(i['i04-ena'], 100) / 100;
    let fioSum = 0;
    let fioMin = 999;
    let stor = 2.5;
    let firmeMin = 999;
    for (let m = 0; m < 12; m++) {
      const inflow = SHAPE_AFLUENCIA[m] * ena;
      const gFio = Math.min(FIO_CAP, inflow);
      fioSum += gFio;
      if (gFio < fioMin) fioMin = gFio;
      const gRes = Math.min(1, stor + inflow);
      stor = Math.min(RES_CAP, Math.max(0, stor + inflow - gRes));
      if (gRes < firmeMin) firmeMin = gRes;
    }
    const fcFio = (fioSum / 12 / FIO_CAP) * 100;
    const veredito =
      firmeMin < 0.7
        ? 'A seca venceu as duas — de jeitos diferentes. Quando até a usina-bateria falha, o que sobra é térmica, corte e crise: a firmeza tem limite, e o limite é o estoque.'
        : fioMin / FIO_CAP < 0.25
          ? 'Dois produtos, escancarados. A fio d’água vende energia média; a de reservatório vende a certeza — e a certeza é o que falta no sistema pós-2000.'
          : 'Ano bom esconde a diferença. É por isso que matriz se julga no ano ruim — arraste a ENA para baixo e veja os produtos se separarem.';
    return {
      valores: {
        'i04-fcfio': fcFio,
        'i04-minfio': (fioMin / FIO_CAP) * 100,
        'i04-firme': firmeMin * 100,
        'i04-stk': (stor / RES_CAP) * 100,
      },
      veredito,
    };
  },

  // ── M03 · INST 05 · O dia do sistema ──────────────────────
  // Curva de carga horária fixa menos solar (senoidal 6h-18h, fator 0,78)
  // e eólica (perfil horário WFAC). Resíduo negativo vira excedente.
  // A rampa é medida SÓ entre 16h e 21h — janela do pôr do sol.
  'm03-inst-05': (i) => {
    const LOAD = [70,69,68,68,68,69,71,74,77,80,82,83,84,84,84,85,87,92,98,100,97,90,82,75,70];
    const WFAC = [1.15,1.15,1.15,1.15,1.12,1.08,1.0,0.92,0.85,0.8,0.78,0.78,0.8,0.82,0.85,0.9,0.98,1.05,1.1,1.12,1.15,1.15,1.15,1.15,1.15];
    const S = n(i['i05-sol']);
    const W = n(i['i05-eol']);
    const res: number[] = [];
    let exc = 0;
    let minR = 999;
    let minH = 0;
    for (let h = 0; h <= 24; h++) {
      const gs = h >= 6 && h <= 18 ? S * 0.78 * Math.sin((Math.PI * (h - 6)) / 12) : 0;
      const gw = W * WFAC[h];
      let r = LOAD[h] - gs - gw;
      if (r < 0) { if (h < 24) exc += -r; r = 0; }
      res.push(r);
      if (r < minR) { minR = r; minH = h; }
    }
    let rampa = 0;
    for (let h = 16; h < 21; h++) {
      const d = res[h + 1] - res[h];
      if (d > rampa) rampa = d;
    }
    const veredito =
      exc > 1
        ? 'Sobra estrutural: energia sem destino no meio-dia. Preço no piso, vertimento, curtailment — e o mesmo dia ainda cobra a rampa do pôr do sol.'
        : rampa > 9
          ? 'Rampa pesada entre 17h e 20h. A barriga e a rampa são o mesmo fenômeno, visto de horas diferentes.'
          : 'Dia administrável, dentro do que o parque flexível resolve sem drama. Suba a solar e veja a barriga afundar e a rampa empinar.';
    return {
      valores: { 'i05-min': minR, 'i05-minh': minH, 'i05-rampa': rampa, 'i05-exc': exc },
      veredito,
    };
  },

  // ── M03 · INST 06 · Pilha de CVU / ordem de mérito ────────
  // Irmã do INST 05 do Módulo 02, com onze usinas em vez de dez e dois
  // multiplicadores: valor da água (campo) e preço do gás (select, que
  // escala GN-CC, GN-CS e GNL de uma vez).
  'm03-inst-06': (i) => {
    const PISO = 61;
    const D = n(i['i06-dem']);
    const agua = Math.round(nOu(i['i06-agua'], 150));
    const gm = nOu(i['i06-gas'], 1);

    const stack = [
      { id: 'fio', name: "Hidro fio d'água", cap: 13, cost: 1, must: true },
      { id: 'eol', name: 'Eólica', cap: 18, cost: 0, must: true },
      { id: 'sol', name: 'Solar (UFV + MMGD)', cap: 16, cost: 0, must: true },
      { id: 'nuc', name: 'Nuclear', cap: 2, cost: 30, must: true },
      { id: 'hre', name: 'Hidro reservatório', cap: 42, cost: agua, must: false },
      { id: 'bio', name: 'Biomassa (safra)', cap: 8, cost: 160, must: false },
      { id: 'gcc', name: 'GN ciclo combinado', cap: 12, cost: Math.round(180 * gm), must: false },
      { id: 'car', name: 'Carvão', cap: 2.5, cost: 280, must: false },
      { id: 'gcs', name: 'GN ciclo simples', cap: 8, cost: Math.round(380 * gm), must: false },
      { id: 'ole', name: 'Óleo / diesel', cap: 5, cost: 950, must: false },
      { id: 'gnl', name: 'GNL spot', cap: 3, cost: Math.round(1300 * gm), must: false },
    ].sort((a, b) => a.cost - b.cost);

    const disp: Record<string, number> = {};
    const mustCap = stack.filter((p) => p.must).reduce((t, p) => t + p.cap, 0);
    let marg: { id: string; name: string; cost: number } | null = null;
    let cut = 0;
    let deficit = 0;
    let cmo: number;

    if (D <= mustCap) {
      let excess = mustCap - D;
      stack.forEach((p) => { disp[p.id] = p.must ? p.cap : 0; });
      for (const id of ['sol', 'eol', 'fio']) {
        const c = Math.min(excess, disp[id] ?? 0);
        disp[id] -= c;
        excess -= c;
        cut += c;
      }
      cmo = PISO;
    } else {
      let rem = D;
      stack.forEach((p) => {
        const dd = Math.min(p.cap, rem);
        disp[p.id] = dd;
        if (dd > 1e-9) marg = p;
        rem -= dd;
      });
      deficit = rem > 1e-6 ? rem : 0;
      cmo = marg ? Math.max(PISO, (marg as { cost: number }).cost) : PISO;
    }

    const term = ['bio', 'gcc', 'car', 'gcs', 'ole', 'gnl']
      .reduce((t, id) => t + (disp[id] ?? 0), 0);
    const nomeMarg = D <= mustCap
      ? 'Renovável (sobra)'
      : marg ? (marg as { name: string }).name : '—';

    return {
      valores: { 'i06-cmo': cmo, 'i06-term': term, 'i06-cut': cut, 'i06-deficit': deficit },
      veredito: nomeMarg,
    };
  },

  // ── M03 · INST 07 · Bateria MW × MWh ──────────────────────
  // DIMENSIONADOR — estreia do tipo. Três campos numéricos, quatro
  // saídas: cabe no modelo sem nenhuma extensão.
  // Original: E = P·H · carga = E/eff · perda = carga − E.
  'm03-inst-07': (i) => {
    const P = n(i['i07-mw']);
    const H = n(i['i07-h']);
    const eff = nOu(i['i07-eff'], 88) / 100;
    const E = P * H;
    const perda = E / eff - E;
    const voc =
      H < 1
        ? 'Serviços rápidos · regulação'
        : H <= 3
          ? 'Ponta · arbitragem curta'
          : 'Rampa do pôr do sol';
    const veredito =
      H < 1
        ? `${voc} — tanque curto: potência sem fôlego. Vocação para frequência e suavização, o serviço que a perda de inércia valorizou. Mas não atravessa a rampa.`
        : H <= 3
          ? `${voc} — o formato de ponta. Desloca da barriga solar para as horas caras, pagando pedágio em calor. Bateria não gera: cobra frete temporal.`
          : `${voc} — carrega ao meio-dia, descarrega das 17h em diante. Acima disso, o deslocamento longo é território da reversível e do reservatório.`;
    return {
      valores: { 'i07-mwh': E, 'i07-desl': E, 'i07-perda': perda },
      veredito,
    };
  },

  // ── M03 · INST 08 · Comparador de LCOE ────────────────────
  // COMPARADOR com preset. LCOE = CAPEX·CRF/energia + O&M/energia + var,
  // com CRF = r(1+r)^n / ((1+r)^n − 1) e energia = 8,76·FC/100 MWh/kW·ano.
  //
  // SINALIZADO, não corrigido: no original, clicar numa pill TAMBÉM
  // reescreve o campo de FC com o `fc` do preset (`fcEl.value = pr.fc`).
  // Efeito colateral que uma função pura não reproduz — aqui o FC do
  // usuário permanece, e o preset só entra como fallback quando o campo
  // está vazio, que é o que `parseFloat(fcEl.value) || p.fc` faz. Trocar
  // de tecnologia sem mexer no FC portanto compara as duas no MESMO fator
  // de capacidade, que é justamente o "teste-chave" que a nota do
  // instrumento pede. Decisão de conteúdo se o reset deve voltar.
  'm03-inst-08': (i) => {
    const PRESETS: Record<string, { capex: number; fc: number; om: number; vr: number; n: number; label: string }> = {
      solar:   { capex: 3500,  fc: 27, om: 50,  vr: 0,   n: 25, label: 'CAPEX R$ 3.500/kW · O&M R$ 50/kW·a · 25 anos' },
      eolica:  { capex: 5500,  fc: 45, om: 80,  vr: 0,   n: 25, label: 'CAPEX R$ 5.500/kW · O&M R$ 80/kW·a · 25 anos' },
      gas:     { capex: 4500,  fc: 45, om: 120, vr: 250, n: 25, label: 'CAPEX R$ 4.500/kW · combustível R$ 250/MWh · 25 anos' },
      hidro:   { capex: 8000,  fc: 50, om: 90,  vr: 5,   n: 50, label: 'CAPEX R$ 8.000/kW · O&M R$ 90/kW·a · 50 anos' },
      nuclear: { capex: 30000, fc: 88, om: 400, vr: 40,  n: 60, label: 'CAPEX R$ 30.000/kW · O&M R$ 400/kW·a · 60 anos' },
    };
    const tech = String(i['i08-pills'] ?? 'solar');
    const p = PRESETS[tech] ?? PRESETS.solar;
    const fc = nOu(i['i08-fc'], p.fc);
    const r = nOu(i['i08-wacc'], 10) / 100;
    const crf = (r * Math.pow(1 + r, p.n)) / (Math.pow(1 + r, p.n) - 1);
    const energiaMWh = (8.76 * fc) / 100;
    const lcoeCap = (p.capex * crf) / energiaMWh;
    const lcoeOM = p.om / energiaMWh + p.vr;
    const lcoe = lcoeCap + lcoeOM;

    let veredito: string;
    if (tech === 'gas')
      veredito = fc < 25
        ? 'O limite 2 em carne viva: a mesma usina que parecia razoável rodando metade do tempo agora parece um desastre — sem mudar um parafuso. O LCOE de térmica flexível é termômetro do despacho, não do projeto.'
        : 'Arraste o FC para 15% e assista ao LCOE quase dobrar. O custo unitário do gás depende de quantas horas o resto do sistema o deixa rodar. Comparar este número com o da solar é comparar um seguro com uma commodity.';
    else if (tech === 'nuclear')
      veredito = 'Quase tudo é capital. Suba o WACC um ponto e veja dezenas de reais aparecerem do nada: em ativo de CAPEX dominante, juro pesa mais que engenharia.';
    else if (tech === 'solar' || tech === 'eolica')
      veredito = 'O número que venceu os leilões: custo quase todo de capital, combustível zero, FC ditado pelo recurso — não pelo despacho. Mas barato não é sinônimo de suficiente.';
    else
      veredito = 'Hidro grande didática, em 50 anos de vida: o segredo está no n do CRF. A hidro barata do Brasil já foi construída — por isso é legado, não opção de expansão.';

    return {
      valores: {
        'i08-lcoe': lcoe,
        'i08-cap': lcoeCap,
        'i08-cappct': (lcoeCap / lcoe) * 100,
        'i08-om': lcoeOM,
      },
      veredito,
    };
  },

  // ── M03 · INST 09 · Quebra-cabeça sazonal ─────────────────
  // QUEBRA-CABEÇA — estreia do tipo, e o único que exigiu decisão.
  //
  // A fonte usa `src-toggle-row`: QUATRO chaves booleanas independentes
  // (`data-src`), ligadas/desligadas por clique. Não é arrastar, ordenar
  // nem parear — é seleção múltipla. Cada chave entra como um `select` de
  // duas opções ('on'/'off'), que o InstrumentPanel já renderiza. Nenhuma
  // mecânica nova, nenhum componente tocado.
  //
  // O cálculo soma os perfis mensais ponderados das fontes LIGADAS e
  // devolve a razão mês-fraco / mês-forte — o "encaixe" que a aula ensina.
  'm03-inst-09': (i): ResultadoInstrumento => {
    const PROF: Record<string, { w: number; m: number[] }> = {
      hidro:  { w: 50, m: [155,155,145,125,85,65,55,50,55,70,100,140] },
      eolica: { w: 15, m: [68,63,68,78,93,108,128,138,143,133,113,83] },
      solar:  { w: 12, m: [105,100,100,95,90,90,95,105,110,110,105,95] },
      bio:    { w: 6,  m: [20,15,25,80,130,160,170,170,160,140,110,50] },
    };
    const ativas = ['hidro', 'eolica', 'solar', 'bio']
      .filter((k) => String(i[`i09-checks-${k}`] ?? 'off') === 'on');

    if (ativas.length === 0) {
      return {
        valores: {},
        veredito:
          'Ligue ao menos uma fonte. Comece pela hidro sozinha — o Brasil dos anos 1990 — e adicione as outras na ordem em que o país as adicionou.',
      };
    }

    let minV = 1e9;
    let maxV = 0;
    let minM = 0;
    for (let m = 0; m < 12; m++) {
      const s = ativas.reduce((t, k) => t + (PROF[k].w * PROF[k].m[m]) / 100, 0);
      if (s < minV) { minV = s; minM = m; }
      if (s > maxV) maxV = s;
    }
    const ratio = maxV > 0 ? (minV / maxV) * 100 : 0;
    const veredito =
      ratio < 40
        ? 'Time de um jogador: era a matriz quase-só-hidro, com a diferença atravessada com reservatório e reza. Adicione a eólica e veja o vale começar a se erguer.'
        : ratio < 55
          ? 'O encaixe começou. O vento do 2º semestre preenche exatamente os meses em que a ENA some. Falta a peça da seca profunda — ligue a biomassa.'
          : 'Portfólio trabalhando: o vale subiu sem ninguém construir uma usina a mais. É a complementaridade convertendo perfis em firmeza estatística.';
    return { valores: { 'i09-ratio': ratio, 'i09-vale': minM }, veredito };
  },

  // ══════════════════════════════════════════════════════════
  // MÓDULO 04 — Economia de Mercados de Energia
  //
  // PORTADOS do <script> de `alexandria_modulo04.html`, não
  // rederivados. Namespaçados `m04-` pelo mesmo motivo dos Módulos
  // 02-03: a fonte numera instrumentos por módulo, reiniciando do 01.
  //
  // Os IDS DE CAMPO carregam sufixo `-n`: a fonte pareia cada controle
  // com um <input type="range"> gêmeo, e o `InstrumentField` extraído
  // guarda o id do <input type="number">, que é quem tem
  // value/min/max/step. O script original lê o range (`i1-d`); aqui os
  // dois são o mesmo campo lógico, então lemos `i1-d-n`.
  //
  // AS SEIS SAÍDAS TEXTUAIS da fonte (usina marginal, mês crítico,
  // limite aplicado, mês mais barato/caro, pior mês) não entram em
  // `valores` — `Record<string, number>` não as comporta. Elas
  // sobrevivem no veredito, que é onde o original já as narrava.
  // ══════════════════════════════════════════════════════════

  // ── m04 INST 01 · Formador de preço ───────────────────────
  // Despacho por ordem de mérito: ordena a frota por CVU, atende a
  // demanda em fila, e o preço é o CVU da ÚLTIMA usina chamada.
  // O valor da água é função inversa do reservatório — é o que faz o
  // mesmo parque produzir preços diferentes com a mesma demanda.
  'm04-inst-01': (i) => {
    const D = n(i['i1-d-n']);
    const R = n(i['i1-r-n']) / 100;
    const Hh = n(i['i1-h-n']);
    const G = n(i['i1-g-n']);
    const agua = 30 + ((100 - Hh) / 100) * 320;
    const frota = [
      { nome: 'Solar', cap: 200 * R, cvu: 0 },
      { nome: 'Eólica', cap: 300 * R, cvu: 12 },
      { nome: 'Hidráulica', cap: 350, cvu: agua },
      { nome: 'Gás', cap: 400, cvu: G },
      { nome: 'Óleo', cap: 250, cvu: 900 },
    ].sort((a, b) => a.cvu - b.cvu);
    let resto = D;
    let price = 0;
    for (const f of frota) {
      const usa = Math.min(f.cap, resto);
      resto -= usa;
      if (usa > 0.001) price = f.cvu;
    }
    const def = Math.max(0, resto);
    if (def > 0.001) price = PLD_MAX_HORARIO;
    // Piso e teto do original, nesta ordem — o piso vence o teto quando
    // ambos poderiam se aplicar, porque é o primeiro ramo do if/else.
    if (price < PLD_MIN) price = PLD_MIN;
    else if (price > PLD_MAX_HORARIO) price = PLD_MAX_HORARIO;
    return {
      valores: { 'i1-p': price, 'i1-def': def },
      veredito: ((): string => {
    if (def>0.001) return `Déficit de ${num(def)} MW: a capacidade disponível não atende a carga. O preço vai ao teto horário e o problema deixa de ser econômico — passa a ser de segurança de suprimento.`;
    if (price<=120) return `Sistema folgado. A margem entre a usina marginal e as usinas baratas é pequena, e quem está no fim da fila captura pouca margem inframarginal. Bom para o consumidor exposto; ruim para quem precisa recuperar custo fixo vendendo energia.`;
    if (price<=400) return `Sistema em atenção. A térmica ou a hidráulica cara já está na margem. Neste patamar, a diferença entre estar contratado e estar exposto começa a aparecer no orçamento mensal.`;
    return `Sistema pressionado. Recurso caro na margem. Toda energia descoberta é liquidada perto deste valor — e é exatamente aqui que a decisão de contratação tomada meses atrás mostra se foi boa.`;
      })(),
    };
  },

  // ── m04 INST 02 · PLD ao longo do ano ─────────────────────
  // Pressão hidrológica ponderada (ENA 50%, EAR 35%, carga 15%),
  // modulada pela sazonalidade e elevada a 2,2 — a não-linearidade é
  // o que faz o PLD disparar no fim do período seco.
  'm04-inst-02': (i) => {
    const E = n(i['i2-e-n']);
    const A = n(i['i2-a-n']);
    const C = n(i['i2-c-n']);
    const pE = clamp04((110 - E) / 70, 0, 1);
    const pA = clamp04((80 - A) / 70, 0, 1);
    const pC = clamp04((C + 5) / 15, 0, 1);
    const pres = 0.5 * pE + 0.35 * pA + 0.15 * pC;
    let soma = 0;
    let mx = -1;
    let mxi = 0;
    for (let m = 0; m < 12; m++) {
      const p = clamp04(pres * SEAS_M04_PLD[m], 0, 1);
      const pld = clamp04(
        PLD_MIN + (PLD_MAX_HORARIO - PLD_MIN) * Math.pow(p, 2.2),
        PLD_MIN,
        PLD_MAX_HORARIO,
      );
      soma += pld;
      if (pld > mx) { mx = pld; mxi = m; }
    }
    const med = soma / 12;
    return {
      // 730 h = média de horas por mês. O original rotula esta saída
      // '1 MW médio descoberto': é o custo mensal de deixar 1 MW médio
      // exposto ao pico do ano.
      valores: { 'i2-p': med, 'i2-max': mx, 'i2-x': mx * 730 },
      veredito: ((): string => {
    if (mx<=120) return `Ano confortável do começo ao fim. O preço fica baixo mesmo no seco, e a tentação de reduzir contratação aumenta. Registre a tentação: é exatamente aqui que se assinam as subcontratações que doem dois anos depois.`;
    if (mx<=350) return `Pico em ${MES[mxi]} a ${brl(mx)}/MWh. O modelo já está preservando água e chamando térmica no seco. Um megawatt médio descoberto custa ${mi(mx*730)} no mês crítico — a conta cresce mais rápido que a percepção.`;
    if (mx<=PLD_MAX_ESTRUTURAL) return `Escassez precificada, com pico em ${MES[mxi]}. Quem está descoberto sente no caixa. Repare que o preço ainda está abaixo do teto estrutural: o limite regulatório ainda não é o que está segurando o número.`;
    return `Estresse severo: o pico de ${MES[mxi]} passa do teto estrutural de R$ 785,27, e o ajuste regulatório sobre a média do período entra em cena. Este é o território onde o mercado só-de-energia deveria pagar a capacidade — e onde o teto impede que ele pague.`;
      })(),
    };
  },

  // ── m04 INST 03 · O dinheiro que falta ────────────────────
  // Missing money: receita de energia contra custo fixo anual. O gap é
  // exatamente o que um mercado de capacidade precisaria pagar.
  'm04-inst-03': (i) => {
    const P = n(i['i3-p-n']);
    const Hh = n(i['i3-h-n']);
    const M = n(i['i3-m-n']);
    const F = n(i['i3-f-n']);
    const rec = P * Hh * M;
    const cst = P * 1000 * F;
    const gap = cst - rec;
    const need = gap > 0 ? gap / (P * 1000) : 0;
    const fc = (Hh / 8760) * 100;
    return {
      valores: { 'i3-r': rec, 'i3-c': cst, 'i3-g': gap > 0 ? gap : 0, 'i3-k': need },
      veredito: ((): string => {
    if (gap<=0) return `A receita de energia cobre o custo fixo. Repare no que foi preciso: ${num(Hh)} horas de despacho, um fator de capacidade de ${fc.toFixed(1)}%, com margem de R$ ${num(M)}/MWh. Um ativo com esse perfil não é uma usina de ponta — é uma usina de base disfarçada.`;
    if (need<80) return `Falta ${mi(gap)}. O gap é pequeno diante do custo fixo, e um prêmio de capacidade de R$ ${num(need)}/kW-ano fecharia a conta. É a faixa em que o debate de desenho de mercado costuma acontecer — nem óbvio, nem impossível.`;
    return `Falta ${mi(gap)}. Vendendo só energia, este ativo não existe: nenhum banco financia e nenhum acionista aporta. Seriam necessários R$ ${num(need)}/kW-ano de receita de disponibilidade para viabilizá-lo. Este número tem nome — é o missing money, e é a razão de existir dos leilões de reserva de capacidade.`;
      })(),
    };
  },

  // ── m04 INST 04 · Sala do leilão reverso ──────────────────
  // Fila de lances FIXA na fonte — o aluno move só demanda e preço-teto.
  // O ponto pedagógico é a distância entre preço de corte (o que todos
  // recebem) e preço médio por lance.
  'm04-inst-04': (i) => {
    const D = n(i['i4-d-n']);
    const T = n(i['i4-t-n']);
    let resto = D;
    let corte = 0;
    let somaRS = 0;
    let somaMW = 0;
    let barrado = 0;
    for (const b of BIDS_M04) {
      if (b.p > T) { barrado += b.mw; continue; }
      if (resto > 0) {
        const take = Math.min(b.mw, resto);
        resto -= take;
        corte = b.p;
        somaRS += take * b.p;
        somaMW += take;
      }
    }
    const med = somaMW > 0 ? somaRS / somaMW : 0;
    const falta = Math.max(0, resto);
    return {
      valores: { 'i4-q': somaMW, 'i4-c': corte, 'i4-m': med, 'i4-f': falta },
      veredito: ((): string => {
    if (somaMW===0 && D>0) return `Nada contratado. O teto do edital ficou abaixo de todas as propostas e o leilão saiu deserto. Acontece de verdade: teto mal calibrado não reduz preço — devolve o problema inteiro para o planejador, um ano depois e mais caro.`;
    if (somaMW===0) return `Demanda zero, nada a contratar. Suba a quantidade demandada para ver a fila de propostas se formar.`;
    if (falta>0 && barrado>=falta) return `Demanda não atendida em ${num(falta)} MW, com ${num(barrado)} MW de oferta barrados pelo teto. Do ponto de vista tarifário, o teto protegeu o consumidor; do ponto de vista de suprimento, deixou um buraco que reaparece no certame seguinte — em geral mais caro, porque a urgência aumentou.`;
    if (falta>0) return `Demanda não atendida em ${num(falta)} MW por insuficiência de oferta: mesmo contratando tudo que apareceu, não deu. Isso não é problema de preço-teto — é sinal de que o produto demandado não atraiu projetos suficientes, e a resposta está no desenho do edital.`;
    return `Contratado integralmente. Preço de corte ${brl(corte)}/MWh, preço médio por lance ${brl2(med)}/MWh — uma diferença de ${brl2(corte-med)} por MWh. Se o edital liquidar por preço uniforme, todos recebem o corte e essa diferença migra do bolso do consumidor para o do gerador. É a regra do edital, não a teoria, que decide isso.`;
      })(),
    };
  },

  // ── m04 INST 05 · Contrato × spot em 12 meses ─────────────
  // Parcela contratada a preço fixo + parcela exposta ao PLD ondulado.
  // A média mal se move quando a amplitude cresce — é esse o ponto.
  'm04-inst-05': (i) => {
    const C = n(i['i5-c-n']) / 100;
    const P = n(i['i5-p-n']);
    const L = n(i['i5-l-n']);
    const S = n(i['i5-s-n']);
    const fix = C * P * CONS_M04;
    let soma = 0;
    let mx = -1;
    let mn = 1e18;
    let mxi = 0;
    for (let m = 0; m < 12; m++) {
      const pld = clamp04(L + S * WAVE_M04[m], PLD_MIN, PLD_MAX_HORARIO);
      const t = fix + (1 - C) * pld * CONS_M04;
      soma += t;
      if (t > mx) { mx = t; mxi = m; }
      if (t < mn) mn = t;
    }
    const med = soma / 12;
    const amp = mx - mn;
    return {
      valores: { 'i5-a': med, 'i5-r': amp },
      veredito: ((): string => {
    if (C>=0.999) return `Cem por cento contratado. A volatilidade some — e no lugar dela entra o risco de sobrecontratação: se a produção cair, a sobra é liquidada a preço que a empresa não escolhe. Proteção total contra um risco costuma ser exposição total a outro.`;
    if (amp<=400000) return `Amplitude anual de ${mi(amp)} entre o melhor e o pior mês. Absorvível pelo caixa da maioria das operações industriais — é a faixa em que a flexibilidade da exposição residual compra mais valor do que custa.`;
    if (amp<=1500000) return `Amplitude anual de ${mi(amp)}. Esse número precisa caber na política de risco por escrito, e não apenas na expectativa de quem assinou o contrato. Repare que a média mal se moveu: o que mudou foi a dispersão.`;
    return `Amplitude anual de ${mi(amp)}, com pior mês em ${MES[mxi]}. Nada garante que os meses ruins não se agrupem. Se essa variação não cabe no orçamento, a discussão não é de preço — é de política de contratação.`;
      })(),
    };
  },

  // ── m04 INST 06 · Mesa de hedge · swap simples ────────────
  // O swap paga a diferença entre PLD realizado e preço fixo. Volume
  // travado ACIMA do consumo deixa de ser hedge e vira posição
  // direcional — é o que o veredito do original denuncia.
  'm04-inst-06': (i) => {
    const F = n(i['i6-f-n']);
    const P = n(i['i6-p-n']);
    const V_ = n(i['i6-v-n']);
    const pay = (P - F) * V_;
    const semH = CONS_M04 * P;
    const comH = semH - pay;
    const efe = comH / CONS_M04;
    return {
      valores: { 'i6-r': pay, 'i6-a': semH, 'i6-b': comH, 'i6-u': efe },
      veredito: ((): string => {
        const V = V_;
        const CONS = CONS_M04;
    if (V>CONS+0.5) return `Volume travado acima do consumo. Os ${num(V-CONS)} MWh excedentes não protegem nada — são posição direcional pura. Se o PLD cair, essa parcela gera prejuízo sem nenhuma perda física do outro lado para compensar. Isso deixou de ser hedge.`;
    if (V===0) return `Sem proteção. O custo efetivo é o PLD realizado, seja ele qual for. Perfeitamente legítimo — desde que seja uma decisão registrada na política de risco, e não o resultado de ninguém ter decidido nada.`;
    if (P>F) return `O PLD subiu acima do preço travado. O swap devolveu ${mi(pay)}, reduzindo o custo efetivo para ${brl2(efe)}/MWh contra ${brl2(P)}/MWh sem proteção. Foi para este cenário que o hedge foi contratado.`;
    if (P<F) return `O PLD ficou abaixo do preço travado. O swap custou ${mi(Math.abs(pay))} e o custo efetivo subiu para ${brl2(efe)}/MWh. Isso não é um erro: é o preço do seguro num ano em que não houve sinistro. A pergunta correta é se a previsibilidade valeu esse valor, não se o mercado caiu.`;
    return `PLD igual ao preço travado. Resultado nulo no swap — o cenário exato em que o hedge não muda nada, e o único em que ele não tem opinião.`;
      })(),
    };
  },

  // ── m04 INST 07 · Portfólio em camadas ────────────────────
  // Três camadas de preço crescente + exposição residual. Somar mais de
  // 100% gera sobrecontratação, que a fonte trata como CRÉDITO ao PLD —
  // comprar caro para revender barato, todo mês.
  'm04-inst-07': (i) => {
    const A = n(i['i7-a-n']);
    const B = n(i['i7-b-n']);
    const Cc = n(i['i7-c-n']);
    const S = n(i['i7-s-n']);
    const soma = A + B + Cc;
    const over = Math.max(0, soma - 100);
    const resid = Math.max(0, 100 - soma);
    const custoFixo = ((A * PL_A_M04 + B * PL_B_M04 + Cc * PL_C_M04) / 100) * CONS_M04;
    let acc = 0;
    let mx = -1;
    let mn = 1e18;
    let mxi = 0;
    for (let m = 0; m < 12; m++) {
      const pld = clamp04(
        200 * SEAS_M04_PORT[m] * (1 + (S / 100) * RAMP_M04[m]),
        PLD_MIN,
        PLD_MAX_HORARIO,
      );
      const t = custoFixo + (resid / 100) * pld * CONS_M04 - (over / 100) * pld * CONS_M04;
      acc += t;
      if (t > mx) { mx = t; mxi = m; }
      if (t < mn) mn = t;
    }
    const med = acc / 12;
    const unit = med / CONS_M04;
    return {
      // O original imprime −over quando há sobrecontratação, e resid
      // quando não há. Mesmo sinal preservado.
      valores: { 'i7-e': over > 0 ? -over : resid, 'i7-m': med, 'i7-r': mx - mn },
      veredito: ((): string => {
    if (over>0) return `As camadas somam ${num(soma)}% do consumo: há ${num(over)}% de sobrecontratação estrutural. Todo mês a empresa compra energia a preço de contrato e revende a sobra ao PLD — em geral mais baixo. O custo efetivo sobe para ${brl2(unit)}/MWh mesmo tendo "travado" preço. Contratar demais não é prudência: é comprar caro para revender barato, todo mês, por contrato.`;
    if (resid===0) return `Cem por cento contratado, exposição zero. O custo é perfeitamente previsível em ${brl2(unit)}/MWh — e perfeitamente rígido. Qualquer queda de produção vira sobrecontratação imediata. Previsibilidade total é uma escolha, não um ótimo.`;
    if (resid<=15) return `Exposição residual de ${num(resid)}%, com amplitude anual de ${mi(mx-mn)}. Custo médio de ${brl2(unit)}/MWh. É a faixa em que a folga absorve variação operacional sem transformar o orçamento em aposta — o desenho que a maioria das políticas de risco industriais persegue.`;
    if (resid<=35) return `Exposição de ${num(resid)}% e amplitude anual de ${mi(mx-mn)}. Ainda gerenciável, mas o pior mês (${MES[mxi]}) já custa ${mi(mx)}. Verifique se esse valor cabe no limite financeiro da política, e não apenas no limite percentual — são critérios diferentes e um não garante o outro.`;
    return `Exposição de ${num(resid)}%: a maior parte do custo de energia desta empresa é decidida pelo mercado, não por ela. Amplitude anual de ${mi(mx-mn)}, pior mês em ${MES[mxi]} a ${mi(mx)}. Isso é uma posição direcional em preço de energia assumida por quem não vive de negociar energia.`;
      })(),
    };
  },

};

export const temCalculadora = (id: string) => id in INSTRUMENT_CALCULATORS;

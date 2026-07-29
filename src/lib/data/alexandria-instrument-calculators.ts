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

export type CalculateFn = (inputs: Record<string, number>) => ResultadoInstrumento;

const n = (v: number | undefined) => (Number.isFinite(v) ? (v as number) : 0);

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
    const V = i['i02-v'];
    const I = i['i02-i'];
    const R = i['i02-r'];
    const temV = Number.isFinite(V) && V > 0;
    const temI = Number.isFinite(I) && I > 0;
    const temR = Number.isFinite(R) && R > 0;
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
    const T = i['i04-h'] || 1;
    const Pmax = i['i04-pmax'] || 1;
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
    const T = i['i06-h'] || 1;
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
      const FP = i[`lab-${p}-fp`] || 1;
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
    const pico = i['i08-pico'] || 95;
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
    const P = i['i09-mw'] || 1;
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
    const P = i['i05-carga'] || 1;
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
};

export const temCalculadora = (id: string) => id in INSTRUMENT_CALCULATORS;

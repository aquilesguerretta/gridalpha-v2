// alexandria-instrument-calculators.ts
// A lógica de cálculo dos sete instrumentos do Módulo 01.
//
// PORTADA do `<script>` de `Alexandria modulos/alexandria_modulo01.html`
// (linhas 2720-3070), não rederivada. Onde o original faz algo estranho,
// o comportamento foi PRESERVADO e sinalizado em comentário — corrigir
// matemática que já está em produção é decisão de conteúdo, não de código.
//
// O `formula` do tipo `Instrument` é rótulo de exibição ("kWh = kW × h"),
// não expressão executável. O cálculo é este código; nada aqui avalia
// string.

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
  'inst-02': (i) => {
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
};

export const temCalculadora = (id: string) => id in INSTRUMENT_CALCULATORS;

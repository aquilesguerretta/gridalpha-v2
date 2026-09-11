import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  Crosshair,
  Database,
  Moon,
  Search,
  Sun,
  X,
} from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BRASIL_OUTLINE_D,
  BRASIL_VIEWBOX,
  SUBMERCADOS,
} from "../../lib/geo/brasil-outline";
import { Wordmark } from "../../components/g2/Brand";
import {
  describeSeries,
  formatValue,
  getSeries,
  METRICS,
  REGIONS,
  SAMPLE_VERSION,
  sampleCsv,
  SOURCE_RECORDS,
} from "./sample";
import type { MetricId, Observation, PeriodId, RegionId } from "./sample";
import "../../components/g2/g2.css";
import "../../components/g2/g21-fonts.css";
import "./terminal-brasil.css";

interface TerminalBrasilProps {
  compact?: boolean;
}

const periodNames: Record<PeriodId, string> = {
  "24h": "10 SET 2026 · HORÁRIO",
  "7d": "04 — 10 SET 2026 · DIÁRIO",
  "30d": "12 AGO — 10 SET 2026 · DIÁRIO",
};

const questions: Record<MetricId, { hypothesis: string; check: string }[]> = {
  price: [
    {
      hypothesis: "Uma mudança na oferta poderia explicar este movimento.",
      check:
        "Examinar disponibilidade de geração, despacho e intercâmbio na mesma janela. Uma curva de preço sozinha não distingue esses efeitos.",
    },
    {
      hypothesis:
        "A diferença entre regiões pode sugerir uma restrição de transmissão.",
      check:
        "Confrontar limites e fluxos reais de intercâmbio antes de atribuir o afastamento a uma restrição. Os ajustes desta amostra foram escritos no código.",
    },
    {
      hypothesis:
        "Um valor mais alto pode coincidir com uma mudança na demanda.",
      check:
        "Comparar carga, geração marginal e condições hidrológicas. Coincidência temporal é um ponto de partida, não uma conclusão.",
    },
  ],
  load: [
    {
      hypothesis: "O calendário de atividade pode explicar parte do movimento.",
      check:
        "Separar dias úteis, feriados e efeitos de temperatura. Esta amostra não inclui essas variáveis.",
    },
    {
      hypothesis: "Uma alteração de temperatura poderia elevar a demanda.",
      check:
        "Comparar observações meteorológicas e carga por hora, preservando fuso e cobertura. A série sintética não permite testar essa hipótese.",
    },
    {
      hypothesis: "Um patamar maior pode tornar a oferta menos flexível.",
      check:
        "Verificar reserva disponível, disponibilidade de usinas e intercâmbio. Carga elevada, isoladamente, não demonstra escassez.",
    },
  ],
  storage: [
    {
      hypothesis: "Uma redução de afluências poderia contribuir para a queda.",
      check:
        "Examinar energia natural afluente, armazenamento e defluência na mesma base. O percentual da amostra não contém essas relações.",
    },
    {
      hypothesis:
        "O despacho hidrelétrico pode alterar o ritmo de armazenamento.",
      check:
        "Confrontar geração e balanço hídrico. Um recuo de armazenamento não revela, por si, o motivo do despacho.",
    },
    {
      hypothesis: "Uma janela mais longa pode mudar a leitura da reserva.",
      check:
        "Comparar sazonalidade e séries históricas reais. Percentuais iguais em épocas distintas não significam condições equivalentes.",
    },
  ],
};

function SeriesTooltip({
  active,
  payload,
  metric,
}: {
  active?: boolean;
  payload?: readonly { payload?: Observation }[];
  metric: MetricId;
}) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className="g2t-tooltip">
      <span>{point.label} · AMOSTRA</span>
      <strong>
        {formatValue(point.value, metric)} <small>{METRICS[metric].unit}</small>
      </strong>
    </div>
  );
}

function RegionalTrace({ series, selectedIndex }: { series: Observation[]; selectedIndex: number }) {
  const low = Math.min(...series.map((point) => point.value));
  const high = Math.max(...series.map((point) => point.value));
  const coordinate = (point: Observation) => [
    2 + (point.index / (series.length - 1)) * 72,
    24 - ((point.value - low) / (high - low || 1)) * 20,
  ];
  const selected = coordinate(series[Math.min(selectedIndex, series.length - 1)]);
  return (
    <svg className="g2t-region-trace" viewBox="0 0 76 28" aria-hidden="true">
      <polyline points={series.map((point) => coordinate(point).join(",")).join(" ")} />
      <circle cx={selected[0]} cy={selected[1]} r="2" />
    </svg>
  );
}

function TerminalBrasil({ compact = false }: TerminalBrasilProps) {
  useEffect(() => {
    if (compact) return;
    const previousTitle = document.title;
    document.title = "Terminal Brasil — NIVAR · Ambiente demonstrativo";
    return () => {
      document.title = previousTitle;
    };
  }, [compact]);
  const [region, setRegion] = useState<RegionId>("sudesteCentroOeste");
  const [period, setPeriod] = useState<PeriodId>("24h");
  const [metric, setMetric] = useState<MetricId>("price");
  const [sourceMode, setSourceMode] = useState<"sample" | "unavailable">(
    "sample",
  );
  const [tone, setTone] = useState<"graphite" | "paper">("graphite");
  const [eventIndex, setEventIndex] = useState(1);
  const [probeIndex, setProbeIndex] = useState<number | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [sourceSearch, setSourceSearch] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const WorkspaceElement = compact ? "div" : "main";
  const dialogRef = useRef<HTMLDialogElement>(null);
  const id = useId().replace(/:/g, "");
  const isSample = sourceMode === "sample";
  const regionInfo = REGIONS.find((r) => r.id === region)!;
  const metricInfo = METRICS[metric];
  const series = useMemo(
    () => getSeries(region, period, metric),
    [region, period, metric],
  );
  const summary = useMemo(
    () => describeSeries(series, metric),
    [series, metric],
  );
  const eventPoints = [0.3, 0.6, 0.82].map(
    (fraction) => series[Math.round((series.length - 1) * fraction)],
  );
  const selectedPoint = eventPoints[eventIndex];
  const inspectedPoint = series[Math.min(probeIndex ?? selectedPoint.index, series.length - 1)];
  const selectedMarket = SUBMERCADOS.find((market) => market.id === region)!;
  const question = questions[metric][eventIndex];
  const normalizedSearch = sourceSearch
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  const filteredSources = SOURCE_RECORDS.filter((record) =>
    `${record.kind} ${record.title} ${record.text} ${record.detail}`
      .toLocaleLowerCase("pt-BR")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .includes(normalizedSearch),
  );
  const metricName =
    metric === "price"
      ? "O preço"
      : metric === "load"
        ? "A carga"
        : "A reserva";
  const direction =
    summary.change > 0
      ? "avança"
      : summary.change < 0
        ? "recua"
        : "permanece estável";

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  function selectEvent(index: number) {
    setEventIndex(index);
    setProbeIndex(null);
  }

  function openSources() {
    setSourceSearch("");
    dialogRef.current?.showModal();
  }

  function exportCsv() {
    if (!isSample) return;
    const blob = new Blob([sampleCsv(region, period, metric)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `NIVAR-AMOSTRA-${region}-${metric}-${period}.csv`;
    anchor.hidden = true;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 5000);
    setAnnouncement(
      `CSV demonstrativo de ${regionInfo.name}, ${metricInfo.label}, ${period} exportado.`,
    );
  }

  return (
    <section
      className={`g2-terminal${compact ? " g2-terminal--compact" : ""}`}
      data-tone={tone}
      data-source={sourceMode}
      data-map-open={mapOpen}
      aria-label="Terminal Brasil — ambiente demonstrativo"
    >
      <header className="g2t-header">
        <Link
          to="/br"
          className="g2t-brand"
          aria-label="NIVAR — voltar ao Portal Brasil"
        >
          <Wordmark height={22} />
          <span>INTELLIGENCE</span>
        </Link>
        <div className="g2t-product">
          <span className="g2t-product-mark" aria-hidden="true">
            <Crosshair size={19} strokeWidth={1.2} />
          </span>
          <span>
            Terminal Brasil<small>UMA LEITURA DO SISTEMA</small>
          </span>
        </div>
        <nav aria-label="Navegação do Terminal" className="g2t-nav">
          <a href={`#${id}-panorama`} aria-current="page">
            Panorama
          </a>
          {!compact && <a href={`#${id}-caderno`}>Caderno</a>}
        </nav>
        <div className="g2t-header-actions">
          <button
            type="button"
            className="g2t-icon-button"
            onClick={() => setTone(tone === "graphite" ? "paper" : "graphite")}
            aria-label={
              tone === "graphite" ? "Usar tema claro" : "Usar tema escuro"
            }
            title={tone === "graphite" ? "Tema claro" : "Tema escuro"}
          >
            {tone === "graphite" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button
            type="button"
            className="g2t-source-button"
            aria-label="Fontes e método"
            onClick={openSources}
          >
            <BookOpen size={15} />
            <span>Fontes & método</span>
          </button>
          {!compact && (
            <Link to="/conta" className="g2t-account">
              Minha conta <ArrowUpRight size={14} />
            </Link>
          )}
        </div>
      </header>

      <div className="g2t-page">
        {!compact && (
          <div className="g2t-masthead">
            <div>
              <div className="g2t-eyebrow">
                <span className="g2t-cross" aria-hidden="true">
                  +
                </span>{" "}
                BRASIL / CADERNO 001
              </div>
              <h1>O sistema, em perspectiva.</h1>
            </div>
            <p>
              Observar o sinal.
              <br />
              <span>Interrogar a explicação.</span>
            </p>
          </div>
        )}

        <div className="g2t-toolbar" id={`${id}-panorama`}>
          <div className="g2t-source-select">
            <span
              className={`g2t-status-dot${!isSample ? " g2t-status-dot--unavailable" : ""}`}
              aria-hidden="true"
            />
            <label className="g2t-visually-hidden" htmlFor={`${id}-source`}>
              Base de dados
            </label>
            <select
              id={`${id}-source`}
              value={sourceMode}
              onChange={(event) => {
                setSourceMode(event.target.value as "sample" | "unavailable");
                setAnnouncement("");
              }}
            >
              <option value="sample">Base demonstrativa</option>
              <option value="unavailable">Fonte indisponível</option>
            </select>
            <ChevronDown size={12} aria-hidden="true" />
            <span className="g2t-source-date">
              {isSample
                ? "REFERÊNCIA FIXA · 10 SET 2026"
                : "SEM API BRASILEIRA CONECTADA"}
            </span>
          </div>
          <div
            className="g2t-period-control"
            role="group"
            aria-label="Janela da série"
          >
            {(["24h", "7d", "30d"] as const).map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setPeriod(item)}
                aria-pressed={period === item}
              >
                {item}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="g2t-export"
            onClick={exportCsv}
            disabled={!isSample}
          >
            <ArrowDownToLine size={14} />
            <span>Exportar amostra</span>
          </button>
        </div>

        <WorkspaceElement className="g2t-workspace">
          <button className="g2t-mobile-map-toggle" type="button" aria-expanded={mapOpen} aria-controls={`${id}-geography`} onClick={() => setMapOpen(!mapOpen)}>
            <Crosshair size={14} /><span>{mapOpen ? "Recolher geografia" : "Explorar geografia"}</span><span>{regionInfo.code}</span><ChevronDown size={14} />
          </button>
          <section
            className="g2t-geography"
            id={`${id}-geography`}
            aria-labelledby={`${id}-map-title`}
          >
            <div className="g2t-panel-heading">
              <h2 id={`${id}-map-title`}>
                01 <span>Geografia do sinal</span>
              </h2>
              <span>4 REGIÕES</span>
            </div>
            <div className="g2t-map-stage">
              <div className="g2t-map-index" aria-hidden="true">
                <span>PROJEÇÃO / BR</span><span>SELEÇÃO ESPACIAL</span>
              </div>
              <span className="g2t-map-coordinate g2t-map-coordinate--top">
                05° N
              </span>
              <span className="g2t-map-coordinate g2t-map-coordinate--bottom">
                34° S
              </span>
              <svg
                viewBox={BRASIL_VIEWBOX}
                className="g2t-map"
                role="group"
                aria-label="Selecionar submercado brasileiro"
              >
                <defs>
                  <linearGradient id={`${id}-map-light`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--g2t-map-selected)" />
                    <stop offset="100%" stopColor="var(--g2t-map)" />
                  </linearGradient>
                </defs>
                <path d={BRASIL_OUTLINE_D} className="g2t-map-outline" />
                {SUBMERCADOS.map((submarket) => (
                  <path
                    key={submarket.id}
                    d={submarket.d}
                    className={`g2t-map-region${region === submarket.id ? " is-selected" : ""}`}
                    style={region === submarket.id ? { fill: `url(#${id}-map-light)` } : undefined}
                    tabIndex={0}
                    role="button"
                    aria-label={`Selecionar ${submarket.nome}`}
                    aria-pressed={region === submarket.id}
                    onClick={() => setRegion(submarket.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setRegion(submarket.id);
                      }
                    }}
                  >
                    <title>{submarket.nome}</title>
                  </path>
                ))}
                <g className="g2t-map-crosshair" style={{ transform: `translate(${selectedMarket.centroid[0]}px, ${selectedMarket.centroid[1]}px)` }} aria-hidden="true">
                  <line x1="-720" y1="0" x2="720" y2="0" />
                  <line x1="0" y1="-755" x2="0" y2="755" />
                  <circle r="23" />
                  <circle className="g2t-map-target" r="10" />
                </g>
                {SUBMERCADOS.map((submarket) => (
                  <g
                    key={submarket.id}
                    className={`g2t-map-label${region === submarket.id ? " is-selected" : ""}`}
                    transform={`translate(${submarket.centroid[0]}, ${submarket.centroid[1]})`}
                    aria-hidden="true"
                  >
                    <circle r="5" />
                    <text y="-17" textAnchor="middle">
                      {REGIONS.find((r) => r.id === submarket.id)!.code}
                    </text>
                  </g>
                ))}
              </svg>
              <div className="g2t-spatial-tag" key={region}>
                <Crosshair size={12} />
                <span>{regionInfo.code}<small>REGIÃO SELECIONADA</small></span>
              </div>
              <div className="g2t-map-caption">
                <span>BR / SUBMERCADOS</span>
                <button
                  type="button"
                  onClick={() => {
                    openSources();
                    setSourceSearch("geografia");
                  }}
                >
                  IBGE · geometria <ArrowUpRight size={10} />
                </button>
              </div>
            </div>
            <div
              className="g2t-regions"
              role="group"
              aria-label="Submercado selecionado"
            >
              {REGIONS.map((item) => {
                const regionalSeries = getSeries(item.id, period, metric);
                const regional = describeSeries(
                  regionalSeries,
                  metric,
                );
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRegion(item.id)}
                    aria-pressed={region === item.id}
                  >
                    <span className="g2t-region-code">{item.code}</span>
                    <span className="g2t-region-name">{item.short}</span>
                    {isSample && <RegionalTrace series={regionalSeries} selectedIndex={inspectedPoint.index} />}
                    <span className="g2t-region-value">
                      {isSample ? formatValue(regional.last, metric) : "—"}
                    </span>
                    <ArrowUpRight size={12} />
                  </button>
                );
              })}
            </div>
            <div className="g2t-map-footnote">
              {isSample
                ? `${metricInfo.unit} · última observação simulada`
                : "Valores ausentes · sem conexão"}
              <span>A cor identifica a seleção.</span>
            </div>
          </section>

          <section
            className="g2t-series"
            aria-labelledby={`${id}-series-title`}
          >
            <div className="g2t-panel-heading">
              <h2 id={`${id}-series-title`}>
                02 <span>{regionInfo.name}</span>
              </h2>
              <label className="g2t-mobile-market">
                <span className="g2t-visually-hidden">Submercado da série</span>
                <select
                  value={region}
                  onChange={(event) =>
                    setRegion(event.target.value as RegionId)
                  }
                >
                  {REGIONS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.short}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} aria-hidden="true" />
              </label>
              <span>{regionInfo.code}</span>
            </div>
            <div
              className="g2t-metric-control"
              role="group"
              aria-label="Métrica da série"
            >
              {(Object.keys(METRICS) as MetricId[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  aria-pressed={metric === item}
                  onClick={() => setMetric(item)}
                >
                  {METRICS[item].label}
                </button>
              ))}
              <div
                className="g2t-mobile-period"
                role="group"
                aria-label="Janela da série no celular"
              >
                {(["24h", "7d", "30d"] as const).map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() => setPeriod(item)}
                    aria-pressed={period === item}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="g2t-series-reading">
              <div>
                <span className="g2t-value-label">{metricInfo.longLabel} · última observação</span>
                <div className="g2t-major-value">
                  {isSample ? formatValue(summary.last, metric) : "—"}
                  <span>{metricInfo.unit}</span>
                </div>
              </div>
              <div className="g2t-change">
                <span>{isSample ? summary.delta : "SEM DADO"}</span>
                <small>
                  {isSample ? "na janela selecionada" : "variação indisponível"}
                </small>
              </div>
            </div>
            <div className="g2t-chart-legend">
              <span>
                <i />
                {isSample ? "SÉRIE SINTÉTICA" : "SÉRIE INDISPONÍVEL"}
              </span>
              <span>{periodNames[period]}</span>
            </div>
            {isSample ? (
              <figure className="g2t-chart-figure">
                <div
                  className="g2t-chart"
                  aria-label={`${metricInfo.longLabel} em ${regionInfo.name}. Início ${formatValue(summary.first, metric)}, fim ${formatValue(summary.last, metric)} ${metricInfo.unit}. Variação ${summary.delta}. Base demonstrativa.`}
                >
                  {/* Initial geometry only; ResizeObserver immediately supplies the actual CSS-sized canvas. */}
                  <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minWidth={0}
                    initialDimension={{ width: 350, height: 239 }}
                  >
                    <ComposedChart
                      data={series}
                      margin={{ top: 26, right: 26, bottom: 8, left: 4 }}
                      accessibilityLayer
                      onClick={(state) => {
                        if (state.activeTooltipIndex == null) return;
                        const index = Number(state.activeTooltipIndex);
                        if (Number.isInteger(index) && index >= 0 && index < series.length) setProbeIndex(index);
                      }}
                    >
                      <defs>
                        <linearGradient
                          id={`${id}-fill`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="var(--g2t-accent)"
                            stopOpacity={0.23}
                          />
                          <stop
                            offset="100%"
                            stopColor="var(--g2t-accent)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        stroke="var(--g2t-rule)"
                        vertical={false}
                        strokeOpacity={0.55}
                      />
                      <XAxis
                        dataKey="index"
                        type="number"
                        domain={[0, series.length - 1]}
                        ticks={[
                          0,
                          Math.round((series.length - 1) / 3),
                          Math.round((2 * (series.length - 1)) / 3),
                          series.length - 1,
                        ]}
                        tickFormatter={(index: number) =>
                          series[index]?.label ?? ""
                        }
                        tick={{
                          fill: "var(--g2t-muted)",
                          fontSize: 12,
                          fontFamily: "var(--g2-mono, monospace)",
                        }}
                        axisLine={false}
                        tickLine={false}
                        tickMargin={14}
                      />
                      <YAxis
                        domain={[
                          (value: number) => Math.floor(value * 0.9),
                          (value: number) => Math.ceil(value * 1.07),
                        ]}
                        tickCount={4}
                        tick={{
                          fill: "var(--g2t-muted)",
                          fontSize: 12,
                          fontFamily: "var(--g2-mono, monospace)",
                        }}
                        tickFormatter={(value: number) =>
                          value.toLocaleString("pt-BR", {
                            maximumFractionDigits: 1,
                          })
                        }
                        axisLine={false}
                        tickLine={false}
                        width={43}
                      />
                      <ReferenceLine
                        y={summary.first}
                        stroke="var(--g2t-muted)"
                        strokeDasharray="5 5"
                        strokeOpacity={0.5}
                      />
                      <ReferenceLine
                        x={inspectedPoint.index}
                        stroke="var(--g2t-accent)"
                        strokeOpacity={0.8}
                        label={{
                          value: probeIndex == null ? `NOTA ${String(eventIndex + 1).padStart(2, "0")}` : inspectedPoint.label,
                          fill: "var(--g2t-accent)",
                          fontSize: 12,
                          fontFamily: "var(--g2-mono, monospace)",
                          position: "insideTopRight",
                        }}
                      />
                      <Area
                        type="linear"
                        dataKey="value"
                        stroke="var(--g2t-accent)"
                        strokeWidth={2}
                        fill={`url(#${id}-fill)`}
                        dot={false}
                        activeDot={{
                          r: 4,
                          fill: "var(--g2t-accent)",
                          stroke: "var(--g2t-bg)",
                          strokeWidth: 2,
                        }}
                        isAnimationActive={!reducedMotion}
                        animationDuration={560}
                        animationEasing="ease-out"
                      />
                      <ReferenceDot
                        x={inspectedPoint.index}
                        y={inspectedPoint.value}
                        r={5}
                        fill="var(--g2t-accent)"
                        stroke="var(--g2t-bg)"
                        strokeWidth={2}
                      />
                      <Tooltip
                        content={<SeriesTooltip metric={metric} />}
                        cursor={{
                          stroke: "var(--g2t-muted)",
                          strokeDasharray: "3 3",
                        }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                  <div
                    className="g2t-evidence-dock"
                    data-placement={inspectedPoint.value > (summary.min + summary.max) / 2 ? "below" : "above"}
                    style={{ left: `clamp(111px, ${18 + (inspectedPoint.index / (series.length - 1)) * 74}%, calc(100% - 111px))` }}
                  >
                    <div className="g2t-context-plane" key={`${region}-${period}-${metric}-${eventIndex}`}>
                      <div className="g2t-context-heading">
                        <span><Crosshair size={12} /> OBSERVAÇÃO</span>
                        <button type="button" onClick={openSources} aria-label="Rastrear esta observação nas fontes">Fonte <ArrowUpRight size={12} /></button>
                      </div>
                      <div className="g2t-context-value"><strong>{formatValue(inspectedPoint.value, metric)}</strong><span>{metricInfo.unit}</span></div>
                      <p>{regionInfo.code} <i /> {inspectedPoint.label} <i /> AMOSTRA</p>
                    </div>
                  </div>
                </div>
                <div className="g2t-time-inspector">
                  <div className="g2t-probe-heading">
                    <span><Crosshair size={12} /> {probeIndex == null ? `NOTA 0${eventIndex + 1}` : "OBSERVAÇÃO"} / {regionInfo.code}</span>
                    <output htmlFor={`${id}-time-scrub`}><b>{inspectedPoint.label}</b><span>{formatValue(inspectedPoint.value, metric)} <small>{metricInfo.unit}</small></span></output>
                  </div>
                  <label className="g2t-visually-hidden" htmlFor={`${id}-time-scrub`}>Inspecionar observação da série</label>
                  <input
                    id={`${id}-time-scrub`}
                    className="g2t-time-scrub"
                    type="range"
                    min={0}
                    max={series.length - 1}
                    step={1}
                    value={inspectedPoint.index}
                    aria-valuetext={`${inspectedPoint.label}: ${formatValue(inspectedPoint.value, metric)} ${metricInfo.unit}. Amostra sintética.`}
                    onChange={(event) => setProbeIndex(Number(event.target.value))}
                  />
                  <div className="g2t-timeline-events" role="group" aria-label="Notas na linha do tempo">
                    {eventPoints.map((point, index) => (
                      <button key={index} type="button" onClick={() => selectEvent(index)} aria-pressed={eventIndex === index && probeIndex == null}>
                        <i aria-hidden="true" /><span>0{index + 1}</span><strong>{point.label}</strong><ArrowUpRight size={11} />
                      </button>
                    ))}
                  </div>
                </div>
                <figcaption>
                  <span className="g2t-baseline-key" />
                  Tracejado: primeira observação
                  <span className="g2t-simulation-note">
                    Demonstração · sem dado de mercado
                  </span>
                </figcaption>
              </figure>
            ) : (
              <div className="g2t-unavailable" role="status">
                <Database size={25} strokeWidth={1} />
                <h3>A ausência também é informação.</h3>
                <p>
                  Nenhuma fonte de mercado brasileiro está conectada. Série,
                  variação e interpretação permanecem indisponíveis.
                </p>
                <button type="button" onClick={() => setSourceMode("sample")}>
                  Explorar a base demonstrativa <ArrowRight size={14} />
                </button>
              </div>
            )}
            <div className="g2t-series-extents">
              <div>
                <span>INÍCIO DA JANELA</span>
                <strong>
                  {isSample ? formatValue(summary.first, metric) : "—"}
                </strong>
              </div>
              <div>
                <span>MÍNIMO</span>
                <strong>
                  {isSample ? formatValue(summary.min, metric) : "—"}
                </strong>
              </div>
              <div>
                <span>MÁXIMO</span>
                <strong>
                  {isSample ? formatValue(summary.max, metric) : "—"}
                </strong>
              </div>
              <div>
                <span>OBSERVAÇÕES</span>
                <strong>
                  {isSample ? String(series.length).padStart(2, "0") : "—"}{" "}
                  <small>{period === "24h" ? "horárias" : "diárias"}</small>
                </strong>
              </div>
            </div>
          </section>

          <aside
            className="g2t-interpretation"
            aria-labelledby={`${id}-reading-title`}
          >
            <div className="g2t-panel-heading">
              <h2 id={`${id}-reading-title`}>
                03 <span>Caderno de leitura</span>
              </h2>
              <BookOpen size={13} />
            </div>
            <div className="g2t-reading-body">
              <span className="g2t-eyebrow">
                {isSample ? "LEITURA DA AMOSTRA" : "LEITURA SUSPENSA"}
              </span>
              <h3>
                {isSample
                  ? `${metricName} ${direction} na janela.`
                  : "Sem observação, sem conclusão."}
              </h3>
              <p>
                {isSample ? (
                  <>
                    Em {regionInfo.name}, a série vai de{" "}
                    <strong>{formatValue(summary.first, metric)}</strong> a{" "}
                    <strong>
                      {formatValue(summary.last, metric)} {metricInfo.unit}
                    </strong>
                    . A variação de <strong>{summary.delta}</strong> descreve a
                    amostra; não explica o movimento.
                  </>
                ) : (
                  "Uma fonte indisponível não equivale a um valor zero, a um mercado estável ou à continuidade da última leitura."
                )}
              </p>
              <div className="g2t-reading-annotation">
                <span>
                  {isSample ? "01 / EVIDÊNCIA" : "01 / DISPONIBILIDADE"}
                </span>
                <p>
                  {isSample
                    ? `${series.length} observações sintéticas. Janela e submercado identificados. Cálculo reproduzível no CSV.`
                    : "API brasileira não conectada. Nenhum dado substituto é tratado como observação."}
                </p>
              </div>
              <div className="g2t-reading-annotation g2t-reading-annotation--question" key={`${metric}-${eventIndex}`}>
                <span>02 / CONTRADITÓRIO</span>
                <p>
                  {isSample
                    ? `Nota 0${eventIndex + 1}: uma hipótese.`
                    : "O que falta para retomar?"}
                </p>
                <small>
                  {isSample
                    ? question.hypothesis
                    : "Uma fonte identificada, cobertura conhecida, horário de referência e método verificável."}
                </small>
              </div>
            </div>
            <button
              type="button"
              className="g2t-reading-link"
              onClick={openSources}
            >
              Abrir fontes & método <ArrowUpRight size={15} />
            </button>
          </aside>
        </WorkspaceElement>

        {!compact && (
          <section
            className="g2t-notebook"
            id={`${id}-caderno`}
            aria-labelledby={`${id}-notes-title`}
          >
            <div className="g2t-notebook-intro">
              <div className="g2t-eyebrow">DO SINAL À PERGUNTA</div>
              <h2 id={`${id}-notes-title`}>
                Nada se explica
                <br />
                sozinho.
              </h2>
              <p>
                Selecione uma observação.
                <br />
                Examine uma hipótese possível.
              </p>
              <span className="g2t-demo-label">NOTAS ILUSTRATIVAS</span>
            </div>
            <div className="g2t-observations">
              <div
                className="g2t-event-control"
                role="group"
                aria-label="Observação para examinar"
              >
                {eventPoints.map((point, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => selectEvent(index)}
                    aria-pressed={eventIndex === index}
                    disabled={!isSample}
                  >
                    <span>
                      NOTA 0{index + 1}
                      <ArrowUpRight size={13} />
                    </span>
                    <strong>{isSample ? point.label : "—"}</strong>
                    <small>
                      {isSample
                        ? `${formatValue(point.value, metric)} ${metricInfo.unit}`
                        : "sem observação"}
                    </small>
                  </button>
                ))}
              </div>
              <div className="g2t-event-dossier" key={`${metric}-${eventIndex}`} aria-live="polite">
                <div>
                  <span className="g2t-eyebrow">
                    HIPÓTESE A EXAMINAR / 0{eventIndex + 1}
                  </span>
                  <h3>
                    {isSample
                      ? question.hypothesis
                      : "A investigação aguarda uma fonte."}
                  </h3>
                </div>
                <div>
                  <span className="g2t-eyebrow">COMO COLOCÁ-LA À PROVA</span>
                  <p>
                    {isSample
                      ? question.check
                      : "Conectar uma série com fonte e período verificáveis. Retomar a investigação quando existir observação."}
                  </p>
                </div>
              </div>
              {isSample && (
                <details className="g2t-data-table">
                  <summary>
                    Consultar as {series.length} observações da seleção{" "}
                    <ChevronDown size={13} />
                  </summary>
                  <div className="g2t-table-scroll">
                    <table>
                      <caption>
                        {regionInfo.name} · {metricInfo.longLabel} · {period} ·{" "}
                        {SAMPLE_VERSION}
                      </caption>
                      <thead>
                        <tr>
                          <th scope="col">
                            Referência{" "}
                            {period === "24h" ? "(UTC−03:00)" : "(dia)"}
                          </th>
                          <th scope="col">Valor ({metricInfo.unit})</th>
                          <th scope="col">Classificação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {series.map((point) => (
                          <tr key={point.index}>
                            <th scope="row">{point.timestamp}</th>
                            <td>{formatValue(point.value, metric)}</td>
                            <td>Demonstração sintética</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              )}
            </div>
          </section>
        )}

        <footer className="g2t-footer">
          <Link to="/br">
            <ArrowLeft size={12} /> Portal Brasil
          </Link>
          <button
            type="button"
            className="g2t-mobile-export"
            onClick={exportCsv}
            disabled={!isSample}
          >
            <ArrowDownToLine size={13} /> Exportar amostra
          </button>
          <span>
            {isSample
              ? `AMOSTRA FIXA · ${SAMPLE_VERSION}`
              : "SEM FONTE CONECTADA · SEM ATUALIZAÇÃO"}
          </span>
          <button type="button" onClick={openSources}>
            Proveniência visível <ArrowUpRight size={12} />
          </button>
        </footer>
        <p className="g2t-visually-hidden" role="status">
          {announcement}
        </p>
      </div>

      <dialog
        ref={dialogRef}
        className="g2t-source-dialog"
        aria-labelledby={`${id}-sources-title`}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            dialogRef.current?.close();
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
      >
        <div className="g2t-dialog-inner">
          <div className="g2t-dialog-top">
            <span className="g2t-eyebrow">REGISTRO DE PROVENIÊNCIA</span>
            <button
              className="g2t-icon-button"
              type="button"
              aria-label="Fechar fontes e método"
              onClick={() => dialogRef.current?.close()}
            >
              <X size={19} />
            </button>
          </div>
          <h2 id={`${id}-sources-title`}>
            Uma leitura precisa
            <br />
            poder ser examinada.
          </h2>
          <p className="g2t-dialog-intro">
            Origem, cálculo e limites desta tela — no mesmo lugar.
          </p>
          <label className="g2t-source-search">
            <Search size={16} />
            <span className="g2t-visually-hidden">Buscar fonte ou método</span>
            <input
              type="search"
              value={sourceSearch}
              onChange={(event) => setSourceSearch(event.target.value)}
              placeholder="Buscar fonte, cálculo, limite…"
            />
          </label>
          <p className="g2t-search-count" role="status">
            {filteredSources.length}{" "}
            {filteredSources.length === 1 ? "registro" : "registros"}
          </p>
          <div className="g2t-source-records">
            {filteredSources.length ? (
              filteredSources.map((record) => (
                <article key={record.id}>
                  <span className="g2t-eyebrow">{record.kind}</span>
                  <h3>{record.title}</h3>
                  <p>{record.text}</p>
                  <p className="g2t-record-detail">{record.detail}</p>
                  {record.href && (
                    <a href={record.href} target="_blank" rel="noreferrer">
                      Consultar malha primária do IBGE{" "}
                      <ArrowUpRight size={13} />
                    </a>
                  )}
                </article>
              ))
            ) : (
              <p className="g2t-no-results">
                Nenhum registro para “{sourceSearch}”. Tente “amostra”,
                “cálculo” ou “geografia”.
              </p>
            )}
          </div>
          <div className="g2t-dialog-bottom">
            <span>NIVAR / MÉTODO ANTES DA CONCLUSÃO</span>
            <button type="button" onClick={() => dialogRef.current?.close()}>
              Voltar à leitura <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </dialog>
    </section>
  );
}

export function TerminalPreview() {
  return <TerminalBrasil compact />;
}
export default TerminalBrasil;

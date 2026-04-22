import React from "react";
import { GA, serif, mono, sans, Caption, SectionHeader, Eyebrow } from "./ga-primitives";
import {
  HeroSparkLine,
  SparkLine,
  SmoothLineChart,
  FilledAreaChart,
  StackedBarChart,
  GaugeChart,
  WaterfallChart,
  HeatmapChart,
} from "./ga-charts";

export function Section03Composition() {
  return (
    <section>
      <SectionHeader num="03" title="Composition Modes" />

      {/* 3A — HERO */}
      <div style={{ minHeight: 500, paddingBottom: 64 }}>
        <Eyebrow>WESTERN_HUB · REAL-TIME LMP</Eyebrow>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginTop: 40 }}>
          <div style={{ ...serif, fontSize: "120px", color: GA.white, lineHeight: 1 }}>33.50</div>
          <div style={{ ...mono, fontSize: "18px", color: GA.textDim, marginTop: 18 }}>$/MWh</div>
        </div>
        <div
          style={{
            display: "flex",
            gap: 24,
            alignItems: "center",
            marginTop: 32,
            ...mono,
            fontSize: "13px",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span style={{ color: GA.green }}>▲ 2.14</span>
          <span style={{ color: GA.textDim }}>24H AVG 28.42 /MWh</span>
          <span style={{ display: "inline-flex", gap: 6, alignItems: "center", color: GA.green }}>
            <span>●</span>
            <span style={{ letterSpacing: "0.12em" }}>LIVE</span>
          </span>
          <span style={{ color: GA.textDim }}>16:42 CT</span>
        </div>
        <div style={{ marginTop: 40 }}>
          <HeroSparkLine />
        </div>
        <Caption>
          HERO COMPOSITION · no container · content sits on background · dominates by scale and whitespace ·
          used for the single most important metric on any page
        </Caption>
      </div>

      {/* 3B — FLOW */}
      <div style={{ paddingBottom: 64 }}>
        <div style={{ height: 1, background: GA.ruleStrong }} />
        <div style={{ marginTop: 24 }}>
          <Eyebrow>LIVE ANOMALY FEED · PJM</Eyebrow>
        </div>
        <div style={{ marginTop: 32 }}>
          {[
            { glyph: "⚠", title: "LMP deviation WESTERN_HUB", sigma: "+2.3σ", sigColor: GA.red, zone: "PJM · WEST", time: "14:22" },
            { glyph: "◆", title: "Load forecast divergence", sigma: "+1.4σ", sigColor: GA.gold, zone: "ERCOT · N", time: "14:08" },
            { glyph: "◉", title: "DA/RT spread widening", sigma: "+1.8σ", sigColor: GA.gold, zone: "CAISO · SP15", time: "13:55" },
          ].map((f, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "20px 0",
                borderTop: i === 0 ? "none" : `1px solid ${GA.rule}`,
              }}
            >
              <span style={{ ...sans, color: GA.text, fontSize: "15px", width: 24 }}>{f.glyph}</span>
              <span style={{ ...sans, color: GA.text, fontSize: "15px", flex: 1 }}>{f.title}</span>
              <span style={{ ...mono, color: f.sigColor, fontSize: "13px", fontVariantNumeric: "tabular-nums", width: 80 }}>
                {f.sigma}
              </span>
              <span
                style={{
                  ...mono,
                  color: GA.textDim,
                  fontSize: "11px",
                  letterSpacing: "0.08em",
                  width: 160,
                  textTransform: "uppercase",
                }}
              >
                {f.zone}
              </span>
              <span style={{ ...mono, color: GA.textDim, fontSize: "11px", fontVariantNumeric: "tabular-nums", width: 60, textAlign: "right" }}>
                {f.time}
              </span>
            </div>
          ))}
        </div>
        <Caption>
          FLOW COMPOSITION · top rule + eyebrow + content · NO border around region · used for: feeds,
          tables, lists, grouped data
        </Caption>
      </div>

      {/* 3C — CONTAINED */}
      <div style={{ paddingBottom: 32 }}>
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
          {/* DominantCard */}
          <div
            style={{
              width: 680,
              height: 280,
              background: GA.card,
              border: `1px solid ${GA.rule}`,
              borderRadius: 8,
              padding: 24,
              position: "relative",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <Eyebrow>CAISO SP15 · REAL-TIME LMP · INTERVAL 14:55 PT</Eyebrow>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: GA.green, fontSize: 12 }}>●</span>
                <span style={{ ...mono, fontSize: "11px", color: GA.green, letterSpacing: "0.12em" }}>LIVE</span>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ ...serif, fontSize: "80px", color: GA.white, lineHeight: 1 }}>86.40</div>
              <div style={{ ...mono, fontSize: "16px", color: GA.textDim, marginTop: 12 }}>$/MWh</div>
            </div>
            <div style={{ height: 1, background: GA.ruleStrong }} />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                ...mono,
                fontSize: "13px",
                color: GA.textDim,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <span>24H AVG 71.22</span>
              <span>DA 68.90</span>
              <span style={{ color: GA.green }}>SPREAD +17.50</span>
              <span>LOAD 38.2 GW</span>
            </div>
          </div>

          {/* CompactCard */}
          <div
            style={{
              width: 200,
              height: 140,
              background: GA.card,
              border: `1px solid ${GA.rule}`,
              borderRadius: 8,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <Eyebrow spacing="0.12em">ERCOT NORTH</Eyebrow>
            <div style={{ ...mono, fontSize: "24px", color: GA.white, fontVariantNumeric: "tabular-nums" }}>
              28.42
            </div>
            <div style={{ ...mono, fontSize: "11px", color: GA.green }}>▲ 1.22</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 24, marginTop: 0 }}>
          <div style={{ width: 680 }}>
            <Caption>
              DOMINANTCARD · hero metric + context strip · ONE per screen · earns its container through
              information density
            </Caption>
          </div>
          <div style={{ width: 200 }}>
            <Caption>COMPACTCARD · small tile in a grid · reserved for multi-zone watchlists</Caption>
          </div>
        </div>

        <div
          style={{
            ...serif,
            fontStyle: "italic",
            fontSize: "18px",
            color: GA.textMute,
            marginTop: 48,
            textAlign: "center",
          }}
        >
          These are the only two card variants. Everything else is HERO or FLOW.
        </div>
      </div>
    </section>
  );
}

export function Section04Charts() {
  return (
    <section>
      <SectionHeader num="04" title="Charts" />

      <div style={{ paddingBottom: 56 }}>
        <SparkLine />
        <Caption>SPARKLINE · 140×40 · smooth cubic bezier · min/max dots · no axes · inline context</Caption>
      </div>

      <div style={{ paddingBottom: 56 }}>
        <SmoothLineChart />
        <Caption>
          SMOOTHLINECHART · 680×280 · line + grid + session boundary + crosshair readout + min/max markers +
          regime tint + axis labels
        </Caption>
      </div>

      <div style={{ paddingBottom: 56 }}>
        <FilledAreaChart />
        <Caption>
          FILLEDAREACHART · 680×280 · gradient fill 20→0% + forecast hatch overlay on right third
        </Caption>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 320px)",
          gap: 32,
          paddingBottom: 40,
        }}
      >
        <div>
          <StackedBarChart />
          <Caption>STACKEDBAR · 320×200 · fuel mix % labels + legend</Caption>
        </div>
        <div>
          <GaugeChart />
          <Caption>GAUGE · 320×200 · 180° arc · SOC 74% center</Caption>
        </div>
        <div>
          <WaterfallChart />
          <Caption>WATERFALL · 320×200 · 5 bars + net · dotted connectors</Caption>
        </div>
        <div>
          <HeatmapChart />
          <Caption>HEATMAP · 320×200 · zone × hour · blue→white→gold scale</Caption>
        </div>
      </div>
    </section>
  );
}

export function Section05Tables() {
  const rows = [
    { zone: "WESTERN_HUB", lmp: 52.18, spread: "+2.14", vol: 4820, regime: "BURNING", regimeColor: GA.gold, t: "14:22" },
    { zone: "AEP", lmp: 48.42, spread: "-0.82", vol: 3940, regime: "NORMAL", regimeColor: GA.textDim, t: "14:22" },
    { zone: "DOMINION", lmp: 51.20, spread: "+1.02", vol: 3280, regime: "NORMAL", regimeColor: GA.textDim, t: "14:21" },
    { zone: "PJM_RTO", lmp: 50.08, spread: "+0.48", vol: 12400, regime: "NORMAL", regimeColor: GA.textDim, t: "14:21" },
    { zone: "CHICAGO_HUB", lmp: 46.80, spread: "-1.24", vol: 2900, regime: "SUPPRESSED", regimeColor: GA.blue, t: "14:20" },
    { zone: "EASTERN_HUB", lmp: 54.80, spread: "+4.62", vol: 5120, regime: "EMERGENCY", regimeColor: GA.red, t: "14:20" },
  ];
  const baseHeader = ["ZONE", "LMP $/MWh", "SPREAD", "VOL MWh", "REGIME", "LAST UPDATE"];

  return (
    <section>
      <SectionHeader num="05" title="Data Tables" />

      {/* BaseTable */}
      <div style={{ paddingBottom: 64 }}>
        <div style={{ height: 1, background: GA.ruleStrong, marginBottom: 16 }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "180px 140px 120px 120px 180px 140px",
            ...mono,
            fontSize: "11px",
            letterSpacing: "0.12em",
            color: GA.textDim,
            textTransform: "uppercase",
            padding: "12px 0",
            borderBottom: `1px solid ${GA.rule}`,
          }}
        >
          {baseHeader.map((h, i) => (
            <div key={h} style={{ textAlign: i === 0 || i === 4 ? "left" : i === 5 ? "left" : "right" }}>
              {h}
            </div>
          ))}
        </div>
        {rows.map((r, idx) => (
          <div
            key={r.zone}
            style={{
              display: "grid",
              gridTemplateColumns: "180px 140px 120px 120px 180px 140px",
              height: 44,
              alignItems: "center",
              borderBottom: idx === rows.length - 1 ? "none" : `1px solid ${GA.rule}`,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <div style={{ ...mono, fontSize: "13px", color: GA.text }}>{r.zone}</div>
            <div style={{ ...mono, fontSize: "13px", color: GA.white, textAlign: "right" }}>{r.lmp.toFixed(2)}</div>
            <div
              style={{
                ...mono,
                fontSize: "13px",
                textAlign: "right",
                color: r.spread.startsWith("+") ? GA.green : GA.red,
              }}
            >
              {r.spread}
            </div>
            <div style={{ ...mono, fontSize: "13px", color: GA.text, textAlign: "right" }}>{r.vol.toLocaleString()}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: r.regimeColor, fontSize: 12 }}>●</span>
              <span
                style={{
                  ...mono,
                  fontSize: "11px",
                  letterSpacing: "0.18em",
                  color: r.regimeColor,
                  textTransform: "uppercase",
                }}
              >
                {r.regime}
              </span>
            </div>
            <div style={{ ...mono, fontSize: "11px", color: GA.textDim }}>{r.t} CT</div>
          </div>
        ))}
        <Caption>BASETABLE · 44px rows · 6 columns · regime uses typography-led badge from Section 02</Caption>
      </div>

      {/* CompactTable */}
      <div style={{ paddingBottom: 64 }}>
        <div style={{ height: 1, background: GA.ruleStrong, marginBottom: 16 }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "160px 100px 100px 100px 100px 80px",
            ...mono,
            fontSize: "11px",
            letterSpacing: "0.12em",
            color: GA.textDim,
            textTransform: "uppercase",
            padding: "8px 0",
            borderBottom: `1px solid ${GA.rule}`,
          }}
        >
          {["CONTRACT", "BID", "ASK", "LAST", "SETTLE", "Δ"].map((h, i) => (
            <div key={h} style={{ textAlign: i === 0 ? "left" : "right" }}>
              {h}
            </div>
          ))}
        </div>
        {[
          { c: "NG MAY26", b: "3.248", a: "3.252", l: "3.250", s: "3.244", d: "+0.006", dc: GA.green },
          { c: "NG JUN26", b: "3.412", a: "3.416", l: "3.414", s: "3.420", d: "-0.006", dc: GA.red },
          { c: "PJM WH JUL", b: "58.20", a: "58.40", l: "58.30", s: "57.80", d: "+0.50", dc: GA.green },
          { c: "ERCOT N JUL", b: "72.10", a: "72.40", l: "72.25", s: "71.80", d: "+0.45", dc: GA.green },
          { c: "CAISO SP15", b: "84.20", a: "84.60", l: "84.40", s: "85.10", d: "-0.70", dc: GA.red },
        ].map((r, i, a) => (
          <div
            key={r.c}
            style={{
              display: "grid",
              gridTemplateColumns: "160px 100px 100px 100px 100px 80px",
              height: 32,
              alignItems: "center",
              borderBottom: i === a.length - 1 ? "none" : `1px solid ${GA.rule}`,
              fontVariantNumeric: "tabular-nums",
              ...mono,
              fontSize: "12px",
            }}
          >
            <div style={{ color: GA.text }}>{r.c}</div>
            <div style={{ color: GA.textSub, textAlign: "right" }}>{r.b}</div>
            <div style={{ color: GA.textSub, textAlign: "right" }}>{r.a}</div>
            <div style={{ color: GA.white, textAlign: "right" }}>{r.l}</div>
            <div style={{ color: GA.textDim, textAlign: "right" }}>{r.s}</div>
            <div style={{ color: r.dc, textAlign: "right" }}>{r.d}</div>
          </div>
        ))}
        <Caption>COMPACTTABLE · 32px rows · dense watchlist · mono throughout · right-aligned numbers</Caption>
      </div>

      {/* NumericTable */}
      <div style={{ paddingBottom: 40 }}>
        <div style={{ height: 1, background: GA.ruleStrong, marginBottom: 16 }} />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "200px 140px 120px 140px",
            ...mono,
            fontSize: "11px",
            letterSpacing: "0.12em",
            color: GA.textDim,
            textTransform: "uppercase",
            padding: "10px 0",
            borderBottom: `1px solid ${GA.rule}`,
          }}
        >
          <div>ZONE</div>
          <div style={{ textAlign: "right" }}>LMP</div>
          <div style={{ textAlign: "right" }}>Δ</div>
          <div style={{ textAlign: "right" }}>VOL</div>
        </div>
        {rows.slice(0, 5).map((r, i, a) => (
          <div
            key={r.zone}
            style={{
              display: "grid",
              gridTemplateColumns: "200px 140px 120px 140px",
              height: 36,
              alignItems: "center",
              borderBottom: i === a.length - 1 ? "none" : `1px solid ${GA.rule}`,
              fontVariantNumeric: "tabular-nums",
              ...mono,
              fontSize: "13px",
            }}
          >
            <div style={{ color: GA.text }}>{r.zone}</div>
            <div style={{ color: GA.white, textAlign: "right" }}>{r.lmp.toFixed(2)}</div>
            <div style={{ color: r.spread.startsWith("+") ? GA.green : GA.red, textAlign: "right" }}>{r.spread}</div>
            <div style={{ color: GA.textSub, textAlign: "right" }}>{r.vol.toLocaleString()}</div>
          </div>
        ))}
        <Caption>NUMERICTABLE · decimal alignment via tabular-nums · right-aligned numerics</Caption>
      </div>
    </section>
  );
}

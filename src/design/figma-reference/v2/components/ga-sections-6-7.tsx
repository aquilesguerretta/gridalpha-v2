import React from "react";
import { GA, serif, mono, sans, Caption, SectionHeader, Eyebrow } from "./ga-primitives";
import { SmoothLineChart } from "./ga-charts";

function MockChartImage({ width, height, label }: { width: number; height: number; label: string }) {
  // Simulated dark chart thumbnail
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`grad-${label}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#1a1a24" />
          <stop offset="100%" stopColor="#0A0A0F" />
        </linearGradient>
      </defs>
      <rect width={width} height={height} fill={`url(#grad-${label})`} />
      {/* fake grid */}
      {Array.from({ length: 5 }).map((_, i) => (
        <line
          key={i}
          x1={0}
          x2={width}
          y1={(i / 4) * height}
          y2={(i / 4) * height}
          stroke="rgba(255,255,255,0.03)"
        />
      ))}
      {/* climbing line */}
      <path
        d={`M 0 ${height * 0.7} C ${width * 0.3} ${height * 0.65}, ${width * 0.5} ${height * 0.5}, ${width * 0.7} ${height * 0.35} S ${width} ${height * 0.2}, ${width} ${height * 0.15}`}
        fill="none"
        stroke={GA.gold}
        strokeWidth={2}
      />
      <path
        d={`M 0 ${height * 0.7} C ${width * 0.3} ${height * 0.65}, ${width * 0.5} ${height * 0.5}, ${width * 0.7} ${height * 0.35} S ${width} ${height * 0.2}, ${width} ${height * 0.15} L ${width} ${height} L 0 ${height} Z`}
        fill={GA.gold}
        opacity={0.08}
      />
    </svg>
  );
}

export function Section06Peregrine() {
  return (
    <section>
      <SectionHeader num="06" title="Peregrine Feed" />

      <div
        style={{
          ...serif,
          fontStyle: "italic",
          fontSize: "16px",
          color: GA.textMute,
          marginTop: -32,
          marginBottom: 56,
        }}
      >
        Peregrine is a full destination, not a sidebar. These components compose into the /peregrine page.
      </div>

      {/* Row 1 — HeroStory */}
      <div style={{ paddingBottom: 64 }}>
        <div
          style={{
            width: 1200,
            height: 480,
            background: GA.card,
            border: `1px solid ${GA.rule}`,
            borderRadius: 8,
            display: "grid",
            gridTemplateColumns: "720px 1fr",
            overflow: "hidden",
          }}
        >
          <div style={{ position: "relative" }}>
            <MockChartImage width={720} height={480} label="ercot" />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to bottom, rgba(0,0,0,0) 50%, rgba(0,0,0,0.8) 100%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 20,
                bottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: GA.gold, fontSize: 12 }}>●</span>
                <span style={{ ...mono, fontSize: "11px", color: GA.white, letterSpacing: "0.12em" }}>ERCOT OP</span>
              </div>
              <span style={{ ...mono, fontSize: "10px", color: GA.textDim, letterSpacing: "0.08em" }}>
                16:42 CT · 4 MIN AGO
              </span>
            </div>
          </div>
          <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
            <Eyebrow color={GA.red}>● BREAKING · EEA LEVEL 2</Eyebrow>
            <div style={{ ...serif, fontSize: "32px", color: GA.text, lineHeight: 1.15 }}>
              ERCOT issues Energy Emergency Alert Level 2 as reserves fall below 2,300 MW
            </div>
            <div
              style={{
                borderLeft: `2px solid ${GA.red}`,
                paddingLeft: 14,
                ...serif,
                fontStyle: "italic",
                fontSize: "16px",
                color: GA.textSub,
                lineHeight: 1.45,
              }}
            >
              Operating reserves have fallen below the 2,300 MW threshold. Real-time LMP in North Hub has
              spiked to $328.40/MWh.
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: "auto" }}>
              {["RELIABILITY", "ERCOT", "PRICE SPIKE"].map((t, i) => (
                <span
                  key={t}
                  style={{
                    ...mono,
                    fontSize: "10px",
                    color: GA.textDim,
                    letterSpacing: "0.12em",
                  }}
                >
                  {t}
                  {i < 2 && <span style={{ marginLeft: 12 }}>·</span>}
                </span>
              ))}
            </div>
          </div>
        </div>
        <Caption>HEROSTORY · full breaking-news treatment · image + headline + AI summary + source · ONE at top of Peregrine</Caption>
      </div>

      {/* Row 2 — StoryCard grid */}
      <div style={{ paddingBottom: 64 }}>
        <div style={{ display: "grid", gridTemplateColumns: "580px 580px", gap: 40 }}>
          {[
            {
              source: "PJM OPS",
              time: "2H AGO",
              title: "PJM WEST spread widens on outage at Homer City",
              body: "1,884 MW coal unit forced offline. DA/RT spread at +18.42.",
              tags: ["CONGESTION", "PJM"],
            },
            {
              source: "EIA",
              time: "4H AGO",
              title: "Natural gas storage draw exceeds 5-year average by 14%",
              body: "EIA weekly report shows 142 Bcf withdrawal vs 125 Bcf expected.",
              tags: ["FUNDAMENTALS", "GAS"],
            },
          ].map((s) => (
            <div
              key={s.title}
              style={{
                background: GA.card,
                border: `1px solid ${GA.rule}`,
                borderRadius: 8,
                overflow: "hidden",
                width: 580,
              }}
            >
              <MockChartImage width={580} height={192} label={s.source} />
              <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 12, ...mono, fontSize: "10px", color: GA.textDim, letterSpacing: "0.12em" }}>
                  <span>{s.source}</span>
                  <span>·</span>
                  <span>{s.time}</span>
                </div>
                <div style={{ ...serif, fontSize: "20px", color: GA.text, lineHeight: 1.2 }}>{s.title}</div>
                <div style={{ ...sans, fontSize: "13px", color: GA.textSub, lineHeight: 1.5 }}>{s.body}</div>
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  {s.tags.map((t) => (
                    <span key={t} style={{ ...mono, fontSize: "10px", color: GA.textDim, letterSpacing: "0.12em" }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Caption>STORYCARD · secondary stories · thumbnail + headline + summary + tags</Caption>
      </div>

      {/* Row 3 — VideoBriefing */}
      <div style={{ paddingBottom: 64 }}>
        <div
          style={{
            width: 400,
            height: 260,
            background: GA.card,
            border: `1px solid ${GA.rule}`,
            borderRadius: 8,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <MockChartImage width={400} height={260} label="brief" />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.85) 100%)",
            }}
          />
          {/* Source badge */}
          <div
            style={{
              position: "absolute",
              top: 16,
              left: 16,
              ...mono,
              fontSize: "10px",
              color: GA.gold,
              letterSpacing: "0.18em",
            }}
          >
            GRIDALPHA DAILY
          </div>
          {/* Play */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%,-50%)",
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width={30} height={30} viewBox="0 0 30 30">
              <polygon points="10,6 25,15 10,24" fill="rgba(255,255,255,0.8)" />
            </svg>
          </div>
          {/* Duration */}
          <div
            style={{
              position: "absolute",
              right: 12,
              bottom: 12,
              background: "rgba(0,0,0,0.5)",
              borderRadius: 2,
              padding: "3px 6px",
              ...mono,
              fontSize: "10px",
              color: GA.white,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            12:40
          </div>
          {/* Title */}
          <div
            style={{
              position: "absolute",
              left: 16,
              bottom: 36,
              ...serif,
              fontSize: "18px",
              color: GA.white,
              maxWidth: 320,
              lineHeight: 1.2,
            }}
          >
            Morning Brief · PJM & ERCOT open
          </div>
        </div>
        <Caption>VIDEOBRIEFING · native video tile · AI-generated daily briefings and founder commentary</Caption>
      </div>

      {/* Row 4 — DataStory */}
      <div style={{ paddingBottom: 64 }}>
        <div
          style={{
            width: 1200,
            height: 280,
            background: GA.card,
            border: `1px solid ${GA.rule}`,
            borderRadius: 8,
            display: "grid",
            gridTemplateColumns: "480px 1fr",
            padding: 32,
            gap: 32,
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ ...serif, fontSize: "24px", color: GA.text, lineHeight: 1.2 }}>
              Why spark spreads are burning across PJM West this week
            </div>
            <div style={{ ...sans, fontSize: "14px", color: GA.textSub, lineHeight: 1.5 }}>
              Gas prices have dropped while power prices have surged. The result: margins for CCGT operators
              have doubled in five trading days.
            </div>
            <div style={{ ...sans, fontSize: "12px", color: GA.blue }}>Read analysis →</div>
          </div>
          <div style={{ position: "relative" }}>
            <SmoothLineChart width={640} height={220} />
            <div
              style={{
                position: "absolute",
                left: 80,
                top: 40,
                ...mono,
                fontSize: "10px",
                color: GA.green,
                letterSpacing: "0.08em",
              }}
            >
              GAS PRICE DROP −12%
            </div>
            <div
              style={{
                position: "absolute",
                right: 140,
                top: 10,
                ...mono,
                fontSize: "10px",
                color: GA.gold,
                letterSpacing: "0.08em",
              }}
            >
              POWER PRICE SPIKE +28%
            </div>
          </div>
        </div>
        <Caption>DATASTORY · inline chart + narrative · the Bloomberg data-journalism format</Caption>
      </div>

      {/* Row 5 — AnomalyAlert */}
      <div style={{ paddingBottom: 64 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {[
            { c: GA.red, title: "LMP deviation WESTERN_HUB", sigma: "+2.3σ", zone: "PJM · WEST", time: "14:22" },
            { c: GA.gold, title: "Load forecast divergence", sigma: "+1.4σ", zone: "ERCOT · N", time: "14:08" },
            { c: GA.gold, title: "DA/RT spread widening", sigma: "+1.8σ", zone: "CAISO · SP15", time: "13:55" },
          ].map((a, i, arr) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                padding: "20px 20px",
                borderLeft: `3px solid ${a.c}`,
                borderBottom: i === arr.length - 1 ? "none" : `1px solid ${GA.rule}`,
                gap: 16,
              }}
            >
              <span style={{ color: a.c, fontSize: 18 }}>⚠</span>
              <span style={{ ...sans, fontSize: "15px", color: GA.text, flex: 1 }}>{a.title}</span>
              <span
                style={{
                  ...mono,
                  fontSize: "13px",
                  color: a.c,
                  fontVariantNumeric: "tabular-nums",
                  width: 80,
                }}
              >
                {a.sigma}
              </span>
              <span
                style={{
                  ...mono,
                  fontSize: "11px",
                  color: GA.textDim,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  width: 160,
                }}
              >
                {a.zone}
              </span>
              <span
                style={{
                  ...mono,
                  fontSize: "11px",
                  color: GA.textDim,
                  fontVariantNumeric: "tabular-nums",
                  width: 60,
                  textAlign: "right",
                }}
              >
                {a.time}
              </span>
            </div>
          ))}
        </div>
        <Caption>ANOMALYALERT · severity-coded left bar · σ magnitude · pulled from live anomaly detection</Caption>
      </div>

      {/* Row 6 — Regional Filters */}
      <div style={{ paddingBottom: 64 }}>
        <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
          <div style={{ position: "relative", paddingBottom: 12 }}>
            <span
              style={{
                ...mono,
                fontSize: "13px",
                color: GA.text,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
              }}
            >
              <span style={{ color: GA.green }}>● </span>
              US (PJM · ERCOT · CAISO · NYISO)
            </span>
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, background: GA.blue }} />
          </div>
          {["BRASIL", "CHINA", "GLOBAL"].map((r) => (
            <div key={r} style={{ paddingBottom: 12 }}>
              <span
                style={{
                  ...mono,
                  fontSize: "13px",
                  color: GA.textDim,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {r}
              </span>
            </div>
          ))}
        </div>
        <Caption>REGIONALFILTER · tab strip · top of Peregrine page · filters feed by market</Caption>
      </div>

      {/* Row 7 — Source Filter Rail */}
      <div style={{ paddingBottom: 40 }}>
        <div
          style={{
            width: 240,
            minHeight: 400,
            padding: 16,
            background: GA.card,
            border: `1px solid ${GA.rule}`,
            borderRadius: 8,
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <Eyebrow>SOURCES</Eyebrow>
          </div>
          {[
            { id: "ER", name: "ERCOT OP", count: 12, color: GA.gold, active: true },
            { id: "PJ", name: "PJM OPS", count: 8, color: GA.blue, active: false },
            { id: "FE", name: "FERC", count: 3, color: GA.red, active: false },
            { id: "EIA", name: "EIA", count: 6, color: GA.green, active: false },
            { id: "CA", name: "CAISO", count: 9, color: "#F97316", active: false },
          ].map((s) => (
            <div
              key={s.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                paddingLeft: s.active ? 8 : 0,
                borderLeft: s.active ? `2px solid ${GA.blue}` : "none",
                marginLeft: s.active ? -16 : 0,
                paddingRight: 0,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  background: s.color,
                  ...mono,
                  fontSize: "10px",
                  color: "#111",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                }}
              >
                {s.id}
              </div>
              <span style={{ ...sans, fontSize: "13px", color: GA.text, flex: 1 }}>{s.name}</span>
              <span style={{ ...mono, fontSize: "10px", color: GA.textDim, fontVariantNumeric: "tabular-nums" }}>
                {s.count}
              </span>
            </div>
          ))}
        </div>
        <Caption>SOURCEFILTER · left rail · logos + names + counts · multi-select</Caption>
      </div>
    </section>
  );
}

export function Section07Controls() {
  const btnBase: React.CSSProperties = {
    ...mono,
    fontSize: "12px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    height: 36,
    padding: "0 16px",
    borderRadius: 6,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };
  return (
    <section>
      <SectionHeader num="07" title="Controls & Inputs" />

      {/* Buttons */}
      <div style={{ paddingBottom: 48 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ ...btnBase, background: GA.blue, color: GA.white, border: `1px solid ${GA.blue}` }}>
            RUN SCENARIO
          </div>
          <div style={{ ...btnBase, background: "transparent", color: GA.text, border: `1px solid ${GA.ruleStrong}` }}>
            EXPORT
          </div>
          <div
            style={{
              ...btnBase,
              width: 36,
              padding: 0,
              background: "transparent",
              border: `1px solid ${GA.ruleStrong}`,
              color: GA.text,
            }}
          >
            ⋯
          </div>
        </div>
        <Caption>BUTTONS · Primary (solid blue) · Ghost (1px border) · Icon-only · 36h · radius 6px · never pill</Caption>
      </div>

      {/* Dropdown / MultiSelect / Toggle / Slider / Search */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40, paddingBottom: 48 }}>
        <div>
          <div
            style={{
              height: 36,
              padding: "0 12px",
              background: GA.card,
              border: `1px solid ${GA.ruleStrong}`,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              ...sans,
              fontSize: "13px",
              color: GA.text,
            }}
          >
            <span>PJM WESTERN_HUB</span>
            <span style={{ color: GA.textDim }}>▾</span>
          </div>
          <Caption>DROPDOWN · 36h · mono value · caret right</Caption>
        </div>
        <div>
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              padding: 6,
              background: GA.card,
              border: `1px solid ${GA.ruleStrong}`,
              borderRadius: 6,
              minHeight: 36,
              alignItems: "center",
            }}
          >
            {["PJM", "ERCOT", "CAISO"].map((t) => (
              <span
                key={t}
                style={{
                  ...mono,
                  fontSize: "11px",
                  padding: "4px 8px",
                  background: "rgba(59,130,246,0.12)",
                  color: GA.blue,
                  borderRadius: 4,
                  letterSpacing: "0.08em",
                }}
              >
                {t} ✕
              </span>
            ))}
          </div>
          <Caption>MULTISELECT · chip row · 4px radius · no pills</Caption>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 36,
                height: 20,
                background: GA.blue,
                borderRadius: 10,
                position: "relative",
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  background: GA.white,
                  borderRadius: 7,
                  position: "absolute",
                  top: 3,
                  right: 3,
                }}
              />
            </div>
            <span style={{ ...mono, fontSize: "11px", color: GA.textDim, letterSpacing: "0.12em" }}>AUTO REFRESH</span>
          </div>
          <Caption>TOGGLE · 36×20 · blue on, muted off</Caption>
        </div>
        <div>
          <div style={{ position: "relative", height: 24 }}>
            <div style={{ position: "absolute", top: 11, left: 0, right: 0, height: 2, background: GA.ruleStrong }} />
            <div style={{ position: "absolute", top: 11, left: 0, width: "60%", height: 2, background: GA.blue }} />
            <div
              style={{
                position: "absolute",
                top: 6,
                left: "calc(60% - 6px)",
                width: 12,
                height: 12,
                background: GA.white,
                borderRadius: 6,
              }}
            />
          </div>
          <Caption>SLIDER · 2px track · 12px handle · blue fill</Caption>
        </div>
        <div>
          <div
            style={{
              height: 36,
              padding: "0 12px",
              background: GA.card,
              border: `1px solid ${GA.ruleStrong}`,
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ color: GA.textDim }}>⌕</span>
            <span style={{ ...sans, fontSize: "13px", color: GA.textDim }}>Search zones, contracts, pages…</span>
            <span style={{ marginLeft: "auto", ...mono, fontSize: "10px", color: GA.textDim, letterSpacing: "0.12em" }}>⌘K</span>
          </div>
          <Caption>SEARCH · ⌘K hint right · 36h</Caption>
        </div>
        <div>
          <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${GA.rule}` }}>
            {["OVERVIEW", "FUNDAMENTALS", "FLOW"].map((t, i) => (
              <div
                key={t}
                style={{
                  ...mono,
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  color: i === 0 ? GA.text : GA.textDim,
                  padding: "12px 16px",
                  borderBottom: i === 0 ? `2px solid ${GA.blue}` : "none",
                  marginBottom: -1,
                }}
              >
                {t}
              </div>
            ))}
          </div>
          <Caption>TABSTRIP · 2px underline active · mono labels</Caption>
        </div>
      </div>

      {/* Breadcrumb + ZoneSelector */}
      <div style={{ paddingBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, ...mono, fontSize: "11px", letterSpacing: "0.12em", color: GA.textDim }}>
          <span>ANALYTICS</span>
          <span>/</span>
          <span>RESOURCE GAP</span>
          <span>/</span>
          <span style={{ color: GA.text }}>PJM 2026</span>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
          {["WEST", "AEP", "DOM", "PJM_RTO", "CHICAGO"].map((z, i) => (
            <div
              key={z}
              style={{
                ...mono,
                fontSize: "11px",
                letterSpacing: "0.12em",
                padding: "8px 12px",
                border: `1px solid ${i === 0 ? GA.blue : GA.ruleStrong}`,
                color: i === 0 ? GA.blue : GA.textDim,
                borderRadius: 4,
              }}
            >
              {z}
            </div>
          ))}
        </div>
        <Caption>BREADCRUMB + ZONESELECTOR · mono caps · active outlined blue</Caption>
      </div>
    </section>
  );
}

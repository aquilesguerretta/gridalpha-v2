import React from "react";
import { GA, serif, mono, sans, Caption, SectionHeader, Eyebrow } from "./ga-primitives";

export function Section01Numbers() {
  return (
    <section>
      <SectionHeader num="01" title="Numbers & Data Display" />

      {/* Row 1 — HeroNumber alone */}
      <div
        style={{
          height: 400,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 200,
          paddingRight: 200,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          <div style={{ ...serif, fontSize: "120px", color: GA.white, lineHeight: 1 }}>33.50</div>
          <div
            style={{
              ...mono,
              fontSize: "18px",
              color: GA.textDim,
              marginTop: 18,
            }}
          >
            $/MWh
          </div>
        </div>
        <Caption>
          HERONUMBER · Instrument Serif 120px · display metric · page hero · no container · 96–120px
          depending on context
        </Caption>
      </div>

      {/* Row 2 — supporting number sizes */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 48,
          paddingTop: 80,
          paddingBottom: 80,
        }}
      >
        <div>
          <div style={{ ...serif, fontSize: "56px", color: GA.white, lineHeight: 1 }}>42.80</div>
          <Caption>LARGENUMBER · Instrument Serif 56px · sub-hero metric</Caption>
        </div>
        <div>
          <div
            style={{
              ...mono,
              fontSize: "24px",
              fontWeight: 500,
              color: GA.white,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
            }}
          >
            +14.9
          </div>
          <Caption>DATAVALUE · Geist Mono 500 24px · tabular-nums · metric tile</Caption>
        </div>
        <div>
          <div
            style={{
              ...mono,
              fontSize: "14px",
              fontWeight: 400,
              color: GA.white,
              fontVariantNumeric: "tabular-nums",
              lineHeight: 1,
            }}
          >
            28.42
          </div>
          <Caption>COMPACTVALUE · Geist Mono 400 14px · tabular-nums · tables / dense</Caption>
        </div>
        <div>
          <div style={{ display: "flex", gap: 16, ...mono, fontSize: "13px" }}>
            <span style={{ color: GA.green }}>▲ 2.14</span>
            <span style={{ color: GA.red }}>▼ 1.82</span>
            <span style={{ color: GA.textFaint }}>▶ 0.00</span>
          </div>
          <Caption>CHANGEDELTA · Geist Mono 13px · directional glyph + value</Caption>
        </div>
      </div>

      {/* Row 3 — Units */}
      <div style={{ paddingTop: 40, paddingBottom: 40 }}>
        <div
          style={{
            display: "flex",
            gap: 40,
            ...mono,
            fontSize: "11px",
            letterSpacing: "0.08em",
            color: GA.textDim,
            textTransform: "uppercase",
          }}
        >
          <span>$/MWh</span>
          <span>GW</span>
          <span>%</span>
          <span>MMBtu</span>
          <span>MW</span>
          <span>bps</span>
        </div>
        <Caption>UNIT · Geist Mono 11px · textMuted · always paired with a number, never standalone</Caption>
      </div>
    </section>
  );
}

function Swatch({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

export function Section02Labels() {
  return (
    <section>
      <SectionHeader num="02" title="Labels, Eyebrows, Markers" />

      {/* Row 1 — text labels */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 48,
          paddingBottom: 80,
        }}
      >
        <Swatch>
          <Eyebrow color={GA.blue}>01 · LIVE MARKETS</Eyebrow>
          <Caption>SECTIONEYEBROW · Geist Mono 11px · #3B82F6 · letter-spacing 0.18em</Caption>
        </Swatch>
        <Swatch>
          <div
            style={{
              ...mono,
              fontSize: "11px",
              letterSpacing: "0.08em",
              color: GA.textDim,
              textTransform: "uppercase",
            }}
          >
            WESTERN_HUB LMP
          </div>
          <Caption>CARDLABEL · Geist Mono 11px · textMuted · letter-spacing 0.08em</Caption>
        </Swatch>
        <Swatch>
          <div
            style={{
              ...mono,
              fontSize: "10px",
              letterSpacing: "0.08em",
              color: GA.textFaint,
              textTransform: "uppercase",
            }}
          >
            24H AVG
          </div>
          <Caption>SUBLABEL · Geist Mono 10px · textFaint · secondary metadata</Caption>
        </Swatch>
        <Swatch>
          <div
            style={{
              ...mono,
              fontSize: "10px",
              color: GA.textFaint,
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "0.04em",
            }}
          >
            16:42 CT · 4 MIN AGO
          </div>
          <Caption>TIMESTAMPLABEL · Geist Mono 10px · tabular-nums · relative + absolute</Caption>
        </Swatch>
      </div>

      {/* Row 2 — StatusBadge */}
      <div style={{ paddingBottom: 64 }}>
        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {[
            { label: "LIVE", color: GA.green, dot: "●" },
            { label: "STALE", color: GA.gold, dot: "●" },
            { label: "OFFLINE", color: GA.red, dot: "●" },
            { label: "SIMULATED", color: GA.gold, dot: "◐" },
          ].map((b) => (
            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: b.color, fontSize: 12 }}>{b.dot}</span>
              <span
                style={{
                  ...mono,
                  fontSize: "11px",
                  letterSpacing: "0.12em",
                  color: b.color,
                  textTransform: "uppercase",
                }}
              >
                {b.label}
              </span>
            </div>
          ))}
        </div>
        <Caption>
          STATUSBADGE · leading indicator + mono text · NO pill background · NO border · color lives in the
          dot and text
        </Caption>
      </div>

      {/* Row 3 — RegimeBadge */}
      <div style={{ paddingBottom: 64 }}>
        <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          {[
            { label: "BURNING", color: GA.gold },
            { label: "SUPPRESSED", color: GA.blue },
            { label: "EMERGENCY", color: GA.red },
            { label: "DISCHARGING", color: GA.gold },
            { label: "CHARGING", color: GA.blue },
            { label: "NORMAL", color: GA.textDim },
          ].map((b) => (
            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: b.color, fontSize: 12 }}>●</span>
              <span
                style={{
                  ...mono,
                  fontSize: "11px",
                  letterSpacing: "0.18em",
                  color: b.color,
                  textTransform: "uppercase",
                }}
              >
                {b.label}
              </span>
            </div>
          ))}
        </div>
        <Caption>REGIMEBADGE · dot + caps mono · 6 states · signals market regime without chrome</Caption>
      </div>

      {/* Row 4 — Eyebrow patterns */}
      <div style={{ paddingBottom: 40 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Eyebrow color={GA.blue}>01 · ANALYTICS</Eyebrow>
          <Eyebrow color={GA.blue}>LIVE MARKETS</Eyebrow>
          <Eyebrow color={GA.gold}>FOUNDER NOTE · 2026</Eyebrow>
        </div>
        <Caption>
          EYEBROW · Geist Mono 11px · letterSpacing 0.18em · uppercase · #3B82F6 or #F59E0B (gold for
          Peregrine destination)
        </Caption>
      </div>
    </section>
  );
}

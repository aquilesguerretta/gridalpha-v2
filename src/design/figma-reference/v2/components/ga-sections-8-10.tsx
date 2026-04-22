import React from "react";
import { GA, serif, mono, sans, Caption, SectionHeader, Eyebrow } from "./ga-primitives";

function BoltIcon({ size = 32, color = GA.blue }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <polygon points="16,2 30,10 30,22 16,30 2,22 2,10" fill="none" stroke={color} strokeWidth={1.5} />
      <polygon points="14,10 20,10 16,16 20,16 12,24 15,17 10,17" fill={color} />
    </svg>
  );
}

function NavShell({ height, wordmark }: { height: number; wordmark: boolean }) {
  const navItems = ["THE NEST", "GRID ATLAS", "PEREGRINE", "ANALYTICS", "VAULT"];
  const size = wordmark ? 13 : 11;
  return (
    <div
      style={{
        height,
        borderBottom: `1px solid ${GA.rule}`,
        display: "flex",
        alignItems: "center",
        padding: "0 32px",
        gap: 40,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <BoltIcon size={wordmark ? 32 : 20} />
        {wordmark && (
          <div>
            <div style={{ ...serif, fontStyle: "italic", fontSize: "28px", color: GA.text, lineHeight: 1 }}>
              GridAlpha
            </div>
            <div
              style={{
                ...mono,
                fontSize: "11px",
                letterSpacing: "0.08em",
                color: GA.textDim,
                marginTop: 4,
              }}
            >
              Energy intelligence, everywhere
            </div>
          </div>
        )}
      </div>
      <div style={{ flex: 1, display: "flex", justifyContent: "center", gap: 32 }}>
        {navItems.map((n, i) => (
          <div
            key={n}
            style={{
              position: "relative",
              padding: "6px 0",
              ...mono,
              fontSize: `${size}px`,
              letterSpacing: "0.12em",
              color: i === 0 ? GA.text : GA.textDim,
            }}
          >
            {n}
            {i === 0 && (
              <div
                style={{
                  position: "absolute",
                  bottom: -2,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: GA.blue,
                }}
              />
            )}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <div
          style={{
            height: wordmark ? 36 : 28,
            padding: "0 12px",
            border: `1px solid ${GA.ruleStrong}`,
            borderRadius: 6,
            display: "flex",
            alignItems: "center",
            gap: 8,
            ...mono,
            fontSize: wordmark ? "12px" : "11px",
            color: GA.textDim,
            letterSpacing: "0.08em",
          }}
        >
          ⌘K {wordmark ? "Search" : ""}
        </div>
        {wordmark && <span style={{ color: GA.textDim, fontSize: 16 }}>⏻</span>}
        <div
          style={{
            width: wordmark ? 32 : 24,
            height: wordmark ? 32 : 24,
            borderRadius: "50%",
            background: GA.card,
            border: `1px solid ${GA.ruleStrong}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...mono,
            fontSize: wordmark ? "11px" : "10px",
            color: GA.text,
            letterSpacing: "0.05em",
          }}
        >
          AG
        </div>
      </div>
    </div>
  );
}

export function Section08Nav() {
  return (
    <section>
      <SectionHeader num="08" title="Navigation & Shell" />

      <div style={{ paddingBottom: 48 }}>
        <NavShell height={88} wordmark={true} />
        <Caption>HERONAV · 88px · shown on initial page load · transforms to CompressedNav on scroll past 120px</Caption>
      </div>

      <div style={{ paddingBottom: 48 }}>
        <NavShell height={48} wordmark={false} />
        <Caption>COMPRESSEDNAV · 48px · transforms from HeroNav on scroll · transform-animated, not height-animated</Caption>
      </div>

      <div
        style={{
          paddingBottom: 48,
          ...mono,
          fontSize: "11px",
          letterSpacing: "0.12em",
          color: GA.textDim,
          display: "flex",
          gap: 32,
        }}
      >
        <span>TRIGGER · SCROLL 120PX</span>
        <span>DURATION · 200MS</span>
        <span>EASING · CUBIC-BEZIER(0.4,0,0.2,1)</span>
      </div>

      {/* SectionHeader */}
      <div style={{ paddingBottom: 48 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <Eyebrow color={GA.blue}>03 · ANALYTICS</Eyebrow>
            <div style={{ ...serif, fontSize: "48px", color: GA.text, marginTop: 16, lineHeight: 1.05 }}>
              Resource Gap Analysis
            </div>
            <div style={{ ...sans, fontSize: "16px", color: GA.textDim, marginTop: 12, lineHeight: 1.5 }}>
              Forward-looking capacity adequacy across ISO regions, 2026–2030.
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div
              style={{
                ...mono,
                fontSize: "12px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                height: 36,
                padding: "0 16px",
                borderRadius: 6,
                border: `1px solid ${GA.ruleStrong}`,
                color: GA.text,
                display: "flex",
                alignItems: "center",
              }}
            >
              EXPORT
            </div>
            <div
              style={{
                ...mono,
                fontSize: "12px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                height: 36,
                padding: "0 16px",
                borderRadius: 6,
                background: GA.blue,
                color: GA.white,
                display: "flex",
                alignItems: "center",
              }}
            >
              RUN SCENARIO
            </div>
          </div>
        </div>
        <Caption>SECTIONHEADER · per-page header · eyebrow + serif title + subtitle + right actions</Caption>
      </div>

      {/* Back / Progress / Keyboard */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 40, paddingBottom: 40 }}>
        <div>
          <div
            style={{
              ...mono,
              fontSize: "12px",
              letterSpacing: "0.08em",
              color: GA.textDim,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            ← BACK TO ANALYTICS
          </div>
          <Caption>BACKBUTTON · chevron + mono label · no button chrome</Caption>
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {[1, 2, 3, 4].map((s, i) => (
              <React.Fragment key={s}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    border: `1px solid ${i <= 1 ? GA.blue : GA.ruleStrong}`,
                    background: i <= 1 ? GA.blue : "transparent",
                    color: i <= 1 ? GA.white : GA.textDim,
                    ...mono,
                    fontSize: "11px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {s}
                </div>
                {i < 3 && <div style={{ flex: 1, height: 1, background: i < 1 ? GA.blue : GA.ruleStrong }} />}
              </React.Fragment>
            ))}
          </div>
          <Caption>PROGRESSINDICATOR · 4 step dots · blue active · 1px connectors</Caption>
        </div>
        <div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {["⌘", "K"].map((k) => (
              <span
                key={k}
                style={{
                  ...mono,
                  fontSize: "11px",
                  color: GA.text,
                  padding: "4px 8px",
                  border: `1px solid ${GA.ruleStrong}`,
                  borderRadius: 4,
                  background: GA.card,
                }}
              >
                {k}
              </span>
            ))}
            <span style={{ ...mono, fontSize: "11px", color: GA.textDim, letterSpacing: "0.08em" }}>OPEN PALETTE</span>
          </div>
          <Caption>KEYBOARDSHORTCUT · mono keycaps · 4px radius · description right</Caption>
        </div>
      </div>
    </section>
  );
}

export function Section09Map() {
  return (
    <section>
      <SectionHeader num="09" title="Map & Spatial" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 48, paddingBottom: 40 }}>
        {/* Markers */}
        <div>
          <div style={{ display: "flex", gap: 24, alignItems: "center", padding: "32px 0" }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: GA.blue, boxShadow: `0 0 0 4px rgba(59,130,246,0.2)` }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: GA.gold }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: GA.red }} />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                border: `2px solid ${GA.white}`,
                background: "transparent",
              }}
            />
          </div>
          <Caption>MAPMARKER · 4 variants · active / warning / alert / selected · halo on active</Caption>
        </div>
        <div>
          <div
            style={{
              ...mono,
              fontSize: "11px",
              letterSpacing: "0.12em",
              color: GA.text,
              padding: "6px 10px",
              background: "rgba(20,20,26,0.9)",
              border: `1px solid ${GA.ruleStrong}`,
              borderRadius: 4,
              display: "inline-block",
            }}
          >
            WESTERN_HUB · 52.18
          </div>
          <Caption>MAPLABEL · mono 11px · dark translucent bg · pinned to node</Caption>
        </div>
        <div>
          <div
            style={{
              background: GA.card,
              border: `1px solid ${GA.ruleStrong}`,
              borderRadius: 6,
              padding: 12,
              maxWidth: 220,
            }}
          >
            <div style={{ ...mono, fontSize: "10px", letterSpacing: "0.12em", color: GA.textDim }}>
              PJM · WESTERN_HUB
            </div>
            <div style={{ ...mono, fontSize: "18px", color: GA.white, marginTop: 6, fontVariantNumeric: "tabular-nums" }}>
              52.18 <span style={{ fontSize: "11px", color: GA.textDim }}>$/MWh</span>
            </div>
            <div style={{ ...mono, fontSize: "11px", color: GA.green, marginTop: 4 }}>▲ 2.14</div>
          </div>
          <Caption>MAPTOOLTIP · zone readout · mono value · hover from marker</Caption>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 48, paddingBottom: 40 }}>
        <div>
          <div
            style={{
              background: GA.card,
              border: `1px solid ${GA.rule}`,
              borderRadius: 8,
              padding: 16,
            }}
          >
            <Eyebrow>LAYERS</Eyebrow>
            <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { n: "LMP SURFACE", on: true },
                { n: "TRANSMISSION", on: true },
                { n: "CONGESTION", on: false },
                { n: "GENERATION", on: false },
                { n: "LOAD CENTERS", on: true },
              ].map((l) => (
                <div key={l.n} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      border: `1px solid ${l.on ? GA.blue : GA.ruleStrong}`,
                      background: l.on ? GA.blue : "transparent",
                      borderRadius: 2,
                    }}
                  />
                  <span
                    style={{
                      ...mono,
                      fontSize: "11px",
                      letterSpacing: "0.12em",
                      color: l.on ? GA.text : GA.textDim,
                    }}
                  >
                    {l.n}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <Caption>MAPLAYERPANEL · toggle list · 12px checkboxes · mono labels</Caption>
        </div>
        <div>
          <div
            style={{
              background: GA.card,
              border: `1px solid ${GA.rule}`,
              borderRadius: 8,
              padding: 16,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", ...mono, fontSize: "11px", color: GA.textDim, letterSpacing: "0.12em" }}>
              <span>-24H</span>
              <span style={{ color: GA.blue }}>NOW</span>
              <span>+6H</span>
            </div>
            <div style={{ position: "relative", height: 24, marginTop: 12 }}>
              <div style={{ position: "absolute", top: 11, left: 0, right: 0, height: 2, background: GA.ruleStrong }} />
              <div style={{ position: "absolute", top: 11, left: 0, width: "80%", height: 2, background: GA.blue }} />
              {[0, 0.2, 0.4, 0.6, 0.8].map((p) => (
                <div
                  key={p}
                  style={{
                    position: "absolute",
                    top: 7,
                    left: `${p * 100}%`,
                    width: 2,
                    height: 10,
                    background: GA.textDim,
                  }}
                />
              ))}
              <div
                style={{
                  position: "absolute",
                  top: 6,
                  left: "calc(80% - 6px)",
                  width: 12,
                  height: 12,
                  background: GA.white,
                  borderRadius: 6,
                }}
              />
            </div>
            <div style={{ marginTop: 12, ...mono, fontSize: "11px", color: GA.textDim, fontVariantNumeric: "tabular-nums" }}>
              PLAYHEAD · 14:22 CT · 2026-04-21
            </div>
          </div>
          <Caption>TIMESCRUBBER · -24H→+6H · playhead · tick marks · mono readout</Caption>
        </div>
      </div>
    </section>
  );
}

export function Section10Overlays() {
  return (
    <section>
      <SectionHeader num="10" title="Overlays" />

      {/* Modal */}
      <div style={{ paddingBottom: 64 }}>
        <div
          style={{
            width: "100%",
            height: 480,
            background: "rgba(10,10,15,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: `1px solid ${GA.rule}`,
          }}
        >
          <div
            style={{
              width: 600,
              minHeight: 360,
              background: GA.card,
              border: `1px solid ${GA.ruleStrong}`,
              borderRadius: 8,
              padding: 32,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: GA.gold, fontSize: 12 }}>●</span>
              <span style={{ ...mono, fontSize: "11px", color: GA.gold, letterSpacing: "0.18em" }}>CONFIRM ACTION</span>
            </div>
            <div style={{ ...serif, fontSize: "24px", color: GA.text, lineHeight: 1.25 }}>
              Publish scenario to shared workspace?
            </div>
            <div style={{ ...sans, fontSize: "14px", color: GA.textSub, lineHeight: 1.6 }}>
              This scenario will be visible to all members of the Quant Desk workspace. Published scenarios
              can be rolled back from the Vault.
            </div>
            <div style={{ marginTop: "auto", display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <div
                style={{
                  ...mono,
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  height: 36,
                  padding: "0 16px",
                  borderRadius: 6,
                  border: `1px solid ${GA.ruleStrong}`,
                  color: GA.text,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                CANCEL
              </div>
              <div
                style={{
                  ...mono,
                  fontSize: "12px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  height: 36,
                  padding: "0 16px",
                  borderRadius: 6,
                  background: GA.blue,
                  color: GA.white,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                PUBLISH <span style={{ opacity: 0.8 }}>↵</span>
              </div>
            </div>
          </div>
        </div>
        <Caption>MODAL · solid backdrop (no blur) · terminal buttons · inline keyboard hint</Caption>
      </div>

      {/* Drawer */}
      <div style={{ paddingBottom: 64 }}>
        <div
          style={{
            width: "100%",
            height: 480,
            position: "relative",
            background: GA.bg,
            border: `1px solid ${GA.rule}`,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: 400,
              background: GA.card,
              borderLeft: `1px solid ${GA.ruleStrong}`,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Eyebrow spacing="0.12em" color={GA.textDim}>
                CONTEXTUAL NEWS
              </Eyebrow>
              <span
                style={{
                  ...mono,
                  fontSize: "10px",
                  color: GA.textDim,
                  padding: "4px 8px",
                  border: `1px solid ${GA.ruleStrong}`,
                  borderRadius: 4,
                }}
              >
                ESC
              </span>
            </div>
            <div style={{ ...serif, fontSize: "22px", color: GA.text, lineHeight: 1.25 }}>
              PJM WEST congestion at Homer City extends into second session
            </div>
            <div style={{ ...sans, fontSize: "13px", color: GA.textSub, lineHeight: 1.6 }}>
              Transmission operators cite unplanned derate. Spot prices in AEP zone have traded at a
              sustained premium to the RTO hub for 9 consecutive intervals.
            </div>
            <div style={{ marginTop: "auto", ...mono, fontSize: "10px", color: GA.textDim, letterSpacing: "0.12em" }}>
              PJM OPS · 14:22 CT
            </div>
          </div>
        </div>
        <Caption>DRAWER · 400w · slides from right · ESC key close (no X icon) · no scrim</Caption>
      </div>

      {/* Toasts */}
      <div style={{ paddingBottom: 64 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { c: GA.green, m: "Scenario saved to Vault", t: "14:22" },
            { c: GA.gold, m: "Data feed delayed 4 min", t: "14:18" },
            { c: GA.red, m: "ERCOT endpoint temporarily down", t: "14:10" },
            { c: GA.blue, m: "New anomaly detected WESTERN_HUB", t: "14:08" },
          ].map((t) => (
            <div
              key={t.m}
              style={{
                width: 340,
                height: 48,
                background: GA.card,
                borderLeft: `4px solid ${t.c}`,
                borderTop: `1px solid ${GA.rule}`,
                borderRight: `1px solid ${GA.rule}`,
                borderBottom: `1px solid ${GA.rule}`,
                display: "flex",
                alignItems: "center",
                padding: "0 14px",
                gap: 12,
              }}
            >
              <span style={{ ...sans, fontSize: "13px", color: GA.text, flex: 1 }}>{t.m}</span>
              <span style={{ ...mono, fontSize: "10px", color: GA.textDim, fontVariantNumeric: "tabular-nums" }}>
                {t.t}
              </span>
            </div>
          ))}
        </div>
        <Caption>TOAST · 4px left accent · NO icon · NO pill · color IS the signal</Caption>
      </div>

      {/* Tooltip */}
      <div style={{ paddingBottom: 64 }}>
        <div
          style={{
            maxWidth: 200,
            background: GA.card,
            border: `1px solid ${GA.ruleStrong}`,
            padding: 10,
            borderRadius: 4,
          }}
        >
          <div style={{ ...mono, fontSize: "10px", color: GA.white, fontVariantNumeric: "tabular-nums", marginBottom: 6 }}>
            SPARK SPREAD
          </div>
          <div style={{ ...sans, fontSize: "12px", color: GA.textSub, lineHeight: 1.4 }}>
            The margin between power price and the fuel cost of the marginal gas generator.
          </div>
        </div>
        <Caption>TOOLTIP · 200px max · mono for data, sans for description · NO arrow/tail</Caption>
      </div>

      {/* CommandPalette */}
      <div style={{ paddingBottom: 40 }}>
        <div
          style={{
            width: 600,
            minHeight: 480,
            background: GA.card,
            border: `1px solid ${GA.ruleStrong}`,
            borderRadius: 8,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              height: 52,
              padding: "0 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderBottom: `1px solid ${GA.rule}`,
            }}
          >
            <span style={{ color: GA.textDim, fontSize: 16 }}>⌕</span>
            <span style={{ ...mono, fontSize: "14px", color: GA.text, fontVariantNumeric: "tabular-nums" }}>ercot</span>
            <span
              style={{
                marginLeft: "auto",
                ...mono,
                fontSize: "10px",
                color: GA.textDim,
                padding: "4px 8px",
                border: `1px solid ${GA.ruleStrong}`,
                borderRadius: 4,
                letterSpacing: "0.12em",
              }}
            >
              ESC
            </span>
          </div>
          <div style={{ padding: "12px 0" }}>
            {[
              {
                group: "ZONES",
                rows: [
                  { label: "ERCOT · NORTH", ctx: "Current LMP 52.18 $/MWh", active: true },
                  { label: "ERCOT · HOUSTON", ctx: "Current LMP 48.90 $/MWh", active: false },
                  { label: "ERCOT · SOUTH", ctx: "Current LMP 46.24 $/MWh", active: false },
                ],
              },
              {
                group: "PAGES",
                rows: [{ label: "Peregrine · ERCOT stories", ctx: "3 new · last 2h", active: false }],
              },
              {
                group: "ACTIONS",
                rows: [{ label: "Export current view as PDF", ctx: "⌘E", active: false }],
              },
            ].map((g) => (
              <div key={g.group}>
                <div style={{ padding: "8px 16px" }}>
                  <Eyebrow size={10} spacing="0.12em" color={GA.textDim}>
                    {g.group}
                  </Eyebrow>
                </div>
                {g.rows.map((r) => (
                  <div
                    key={r.label}
                    style={{
                      padding: "10px 16px",
                      paddingLeft: r.active ? 14 : 16,
                      borderLeft: r.active ? `2px solid ${GA.blue}` : "none",
                      background: r.active ? "rgba(59,130,246,0.06)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <span style={{ ...mono, fontSize: "13px", color: GA.text, flex: 1 }}>{r.label}</span>
                    <span style={{ ...mono, fontSize: "11px", color: GA.textDim, fontVariantNumeric: "tabular-nums" }}>
                      {r.ctx}
                    </span>
                    {r.active && <span style={{ ...mono, fontSize: "11px", color: GA.textDim }}>↵</span>}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
        <Caption>
          COMMANDPALETTE · grouped by eyebrow sections · inline context on the right of each result · ↵
          hint on active row
        </Caption>
      </div>
    </section>
  );
}

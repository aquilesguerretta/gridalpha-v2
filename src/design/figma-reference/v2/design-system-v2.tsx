import "./styles/fonts.css";
import { GA, serif, mono } from "./components/ga-primitives";
import { Section01Numbers, Section02Labels } from "./components/ga-sections-1-2";
import { Section03Composition, Section04Charts, Section05Tables } from "./components/ga-sections-3-5";
import { Section06Peregrine, Section07Controls } from "./components/ga-sections-6-7";
import { Section08Nav, Section09Map, Section10Overlays } from "./components/ga-sections-8-10";

function Divider() {
  return <div style={{ height: 1, background: GA.rule, width: "100%" }} />;
}

export default function App() {
  return (
    <div
      style={{
        background: GA.bg,
        minHeight: "100vh",
        width: "100%",
        color: GA.text,
      }}
    >
      <div
        style={{
          width: 1440,
          margin: "0 auto",
          padding: "120px 80px 120px",
        }}
      >
        {/* Masthead */}
        <header style={{ paddingBottom: 120 }}>
          <h1 style={{ ...serif, fontSize: "72px", color: GA.white, lineHeight: 1.05, margin: 0 }}>
            GridAlpha Terminal / Component Library v2
          </h1>
          <div
            style={{
              ...mono,
              fontSize: "11px",
              letterSpacing: "0.18em",
              color: GA.textFaint,
              textTransform: "uppercase",
              marginTop: 32,
            }}
          >
            SPECIFICATION · STATIC REFERENCE · LAST UPDATED APR 2026
          </div>
        </header>

        <Divider />
        <Section01Numbers />
        <Divider />
        <Section02Labels />
        <Divider />
        <Section03Composition />
        <Divider />
        <Section04Charts />
        <Divider />
        <Section05Tables />
        <Divider />
        <Section06Peregrine />
        <Divider />
        <Section07Controls />
        <Divider />
        <Section08Nav />
        <Divider />
        <Section09Map />
        <Divider />
        <Section10Overlays />
        <Divider />

        {/* Final note */}
        <div style={{ padding: "200px 0", textAlign: "center" }}>
          <div
            style={{
              ...serif,
              fontStyle: "italic",
              fontSize: "32px",
              color: GA.textMute,
              lineHeight: 1.35,
            }}
          >
            Chrome is the enemy of authority.
            <br />
            When in doubt, remove the border.
          </div>
          <div
            style={{
              ...mono,
              fontSize: "10px",
              letterSpacing: "0.18em",
              color: GA.textFaint,
              textTransform: "uppercase",
              marginTop: 48,
            }}
          >
            GRIDALPHA TERMINAL · COMPONENT LIBRARY v2 · STATIC REFERENCE
          </div>
        </div>
      </div>
    </div>
  );
}

import React from "react";

export const GA = {
  bg: "#0A0A0F",
  card: "#14141A",
  rule: "rgba(255,255,255,0.06)",
  ruleStrong: "rgba(255,255,255,0.08)",
  white: "#FFFFFF",
  text: "rgba(255,255,255,0.95)",
  textSub: "rgba(255,255,255,0.65)",
  textMute: "rgba(255,255,255,0.55)",
  textDim: "rgba(255,255,255,0.45)",
  textFaint: "rgba(255,255,255,0.35)",
  blue: "#3B82F6",
  gold: "#F59E0B",
  green: "#10B981",
  red: "#EF4444",
  grid: "rgba(255,255,255,0.04)",
};

export const serif = { fontFamily: "'Instrument Serif', serif", fontWeight: 400 as const };
export const mono = { fontFamily: "'Geist Mono', monospace" };
export const sans = { fontFamily: "'Inter', system-ui, sans-serif" };

export function Caption({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        ...mono,
        fontSize: "11px",
        letterSpacing: "0.08em",
        color: GA.textDim,
        marginTop: 20,
        textTransform: "uppercase",
        lineHeight: 1.5,
        maxWidth: 640,
      }}
    >
      {children}
    </div>
  );
}

export function SectionRule() {
  return <div style={{ height: 1, background: GA.rule, width: "100%" }} />;
}

export function SectionHeader({ num, title }: { num: string; title: string }) {
  return (
    <div style={{ paddingTop: 120, paddingBottom: 64 }}>
      <div
        style={{
          ...mono,
          fontSize: "11px",
          letterSpacing: "0.18em",
          color: GA.blue,
          textTransform: "uppercase",
          marginBottom: 24,
        }}
      >
        {num} · COMPONENT LIBRARY
      </div>
      <div style={{ ...serif, fontSize: "56px", color: GA.text, lineHeight: 1.05 }}>{title}</div>
    </div>
  );
}

export function Eyebrow({
  children,
  color = GA.blue,
  size = 11,
  spacing = "0.18em",
}: {
  children: React.ReactNode;
  color?: string;
  size?: number;
  spacing?: string;
}) {
  return (
    <div
      style={{
        ...mono,
        fontSize: `${size}px`,
        letterSpacing: spacing,
        color,
        textTransform: "uppercase",
      }}
    >
      {children}
    </div>
  );
}

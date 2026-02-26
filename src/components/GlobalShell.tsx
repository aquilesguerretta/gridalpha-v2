import { useState, useEffect, lazy, Suspense } from "react";
import FalconLogo from "./FalconLogo";

// Lazy load the 3D component to avoid SSR issues
const SparkSpreadSurface3D = lazy(() => import("./SparkSpreadSurface"));

type NavItem = {
  id: string;
  icon: React.ReactNode;
  label: string;
  code: string;
};

const navItems: NavItem[] = [
  { id: "nest", code: "01", icon: <HexagonIcon />, label: "THE NEST" },
  { id: "atlas", code: "02", icon: <DiamondIcon />, label: "GRID ATLAS" },
  { id: "analytics", code: "03", icon: <TargetIcon />, label: "ANALYTICS" },
  { id: "vault", code: "04", icon: <VaultIcon />, label: "VAULT" },
];

const viewLabels: Record<string, string> = {
  nest: "THE NEST",
  atlas: "GRID ATLAS",
  analytics: "ANALYTICS",
  vault: "VAULT",
};

// Icons
function HexagonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z" />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L22 12L12 22L2 12L12 2Z" />
      <path d="M12 7L17 12L12 17L7 12L12 7Z" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

function VaultIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M7 6V4a2 2 0 012-2h6a2 2 0 012 2v2" />
      <line x1="8" y1="11" x2="8" y2="15" />
      <line x1="12" y1="11" x2="12" y2="15" />
      <line x1="16" y1="11" x2="16" y2="15" />
    </svg>
  );
}

// FalconLogo imported from ./FalconLogo (Spline 3D + Zustand-driven state)

function CollapseToggle({ collapsed, onClick }: { collapsed: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center py-3 text-white/30 hover:text-white/60 transition-colors duration-200"
    >
      <span className="font-mono text-xs tracking-wider">{collapsed ? "»" : "«"}</span>
    </button>
  );
}

const navTooltips: Record<string, string> = {
  nest: "THE NEST · Passive Market Monitor",
  atlas: "GRID ATLAS · Spatial Intelligence",
  analytics: "ANALYTICS · Deep Insights",
  vault: "VAULT · Documentation Hub",
};

function NavButton({ item, active, collapsed, onClick }: { item: NavItem; active: boolean; collapsed: boolean; onClick: () => void }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={onClick}
        className={`relative w-full flex flex-col items-center justify-center transition-all duration-200 ${collapsed ? "py-4" : "py-3 px-2"}`}
        style={{ backgroundColor: active ? "rgba(0, 163, 255, 0.08)" : "transparent" }}
        onMouseEnter={(e) => {
          if (!active) e.currentTarget.style.backgroundColor = "rgba(0, 163, 255, 0.08)";
          if (collapsed) setShowTooltip(true);
        }}
        onMouseLeave={(e) => {
          if (!active) e.currentTarget.style.backgroundColor = "transparent";
          setShowTooltip(false);
        }}
      >
        {active && (
          <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: "#00A3FF", boxShadow: "0 0 12px 2px rgba(0, 163, 255, 0.4)" }} />
        )}
        <div className="transition-colors duration-200" style={{ color: active ? "#00A3FF" : "rgba(255, 255, 255, 0.3)" }}>
          {item.icon}
        </div>
        {!collapsed && (
          <span className="mt-1.5 text-[10px] font-medium tracking-wide" style={{ fontFamily: "'Geist', sans-serif", color: active ? "#00A3FF" : "rgba(255, 255, 255, 0.3)" }}>
            {item.label}
          </span>
        )}
      </button>
      
      {/* Glassmorphism Tooltip */}
      {collapsed && showTooltip && (
        <div
          className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 rounded-md whitespace-nowrap z-50 pointer-events-none"
          style={{
            backgroundColor: "rgba(10, 10, 11, 0.9)",
            backdropFilter: "blur(12px)",
            border: "0.5px solid rgba(255, 255, 255, 0.08)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
          }}
        >
          <span className="text-[10px] tracking-wide" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.7)" }}>
            {navTooltips[item.id]}
          </span>
        </div>
      )}
    </div>
  );
}

// Status Dot Component
function StatusDot({ status }: { status: "live" | "stale" | "fallback" }) {
  const colors = { live: "#00A3FF", stale: "#F59E0B", fallback: "#EF4444" };
  return (
    <div className="relative">
      {status === "live" && <div className="absolute inset-0 rounded-full animate-live-ping" style={{ backgroundColor: colors[status] }} />}
      <div
        className={`w-2 h-2 rounded-full relative ${status === "live" ? "animate-status-pulse" : ""}`}
        style={{ backgroundColor: colors[status], color: colors[status] }}
      />
    </div>
  );
}

// Header Bar with ping animation
function HeaderBar({ activeView }: { activeView: string }) {
  const [lmpValue] = useState(31.85);
  const [isLive] = useState(true);

  return (
    <header className="h-8 flex items-center justify-between px-4 shrink-0" style={{ backgroundColor: "#0A0A0B", borderBottom: "0.5px solid rgba(255, 255, 255, 0.08)" }}>
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold tracking-wide" style={{ fontFamily: "'Geist', sans-serif", color: "#EDEDED" }}>GRIDALPHA</span>
        <span className="text-[10px] tracking-wider" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.4)" }}>/ {viewLabels[activeView]}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-wider" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.4)" }}>LMP</span>
          <span className="text-xs font-medium" style={{ fontFamily: "'Geist Mono', monospace", fontVariantNumeric: "tabular-nums", color: "#00A3FF" }}>${lmpValue.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusDot status={isLive ? "live" : "stale"} />
          <span className="text-[9px] tracking-wider" style={{ fontFamily: "'Geist Mono', monospace", color: isLive ? "#00A3FF" : "#F59E0B" }}>{isLive ? "LIVE" : "STALE"}</span>
        </div>
      </div>
    </header>
  );
}

// Pulsing Dot Grid Background
function PulsingDotGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg width="100%" height="100%" className="animate-dot-pulse">
        <defs>
          <pattern id="dotGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#00A3FF" fillOpacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotGrid)" />
      </svg>
    </div>
  );
}

// PJM Territory Outline with Hub Dots
function PJMTerritory() {
  const hubs = [
    { x: 100, y: 55, label: "WEST HUB", delay: 0 },
    { x: 75, y: 70, label: "AEP", delay: 0.3 },
    { x: 130, y: 45, label: "PSEG", delay: 0.6 },
    { x: 60, y: 50, label: "COMED", delay: 0.9 },
    { x: 145, y: 65, label: "PECO", delay: 1.2 },
    { x: 85, y: 85, label: "DOMINION", delay: 1.5 },
    { x: 115, y: 75, label: "PPL", delay: 1.8 },
    { x: 50, y: 65, label: "DUQ", delay: 2.1 },
    { x: 140, y: 85, label: "JCPL", delay: 2.4 },
    { x: 70, y: 40, label: "ATSI", delay: 2.7 },
  ];

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet">
      {/* PJM Territory - PA-centered hexagonal cluster */}
      <path
        d="M40,60 L55,35 L85,25 L115,25 L145,35 L160,60 L150,85 L120,100 L80,100 L50,85 Z"
        stroke="#00A3FF"
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />
      {/* Inner transmission lines */}
      <path d="M55,35 L100,55 L145,35" stroke="#00A3FF" strokeWidth="0.5" fill="none" opacity="0.3" />
      <path d="M40,60 L100,55 L160,60" stroke="#00A3FF" strokeWidth="0.5" fill="none" opacity="0.3" />
      <path d="M50,85 L100,55 L150,85" stroke="#00A3FF" strokeWidth="0.5" fill="none" opacity="0.3" />
      <path d="M80,100 L100,55 L120,100" stroke="#00A3FF" strokeWidth="0.5" fill="none" opacity="0.3" />
      {/* Hub dots with staggered pulsing */}
      {hubs.map((hub, i) => (
        <g key={i}>
          <circle
            cx={hub.x}
            cy={hub.y}
            r="6"
            fill="#00A3FF"
            fillOpacity="0.15"
            className="animate-dot-pulse"
            style={{ animationDelay: `${hub.delay}s` }}
          />
          <circle cx={hub.x} cy={hub.y} r="3" fill="#00A3FF" fillOpacity="0.8" />
          <text
            x={hub.x}
            y={hub.y - 8}
            textAnchor="middle"
            fill="rgba(255,255,255,0.3)"
            fontSize="5"
            fontFamily="'Geist Mono', monospace"
          >
            {hub.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

// Bento Card Component
function BentoCard({ title, children, status = "live", className = "", style = {} }: { title: string; children: React.ReactNode; status?: "live" | "stale" | "fallback"; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`relative rounded-lg overflow-hidden ${className}`}
      style={{ backgroundColor: "rgba(10, 10, 11, 0.7)", backdropFilter: "blur(12px)", border: "0.5px solid rgba(255, 255, 255, 0.08)", ...style }}
    >
      <div className="absolute top-3 right-3 z-10"><StatusDot status={status} /></div>
      <div className="px-4 py-3" style={{ borderBottom: "0.5px solid rgba(255, 255, 255, 0.06)" }}>
        <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ fontFamily: "'Geist', sans-serif", color: "rgba(255, 255, 255, 0.5)" }}>{title}</span>
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}

// 24h Price Sparkline
function PriceSparkline24h() {
  // Realistic PJM price curve data points (24 hours)
  const priceData = [28, 26, 24, 23, 22, 24, 29, 35, 42, 38, 34, 32, 30, 31, 33, 36, 45, 52, 48, 40, 35, 32, 30, 31.85];
  const max = Math.max(...priceData);
  const min = Math.min(...priceData);
  const range = max - min;
  const points = priceData.map((v, i) => `${(i / 23) * 140 + 5},${35 - ((v - min) / range) * 30}`).join(" ");
  
  return (
    <svg width="150" height="40" className="mt-2">
      <polyline points={points} fill="none" stroke="#00A3FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="145" cy={35 - ((31.85 - min) / range) * 30} r="2.5" fill="#00FFF0" />
    </svg>
  );
}

// LMP Scorecard with enhanced glow and delta
function LMPScorecard() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-4">
      <span className="text-[10px] tracking-wider mb-1" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.4)" }}>WEST HUB LMP</span>
      <span
        className="text-5xl font-medium"
        style={{ fontFamily: "'Geist Mono', monospace", fontVariantNumeric: "tabular-nums", color: "#00FFF0", textShadow: "0 0 20px rgba(0, 255, 240, 0.6), 0 0 40px rgba(0, 255, 240, 0.3)" }}
      >
        31.85
      </span>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px] tracking-wider" style={{ fontFamily: "'Geist Mono', monospace", color: "#00A3FF" }}>$/MWh</span>
        <span className="text-[10px] font-medium" style={{ fontFamily: "'Geist Mono', monospace", color: "#FFB800" }}>▲ +2.4%</span>
      </div>
      <PriceSparkline24h />
    </div>
  );
}

// Mini Sparkline
function MiniSparkline() {
  const [offset, setOffset] = useState(0);
  useEffect(() => { const i = setInterval(() => setOffset(p => (p + 1) % 100), 80); return () => clearInterval(i); }, []);
  const points = Array.from({ length: 30 }, (_, i) => `${i * 5},${25 + Math.sin((i + offset) * 0.4) * 15}`).join(" ");
  return (
    <svg width="100%" height="50" className="mt-2">
      <polyline points={points} fill="none" stroke="#00A3FF" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// THE NEST View - Volumetric Bento
function NestView() {
  return (
    <div className="w-full h-full p-3 grid gap-2" style={{
      display: 'grid',
      gridTemplateColumns: '2fr 1.5fr 1fr',
      gridTemplateRows: '1fr 1fr 0.6fr',
      height: '100%',
      width: '100%',
      minHeight: '0',
    }}>
        {/* Market Pulse - spans 2 rows in first column */}
        <BentoCard title="MARKET PULSE" className="h-full w-full row-span-2" status="live" style={{ minHeight: 0, minWidth: 0 }}>
          <div className="relative h-full">
            <PulsingDotGrid />
            <PJMTerritory />
          </div>
        </BentoCard>

        {/* Peregrine Feed - Terminal Style */}
        <BentoCard title="PEREGRINE FEED" className="h-full w-full" status="live" style={{ minHeight: 0, minWidth: 0 }}>
          <div className="p-4 space-y-1.5">
            {[
              { msg: "Congestion spike — West Hub", severity: "critical", time: "09:15" },
              { msg: "DA/RT spread > $8 threshold", severity: "warning", time: "09:22" },
              { msg: "Wind ramp detected — OHIO", severity: "info", time: "09:29" },
              { msg: "Battery dispatch signal: ACTIVE", severity: "warning", time: "09:36" },
              { msg: "Transmission constraint — Rte 18", severity: "critical", time: "09:43" },
            ].map((alert, i) => (
              <div
                key={i}
                className="flex items-center gap-2 pl-2"
                style={{ borderLeft: `2px solid ${alert.severity === "critical" ? "#DC2626" : alert.severity === "warning" ? "#FFB800" : "#00FFF0"}` }}
              >
                <span className="text-[9px] tabular-nums" style={{ fontFamily: "'Geist Mono', monospace", fontVariantNumeric: "tabular-nums", color: "rgba(255, 255, 255, 0.3)" }}>{alert.time}</span>
                <span className="text-[10px]" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.6)" }}>{alert.msg}</span>
              </div>
            ))}
            {/* Blinking terminal cursor */}
            <div className="flex items-center gap-2 pl-2 mt-2" style={{ borderLeft: "2px solid transparent" }}>
              <span className="text-[9px]" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.3)" }}>09:50</span>
              <span className="text-[10px] animate-pulse" style={{ fontFamily: "'Geist Mono', monospace", color: "#00FFF0" }}>█</span>
            </div>
          </div>
        </BentoCard>

        {/* LMP Scorecard */}
        <BentoCard title="LMP / Hub" className="h-full w-full" status="live" style={{ minHeight: 0, minWidth: 0 }}>
          <LMPScorecard />
        </BentoCard>

        {/* Spark Spread */}
        <BentoCard title="SPARK SPREAD" className="h-full w-full" status="live" style={{ minHeight: 0, minWidth: 0 }}>
          <div className="p-4 flex flex-col items-center">
            <span className="text-3xl font-medium" style={{ fontFamily: "'Geist Mono', monospace", fontVariantNumeric: "tabular-nums", color: "#00A3FF" }}>12.7</span>
            <span className="text-[9px] mt-1" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.4)" }}>$/MWh</span>
            <MiniSparkline />
          </div>
        </BentoCard>

        {/* Battery ARB - Charge Windows */}
        <BentoCard title="BATTERY ARB" className="h-full w-full" status="stale" style={{ minHeight: 0, minWidth: 0 }}>
          <div className="p-3 flex flex-col items-center">
            <div className="relative w-14 h-14">
              <svg viewBox="0 0 36 36" className="w-full h-full">
                <circle cx="18" cy="18" r="16" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                <circle cx="18" cy="18" r="16" fill="none" stroke="#00FFF0" strokeWidth="2" strokeDasharray="71 100" strokeLinecap="round" transform="rotate(-90 18 18)" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-base font-medium" style={{ fontFamily: "'Geist Mono', monospace", fontVariantNumeric: "tabular-nums", color: "#00FFF0" }}>71%</span>
            </div>
            {/* Charge Windows Schedule */}
            <div className="mt-3 space-y-1 text-center">
              <div className="text-[9px]" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.5)" }}>
                CHARGE 02:00–06:00
              </div>
              <div className="text-[9px]" style={{ fontFamily: "'Geist Mono', monospace", color: "#FFB800" }}>
                DISCHARGE 16:00–20:00
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Generation Mix - Corrected Palette with MW Values */}
        <BentoCard title="GENERATION MIX" className="h-full w-full col-span-2" status="live" style={{ minHeight: 0, minWidth: 0 }}>
          <div className="p-4">
            {/* MW labels above bar */}
            <div className="flex h-4 mb-1">
              {[
                { w: "32%", mw: "28.4", c: "#A855F7" },
                { w: "28%", mw: "24.8", c: "#F97316" },
                { w: "14%", mw: "12.4", c: "#00FFF0" },
                { w: "10%", mw: "8.9", c: "#FFB800" },
                { w: "9%", mw: "8.0", c: "#64748B" },
                { w: "7%", mw: "6.2", c: "#3B82F6" },
              ].map((s, i) => (
                <div key={i} style={{ width: s.w }} className="flex justify-center">
                  <span className="text-[8px]" style={{ fontFamily: "'Geist Mono', monospace", fontVariantNumeric: "tabular-nums", color: s.c }}>{s.mw}</span>
                </div>
              ))}
            </div>
            {/* Stacked bar */}
            <div className="flex h-6 rounded overflow-hidden">
              {[
                { w: "32%", c: "#A855F7", l: "Nuclear" },
                { w: "28%", c: "#F97316", l: "Gas" },
                { w: "14%", c: "#00FFF0", l: "Wind" },
                { w: "10%", c: "#FFB800", l: "Solar" },
                { w: "9%", c: "#64748B", l: "Coal" },
                { w: "7%", c: "#3B82F6", l: "Hydro" },
              ].map((s, i) => (
                <div key={i} style={{ width: s.w, backgroundColor: s.c }} className="relative group">
                  <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[8px] whitespace-nowrap" style={{ fontFamily: "'Geist Mono', monospace", color: s.c }}>{s.l}</div>
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex gap-4 mt-4 flex-wrap">
              {[
                { c: "#A855F7", l: "Nuclear", v: "32%" },
                { c: "#F97316", l: "Gas", v: "28%" },
                { c: "#00FFF0", l: "Wind", v: "14%" },
                { c: "#FFB800", l: "Solar", v: "10%" },
                { c: "#64748B", l: "Coal", v: "9%" },
                { c: "#3B82F6", l: "Hydro", v: "7%" },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: s.c }} />
                  <span className="text-[9px]" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.5)" }}>{s.l} {s.v}</span>
                </div>
              ))}
            </div>
          </div>
        </BentoCard>

        {/* Resource Gap - Reserve Margin with Probability Ribbons */}
        <BentoCard title="RESOURCE GAP" className="h-full w-full" status="live" style={{ minHeight: 0, minWidth: 0 }}>
          <div className="p-4 h-full relative">
            {/* Reserve Margin Badge */}
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded" style={{ backgroundColor: "rgba(0, 163, 255, 0.1)", border: "1px solid rgba(0, 163, 255, 0.3)" }}>
              <span className="text-[8px] font-medium tracking-wider" style={{ fontFamily: "'Geist Mono', monospace", color: "#00A3FF" }}>RESERVE MARGIN: 18.4%</span>
            </div>
            {/* NOAA Uncertainty Badge */}
            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(255, 184, 0, 0.1)", border: "1px solid rgba(255, 184, 0, 0.3)" }}>
              <span className="text-[7px] tracking-wider" style={{ fontFamily: "'Geist Mono', monospace", color: "#FFB800" }}>±σ NOAA</span>
            </div>
            <svg viewBox="0 0 200 80" className="w-full h-full">
              <defs>
                {/* Confidence band gradients */}
                <linearGradient id="confidenceGradient95" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00A3FF" stopOpacity="0.08" />
                  <stop offset="50%" stopColor="#00A3FF" stopOpacity="0.12" />
                  <stop offset="100%" stopColor="#00A3FF" stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id="confidenceGradient68" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00A3FF" stopOpacity="0.15" />
                  <stop offset="50%" stopColor="#00A3FF" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#00A3FF" stopOpacity="0.15" />
                </linearGradient>
              </defs>

              {/* 95% Confidence Band (outer) - wider uncertainty */}
              <path
                d="M0,40 Q30,32 60,38 T120,36 T180,42 L200,40 L200,68 Q170,72 140,66 T80,70 T20,64 L0,66 Z"
                fill="url(#confidenceGradient95)"
                className="animate-confidence-breathe"
              />

              {/* 68% Confidence Band (inner) - tighter uncertainty */}
              <path
                d="M0,45 Q30,40 60,44 T120,42 T180,48 L200,46 L200,62 Q170,66 140,60 T80,64 T20,58 L0,60 Z"
                fill="url(#confidenceGradient68)"
                className="animate-confidence-breathe"
                style={{ animationDelay: "0.5s" }}
              />

              {/* Fill between capacity and load */}
              <path d="M0,25 Q50,20 100,22 T200,18 L200,55 Q150,50 100,52 T0,50 Z" fill="rgba(0,163,255,0.05)" />

              {/* Capacity line (Electric Blue) */}
              <path d="M0,25 Q50,20 100,22 T200,18" fill="none" stroke="#00A3FF" strokeWidth="2" />

              {/* Load forecast line (White) with real-time feel */}
              <path d="M0,52 Q30,48 60,54 T120,50 T180,56 L200,53" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />

              {/* Uncertainty markers */}
              <line x1="100" y1="42" x2="100" y2="64" stroke="rgba(255,184,0,0.3)" strokeWidth="1" strokeDasharray="2 2" />
              <text x="103" y="53" fill="#FFB800" fontSize="5" fontFamily="'Geist Mono', monospace" opacity="0.6">±8%</text>

              {/* Line labels */}
              <text x="5" y="20" fill="#00A3FF" fontSize="7" fontFamily="'Geist Mono', monospace">CAPACITY</text>
              <text x="5" y="62" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="'Geist Mono', monospace">LOAD</text>
            </svg>
            <div className="absolute bottom-2 right-2 text-[9px]" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.4)" }}>Oasis PTI</div>
          </div>
        </BentoCard>
    </div>
  );
}

// Contextual Drawer - Asset Detail Panel
interface AssetData {
  id: string;
  name: string;
  type: "plant" | "node";
  mwOutput: number;
  capacity: number;
  lmp: number;
  lmpDelta: number;
  heatRate: number;
  fuelType: string;
  neighbors: string[];
}

function ContextualDrawer({ asset, onClose, onViewNeighbors }: { asset: AssetData | null; onClose: () => void; onViewNeighbors: (neighbors: string[]) => void }) {
  if (!asset) return null;

  // Heat rate sensitivity curve data points (gas price vs profitability)
  const heatRateCurve = [
    { x: 10, y: 85 }, { x: 25, y: 70 }, { x: 40, y: 55 }, { x: 55, y: 42 },
    { x: 70, y: 32 }, { x: 85, y: 25 }, { x: 100, y: 22 }, { x: 115, y: 28 },
    { x: 130, y: 38 }, { x: 145, y: 52 },
  ];
  const curvePath = heatRateCurve.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");

  return (
    <div
      className="absolute top-0 right-0 h-full w-80 z-30 animate-drawer-in"
      style={{
        backgroundColor: "rgba(10, 10, 11, 0.92)",
        backdropFilter: "blur(20px)",
        borderLeft: "0.5px solid rgba(255, 255, 255, 0.08)",
        boxShadow: "-10px 0 40px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: "0.5px solid rgba(255, 255, 255, 0.06)" }}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-status-pulse" style={{ backgroundColor: "#00FFF0" }} />
          <span className="text-[11px] font-semibold tracking-wider uppercase" style={{ fontFamily: "'Geist', sans-serif", color: "#EDEDED" }}>
            {asset.name}
          </span>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white/60 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Live Telemetry */}
      <div className="p-4 space-y-4">
        <div>
          <span className="text-[9px] tracking-widest uppercase" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.4)" }}>LIVE TELEMETRY</span>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {/* MW Output */}
            <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(0, 163, 255, 0.05)", border: "0.5px solid rgba(0, 163, 255, 0.15)" }}>
              <span className="text-[8px] tracking-wider" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.4)" }}>MW OUTPUT</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-medium" style={{ fontFamily: "'Geist Mono', monospace", fontVariantNumeric: "tabular-nums", color: "#00FFF0" }}>
                  {asset.mwOutput}
                </span>
                <span className="text-[10px]" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.3)" }}>/ {asset.capacity}</span>
              </div>
            </div>
            {/* Real-time LMP */}
            <div className="p-3 rounded-lg" style={{ backgroundColor: "rgba(0, 163, 255, 0.05)", border: "0.5px solid rgba(0, 163, 255, 0.15)" }}>
              <span className="text-[8px] tracking-wider" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.4)" }}>REAL-TIME LMP</span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-medium" style={{ fontFamily: "'Geist Mono', monospace", fontVariantNumeric: "tabular-nums", color: "#00A3FF" }}>
                  ${asset.lmp.toFixed(2)}
                </span>
                <span className="text-[10px]" style={{ fontFamily: "'Geist Mono', monospace", color: asset.lmpDelta >= 0 ? "#22C55E" : "#DC2626" }}>
                  {asset.lmpDelta >= 0 ? "▲" : "▼"} {Math.abs(asset.lmpDelta)}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Operational DNA - Heat Rate Sensitivity */}
        <div>
          <span className="text-[9px] tracking-widest uppercase" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.4)" }}>OPERATIONAL DNA</span>
          <div className="mt-2 p-3 rounded-lg" style={{ backgroundColor: "rgba(10, 10, 11, 0.5)", border: "0.5px solid rgba(255, 255, 255, 0.06)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[8px] tracking-wider" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.5)" }}>HEAT RATE SENSITIVITY</span>
              <span className="text-[8px]" style={{ fontFamily: "'Geist Mono', monospace", color: "#FFB800" }}>{asset.heatRate} BTU/kWh</span>
            </div>
            <svg viewBox="0 0 155 90" className="w-full">
              {/* Grid lines */}
              {[20, 40, 60, 80].map((y) => (
                <line key={y} x1="10" y1={y} x2="145" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
              ))}
              {/* Curve fill */}
              <path
                d={`${curvePath} L145,85 L10,85 Z`}
                fill="url(#heatRateGradient)"
                fillOpacity="0.2"
              />
              {/* Curve line */}
              <path
                d={curvePath}
                fill="none"
                stroke="#FFB800"
                strokeWidth="1.5"
                strokeDasharray="200"
                className="animate-curve-draw"
              />
              {/* Profit zone marker */}
              <rect x="25" y="50" width="45" height="35" fill="rgba(34, 197, 94, 0.1)" rx="2" />
              <text x="47" y="70" textAnchor="middle" fill="#22C55E" fontSize="6" fontFamily="'Geist Mono', monospace">PROFIT</text>
              {/* Current position dot */}
              <circle cx="55" cy="42" r="4" fill="#00FFF0" className="animate-status-pulse" />
              {/* Gradient definition */}
              <defs>
                <linearGradient id="heatRateGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FFB800" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#FFB800" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
            {/* Axis labels */}
            <div className="flex justify-between mt-1">
              <span className="text-[7px]" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.3)" }}>$2.00</span>
              <span className="text-[7px]" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.5)" }}>GAS PRICE $/MMBtu</span>
              <span className="text-[7px]" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.3)" }}>$6.00</span>
            </div>
          </div>
        </div>

        {/* Fuel Type Badge */}
        <div className="flex items-center gap-2">
          <span className="text-[9px] tracking-wider" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.4)" }}>FUEL:</span>
          <span className="px-2 py-0.5 rounded text-[9px] font-medium" style={{ backgroundColor: "rgba(249, 115, 22, 0.15)", color: "#F97316", fontFamily: "'Geist Mono', monospace" }}>
            {asset.fuelType}
          </span>
        </div>

        {/* Magnetic Docking - View Neighbors */}
        <button
          onClick={() => onViewNeighbors(asset.neighbors)}
          className="w-full mt-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02]"
          style={{
            backgroundColor: "rgba(0, 163, 255, 0.1)",
            border: "1px solid rgba(0, 163, 255, 0.3)",
            boxShadow: "0 0 20px rgba(0, 163, 255, 0.1)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#00A3FF" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <circle cx="5" cy="6" r="2" />
            <circle cx="19" cy="6" r="2" />
            <circle cx="5" cy="18" r="2" />
            <circle cx="19" cy="18" r="2" />
            <path d="M12 9V6M12 9L7 7M12 9L17 7M12 15V18M12 15L7 17M12 15L17 17" />
          </svg>
          <span className="text-[10px] font-medium tracking-wider" style={{ fontFamily: "'Geist Mono', monospace", color: "#00A3FF" }}>
            VIEW NEIGHBORS ({asset.neighbors.length})
          </span>
        </button>
      </div>
    </div>
  );
}

// Layer Control Pill for Grid Atlas - High precision icons with glow
function LayerControlPill({ flowEnabled = true, onFlowToggle }: { flowEnabled?: boolean; onFlowToggle?: () => void }) {
  const [layers, setLayers] = useState({ zones: true, plants: false, nodes: false });
  const toggleLayer = (layer: keyof typeof layers) => setLayers(p => ({ ...p, [layer]: !p[layer] }));

  const icons = {
    zones: ( // Hexagonal grid
      <>
        <path d="M12 2L19 6V14L12 18L5 14V6L12 2Z" />
        <path d="M12 6L16 8.5V13.5L12 16L8 13.5V8.5L12 6Z" />
      </>
    ),
    plants: ( // Lightning bolt
      <>
        <path d="M13 2L4 14H11L10 22L20 9H12L13 2Z" />
      </>
    ),
    nodes: ( // Interconnected dots
      <>
        <circle cx="12" cy="5" r="2.5" />
        <circle cx="6" cy="17" r="2.5" />
        <circle cx="18" cy="17" r="2.5" />
        <path d="M12 7.5V12M12 12L7.5 15M12 12L16.5 15" />
      </>
    ),
    flow: ( // Energy flow / transmission
      <>
        <path d="M2 12H6M18 12H22" />
        <path d="M6 12C6 12 8 8 12 8C16 8 18 12 18 12C18 12 16 16 12 16C8 16 6 12 6 12Z" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <path d="M9 9L7 7M15 9L17 7M9 15L7 17M15 15L17 17" strokeDasharray="2 2" />
      </>
    ),
  };

  return (
    <div
      className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 p-2.5 rounded-2xl z-20"
      style={{ backgroundColor: "rgba(10, 10, 11, 0.85)", backdropFilter: "blur(16px)", border: "0.5px solid rgba(255, 255, 255, 0.08)" }}
    >
      {/* Flow Layer Toggle */}
      <button
        onClick={onFlowToggle}
        className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 mb-1"
        style={{
          backgroundColor: flowEnabled ? "rgba(0, 255, 240, 0.15)" : "transparent",
          boxShadow: flowEnabled ? "0 0 12px rgba(0, 255, 240, 0.5)" : "none",
          borderBottom: "0.5px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={flowEnabled ? "#00FFF0" : "rgba(255,255,255,0.3)"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: flowEnabled ? 1 : 0.3 }}
        >
          {icons.flow}
        </svg>
      </button>
      
      {(["zones", "plants", "nodes"] as const).map((key) => {
        const isActive = layers[key];
        return (
          <button
            key={key}
            onClick={() => toggleLayer(key)}
            className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200"
            style={{
              backgroundColor: isActive ? "rgba(0, 163, 255, 0.12)" : "transparent",
              boxShadow: isActive ? "0 0 8px rgba(0, 163, 255, 0.4)" : "none",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={isActive ? "#00A3FF" : "rgba(255,255,255,0.3)"}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: isActive ? 1 : 0.3 }}
            >
              {icons[key]}
            </svg>
          </button>
        );
      })}
      {/* Labels */}
      <div className="absolute -right-14 top-2.5 flex flex-col gap-3.5">
        <span
          className="text-[8px] tracking-wider mb-1"
          style={{
            fontFamily: "'Geist Mono', monospace",
            color: flowEnabled ? "#00FFF0" : "rgba(255,255,255,0.2)",
          }}
        >
          FLOW
        </span>
        {(["ZONES", "PLANTS", "NODES"] as const).map((label, i) => (
          <span
            key={label}
            className="text-[8px] tracking-wider"
            style={{
              fontFamily: "'Geist Mono', monospace",
              color: layers[["zones", "plants", "nodes"][i] as keyof typeof layers] ? "#00A3FF" : "rgba(255,255,255,0.2)",
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Time Spine Scrubber - Enhanced with gradient track and hour markers
function TimeSpine() {
  const [value, setValue] = useState(85);
  const markers = ["-48H", "-36H", "-24H", "-12H", "NOW"];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[650px] max-w-[85%] z-20">
      {/* Data Health Ribbon - Green for coverage, Red for gaps */}
      <div className="h-1.5 mb-2 rounded-full overflow-hidden flex" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
        <div style={{ width: "20%", backgroundColor: "#22C55E" }} />
        <div style={{ width: "5%", backgroundColor: "#DC2626" }} />
        <div style={{ width: "25%", backgroundColor: "#22C55E" }} />
        <div style={{ width: "3%", backgroundColor: "#DC2626" }} />
        <div style={{ width: "32%", backgroundColor: "#22C55E" }} />
        <div style={{ width: "2%", backgroundColor: "#DC2626" }} />
        <div style={{ width: "13%", backgroundColor: "#22C55E" }} />
      </div>

      {/* Slider Container */}
      <div className="relative h-10 rounded-xl" style={{ backgroundColor: "rgba(10, 10, 11, 0.85)", backdropFilter: "blur(16px)", border: "0.5px solid rgba(255, 255, 255, 0.08)" }}>
        <input
          type="range"
          min="0"
          max="100"
          value={value}
          onChange={(e) => setValue(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />
        
        {/* Gradient Track: Dark Slate → Electric Blue */}
        <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 h-1 rounded-full overflow-hidden">
          <div
            className="h-full w-full rounded-full"
            style={{ background: "linear-gradient(90deg, #1E293B 0%, #334155 30%, #00A3FF 100%)" }}
          />
          {/* Active portion glow */}
          <div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{ width: `${value}%`, backgroundColor: "#00A3FF", boxShadow: "0 0 6px rgba(0, 163, 255, 0.5)" }}
          />
        </div>

        {/* Thumb - Cyan pill */}
        <div
          className="absolute top-1.5 bottom-1.5 w-3 rounded-full transition-all duration-75"
          style={{
            left: `calc(${value}% - 6px + 8px - ${value * 0.16}px)`,
            backgroundColor: "#00FFF0",
            boxShadow: "0 0 12px rgba(0, 255, 240, 0.6)",
          }}
        />
      </div>

      {/* Hour Markers */}
      <div className="flex justify-between px-4 mt-2">
        {markers.map((marker, i) => (
          <span
            key={marker}
            className="text-[8px] tracking-wider"
            style={{
              fontFamily: "'Geist Mono', monospace",
              color: i === markers.length - 1 ? "#00A3FF" : "rgba(255, 255, 255, 0.3)",
            }}
          >
            {marker}
          </span>
        ))}
      </div>
    </div>
  );
}

// Status Badge with scanning animation
function StatusBadge() {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
      <div className="relative px-5 py-2 rounded-full" style={{ backgroundColor: "rgba(10, 10, 11, 0.85)", backdropFilter: "blur(16px)" }}>
        {/* Scanning border animation */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
          <rect
            x="1"
            y="1"
            width="198"
            height="38"
            rx="19"
            fill="none"
            stroke="#00FFF0"
            strokeWidth="1"
            strokeDasharray="200"
            className="animate-badge-scan"
            style={{ opacity: 0.6 }}
          />
        </svg>
        {/* Static border */}
        <div className="absolute inset-0 rounded-full" style={{ border: "0.5px solid rgba(255, 255, 255, 0.08)" }} />
        <span className="relative text-[10px] tracking-[0.1em] uppercase" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.7)" }}>
          PJM · REAL-TIME · 5-MIN DISPATCH
        </span>
      </div>
    </div>
  );
}

// Contextual Info Panel
function ContextualInfoPanel() {
  return (
    <div
      className="absolute top-4 right-4 z-20 px-3 py-2 rounded-lg"
      style={{ backgroundColor: "rgba(10, 10, 11, 0.7)", backdropFilter: "blur(12px)", border: "0.5px solid rgba(255, 255, 255, 0.08)" }}
    >
      <div className="flex items-center gap-3">
        <span className="text-[9px] tracking-wide" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.5)" }}>
          ZONES: <span style={{ color: "#00A3FF" }}>20</span>
        </span>
        <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
        <span className="text-[9px] tracking-wide" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.5)" }}>
          PLANTS: <span style={{ color: "#00A3FF" }}>163</span>
        </span>
        <span className="text-[9px]" style={{ color: "rgba(255,255,255,0.2)" }}>·</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] tracking-wide" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.5)" }}>
            LAST UPDATE: <span style={{ color: "#00FFF0" }}>06:35 EPT</span>
          </span>
          {/* Rotating refresh icon */}
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#00FFF0" strokeWidth="2" className="animate-spin-slow">
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// Sample asset data for demonstration
const sampleAssets: AssetData[] = [
  { id: "plant-1", name: "BRUNNER ISLAND", type: "plant", mwOutput: 1458, capacity: 1490, lmp: 31.85, lmpDelta: 2.4, heatRate: 7850, fuelType: "NATURAL GAS", neighbors: ["YORK", "HOLTWOOD", "PEACH BOTTOM"] },
  { id: "plant-2", name: "MONTOUR", type: "plant", mwOutput: 1590, capacity: 1600, lmp: 29.45, lmpDelta: -1.2, heatRate: 9200, fuelType: "COAL", neighbors: ["SUNBURY", "DANVILLE"] },
  { id: "node-1", name: "WEST HUB", type: "node", mwOutput: 0, capacity: 0, lmp: 31.85, lmpDelta: 2.4, heatRate: 0, fuelType: "HUB", neighbors: ["AEP", "PSEG", "PECO", "PPL"] },
];

// Transmission line data with loading percentages
interface TransmissionLine {
  id: string;
  from: { x: number; y: number };
  to: { x: number; y: number };
  loading: number; // 0-100, above 90 is thermal limit
  capacity: number; // MW
  name: string;
}

const transmissionLines: TransmissionLine[] = [
  { id: "line-1", from: { x: 25, y: 40 }, to: { x: 45, y: 55 }, loading: 45, capacity: 1200, name: "DUQ-WEST" },
  { id: "line-2", from: { x: 45, y: 55 }, to: { x: 75, y: 40 }, loading: 72, capacity: 1500, name: "WEST-PECO" },
  { id: "line-3", from: { x: 75, y: 40 }, to: { x: 85, y: 30 }, loading: 88, capacity: 800, name: "PECO-PSEG" },
  { id: "line-4", from: { x: 45, y: 55 }, to: { x: 55, y: 35 }, loading: 93, capacity: 1100, name: "WEST-PPL" }, // Near thermal limit
  { id: "line-5", from: { x: 20, y: 50 }, to: { x: 25, y: 40 }, loading: 38, capacity: 900, name: "AEP-DUQ" },
  { id: "line-6", from: { x: 15, y: 30 }, to: { x: 25, y: 40 }, loading: 55, capacity: 1000, name: "COMED-DUQ" },
  { id: "line-7", from: { x: 55, y: 35 }, to: { x: 75, y: 40 }, loading: 67, capacity: 1300, name: "PPL-PECO" },
];

// Volumetric Flow Layer - Transmission lines with flowing particles
function VolumetricFlowLayer({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  const getParticleSpeed = (loading: number): string => {
    if (loading >= 90) return "animate-particle-fast";
    if (loading >= 60) return "animate-particle-medium";
    return "animate-particle-slow";
  };

  const getLineColor = (loading: number): { stroke: string; glow: string } => {
    if (loading >= 90) {
      return { stroke: "#DC2626", glow: "rgba(220, 38, 38, 0.6)" }; // Deep Red - thermal limit
    }
    if (loading >= 75) {
      return { stroke: "#F97316", glow: "rgba(249, 115, 22, 0.5)" }; // Warning orange
    }
    return { stroke: "#00FFF0", glow: "rgba(0, 255, 240, 0.4)" }; // Cyan pulse
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" style={{ overflow: "visible" }}>
      <defs>
        {/* Tube gradient for 3D effect */}
        <linearGradient id="tubeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.05)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
        </linearGradient>
        
        {/* Glow filters for each state */}
        <filter id="cyanGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="redGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {transmissionLines.map((line) => {
        const colors = getLineColor(line.loading);
        const speedClass = getParticleSpeed(line.loading);
        const isOverloaded = line.loading >= 90;
        
        // Calculate line angle for proper particle flow
        const dx = line.to.x - line.from.x;
        const dy = line.to.y - line.from.y;
        void (dx + dy); // Used for particle flow direction calculation
        
        return (
          <g key={line.id} className={isOverloaded ? "animate-thermal-vibrate" : ""}>
            {/* Base tube (3D effect) */}
            <line
              x1={`${line.from.x}%`}
              y1={`${line.from.y}%`}
              x2={`${line.to.x}%`}
              y2={`${line.to.y}%`}
              stroke="url(#tubeGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.3"
            />
            
            {/* Inner tube glow */}
            <line
              x1={`${line.from.x}%`}
              y1={`${line.from.y}%`}
              x2={`${line.to.x}%`}
              y2={`${line.to.y}%`}
              stroke={colors.stroke}
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.2"
              filter={isOverloaded ? "url(#redGlow)" : "url(#cyanGlow)"}
            />
            
            {/* Core line */}
            <line
              x1={`${line.from.x}%`}
              y1={`${line.from.y}%`}
              x2={`${line.to.x}%`}
              y2={`${line.to.y}%`}
              stroke={colors.stroke}
              strokeWidth="2"
              strokeLinecap="round"
              opacity="0.6"
            />
            
            {/* Flowing particles */}
            <line
              x1={`${line.from.x}%`}
              y1={`${line.from.y}%`}
              x2={`${line.to.x}%`}
              y2={`${line.to.y}%`}
              stroke={colors.stroke}
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="4 12"
              className={speedClass}
              style={{ filter: `drop-shadow(0 0 4px ${colors.glow})` }}
            />
            
            {/* Loading percentage label */}
            <text
              x={`${(line.from.x + line.to.x) / 2}%`}
              y={`${(line.from.y + line.to.y) / 2 - 2}%`}
              textAnchor="middle"
              fill={colors.stroke}
              fontSize="8"
              fontFamily="'Geist Mono', monospace"
              opacity="0.8"
            >
              {line.loading}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// Hub locations for Cmd+K navigation
const hubLocations = [
  { id: "west-hub", name: "WEST HUB", x: 45, y: 55 },
  { id: "peco", name: "PECO", x: 75, y: 40 },
  { id: "pseg", name: "PSEG", x: 85, y: 30 },
  { id: "aep", name: "AEP", x: 20, y: 50 },
  { id: "ppl", name: "PPL", x: 55, y: 35 },
  { id: "duq", name: "DUQ", x: 25, y: 40 },
  { id: "comed", name: "COMED", x: 15, y: 30 },
];

// Swoop Engine - Motion Blur Overlay
function SwoopOverlay({ active, direction: _direction }: { active: boolean; direction: "in" | "out" }) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
      {/* Radial motion blur effect */}
      <div 
        className="absolute inset-0 animate-swoop-blur"
        style={{
          background: "radial-gradient(ellipse at center, transparent 20%, rgba(0, 163, 255, 0.1) 50%, rgba(0, 163, 255, 0.3) 80%, rgba(0, 10, 20, 0.8) 100%)",
        }}
      />
      
      {/* Velocity streaks - horizontal */}
      {[...Array(8)].map((_, i) => (
        <div
          key={`h-${i}`}
          className="absolute h-[1px] animate-velocity-streak"
          style={{
            top: `${15 + i * 10}%`,
            left: 0,
            right: 0,
            background: "linear-gradient(90deg, transparent, #00FFF0 30%, #00A3FF 70%, transparent)",
            animationDelay: `${i * 0.03}s`,
            opacity: 0.6,
          }}
        />
      ))}
      
      {/* Velocity streaks - vertical (subtle) */}
      {[...Array(4)].map((_, i) => (
        <div
          key={`v-${i}`}
          className="absolute w-[1px] animate-velocity-streak"
          style={{
            left: `${20 + i * 20}%`,
            top: 0,
            bottom: 0,
            background: "linear-gradient(180deg, transparent, rgba(0, 255, 240, 0.3) 30%, rgba(0, 163, 255, 0.3) 70%, transparent)",
            animationDelay: `${i * 0.05}s`,
            transform: "rotate(90deg)",
          }}
        />
      ))}
      
      {/* Border flash effect */}
      <div 
        className="absolute inset-0 animate-border-flash"
        style={{
          boxShadow: "inset 0 0 60px 20px rgba(0, 163, 255, 0.4), inset 0 0 120px 40px rgba(0, 255, 240, 0.2)",
        }}
      />
      
      {/* Corner velocity indicators */}
      <svg className="absolute top-4 left-4 w-12 h-12 animate-border-flash" viewBox="0 0 48 48">
        <path d="M4 24 L4 4 L24 4" fill="none" stroke="#00FFF0" strokeWidth="2" opacity="0.8" />
      </svg>
      <svg className="absolute top-4 right-4 w-12 h-12 animate-border-flash" viewBox="0 0 48 48">
        <path d="M44 24 L44 4 L24 4" fill="none" stroke="#00FFF0" strokeWidth="2" opacity="0.8" />
      </svg>
      <svg className="absolute bottom-4 left-4 w-12 h-12 animate-border-flash" viewBox="0 0 48 48">
        <path d="M4 24 L4 44 L24 44" fill="none" stroke="#00FFF0" strokeWidth="2" opacity="0.8" />
      </svg>
      <svg className="absolute bottom-4 right-4 w-12 h-12 animate-border-flash" viewBox="0 0 48 48">
        <path d="M44 24 L44 44 L24 44" fill="none" stroke="#00FFF0" strokeWidth="2" opacity="0.8" />
      </svg>
      
      {/* Destination indicator */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div 
          className="w-16 h-16 rounded-full animate-border-flash"
          style={{
            border: "2px solid #00FFF0",
            boxShadow: "0 0 30px rgba(0, 255, 240, 0.5)",
          }}
        />
      </div>
    </div>
  );
}

// Command Palette for Cmd+K navigation
function CommandPalette({ 
  open, 
  onClose, 
  onSelect 
}: { 
  open: boolean; 
  onClose: () => void; 
  onSelect: (hub: typeof hubLocations[0]) => void;
}) {
  const [search, setSearch] = useState("");
  const filteredHubs = hubLocations.filter(h => 
    h.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (open) setSearch("");
  }, [open]);

  if (!open) return null;

  return (
    <div 
      className="absolute inset-0 z-50 flex items-start justify-center pt-24"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ backgroundColor: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }} />
      
      {/* Palette */}
      <div 
        className="relative w-[400px] rounded-xl overflow-hidden"
        style={{ 
          backgroundColor: "rgba(10, 10, 11, 0.95)", 
          backdropFilter: "blur(20px)",
          border: "0.5px solid rgba(0, 163, 255, 0.3)",
          boxShadow: "0 0 40px rgba(0, 163, 255, 0.2), 0 20px 60px rgba(0, 0, 0, 0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "0.5px solid rgba(255, 255, 255, 0.06)" }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00A3FF" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Fly to hub..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent outline-none text-[13px]"
            style={{ fontFamily: "'Geist', sans-serif", color: "#EDEDED" }}
          />
          <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontFamily: "'Geist Mono', monospace" }}>ESC</span>
        </div>
        
        {/* Hub list */}
        <div className="max-h-[280px] overflow-y-auto py-2">
          {filteredHubs.map((hub) => (
            <button
              key={hub.id}
              className="w-full px-4 py-2.5 flex items-center gap-3 transition-colors hover:bg-white/5"
              onClick={() => onSelect(hub)}
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "rgba(0, 163, 255, 0.15)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00A3FF" strokeWidth="2">
                  <path d="M12 2L12 22M12 2L8 6M12 2L16 6" />
                </svg>
              </div>
              <span className="text-[12px] tracking-wide" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255,255,255,0.8)" }}>{hub.name}</span>
              <span className="ml-auto text-[9px]" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255,255,255,0.3)" }}>PJM</span>
            </button>
          ))}
        </div>
        
        {/* Footer hint */}
        <div className="px-4 py-2 flex items-center gap-4" style={{ borderTop: "0.5px solid rgba(255, 255, 255, 0.06)", backgroundColor: "rgba(0, 0, 0, 0.2)" }}>
          <span className="text-[9px]" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255,255,255,0.3)" }}>
            <span style={{ color: "#00A3FF" }}>↵</span> to fly
          </span>
          <span className="text-[9px]" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255,255,255,0.3)" }}>
            <span style={{ color: "#00A3FF" }}>⌘K</span> toggle
          </span>
        </div>
      </div>
    </div>
  );
}

// GRID ATLAS View
function GridAtlasView() {
  const [selectedAsset, setSelectedAsset] = useState<AssetData | null>(null);
  const [highlightedNeighbors, setHighlightedNeighbors] = useState<string[]>([]);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [swoopActive, setSwoopActive] = useState(false);
  const [currentHub, setCurrentHub] = useState<string | null>(null);
  const [flowLayerEnabled, setFlowLayerEnabled] = useState(true);

  // Cmd+K keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAssetClick = (asset: AssetData) => {
    setSelectedAsset(asset);
    setHighlightedNeighbors([]);
  };

  const handleViewNeighbors = (neighbors: string[]) => {
    setHighlightedNeighbors(neighbors);
  };

  const handleHubSelect = (hub: typeof hubLocations[0]) => {
    setCommandPaletteOpen(false);
    setSwoopActive(true);
    setCurrentHub(hub.name);
    
    // Swoop effect duration
    setTimeout(() => {
      setSwoopActive(false);
    }, 600);
  };

  return (
    <div className="flex-1 relative overflow-hidden" style={{ backgroundColor: "#0D0D0E" }}>
      {/* Swoop Engine Motion Blur Overlay */}
      <SwoopOverlay active={swoopActive} direction="in" />
      
      {/* Command Palette */}
      <CommandPalette 
        open={commandPaletteOpen} 
        onClose={() => setCommandPaletteOpen(false)}
        onSelect={handleHubSelect}
      />
      
      {/* Status Badge with scanning animation */}
      <StatusBadge />

      {/* Contextual Info Panel */}
      <ContextualInfoPanel />
      
      {/* Cmd+K hint and current hub indicator */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-3">
        <button 
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all hover:scale-105"
          style={{ 
            backgroundColor: "rgba(10, 10, 11, 0.7)", 
            backdropFilter: "blur(12px)", 
            border: "0.5px solid rgba(0, 163, 255, 0.2)",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00A3FF" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span className="text-[9px] tracking-wider" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255,255,255,0.5)" }}>
            FLY TO HUB
          </span>
          <span className="text-[8px] px-1 py-0.5 rounded" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", fontFamily: "'Geist Mono', monospace" }}>⌘K</span>
        </button>
        {currentHub && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: "rgba(0, 163, 255, 0.1)", border: "0.5px solid rgba(0, 163, 255, 0.3)" }}>
            <div className="w-2 h-2 rounded-full animate-status-pulse" style={{ backgroundColor: "#00FFF0" }} />
            <span className="text-[9px] tracking-wider font-medium" style={{ fontFamily: "'Geist Mono', monospace", color: "#00A3FF" }}>
              {currentHub}
            </span>
          </div>
        )}
      </div>

      {/* Grid Background */}
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(0, 163, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 163, 255, 0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

      {/* Volumetric Flow Layer - Transmission lines with particles */}
      <VolumetricFlowLayer enabled={flowLayerEnabled} />

      {/* Layer Control with Flow toggle */}
      <LayerControlPill flowEnabled={flowLayerEnabled} onFlowToggle={() => setFlowLayerEnabled(!flowLayerEnabled)} />

      {/* Demo Asset Markers */}
      <div className="absolute inset-0 pointer-events-none">
        {sampleAssets.map((asset, i) => {
          const positions = [
            { x: "35%", y: "40%" },
            { x: "55%", y: "30%" },
            { x: "45%", y: "55%" },
          ];
          const pos = positions[i];
          const isHighlighted = highlightedNeighbors.includes(asset.name);
          
          return (
            <button
              key={asset.id}
              className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
              style={{ left: pos.x, top: pos.y }}
              onClick={() => handleAssetClick(asset)}
            >
              <div className={`relative ${isHighlighted ? "scale-125" : ""}`}>
                {/* Pulse ring */}
                <div 
                  className="absolute inset-0 rounded-full animate-dot-pulse"
                  style={{ 
                    width: 24, height: 24, 
                    backgroundColor: isHighlighted ? "#FFB800" : "#00A3FF",
                    opacity: 0.3,
                    transform: "translate(-4px, -4px)",
                  }} 
                />
                {/* Core marker */}
                <div 
                  className="w-4 h-4 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: asset.type === "plant" ? "#00A3FF" : "#00FFF0",
                    boxShadow: `0 0 12px ${asset.type === "plant" ? "rgba(0,163,255,0.6)" : "rgba(0,255,240,0.6)"}`,
                    border: isHighlighted ? "2px solid #FFB800" : "none",
                  }}
                >
                  {asset.type === "plant" && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="white">
                      <path d="M13 2L4 14H11L10 22L20 9H12L13 2Z" />
                    </svg>
                  )}
                </div>
                {/* Label */}
                <span 
                  className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] tracking-wider"
                  style={{ fontFamily: "'Geist Mono', monospace", color: isHighlighted ? "#FFB800" : "rgba(255,255,255,0.5)" }}
                >
                  {asset.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Placeholder Map Content */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-white/20 text-lg tracking-wider" style={{ fontFamily: "'Geist Mono', monospace" }}>[DECKGL MAP COMPONENT]</span>
      </div>

      {/* Time Spine */}
      <TimeSpine />

      {/* Contextual Drawer */}
      <ContextualDrawer 
        asset={selectedAsset} 
        onClose={() => setSelectedAsset(null)}
        onViewNeighbors={handleViewNeighbors}
      />
    </div>
  );
}

// Animated Line Chart Thumbnail (Intelligence Suite)
function GhostlyLineChart() {
  return (
    <svg viewBox="0 0 80 40" className="w-full h-10 mb-3">
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00A3FF" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#00A3FF" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      <path
        d="M0,30 Q10,28 15,25 T30,20 T45,22 T60,15 T75,18 L80,16"
        fill="none"
        stroke="url(#lineGradient)"
        strokeWidth="1.5"
        strokeDasharray="100"
        className="animate-line-draw"
      />
      <path
        d="M0,30 Q10,28 15,25 T30,20 T45,22 T60,15 T75,18 L80,16 L80,40 L0,40 Z"
        fill="url(#lineGradient)"
        fillOpacity="0.1"
      />
    </svg>
  );
}

// Animated Stacked Bar (Resource Suite)
function AnimatedStackedBar() {
  return (
    <div className="w-full h-10 mb-3 flex items-end gap-1">
      {[60, 80, 45, 70, 55, 85, 65].map((h, i) => (
        <div key={i} className="flex-1 flex flex-col justify-end">
          <div
            className="w-full rounded-t-sm animate-bar-fill"
            style={{
              height: `${h}%`,
              background: `linear-gradient(to top, rgba(0,163,255,0.2), rgba(0,163,255,0.5))`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
}

// Enhanced Suite Card with hover, sub-modules, and animated thumbnails
function SuiteCard({ title, subModules, showFormula, cardType }: { title: string; subModules: string[]; showFormula?: boolean; cardType?: "intelligence" | "resource" | "optimizer" }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex-1 flex flex-col rounded-lg overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: "rgba(10, 10, 11, 0.7)",
        backdropFilter: "blur(12px)",
        border: "0.5px solid rgba(255, 255, 255, 0.08)",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered ? "0 0 30px rgba(0, 163, 255, 0.1)" : "none",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="px-4 py-3 relative" style={{ borderBottom: "0.5px solid rgba(255, 255, 255, 0.06)" }}>
        <div className="absolute top-3 right-3"><StatusDot status="live" /></div>
        <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ fontFamily: "'Geist', sans-serif", color: "#EDEDED" }}>{title}</span>
      </div>
      <div className="flex-1 flex flex-col p-4 relative">
        {/* Formula watermark for Optimizer - more visible */}
        {showFormula && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <span 
              className="text-[9px] whitespace-nowrap transform -rotate-3" 
              style={{ 
                fontFamily: "'Geist Mono', monospace", 
                color: "rgba(0, 163, 255, 0.08)",
                letterSpacing: "0.05em",
              }}
            >
              Spark Spread = Electricity Price - (Heat Rate × Fuel Price)
            </span>
          </div>
        )}
        
        {/* Animated Thumbnails */}
        {cardType === "intelligence" && <GhostlyLineChart />}
        {cardType === "resource" && <AnimatedStackedBar />}
        {cardType === "optimizer" && (
          <div className="h-[180px] -mx-2 -mt-1 mb-2">
            <Suspense fallback={
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-4 h-4 border border-[#00A3FF] border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              <SparkSpreadSurface3D />
            </Suspense>
          </div>
        )}
        
        {/* Sub-modules list */}
        <div className="space-y-2 mb-4">
          {subModules.map((mod, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: "rgba(0, 163, 255, 0.5)" }} />
              <span className="text-[9px] tracking-wide" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.4)" }}>{mod}</span>
            </div>
          ))}
        </div>
        {/* Coming Soon Badge */}
        <div className="mt-auto flex justify-center">
          <div className="px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(0, 255, 240, 0.1)", border: "1px solid rgba(0, 255, 240, 0.3)" }}>
            <span className="text-[9px] font-medium tracking-widest" style={{ fontFamily: "'Geist Mono', monospace", color: "#00FFF0" }}>COMING SOON</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ANALYTICS View
function AnalyticsView() {
  return (
    <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: "#0D0D0E" }}>
      <div className="flex gap-6 w-full max-w-5xl h-[500px]">
        <SuiteCard title="INTELLIGENCE SUITE" subModules={["Price Intelligence", "Convergence Monitor", "Marginal Fuel Tracker", "DA/RT Spread Analysis"]} cardType="intelligence" />
        <SuiteCard title="RESOURCE SUITE" subModules={["Generation Mix", "Resource Gap", "Load Forecast", "Capacity Analysis"]} cardType="resource" />
        <SuiteCard title="OPTIMIZER SUITE" subModules={["Spark Spread Calculator", "Battery Arbitrage", "Heat Rate Optimizer", "Dispatch Signals"]} showFormula cardType="optimizer" />
      </div>
    </div>
  );
}

// VAULT View
function VaultView() {
  const sections = [{ id: "overview", label: "OVERVIEW" }, { id: "methodology", label: "METHODOLOGY" }, { id: "data-sources", label: "DATA SOURCES" }, { id: "models", label: "MODELS" }, { id: "glossary", label: "GLOSSARY" }];
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="flex-1 flex p-6 gap-4" style={{ backgroundColor: "#0D0D0E" }}>
      <div className="w-56 shrink-0 rounded-lg overflow-hidden" style={{ backgroundColor: "rgba(10, 10, 11, 0.7)", backdropFilter: "blur(12px)", border: "0.5px solid rgba(255, 255, 255, 0.08)" }}>
        <div className="px-4 py-3" style={{ borderBottom: "0.5px solid rgba(255, 255, 255, 0.06)" }}>
          <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ fontFamily: "'Geist', sans-serif", color: "#EDEDED" }}>INDEX</span>
        </div>
        <nav className="py-2">
          {sections.map((s) => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} className="w-full text-left px-4 py-2 transition-colors" style={{ backgroundColor: activeSection === s.id ? "rgba(0, 163, 255, 0.08)" : "transparent" }}>
              <span className="text-[11px] tracking-wide" style={{ fontFamily: "'Geist', sans-serif", color: activeSection === s.id ? "#00A3FF" : "rgba(255, 255, 255, 0.4)" }}>{s.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-1 rounded-lg overflow-hidden" style={{ backgroundColor: "rgba(10, 10, 11, 0.7)", backdropFilter: "blur(12px)", border: "0.5px solid rgba(255, 255, 255, 0.08)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "0.5px solid rgba(255, 255, 255, 0.06)" }}>
          <span className="text-xs font-semibold tracking-wide uppercase" style={{ fontFamily: "'Geist', sans-serif", color: "#EDEDED" }}>{sections.find((s) => s.id === activeSection)?.label}</span>
        </div>
        <div className="p-6 space-y-6">
          {["1.0", "1.1", "1.2"].map((sec) => (
            <div key={sec}>
              <h3 className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ fontFamily: "'Geist', sans-serif", color: "rgba(255, 255, 255, 0.3)" }}>SECTION {sec}</h3>
              <div className="space-y-2">
                {[80, 100, 70].slice(0, sec === "1.0" ? 1 : 3).map((w, i) => (
                  <div key={i} className="h-3 rounded" style={{ backgroundColor: "rgba(255, 255, 255, 0.06)", width: `${w}%` }} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function GlobalShell() {
  const [collapsed, setCollapsed] = useState(true);
  const [activeNav, setActiveNav] = useState("nest");
  const sidebarWidth = collapsed ? 64 : 200;

  const renderContent = () => {
    switch (activeNav) {
      case "nest": return <NestView />;
      case "atlas": return <GridAtlasView />;
      case "analytics": return <AnalyticsView />;
      case "vault": return <VaultView />;
      default: return <NestView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: "#0A0A0B" }}>
      <aside className="flex flex-col h-full shrink-0 border-r transition-all duration-200 ease-out" style={{ width: sidebarWidth, backgroundColor: "#0A0A0B", borderColor: "rgba(255, 255, 255, 0.06)" }}>
        <div className="pt-4 pb-2"><FalconLogo collapsed={collapsed} /></div>
        <nav className="flex-1 flex flex-col pt-4">
          {navItems.map((item) => <NavButton key={item.id} item={item} active={activeNav === item.id} collapsed={collapsed} onClick={() => setActiveNav(item.id)} />)}
        </nav>
        <div className="border-t" style={{ borderColor: "rgba(255, 255, 255, 0.06)" }}>
          <CollapseToggle collapsed={collapsed} onClick={() => setCollapsed(!collapsed)} />
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <HeaderBar activeView={activeNav} />
        {renderContent()}
      </main>
    </div>
  );
}
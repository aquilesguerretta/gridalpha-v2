import { useState, useEffect, lazy, Suspense } from "react";
import { createPortal } from "react-dom";
import { C, F, R, S, T } from '@/design/tokens';
import {
  AreaChart, Area, ComposedChart, Line,
  XAxis, YAxis, Tooltip, ReferenceLine, ReferenceArea,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import FalconLogo from "./FalconLogo";
import { PJMNodeGraph } from "./PJMNodeGraph";
import { LMPCard } from "./LMPCard";
import {
  type Regime,
  ZONE_LMP, ZONE_RESERVE,
  REGIME_DESCRIPTIONS, ZONE_ALERTS,
} from "../lib/pjm/mock-data";
import { ErrorBoundary } from "./shared/ErrorBoundary";
import { CardSkeleton } from "./shared/CardSkeleton";
import GridAtlasView from "./atlas/GridAtlasView";

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

// Icons
function HexagonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z" />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2L22 12L12 22L2 12L12 2Z" />
      <path d="M12 7L17 12L12 17L7 12L12 7Z" />
    </svg>
  );
}

function TargetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

function VaultIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="6" width="18" height="14" rx="2" />
      <path d="M7 6V4a2 2 0 012-2h6a2 2 0 012 2v2" />
      <line x1="8" y1="11" x2="8" y2="15" />
      <line x1="12" y1="11" x2="12" y2="15" />
      <line x1="16" y1="11" x2="16" y2="15" />
    </svg>
  );
}

// FalconLogo imported from ./FalconLogo (Spline 3D + Zustand)

// Status Dot Component
function StatusDot({ status }: { status: "live" | "stale" | "fallback" }) {
  const colors = { live: C.alertNormal, stale: C.alertWarning, fallback: C.alertCritical };
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

// Entry Overlay - cinematic splash screen
function EntryOverlay({ onDismiss }: { onDismiss: () => void }) {
  const [visible, setVisible] = useState(true);
  const [collapsing, setCollapsing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCollapsing(true);
      setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 600);
    }, 2000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleClick = () => {
    setCollapsing(true);
    setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 600);
  };

  if (!visible) return null;

  return (
    <div
      onClick={handleClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        backgroundColor: '#0A0A0B',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        transition: 'opacity 600ms ease-out, transform 600ms ease-out',
        opacity: collapsing ? 0 : 1,
        transform: collapsing ? 'translateY(-100%)' : 'translateY(0)',
        cursor: 'pointer',
      }}
    >
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <span style={{
        fontFamily: "'Geist Mono', monospace",
        fontSize: '36px',
        fontWeight: 700,
        color: '#FFFFFF',
        letterSpacing: '0.15em',
      }}>
        GRIDALPHA
      </span>
      <span style={{
        fontFamily: "'Geist Mono', monospace",
        fontSize: '12px',
        fontWeight: 400,
        color: 'rgba(255,255,255,0.4)',
        letterSpacing: '0.3em',
      }}>
        PJM MARKET INTELLIGENCE TERMINAL
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
        <div style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: C.electricBlue,
          boxShadow: '0 0 12px rgba(6,182,212,0.8)',
        }} />
        <span style={{
          fontFamily: "'Geist Mono', monospace",
          fontSize: '11px',
          color: C.electricBlue,
          letterSpacing: '0.2em',
        }}>
          LIVE · $31.85 /MWh · NORMAL OPERATIONS
        </span>
      </div>
      <span style={{
        position: 'absolute',
        bottom: '32px',
        fontFamily: "'Geist Mono', monospace",
        fontSize: '9px',
        color: 'rgba(255,255,255,0.2)',
        letterSpacing: '0.2em',
      }}>
        CLICK ANYWHERE TO ENTER
      </span>
    </div>
  );
}


// Pulsing Dot Grid Background (kept for future use)
// @ts-ignore: preserved component
function PulsingDotGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg width="100%" height="100%" className="animate-dot-pulse">
        <defs>
          <pattern id="dotGrid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill={C.electricBlue} fillOpacity="0.3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dotGrid)" />
      </svg>
    </div>
  );
}

// PJM Territory Outline with Hub Dots (kept for future use)
// @ts-ignore: preserved component
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
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 160" preserveAspectRatio="xMidYMid meet">
      {/* PJM Territory - PA-centered hexagonal cluster */}
      <path
        d="M40,60 L55,35 L85,25 L115,25 L145,35 L160,60 L150,85 L120,100 L80,100 L50,85 Z"
        stroke={C.electricBlue}
        strokeWidth="1"
        fill="none"
        opacity="0.6"
      />
      {/* Inner transmission lines */}
      <path d="M55,35 L100,55 L145,35" stroke={C.electricBlue} strokeWidth="0.5" fill="none" opacity="0.3" />
      <path d="M40,60 L100,55 L160,60" stroke={C.electricBlue} strokeWidth="0.5" fill="none" opacity="0.3" />
      <path d="M50,85 L100,55 L150,85" stroke={C.electricBlue} strokeWidth="0.5" fill="none" opacity="0.3" />
      <path d="M80,100 L100,55 L120,100" stroke={C.electricBlue} strokeWidth="0.5" fill="none" opacity="0.3" />
      {/* Hub dots with staggered pulsing */}
      {hubs.map((hub, i) => (
        <g key={i}>
          <circle
            cx={hub.x}
            cy={hub.y}
            r="6"
            fill={C.electricBlue}
            fillOpacity="0.15"
            className="animate-dot-pulse"
            style={{ animationDelay: `${hub.delay}s` }}
          />
          <circle cx={hub.x} cy={hub.y} r="3" fill={C.electricBlue} fillOpacity="0.8" />
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
function BentoCard({ title, children, status = "live", className = "", style = {}, onTitleClick }: {
  title: string;
  children: React.ReactNode;
  status?: "live" | "stale" | "fallback";
  className?: string;
  style?: React.CSSProperties;
  onTitleClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        backgroundColor: C.bgElevated,
        border: `1px solid ${C.borderDefault}`,
        borderTop: `1px solid ${hovered ? C.borderActive : C.borderAccent}`,
        borderRadius: R.lg,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-top-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        ...style
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
        <StatusDot status={status} />
      </div>
      <div
        style={{
          padding: '10px 16px',
          borderBottom: `0.5px solid ${C.borderDefault}`,
          flexShrink: 0,
          cursor: onTitleClick ? 'pointer' : 'default',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
        onClick={onTitleClick}
      >
        <span style={{
          fontFamily: F.mono,
          fontSize: T.labelSize,
          fontWeight: 500,
          letterSpacing: T.labelSpacing,
          textTransform: 'uppercase' as const,
          color: C.textMuted,
        }}>{title}</span>
        {onTitleClick && (
          <span style={{
            fontFamily: "'Geist Mono', monospace",
            fontSize: '8px',
            color: 'rgba(255,255,255,0.2)',
            letterSpacing: '0.1em',
          }}>
            ↗ EXPAND
          </span>
        )}
      </div>
      <div style={{ flex: 1, minHeight: 0, position: 'relative', overflow: 'hidden' }}>
        {children}
      </div>
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
      <polyline points={points} fill="none" stroke={C.electricBlue} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="145" cy={35 - ((31.85 - min) / range) * 30} r="2.5" fill={C.electricBlueLight} />
    </svg>
  );
}

// LMP Scorecard with enhanced glow and delta (kept for future use)
// @ts-ignore: preserved component
function LMPScorecard() {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full py-2">
      <span className="text-[10px] tracking-wider mb-1" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.4)" }}>WEST HUB LMP</span>
      <span
        className="text-5xl font-medium"
        style={{ fontFamily: "'Geist Mono', monospace", fontVariantNumeric: "tabular-nums", color: C.electricBlueLight, textShadow: "0 0 20px rgba(34, 211, 238, 0.6), 0 0 40px rgba(34, 211, 238, 0.3)" }}
      >
        31.85
      </span>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px] tracking-wider" style={{ fontFamily: "'Geist Mono', monospace", color: C.electricBlue }}>$/MWh</span>
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
    <svg width="100%" height="60" className="mt-2">
      <polyline points={points} fill="none" stroke={C.electricBlue} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Regime detection — derived from LMP + reserve + marginal fuel

function detectRegime(zone: string | null): Regime {
  const z = zone ?? 'WEST_HUB'
  const lmp = ZONE_LMP[z]?.price ?? 33.0
  const reserve = ZONE_RESERVE[z] ?? 18.0

  if (lmp > 36 && reserve < 15) return 'SCARCITY'
  if (lmp < 32 && reserve > 22) return 'SURPLUS'
  if (Math.abs(lmp - 34) < 1.5 && reserve > 15 && reserve < 20) return 'TRANSITION'
  return 'NORMAL'
}

// ── SparkSpreadChart ─────────────────────────────────────────────
function SparkSpreadChart({ history, regime }: { history: number[]; regime: 'BURNING' | 'SUPPRESSED' | 'NEUTRAL' }) {
  const lineColor = regime === 'BURNING' ? C.falconGold : regime === 'SUPPRESSED' ? C.alertCritical : C.textSecondary;
  void lineColor; // referenced by regime, kept for future use
  const data = history.map((value, i) => ({
    i,
    label: i === 0 ? '12A' : i === 6 ? '6A' : i === 12 ? '12P' : i === 18 ? '6P' : i === 23 ? '11P' : String(i),
    positive: value >= 0 ? value : 0,
    negative: value < 0 ? value : 0,
    value,
  }));
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const v = payload[0]?.payload?.value ?? 0;
    const lbl = payload[0]?.payload?.label;
    return (
      <div style={{ background: C.bgOverlay, border: `1px solid ${C.borderStrong}`, borderRadius: R.md, padding: '8px 12px' }}>
        <div style={{ fontFamily: "'Geist', sans-serif", fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{lbl}</div>
        <div style={{ fontFamily: F.mono, fontSize: 15, fontWeight: 600, color: v >= 0 ? C.falconGold : C.alertCritical, fontVariantNumeric: 'tabular-nums' }}>
          {v >= 0 ? '+' : ''}{v.toFixed(1)} $/MWh
        </div>
      </div>
    );
  };
  return (
    <div style={{ width: '100%', height: '100%', background: '#111318', borderRadius: R.md, padding: 4, boxSizing: 'border-box' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="posGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={C.falconGold} stopOpacity={0.45} />
              <stop offset="95%" stopColor={C.falconGold} stopOpacity={0.08} />
            </linearGradient>
            <linearGradient id="negGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={C.alertCritical} stopOpacity={0.08} />
              <stop offset="95%" stopColor={C.alertCritical} stopOpacity={0.40} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.10)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontFamily: "'Geist', 'Inter', sans-serif", fontSize: 11, fill: 'rgba(229,231,235,0.55)' }} axisLine={{ stroke: 'rgba(229,231,235,0.12)' }} tickLine={false} interval={5} />
          <YAxis tick={{ fontFamily: "'Geist', 'Inter', sans-serif", fontSize: 11, fill: 'rgba(229,231,235,0.55)' }} axisLine={false} tickLine={false} tickFormatter={(v) => v > 0 ? `+${v}` : String(v)} width={36} />
          <ReferenceLine y={0} stroke={C.textMuted} strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: 'BREAKEVEN', position: 'insideTopLeft', style: { fontFamily: "'Geist', sans-serif", fontSize: 9, fill: C.textMuted } }} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: C.electricBlue, strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Area type="monotone" dataKey="positive" stroke={C.falconGold} strokeWidth={2.5} fill="url(#posGrad)" dot={false} activeDot={{ r: 5, fill: C.falconGold, stroke: C.bgElevated, strokeWidth: 2 }} isAnimationActive={false} />
          <Area type="monotone" dataKey="negative" stroke={C.alertCritical} strokeWidth={2.5} fill="url(#negGrad)" dot={false} activeDot={{ r: 5, fill: C.alertCritical, stroke: C.bgElevated, strokeWidth: 2 }} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── SparkKPIView ──────────────────────────────────────────────────
function SparkKPIView({ selectedZone }: { selectedZone: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const [closing, setClosing] = useState(false);

  const closeOverlay = () => {
    setClosing(true);
    setTimeout(() => { setExpanded(false); setClosing(false); }, 300);
  };

  useEffect(() => {
    if (!expanded) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeOverlay(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [expanded]);

  const SPARK_DATA = {
    zone: selectedZone ?? 'SYSTEM',
    regime: 'BURNING' as 'BURNING' | 'SUPPRESSED' | 'NEUTRAL',
    spreadValue: 12.4,
    gasPrice: 3.42,
    heatRate: 7.2,
    powerPrice: 35.90,
    gasEquivPrice: 24.62,
    netSpread: 12.4,
    avg24h: 10.8,
    peak: { value: 18.2, hour: '8AM' },
    hoursBurning: 18,
    history: [
      -2.4, -1.8, -0.6, 2.1, 4.8, 8.2, 14.1, 18.2,
      16.8, 15.2, 13.4, 12.8, 11.9, 10.4, 9.8, 11.2,
      13.6, 14.9, 12.4, 10.8, 9.2, 7.6, 5.4, 3.8,
    ],
  };

  const regimeColor = SPARK_DATA.regime === 'BURNING'
    ? C.falconGold
    : SPARK_DATA.regime === 'SUPPRESSED'
      ? C.alertCritical
      : C.textSecondary;

  const regimeBg = SPARK_DATA.regime === 'BURNING'
    ? C.falconGoldWash
    : SPARK_DATA.regime === 'SUPPRESSED'
      ? 'rgba(239,68,68,0.10)'
      : 'rgba(255,255,255,0.06)';

  const regimeBorder = SPARK_DATA.regime === 'BURNING'
    ? 'rgba(245,158,11,0.30)'
    : SPARK_DATA.regime === 'SUPPRESSED'
      ? 'rgba(239,68,68,0.30)'
      : 'rgba(255,255,255,0.20)';

  const RegimeBadge = () => (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 8px', background: regimeBg,
      border: `1px solid ${regimeBorder}`, borderRadius: R.sm,
      color: regimeColor, fontFamily: F.mono, fontSize: '10px',
      fontWeight: '500', letterSpacing: '0.10em', textTransform: 'uppercase' as const,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: '50%', background: regimeColor, flexShrink: 0 }} />
      {SPARK_DATA.regime}
    </div>
  );

  return (
    <>
      {/* ── COMPACT STATE ── */}
      <div
        onClick={() => setExpanded(true)}
        style={{
          display: 'flex', flexDirection: 'column', position: 'absolute', inset: 0,
          padding: `${S.lg} ${S.lg} ${S.md} ${S.lg}`, gap: S.md,
          overflow: 'hidden', cursor: 'pointer',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontFamily: F.mono, fontSize: T.labelSize, fontWeight: T.labelWeight, letterSpacing: T.labelSpacing, textTransform: 'uppercase' as const, color: C.textMuted }}>
            SPARK SPREAD · {SPARK_DATA.zone}
          </span>
          <RegimeBadge />
        </div>

        {/* Dominant number */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ fontFamily: F.mono, fontSize: T.dataLgSize, fontWeight: T.dataLgWeight, color: regimeColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
            {SPARK_DATA.regime === 'BURNING' ? '+' : ''}{SPARK_DATA.spreadValue.toFixed(1)}
          </div>
          <div style={{ fontFamily: F.mono, fontSize: T.labelSize, color: C.textMuted, marginTop: S.xs, letterSpacing: '0.08em' }}>
            $/MWh NET SPREAD
          </div>
        </div>

        {/* Input breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: S.xs, flexShrink: 0, paddingTop: S.xs, borderTop: `1px solid ${C.borderDefault}` }}>
          {[
            { label: 'PWR PRICE',  value: `$${SPARK_DATA.powerPrice.toFixed(2)}`,    color: C.electricBlue },
            { label: 'GAS EQUIV',  value: `$${SPARK_DATA.gasEquivPrice.toFixed(2)}`, color: C.falconGold },
            { label: 'NET SPREAD', value: `$${SPARK_DATA.netSpread.toFixed(2)}`,     color: regimeColor },
          ].map(row => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{row.label}</span>
              <span style={{ fontFamily: F.mono, fontSize: T.dataSmSize, fontWeight: '500', color: row.color, fontVariantNumeric: 'tabular-nums' }}>
                {row.value}<span style={{ color: C.textMuted, fontSize: '10px', marginLeft: 3 }}>/MWh</span>
              </span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: S.xl, marginTop: S.xs }}>
            {[{ label: 'GAS', value: `$${SPARK_DATA.gasPrice}/MMBtu` }, { label: 'HR', value: `${SPARK_DATA.heatRate}×` }].map(item => (
              <div key={item.label} style={{ display: 'flex', gap: S.xs, alignItems: 'baseline' }}>
                <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.08em' }}>{item.label}</span>
                <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textSecondary }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexShrink: 0, paddingTop: S.sm, borderTop: `1px solid ${C.borderDefault}` }}>
          {[
            { label: '24H AVG',     value: `+${SPARK_DATA.avg24h.toFixed(1)}`,    color: C.falconGold },
            { label: 'HRS BURNING', value: `${SPARK_DATA.hoursBurning}/24`,        color: C.textPrimary },
            { label: 'PEAK SPREAD', value: `+${SPARK_DATA.peak.value.toFixed(1)}`, color: C.falconGold },
          ].map(stat => (
            <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <span style={{ fontFamily: F.mono, fontSize: '9px', color: C.textMuted, letterSpacing: '0.10em', textTransform: 'uppercase' as const }}>{stat.label}</span>
              <span style={{ fontFamily: F.mono, fontSize: '13px', fontWeight: '600', color: stat.color, fontVariantNumeric: 'tabular-nums' }}>{stat.value}</span>
            </div>
          ))}
        </div>

        {/* Expand hint */}
        <div style={{ fontFamily: F.mono, fontSize: '9px', color: C.textMuted, letterSpacing: '0.10em', textAlign: 'center' as const, paddingTop: S.sm, opacity: 0.6 }}>
          › CLICK TO EXPAND
        </div>
      </div>

      {/* ── EXPANDED OVERLAY ── */}
      {expanded && createPortal(
        <>
          <div onClick={closeOverlay} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(10,10,11,0.82)', backdropFilter: 'blur(2px)' }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 61, width: '95vw', height: '95vh',
            background: C.bgBase,
            border: `0.5px solid ${C.borderAccent}`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            animation: closing
              ? 'modal-collapse 300ms cubic-bezier(0.16,1,0.3,1) forwards'
              : 'modal-expand 300ms cubic-bezier(0.16,1,0.3,1) forwards',
            boxShadow: `0 0 80px ${C.falconGold}14`,
          }}>
            {/* Header bar */}
            <div style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: `0.5px solid ${C.borderDefault}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>SPARK SPREAD INTELLIGENCE</span>
                <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.electricBlue, letterSpacing: '0.10em' }}>/ {SPARK_DATA.zone}</span>
                <RegimeBadge />
              </div>
              <button onClick={closeOverlay} style={{ fontFamily: F.mono, fontSize: '9px', color: C.textSecondary, background: C.bgOverlay, border: `0.5px solid ${C.borderDefault}`, borderRadius: R.md, padding: '4px 12px', cursor: 'pointer', letterSpacing: '0.10em' }}>
                ESC / CLOSE
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', gap: '24px', overflow: 'hidden' }}>
              {/* Top: dominant + metrics strip */}
              <div style={{ display: 'flex', gap: '48px', flexShrink: 0, alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontFamily: F.mono, fontSize: '64px', fontWeight: '700', color: regimeColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                    {SPARK_DATA.regime === 'BURNING' ? '+' : ''}{SPARK_DATA.spreadValue.toFixed(1)}
                  </div>
                  <div style={{ fontFamily: F.mono, fontSize: '13px', color: C.textMuted, marginTop: '8px' }}>$/MWh NET SPREAD · {SPARK_DATA.zone}</div>
                </div>
                <div style={{ display: 'flex', gap: '1px', flex: 1 }}>
                  {[
                    { label: 'CURRENT SPREAD', value: `+${SPARK_DATA.spreadValue.toFixed(1)}`, color: regimeColor },
                    { label: '24H AVG',         value: `+${SPARK_DATA.avg24h.toFixed(1)}`,      color: C.textPrimary },
                    { label: 'GAS PRICE',        value: `$${SPARK_DATA.gasPrice}`,               color: C.textPrimary },
                    { label: 'HEAT RATE',        value: `${SPARK_DATA.heatRate}×`,               color: C.textPrimary },
                  ].map(tile => (
                    <div key={tile.label} style={{ flex: 1, background: C.bgOverlay, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.10em', textTransform: 'uppercase' as const }}>{tile.label}</span>
                      <span style={{ fontFamily: F.mono, fontSize: '22px', fontWeight: '600', color: tile.color, fontVariantNumeric: 'tabular-nums' }}>{tile.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart */}
              <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0 }}>
                  <SparkSpreadChart history={SPARK_DATA.history} regime={SPARK_DATA.regime} />
                </div>
              </div>

              {/* Bottom panels */}
              <div style={{ display: 'flex', gap: '1px', flexShrink: 0, height: '120px' }}>
                {[
                  {
                    label: 'GAS PRICE INPUTS', color: C.falconGold,
                    rows: [
                      { k: 'Henry Hub',       v: `$${SPARK_DATA.gasPrice}/MMBtu` },
                      { k: 'Heat rate',       v: `${SPARK_DATA.heatRate}×` },
                      { k: 'Gas equiv price', v: `$${SPARK_DATA.gasEquivPrice.toFixed(2)}/MWh` },
                    ],
                  },
                  {
                    label: 'PLANT ECONOMICS', color: C.electricBlue,
                    rows: [
                      { k: 'Power price', v: `$${SPARK_DATA.powerPrice.toFixed(2)}/MWh` },
                      { k: 'Net spread',  v: `+$${SPARK_DATA.netSpread.toFixed(2)}/MWh` },
                      { k: 'Hrs burning', v: `${SPARK_DATA.hoursBurning}/24` },
                    ],
                  },
                  {
                    label: 'DISPATCH SIGNAL', color: C.textPrimary,
                    rows: [
                      { k: 'Status',      v: SPARK_DATA.regime },
                      { k: '24H avg',     v: `+$${SPARK_DATA.avg24h.toFixed(1)}/MWh` },
                      { k: 'Peak spread', v: `+$${SPARK_DATA.peak.value.toFixed(1)} at ${SPARK_DATA.peak.hour}` },
                    ],
                  },
                ].map(panel => (
                  <div key={panel.label} style={{ flex: 1, background: C.bgOverlay, borderLeft: `2px solid ${panel.color}`, padding: '12px 16px' }}>
                    <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.10em', textTransform: 'uppercase' as const, marginBottom: '10px' }}>{panel.label}</div>
                    {panel.rows.map(row => (
                      <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontFamily: F.mono, fontSize: '12px', color: C.textMuted }}>{row.k}</span>
                        <span style={{ fontFamily: F.mono, fontSize: '12px', color: C.textPrimary, fontVariantNumeric: 'tabular-nums' }}>{row.v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

// ── SOCGauge ──────────────────────────────────────────────────────
function SOCGauge({ soc, size = 140 }: { soc: number; size?: number }) {
  const SIZE = size;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const RADIUS = Math.round(SIZE * 0.371); // ~52px at 140, ~74px at 200
  const START_DEG = -220;
  const SWEEP_DEG = 260;
  const STROKE = 8;

  const degToRad = (d: number) => (d * Math.PI) / 180;
  const polarToXY = (deg: number, r: number) => ({
    x: CX + r * Math.cos(degToRad(deg)),
    y: CY + r * Math.sin(degToRad(deg)),
  });

  const arcPath = (startDeg: number, sweepDeg: number, r: number) => {
    const start = polarToXY(startDeg, r);
    const end   = polarToXY(startDeg + sweepDeg, r);
    const large = sweepDeg > 180 ? 1 : 0;
    return `M ${start.x},${start.y} A ${r},${r} 0 ${large} 1 ${end.x},${end.y}`;
  };

  const trackPath  = arcPath(START_DEG, SWEEP_DEG, RADIUS);
  const filledSweep = (soc / 100) * SWEEP_DEG;
  const filledPath = arcPath(START_DEG, filledSweep, RADIUS);

  const arcLen = (SWEEP_DEG / 360) * 2 * Math.PI * RADIUS;
  const filledLen = (soc / 100) * arcLen;

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <filter id="socGlow">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      {/* Track */}
      <path
        d={trackPath}
        fill="none"
        stroke={C.borderDefault}
        strokeWidth={STROKE}
        strokeLinecap="round"
      />
      {/* Filled arc */}
      {soc > 0 && (
        <path
          d={filledPath}
          fill="none"
          stroke={C.electricBlue}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={`${filledLen} ${arcLen}`}
          filter="url(#socGlow)"
        />
      )}
      {/* SOC value */}
      <text
        x={CX}
        y={CY - 4}
        textAnchor="middle"
        style={{ fontFamily: F.mono, fontSize: `${Math.round(SIZE * 0.171)}px`, fontWeight: 600, fill: C.electricBlue }}
      >
        {soc}%
      </text>
      <text
        x={CX}
        y={CY + Math.round(SIZE * 0.1)}
        textAnchor="middle"
        style={{ fontFamily: F.mono, fontSize: `${Math.round(SIZE * 0.064)}px`, fill: C.textMuted, letterSpacing: '0.12em' }}
      >
        STATE OF CHARGE
      </text>
    </svg>
  );
}

// ── SOCProfileChart ───────────────────────────────────────────────
function SOCProfileChart({ socHistory }: { socHistory: number[] }) {
  const data = socHistory.map((soc, i) => ({
    i, soc,
    label: i === 0 ? '12A' : i === 6 ? '6A' : i === 12 ? '12P' : i === 18 ? '6P' : i === 23 ? '11P' : String(i),
  }));
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{ background: C.bgOverlay, border: `1px solid ${C.borderStrong}`, borderRadius: R.md, padding: '8px 12px' }}>
        <div style={{ fontFamily: "'Geist', sans-serif", fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{payload[0]?.payload?.label}</div>
        <div style={{ fontFamily: F.mono, fontSize: 15, fontWeight: 600, color: C.electricBlue, fontVariantNumeric: 'tabular-nums' }}>{payload[0]?.value}% SOC</div>
      </div>
    );
  };
  return (
    <div style={{ width: '100%', height: '100%', background: '#111318', borderRadius: R.md, padding: 4, boxSizing: 'border-box' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="socGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={C.electricBlue} stopOpacity={0.40} />
              <stop offset="95%" stopColor={C.electricBlue} stopOpacity={0.06} />
            </linearGradient>
          </defs>
          <ReferenceArea x1={2} x2={6} fill={C.electricBlue} fillOpacity={0.08} label={{ value: 'CHARGE', position: 'insideTop', style: { fontFamily: "'Geist', sans-serif", fontSize: 9, fill: C.electricBlue } }} />
          <ReferenceArea x1={16} x2={20} fill={C.falconGold} fillOpacity={0.10} label={{ value: 'DISCHARGE', position: 'insideTop', style: { fontFamily: "'Geist', sans-serif", fontSize: 9, fill: C.falconGold } }} />
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.10)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontFamily: "'Geist', 'Inter', sans-serif", fontSize: 11, fill: 'rgba(229,231,235,0.55)' }} axisLine={{ stroke: 'rgba(229,231,235,0.12)' }} tickLine={false} interval={5} />
          <YAxis domain={[0, 100]} tick={{ fontFamily: "'Geist', 'Inter', sans-serif", fontSize: 11, fill: 'rgba(229,231,235,0.55)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} width={40} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: C.electricBlue, strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Area type="monotone" dataKey="soc" stroke={C.electricBlue} strokeWidth={2.5} fill="url(#socGrad)" dot={false} activeDot={{ r: 5, fill: C.electricBlue, stroke: C.bgElevated, strokeWidth: 2 }} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── BatteryKPIView ────────────────────────────────────────────────
function BatteryKPIView({ selectedZone }: { selectedZone: string | null }) {
  const [animSoc, setAnimSoc] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [closing, setClosing] = useState(false);
  const targetSoc = 71;

  const closeOverlay = () => {
    setClosing(true);
    setTimeout(() => { setExpanded(false); setClosing(false); }, 300);
  };

  useEffect(() => {
    if (!expanded) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeOverlay(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [expanded]);

  useEffect(() => {
    setAnimSoc(0);
    let start: number | null = null;
    const duration = 1200;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimSoc(Math.round(eased * targetSoc));
      if (progress < 1) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [selectedZone]);

  const isCharging = true;
  const stateBadgeColor = isCharging ? C.alertNormal : C.falconGold;

  const socHistory = [45,42,38,35,33,31,30,40,58,72,75,74,73,71,70,68,65,55,42,30,28,32,36,40];

  const StateBadge = () => (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: R.sm, backgroundColor: `${stateBadgeColor}18`, border: `1px solid ${stateBadgeColor}50` }}>
      <span style={{ fontFamily: F.mono, fontSize: T.labelSize, color: stateBadgeColor, letterSpacing: T.labelSpacing }}>{isCharging ? 'CHARGING' : 'DISCHARGING'}</span>
    </div>
  );

  return (
    <>
      {/* ── COMPACT STATE ── */}
      <div
        onClick={() => setExpanded(true)}
        style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: S.lg, gap: S.sm, overflow: 'hidden', cursor: 'pointer' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontFamily: F.mono, fontSize: T.labelSize, color: C.textMuted, letterSpacing: T.labelSpacing, textTransform: 'uppercase' as const }}>{selectedZone ?? 'WEST HUB'} ARB</span>
          <StateBadge />
        </div>
        {/* Gauge */}
        <div style={{ display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
          <SOCGauge soc={animSoc} />
        </div>
        {/* Three columns */}
        <div style={{ display: 'flex', gap: S.sm, flexShrink: 0 }}>
          <div style={{ flex: 1, padding: '6px 8px', borderRadius: R.sm, backgroundColor: C.bgOverlay, border: `1px solid ${C.borderDefault}`, display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontFamily: F.mono, fontSize: '8px', color: C.textMuted, letterSpacing: T.labelSpacing, textTransform: 'uppercase' as const }}>CHARGE</span>
            <span style={{ fontFamily: F.mono, fontSize: T.dataSmSize, color: C.alertNormal, fontWeight: T.dataSmWeight }}>$21.40</span>
            <span style={{ fontFamily: F.mono, fontSize: '8px', color: C.textMuted }}>06:00–10:00</span>
          </div>
          <div style={{ flex: 1, padding: '6px 8px', borderRadius: R.sm, backgroundColor: `${C.falconGold}0A`, border: `1px solid ${C.falconGold}30`, display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
            <span style={{ fontFamily: F.mono, fontSize: '8px', color: C.textMuted, letterSpacing: T.labelSpacing, textTransform: 'uppercase' as const }}>CYCLE SPREAD</span>
            <span style={{ fontFamily: F.mono, fontSize: '18px', color: C.falconGold, fontWeight: 600 }}>+21.80</span>
            <span style={{ fontFamily: F.mono, fontSize: '8px', color: C.textMuted }}>$/MWh</span>
          </div>
          <div style={{ flex: 1, padding: '6px 8px', borderRadius: R.sm, backgroundColor: C.bgOverlay, border: `1px solid ${C.borderDefault}`, display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontFamily: F.mono, fontSize: '8px', color: C.textMuted, letterSpacing: T.labelSpacing, textTransform: 'uppercase' as const }}>DISCHARGE</span>
            <span style={{ fontFamily: F.mono, fontSize: T.dataSmSize, color: C.falconGold, fontWeight: T.dataSmWeight }}>$43.20</span>
            <span style={{ fontFamily: F.mono, fontSize: '8px', color: C.textMuted }}>16:00–20:00</span>
          </div>
        </div>
        {/* Revenue */}
        <div style={{ flexShrink: 0, padding: '8px 12px', borderRadius: R.sm, backgroundColor: C.bgOverlay, border: `1px solid ${C.borderDefault}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: F.mono, fontSize: T.labelSize, color: C.textMuted, letterSpacing: T.labelSpacing, textTransform: 'uppercase' as const }}>EST. DAILY REVENUE</span>
          <span style={{ fontFamily: F.mono, fontSize: T.dataMdSize, color: C.falconGold, fontWeight: 600 }}>$4,240</span>
        </div>
        {/* Expand hint */}
        <div style={{ fontFamily: F.mono, fontSize: '9px', color: C.textMuted, letterSpacing: '0.10em', textAlign: 'center' as const, paddingTop: S.sm, opacity: 0.6 }}>
          › CLICK TO EXPAND
        </div>
      </div>

      {/* ── EXPANDED OVERLAY ── */}
      {expanded && createPortal(
        <>
          <div onClick={closeOverlay} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(10,10,11,0.82)', backdropFilter: 'blur(2px)' }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            zIndex: 61, width: '95vw', height: '95vh',
            background: C.bgBase, border: `0.5px solid ${C.borderAccent}`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            animation: closing ? 'modal-collapse 300ms cubic-bezier(0.16,1,0.3,1) forwards' : 'modal-expand 300ms cubic-bezier(0.16,1,0.3,1) forwards',
            boxShadow: `0 0 80px ${C.electricBlue}14`,
          }}>
            {/* Header */}
            <div style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: `0.5px solid ${C.borderDefault}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>BATTERY ARBITRAGE</span>
                <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.electricBlue, letterSpacing: '0.10em' }}>/ {selectedZone ?? 'WEST HUB'}</span>
                <StateBadge />
              </div>
              <button onClick={closeOverlay} style={{ fontFamily: F.mono, fontSize: '9px', color: C.textSecondary, background: C.bgOverlay, border: `0.5px solid ${C.borderDefault}`, borderRadius: R.md, padding: '4px 12px', cursor: 'pointer', letterSpacing: '0.10em' }}>
                ESC / CLOSE
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, display: 'flex', padding: '24px', gap: '32px', overflow: 'hidden' }}>
              {/* Left: large gauge */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', flexShrink: 0, width: '220px' }}>
                <SOCGauge soc={targetSoc} size={200} />
                <div style={{ textAlign: 'center' as const }}>
                  <div style={{ fontFamily: F.mono, fontSize: T.labelSize, color: C.textMuted, letterSpacing: T.labelSpacing, textTransform: 'uppercase' as const, marginBottom: '8px' }}>CURRENT CYCLE</div>
                  {[
                    { k: 'Charge price',  v: '$21.40/MWh', c: C.alertNormal },
                    { k: 'Discharge',     v: '$43.20/MWh', c: C.falconGold },
                    { k: 'Cycle spread',  v: '+$21.80/MWh', c: C.falconGold },
                    { k: 'Efficiency',    v: '88%', c: C.textPrimary },
                    { k: 'Hrs remaining', v: '6.5h', c: C.textSecondary },
                  ].map(row => (
                    <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', marginBottom: '5px' }}>
                      <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted }}>{row.k}</span>
                      <span style={{ fontFamily: F.mono, fontSize: '11px', color: row.c, fontVariantNumeric: 'tabular-nums' }}>{row.v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: metrics + chart */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
                {/* Metrics strip */}
                <div style={{ display: 'flex', gap: '1px', flexShrink: 0 }}>
                  {[
                    { label: 'SOC',           value: `${targetSoc}%`,  color: C.electricBlue },
                    { label: 'DAILY REVENUE', value: '$4,240',          color: C.falconGold },
                    { label: 'CYCLE SPREAD',  value: '+$21.80',         color: C.falconGold },
                    { label: 'HRS REMAINING', value: '6.5h',            color: C.textPrimary },
                  ].map(tile => (
                    <div key={tile.label} style={{ flex: 1, background: C.bgOverlay, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.10em', textTransform: 'uppercase' as const }}>{tile.label}</span>
                      <span style={{ fontFamily: F.mono, fontSize: '22px', fontWeight: '600', color: tile.color, fontVariantNumeric: 'tabular-nums' }}>{tile.value}</span>
                    </div>
                  ))}
                </div>
                {/* SOC profile chart */}
                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontFamily: F.mono, fontSize: T.labelSize, color: C.textMuted, letterSpacing: T.labelSpacing, textTransform: 'uppercase' as const, flexShrink: 0 }}>24H SOC PROFILE</div>
                  <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0 }}>
                      <SOCProfileChart socHistory={socHistory} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom panels */}
            <div style={{ display: 'flex', gap: '1px', flexShrink: 0, height: '110px', borderTop: `0.5px solid ${C.borderDefault}` }}>
              {[
                { label: 'CHARGE WINDOW', color: C.alertNormal, rows: [{ k: 'Window', v: '06:00–10:00' }, { k: 'Price', v: '$21.40/MWh' }, { k: 'Duration', v: '4h' }] },
                { label: 'DISCHARGE WINDOW', color: C.falconGold, rows: [{ k: 'Window', v: '16:00–20:00' }, { k: 'Price', v: '$43.20/MWh' }, { k: 'Duration', v: '4h' }] },
                { label: 'ARBITRAGE ECONOMICS', color: C.electricBlue, rows: [{ k: 'Gross spread', v: '+$21.80/MWh' }, { k: 'Round-trip eff.', v: '88%' }, { k: 'Net revenue', v: '$4,240/day' }] },
              ].map(panel => (
                <div key={panel.label} style={{ flex: 1, background: C.bgOverlay, borderLeft: `2px solid ${panel.color}`, padding: '12px 16px' }}>
                  <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.10em', textTransform: 'uppercase' as const, marginBottom: '8px' }}>{panel.label}</div>
                  {panel.rows.map(row => (
                    <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted }}>{row.k}</span>
                      <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textPrimary, fontVariantNumeric: 'tabular-nums' }}>{row.v}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

// ── ResourceGapChart ──────────────────────────────────────────────
function ResourceGapChart({ capacity, load, regime }: { capacity: number[]; load: number[]; regime: 'ADEQUATE' | 'TIGHT' | 'EMERGENCY' }) {
  const gapColor = regime === 'ADEQUATE' ? C.alertNormal : regime === 'TIGHT' ? C.falconGold : C.alertCritical;
  const data = capacity.map((cap, i) => ({
    i, cap, load: load[i],
    label: i === 0 ? '12A' : i === 6 ? '6A' : i === 12 ? '12P' : i === 18 ? '6P' : i === 23 ? '11P' : String(i),
  }));
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const cap = payload.find((p: any) => p.dataKey === 'cap')?.value;
    const ld  = payload.find((p: any) => p.dataKey === 'load')?.value;
    return (
      <div style={{ background: C.bgOverlay, border: `1px solid ${C.borderStrong}`, borderRadius: R.md, padding: '8px 12px' }}>
        <div style={{ fontFamily: "'Geist', sans-serif", fontSize: 11, color: C.textMuted, marginBottom: 6 }}>{payload[0]?.payload?.label}</div>
        <div style={{ fontFamily: F.mono, fontSize: 12, color: C.electricBlue, marginBottom: 3 }}>CAP {cap} GW</div>
        <div style={{ fontFamily: F.mono, fontSize: 12, color: C.textSecondary, marginBottom: 3 }}>LOAD {ld} GW</div>
        <div style={{ fontFamily: F.mono, fontSize: 12, color: gapColor, fontWeight: 600 }}>GAP {cap != null && ld != null ? (cap - ld).toFixed(1) : '—'} GW</div>
      </div>
    );
  };
  return (
    <div style={{ width: '100%', height: '100%', background: '#111318', borderRadius: R.md, padding: 4, boxSizing: 'border-box' }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 16, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="gapGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={gapColor} stopOpacity={0.35} />
              <stop offset="95%" stopColor={gapColor} stopOpacity={0.06} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.10)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontFamily: "'Geist', 'Inter', sans-serif", fontSize: 11, fill: 'rgba(229,231,235,0.55)' }} axisLine={{ stroke: 'rgba(229,231,235,0.12)' }} tickLine={false} interval={5} />
          <YAxis tick={{ fontFamily: "'Geist', 'Inter', sans-serif", fontSize: 11, fill: 'rgba(229,231,235,0.55)' }} axisLine={false} tickLine={false} width={40} domain={['auto', 'auto']} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: C.electricBlue, strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Area type="monotone" dataKey="cap" fill="url(#gapGrad)" stroke="none" isAnimationActive={false} legendType="none" />
          <Line type="monotone" dataKey="cap"  stroke={C.electricBlue}   strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: C.electricBlue,   stroke: C.bgElevated, strokeWidth: 2 }} isAnimationActive={false} name="CAPACITY" />
          <Line type="monotone" dataKey="load" stroke={C.textSecondary} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: C.textSecondary, stroke: C.bgElevated, strokeWidth: 2 }} isAnimationActive={false} name="LOAD" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── GapKPIView ────────────────────────────────────────────────────
function GapKPIView({ selectedZone }: { selectedZone: string | null }) {
  const [expanded, setExpanded] = useState(false);
  const [closing, setClosing] = useState(false);

  const closeOverlay = () => {
    setClosing(true);
    setTimeout(() => { setExpanded(false); setClosing(false); }, 300);
  };

  useEffect(() => {
    if (!expanded) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeOverlay(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [expanded]);

  const capacityData = [68,69,70,71,72,72,73,74,74,73,72,71,70,70,71,72,73,74,73,72,71,70,69,68];
  const loadData     = [52,50,49,48,50,54,60,65,66,67,68,67,66,65,64,65,67,70,71,70,66,62,58,55];

  const reserveMargin = ZONE_RESERVE[selectedZone ?? 'WEST_HUB'] ?? 18.4;
  const gapColor   = reserveMargin < 15 ? C.alertCritical : reserveMargin < 18 ? C.falconGold : C.electricBlue;
  const badgeLabel = reserveMargin < 15 ? 'EMERGENCY'   : reserveMargin < 18 ? 'TIGHT'      : 'ADEQUATE';
  const badgeBg    = reserveMargin < 15 ? `${C.alertCritical}18` : reserveMargin < 18 ? `${C.falconGold}18` : `${C.electricBlue}18`;
  const badgeBorder= reserveMargin < 15 ? `${C.alertCritical}50` : reserveMargin < 18 ? `${C.falconGold}50` : `${C.electricBlue}50`;

  const StatusBadge = () => (
    <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: R.sm, backgroundColor: badgeBg, border: `1px solid ${badgeBorder}` }}>
      <span style={{ fontFamily: F.mono, fontSize: T.labelSize, color: gapColor, letterSpacing: T.labelSpacing }}>{badgeLabel}</span>
    </div>
  );

  const metrics = [
    { label: 'SYSTEM LOAD', value: '65.2 GW', color: C.textSecondary },
    { label: 'CAPACITY',    value: '78.4 GW', color: C.electricBlue },
    { label: 'PEAK FCST',   value: '67.8 GW', color: C.falconGold },
  ];

  return (
    <>
      {/* ── COMPACT STATE ── */}
      <div
        onClick={() => setExpanded(true)}
        style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: S.lg, gap: S.sm, overflow: 'hidden', cursor: 'pointer' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontFamily: F.mono, fontSize: T.labelSize, color: C.textMuted, letterSpacing: T.labelSpacing, textTransform: 'uppercase' as const }}>
            {selectedZone ?? 'WEST HUB'} RESOURCE GAP
          </span>
          <StatusBadge />
        </div>
        {/* Hero number */}
        <div style={{ flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: S.sm }}>
            <span style={{ fontFamily: F.mono, fontSize: '36px', fontWeight: 300, color: gapColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {reserveMargin.toFixed(1)}%
            </span>
          </div>
          <div style={{ fontFamily: F.mono, fontSize: T.labelSize, color: C.textMuted, letterSpacing: T.labelSpacing, textTransform: 'uppercase' as const, marginTop: S.xs }}>
            RESERVE MARGIN
          </div>
        </div>
        {/* Metrics strip */}
        <div style={{ display: 'flex', gap: S.sm, flexShrink: 0 }}>
          {metrics.map(m => (
            <div key={m.label} style={{ flex: 1, padding: '5px 8px', borderRadius: R.sm, backgroundColor: C.bgOverlay, border: `1px solid ${C.borderDefault}` }}>
              <div style={{ fontFamily: F.mono, fontSize: '8px', color: C.textMuted, letterSpacing: T.labelSpacing, textTransform: 'uppercase' as const, marginBottom: '3px' }}>{m.label}</div>
              <div style={{ fontFamily: F.mono, fontSize: T.dataSmSize, color: m.color, fontWeight: T.dataSmWeight }}>{m.value}</div>
            </div>
          ))}
        </div>
        {/* Expand hint */}
        <div style={{ fontFamily: F.mono, fontSize: '9px', color: C.textMuted, letterSpacing: '0.10em', textAlign: 'center' as const, paddingTop: S.sm, opacity: 0.6 }}>
          › CLICK TO EXPAND
        </div>
      </div>

      {/* ── EXPANDED OVERLAY ── */}
      {expanded && createPortal(
        <>
          <div onClick={closeOverlay} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(10,10,11,0.82)', backdropFilter: 'blur(2px)' }} />
          <div style={{
            position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            zIndex: 61, width: '95vw', height: '95vh',
            background: C.bgBase, border: `0.5px solid ${C.borderAccent}`,
            display: 'flex', flexDirection: 'column', overflow: 'hidden',
            animation: closing ? 'modal-collapse 300ms cubic-bezier(0.16,1,0.3,1) forwards' : 'modal-expand 300ms cubic-bezier(0.16,1,0.3,1) forwards',
            boxShadow: `0 0 80px ${gapColor}14`,
          }}>
            {/* Header */}
            <div style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', borderBottom: `0.5px solid ${C.borderDefault}`, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.15em', textTransform: 'uppercase' as const }}>RESOURCE GAP ANALYSIS</span>
                <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.electricBlue, letterSpacing: '0.10em' }}>/ {selectedZone ?? 'WEST HUB'}</span>
                <StatusBadge />
              </div>
              <button onClick={closeOverlay} style={{ fontFamily: F.mono, fontSize: '9px', color: C.textSecondary, background: C.bgOverlay, border: `0.5px solid ${C.borderDefault}`, borderRadius: R.md, padding: '4px 12px', cursor: 'pointer', letterSpacing: '0.10em' }}>
                ESC / CLOSE
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', gap: '24px', overflow: 'hidden' }}>
              {/* Top: dominant + metrics strip */}
              <div style={{ display: 'flex', gap: '48px', flexShrink: 0, alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontFamily: F.mono, fontSize: '64px', fontWeight: 300, color: gapColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                    {reserveMargin.toFixed(1)}%
                  </div>
                  <div style={{ fontFamily: F.mono, fontSize: '13px', color: C.textMuted, marginTop: '8px' }}>RESERVE MARGIN · {selectedZone ?? 'WEST HUB'}</div>
                  <div style={{ fontFamily: F.mono, fontSize: '12px', color: C.textSecondary, marginTop: '4px' }}>
                    15.0% REQUIRED · <span style={{ color: gapColor }}>+{(reserveMargin - 15).toFixed(1)}% BUFFER</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1px', flex: 1 }}>
                  {[
                    { label: 'RESERVE MARGIN', value: `${reserveMargin.toFixed(1)}%`, color: gapColor },
                    { label: 'SYSTEM LOAD',    value: '65.2 GW',                       color: C.textPrimary },
                    { label: 'INSTALLED CAP',  value: '78.4 GW',                       color: C.electricBlue },
                    { label: 'PEAK FORECAST',  value: '67.8 GW',                       color: C.falconGold },
                  ].map(tile => (
                    <div key={tile.label} style={{ flex: 1, background: C.bgOverlay, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.10em', textTransform: 'uppercase' as const }}>{tile.label}</span>
                      <span style={{ fontFamily: F.mono, fontSize: '22px', fontWeight: '600', color: tile.color, fontVariantNumeric: 'tabular-nums' }}>{tile.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chart */}
              <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                <div style={{ position: 'absolute', inset: 0 }}>
                  <ResourceGapChart capacity={capacityData} load={loadData} regime={badgeLabel as 'ADEQUATE' | 'TIGHT' | 'EMERGENCY'} />
                </div>
              </div>

              {/* Bottom panels */}
              <div style={{ display: 'flex', gap: '1px', flexShrink: 0, height: '110px', borderTop: `0.5px solid ${C.borderDefault}` }}>
                {[
                  { label: 'CAPACITY POSITION', color: C.electricBlue, rows: [{ k: 'Installed', v: '78.4 GW' }, { k: 'Committed', v: '74.2 GW' }, { k: 'Available', v: '4.2 GW' }] },
                  { label: 'LOAD ANALYSIS', color: C.textSecondary, rows: [{ k: 'Current load', v: '65.2 GW' }, { k: 'Peak forecast', v: '67.8 GW' }, { k: 'Avg 24H', v: '63.1 GW' }] },
                  { label: 'SYSTEM STATUS', color: gapColor, rows: [{ k: 'Reserve margin', v: `${reserveMargin.toFixed(1)}%` }, { k: 'Status', v: badgeLabel }, { k: 'Required min', v: '15.0%' }] },
                ].map(panel => (
                  <div key={panel.label} style={{ flex: 1, background: C.bgOverlay, borderLeft: `2px solid ${panel.color}`, padding: '12px 16px' }}>
                    <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.10em', textTransform: 'uppercase' as const, marginBottom: '8px' }}>{panel.label}</div>
                    {panel.rows.map(row => (
                      <div key={row.k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted }}>{row.k}</span>
                        <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textPrimary, fontVariantNumeric: 'tabular-nums' }}>{row.v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}

// THE NEST View - Volumetric Bento
function NestView() {
  const [selectedZone, setSelectedZone] = useState<string | null>(null)
  const [marketPulseExpanded, setMarketPulseExpanded] = useState(false)
  const [marketPulseClosing, setMarketPulseClosing] = useState(false)
  const [ghostTime, setGhostTime] = useState<string | null>(null)
  const [flashAlertZone, setFlashAlertZone] = useState<string | null>(null)
  const [activeKPI, setActiveKPI] = useState<'lmp' | 'spark' | 'battery' | 'gap'>('lmp')

  // Ghost mode toggle — press G
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'g' || e.key === 'G') {
        setGhostTime(prev =>
          prev ? null : new Date(Date.now() - 3600000).toISOString()
        )
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Flash Peregrine Feed alert on zone selection
  useEffect(() => {
    if (selectedZone) {
      setFlashAlertZone(selectedZone)
      setTimeout(() => setFlashAlertZone(null), 800)
    }
  }, [selectedZone])

  const closeModal = () => {
    setMarketPulseClosing(true)
    setTimeout(() => {
      setMarketPulseExpanded(false)
      setMarketPulseClosing(false)
    }, 280)
  }

  const alerts = ZONE_ALERTS[selectedZone ?? 'WEST_HUB'] ?? ZONE_ALERTS['DEFAULT']
  const regime = detectRegime(selectedZone)
  const REGIME_TOKEN_COLORS: Record<Regime, string> = {
    SCARCITY:   C.alertCritical,
    SURPLUS:    C.electricBlue,
    TRANSITION: C.falconGold,
    NORMAL:     C.alertNormal,
  }
  const regimeColor = REGIME_TOKEN_COLORS[regime]

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '52fr 24fr 24fr',
      gridTemplateRows: '1fr 96px',
      gridTemplateAreas: '"pulse feed kpi" "genmix genmix kpi"',
      gap: '8px',
      padding: '8px',
      height: '100%',
      width: '100%',
      backgroundColor: C.bgBase,
      boxSizing: 'border-box' as const,
      overflow: 'hidden',
    }}>
      {/* Market Pulse — left column, row 1 */}
      <BentoCard title="MARKET PULSE" status="live" style={{ gridArea: 'pulse', cursor: 'pointer' }} onTitleClick={() => setMarketPulseExpanded(true)}>
        <ErrorBoundary label="MARKET PULSE">
          <div style={{ position: 'absolute', inset: 0 }}>
            <PJMNodeGraph onZoneSelect={(id) => { setSelectedZone(id || null); if (id) setActiveKPI('lmp'); }} expanded={false} ghostTime={ghostTime} />
          </div>
        </ErrorBoundary>
      </BentoCard>

      {/* Modal overlay */}
      {marketPulseExpanded && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeModal}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 49,
              backgroundColor: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(4px)',
            }}
          />
          {/* Modal */}
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
            width: '78vw',
            height: '78vh',
            backgroundColor: '#0A0A0B',
            border: '0.5px solid rgba(6,182,212,0.3)',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 0 60px rgba(6,182,212,0.15), 0 0 120px rgba(6,182,212,0.05)',
            animation: marketPulseClosing
              ? 'modal-collapse 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards'
              : 'modal-expand 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}>
            {/* Header */}
            <div style={{
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 20px',
              borderBottom: '0.5px solid rgba(255,255,255,0.08)',
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '10px',
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.15em',
              }}>
                MARKET PULSE — PJM ZONE EXPLORER
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {ghostTime && (
                  <span style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '9px',
                    color: '#FFB800',
                    background: 'rgba(255,183,0,0.08)',
                    border: '0.5px solid rgba(255,183,0,0.25)',
                    borderRadius: '3px',
                    padding: '2px 10px',
                    letterSpacing: '0.12em',
                  }}>
                    ◎ GHOST MODE · T−1H
                  </span>
                )}
                {selectedZone && (
                  <span style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '11px',
                    color: C.electricBlueLight,
                    letterSpacing: '0.1em',
                  }}>
                    {selectedZone} · ${ZONE_LMP[selectedZone]?.price.toFixed(2)} /MWh
                  </span>
                )}
                <button
                  onClick={closeModal}
                  style={{
                    fontFamily: "'Geist Mono', monospace",
                    fontSize: '9px',
                    color: 'rgba(255,255,255,0.4)',
                    background: 'rgba(255,255,255,0.05)',
                    border: '0.5px solid rgba(255,255,255,0.1)',
                    borderRadius: '4px',
                    padding: '4px 12px',
                    cursor: 'pointer',
                    letterSpacing: '0.1em',
                  }}
                >
                  ✕ CLOSE
                </button>
              </div>
            </div>
            {/* 3D canvas */}
            <div style={{ flex: 1, position: 'relative' }}>
              <PJMNodeGraph
                onZoneSelect={(id) => { setSelectedZone(id || null); if (id) setActiveKPI('lmp'); }}
                expanded={true}
                ghostTime={ghostTime}
              />
              {/* Mini-legend overlay — bottom-left of expanded view */}
              <div style={{
                position: 'absolute',
                bottom: '16px',
                left: '16px',
                background: 'rgba(10,10,11,0.85)',
                border: '0.5px solid rgba(255,255,255,0.08)',
                borderRadius: '6px',
                padding: '10px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                pointerEvents: 'none',
              }}>
                <span style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: '7px',
                  color: 'rgba(255,255,255,0.35)',
                  letterSpacing: '0.15em',
                  marginBottom: '2px',
                }}>
                  VISUAL ENCODING
                </span>
                {/* Color legend */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: C.electricBlue }} />
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '8px', color: 'rgba(255,255,255,0.45)' }}>
                    CHEAP (ZONE 24H LOW)
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFB800' }} />
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '8px', color: 'rgba(255,255,255,0.45)' }}>
                    MID-RANGE
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FF4444' }} />
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '8px', color: 'rgba(255,255,255,0.45)' }}>
                    EXPENSIVE (ZONE 24H HIGH)
                  </span>
                </div>
                {/* Size + depth legend */}
                <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', paddingTop: '5px', marginTop: '2px' }}>
                  <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: '7.5px', color: 'rgba(255,255,255,0.3)' }}>
                    ● SIZE = PEAK LOAD MW &nbsp; ● DEPTH = LMP $/MWh
                  </span>
                </div>
              </div>
            </div>
            {/* Footer hint */}
            <div style={{
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderTop: '0.5px solid rgba(255,255,255,0.05)',
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '8px',
                color: 'rgba(255,255,255,0.2)',
                letterSpacing: '0.15em',
              }}>
                DRAG · SCROLL TO ZOOM · CLICK ZONE TO SELECT · CLICK AGAIN TO DESELECT
              </span>
            </div>
          </div>
        </>
      )}

      {/* Peregrine Feed */}
      <BentoCard title="PEREGRINE FEED" status="live" style={{ gridArea: 'feed' }}>
        <ErrorBoundary label="PEREGRINE FEED">
        <div style={{ position: 'absolute', inset: 0, padding: '12px', overflowY: 'auto' }}>
          {/* Regime Detection Badge */}
          <div style={{
            padding: '8px 12px',
            marginBottom: '8px',
            borderLeft: `2px solid ${regimeColor}`,
            background: `${regimeColor}10`,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '10px',
                fontWeight: 'bold',
                color: regimeColor,
                letterSpacing: '0.15em',
              }}>
                ● {regime}
              </span>
              <span style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: '8px',
                color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.1em',
              }}>
                MARKET REGIME
              </span>
            </div>
            <span style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: '9px',
              color: 'rgba(255,255,255,0.4)',
              letterSpacing: '0.08em',
            }}>
              {REGIME_DESCRIPTIONS[regime]}
            </span>
          </div>
          {alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 pl-2${i === 0 && flashAlertZone === selectedZone ? ' alert-flash' : ''}`}
              style={{ borderLeft: `2px solid ${alert.severity === "critical" ? C.alertCritical : alert.severity === "warning" ? C.falconGold : C.electricBlue}`, marginBottom: '6px' }}
            >
              <span className="text-[9px] tabular-nums" style={{ fontFamily: "'Geist Mono', monospace", fontVariantNumeric: "tabular-nums", color: "rgba(255, 255, 255, 0.3)" }}>{alert.time}</span>
              <span className="text-[10px]" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.6)" }}>{alert.msg}</span>
            </div>
          ))}
          {/* Blinking terminal cursor */}
          <div className="flex items-center gap-2 pl-2 mt-2" style={{ borderLeft: "2px solid transparent" }}>
            <span className="text-[9px]" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.3)" }}>09:50</span>
            <span className="text-[10px] animate-pulse" style={{ fontFamily: "'Geist Mono', monospace", color: C.electricBlueLight }}>█</span>
          </div>
        </div>
        </ErrorBoundary>
      </BentoCard>

      {/* KPI Panel — right column, spans both rows */}
      <div style={{
        gridArea: 'kpi',
        display: 'flex',
        flexDirection: 'column',
        background: C.bgElevated,
        border: `1px solid ${C.borderDefault}`,
        borderTop: `1px solid ${C.borderAccent}`,
        borderRadius: R.lg,
        overflow: 'hidden',
      }}>
        {/* Tab strip — 36px */}
        <div style={{
          display: 'flex',
          height: '36px',
          flexShrink: 0,
          borderBottom: `1px solid ${C.borderDefault}`,
          background: C.bgBase,
        }}>
          {(['lmp', 'spark', 'battery', 'gap'] as const).map((tab) => {
            const labels = { lmp: 'LMP', spark: 'SPREAD', battery: 'BATTERY', gap: 'RES GAP' };
            const isActive = activeKPI === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveKPI(tab)}
                style={{
                  flex: 1,
                  height: '100%',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isActive ? `2px solid ${C.electricBlue}` : '2px solid transparent',
                  color: isActive ? C.electricBlue : C.textMuted,
                  fontFamily: F.mono,
                  fontSize: '10px',
                  fontWeight: '500',
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase' as const,
                  cursor: 'pointer',
                  transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>
        {/* Active KPI content */}
        <div style={{ flex: 1, overflow: 'hidden', minHeight: 0, position: 'relative' }}>
          {activeKPI === 'lmp' && (
            <ErrorBoundary label="LMP HUB">
              <LMPCard selectedZone={selectedZone} />
            </ErrorBoundary>
          )}
          {activeKPI === 'spark' && (
            <ErrorBoundary label="SPARK SPREAD">
              <SparkKPIView selectedZone={selectedZone} />
            </ErrorBoundary>
          )}
          {activeKPI === 'battery' && (
            <ErrorBoundary label="BATTERY ARB">
              <BatteryKPIView selectedZone={selectedZone} />
            </ErrorBoundary>
          )}
          {activeKPI === 'gap' && (
            <ErrorBoundary label="RESOURCE GAP">
              <GapKPIView selectedZone={selectedZone} />
            </ErrorBoundary>
          )}
        </div>
      </div>

      {/* Generation Mix — bottom strip, spans cols 1-2 */}
      <BentoCard title="GENERATION MIX" status="live" style={{ gridArea: 'genmix' }}>
        <ErrorBoundary label="GENERATION MIX">
        <div style={{ height: '100%', padding: '6px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
          {/* GW labels above bar */}
          <div style={{ display: 'flex', width: '100%' }}>
            {[
              { w: "32%", mw: "28.4", c: C.fuelNuclear },
              { w: "28%", mw: "24.8", c: C.fuelGas },
              { w: "14%", mw: "12.4", c: C.fuelWind },
              { w: "10%", mw: "8.9", c: C.fuelSolar },
              { w: "9%", mw: "8.0", c: C.fuelCoal },
              { w: "7%", mw: "6.2", c: C.fuelHydro },
            ].map((s, i) => (
              <div key={i} style={{ width: s.w, display: 'flex', justifyContent: 'center' }}>
                <span style={{ fontFamily: F.mono, fontSize: '8px', fontVariantNumeric: 'tabular-nums', color: s.c }}>{s.mw}</span>
              </div>
            ))}
          </div>
          {/* Stacked bar — explicit height, inline styles only */}
          <div style={{ height: '20px', width: '100%', display: 'flex', borderRadius: R.sm, overflow: 'hidden', flexShrink: 0 }}>
            {[
              { w: "32%", c: C.fuelNuclear },
              { w: "28%", c: C.fuelGas },
              { w: "14%", c: C.fuelWind },
              { w: "10%", c: C.fuelSolar },
              { w: "9%", c: C.fuelCoal },
              { w: "7%", c: C.fuelHydro },
            ].map((s, i) => (
              <div key={i} style={{ width: s.w, height: '100%', backgroundColor: s.c, flexShrink: 0 }} />
            ))}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { c: C.fuelNuclear, l: "Nuclear", v: "32%" },
              { c: C.fuelGas, l: "Gas", v: "28%" },
              { c: C.fuelWind, l: "Wind", v: "14%" },
              { c: C.fuelSolar, l: "Solar", v: "10%" },
              { c: C.fuelCoal, l: "Coal", v: "9%" },
              { c: C.fuelHydro, l: "Hydro", v: "7%" },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: R.sm, backgroundColor: s.c, flexShrink: 0 }} />
                <span style={{ fontFamily: F.mono, fontSize: '8px', color: C.textSecondary }}>{s.l} {s.v}</span>
              </div>
            ))}
          </div>
        </div>
        </ErrorBoundary>
      </BentoCard>
    </div>
  );
}

// NOTE: ContextualDrawer, LayerControlPill, TimeSpine, StatusBadge (standalone),
// ContextualInfoPanel, VolumetricFlowLayer, SwoopOverlay, CommandPalette, and
// the inline GridAtlasView were removed — replaced by src/components/atlas/GridAtlasView.tsx

// Animated Line Chart Thumbnail (Intelligence Suite)
function GhostlyLineChart() {
  return (
    <svg viewBox="0 0 80 40" className="w-full h-10 mb-3">
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={C.electricBlue} stopOpacity="0.1" />
          <stop offset="100%" stopColor={C.electricBlue} stopOpacity="0.6" />
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
              background: `linear-gradient(to top, rgba(6,182,212,0.2), rgba(6,182,212,0.5))`,
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
        boxShadow: hovered ? "0 0 30px rgba(6, 182, 212, 0.1)" : "none",
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
                color: "rgba(6, 182, 212, 0.08)",
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
            <Suspense fallback={<CardSkeleton />}>
              <SparkSpreadSurface3D />
            </Suspense>
          </div>
        )}
        
        {/* Sub-modules list */}
        <div className="space-y-2 mb-4">
          {subModules.map((mod, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: "rgba(6, 182, 212, 0.5)" }} />
              <span className="text-[9px] tracking-wide" style={{ fontFamily: "'Geist Mono', monospace", color: "rgba(255, 255, 255, 0.4)" }}>{mod}</span>
            </div>
          ))}
        </div>
        {/* Coming Soon Badge */}
        <div className="mt-auto flex justify-center">
          <div className="px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(34, 211, 238, 0.1)", border: "1px solid rgba(34, 211, 238, 0.3)" }}>
            <span className="text-[9px] font-medium tracking-widest" style={{ fontFamily: "'Geist Mono', monospace", color: C.electricBlueLight }}>COMING SOON</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ANALYTICS View
function AnalyticsView() {
  return (
    <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: C.bgBase }}>
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
    <div className="flex-1 flex p-6 gap-4" style={{ backgroundColor: C.bgBase }}>
      <div className="w-56 shrink-0 rounded-lg overflow-hidden" style={{ backgroundColor: "rgba(10, 10, 11, 0.7)", backdropFilter: "blur(12px)", border: "0.5px solid rgba(255, 255, 255, 0.08)" }}>
        <div className="px-4 py-3" style={{ borderBottom: "0.5px solid rgba(255, 255, 255, 0.06)" }}>
          <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ fontFamily: "'Geist', sans-serif", color: "#EDEDED" }}>INDEX</span>
        </div>
        <nav className="py-2">
          {sections.map((s) => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} className="w-full text-left px-4 py-2 transition-colors" style={{ backgroundColor: activeSection === s.id ? "rgba(6, 182, 212, 0.08)" : "transparent" }}>
              <span className="text-[11px] tracking-wide" style={{ fontFamily: "'Geist', sans-serif", color: activeSection === s.id ? C.electricBlue : "rgba(255, 255, 255, 0.4)" }}>{s.label}</span>
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

function TopBar({ activeNav, onNavChange }: { activeNav: string; onNavChange: (id: string) => void }) {
  const [lmpValue] = useState(31.85);
  const [isLive] = useState(true);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: 64,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      backgroundColor: 'rgba(12,13,16,0.88)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${C.borderDefault}`,
      padding: '0 20px',
      gap: '24px',
    }}>
      <FalconLogo collapsed={false} />
      <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavChange(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              backgroundColor: activeNav === item.id ? C.electricBlueWash : 'transparent',
              border: `1px solid ${activeNav === item.id ? C.borderActive : 'transparent'}`,
              borderRadius: R.md,
              cursor: 'pointer',
            }}
          >
            <span style={{ color: activeNav === item.id ? C.electricBlue : C.textSecondary }}>
              {item.icon}
            </span>
            <span style={{
              fontFamily: F.mono,
              fontSize: T.labelSize,
              color: activeNav === item.id ? C.electricBlue : C.textSecondary,
              letterSpacing: T.labelSpacing,
            }}>
              {item.label}
            </span>
          </button>
        ))}
      </nav>
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: F.mono, fontSize: '11px' }}>
        <span style={{ color: C.textSecondary }}>LMP</span>
        <span style={{ color: C.electricBlue }}>${lmpValue.toFixed(2)}</span>
        <StatusDot status={isLive ? 'live' : 'stale'} />
        <span style={{ color: isLive ? C.alertNormal : C.alertWarning }}>{isLive ? 'LIVE' : 'STALE'}</span>
      </div>
    </div>
  );
}

export default function GlobalShell() {
  const [activeNav, setActiveNav] = useState("nest");
  const [entryDismissed, setEntryDismissed] = useState(false);

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
    <>
      {!entryDismissed && <EntryOverlay onDismiss={() => setEntryDismissed(true)} />}
      <TopBar activeNav={activeNav} onNavChange={setActiveNav} />
      <div style={{
        position: 'fixed',
        top: 64,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: C.bgBase,
      }}>
        {renderContent()}
      </div>
    </>
  );
}

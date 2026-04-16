import { useState, useEffect, lazy, Suspense } from "react";
import { C, F, R, S, T } from '@/design/tokens';
import {
  AreaChart, Area, ComposedChart, Line, Bar, BarChart, Cell,
  XAxis, YAxis, Tooltip, ReferenceLine,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';
import FalconLogo from "./FalconLogo";
import { PJMNodeGraph } from "./PJMNodeGraph";
import { LMPCard, LMPFullPage } from "./LMPCard";
import { ErrorBoundary } from "./shared/ErrorBoundary";
import { CardSkeleton } from "./shared/CardSkeleton";
import GridAtlasView from "./atlas/GridAtlasView";
import PeregrineFullPage from "./peregrine/PeregrineFullPage";
import { useHenryHub } from '../hooks/data/useEnergyPrices';
import { useFuelMix } from '../hooks/data/useAtlasData';
import { useLiveOpsData } from '../hooks/data/useLiveOpsData';

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
        fontFamily: F.mono,
        fontSize: '36px',
        fontWeight: 700,
        color: '#FFFFFF',
        letterSpacing: '0.15em',
      }}>
        GRIDALPHA
      </span>
      <span style={{
        fontFamily: F.mono,
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
          fontFamily: F.mono,
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
        fontFamily: F.mono,
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
            fontFamily={F.mono}
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
          fontSize: '10px',
          fontWeight: '600',
          letterSpacing: '0.16em',
          textTransform: 'uppercase' as const,
          color: C.textMuted,
        }}>{title}</span>
        {onTitleClick && (
          <span style={{
            fontFamily: F.mono,
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
      <span className="text-[10px] tracking-wider mb-1" style={{ fontFamily: F.mono, color: "rgba(255, 255, 255, 0.4)" }}>WEST HUB LMP</span>
      <span
        className="text-5xl font-medium"
        style={{ fontFamily: F.mono, fontVariantNumeric: "tabular-nums", color: C.electricBlueLight, textShadow: "0 0 20px rgba(34, 211, 238, 0.6), 0 0 40px rgba(34, 211, 238, 0.3)" }}
      >
        31.85
      </span>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px] tracking-wider" style={{ fontFamily: F.mono, color: C.electricBlue }}>$/MWh</span>
        <span className="text-[10px] font-medium" style={{ fontFamily: F.mono, color: "#FFB800" }}>▲ +2.4%</span>
      </div>
      <PriceSparkline24h />
    </div>
  );
}

// Mini Sparkline
// ── Peregrine Feed data model ────────────────────────────────────
type AlertCategory = 'CONGESTION' | 'PRICE' | 'DISPATCH' | 'WEATHER' | 'SYSTEM' | 'GENERATION';
type AlertPriority = 'CRITICAL' | 'HIGH' | 'NORMAL' | 'INFO';

interface FeedAlert {
  id: string; time: string; category: AlertCategory; priority: AlertPriority;
  headline: string; detail?: string; zone?: string; value?: string;
}

const CATEGORY_COLORS: Record<AlertCategory, string> = {
  CONGESTION: C.alertHigh, PRICE: C.electricBlue, DISPATCH: C.falconGold,
  WEATHER: '#38BDF8', SYSTEM: C.alertNormal, GENERATION: C.alertDiagnostic,
};

const PRIORITY_CONFIG: Record<AlertPriority, { dot: string; rowOpacity: number }> = {
  CRITICAL: { dot: C.alertCritical, rowOpacity: 1.0 },
  HIGH:     { dot: C.alertHigh,     rowOpacity: 0.95 },
  NORMAL:   { dot: C.electricBlue,  rowOpacity: 0.80 },
  INFO:     { dot: C.textMuted,     rowOpacity: 0.55 },
};

const FEED_ALERTS: FeedAlert[] = [
  { id: '1', time: '09:42', category: 'CONGESTION', priority: 'HIGH',
    headline: 'Artificial Island interface binding — PSEG import constrained',
    detail: 'PJM-EAST import limit reached 97% of rated capacity. PSEG congestion component elevated to +$1.58/MWh. Expected to persist through peak hours.',
    zone: 'PSEG', value: '+$1.58/MWh' },
  { id: '2', time: '09:32', category: 'PRICE', priority: 'NORMAL',
    headline: 'DA/RT spread exceeded 8% threshold — West Hub',
    detail: 'Day-ahead price $38.20 vs real-time $35.90 creates -$2.30/MWh convergence spread. Virtual selling opportunity identified.',
    zone: 'WEST_HUB', value: '-$2.30 spread' },
  { id: '3', time: '09:15', category: 'DISPATCH', priority: 'INFO',
    headline: 'PJM dispatch signal: NORMAL — no emergency conditions',
    detail: 'System operating normally. Reserve margin at 18.4%, above 15% minimum threshold.',
    value: '18.4% margin' },
  { id: '4', time: '08:58', category: 'GENERATION', priority: 'HIGH',
    headline: 'Wind ramp detected — COMED 850 MW curtailment order',
    detail: 'Sudden wind generation increase causing local oversupply. COMED LMP negative for 12-minute interval. Wind operators issued curtailment signal.',
    zone: 'COMED', value: '-850 MW curtail' },
  { id: '5', time: '08:44', category: 'WEATHER', priority: 'NORMAL',
    headline: 'NOAA forecast update — demand revision +2.1 GW vs yesterday',
    detail: 'Temperature forecast revised upward for PJM footprint. Peak load forecast increased from 126.3 GW to 128.4 GW. Affects afternoon spark spread outlook.',
    value: '+2.1 GW demand' },
  { id: '6', time: '08:21', category: 'PRICE', priority: 'CRITICAL',
    headline: 'RECO LMP spike: $62.40/MWh — 73% above system average',
    detail: 'Import constraints from PSEG combined with local load growth driving extreme congestion. RECO historically spikes during morning ramp. Alert threshold: $50/MWh.',
    zone: 'RECO', value: '$62.40/MWh' },
  { id: '7', time: '08:05', category: 'SYSTEM', priority: 'INFO',
    headline: 'Market opening — PJM real-time LMP feed active',
    detail: 'All 20 zones reporting. Data latency: 4 seconds. Next scheduled maintenance: Apr 15 02:00–04:00 ET.' },
];

interface NewsItem {
  id: string; timeAgo: string; headline: string; summary?: string;
  source: string; tags: string[];
}

const ENERGY_NEWS: NewsItem[] = [
  { id: 'n1', timeAgo: '1 hr ago', headline: 'PJM Targets 15 Gigawatts of New Power for Data Center Boom',
    summary: 'Grid operator accelerates interconnection queue to meet surging AI infrastructure demand across the Mid-Atlantic and Midwest.',
    source: 'Bloomberg', tags: ['PJM', 'capacity', 'data centers'] },
  { id: 'n2', timeAgo: '2 hr ago', headline: 'Natural Gas Futures Fall as Storage Builds Ahead of Summer',
    summary: 'Henry Hub spot prices retreat to $3.38/MMBtu as mild temperatures reduce heating demand.',
    source: 'Reuters', tags: ['natural gas', 'Henry Hub', 'spark spread'] },
  { id: 'n3', timeAgo: '3 hr ago', headline: 'FERC Approves Transmission Upgrade Along PJM Eastern Interface',
    summary: 'New 500kV line will add 2,400 MW of import capacity to constrained PSEG and JCPL zones.',
    source: 'S&P Global', tags: ['FERC', 'transmission', 'PSEG'] },
  { id: 'n4', timeAgo: '4 hr ago', headline: 'Coal Plant Retirements Accelerate in PJM as Carbon Costs Rise',
    summary: 'Three AEP facilities totaling 1.8 GW scheduled for retirement by Q3 2026, tightening summer reserve margins.',
    source: 'Bloomberg', tags: ['coal', 'AEP', 'retirements'] },
  { id: 'n5', timeAgo: '5 hr ago', headline: 'Wind Generation Breaks PJM Record at 32,400 MW Overnight',
    summary: 'Overnight wind surge pushed real-time prices negative in COMED and DAY zones for six consecutive intervals.',
    source: 'PJM', tags: ['wind', 'COMED', 'negative prices'] },
  { id: 'n6', timeAgo: '6 hr ago', headline: 'Inflation Reduction Act Tax Credits Reshape Merchant Generation Economics',
    summary: 'Production tax credits shifting dispatch economics for wind and solar, compressing spark spreads in low-demand hours.',
    source: 'Reuters', tags: ['IRA', 'solar', 'spark spread'] },
  { id: 'n7', timeAgo: '7 hr ago', headline: 'Battery Storage Developers Rush to Secure PJM Capacity Agreements',
    summary: 'Over 8 GW of 4-hour BESS projects in advanced development targeting 2026-2027 commercial operation.',
    source: 'S&P Global', tags: ['battery', 'BESS', 'capacity market'] },
];

function avg(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((s, x) => s + x, 0) / values.length;
}

function maxWindowAverage(values: number[], width: number): { value: number; start: number } {
  if (!values.length || width <= 0) return { value: 0, start: 0 };
  if (values.length <= width) return { value: avg(values), start: 0 };
  let best = -Infinity;
  let start = 0;
  for (let i = 0; i <= values.length - width; i += 1) {
    const v = avg(values.slice(i, i + width));
    if (v > best) {
      best = v;
      start = i;
    }
  }
  return { value: best, start };
}

function minWindowAverage(values: number[], width: number): { value: number; start: number } {
  if (!values.length || width <= 0) return { value: 0, start: 0 };
  if (values.length <= width) return { value: avg(values), start: 0 };
  let best = Infinity;
  let start = 0;
  for (let i = 0; i <= values.length - width; i += 1) {
    const v = avg(values.slice(i, i + width));
    if (v < best) {
      best = v;
      start = i;
    }
  }
  return { value: best, start };
}

function hourWindowLabel(startHour: number, width: number): string {
  const end = (startHour + width) % 24;
  return `${String(startHour).padStart(2, '0')}:00-${String(end).padStart(2, '0')}:00`;
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
        <div style={{ fontFamily: F.sans, fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{lbl}</div>
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
          <XAxis dataKey="label" tick={{ fontFamily: F.mono, fontSize: 11, fill: 'rgba(229,231,235,0.55)' }} axisLine={{ stroke: 'rgba(229,231,235,0.12)' }} tickLine={false} interval={5} />
          <YAxis tick={{ fontFamily: F.mono, fontSize: 11, fill: 'rgba(229,231,235,0.55)' }} axisLine={false} tickLine={false} tickFormatter={(v) => v > 0 ? `+${v}` : String(v)} width={36} />
          <ReferenceLine y={0} stroke={C.textMuted} strokeDasharray="4 4" strokeOpacity={0.6} label={{ value: 'BREAKEVEN', position: 'insideTopLeft', style: { fontFamily: F.mono, fontSize: 9, fill: C.textMuted } }} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: C.electricBlue, strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Area type="monotone" dataKey="positive" stroke={C.falconGold} strokeWidth={2.5} fill="url(#posGrad)" dot={false} activeDot={{ r: 5, fill: C.falconGold, stroke: C.bgElevated, strokeWidth: 2 }} isAnimationActive={false} />
          <Area type="monotone" dataKey="negative" stroke={C.alertCritical} strokeWidth={2.5} fill="url(#negGrad)" dot={false} activeDot={{ r: 5, fill: C.alertCritical, stroke: C.bgElevated, strokeWidth: 2 }} isAnimationActive={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── SparkKPIView ──────────────────────────────────────────────────
function SparkKPIView({ selectedZone, onNavigate }: { selectedZone: string | null; onNavigate?: () => void }) {
  const { data: henryHub } = useHenryHub();
  const liveOps = useLiveOpsData(selectedZone);
  const gasPrice = henryHub.current_price_mmbtu;
  const gasPriceLive = henryHub.live;
  const heatRate = 7.2;
  const fallbackHistory = [
    -2.4, -1.8, -0.6, 2.1, 4.8, 8.2, 14.1, 18.2, 16.8, 15.2, 13.4, 12.8,
    11.9, 10.4, 9.8, 11.2, 13.6, 14.9, 12.4, 10.8, 9.2, 7.6, 5.4, 3.8,
  ];
  const historyBase = liveOps.zoneHistory.length ? liveOps.zoneHistory : fallbackHistory.map((x) => x + 26.5);
  const spreadHistory = historyBase.map((p) => p - gasPrice * heatRate);
  const spreadValue = (liveOps.lmpPrice || historyBase[historyBase.length - 1] || 0) - gasPrice * heatRate;
  const avg24hSpread = avg(spreadHistory);
  const peakSpread = spreadHistory.reduce((m, v) => (v > m ? v : m), -Infinity);
  const peakIdx = spreadHistory.findIndex((v) => v === peakSpread);
  const hoursBurning = spreadHistory.filter((v) => v > 0).length;
  const regime: 'BURNING' | 'SUPPRESSED' | 'NEUTRAL' =
    spreadValue > 8 ? 'BURNING' : spreadValue < 0 ? 'SUPPRESSED' : 'NEUTRAL';

  const SPARK_DATA = {
    zone: selectedZone ?? liveOps.apiZone ?? 'SYSTEM',
    regime,
    spreadValue,
    gasPrice,
    heatRate,
    powerPrice: liveOps.lmpPrice || historyBase[historyBase.length - 1] || 0,
    gasEquivPrice: gasPrice * heatRate,
    netSpread: spreadValue,
    avg24h: avg24hSpread,
    peak: { value: peakSpread, hour: `${peakIdx >= 0 ? peakIdx : 0}:00` },
    hoursBurning,
    history: spreadHistory,
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
    <div
      onClick={onNavigate}
      style={{
        display: 'flex', flexDirection: 'column', position: 'absolute', inset: 0,
        padding: `${S.lg} ${S.lg} ${S.md} ${S.lg}`, gap: S.md,
        overflow: 'hidden', cursor: onNavigate ? 'pointer' : 'default',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontFamily: F.mono, fontSize: '10px', fontWeight: '600', letterSpacing: '0.16em', textTransform: 'uppercase' as const, color: C.textMuted }}>
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
          <div style={{ display: 'flex', gap: S.xl, marginTop: S.xs, alignItems: 'center' }}>
            {[{ label: 'GAS', value: `$${SPARK_DATA.gasPrice}/MMBtu` }, { label: 'HR', value: `${SPARK_DATA.heatRate}×` }].map(item => (
              <div key={item.label} style={{ display: 'flex', gap: S.xs, alignItems: 'baseline' }}>
                <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.08em' }}>{item.label}</span>
                <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textSecondary }}>{item.value}</span>
              </div>
            ))}
            <span style={{
              fontFamily: F.mono,
              fontSize: '0.5rem',
              color: gasPriceLive ? '#10B981' : '#FFB800',
              letterSpacing: '0.1em',
            }}>
              {gasPriceLive ? '● LIVE' : '◐ EIA'}
            </span>
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

        {/* Navigate hint */}
        {onNavigate && (
          <div style={{ fontFamily: F.mono, fontSize: '9px', color: C.textMuted, letterSpacing: '0.10em', textAlign: 'center' as const, paddingTop: S.sm, opacity: 0.6 }}>
            › OPEN FULL VIEW
          </div>
        )}
    </div>
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

// ── BatteryKPIView ────────────────────────────────────────────────
function BatteryKPIView({ selectedZone, onNavigate }: { selectedZone: string | null; onNavigate?: () => void }) {
  const liveOps = useLiveOpsData(selectedZone);
  const history = liveOps.zoneHistory.length ? liveOps.zoneHistory : [
    26, 24, 22, 21, 20, 21, 28, 35, 42, 44, 43, 40,
    38, 36, 35, 34, 38, 44, 50, 52, 48, 43, 38, 32,
  ];
  const charge = minWindowAverage(history, 4);
  const discharge = maxWindowAverage(history, 4);
  const chargeLMP = charge.value;
  const dischargeLMP = discharge.value;
  const netSpread = dischargeLMP - chargeLMP;
  const targetSoc = Math.max(15, Math.min(95, Math.round(((history[history.length - 1] - Math.min(...history)) / (Math.max(...history) - Math.min(...history) || 1)) * 100)));
  const [animSoc, setAnimSoc] = useState(0);

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

  const isCharging = history[history.length - 1] <= chargeLMP + 0.5;
  const stateBadgeColor = isCharging ? C.alertNormal : C.falconGold;

  const StateBadge = () => (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: R.sm, backgroundColor: `${stateBadgeColor}18`, border: `1px solid ${stateBadgeColor}50` }}>
      <span style={{ fontFamily: F.mono, fontSize: T.labelSize, color: stateBadgeColor, letterSpacing: T.labelSpacing }}>{isCharging ? 'CHARGING' : 'DISCHARGING'}</span>
    </div>
  );

  return (
    <div
      onClick={onNavigate}
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: S.lg, gap: S.sm, overflow: 'hidden', cursor: onNavigate ? 'pointer' : 'default' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontFamily: F.mono, fontSize: '10px', fontWeight: '600', color: C.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase' as const }}>{selectedZone ?? 'WEST HUB'} ARB</span>
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
            <span style={{ fontFamily: F.mono, fontSize: T.dataSmSize, color: C.alertNormal, fontWeight: T.dataSmWeight }}>${chargeLMP.toFixed(2)}</span>
            <span style={{ fontFamily: F.mono, fontSize: '8px', color: C.textMuted }}>{hourWindowLabel(charge.start, 4)}</span>
          </div>
          <div style={{ flex: 1, padding: '6px 8px', borderRadius: R.sm, backgroundColor: `${C.falconGold}0A`, border: `1px solid ${C.falconGold}30`, display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
            <span style={{ fontFamily: F.mono, fontSize: '8px', color: C.textMuted, letterSpacing: T.labelSpacing, textTransform: 'uppercase' as const }}>CYCLE SPREAD</span>
            <span style={{ fontFamily: F.mono, fontSize: '18px', color: C.falconGold, fontWeight: 600 }}>{netSpread >= 0 ? '+' : ''}{netSpread.toFixed(2)}</span>
            <span style={{ fontFamily: F.mono, fontSize: '8px', color: C.textMuted }}>$/MWh</span>
          </div>
          <div style={{ flex: 1, padding: '6px 8px', borderRadius: R.sm, backgroundColor: C.bgOverlay, border: `1px solid ${C.borderDefault}`, display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <span style={{ fontFamily: F.mono, fontSize: '8px', color: C.textMuted, letterSpacing: T.labelSpacing, textTransform: 'uppercase' as const }}>DISCHARGE</span>
            <span style={{ fontFamily: F.mono, fontSize: T.dataSmSize, color: C.falconGold, fontWeight: T.dataSmWeight }}>${dischargeLMP.toFixed(2)}</span>
            <span style={{ fontFamily: F.mono, fontSize: '8px', color: C.textMuted }}>{hourWindowLabel(discharge.start, 4)}</span>
          </div>
        </div>
        {/* Revenue */}
        <div style={{ flexShrink: 0, padding: '8px 12px', borderRadius: R.sm, backgroundColor: C.bgOverlay, border: `1px solid ${C.borderDefault}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: F.mono, fontSize: T.labelSize, color: C.textMuted, letterSpacing: T.labelSpacing, textTransform: 'uppercase' as const }}>EST. DAILY REVENUE</span>
          <span style={{ fontFamily: F.mono, fontSize: T.dataMdSize, color: C.falconGold, fontWeight: 600 }}>${Math.round(Math.max(0, netSpread) * 400).toLocaleString()}</span>
        </div>
        {/* Navigate hint */}
        {onNavigate && (
          <div style={{ fontFamily: F.mono, fontSize: '9px', color: C.textMuted, letterSpacing: '0.10em', textAlign: 'center' as const, paddingTop: S.sm, opacity: 0.6 }}>
            › OPEN FULL VIEW
          </div>
        )}
    </div>
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
        <div style={{ fontFamily: F.sans, fontSize: 11, color: C.textMuted, marginBottom: 6 }}>{payload[0]?.payload?.label}</div>
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
          <XAxis dataKey="label" tick={{ fontFamily: F.mono, fontSize: 11, fill: 'rgba(229,231,235,0.55)' }} axisLine={{ stroke: 'rgba(229,231,235,0.12)' }} tickLine={false} interval={5} />
          <YAxis tick={{ fontFamily: F.mono, fontSize: 11, fill: 'rgba(229,231,235,0.55)' }} axisLine={false} tickLine={false} width={40} domain={['auto', 'auto']} />
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
function GapKPIView({ selectedZone, onNavigate }: { selectedZone: string | null; onNavigate?: () => void }) {
  const liveOps = useLiveOpsData(selectedZone);
  const { data: fuelMixData } = useFuelMix();
  const generationMw = (fuelMixData.fuels ?? []).reduce((s, x) => s + x.mw, 0);
  const loadForecastMw = liveOps.loadForecastMw || generationMw * 0.9;
  const capacityMw = generationMw > 0 ? generationMw : loadForecastMw * 1.15;
  const reserveMargin = loadForecastMw > 0 ? ((capacityMw - loadForecastMw) / loadForecastMw) * 100 : 0;
  const systemLoadGw = loadForecastMw / 1000;
  const capacityGw = capacityMw / 1000;
  const peakForecastGw = Math.max(systemLoadGw, (liveOps.actualLoadMw || loadForecastMw) / 1000);
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
    { label: 'SYSTEM LOAD', value: `${systemLoadGw.toFixed(1)} GW`, color: C.textSecondary },
    { label: 'CAPACITY',    value: `${capacityGw.toFixed(1)} GW`, color: C.electricBlue },
    { label: 'PEAK FCST',   value: `${peakForecastGw.toFixed(1)} GW`, color: C.falconGold },
  ];

  return (
    <div
      onClick={onNavigate}
      style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', padding: S.lg, gap: S.sm, overflow: 'hidden', cursor: onNavigate ? 'pointer' : 'default' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontFamily: F.mono, fontSize: '10px', fontWeight: '600', color: C.textMuted, letterSpacing: '0.16em', textTransform: 'uppercase' as const }}>
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
        {/* Navigate hint */}
        {onNavigate && (
          <div style={{ fontFamily: F.mono, fontSize: '9px', color: C.textMuted, letterSpacing: '0.10em', textAlign: 'center' as const, paddingTop: S.sm, opacity: 0.6 }}>
            › OPEN FULL VIEW
          </div>
        )}
    </div>
  );
}

// ── Full-page KPI views ───────────────────────────────────────────

function SpreadFullPage({ selectedZone }: { selectedZone: string | null }) {
  const { data: henryHub } = useHenryHub();
  const liveOps = useLiveOpsData(selectedZone);
  const gasPrice = henryHub.current_price_mmbtu;
  const gasPriceLive = henryHub.live;
  const heatRate = 7.2;
  const historyBase = liveOps.zoneHistory.length ? liveOps.zoneHistory : [
    26, 24, 22, 21, 20, 21, 28, 35, 42, 44, 43, 40,
    38, 36, 35, 34, 38, 44, 50, 52, 48, 43, 38, 32,
  ];
  const spreadHistory = historyBase.map((p) => p - gasPrice * heatRate);
  const spreadValue = (liveOps.lmpPrice || historyBase[historyBase.length - 1] || 0) - gasPrice * heatRate;
  const avg24hSpread = avg(spreadHistory);
  const peakSpread = spreadHistory.reduce((m, v) => (v > m ? v : m), -Infinity);
  const peakIdx = spreadHistory.findIndex((v) => v === peakSpread);
  const hoursBurning = spreadHistory.filter((v) => v > 0).length;
  const regime: 'BURNING' | 'SUPPRESSED' | 'NEUTRAL' =
    spreadValue > 8 ? 'BURNING' : spreadValue < 0 ? 'SUPPRESSED' : 'NEUTRAL';
  const SPARK_DATA = {
    zone: selectedZone ?? liveOps.apiZone ?? 'SYSTEM',
    regime,
    spreadValue,
    gasPrice,
    heatRate,
    powerPrice: liveOps.lmpPrice || historyBase[historyBase.length - 1] || 0,
    gasEquivPrice: gasPrice * heatRate,
    netSpread: spreadValue,
    avg24h: avg24hSpread,
    peak: { value: peakSpread, hour: `${peakIdx >= 0 ? peakIdx : 0}:00` },
    hoursBurning,
    history: spreadHistory,
  };
  const regimeColor = SPARK_DATA.regime === 'BURNING' ? C.falconGold : SPARK_DATA.regime === 'SUPPRESSED' ? C.alertCritical : C.textSecondary;
  const regimeBg = SPARK_DATA.regime === 'BURNING' ? C.falconGoldWash : SPARK_DATA.regime === 'SUPPRESSED' ? 'rgba(239,68,68,0.10)' : 'rgba(255,255,255,0.06)';
  const regimeBorder = SPARK_DATA.regime === 'BURNING' ? 'rgba(245,158,11,0.30)' : SPARK_DATA.regime === 'SUPPRESSED' ? 'rgba(239,68,68,0.30)' : 'rgba(255,255,255,0.20)';

  return (
    <div style={{ height: 'calc(100vh - 64px)', width: '100%', background: C.bgBase, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Sub-header */}
      <div style={{ height: '44px', display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: `0.5px solid ${C.borderDefault}`, flexShrink: 0, gap: '16px' }}>
        <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.15em' }}>SPARK SPREAD INTELLIGENCE</span>
        <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.electricBlue, letterSpacing: '0.10em' }}>/ {SPARK_DATA.zone}</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 8px', background: regimeBg, border: `1px solid ${regimeBorder}`, borderRadius: R.sm, color: regimeColor, fontFamily: F.mono, fontSize: '10px', fontWeight: '500', letterSpacing: '0.10em' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: regimeColor }} />
          {SPARK_DATA.regime}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px', gap: '24px', overflow: 'hidden' }}>
        {/* Top: dominant + metrics */}
        <div style={{ display: 'flex', gap: '48px', flexShrink: 0, alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontFamily: F.mono, fontSize: '64px', fontWeight: '700', color: regimeColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
              {SPARK_DATA.spreadValue >= 0 ? '+' : ''}{SPARK_DATA.spreadValue.toFixed(1)}
            </div>
            <div style={{ fontFamily: F.mono, fontSize: '13px', color: C.textMuted, marginTop: '8px' }}>$/MWh NET SPREAD · {SPARK_DATA.zone}</div>
          </div>
          <div style={{ display: 'flex', gap: '1px', flex: 1 }}>
            {[
              { label: 'CURRENT SPREAD', value: `${SPARK_DATA.spreadValue >= 0 ? '+' : ''}${SPARK_DATA.spreadValue.toFixed(1)}`, color: regimeColor },
              { label: '24H AVG',         value: `+${SPARK_DATA.avg24h.toFixed(1)}`,      color: C.textPrimary },
              { label: 'GAS PRICE',       value: `$${SPARK_DATA.gasPrice}`,               color: C.textPrimary, isGas: true },
              { label: 'HEAT RATE',       value: `${SPARK_DATA.heatRate}×`,               color: C.textPrimary },
            ].map(tile => (
              <div key={tile.label} style={{ flex: 1, background: C.bgOverlay, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.10em', textTransform: 'uppercase' as const }}>{tile.label}</span>
                  {'isGas' in tile && tile.isGas && (
                    <span style={{ fontFamily: F.mono, fontSize: '0.5rem', color: gasPriceLive ? '#10B981' : '#FFB800', letterSpacing: '0.1em' }}>
                      {gasPriceLive ? '● LIVE' : '◐ EIA'}
                    </span>
                  )}
                </div>
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
            { label: 'GAS PRICE INPUTS', color: C.falconGold, rows: [{ k: 'Henry Hub', v: `$${SPARK_DATA.gasPrice}/MMBtu` }, { k: 'Heat rate', v: `${SPARK_DATA.heatRate}×` }, { k: 'Gas equiv price', v: `$${SPARK_DATA.gasEquivPrice.toFixed(2)}/MWh` }] },
            { label: 'PLANT ECONOMICS', color: C.electricBlue, rows: [{ k: 'Power price', v: `$${SPARK_DATA.powerPrice.toFixed(2)}/MWh` }, { k: 'Net spread', v: `+$${SPARK_DATA.netSpread.toFixed(2)}/MWh` }, { k: 'Hrs burning', v: `${SPARK_DATA.hoursBurning}/24` }] },
            { label: 'DISPATCH SIGNAL', color: C.textPrimary, rows: [{ k: 'Status', v: SPARK_DATA.regime }, { k: '24H avg', v: `+$${SPARK_DATA.avg24h.toFixed(1)}/MWh` }, { k: 'Peak spread', v: `+$${SPARK_DATA.peak.value.toFixed(1)} at ${SPARK_DATA.peak.hour}` }] },
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
  );
}

// ── ChargeScheduleChart ──────────────────────────────────────────
function ChargeScheduleChart({ chargeLMP, dischargeLMP }: { chargeLMP: number; dischargeLMP: number }) {
  const priceData = [
    26,24,22,21,20,21,28,35,42,44,43,40,
    38,36,35,34,38,44,50,52,48,43,38,32,
  ].map((price, i) => ({
    hour: i,
    label: i === 0 ? '12A' : i === 6 ? '6A' : i === 12 ? '12P' : i === 18 ? '6P' : i === 23 ? '11P' : String(i),
    price,
    action: price <= chargeLMP ? 'charge' : price >= dischargeLMP ? 'discharge' : 'idle',
    chargeBar:    price <= chargeLMP    ? price : 0,
    dischargeBar: price >= dischargeLMP ? price : 0,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    const actionColor = d.action === 'charge' ? C.electricBlue : d.action === 'discharge' ? C.falconGold : C.textMuted;
    return (
      <div style={{ background: C.bgOverlay, border: `1px solid ${C.borderStrong}`, borderRadius: R.md, padding: '8px 12px' }}>
        <div style={{ fontFamily: F.sans, fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{d.label}</div>
        <div style={{ fontFamily: F.mono, fontSize: 14, fontWeight: 600, color: C.textPrimary, marginBottom: 3, fontVariantNumeric: 'tabular-nums' }}>${d.price}/MWh</div>
        <div style={{ fontFamily: F.mono, fontSize: 11, color: actionColor, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{d.action}</div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', height: '100%', background: '#111318', borderRadius: R.md, padding: 4, boxSizing: 'border-box' as const }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={priceData} margin={{ top: 10, right: 16, bottom: 0, left: 8 }}>
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.10)" vertical={false} />
          <ReferenceLine y={chargeLMP} stroke={C.electricBlue} strokeDasharray="3 3" strokeOpacity={0.5}
            label={{ value: 'CHARGE', position: 'insideTopRight', style: { fontFamily: F.mono, fontSize: 9, fill: C.electricBlue } }} />
          <ReferenceLine y={dischargeLMP} stroke={C.falconGold} strokeDasharray="3 3" strokeOpacity={0.5}
            label={{ value: 'DISCHARGE', position: 'insideTopRight', style: { fontFamily: F.mono, fontSize: 9, fill: C.falconGold } }} />
          <XAxis dataKey="label" tick={{ fontFamily: F.mono, fontSize: 11, fill: 'rgba(229,231,235,0.55)' }} axisLine={{ stroke: 'rgba(229,231,235,0.12)' }} tickLine={false} interval={5} />
          <YAxis tick={{ fontFamily: F.mono, fontSize: 11, fill: 'rgba(229,231,235,0.55)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} width={40} />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: C.electricBlue, strokeWidth: 1, strokeDasharray: '3 3' }} />
          <Bar dataKey="chargeBar" fill={C.electricBlue} opacity={0.35} isAnimationActive={false} name="CHARGE" />
          <Bar dataKey="dischargeBar" fill={C.falconGold} opacity={0.35} isAnimationActive={false} name="DISCHARGE" />
          <Line type="monotone" dataKey="price" stroke={C.textSecondary} strokeWidth={2} dot={false}
            activeDot={{ r: 5, fill: C.textSecondary, stroke: C.bgElevated, strokeWidth: 2 }} isAnimationActive={false} name="PRICE" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

function BatteryFullPage({ selectedZone }: { selectedZone: string | null }) {
  const liveOps = useLiveOpsData(selectedZone);
  // User-controlled parameters
  const [batteryMW,   setBatteryMW]   = useState(100);
  const [durationH,   setDurationH]   = useState(4);
  const [efficiency,  setEfficiency]  = useState(87);
  const [cyclingCost, setCyclingCost] = useState(20);

  // Derived calculations
  const energyMWh        = batteryMW * durationH;
  const history = liveOps.zoneHistory.length ? liveOps.zoneHistory : [
    26, 24, 22, 21, 20, 21, 28, 35, 42, 44, 43, 40,
    38, 36, 35, 34, 38, 44, 50, 52, 48, 43, 38, 32,
  ];
  const chargeWindow = minWindowAverage(history, durationH);
  const dischargeWindow = maxWindowAverage(history, durationH);
  const chargeLMP        = chargeWindow.value;
  const dischargeLMP     = dischargeWindow.value;
  const grossSpread      = dischargeLMP - chargeLMP;
  const efficiencyFactor = efficiency / 100;
  const netSpread        = (grossSpread * efficiencyFactor) - cyclingCost;
  const dailyRevenue     = Math.round(netSpread * energyMWh);
  const grossRevenue     = Math.round(grossSpread * efficiencyFactor * energyMWh);

  // Arbitrage signal
  const signal: 'HIGH' | 'MODERATE' | 'LOW' = netSpread > 25 ? 'HIGH' : netSpread > 12 ? 'MODERATE' : 'LOW';
  const signalColor = signal === 'HIGH' ? C.falconGold : signal === 'MODERATE' ? C.electricBlue : C.textSecondary;

  const targetSoc = Math.max(15, Math.min(95, Math.round(((history[history.length - 1] - Math.min(...history)) / (Math.max(...history) - Math.min(...history) || 1)) * 100)));
  const isCharging = history[history.length - 1] <= chargeLMP + 0.5;
  const stateBadgeColor = isCharging ? C.alertNormal : C.falconGold;

  const inputStyle: React.CSSProperties = {
    background: C.bgSurface,
    border: `1px solid ${C.borderDefault}`,
    borderRadius: R.md,
    color: C.textPrimary,
    fontFamily: F.mono,
    fontSize: '15px',
    fontWeight: '600',
    padding: '4px 8px',
    outline: 'none',
    fontVariantNumeric: 'tabular-nums',
  };

  return (
    <div style={{ height: 'calc(100vh - 64px)', width: '100%', background: C.bgBase, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* ROW 1 — Sub-header */}
      <div style={{ height: '44px', display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: `0.5px solid ${C.borderDefault}`, flexShrink: 0, gap: '16px' }}>
        <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.15em' }}>BATTERY ARBITRAGE</span>
        <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.electricBlue, letterSpacing: '0.10em' }}>/ {selectedZone ?? 'WEST HUB'}</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: R.sm, backgroundColor: `${stateBadgeColor}18`, border: `1px solid ${stateBadgeColor}50` }}>
          <span style={{ fontFamily: F.mono, fontSize: T.labelSize, color: stateBadgeColor, letterSpacing: T.labelSpacing }}>{isCharging ? 'CHARGING' : 'DISCHARGING'}</span>
        </div>
      </div>

      {/* ROW 2 — Parameters */}
      <div style={{ display: 'flex', gap: S.xl, flexShrink: 0, padding: `${S.md} 24px`, borderBottom: `1px solid ${C.borderDefault}`, alignItems: 'center' }}>
        {/* Battery Size */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: S.xs }}>
          <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.10em', textTransform: 'uppercase' as const }}>BATTERY SIZE</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: S.xs }}>
            <input type="number" value={batteryMW} onChange={e => setBatteryMW(Math.max(1, Number(e.target.value)))} style={{ ...inputStyle, width: '72px' }} />
            <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted }}>MW</span>
          </div>
        </div>
        {/* Duration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: S.xs }}>
          <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.10em', textTransform: 'uppercase' as const }}>DURATION</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: S.xs }}>
            <input type="number" value={durationH} min={1} max={12} onChange={e => setDurationH(Math.max(1, Math.min(12, Number(e.target.value))))} style={{ ...inputStyle, width: '56px' }} />
            <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted }}>H</span>
          </div>
        </div>
        {/* Divider */}
        <div style={{ width: '1px', height: '40px', background: C.borderDefault }} />
        {/* Efficiency slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: S.xs, flex: 1, maxWidth: '220px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.10em', textTransform: 'uppercase' as const }}>ROUND-TRIP EFF.</span>
            <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.electricBlue, fontVariantNumeric: 'tabular-nums' }}>{efficiency}%</span>
          </div>
          <input type="range" min={60} max={98} value={efficiency} onChange={e => setEfficiency(Number(e.target.value))} style={{ width: '100%', accentColor: C.electricBlue, cursor: 'pointer' }} />
        </div>
        {/* Cycling cost slider */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: S.xs, flex: 1, maxWidth: '220px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.10em', textTransform: 'uppercase' as const }}>CYCLING COST</span>
            <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.falconGold, fontVariantNumeric: 'tabular-nums' }}>${cyclingCost}/MWh</span>
          </div>
          <input type="range" min={0} max={60} value={cyclingCost} onChange={e => setCyclingCost(Number(e.target.value))} style={{ width: '100%', accentColor: C.falconGold, cursor: 'pointer' }} />
        </div>
      </div>

      {/* ROW 3 — Computed metrics */}
      <div style={{ display: 'flex', gap: '1px', flexShrink: 0 }}>
        {[
          { label: 'NET PROFIT',  value: `$${dailyRevenue.toLocaleString()}`, sub: '/day', color: C.falconGold },
          { label: 'NET SPREAD',  value: `+$${netSpread.toFixed(2)}`,         sub: '/MWh', color: C.falconGold },
          { label: 'ENERGY CAP',  value: `${energyMWh}`,                      sub: ' MWh', color: C.textPrimary },
          { label: 'ARB SIGNAL',  value: signal,                               sub: '',     color: signalColor },
        ].map(tile => (
          <div key={tile.label} style={{ flex: 1, background: C.bgSurface, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.10em', textTransform: 'uppercase' as const }}>{tile.label}</span>
            <span style={{ fontFamily: F.mono, fontSize: '22px', fontWeight: '600', color: tile.color, fontVariantNumeric: 'tabular-nums' }}>
              {tile.value}<span style={{ fontSize: '12px', color: C.textMuted }}>{tile.sub}</span>
            </span>
          </div>
        ))}
      </div>

      {/* ROW 4 — Left: signal+ops+gauge | Right: schedule chart */}
      <div style={{ flex: 1, display: 'flex', padding: '16px 24px', gap: '24px', overflow: 'hidden', minHeight: 0 }}>
        {/* Left column */}
        <div style={{ width: '220px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: S.lg, overflowY: 'auto' }}>
          {/* SOC gauge */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <SOCGauge soc={targetSoc} size={140} />
          </div>
          {/* Arbitrage signal */}
          <div style={{ background: C.bgSurface, padding: S.lg, borderRadius: R.md, borderLeft: `2px solid ${signalColor}` }}>
            <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.10em', marginBottom: S.sm }}>ARB SIGNAL</div>
            <div style={{ fontFamily: F.mono, fontSize: '18px', fontWeight: '700', color: signalColor, marginBottom: S.xs }}>{signal}</div>
            <div style={{ fontFamily: F.sans, fontSize: '11px', color: C.textMuted, lineHeight: 1.4 }}>
              {signal === 'HIGH' ? 'Strong price separation. Maximize cycles.'
               : signal === 'MODERATE' ? 'Moderate spread. Standard operations.'
               : 'Low spread. Consider reducing cycles.'}
            </div>
          </div>
          {/* Daily operations */}
          <div style={{ background: C.bgSurface, padding: S.lg, borderRadius: R.md }}>
            <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.10em', marginBottom: S.md }}>DAILY OPERATIONS</div>
            {[
              { label: 'Charging',    hours: durationH,          color: C.electricBlue },
              { label: 'Discharging', hours: durationH,          color: C.falconGold },
              { label: 'Idle',        hours: 24 - durationH * 2, color: C.textMuted },
            ].map(op => (
              <div key={op.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.sm }}>
                <span style={{ fontFamily: F.sans, fontSize: '12px', color: C.textSecondary }}>{op.label}</span>
                <span style={{ fontFamily: F.mono, fontSize: '13px', fontWeight: '600', color: op.color, fontVariantNumeric: 'tabular-nums' }}>{op.hours}h</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: schedule chart */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontFamily: F.mono, fontSize: T.labelSize, color: C.textMuted, letterSpacing: T.labelSpacing, textTransform: 'uppercase' as const, flexShrink: 0 }}>CHARGE / DISCHARGE SCHEDULE</div>
          <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0 }}>
              <ChargeScheduleChart chargeLMP={chargeLMP} dischargeLMP={dischargeLMP} />
            </div>
          </div>
        </div>
      </div>

      {/* ROW 5 — Bottom panels */}
      <div style={{ display: 'flex', gap: '1px', flexShrink: 0, height: '110px', borderTop: `0.5px solid ${C.borderDefault}` }}>
        {[
          { label: 'CHARGE WINDOW', color: C.alertNormal, rows: [{ k: 'Window', v: hourWindowLabel(chargeWindow.start, durationH) }, { k: 'Avg price', v: `$${chargeLMP.toFixed(2)}/MWh` }, { k: 'Duration', v: `${durationH}h` }] },
          { label: 'DISCHARGE WINDOW', color: C.falconGold, rows: [{ k: 'Window', v: hourWindowLabel(dischargeWindow.start, durationH) }, { k: 'Avg price', v: `$${dischargeLMP.toFixed(2)}/MWh` }, { k: 'Duration', v: `${durationH}h` }] },
          { label: 'ARBITRAGE ECONOMICS', color: C.electricBlue, rows: [{ k: 'Gross spread', v: `+$${grossSpread.toFixed(2)}/MWh` }, { k: 'After eff+cost', v: `+$${netSpread.toFixed(2)}/MWh` }, { k: 'Net revenue', v: `$${grossRevenue.toLocaleString()} gross − $${(grossRevenue - dailyRevenue).toLocaleString()} costs = $${dailyRevenue.toLocaleString()}/day` }] },
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
  );
}

// ── ReliabilityGauge ─────────────────────────────────────────────
function ReliabilityGauge({ score, color }: { score: number; color: string }) {
  const SIZE = 120, CX = 60, CY = 70, RAD = 44, STROKE = 7;
  const START = 200, SWEEP = 140;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const pt = (deg: number) => ({ x: CX + RAD * Math.cos(toRad(deg)), y: CY + RAD * Math.sin(toRad(deg)) });
  const filled = (score / 10) * SWEEP;
  const bgS = pt(START), bgE = pt(START + SWEEP), fgE = pt(START + filled);
  const bgLarge = SWEEP > 180 ? 1 : 0, fgLarge = filled > 180 ? 1 : 0;

  return (
    <svg width={SIZE} height={SIZE * 0.75} viewBox={`0 0 ${SIZE} ${SIZE * 0.75}`}>
      <path d={`M ${bgS.x} ${bgS.y} A ${RAD} ${RAD} 0 ${bgLarge} 1 ${bgE.x} ${bgE.y}`}
        fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={STROKE} strokeLinecap="round" />
      {score > 0 && (
        <path d={`M ${bgS.x} ${bgS.y} A ${RAD} ${RAD} 0 ${fgLarge} 1 ${fgE.x} ${fgE.y}`}
          fill="none" stroke={color} strokeWidth={STROKE} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 5px ${color}60)` }} />
      )}
      <text x={CX} y={CY - 4} textAnchor="middle"
        style={{ fontFamily: F.mono, fontSize: '24px', fontWeight: '700', fill: color, fontVariantNumeric: 'tabular-nums' }}>
        {score.toFixed(1)}
      </text>
      <text x={CX} y={CY + 14} textAnchor="middle"
        style={{ fontFamily: F.mono, fontSize: '9px', fill: C.textMuted }}>
        / 10
      </text>
    </svg>
  );
}

// ── SupplyGapWaterfall ──────────────────────────────────────────
function SupplyGapWaterfall({ data, loadForecast }: { data: { name: string; value: number; type: string }[]; loadForecast: number }) {
  const COLORS: Record<string, string> = {
    base: C.textSecondary, negative: C.alertCritical, positive: C.alertNormal,
    result: C.electricBlue, benchmark: C.falconGold,
  };
  const chartData = data.map(d => ({
    ...d,
    displayValue: Math.abs(d.value),
    fill: COLORS[d.type] ?? C.textMuted,
    label: `${d.value > 0 ? '+' : ''}${(d.value / 1000).toFixed(1)} GW`,
  }));
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0]?.payload;
    return (
      <div style={{ background: C.bgOverlay, border: `1px solid ${C.borderStrong}`, borderRadius: R.md, padding: '8px 12px' }}>
        <div style={{ fontFamily: F.sans, fontSize: 11, color: C.textMuted, marginBottom: 4 }}>{d.name.replace('\n', ' ')}</div>
        <div style={{ fontFamily: F.mono, fontSize: 14, fontWeight: 600, color: d.fill, fontVariantNumeric: 'tabular-nums' }}>{d.label}</div>
      </div>
    );
  };

  return (
    <div style={{ width: '100%', height: '100%', background: '#111318', borderRadius: R.md, padding: 4, boxSizing: 'border-box' as const }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 24, bottom: 24, left: 48 }} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.10)" vertical={false} />
          <XAxis dataKey="name" tick={{ fontFamily: F.mono, fontSize: 11, fill: 'rgba(229,231,235,0.55)' }} axisLine={{ stroke: 'rgba(229,231,235,0.12)' }} tickLine={false} />
          <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontFamily: F.mono, fontSize: 11, fill: 'rgba(229,231,235,0.55)' }} axisLine={false} tickLine={false} width={44} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
          <ReferenceLine y={loadForecast} stroke={C.falconGold} strokeDasharray="4 4" strokeOpacity={0.6}
            label={{ value: 'LOAD FORECAST', position: 'insideTopRight', style: { fontFamily: F.mono, fontSize: 9, fill: C.falconGold } }} />
          <Bar dataKey="displayValue" isAnimationActive={false} radius={[3, 3, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={index} fill={entry.fill} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function GapFullPage({ selectedZone }: { selectedZone: string | null }) {
  const liveOps = useLiveOpsData(selectedZone);
  const { data: fuelMixData } = useFuelMix();
  const [activeView, setActiveView] = useState<'realtime' | 'structural'>('realtime');

  const capacityData = [68,69,70,71,72,72,73,74,74,73,72,71,70,70,71,72,73,74,73,72,71,70,69,68];
  const loadData     = [52,50,49,48,50,54,60,65,66,67,68,67,66,65,64,65,67,70,71,70,66,62,58,55];
  const generationMw = (fuelMixData.fuels ?? []).reduce((s, x) => s + x.mw, 0);
  const loadForecastMw = liveOps.loadForecastMw || generationMw * 0.9;
  const actualLoadMw = liveOps.actualLoadMw || loadForecastMw;
  const capacityMw = generationMw > 0 ? generationMw : loadForecastMw * 1.15;
  const reserveMargin = loadForecastMw > 0 ? ((capacityMw - loadForecastMw) / loadForecastMw) * 100 : 0;
  const systemLoadGw = loadForecastMw / 1000;
  const capacityGw = capacityMw / 1000;
  const peakForecastGw = Math.max(systemLoadGw, actualLoadMw / 1000);
  const gapColor   = reserveMargin < 15 ? C.alertCritical : reserveMargin < 18 ? C.falconGold : C.electricBlue;
  const badgeLabel = reserveMargin < 15 ? 'EMERGENCY' : reserveMargin < 18 ? 'TIGHT' : 'ADEQUATE';
  const badgeBg    = reserveMargin < 15 ? `${C.alertCritical}18` : reserveMargin < 18 ? `${C.falconGold}18` : `${C.electricBlue}18`;
  const badgeBorder= reserveMargin < 15 ? `${C.alertCritical}50` : reserveMargin < 18 ? `${C.falconGold}50` : `${C.electricBlue}50`;

  // Structural data
  const STRUCTURAL = {
    reliabilityScore: 4.2,
    riskLabel: 'LOW RISK' as 'LOW RISK' | 'MODERATE RISK' | 'HIGH RISK',
    waterfall: [
      { name: 'Current\nCapacity',      value: 152100, type: 'base'      },
      { name: 'Scheduled\nRetirements', value: -8400,  type: 'negative'  },
      { name: 'New\nProjects',          value: 11200,  type: 'positive'  },
      { name: 'Net\nPosition',          value: 154900, type: 'result'    },
      { name: 'Load\nForecast',         value: 134200, type: 'benchmark' },
    ],
    netPosition:  154900,
    loadForecast: 134200,
    gap:          20700,
    investmentSignal: {
      headline: 'Balanced supply outlook.',
      detail: 'Monitor coal retirements scheduled for 2026–2028. Wind additions compensating for thermal exits. Reserve margin buffer is adequate but narrowing toward summer peak.',
    },
  };
  const riskColor = STRUCTURAL.reliabilityScore < 4 ? C.alertNormal : STRUCTURAL.reliabilityScore < 7 ? C.falconGold : C.alertCritical;

  return (
    <div style={{ height: 'calc(100vh - 64px)', width: '100%', background: C.bgBase, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Sub-header */}
      <div style={{ height: '44px', display: 'flex', alignItems: 'center', padding: '0 24px', borderBottom: `0.5px solid ${C.borderDefault}`, flexShrink: 0, gap: '16px' }}>
        <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.15em' }}>RESOURCE GAP ANALYSIS</span>
        <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.electricBlue, letterSpacing: '0.10em' }}>/ {selectedZone ?? 'WEST HUB'}</span>
        <div style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: R.sm, backgroundColor: badgeBg, border: `1px solid ${badgeBorder}` }}>
          <span style={{ fontFamily: F.mono, fontSize: T.labelSize, color: gapColor, letterSpacing: T.labelSpacing }}>{badgeLabel}</span>
        </div>
      </div>

      {/* Metrics strip */}
      <div style={{ display: 'flex', gap: '1px', flexShrink: 0 }}>
        {[
          { label: 'RESERVE MARGIN', value: `${reserveMargin.toFixed(1)}%`, color: gapColor },
          { label: 'SYSTEM LOAD',    value: `${systemLoadGw.toFixed(1)} GW`, color: C.textPrimary },
          { label: 'INSTALLED CAP',  value: `${capacityGw.toFixed(1)} GW`,   color: C.electricBlue },
          { label: 'PEAK FORECAST',  value: `${peakForecastGw.toFixed(1)} GW`, color: C.falconGold },
        ].map(tile => (
          <div key={tile.label} style={{ flex: 1, background: C.bgOverlay, padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.10em', textTransform: 'uppercase' as const }}>{tile.label}</span>
            <span style={{ fontFamily: F.mono, fontSize: '22px', fontWeight: '600', color: tile.color, fontVariantNumeric: 'tabular-nums' }}>{tile.value}</span>
          </div>
        ))}
      </div>

      {/* View tabs */}
      <div style={{ display: 'flex', gap: 0, flexShrink: 0, borderBottom: `1px solid ${C.borderDefault}` }}>
        {[
          { id: 'realtime',   label: '24H REAL-TIME' },
          { id: 'structural', label: 'SUPPLY GAP ANALYSIS' },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveView(tab.id as 'realtime' | 'structural')} style={{
            padding: '8px 20px', background: 'transparent', border: 'none',
            borderBottom: activeView === tab.id ? `2px solid ${C.electricBlue}` : '2px solid transparent',
            color: activeView === tab.id ? C.electricBlue : C.textMuted,
            fontFamily: F.mono, fontSize: '10px', fontWeight: '500', letterSpacing: '0.10em',
            textTransform: 'uppercase' as const, cursor: 'pointer',
            transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Body — conditional on active view */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 24px', overflow: 'hidden', minHeight: 0 }}>

        {activeView === 'realtime' && (
          <>
            {/* Dominant number */}
            <div style={{ flexShrink: 0, marginBottom: S.lg }}>
              <div style={{ fontFamily: F.mono, fontSize: '48px', fontWeight: 300, color: gapColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
                {reserveMargin.toFixed(1)}%
              </div>
              <div style={{ fontFamily: F.mono, fontSize: '12px', color: C.textMuted, marginTop: '6px' }}>
                RESERVE MARGIN · {selectedZone ?? 'WEST HUB'} · 15.0% REQUIRED · <span style={{ color: gapColor }}>+{(reserveMargin - 15).toFixed(1)}% BUFFER</span>
              </div>
            </div>
            {/* 24H chart */}
            <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0 }}>
                <ResourceGapChart capacity={capacityData} load={loadData} regime={badgeLabel as 'ADEQUATE' | 'TIGHT' | 'EMERGENCY'} />
              </div>
            </div>
          </>
        )}

        {activeView === 'structural' && (
          <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: S.xl, overflow: 'hidden' }}>
            {/* LEFT — Risk gauge + signal + gap + methodology */}
            <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: S.lg, overflowY: 'auto' }}>
              {/* Reliability Risk Score */}
              <div style={{ background: C.bgSurface, borderRadius: R.lg, padding: S.lg, borderLeft: `2px solid ${riskColor}` }}>
                <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.10em', textTransform: 'uppercase' as const, marginBottom: S.md }}>RELIABILITY RISK SCORE</div>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: S.md }}>
                  <ReliabilityGauge score={STRUCTURAL.reliabilityScore} color={riskColor} />
                </div>
                <div style={{ textAlign: 'center' as const }}>
                  <div style={{ fontFamily: F.mono, fontSize: '13px', fontWeight: '600', color: riskColor, letterSpacing: '0.10em' }}>{STRUCTURAL.riskLabel}</div>
                  <div style={{ fontFamily: F.sans, fontSize: '11px', color: C.textMuted, marginTop: S.xs }}>PJM system adequacy</div>
                </div>
              </div>

              {/* Strategic Investment Signal */}
              <div style={{ background: C.bgSurface, borderRadius: R.lg, padding: S.lg, borderLeft: `2px solid ${C.electricBlue}` }}>
                <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.10em', textTransform: 'uppercase' as const, marginBottom: S.md }}>STRATEGIC SIGNAL</div>
                <div style={{ fontFamily: F.sans, fontSize: '13px', fontWeight: '600', color: C.textPrimary, marginBottom: S.sm, lineHeight: 1.4 }}>{STRUCTURAL.investmentSignal.headline}</div>
                <div style={{ fontFamily: F.sans, fontSize: '12px', color: C.textSecondary, lineHeight: 1.6 }}>{STRUCTURAL.investmentSignal.detail}</div>
              </div>

              {/* Gap summary */}
              <div style={{ background: C.bgSurface, borderRadius: R.lg, padding: S.lg }}>
                {[
                  { label: 'NET POSITION',  value: `${(STRUCTURAL.netPosition / 1000).toFixed(1)} GW`,  color: C.electricBlue },
                  { label: 'LOAD FORECAST', value: `${(STRUCTURAL.loadForecast / 1000).toFixed(1)} GW`, color: C.textPrimary },
                  { label: 'CAPACITY GAP',  value: `+${(STRUCTURAL.gap / 1000).toFixed(1)} GW`,         color: C.alertNormal },
                ].map((row, i) => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingBottom: i < 2 ? S.sm : 0, marginBottom: i < 2 ? S.sm : 0, borderBottom: i < 2 ? `1px solid ${C.borderDefault}` : 'none' }}>
                    <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.08em' }}>{row.label}</span>
                    <span style={{ fontFamily: F.mono, fontSize: '14px', fontWeight: '600', color: row.color, fontVariantNumeric: 'tabular-nums' }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* Methodology */}
              <div style={{ background: C.bgSurface, borderRadius: R.lg, padding: S.lg, opacity: 0.7 }}>
                <div style={{ fontFamily: F.mono, fontSize: '9px', color: C.textMuted, letterSpacing: '0.10em', textTransform: 'uppercase' as const, marginBottom: S.sm }}>METHODOLOGY</div>
                <div style={{ fontFamily: F.sans, fontSize: '11px', color: C.textMuted, lineHeight: 1.6 }}>
                  <strong style={{ color: C.textSecondary }}>Resource Adequacy</strong> measures whether the grid has sufficient generation capacity to meet forecasted demand plus reserves. Reliability scores above 7 indicate supply deficits requiring new capacity additions. <strong style={{ color: C.textSecondary }}>RMR</strong> (Reliability Must Run) units are generators kept online specifically for local reliability despite being uneconomic.
                </div>
              </div>
            </div>

            {/* RIGHT — Waterfall chart */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: S.md }}>
              <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.10em', textTransform: 'uppercase' as const }}>SUPPLY GAP ANALYSIS — CAPACITY WATERFALL vs LOAD FORECAST (MW)</div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <SupplyGapWaterfall data={STRUCTURAL.waterfall} loadForecast={STRUCTURAL.loadForecast} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom panels */}
      <div style={{ display: 'flex', gap: '1px', flexShrink: 0, height: '110px', borderTop: `0.5px solid ${C.borderDefault}` }}>
        {[
          { label: 'CAPACITY POSITION', color: C.electricBlue, rows: [{ k: 'Installed', v: `${capacityGw.toFixed(1)} GW` }, { k: 'Committed', v: `${(capacityGw * 0.95).toFixed(1)} GW` }, { k: 'Available', v: `${(capacityGw * 0.05).toFixed(1)} GW` }] },
          { label: 'LOAD ANALYSIS', color: C.textSecondary, rows: [{ k: 'Current load', v: `${(actualLoadMw / 1000).toFixed(1)} GW` }, { k: 'Peak forecast', v: `${peakForecastGw.toFixed(1)} GW` }, { k: 'Avg 24H', v: `${(avg(loadData)).toFixed(1)} GW` }] },
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
  );
}

// ── PeregrineFeed ────────────────────────────────────────────────
function PeregrineFeed({ onZoneClick, onOpenFull }: { onZoneClick: (zoneId: string) => void; onOpenFull?: () => void }) {
  const [feedMode, setFeedMode]         = useState<'market' | 'news'>('market');
  const [activeFilter, setActiveFilter] = useState<AlertCategory | 'ALL'>('ALL');
  const [expandedId, setExpandedId]     = useState<string | null>(null);

  const filteredAlerts = activeFilter === 'ALL' ? FEED_ALERTS : FEED_ALERTS.filter(a => a.category === activeFilter);
  const activeCategories = Array.from(new Set(FEED_ALERTS.map(a => a.category)));

  const sourceColor = (src: string) =>
    src === 'Bloomberg' ? C.falconGold : src === 'Reuters' ? C.electricBlue : src === 'PJM' ? C.alertNormal : C.textSecondary;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Card label */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: `0.5px solid ${C.borderDefault}`, flexShrink: 0 }}>
        <span style={{ fontFamily: F.mono, fontSize: '10px', fontWeight: '600', letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: C.textMuted }}>PEREGRINE FEED</span>
        {onOpenFull && (
          <span onClick={onOpenFull} style={{ fontFamily: F.mono, fontSize: '8px', color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', cursor: 'pointer' }}>
            ↗ EXPAND
          </span>
        )}
      </div>

      {/* Top: regime badge + status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${S.sm} ${S.lg}`, flexShrink: 0, background: 'rgba(6,182,212,0.04)', borderBottom: `1px solid ${C.borderDefault}` }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 8px', background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)', borderRadius: R.sm }}>
          <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.electricBlue, animation: 'livePulse 2s infinite' }} />
          <span style={{ fontFamily: F.mono, fontSize: '10px', fontWeight: '600', color: C.electricBlue, letterSpacing: '0.10em' }}>NORMAL</span>
          <span style={{ fontFamily: F.sans, fontSize: '10px', color: C.textMuted }}>· Balanced supply</span>
        </div>
      </div>

      {/* Feed mode tabs */}
      <div style={{ display: 'flex', flexShrink: 0, borderBottom: `1px solid ${C.borderDefault}` }}>
        {[
          { id: 'market', label: 'MARKET ALERTS', count: FEED_ALERTS.length },
          { id: 'news',   label: 'ENERGY NEWS',   count: ENERGY_NEWS.length },
        ].map(tab => (
          <button key={tab.id} onClick={() => setFeedMode(tab.id as 'market' | 'news')} style={{
            flex: 1, padding: '9px 0', background: 'transparent', border: 'none',
            borderBottom: feedMode === tab.id ? `2px solid ${C.electricBlue}` : '2px solid transparent',
            color: feedMode === tab.id ? C.electricBlue : C.textMuted,
            fontFamily: F.mono, fontSize: '10px', fontWeight: '600', letterSpacing: '0.10em',
            textTransform: 'uppercase' as const, cursor: 'pointer',
            transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}>
            {tab.label}<span style={{ marginLeft: 5, opacity: 0.6 }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ── MARKET ALERTS TAB ── */}
      {feedMode === 'market' && (
        <>
          {/* Category filter chips */}
          <div style={{ display: 'flex', gap: S.xs, padding: `${S.sm} ${S.lg}`, flexShrink: 0, flexWrap: 'wrap' as const, borderBottom: `1px solid ${C.borderDefault}` }}>
            <button onClick={() => setActiveFilter('ALL')} style={{
              padding: '2px 8px', background: activeFilter === 'ALL' ? C.electricBlueWash : 'transparent',
              border: `1px solid ${activeFilter === 'ALL' ? C.electricBlue : C.borderDefault}`, borderRadius: R.sm,
              color: activeFilter === 'ALL' ? C.electricBlue : C.textMuted, fontFamily: F.mono, fontSize: '9px',
              fontWeight: '500', letterSpacing: '0.10em', textTransform: 'uppercase' as const, cursor: 'pointer',
            }}>ALL {FEED_ALERTS.length}</button>
            {activeCategories.map(cat => {
              const count = FEED_ALERTS.filter(a => a.category === cat).length;
              const color = CATEGORY_COLORS[cat];
              const active = activeFilter === cat;
              return (
                <button key={cat} onClick={() => setActiveFilter(active ? 'ALL' : cat)} style={{
                  padding: '2px 8px', background: active ? `${color}18` : 'transparent',
                  border: `1px solid ${active ? color : C.borderDefault}`, borderRadius: R.sm,
                  color: active ? color : C.textMuted, fontFamily: F.mono, fontSize: '9px',
                  fontWeight: '500', letterSpacing: '0.10em', textTransform: 'uppercase' as const, cursor: 'pointer',
                }}>{cat} {count}</button>
              );
            })}
          </div>

          {/* Alert stream */}
          <div style={{ flex: 1, overflowY: 'auto', padding: `${S.sm} 0` }}>
            {filteredAlerts.map(alert => {
              const catColor = CATEGORY_COLORS[alert.category];
              const priConfig = PRIORITY_CONFIG[alert.priority];
              const isExpanded = expandedId === alert.id;
              return (
                <div key={alert.id} onClick={() => setExpandedId(isExpanded ? null : alert.id)} style={{
                  padding: `${S.sm} ${S.lg}`,
                  borderLeft: `2px solid ${alert.priority === 'CRITICAL' ? C.alertCritical : alert.priority === 'HIGH' ? catColor : 'transparent'}`,
                  opacity: priConfig.rowOpacity, cursor: 'pointer',
                  background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent',
                  borderBottom: `1px solid ${C.borderDefault}`, transition: 'background 120ms ease',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; }}
                  onMouseLeave={e => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: S.sm, marginBottom: S.xs }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: priConfig.dot, flexShrink: 0 }} />
                    <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{alert.time}</span>
                    <span style={{ padding: '1px 5px', background: `${catColor}15`, border: `1px solid ${catColor}40`, borderRadius: '3px', color: catColor, fontFamily: F.mono, fontSize: '8px', fontWeight: '600', letterSpacing: '0.10em', textTransform: 'uppercase' as const, flexShrink: 0 }}>{alert.category}</span>
                    {alert.value && (
                      <span style={{ marginLeft: 'auto', fontFamily: F.mono, fontSize: '11px', fontWeight: '600', color: catColor, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{alert.value}</span>
                    )}
                  </div>
                  <div style={{ fontFamily: F.sans, fontSize: '13px', fontWeight: '500', color: alert.priority === 'CRITICAL' || alert.priority === 'HIGH' ? C.textPrimary : C.textSecondary, lineHeight: 1.4, paddingLeft: S.lg }}>
                    {alert.headline}
                  </div>
                  {isExpanded && alert.detail && (
                    <div style={{ marginTop: S.sm, paddingLeft: S.lg, paddingTop: S.sm, borderTop: `1px solid ${C.borderDefault}` }}>
                      <div style={{ fontFamily: F.sans, fontSize: '11px', color: C.textMuted, lineHeight: 1.6, marginBottom: S.sm }}>{alert.detail}</div>
                      {alert.zone && (
                        <button onClick={e => { e.stopPropagation(); onZoneClick(alert.zone!); }} style={{
                          display: 'inline-flex', alignItems: 'center', gap: S.xs, padding: '3px 8px',
                          background: C.electricBlueWash, border: '1px solid rgba(6,182,212,0.25)', borderRadius: R.sm,
                          color: C.electricBlue, fontFamily: F.mono, fontSize: '9px', fontWeight: '500',
                          letterSpacing: '0.10em', textTransform: 'uppercase' as const, cursor: 'pointer',
                        }}>→ VIEW {alert.zone} IN NEST</button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div style={{ padding: `${S.sm} ${S.lg}`, opacity: 0.5 }}>
              <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted, fontVariantNumeric: 'tabular-nums' }}>
                {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
              </span>
              <span style={{ display: 'inline-block', width: '8px', height: '14px', background: C.electricBlue, marginLeft: '2px', verticalAlign: 'middle', animation: 'blink 1s step-end infinite' }} />
            </div>
          </div>
        </>
      )}

      {/* ── ENERGY NEWS TAB ── */}
      {feedMode === 'news' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {ENERGY_NEWS.map(item => (
            <div key={item.id} style={{
              display: 'flex', gap: S.md, padding: `${S.md} ${S.lg}`,
              borderBottom: `1px solid ${C.borderDefault}`, cursor: 'pointer',
              transition: 'background 120ms ease',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.025)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              {/* Left: timestamp + source */}
              <div style={{ width: '56px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 2 }}>
                <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, fontVariantNumeric: 'tabular-nums' }}>{item.timeAgo}</span>
                <span style={{ fontFamily: F.mono, fontSize: '9px', color: sourceColor(item.source), letterSpacing: '0.06em' }}>{item.source.toUpperCase()}</span>
              </div>

              {/* Center: headline + summary + tags */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: F.sans, fontSize: '13px', fontWeight: '500', color: C.textPrimary, lineHeight: 1.4, marginBottom: item.summary ? S.xs : 0 }}>
                  {item.headline}
                </div>
                {item.summary && (
                  <div style={{ fontFamily: F.sans, fontSize: '11px', color: C.textMuted, lineHeight: 1.5, marginBottom: S.xs }}>{item.summary}</div>
                )}
                <div style={{ display: 'flex', gap: S.xs, flexWrap: 'wrap' as const }}>
                  {item.tags.slice(0, 3).map(tag => (
                    <span key={tag} style={{ padding: '1px 5px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '3px', fontFamily: F.mono, fontSize: '8px', color: C.textMuted, letterSpacing: '0.06em' }}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* Right: thumbnail placeholder */}
              <div style={{ width: '48px', height: '38px', flexShrink: 0, background: C.bgSurface, borderRadius: R.sm, border: `1px solid ${C.borderDefault}`, display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'flex-start', marginTop: 2 }}>
                <span style={{ fontSize: '16px', opacity: 0.4 }}>
                  {item.tags[0]?.includes('wind') ? '💨' : item.tags[0]?.includes('gas') || item.tags[0]?.includes('natural') ? '🔥' : item.tags[0]?.includes('battery') || item.tags[0]?.includes('BESS') ? '⚡' : item.tags[0]?.includes('coal') ? '⬛' : item.tags[0]?.includes('solar') || item.tags[0]?.includes('IRA') ? '☀️' : '📡'}
                </span>
              </div>
            </div>
          ))}
          <div style={{ padding: `${S.sm} ${S.lg}`, opacity: 0.4 }}>
            <span style={{ fontFamily: F.sans, fontSize: '10px', color: C.textMuted }}>LIVE · Refreshes every 5 minutes</span>
          </div>
        </div>
      )}

      {/* Open full feed hint */}
      {onOpenFull && (
        <div onClick={onOpenFull} style={{
          flexShrink: 0, textAlign: 'center' as const,
          padding: `${S.sm} 0`, borderTop: `1px solid ${C.borderDefault}`,
          cursor: 'pointer',
        }}>
          <span style={{ fontFamily: F.mono, fontSize: '9px', color: C.textMuted, letterSpacing: '0.10em', opacity: 0.6 }}>
            › OPEN FULL FEED
          </span>
        </div>
      )}
    </div>
  );
}

// ── PeregrineFeedMarketAlerts (standalone alert stream for full page) ──
function PeregrineFeedMarketAlerts({ onZoneClick }: { onZoneClick: (zoneId: string) => void }) {
  const [activeFilter, setActiveFilter] = useState<AlertCategory | 'ALL'>('ALL');
  const [expandedId, setExpandedId]     = useState<string | null>(null);
  const filteredAlerts = activeFilter === 'ALL' ? FEED_ALERTS : FEED_ALERTS.filter(a => a.category === activeFilter);
  const activeCategories = Array.from(new Set(FEED_ALERTS.map(a => a.category)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Filter chips */}
      <div style={{ display: 'flex', gap: S.xs, padding: `${S.md} ${S.lg}`, flexShrink: 0, flexWrap: 'wrap' as const, borderBottom: `1px solid ${C.borderDefault}` }}>
        <button onClick={() => setActiveFilter('ALL')} style={{
          padding: '2px 8px', background: activeFilter === 'ALL' ? C.electricBlueWash : 'transparent',
          border: `1px solid ${activeFilter === 'ALL' ? C.electricBlue : C.borderDefault}`, borderRadius: R.sm,
          color: activeFilter === 'ALL' ? C.electricBlue : C.textMuted, fontFamily: F.mono, fontSize: '9px',
          fontWeight: '500', letterSpacing: '0.10em', textTransform: 'uppercase' as const, cursor: 'pointer',
        }}>ALL {FEED_ALERTS.length}</button>
        {activeCategories.map(cat => {
          const count = FEED_ALERTS.filter(a => a.category === cat).length;
          const color = CATEGORY_COLORS[cat];
          const active = activeFilter === cat;
          return (
            <button key={cat} onClick={() => setActiveFilter(active ? 'ALL' : cat)} style={{
              padding: '2px 8px', background: active ? `${color}18` : 'transparent',
              border: `1px solid ${active ? color : C.borderDefault}`, borderRadius: R.sm,
              color: active ? color : C.textMuted, fontFamily: F.mono, fontSize: '9px',
              fontWeight: '500', letterSpacing: '0.10em', textTransform: 'uppercase' as const, cursor: 'pointer',
            }}>{cat} {count}</button>
          );
        })}
      </div>
      {/* Alert stream */}
      <div style={{ flex: 1, overflowY: 'auto', padding: `${S.sm} 0` }}>
        {filteredAlerts.map(alert => {
          const catColor = CATEGORY_COLORS[alert.category];
          const priConfig = PRIORITY_CONFIG[alert.priority];
          const isExpanded = expandedId === alert.id;
          return (
            <div key={alert.id} onClick={() => setExpandedId(isExpanded ? null : alert.id)} style={{
              padding: `${S.sm} ${S.lg}`,
              borderLeft: `2px solid ${alert.priority === 'CRITICAL' ? C.alertCritical : alert.priority === 'HIGH' ? catColor : 'transparent'}`,
              opacity: priConfig.rowOpacity, cursor: 'pointer',
              background: isExpanded ? 'rgba(255,255,255,0.03)' : 'transparent',
              borderBottom: `1px solid ${C.borderDefault}`, transition: 'background 120ms ease',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={e => { if (!isExpanded) (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: S.sm, marginBottom: S.xs }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: priConfig.dot, flexShrink: 0 }} />
                <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{alert.time}</span>
                <span style={{ padding: '1px 5px', background: `${catColor}15`, border: `1px solid ${catColor}40`, borderRadius: '3px', color: catColor, fontFamily: F.mono, fontSize: '8px', fontWeight: '600', letterSpacing: '0.10em', textTransform: 'uppercase' as const, flexShrink: 0 }}>{alert.category}</span>
                {alert.value && (
                  <span style={{ marginLeft: 'auto', fontFamily: F.mono, fontSize: '10px', fontWeight: '600', color: catColor, fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>{alert.value}</span>
                )}
              </div>
              <div style={{ fontFamily: F.sans, fontSize: '12px', color: alert.priority === 'CRITICAL' || alert.priority === 'HIGH' ? C.textPrimary : C.textSecondary, lineHeight: 1.4, paddingLeft: S.lg }}>
                {alert.headline}
              </div>
              {isExpanded && alert.detail && (
                <div style={{ marginTop: S.sm, paddingLeft: S.lg, paddingTop: S.sm, borderTop: `1px solid ${C.borderDefault}` }}>
                  <div style={{ fontFamily: F.sans, fontSize: '11px', color: C.textMuted, lineHeight: 1.6, marginBottom: S.sm }}>{alert.detail}</div>
                  {alert.zone && (
                    <button onClick={e => { e.stopPropagation(); onZoneClick(alert.zone!); }} style={{
                      display: 'inline-flex', alignItems: 'center', gap: S.xs, padding: '3px 8px',
                      background: C.electricBlueWash, border: '1px solid rgba(6,182,212,0.25)', borderRadius: R.sm,
                      color: C.electricBlue, fontFamily: F.mono, fontSize: '9px', fontWeight: '500',
                      letterSpacing: '0.10em', textTransform: 'uppercase' as const, cursor: 'pointer',
                    }}>→ VIEW {alert.zone} IN NEST</button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Map PJM `fuel_type` strings to design tokens (same idea as Grid Atlas). */
function nestFuelColor(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('gas')) return C.fuelGas;
  if (t.includes('nuclear')) return C.fuelNuclear;
  if (t.includes('wind')) return C.fuelWind;
  if (t.includes('solar')) return C.fuelSolar;
  if (t.includes('coal')) return C.fuelCoal;
  if (t.includes('hydro') || t.includes('water')) return C.fuelHydro;
  if (t.includes('storage') || t.includes('battery')) return C.fuelBattery;
  return C.fuelOther;
}

// THE NEST View - Volumetric Bento
function NestView({
  selectedZone,
  setSelectedZone,
  onNavigateKPI,
}: {
  selectedZone: string | null;
  setSelectedZone: (z: string | null) => void;
  onNavigateKPI: (tab: 'lmp' | 'spread' | 'battery' | 'gap' | 'peregrine') => void;
}) {
  const { data: fuelMixData, live: fuelMixLive } = useFuelMix();
  const liveOps = useLiveOpsData(selectedZone);
  const [marketPulseExpanded, setMarketPulseExpanded] = useState(false)
  const [marketPulseClosing, setMarketPulseClosing] = useState(false)
  const [ghostTime, setGhostTime] = useState<string | null>(null)
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

  const closeModal = () => {
    setMarketPulseClosing(true)
    setTimeout(() => {
      setMarketPulseExpanded(false)
      setMarketPulseClosing(false)
    }, 280)
  }

  const genMixSegments = (() => {
    const fuels = fuelMixData.fuels ?? [];
    const sorted = [...fuels].sort((a, b) => b.mw - a.mw).slice(0, 8);
    const totalMw = sorted.reduce((s, x) => s + x.mw, 0);
    if (totalMw <= 0) return [];
    return sorted.map((f) => ({
      type: f.type,
      mw: f.mw,
      pct: (f.mw / totalMw) * 100,
      gw: f.mw / 1000,
      color: nestFuelColor(f.type),
    }));
  })();

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
                fontFamily: F.mono,
                fontSize: '10px',
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.15em',
              }}>
                MARKET PULSE — PJM ZONE EXPLORER
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {ghostTime && (
                  <span style={{
                    fontFamily: F.mono,
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
                    fontFamily: F.mono,
                    fontSize: '11px',
                    color: C.electricBlueLight,
                    letterSpacing: '0.1em',
                  }}>
                    {selectedZone} · ${liveOps.lmpPrice.toFixed(2)} /MWh
                  </span>
                )}
                <button
                  onClick={closeModal}
                  style={{
                    fontFamily: F.sans,
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
                  fontFamily: F.mono,
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
                  <span style={{ fontFamily: F.mono, fontSize: '8px', color: 'rgba(255,255,255,0.45)' }}>
                    CHEAP (ZONE 24H LOW)
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFB800' }} />
                  <span style={{ fontFamily: F.mono, fontSize: '8px', color: 'rgba(255,255,255,0.45)' }}>
                    MID-RANGE
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FF4444' }} />
                  <span style={{ fontFamily: F.mono, fontSize: '8px', color: 'rgba(255,255,255,0.45)' }}>
                    EXPENSIVE (ZONE 24H HIGH)
                  </span>
                </div>
                {/* Size + depth legend */}
                <div style={{ borderTop: '0.5px solid rgba(255,255,255,0.06)', paddingTop: '5px', marginTop: '2px' }}>
                  <span style={{ fontFamily: F.mono, fontSize: '7.5px', color: 'rgba(255,255,255,0.3)' }}>
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
                fontFamily: F.mono,
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
      <div style={{ gridArea: 'feed', background: C.bgElevated, border: `1px solid ${C.borderDefault}`, borderTop: `1px solid ${C.borderAccent}`, borderRadius: R.lg, overflow: 'hidden' }}>
        <ErrorBoundary label="PEREGRINE FEED">
          <PeregrineFeed onZoneClick={(zoneId) => { setSelectedZone(zoneId); setActiveKPI('lmp'); }} onOpenFull={() => onNavigateKPI('peregrine')} />
        </ErrorBoundary>
      </div>

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
                  fontSize: '11px',
                  fontWeight: '600',
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
              <LMPCard selectedZone={selectedZone} onExpand={() => onNavigateKPI('lmp')} />
            </ErrorBoundary>
          )}
          {activeKPI === 'spark' && (
            <ErrorBoundary label="SPARK SPREAD">
              <SparkKPIView selectedZone={selectedZone} onNavigate={() => onNavigateKPI('spread')} />
            </ErrorBoundary>
          )}
          {activeKPI === 'battery' && (
            <ErrorBoundary label="BATTERY ARB">
              <BatteryKPIView selectedZone={selectedZone} onNavigate={() => onNavigateKPI('battery')} />
            </ErrorBoundary>
          )}
          {activeKPI === 'gap' && (
            <ErrorBoundary label="RESOURCE GAP">
              <GapKPIView selectedZone={selectedZone} onNavigate={() => onNavigateKPI('gap')} />
            </ErrorBoundary>
          )}
        </div>
      </div>

      {/* Generation Mix — bottom strip, spans cols 1-2 */}
      <BentoCard
        title="GENERATION MIX"
        status={fuelMixLive ? 'live' : genMixSegments.length ? 'stale' : 'fallback'}
        style={{ gridArea: 'genmix' }}
      >
        <ErrorBoundary label="GENERATION MIX">
        <div style={{ height: '100%', padding: '6px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '4px' }}>
          {genMixSegments.length === 0 ? (
            <span style={{ fontFamily: F.mono, fontSize: '8px', color: C.textMuted, letterSpacing: '0.06em' }}>
              NO LIVE PJM MIX — CHECK V2 API / CREDENTIALS
            </span>
          ) : (
            <>
              <div style={{ display: 'flex', width: '100%' }}>
                {genMixSegments.map((s, i) => (
                  <div
                    key={`${s.type}-${i}`}
                    style={{ width: `${s.pct}%`, display: 'flex', justifyContent: 'center', minWidth: 0 }}
                  >
                    <span style={{
                      fontFamily: F.mono, fontSize: '8px', fontVariantNumeric: 'tabular-nums', color: s.color,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%',
                    }}>
                      {s.gw >= 10 ? s.gw.toFixed(1) : s.gw.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ height: '20px', width: '100%', display: 'flex', borderRadius: R.sm, overflow: 'hidden', flexShrink: 0 }}>
                {genMixSegments.map((s, i) => (
                  <div
                    key={`bar-${s.type}-${i}`}
                    style={{ width: `${s.pct}%`, height: '100%', backgroundColor: s.color, flexShrink: 0 }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {genMixSegments.map((s, i) => (
                  <div key={`leg-${s.type}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: R.sm, backgroundColor: s.color, flexShrink: 0 }} />
                    <span style={{ fontFamily: F.sans, fontSize: '8px', color: C.textSecondary }}>
                      {s.type} {Math.round(s.pct)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
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
        <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ fontFamily: F.sans, color: "#EDEDED" }}>{title}</span>
      </div>
      <div className="flex-1 flex flex-col p-4 relative">
        {/* Formula watermark for Optimizer - more visible */}
        {showFormula && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
            <span 
              className="text-[9px] whitespace-nowrap transform -rotate-3" 
              style={{
                fontFamily: F.mono,
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
              <span className="text-[9px] tracking-wide" style={{ fontFamily: F.sans, color: "rgba(255, 255, 255, 0.4)" }}>{mod}</span>
            </div>
          ))}
        </div>
        {/* Coming Soon Badge */}
        <div className="mt-auto flex justify-center">
          <div className="px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(34, 211, 238, 0.1)", border: "1px solid rgba(34, 211, 238, 0.3)" }}>
            <span className="text-[9px] font-medium tracking-widest" style={{ fontFamily: F.mono, color: C.electricBlueLight }}>COMING SOON</span>
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
          <span className="text-[10px] font-semibold tracking-widest uppercase" style={{ fontFamily: F.sans, color: "#EDEDED" }}>INDEX</span>
        </div>
        <nav className="py-2">
          {sections.map((s) => (
            <button key={s.id} onClick={() => setActiveSection(s.id)} className="w-full text-left px-4 py-2 transition-colors" style={{ backgroundColor: activeSection === s.id ? "rgba(6, 182, 212, 0.08)" : "transparent" }}>
              <span className="text-[11px] tracking-wide" style={{ fontFamily: F.sans, color: activeSection === s.id ? C.electricBlue : "rgba(255, 255, 255, 0.4)" }}>{s.label}</span>
            </button>
          ))}
        </nav>
      </div>
      <div className="flex-1 rounded-lg overflow-hidden" style={{ backgroundColor: "rgba(10, 10, 11, 0.7)", backdropFilter: "blur(12px)", border: "0.5px solid rgba(255, 255, 255, 0.08)" }}>
        <div className="px-6 py-4" style={{ borderBottom: "0.5px solid rgba(255, 255, 255, 0.06)" }}>
          <span className="text-xs font-semibold tracking-wide uppercase" style={{ fontFamily: F.sans, color: "#EDEDED" }}>{sections.find((s) => s.id === activeSection)?.label}</span>
        </div>
        <div className="p-6 space-y-6">
          {["1.0", "1.1", "1.2"].map((sec) => (
            <div key={sec}>
              <h3 className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ fontFamily: F.sans, color: "rgba(255, 255, 255, 0.3)" }}>SECTION {sec}</h3>
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
  const liveOps = useLiveOpsData(null);
  const lmpValue = liveOps.rtoPrice || 31.85;
  const isLive = liveOps.live;
  const kpiPages = ['lmp', 'spread', 'battery', 'gap', 'peregrine'];
  const isKPI = kpiPages.includes(activeNav);

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
      {/* Falcon icon + Wordmark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: S.md }}>
        <div style={{ width: '42px', height: '42px', flexShrink: 0, overflow: 'hidden', borderRadius: '6px' }}>
          <FalconLogo collapsed={false} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          <span style={{
            fontFamily: F.mono,
            fontSize: '15px',
            fontWeight: '700',
            letterSpacing: '0.20em',
            color: C.textPrimary,
            lineHeight: 1,
          }}>GRIDALPHA</span>
          <span style={{
            fontFamily: F.mono,
            fontSize: '10px',
            color: C.electricBlue,
            letterSpacing: '0.15em',
          }}>{viewLabels[activeNav]}</span>
        </div>
        <span style={{ color: C.textMuted, fontSize: '14px', opacity: 0.4 }}>/</span>
        {isKPI && (
          <span style={{
            fontFamily: F.mono,
            fontSize: '12px',
            color: C.electricBlue,
            letterSpacing: '0.15em',
          }}>{viewLabels[activeNav]}</span>
        )}
      </div>
      {isKPI ? (
        /* Breadcrumb: back to THE NEST */
        <nav style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => onNavChange('nest')}
            style={{
              fontFamily: F.sans,
              fontSize: '12px',
              fontWeight: '500',
              letterSpacing: '0.02em',
              color: C.textSecondary,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: R.md,
            }}
          >
            ← THE NEST
          </button>
        </nav>
      ) : (
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
                fontFamily: F.sans,
                fontSize: '12px',
                color: activeNav === item.id ? C.electricBlue : C.textSecondary,
                letterSpacing: '0.02em',
                fontWeight: '500',
              }}>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      )}
      <div style={{ flex: 1 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: F.mono, fontSize: '11px' }}>
        <span style={{ color: C.textSecondary }}>LMP</span>
        <span style={{ fontSize: '15px', fontWeight: '700', color: C.falconGold }}>${lmpValue.toFixed(2)}</span>
        <StatusDot status={isLive ? 'live' : 'stale'} />
        <span style={{ color: isLive ? C.alertNormal : C.alertWarning }}>{isLive ? 'LIVE' : 'STALE'}</span>
      </div>
    </div>
  );
}

type NavState = 'nest' | 'atlas' | 'analytics' | 'vault' | 'lmp' | 'spread' | 'battery' | 'gap' | 'peregrine';

const viewLabels: Record<string, string> = {
  nest: 'THE NEST',
  atlas: 'GRID ATLAS',
  analytics: 'ANALYTICS',
  vault: 'VAULT',
  lmp: 'LMP INTELLIGENCE',
  spread: 'SPARK SPREAD',
  battery: 'BATTERY ARB',
  gap: 'RESOURCE GAP',
  peregrine: 'PEREGRINE INTELLIGENCE',
};

export default function GlobalShell() {
  const [activeNav, setActiveNav] = useState<NavState>('nest');
  const [entryDismissed, setEntryDismissed] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  const kpiPages: NavState[] = ['lmp', 'spread', 'battery', 'gap', 'peregrine'];

  // ESC returns from KPI full page to Nest
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (kpiPages as string[]).includes(activeNav)) {
        setActiveNav('nest');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeNav]);

  const renderContent = () => {
    switch (activeNav) {
      case "nest": return <NestView selectedZone={selectedZone} setSelectedZone={setSelectedZone} onNavigateKPI={(tab) => setActiveNav(tab)} />;
      case "atlas": return <GridAtlasView />;
      case "analytics": return <AnalyticsView />;
      case "vault": return <VaultView />;
      case "lmp": return <LMPFullPage selectedZone={selectedZone} />;
      case "spread": return <SpreadFullPage selectedZone={selectedZone} />;
      case "battery": return <BatteryFullPage selectedZone={selectedZone} />;
      case "gap": return <GapFullPage selectedZone={selectedZone} />;
      case "peregrine": return (
        <PeregrineFullPage
          selectedZone={selectedZone}
          onZoneClick={(zoneId) => { setSelectedZone(zoneId); setActiveNav('nest'); }}
          marketAlerts={
            <PeregrineFeedMarketAlerts onZoneClick={(zoneId) => { setSelectedZone(zoneId); setActiveNav('nest'); }} />
          }
        />
      );
      default: return <NestView selectedZone={selectedZone} setSelectedZone={setSelectedZone} onNavigateKPI={(tab) => setActiveNav(tab)} />;
    }
  };

  return (
    <>
      {!entryDismissed && <EntryOverlay onDismiss={() => setEntryDismissed(true)} />}
      <TopBar activeNav={activeNav} onNavChange={(id) => setActiveNav(id as NavState)} />
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

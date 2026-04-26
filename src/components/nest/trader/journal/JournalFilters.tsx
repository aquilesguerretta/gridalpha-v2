// FORGE — Journal filter bar.
// Stateless: receives current filters and an onChange callback. Date range,
// zone, tag, and stance filters. Tag list is provided by the caller from
// the live entries. Compact, F.mono, all-caps.

import { useEffect, useRef, useState } from 'react';
import { C, F, R, S } from '@/design/tokens';
import type { EntryFilters } from '@/stores/journalStore';
import type { EntryStance } from '@/lib/types/journal';

const PJM_ZONES = [
  'WEST_HUB',
  'EAST_HUB',
  'AEP',
  'PSEG',
  'COMED',
  'RECO',
  'ATSI',
  'BGE',
  'DOM',
  'PEPCO',
  'JCPL',
  'METED',
  'PENELEC',
  'PPL',
  'AECO',
  'DPL',
  'EKPC',
  'OVEC',
  'DAY',
  'DUQ',
];

const STANCES: Array<EntryStance | 'all'> = [
  'all',
  'long',
  'short',
  'flat',
  'observation',
];

type RangeChoice = '7d' | '30d' | '90d' | 'all' | 'custom';

const RANGE_LABEL: Record<RangeChoice, string> = {
  '7d': 'LAST 7 DAYS',
  '30d': 'LAST 30 DAYS',
  '90d': 'LAST 90 DAYS',
  all: 'ALL TIME',
  custom: 'CUSTOM',
};

interface Props {
  filters: EntryFilters;
  onChange: (filters: EntryFilters) => void;
  availableTags: string[];
}

export function JournalFilters({ filters, onChange, availableTags }: Props) {
  const [range, setRange] = useState<RangeChoice>(deriveRangeFromFilters(filters));
  const [zoneOpen, setZoneOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const zoneRef = useRef<HTMLDivElement | null>(null);
  const tagRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (zoneRef.current && !zoneRef.current.contains(e.target as Node)) {
        setZoneOpen(false);
      }
      if (tagRef.current && !tagRef.current.contains(e.target as Node)) {
        setTagOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function applyRange(next: RangeChoice) {
    setRange(next);
    if (next === 'all') {
      const { fromDate: _f, toDate: _t, ...rest } = filters;
      void _f;
      void _t;
      onChange(rest);
      return;
    }
    if (next === 'custom') return;
    const days = next === '7d' ? 7 : next === '30d' ? 30 : 90;
    const fromDate = new Date(Date.now() - days * 86400000)
      .toISOString()
      .slice(0, 10);
    onChange({ ...filters, fromDate, toDate: undefined });
  }

  function toggleZone(z: string) {
    const current = filters.zones ?? [];
    const next = current.includes(z)
      ? current.filter((x) => x !== z)
      : [...current, z];
    onChange({ ...filters, zones: next.length ? next : undefined });
  }

  function toggleTag(t: string) {
    const current = filters.tags ?? [];
    const next = current.includes(t)
      ? current.filter((x) => x !== t)
      : [...current, t];
    onChange({ ...filters, tags: next.length ? next : undefined });
  }

  function setStance(s: EntryStance | 'all') {
    if (s === 'all') {
      const { stance: _s, ...rest } = filters;
      void _s;
      onChange(rest);
    } else {
      onChange({ ...filters, stance: s });
    }
  }

  function clearAll() {
    setRange('all');
    onChange({});
  }

  const zoneCount = filters.zones?.length ?? 0;
  const tagCount = filters.tags?.length ?? 0;
  const hasAnyFilter =
    Boolean(filters.zones?.length) ||
    Boolean(filters.tags?.length) ||
    Boolean(filters.stance) ||
    Boolean(filters.fromDate) ||
    Boolean(filters.toDate);

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: S.sm,
        padding: S.sm,
        background: C.bgElevated,
        border: `1px solid ${C.borderDefault}`,
        borderRadius: R.md,
      }}
    >
      {/* Date range */}
      <select
        value={range}
        onChange={(e) => applyRange(e.target.value as RangeChoice)}
        style={pillStyle()}
      >
        {(Object.keys(RANGE_LABEL) as RangeChoice[]).map((r) => (
          <option key={r} value={r}>
            {RANGE_LABEL[r]}
          </option>
        ))}
      </select>

      {range === 'custom' && (
        <>
          <input
            type="date"
            value={filters.fromDate ?? ''}
            onChange={(e) =>
              onChange({ ...filters, fromDate: e.target.value || undefined })
            }
            style={pillStyle()}
          />
          <span style={{ color: C.textMuted, fontFamily: F.mono, fontSize: 11 }}>
            →
          </span>
          <input
            type="date"
            value={filters.toDate ?? ''}
            onChange={(e) =>
              onChange({ ...filters, toDate: e.target.value || undefined })
            }
            style={pillStyle()}
          />
        </>
      )}

      {/* Zones multi-select */}
      <div ref={zoneRef} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setZoneOpen((v) => !v)}
          style={pillStyle()}
        >
          ZONES{zoneCount > 0 ? ` (${zoneCount})` : ''} ▾
        </button>
        {zoneOpen && (
          <div style={dropdownStyle()}>
            {PJM_ZONES.map((z) => {
              const active = (filters.zones ?? []).includes(z);
              return (
                <button
                  key={z}
                  type="button"
                  onClick={() => toggleZone(z)}
                  style={dropdownItemStyle(active)}
                >
                  {active ? '✓ ' : '  '}
                  {z}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Tags multi-select */}
      <div ref={tagRef} style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setTagOpen((v) => !v)}
          style={pillStyle()}
          disabled={availableTags.length === 0}
        >
          TAGS{tagCount > 0 ? ` (${tagCount})` : ''} ▾
        </button>
        {tagOpen && availableTags.length > 0 && (
          <div style={dropdownStyle()}>
            {availableTags.map((t) => {
              const active = (filters.tags ?? []).includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  style={dropdownItemStyle(active)}
                >
                  {active ? '✓ ' : '  '}#{t}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Stance */}
      <select
        value={filters.stance ?? 'all'}
        onChange={(e) => setStance(e.target.value as EntryStance | 'all')}
        style={pillStyle()}
      >
        {STANCES.map((s) => (
          <option key={s} value={s}>
            {s === 'all' ? 'ALL STANCES' : s.toUpperCase()}
          </option>
        ))}
      </select>

      {hasAnyFilter && (
        <button
          type="button"
          onClick={clearAll}
          style={{
            marginLeft: 'auto',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            fontFamily: F.mono,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: C.alertCritical,
          }}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

function deriveRangeFromFilters(f: EntryFilters): RangeChoice {
  if (!f.fromDate && !f.toDate) return 'all';
  if (f.fromDate && !f.toDate) {
    const days = Math.round(
      (Date.now() - new Date(f.fromDate).getTime()) / 86400000,
    );
    if (Math.abs(days - 7) <= 1) return '7d';
    if (Math.abs(days - 30) <= 1) return '30d';
    if (Math.abs(days - 90) <= 1) return '90d';
  }
  return 'custom';
}

function pillStyle(): React.CSSProperties {
  return {
    background: C.bgSurface,
    border: `1px solid ${C.borderDefault}`,
    borderRadius: R.sm,
    padding: '6px 10px',
    fontFamily: F.mono,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: C.textSecondary,
    cursor: 'pointer',
    outline: 'none',
  };
}

function dropdownStyle(): React.CSSProperties {
  return {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    minWidth: 200,
    maxHeight: 280,
    overflowY: 'auto',
    background: C.bgElevated,
    border: `1px solid ${C.borderStrong}`,
    borderRadius: R.md,
    padding: 4,
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  };
}

function dropdownItemStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? C.electricBlueWash : 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 8px',
    fontFamily: F.mono,
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.10em',
    textTransform: 'uppercase',
    color: active ? C.electricBlueLight : C.textSecondary,
    textAlign: 'left',
    borderRadius: R.sm,
  };
}

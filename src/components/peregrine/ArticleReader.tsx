// src/components/peregrine/ArticleReader.tsx
// Inline article reader with full-text fetch + AI expansion fallback.

import { useState, useEffect } from 'react';
import { C, F, R, S } from '@/design/tokens';
import type { NewsItem } from '@/hooks/useNewsData';
import { getNewsApiBase } from '@/lib/backendBase';

const SOURCE_COLORS: Record<string, string> = {
  EIA: '#10B981', PJM: '#06B6D4', FERC: '#F59E0B',
  BLOOMBERG: '#F59E0B', REUTERS: '#3B82F6',
};

const ENERGY_TYPE_COLORS: Record<string, string> = {
  NATURAL_GAS: C.fuelGas, COAL: C.fuelCoal, NUCLEAR: C.fuelNuclear,
  WIND: C.fuelWind, SOLAR: C.fuelSolar, HYDRO: C.fuelHydro,
  BATTERY: C.fuelBattery, TRANSMISSION: C.electricBlue, ALL: C.electricBlue,
};

interface ArticleReaderProps {
  item:    NewsItem;
  onClose: () => void;
  onAskAI: () => void;
}

interface ArticleParagraph {
  type: 'heading' | 'paragraph' | 'bullet';
  text: string;
}

interface ArticleContent {
  success:    boolean;
  title:      string | null;
  paragraphs: ArticleParagraph[];
  wordCount:  number;
  error:      string | null;
}

const NEWS_API = getNewsApiBase();

const ALLOWED_DOMAINS = [
  'eia.gov', 'pjm.com', 'insidelines.pjm.com',
  'ferc.gov', 'federalregister.gov',
];

const isAllowed = (url: string) =>
  ALLOWED_DOMAINS.some(d => url.includes(d));

// ── AI Article Expansion (fallback) ──────────────────────────────

function AIArticleExpansion({ item }: { item: NewsItem }) {
  const [text,    setText]    = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':                              'application/json',
        'x-api-key':                                 import.meta.env.VITE_ANTHROPIC_API_KEY as string,
        'anthropic-version':                         '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are GridAlpha's energy market intelligence analyst.

Based on this energy news item, write a comprehensive intelligence brief as if you had read the full article. Be specific about market implications, affected zones, price impacts, and actionable insights.

SOURCE: ${item.source}
HEADLINE: ${item.title}
SUMMARY: ${item.summary}
CATEGORY: ${item.category}

Write 4-6 paragraphs covering:
1. What happened and the key facts
2. Why this matters for PJM electricity markets
3. Price and congestion implications
4. Which market participants are affected and how
5. What to watch in coming days`,
        }],
      }),
    })
    .then(r => r.json())
    .then(d => {
      setText(d.content?.[0]?.text ?? 'Unable to generate expansion.');
      setLoading(false);
    })
    .catch(() => {
      setText('Unable to generate expansion.');
      setLoading(false);
    });
  }, [item.title]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <div style={{ fontFamily: F.mono, fontSize: '11px',
      color: C.textMuted, letterSpacing: '0.10em' }}>
      GENERATING INTELLIGENCE BRIEF...
    </div>
  );

  return (
    <div>
      {text.split('\n\n').map((para, i) => (
        <p key={i} style={{
          fontFamily: F.sans, fontSize: '14px',
          color: C.textSecondary, lineHeight: 1.8,
          marginBottom: S.lg,
        }}>{para}</p>
      ))}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────

export default function ArticleReader({ item, onClose, onAskAI }: ArticleReaderProps) {
  const [content,  setContent]  = useState<ArticleContent | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [useAI,    setUseAI]    = useState(false);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  useEffect(() => {
    if (!isAllowed(item.url)) {
      setUseAI(true);
      setLoading(false);
      return;
    }

    fetch(`${NEWS_API}/api/news/article?url=${encodeURIComponent(item.url)}`)
      .then(r => r.json())
      .then((data: ArticleContent) => {
        if (!data.success || !data.paragraphs?.length) {
          setUseAI(true);
        } else {
          setContent(data);
        }
        setLoading(false);
      })
      .catch(() => {
        setUseAI(true);
        setLoading(false);
      });
  }, [item.url]);

  const srcColor = SOURCE_COLORS[item.source] ?? C.textMuted;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(10,10,11,0.92)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
    }}>
      {/* ── Left sidebar ────────────────── */}
      <div style={{
        width: '280px', flexShrink: 0,
        borderRight: `1px solid ${C.borderDefault}`,
        padding: S.xl, overflowY: 'auto',
        background: C.bgElevated,
        display: 'flex', flexDirection: 'column', gap: S.lg,
      }}>
        {/* Source + time */}
        <div style={{ display: 'flex', alignItems: 'center', gap: S.sm }}>
          <span style={{
            padding: '2px 6px',
            background: `${srcColor}18`, border: `1px solid ${srcColor}40`,
            borderRadius: '3px', fontFamily: F.mono, fontSize: '8px',
            fontWeight: '600', color: srcColor, letterSpacing: '0.10em',
          }}>{item.source}</span>
          <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted }}>{item.timeAgo}</span>
        </div>

        {/* Title */}
        <div style={{
          fontFamily: F.sans, fontSize: '16px', fontWeight: '600',
          color: C.textPrimary, lineHeight: 1.4,
        }}>{item.title}</div>

        {/* Energy type chips */}
        {(item.energyTypes ?? []).filter(t => t !== 'GENERAL').length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: S.xs }}>
            {(item.energyTypes ?? []).filter(t => t !== 'GENERAL').map(type => (
              <span key={type} style={{
                padding: '2px 6px',
                background: `${ENERGY_TYPE_COLORS[type] ?? C.textMuted}15`,
                border: `1px solid ${ENERGY_TYPE_COLORS[type] ?? C.textMuted}30`,
                borderRadius: '3px', fontFamily: F.mono, fontSize: '8px',
                color: ENERGY_TYPE_COLORS[type] ?? C.textMuted,
                letterSpacing: '0.08em',
              }}>{type.replace('_', ' ')}</span>
            ))}
          </div>
        )}

        {/* Word count */}
        {content?.wordCount && (
          <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted }}>
            {content.wordCount.toLocaleString()} words · ~{Math.ceil(content.wordCount / 200)} min read
          </div>
        )}

        <div style={{ height: 1, background: C.borderDefault }} />

        {/* Actions */}
        <button onClick={onAskAI} style={{
          width: '100%', padding: '10px 16px',
          background: C.electricBlueWash,
          border: `1px solid ${C.electricBlue}`,
          borderRadius: R.md, color: C.electricBlue,
          fontFamily: F.mono, fontSize: '10px',
          fontWeight: '600', letterSpacing: '0.10em',
          cursor: 'pointer', textAlign: 'left' as const,
        }}>⚡ ASK AI ABOUT THIS</button>

        <button onClick={() => window.open(item.url, '_blank')} style={{
          width: '100%', padding: '10px 16px',
          background: 'transparent',
          border: `1px solid ${C.borderDefault}`,
          borderRadius: R.md, color: C.textMuted,
          fontFamily: F.mono, fontSize: '10px',
          letterSpacing: '0.10em', cursor: 'pointer',
          textAlign: 'left' as const,
        }}>↗ OPEN ORIGINAL SOURCE</button>

        <div style={{ height: 1, background: C.borderDefault }} />

        <button onClick={onClose} style={{
          width: '100%', padding: '8px 12px',
          background: 'transparent',
          border: `1px solid ${C.borderDefault}`,
          borderRadius: R.md, color: C.textMuted,
          fontFamily: F.mono, fontSize: '9px',
          letterSpacing: '0.10em', cursor: 'pointer',
        }}>ESC / CLOSE</button>
      </div>

      {/* ── Right content ───────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', background: C.bgBase }}>

        {/* Loading skeleton */}
        {loading && (
          <div style={{ padding: `${S.xl} ${S.xxl}` }}>
            {[1, 0.9, 1, 0.7, 1, 0.85, 1, 0.6].map((w, i) => (
              <div key={i} style={{
                height: i % 4 === 0 ? '20px' : '14px',
                width: `${w * 100}%`,
                background: C.bgSurface,
                borderRadius: R.sm,
                marginBottom: S.sm,
                animation: 'pulse 1.5s ease-in-out infinite',
                opacity: 0.6,
              }} />
            ))}
          </div>
        )}

        {/* AI fallback */}
        {!loading && useAI && (
          <div style={{ padding: `${S.xl} ${S.xxl}` }}>
            <div style={{
              fontFamily: F.mono, fontSize: '10px',
              color: C.textMuted, letterSpacing: '0.10em',
              marginBottom: S.md,
            }}>FULL TEXT UNAVAILABLE</div>
            <div style={{
              fontFamily: F.sans, fontSize: '13px',
              color: C.textSecondary, lineHeight: 1.6,
              marginBottom: S.xl,
            }}>
              This source does not allow direct content access.
              GridAlpha AI has generated an intelligence brief
              based on the available information.
            </div>
            <AIArticleExpansion item={item} />
          </div>
        )}

        {/* Full article content */}
        {!loading && !useAI && content && (
          <div style={{ padding: `${S.xl} ${S.xxl}` }}>
            <h1 style={{
              fontFamily: F.sans, fontSize: '24px', fontWeight: '700',
              color: C.textPrimary, lineHeight: 1.3, marginBottom: S.xl,
            }}>{content.title ?? item.title}</h1>

            <div style={{
              display: 'flex', alignItems: 'center', gap: S.md,
              marginBottom: S.xl, paddingBottom: S.lg,
              borderBottom: `1px solid ${C.borderDefault}`,
            }}>
              <span style={{
                padding: '2px 8px',
                background: `${srcColor}18`, border: `1px solid ${srcColor}40`,
                borderRadius: '3px', fontFamily: F.mono, fontSize: '9px',
                color: srcColor, fontWeight: '600', letterSpacing: '0.10em',
              }}>{item.source}</span>
              <span style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted }}>{item.timeAgo}</span>
              <span style={{ fontFamily: F.sans, fontSize: '12px', color: C.textMuted }}>
                {content.wordCount
                  ? `${content.wordCount.toLocaleString()} words · ~${Math.ceil(content.wordCount / 200)} min read`
                  : ''}
              </span>
            </div>

            {content.paragraphs.map((p, i) => {
              if (p.type === 'heading') return (
                <h2 key={i} style={{
                  fontFamily: F.sans, fontSize: '18px', fontWeight: '600',
                  color: C.textPrimary, marginTop: S.xxl, marginBottom: S.md,
                  lineHeight: 1.3,
                }}>{p.text}</h2>
              );
              if (p.type === 'bullet') return (
                <div key={i} style={{ display: 'flex', gap: S.md, marginBottom: S.sm }}>
                  <span style={{ color: C.electricBlue, flexShrink: 0, marginTop: '4px' }}>·</span>
                  <p style={{
                    fontFamily: F.sans, fontSize: '15px',
                    color: C.textSecondary, lineHeight: 1.7, margin: 0,
                  }}>{p.text}</p>
                </div>
              );
              return (
                <p key={i} style={{
                  fontFamily: F.sans, fontSize: '15px',
                  color: C.textSecondary, lineHeight: 1.8,
                  marginBottom: S.lg,
                }}>{p.text}</p>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

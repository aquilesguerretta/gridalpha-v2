import React, { useState } from 'react';
import { C, F, R, S } from '@/design/tokens';
import { useNewsData, type NewsItem } from '@/hooks/useNewsData';
import VideoDrawer from './VideoDrawer';
import IntelligenceBrief from './IntelligenceBrief';
import ArticleAnalysis from './ArticleAnalysis';

const SOURCE_COLORS: Record<string, string> = {
  EIA:  '#10B981',
  PJM:  '#06B6D4',
  FERC: '#F59E0B',
};

type NewsSource = 'ALL' | 'EIA' | 'PJM' | 'FERC';
type FeedTab    = 'news' | 'market';

const CATEGORIES = [
  'ALL','CONGESTION','PRICE','GENERATION',
  'DISPATCH','WEATHER','REGULATORY','SYSTEM','VIDEO',
];

interface Props {
  selectedZone:  string | null;
  onZoneClick:   (zoneId: string) => void;
  marketAlerts:  React.ReactNode;
}

export default function PeregrineFullPage({
  selectedZone, onZoneClick, marketAlerts,
}: Props) {
  void selectedZone; void onZoneClick;
  const [feedTab,        setFeedTab]        = useState<FeedTab>('news');
  const [newsSource,     setNewsSource]     = useState<NewsSource>('ALL');
  const [catFilter,      setCatFilter]      = useState('ALL');
  const [videoItem,      setVideoItem]      = useState<NewsItem | null>(null);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [showBrief,      setShowBrief]      = useState(false);
  const [activeArticle,  setActiveArticle]  = useState<NewsItem | null>(null);

  const { items: liveNews, loading, error, lastFetch, refetch } =
    useNewsData(newsSource === 'ALL' ? undefined : newsSource);

  const filtered = liveNews.filter(item => {
    const matchSearch = !searchQuery
      || item.title.toLowerCase().includes(searchQuery.toLowerCase())
      || item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = catFilter === 'ALL'
      || (catFilter === 'VIDEO' ? item.videoId !== null : item.category === catFilter);
    return matchSearch && matchCat;
  });

  return (
    <div style={{
      height: 'calc(100vh - 64px)', width: '100%',
      background: C.bgBase, display: 'flex',
      flexDirection: 'column', overflow: 'hidden',
    }}>

      {/* Page header */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        padding: `${S.lg} ${S.xl}`, flexShrink: 0,
        borderBottom: `1px solid ${C.borderDefault}`,
        background: C.bgElevated,
      }}>
        <div>
          <div style={{ fontFamily: F.mono, fontSize: '13px',
            fontWeight: '600', color: C.textPrimary,
            letterSpacing: '0.08em', marginBottom: S.xs }}>
            PEREGRINE INTELLIGENCE
          </div>
          <div style={{ fontFamily: "'Geist', sans-serif",
            fontSize: '12px', color: C.textMuted }}>
            Live market alerts · Official energy intelligence · PJM / EIA / FERC
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: S.lg }}>
          <input
            type="text"
            placeholder="SEARCH INTELLIGENCE..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '240px', background: C.bgSurface,
              border: `1px solid ${C.borderDefault}`,
              borderRadius: R.md, color: C.textPrimary,
              fontFamily: F.mono, fontSize: '11px',
              padding: '7px 12px', outline: 'none',
              letterSpacing: '0.06em',
            }}
          />
          <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted }}>
            {loading ? 'FETCHING...'
             : error ? 'ERROR'
             : lastFetch
               ? `UPDATED ${lastFetch.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
               : ''}
          </span>
          <button onClick={() => setShowBrief(true)} style={{
            background: C.electricBlueWash,
            border: `1px solid ${C.electricBlue}`,
            borderRadius: R.md, color: C.electricBlue,
            fontFamily: F.mono, fontSize: '10px', fontWeight: '600',
            padding: '6px 14px', cursor: 'pointer',
            letterSpacing: '0.10em',
            transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
          }}>⚡ GENERATE REPORT</button>
          <button onClick={refetch} style={{
            background: 'transparent',
            border: `1px solid ${C.borderDefault}`,
            borderRadius: R.md, color: C.textSecondary,
            fontFamily: F.mono, fontSize: '10px',
            padding: '6px 12px', cursor: 'pointer',
            letterSpacing: '0.08em',
          }}>↻ REFRESH</button>
        </div>
      </div>

      {/* Feed tabs */}
      <div style={{
        display: 'flex', flexShrink: 0,
        borderBottom: `1px solid ${C.borderDefault}`,
        background: C.bgElevated, paddingLeft: S.xl,
      }}>
        {([
          { id: 'news',   label: 'ENERGY INTELLIGENCE', count: filtered.length },
          { id: 'market', label: 'MARKET ALERTS',        count: 7 },
        ] as const).map(tab => (
          <button key={tab.id}
            onClick={() => setFeedTab(tab.id)}
            style={{
              padding: `${S.md} ${S.xl}`,
              background: 'transparent', border: 'none',
              borderBottom: feedTab === tab.id
                ? `2px solid ${C.electricBlue}`
                : '2px solid transparent',
              color: feedTab === tab.id ? C.electricBlue : C.textMuted,
              fontFamily: F.mono, fontSize: '10px',
              fontWeight: '500', letterSpacing: '0.10em',
              textTransform: 'uppercase' as const,
              cursor: 'pointer',
              transition: 'all 150ms cubic-bezier(0.4,0,0.2,1)',
            }}>
            {tab.label}
            <span style={{ marginLeft: 8, opacity: 0.6 }}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', overflow: 'hidden' }}>

        {feedTab === 'news' && (
          <>
            {/* Source + category sidebar */}
            <div style={{
              width: '200px', flexShrink: 0,
              borderRight: `1px solid ${C.borderDefault}`,
              padding: `${S.lg} 0`, overflowY: 'auto',
            }}>
              <div style={{ fontFamily: F.mono, fontSize: '9px',
                color: C.textMuted, letterSpacing: '0.12em',
                padding: `0 ${S.lg}`, marginBottom: S.md }}>
                SOURCE
              </div>
              {(['ALL','EIA','PJM','FERC'] as NewsSource[]).map(src => {
                const count = src === 'ALL'
                  ? liveNews.length
                  : liveNews.filter(i => i.source === src).length;
                return (
                  <button key={src}
                    onClick={() => setNewsSource(src)}
                    style={{
                      display: 'flex', alignItems: 'center',
                      gap: S.sm, width: '100%',
                      padding: `${S.sm} ${S.lg}`,
                      background: newsSource === src
                        ? 'rgba(255,255,255,0.05)' : 'transparent',
                      border: 'none',
                      borderLeft: newsSource === src
                        ? `2px solid ${SOURCE_COLORS[src] ?? C.electricBlue}`
                        : '2px solid transparent',
                      cursor: 'pointer',
                      textAlign: 'left' as const,
                    }}>
                    {src !== 'ALL' && (
                      <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: SOURCE_COLORS[src], flexShrink: 0,
                      }} />
                    )}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: F.mono, fontSize: '11px',
                        color: newsSource === src ? C.textPrimary : C.textSecondary,
                        fontWeight: newsSource === src ? '600' : '400' }}>
                        {src === 'ALL' ? 'All Sources' : src}
                      </div>
                      {src !== 'ALL' && (
                        <div style={{ fontFamily: "'Geist', sans-serif",
                          fontSize: '10px', color: C.textMuted, marginTop: 2 }}>
                          {src === 'EIA' ? 'Energy data & analysis'
                           : src === 'PJM' ? 'Grid operator notices'
                           : 'Regulatory orders'}
                        </div>
                      )}
                    </div>
                    <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted }}>{count}</span>
                  </button>
                );
              })}

              <div style={{ height: 1, background: C.borderDefault, margin: `${S.lg} 0` }} />

              <div style={{ fontFamily: F.mono, fontSize: '9px',
                color: C.textMuted, letterSpacing: '0.12em',
                padding: `0 ${S.lg}`, marginBottom: S.md }}>
                CATEGORY
              </div>
              {CATEGORIES.map(cat => (
                <button key={cat}
                  onClick={() => setCatFilter(cat)}
                  style={{
                    display: 'block', width: '100%',
                    padding: `${S.xs} ${S.lg}`,
                    background: 'transparent', border: 'none',
                    cursor: 'pointer', textAlign: 'left' as const,
                    fontFamily: F.mono, fontSize: '10px',
                    color: catFilter === cat ? C.textPrimary : C.textMuted,
                    fontWeight: catFilter === cat ? '600' : '400',
                  }}>
                  {cat}
                </button>
              ))}
            </div>

            {/* News list */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {loading && (
                <div style={{ padding: S.xl, textAlign: 'center' as const }}>
                  <div style={{ fontFamily: F.mono, fontSize: '11px',
                    color: C.textMuted, letterSpacing: '0.12em' }}>
                    FETCHING INTELLIGENCE...
                  </div>
                </div>
              )}

              {error && !loading && (
                <div style={{ padding: S.xl }}>
                  <div style={{ fontFamily: F.mono, fontSize: '11px',
                    color: C.alertCritical, marginBottom: S.sm }}>
                    FEED UNAVAILABLE — {error}
                  </div>
                  <div style={{ fontFamily: "'Geist', sans-serif",
                    fontSize: '12px', color: C.textMuted }}>
                    Backend deploying or unreachable. Check Railway status.
                  </div>
                </div>
              )}

              {!loading && filtered.map((item, idx) => (
                <div key={`${item.id}-${idx}`}
                  onClick={() => item.videoId
                    ? setVideoItem(item)
                    : window.open(item.url, '_blank')}
                  style={{
                    display: 'flex', gap: S.xl,
                    padding: `${S.lg} ${S.xl}`,
                    borderBottom: `1px solid ${C.borderDefault}`,
                    cursor: 'pointer',
                    transition: 'background 120ms ease',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(255,255,255,0.025)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                >
                  {/* Timestamp + source */}
                  <div style={{ width: '80px', flexShrink: 0 }}>
                    <div style={{ fontFamily: F.mono, fontSize: '10px',
                      color: C.textMuted, marginBottom: S.xs,
                      fontVariantNumeric: 'tabular-nums' }}>
                      {item.timeAgo}
                    </div>
                    <div style={{
                      display: 'inline-block', padding: '2px 6px',
                      background: `${SOURCE_COLORS[item.source] ?? C.textMuted}18`,
                      border: `1px solid ${SOURCE_COLORS[item.source] ?? C.textMuted}40`,
                      borderRadius: '3px', fontFamily: F.mono, fontSize: '8px',
                      fontWeight: '600', color: SOURCE_COLORS[item.source] ?? C.textMuted,
                      letterSpacing: '0.10em',
                    }}>
                      {item.source}
                    </div>
                    {item.videoId && (
                      <div style={{ marginTop: S.xs, fontFamily: F.mono,
                        fontSize: '8px', color: C.alertCritical,
                        letterSpacing: '0.08em' }}>
                        ▶ VIDEO
                      </div>
                    )}
                  </div>

                  {/* Headline + summary + category */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Geist', sans-serif",
                      fontSize: '14px', fontWeight: '500',
                      color: C.textPrimary, lineHeight: 1.4,
                      marginBottom: S.xs }}>
                      {item.title}
                    </div>
                    {item.summary && (
                      <div style={{ fontFamily: "'Geist', sans-serif",
                        fontSize: '12px', color: C.textSecondary,
                        lineHeight: 1.6, marginBottom: S.sm }}>
                        {item.summary}
                      </div>
                    )}
                    <span style={{
                      padding: '1px 5px',
                      background: `${C.electricBlue}12`,
                      border: `1px solid ${C.electricBlue}30`,
                      borderRadius: '3px', fontFamily: F.mono,
                      fontSize: '8px', color: C.electricBlue,
                      letterSpacing: '0.08em',
                    }}>
                      {item.category}
                    </span>
                    {item.videoId && (
                      <span style={{
                        padding: '2px 6px', background: 'rgba(239,68,68,0.15)',
                        border: '1px solid rgba(239,68,68,0.40)', borderRadius: '3px',
                        fontFamily: F.mono, fontSize: '8px', fontWeight: '600',
                        color: C.alertCritical, letterSpacing: '0.10em', marginLeft: S.xs,
                      }}>▶ VIDEO</span>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setActiveArticle(item); }}
                      style={{
                        marginLeft: S.sm, padding: '3px 10px', background: 'transparent',
                        border: `1px solid ${C.borderDefault}`, borderRadius: R.sm,
                        color: C.textMuted, fontFamily: F.mono, fontSize: '9px', fontWeight: '500',
                        letterSpacing: '0.10em', cursor: 'pointer', transition: 'all 120ms ease',
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.electricBlue; (e.currentTarget as HTMLButtonElement).style.color = C.electricBlue; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.borderDefault; (e.currentTarget as HTMLButtonElement).style.color = C.textMuted; }}
                    >⚡ ASK AI</button>
                  </div>

                  {/* Thumbnail */}
                  <div style={{
                    width: '80px', height: '54px', flexShrink: 0,
                    borderRadius: R.sm, border: `1px solid ${C.borderDefault}`,
                    overflow: 'hidden', background: C.bgSurface,
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center', alignSelf: 'flex-start',
                    position: 'relative' as const,
                  }}>
                    {item.thumbnail
                      ? <img src={item.thumbnail} alt=""
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: '22px', opacity: 0.3 }}>
                          {item.source === 'PJM' ? '⚡' : item.source === 'EIA' ? '🔋' : item.source === 'FERC' ? '⚖️' : '📡'}
                        </span>
                    }
                    {item.videoId && (
                      <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: '20px' }}>▶</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              <div style={{ padding: `${S.sm} ${S.xl}`, opacity: 0.4 }}>
                <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted }}>
                  LIVE · Auto-refreshes every 5 minutes
                </span>
              </div>
            </div>
          </>
        )}

        {feedTab === 'market' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {marketAlerts}
          </div>
        )}
      </div>

      {videoItem?.videoId && (
        <VideoDrawer
          videoId={videoItem.videoId}
          title={videoItem.title}
          source={videoItem.source}
          onClose={() => setVideoItem(null)}
        />
      )}

      {showBrief && (
        <IntelligenceBrief
          newsItems={filtered}
          selectedZone={selectedZone}
          onClose={() => setShowBrief(false)}
        />
      )}

      {activeArticle && (
        <ArticleAnalysis
          item={activeArticle}
          onClose={() => setActiveArticle(null)}
        />
      )}
    </div>
  );
}

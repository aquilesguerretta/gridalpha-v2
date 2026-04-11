import { useState, useEffect } from 'react';
import { C, F, R, S } from '@/design/tokens';
import type { NewsItem } from '@/hooks/useNewsData';

type BriefState = 'config' | 'loading' | 'report';

interface IntelligenceBriefProps {
  newsItems:    NewsItem[];
  selectedZone: string | null;
  onClose:      () => void;
}

const SOURCE_OPTIONS = ['ALL', 'EIA', 'PJM', 'FERC', 'BLOOMBERG', 'S&P'];
const FOCUS_OPTIONS  = ['ALL', 'PRICE & LMP', 'CONGESTION', 'GENERATION', 'CAPACITY', 'REGULATORY'];
const ROLE_OPTIONS   = ['POWER TRADER', 'ASSET MANAGER', 'ANALYST', 'STUDENT'] as const;

export default function IntelligenceBrief({ newsItems, selectedZone, onClose }: IntelligenceBriefProps) {
  const [briefState, setBriefState]       = useState<BriefState>('config');
  const [briefContent, setBriefContent]   = useState('');
  const [selectedSources, setSelectedSources]     = useState<string[]>(['ALL']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['ALL']);
  const [userRole, setUserRole]           = useState('ANALYST');
  const [customQuestion, setCustomQuestion] = useState('');
  const [generatedAt, setGeneratedAt]     = useState<Date | null>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const toggleChip = (list: string[], setList: (v: string[]) => void, value: string) => {
    if (value === 'ALL') { setList(['ALL']); return; }
    const without = list.filter(v => v !== 'ALL');
    const next = without.includes(value) ? without.filter(v => v !== value) : [...without, value];
    setList(next.length === 0 ? ['ALL'] : next);
  };

  const filteredItems = newsItems
    .filter(item => selectedSources.includes('ALL') || selectedSources.includes(item.source))
    .filter(item => selectedCategories.includes('ALL') || selectedCategories.includes(item.category))
    .slice(0, 20);

  const generateBrief = async () => {
    setBriefState('loading');
    const newsContext = filteredItems
      .map((item, i) => `[${i + 1}] ${item.source} — ${item.title}\n${item.summary}`)
      .join('\n\n');

    const systemPrompt = `You are GridAlpha's AI market intelligence analyst. You analyze PJM electricity market news and generate structured intelligence briefs for energy professionals. Be specific, data-driven, and actionable. Always reference specific zones, prices, and time windows when relevant. Format your response in the exact structure requested.`;

    const roleSection = userRole === 'POWER TRADER' ? 'TRADING SIGNALS'
      : userRole === 'ASSET MANAGER' ? 'ASSET OPTIMIZATION'
      : userRole === 'STUDENT' ? 'LEARNING INSIGHTS' : 'ANALYTICAL TAKEAWAYS';

    const userPrompt = `Generate an intelligence brief for a ${userRole}.

CURRENT MARKET CONTEXT:
- Selected zone: ${selectedZone ?? 'PJM System (all zones)'}
- Market regime: NORMAL

TODAY'S ENERGY NEWS (${filteredItems.length} items):
${newsContext}

${customQuestion ? `USER QUESTION: ${customQuestion}` : ''}

Generate a structured intelligence brief with these exact sections:

## EXECUTIVE SUMMARY
2-3 sentences. The single most important market development right now and its immediate price implication.

## KEY DEVELOPMENTS
3-5 bullet points. Each bullet: [SOURCE] What happened → Market impact → Affected zones (if applicable)

## PRICE IMPLICATIONS
How today's news affects: LMP levels, congestion components, spark spread. Be specific about direction and magnitude where possible.

## ${roleSection}
3-4 specific, actionable points for a ${userRole}.

## ZONES TO WATCH
List 2-4 PJM zones most affected by today's news. One sentence each.

## RISK FACTORS
2-3 factors to monitor in the next 6-24 hours.`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });
      const data = await response.json();
      const text = data.content?.[0]?.text ?? data.error?.message ?? 'Failed to generate brief. The API may require authentication — contact your administrator.';
      setBriefContent(text);
      setGeneratedAt(new Date());
      setBriefState('report');
    } catch (err) {
      setBriefContent(`Failed to generate brief: ${err instanceof Error ? err.message : 'Unknown error'}. Please try again.`);
      setBriefState('report');
    }
  };

  const chipStyle = (active: boolean, color?: string): React.CSSProperties => ({
    padding: '4px 10px',
    background: active ? `${color ?? C.electricBlue}18` : 'transparent',
    border: `1px solid ${active ? (color ?? C.electricBlue) : C.borderDefault}`,
    borderRadius: R.sm,
    color: active ? (color ?? C.electricBlue) : C.textMuted,
    fontFamily: F.mono, fontSize: '9px', fontWeight: '500',
    letterSpacing: '0.10em', textTransform: 'uppercase' as const,
    cursor: 'pointer', transition: 'all 120ms ease',
  });

  const parseSections = (md: string) => {
    const parts = md.split(/^## /m).filter(Boolean);
    return parts.map(part => {
      const [title, ...body] = part.split('\n');
      return { title: title.trim(), content: body.join('\n').trim() };
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(10,10,11,0.92)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

      {/* CONFIG STATE */}
      {briefState === 'config' && (
        <div style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', background: C.bgElevated, border: `1px solid ${C.borderDefault}`, borderRadius: R.lg, padding: S.xl }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.xl }}>
            <span style={{ fontFamily: F.mono, fontSize: '11px', fontWeight: '600', color: C.textPrimary, letterSpacing: '0.12em' }}>INTELLIGENCE BRIEF GENERATOR</span>
            <button onClick={onClose} style={{ background: 'transparent', border: `1px solid ${C.borderDefault}`, borderRadius: R.md, color: C.textSecondary, fontFamily: F.mono, fontSize: '10px', padding: '4px 12px', cursor: 'pointer', letterSpacing: '0.08em' }}>× CLOSE</button>
          </div>

          {/* Section 1: Sources */}
          <div style={{ marginBottom: S.xl }}>
            <div style={{ fontFamily: F.mono, fontSize: '9px', color: C.textMuted, letterSpacing: '0.12em', marginBottom: S.md }}>INCLUDE NEWS FROM</div>
            <div style={{ display: 'flex', gap: S.xs, flexWrap: 'wrap' as const }}>
              {SOURCE_OPTIONS.map(src => (
                <button key={src} onClick={() => toggleChip(selectedSources, setSelectedSources, src)} style={chipStyle(selectedSources.includes(src) || (src === 'ALL' && selectedSources.includes('ALL')))}>{src}</button>
              ))}
            </div>
          </div>

          {/* Section 2: Focus Area */}
          <div style={{ marginBottom: S.xl }}>
            <div style={{ fontFamily: F.mono, fontSize: '9px', color: C.textMuted, letterSpacing: '0.12em', marginBottom: S.md }}>FOCUS AREA</div>
            <div style={{ display: 'flex', gap: S.xs, flexWrap: 'wrap' as const }}>
              {FOCUS_OPTIONS.map(cat => (
                <button key={cat} onClick={() => toggleChip(selectedCategories, setSelectedCategories, cat)} style={chipStyle(selectedCategories.includes(cat) || (cat === 'ALL' && selectedCategories.includes('ALL')))}>{cat}</button>
              ))}
            </div>
          </div>

          {/* Section 3: Role */}
          <div style={{ marginBottom: S.xl }}>
            <div style={{ fontFamily: F.mono, fontSize: '9px', color: C.textMuted, letterSpacing: '0.12em', marginBottom: S.md }}>I AM A</div>
            <div style={{ display: 'flex', gap: S.sm }}>
              {ROLE_OPTIONS.map(role => (
                <button key={role} onClick={() => setUserRole(role)} style={{
                  flex: 1, padding: `${S.sm} ${S.md}`,
                  background: userRole === role ? C.electricBlueWash : 'transparent',
                  border: `1px solid ${userRole === role ? C.electricBlue : C.borderDefault}`,
                  borderRadius: R.md, color: userRole === role ? C.electricBlue : C.textMuted,
                  fontFamily: F.mono, fontSize: '9px', fontWeight: userRole === role ? '600' : '400',
                  letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 120ms ease',
                }}>{role}</button>
              ))}
            </div>
          </div>

          {/* Section 4: Custom Question */}
          <div style={{ marginBottom: S.xl }}>
            <div style={{ fontFamily: F.mono, fontSize: '9px', color: C.textMuted, letterSpacing: '0.12em', marginBottom: S.md }}>CUSTOM QUESTION (OPTIONAL)</div>
            <textarea value={customQuestion} onChange={e => setCustomQuestion(e.target.value)} placeholder="e.g. What does this mean for battery arbitrage positions in PSEG?" rows={3} style={{
              width: '100%', background: C.bgSurface, border: `1px solid ${C.borderDefault}`, borderRadius: R.md,
              color: C.textPrimary, fontFamily: F.mono, fontSize: '12px', padding: '8px 12px', outline: 'none',
              resize: 'none', boxSizing: 'border-box' as const,
            }} />
          </div>

          {/* Section 5: Generate */}
          <button onClick={generateBrief} style={{
            width: '100%', height: '48px', background: C.electricBlue, border: 'none', borderRadius: R.md,
            color: '#0C0D10', fontFamily: F.mono, fontSize: '11px', fontWeight: '600',
            letterSpacing: '0.12em', cursor: 'pointer', marginBottom: S.sm,
          }}>⚡ GENERATE INTELLIGENCE BRIEF</button>
          <div style={{ textAlign: 'center' as const, fontFamily: F.mono, fontSize: '10px', color: C.textMuted }}>
            Analyzing {filteredItems.length} news items
          </div>
        </div>
      )}

      {/* LOADING STATE */}
      {briefState === 'loading' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: S.xl }}>
          <div style={{ width: '48px', height: '48px', border: `2px solid ${C.borderDefault}`, borderTop: `2px solid ${C.electricBlue}`, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ fontFamily: F.mono, fontSize: '11px', color: C.textMuted, letterSpacing: '0.12em' }}>ANALYZING {filteredItems.length} INTELLIGENCE ITEMS...</div>
        </div>
      )}

      {/* REPORT STATE */}
      {briefState === 'report' && (
        <div style={{ width: '100%', height: '100%', display: 'flex', overflow: 'hidden' }}>
          {/* Left sidebar */}
          <div style={{ width: '260px', flexShrink: 0, borderRight: `1px solid ${C.borderDefault}`, padding: S.xl, overflowY: 'auto', background: C.bgElevated }}>
            <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, letterSpacing: '0.12em', marginBottom: S.xl }}>INTELLIGENCE BRIEF</div>
            {generatedAt && (
              <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted, marginBottom: S.sm }}>
                Generated: {generatedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.textSecondary, marginBottom: S.sm }}>Role: {userRole}</div>
            <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.textSecondary, marginBottom: S.lg }}>Items analyzed: {filteredItems.length}</div>

            <div style={{ display: 'flex', gap: S.xs, flexWrap: 'wrap' as const, marginBottom: S.xl }}>
              {(selectedSources.includes('ALL') ? ['ALL'] : selectedSources).map(s => (
                <span key={s} style={{ padding: '2px 6px', background: `${C.electricBlue}15`, border: `1px solid ${C.electricBlue}30`, borderRadius: '3px', fontFamily: F.mono, fontSize: '8px', color: C.electricBlue }}>{s}</span>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: S.sm }}>
              <button onClick={generateBrief} style={{ width: '100%', padding: '8px 12px', background: C.electricBlueWash, border: `1px solid ${C.electricBlue}`, borderRadius: R.md, color: C.electricBlue, fontFamily: F.mono, fontSize: '9px', fontWeight: '600', letterSpacing: '0.10em', cursor: 'pointer' }}>↻ REGENERATE</button>
              <button onClick={() => { navigator.clipboard.writeText(briefContent); }} style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: `1px solid ${C.borderDefault}`, borderRadius: R.md, color: C.textSecondary, fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.10em', cursor: 'pointer' }}>COPY REPORT</button>
              <button onClick={() => { setBriefState('config'); setBriefContent(''); }} style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: `1px solid ${C.borderDefault}`, borderRadius: R.md, color: C.textSecondary, fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.10em', cursor: 'pointer' }}>NEW BRIEF</button>
              <button onClick={onClose} style={{ width: '100%', padding: '8px 12px', background: 'transparent', border: `1px solid ${C.borderDefault}`, borderRadius: R.md, color: C.textMuted, fontFamily: F.mono, fontSize: '9px', letterSpacing: '0.10em', cursor: 'pointer' }}>CLOSE</button>
            </div>
          </div>

          {/* Right: report content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: `${S.xl} ${S.xl}`, background: C.bgBase }}>
            {parseSections(briefContent).map((section, i) => (
              <div key={i} style={{ marginBottom: S.xl }}>
                <div style={{ fontFamily: F.mono, fontSize: '10px', color: C.electricBlue, letterSpacing: '0.12em', textTransform: 'uppercase' as const, marginBottom: S.md, borderBottom: `1px solid ${C.borderDefault}`, paddingBottom: S.sm }}>{section.title}</div>
                <div style={{ fontFamily: "'Geist', sans-serif", fontSize: '13px', color: C.textSecondary, lineHeight: 1.7 }}>
                  {section.content.split('\n').map((line, j) => {
                    const trimmed = line.trim();
                    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
                      return (
                        <div key={j} style={{ display: 'flex', gap: S.sm, marginBottom: S.xs, paddingLeft: S.sm }}>
                          <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.electricBlue, flexShrink: 0, marginTop: '8px' }} />
                          <span>{trimmed.slice(2)}</span>
                        </div>
                      );
                    }
                    if (trimmed === '') return <div key={j} style={{ height: S.sm }} />;
                    return <p key={j} style={{ margin: `0 0 ${S.xs} 0` }}>{trimmed}</p>;
                  })}
                </div>
              </div>
            ))}
            {/* Raw fallback if no sections parsed */}
            {parseSections(briefContent).length === 0 && (
              <div style={{ fontFamily: "'Geist', sans-serif", fontSize: '13px', color: C.textSecondary, lineHeight: 1.7, whiteSpace: 'pre-wrap' as const }}>{briefContent}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

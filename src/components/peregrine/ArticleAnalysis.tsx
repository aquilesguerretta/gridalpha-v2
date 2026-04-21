import { useState, useEffect, useRef } from 'react';
import { C, F, R, S } from '@/design/tokens';
import type { NewsItem } from '@/hooks/useNewsData';
import { getBackendBase } from '@/lib/backendBase';

interface ArticleAnalysisProps {
  item:    NewsItem;
  onClose: () => void;
}

interface Message {
  role:    'user' | 'assistant';
  content: string;
}

const SUGGESTED_QUESTIONS = [
  'What does this mean for LMP prices?',
  'Which PJM zones are most affected?',
  'What should a power trader do with this?',
];

const AI_API = getBackendBase();

export default function ArticleAnalysis({ item, onClose }: ArticleAnalysisProps) {
  const [messages, setMessages]         = useState<Message[]>([]);
  const [input, setInput]               = useState('');
  const [loading, setLoading]           = useState(false);
  const [autoAnalyzed, setAutoAnalyzed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  const generateAnalysis = async (userMessage: string) => {
    if (loading) return;
    const newUserMessage: Message = { role: 'user', content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setLoading(true);

    const systemPrompt = `You are GridAlpha's AI market intelligence analyst specializing in PJM electricity markets. You analyze energy news and answer questions from energy professionals.

Be specific and data-driven. Reference zones, prices, and timeframes. Keep responses concise — 2-4 paragraphs maximum unless more detail is requested. Use energy industry terminology correctly.

Article being discussed:
SOURCE: ${item.source}
HEADLINE: ${item.title}
SUMMARY: ${item.summary}
CATEGORY: ${item.category}
PUBLISHED: ${item.timeAgo}`;

    const conversationHistory = [...messages, newUserMessage].map(m => ({ role: m.role, content: m.content }));

    try {
      const response = await fetch(`${AI_API}/api/ai/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: conversationHistory,
        }),
      });
      const data = await response.json();
      const text = data.content?.[0]?.text ?? data.error?.message ?? 'Unable to generate analysis. The API may require authentication.';
      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}. Check your connection and try again.` }]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-analyze on mount
  useEffect(() => {
    if (!autoAnalyzed) {
      setAutoAnalyzed(true);
      generateAnalysis('Analyze this news item for a PJM energy market professional. What happened, why it matters for electricity prices, and what action should be considered?');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    generateAnalysis(trimmed);
  };

  const SOURCE_COLORS: Record<string, string> = { EIA: '#10B981', PJM: '#06B6D4', FERC: '#F59E0B' };
  const srcColor = SOURCE_COLORS[item.source] ?? C.textMuted;

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 300, backdropFilter: 'blur(4px)' }} />
      <div style={{
        position: 'fixed', top: 64, right: 0, bottom: 0, width: '480px', zIndex: 301,
        background: C.bgOverlay, borderLeft: `1px solid ${C.borderDefault}`,
        display: 'flex', flexDirection: 'column',
        animation: 'drawerIn 200ms cubic-bezier(0.16,1,0.30,1) forwards',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${S.md} ${S.xl}`, flexShrink: 0, borderBottom: `1px solid ${C.borderDefault}` }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: S.sm, marginBottom: S.xs }}>
              <span style={{ padding: '2px 6px', background: `${srcColor}18`, border: `1px solid ${srcColor}40`, borderRadius: '3px', fontFamily: F.mono, fontSize: '8px', fontWeight: '600', color: srcColor, letterSpacing: '0.10em' }}>{item.source}</span>
              <span style={{ fontFamily: F.mono, fontSize: '10px', color: C.textMuted }}>{item.timeAgo}</span>
            </div>
            <div style={{ fontFamily: F.sans, fontSize: '12px', fontWeight: '500', color: C.textPrimary, lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{item.title}</div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: `1px solid ${C.borderDefault}`, borderRadius: R.md, color: C.textSecondary, fontFamily: F.mono, fontSize: '10px', padding: '6px 12px', cursor: 'pointer', flexShrink: 0, marginLeft: S.lg, letterSpacing: '0.08em' }}>ESC</button>
        </div>

        {/* Article context */}
        <div style={{ flexShrink: 0, padding: `${S.sm} ${S.xl}`, background: C.bgSurface, borderBottom: `1px solid ${C.borderDefault}` }}>
          <div style={{ fontFamily: F.sans, fontSize: '11px', color: C.textMuted, lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{item.summary}</div>
        </div>

        {/* Suggested questions */}
        <div style={{ display: 'flex', gap: S.xs, padding: `${S.xs} ${S.xl}`, overflowX: 'auto', flexShrink: 0, borderBottom: `1px solid ${C.borderDefault}` }}>
          {SUGGESTED_QUESTIONS.map(q => (
            <button key={q} onClick={() => generateAnalysis(q)} disabled={loading} style={{
              padding: '4px 10px', background: C.bgSurface, border: `1px solid ${C.borderDefault}`,
              borderRadius: R.sm, color: C.textSecondary, fontFamily: F.sans, fontSize: '11px',
              whiteSpace: 'nowrap' as const, cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.5 : 1, flexShrink: 0,
            }}>{q}</button>
          ))}
        </div>

        {/* Message thread */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: `${S.lg} ${S.xl}`, display: 'flex', flexDirection: 'column', gap: S.md }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: msg.role === 'user' ? '85%' : '92%',
                padding: `${S.sm} ${S.lg}`,
                background: msg.role === 'user' ? C.electricBlueWash : C.bgSurface,
                border: msg.role === 'user' ? '1px solid rgba(6,182,212,0.20)' : `1px solid ${C.borderDefault}`,
                borderLeft: msg.role === 'assistant' ? `2px solid ${C.electricBlue}` : undefined,
                borderRadius: msg.role === 'user' ? `${R.lg} ${R.sm} ${R.lg} ${R.lg}` : `${R.sm} ${R.lg} ${R.lg} ${R.lg}`,
                fontFamily: F.sans, fontSize: '12px',
                color: msg.role === 'user' ? C.textPrimary : C.textSecondary,
                lineHeight: 1.6, whiteSpace: 'pre-wrap' as const,
              }}>{msg.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: 'flex', gap: 4, padding: `${S.sm} ${S.lg}` }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: C.electricBlue, animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`, opacity: 0.7 }} />
              ))}
            </div>
          )}
        </div>

        {/* Input area */}
        <div style={{ flexShrink: 0, borderTop: `1px solid ${C.borderDefault}`, padding: `${S.sm} ${S.lg}`, display: 'flex', gap: S.sm }}>
          <textarea
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleSubmit(); }}
            placeholder="Ask about this article..."
            rows={1}
            style={{
              flex: 1, minHeight: '36px', maxHeight: '120px',
              background: C.bgSurface, border: `1px solid ${C.borderDefault}`, borderRadius: R.md,
              color: C.textPrimary, fontFamily: F.mono, fontSize: '11px',
              padding: '8px 12px', resize: 'none', outline: 'none',
              boxSizing: 'border-box' as const,
            }}
          />
          <button onClick={handleSubmit} disabled={!input.trim() || loading} style={{
            width: '40px', height: '36px',
            background: input.trim() ? C.electricBlue : C.bgSurface,
            border: 'none', borderRadius: R.md,
            color: input.trim() ? '#0C0D10' : C.textMuted,
            cursor: input.trim() && !loading ? 'pointer' : 'default',
            fontFamily: F.mono, fontSize: '14px', flexShrink: 0,
          }}>→</button>
        </div>
      </div>
    </>
  );
}

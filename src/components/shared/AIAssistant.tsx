import { useEffect, useRef, useState } from 'react';
import { C, F, R, S } from '@/design/tokens';
import { useUIStore } from '@/stores/uiStore';
import { StatusDot } from '@/components/terminal/StatusDot';
import { useAIChat } from '@/hooks/useAIChat';
import { useAIContextSnapshot } from '@/hooks/useAIContextSnapshot';
import { isApiKeyConfigured } from '@/services/anthropic';
import { useConversationStore } from '@/stores/conversationStore';
import {
  CONTEXTUAL_PROMPT_LABELS,
  CONTEXTUAL_PROMPTS,
  QUICK_ACTION_CHIP_IDS,
  type ContextualPromptId,
} from '@/lib/prompts/contextualPrompts';

// ORACLE shared — floating AI Assistant chat panel.
// Bottom-right, 360×480, zIndex 9000. Streams real Claude responses via
// useAIChat. Conversation persists in sessionStorage.

const CARET_KEYFRAMES_ID = 'oracle-ai-caret-keyframes';
const CARET_KEYFRAMES_CSS =
  '@keyframes oracle-ai-caret-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0; } }';

export function AIAssistant() {
  const open = useUIStore((s) => s.aiAssistantOpen);
  // Capture a fresh surface snapshot whenever the panel opens or the user
  // navigates while it's open. The hook already memoises on pathname /
  // profile / search params. The pending-trigger's subContext is merged
  // into the snapshot via the hook's `subContext` option below.
  const consumePendingTrigger = useConversationStore(
    (s) => s.consumePendingTrigger,
  );
  const pendingTrigger = useConversationStore((s) => s.pendingTrigger);
  const snapshot = useAIContextSnapshot({
    subContext: pendingTrigger?.subContext,
  });
  const { messages, isStreaming, streamingText, error, send, clear } =
    useAIChat(snapshot);
  const setError = useConversationStore((s) => s.setError);

  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const apiKeyOk = isApiKeyConfigured();

  // Auto-scroll to bottom whenever the visible content grows.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, streamingText, isStreaming, error, open]);

  // Consume any pending InlineAITrigger payload on open. Pre-fill the
  // input or auto-submit depending on `autoSubmit`.
  useEffect(() => {
    if (!open) return;
    const pending = consumePendingTrigger();
    if (!pending) return;
    if (pending.autoSubmit) {
      void send(pending.prompt);
    } else {
      setDraft(pending.prompt);
    }
  }, [open, consumePendingTrigger, send]);

  if (!open) return null;

  const handleSubmit = () => {
    const text = draft;
    if (!text.trim() || isStreaming) return;
    setDraft('');
    void send(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      role="dialog"
      aria-label="GridAlpha AI Assistant"
      style={{
        position: 'fixed',
        right: 24,
        bottom: 84,
        width: 360,
        height: 480,
        background: C.bgElevated,
        border: `1px solid ${C.borderDefault}`,
        borderTop: `1px solid ${C.borderActive}`,
        borderRadius: R.lg,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9000,
        overflow: 'hidden',
      }}
    >
      <style id={CARET_KEYFRAMES_ID}>{CARET_KEYFRAMES_CSS}</style>

      {/* Header */}
      <div
        style={{
          height: 48,
          display: 'flex',
          alignItems: 'center',
          gap: S.sm,
          padding: `0 ${S.lg}`,
          borderBottom: `1px solid ${C.borderDefault}`,
          fontFamily: F.mono,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: C.textPrimary,
          flexShrink: 0,
        }}
      >
        <StatusDot status={apiKeyOk ? 'live' : 'offline'} />
        <span>GridAlpha AI · {apiKeyOk ? 'Online' : 'Offline'}</span>
        <div style={{ flex: 1 }} />
        {messages.length > 0 && (
          <button
            type="button"
            onClick={clear}
            disabled={isStreaming}
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              fontFamily: F.mono,
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: isStreaming ? C.textMuted : C.textSecondary,
              cursor: isStreaming ? 'default' : 'pointer',
              transition: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            aria-label="Clear conversation"
          >
            Clear
          </button>
        )}
      </div>

      {/* Context chip — shows what surface the assistant is analysing. */}
      <ContextChip snapshot={snapshot} />

      {/* Chat history */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          padding: S.lg,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: S.md,
        }}
      >
        {messages.length === 0 && !isStreaming && !error && (
          <div
            style={{
              alignSelf: 'center',
              marginTop: S.xl,
              maxWidth: '90%',
              textAlign: 'center',
              fontFamily: F.sans,
              fontSize: 13,
              lineHeight: 1.5,
              color: C.textMuted,
            }}
          >
            Ask anything about today&apos;s PJM market — zones, plants,
            spreads, capacity, basis. I&apos;ll explain at the depth your
            profile needs.
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              padding: `${S.sm} ${S.md}`,
              background: m.role === 'user' ? C.electricBlueWash : C.bgSurface,
              border: `1px solid ${
                m.role === 'user' ? C.borderAccent : C.borderDefault
              }`,
              borderRadius: R.md,
              fontFamily: F.sans,
              fontSize: 13,
              lineHeight: 1.5,
              color: m.role === 'user' ? C.textPrimary : C.textSecondary,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {m.content}
          </div>
        ))}

        {isStreaming && (
          <div
            style={{
              alignSelf: 'flex-start',
              maxWidth: '80%',
              padding: `${S.sm} ${S.md}`,
              background: C.bgSurface,
              border: `1px solid ${C.borderDefault}`,
              borderRadius: R.md,
              fontFamily: F.sans,
              fontSize: 13,
              lineHeight: 1.5,
              color: C.textSecondary,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {streamingText}
            <span
              aria-hidden
              style={{
                display: 'inline-block',
                marginLeft: 2,
                color: C.electricBlue,
                animation:
                  'oracle-ai-caret-blink 1s cubic-bezier(0.4, 0, 0.2, 1) infinite',
              }}
            >
              ▊
            </span>
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: S.sm,
            padding: `${S.sm} ${S.md}`,
            borderTop: `1px solid ${C.borderAlert}`,
            background: 'rgba(239,68,68,0.08)',
            fontFamily: F.sans,
            fontSize: 12,
            lineHeight: 1.45,
            color: C.alertCritical,
            flexShrink: 0,
          }}
        >
          <span style={{ flex: 1 }}>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            style={{
              background: 'transparent',
              border: 'none',
              padding: 0,
              fontFamily: F.mono,
              fontSize: 14,
              lineHeight: 1,
              color: C.alertCritical,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Quick-action chips — pre-populated prompts for common questions
          about the current surface. Hidden once the conversation has any
          messages so the chips don't compete with the chat history. */}
      {messages.length === 0 && !isStreaming && !error && apiKeyOk && (
        <QuickActionChips
          onPick={(id) => {
            void send(CONTEXTUAL_PROMPTS[id]);
          }}
        />
      )}

      {/* Input bar */}
      <div
        style={{
          minHeight: 48,
          padding: `${S.sm} ${S.md}`,
          borderTop: `1px solid ${C.borderDefault}`,
          display: 'flex',
          alignItems: 'flex-end',
          gap: S.sm,
          flexShrink: 0,
        }}
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={
            apiKeyOk
              ? "Ask anything about today's market..."
              : 'Add VITE_ANTHROPIC_API_KEY to .env.local to enable.'
          }
          aria-label="Ask the GridAlpha AI"
          disabled={!apiKeyOk}
          style={{
            flex: 1,
            resize: 'none',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: F.sans,
            fontSize: 13,
            lineHeight: 1.4,
            color: C.textPrimary,
            caretColor: C.electricBlue,
            maxHeight: 96,
          }}
        />
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!apiKeyOk || isStreaming || !draft.trim()}
          aria-label="Send message"
          style={{
            flexShrink: 0,
            padding: `${S.xs} ${S.md}`,
            background:
              !apiKeyOk || isStreaming || !draft.trim()
                ? 'transparent'
                : C.electricBlueWash,
            border: `1px solid ${
              !apiKeyOk || isStreaming || !draft.trim()
                ? C.borderDefault
                : C.borderActive
            }`,
            borderRadius: R.md,
            fontFamily: F.mono,
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color:
              !apiKeyOk || isStreaming || !draft.trim()
                ? C.textMuted
                : C.electricBlue,
            cursor:
              !apiKeyOk || isStreaming || !draft.trim()
                ? 'default'
                : 'pointer',
            transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {isStreaming ? '···' : 'Send'}
        </button>
      </div>
    </div>
  );
}

// ─── Context chip ────────────────────────────────────────────────────
// Sits below the header and above the message list. Shows the surface
// the assistant is currently analysing — the user always knows what
// "this" refers to in their question.

interface ContextChipProps {
  snapshot: ReturnType<typeof useAIContextSnapshot>;
}

function ContextChip({ snapshot }: ContextChipProps) {
  const { surface } = snapshot;
  const parts: string[] = [surface.surfaceLabel];
  if (surface.selectedZone) parts.push(surface.selectedZone);
  if (surface.currentItemTitle) parts.push(surface.currentItemTitle);
  if (surface.currentLayer) parts.push(surface.currentLayer);
  if (surface.selectedTab) parts.push(surface.selectedTab.toUpperCase());

  const label = parts.join(' · ');

  return (
    <div
      role="status"
      aria-label="AI Assistant context"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: S.xs,
        padding: `${S.xs} ${S.lg}`,
        background: C.bgElevated,
        borderBottom: `1px solid ${C.borderDefault}`,
        flexShrink: 0,
      }}
    >
      <ContextEyeIcon />
      <span
        style={{
          fontFamily: F.mono,
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color: C.electricBlue,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
        title={label}
      >
        Analyzing&nbsp;·&nbsp;{label}
      </span>
    </div>
  );
}

function ContextEyeIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width={11}
      height={11}
      fill="none"
      stroke={C.electricBlue}
      strokeWidth={1.5}
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5z" />
      <circle cx="8" cy="8" r="2" />
    </svg>
  );
}

// ─── Quick-action chips ──────────────────────────────────────────────
// Pre-populated prompts for common questions about the current surface.
// Sit above the input bar; hidden once the conversation has messages.

interface QuickActionChipsProps {
  onPick: (id: ContextualPromptId) => void;
}

function QuickActionChips({ onPick }: QuickActionChipsProps) {
  return (
    <div
      role="toolbar"
      aria-label="Quick prompts"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: S.xs,
        padding: `${S.sm} ${S.md} 0 ${S.md}`,
        flexShrink: 0,
      }}
    >
      {QUICK_ACTION_CHIP_IDS.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onPick(id)}
          style={{
            padding: `${S.xs} ${S.sm}`,
            background: 'transparent',
            border: `1px solid ${C.borderAccent}`,
            borderRadius: R.sm,
            fontFamily: F.mono,
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: C.electricBlueLight,
            cursor: 'pointer',
            transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = C.electricBlueWash;
            e.currentTarget.style.borderColor = C.borderActive;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = C.borderAccent;
          }}
        >
          {CONTEXTUAL_PROMPT_LABELS[id]}
        </button>
      ))}
    </div>
  );
}

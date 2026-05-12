// ORACLE Wave 2 — high-level chat hook.
//
// Wave 1 derived its context from { profile, view, zone } primitives. Wave 2
// accepts a full AIContextSnapshot — built by useAIContextSnapshot or
// captured at panel-invocation time. The snapshot drives both the system
// prompt (via buildSystemPrompt) and the conversationStore's per-thread
// context record.

import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useConversationStore } from '@/stores/conversationStore';
import { useAuthStore } from '@/stores/authStore';
import { streamChat } from '@/services/anthropic';
import {
  buildContextBlock,
  viewFromPathname,
  type AIContextSnapshot,
} from '@/services/aiContext';
import { buildSystemPrompt } from '@/lib/prompts/systemPrompt';

/**
 * High-level hook that backs the AIAssistant component.
 *
 * Wave 2 signature: optionally accepts the AIContextSnapshot produced by
 * `useAIContextSnapshot`. When provided, every send uses
 * `buildSystemPrompt(snapshot)` so Claude's response references the user's
 * current view. When omitted, the hook falls back to the Wave 1
 * profile/view/zone context block — keeps existing callers working.
 *
 * The optional `zone` argument (Wave 1 compat) is honoured for callers
 * that still pass a zone primitive directly.
 */
export function useAIChat(
  snapshot?: AIContextSnapshot | null,
  zone: string | null = null,
) {
  const messages = useConversationStore((s) => s.messages);
  const isStreaming = useConversationStore((s) => s.isStreaming);
  const streamingText = useConversationStore((s) => s.streamingText);
  const error = useConversationStore((s) => s.error);

  const appendUserMessage = useConversationStore((s) => s.appendUserMessage);
  const startStreaming = useConversationStore((s) => s.startStreaming);
  const appendStreamingText = useConversationStore(
    (s) => s.appendStreamingText,
  );
  const finishStreaming = useConversationStore((s) => s.finishStreaming);
  const setError = useConversationStore((s) => s.setError);
  const clearConversation = useConversationStore((s) => s.clearConversation);
  const recordSurfaceContext = useConversationStore(
    (s) => s.recordSurfaceContext,
  );

  const profile = useAuthStore((s) => s.selectedProfile);
  const location = useLocation();
  const view = viewFromPathname(location.pathname);

  const send = useCallback(
    async (userText: string) => {
      const trimmed = userText.trim();
      if (!trimmed || isStreaming) return;

      appendUserMessage(trimmed);
      startStreaming();

      // Persist the surface context used for this send. The conversation
      // store keeps the snapshot alongside the message stream so reopening
      // the conversation later can compare against the current surface.
      if (snapshot) {
        recordSurfaceContext(snapshot);
      }

      const systemPrompt = snapshot
        ? buildSystemPrompt(snapshot)
        : undefined;

      // Legacy fallback context block — only used when no snapshot is
      // supplied (Wave 1 compatibility path).
      const fallbackBlock = buildContextBlock({
        profile,
        view,
        zone: snapshot?.user.selectedZone ?? zone,
      });

      const conversationMessages = [
        ...messages,
        { role: 'user' as const, content: trimmed },
      ];

      try {
        for await (const chunk of streamChat(
          conversationMessages,
          fallbackBlock,
          { systemPrompt },
        )) {
          if (chunk.type === 'text' && chunk.text) {
            appendStreamingText(chunk.text);
          } else if (chunk.type === 'error') {
            setError(chunk.error ?? 'Stream error');
            return;
          } else if (chunk.type === 'done') {
            finishStreaming();
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    },
    [
      isStreaming,
      messages,
      profile,
      view,
      zone,
      snapshot,
      appendUserMessage,
      startStreaming,
      appendStreamingText,
      finishStreaming,
      setError,
      recordSurfaceContext,
    ],
  );

  return {
    messages,
    isStreaming,
    streamingText,
    error,
    send,
    clear: clearConversation,
  };
}

import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useConversationStore } from '@/stores/conversationStore';
import { useAuthStore } from '@/stores/authStore';
import { streamChat } from '@/services/anthropic';
import { buildContextBlock, viewFromPathname } from '@/services/aiContext';

/**
 * High-level hook that backs the AIAssistant component. Reads the
 * conversation state from `conversationStore`, derives the current view
 * from the router pathname, and exposes a `send` action that streams a
 * response from Claude into the store.
 *
 * Zone is currently sourced from props (or null) until ARCHITECT ships
 * `viewStore` — at that point this hook can read `useViewStore.selectedZone`
 * directly without changing its public surface.
 */
export function useAIChat(zone: string | null = null) {
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

  const profile = useAuthStore((s) => s.selectedProfile);
  const location = useLocation();
  const view = viewFromPathname(location.pathname);

  const send = useCallback(
    async (userText: string) => {
      const trimmed = userText.trim();
      if (!trimmed || isStreaming) return;

      appendUserMessage(trimmed);
      startStreaming();

      const contextBlock = buildContextBlock({ profile, view, zone });

      const conversationMessages = [
        ...messages,
        { role: 'user' as const, content: trimmed },
      ];

      try {
        for await (const chunk of streamChat(
          conversationMessages,
          contextBlock,
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
      appendUserMessage,
      startStreaming,
      appendStreamingText,
      finishStreaming,
      setError,
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

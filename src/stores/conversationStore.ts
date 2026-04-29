import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ChatMessage } from '@/services/anthropic';
import type { AIContextSnapshot } from '@/services/aiContext';

export interface ConversationState {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingText: string;
  error: string | null;
  /**
   * Surface context captured at the time of the most recent user send.
   * Persisted so reopening a conversation in a different surface can
   * detect the mismatch (Phase 11). Null until the first send happens.
   */
  surfaceContext: AIContextSnapshot | null;

  appendUserMessage: (content: string) => void;
  appendAssistantMessage: (content: string) => void;
  startStreaming: () => void;
  appendStreamingText: (chunk: string) => void;
  finishStreaming: () => void;
  setError: (err: string | null) => void;
  clearConversation: () => void;
  recordSurfaceContext: (snapshot: AIContextSnapshot) => void;
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      messages: [],
      isStreaming: false,
      streamingText: '',
      error: null,
      surfaceContext: null,

      appendUserMessage: (content) =>
        set((s) => ({
          messages: [...s.messages, { role: 'user', content }],
          error: null,
        })),

      appendAssistantMessage: (content) =>
        set((s) => ({
          messages: [...s.messages, { role: 'assistant', content }],
        })),

      startStreaming: () =>
        set({ isStreaming: true, streamingText: '', error: null }),

      appendStreamingText: (chunk) =>
        set((s) => ({ streamingText: s.streamingText + chunk })),

      finishStreaming: () => {
        const { streamingText, messages } = get();
        if (streamingText) {
          set({
            messages: [
              ...messages,
              { role: 'assistant', content: streamingText },
            ],
            streamingText: '',
            isStreaming: false,
          });
        } else {
          set({ isStreaming: false });
        }
      },

      setError: (err) => set({ error: err, isStreaming: false }),

      clearConversation: () =>
        set({
          messages: [],
          streamingText: '',
          isStreaming: false,
          error: null,
          surfaceContext: null,
        }),

      // Records the surface context at the moment of the most recent user
      // send. Wave 2 keeps only the latest snapshot — the conversation has
      // a single "where it was anchored" record, not a per-message log.
      // Phase 11 layers richer compare-on-reopen behavior on top of this.
      recordSurfaceContext: (snapshot) =>
        set((s) => ({
          // Anchor on the FIRST send — subsequent sends preserve the
          // original anchor so "started on Trader Nest" stays accurate
          // even after the user navigates away mid-conversation.
          surfaceContext: s.surfaceContext ?? snapshot,
        })),
    }),
    {
      name: 'gridalpha-conversation',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        messages: s.messages,
        surfaceContext: s.surfaceContext,
      }),
    },
  ),
);

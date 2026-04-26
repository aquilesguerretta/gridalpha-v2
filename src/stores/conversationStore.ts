import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ChatMessage } from '@/services/anthropic';

export interface ConversationState {
  messages: ChatMessage[];
  isStreaming: boolean;
  streamingText: string;
  error: string | null;

  appendUserMessage: (content: string) => void;
  appendAssistantMessage: (content: string) => void;
  startStreaming: () => void;
  appendStreamingText: (chunk: string) => void;
  finishStreaming: () => void;
  setError: (err: string | null) => void;
  clearConversation: () => void;
}

export const useConversationStore = create<ConversationState>()(
  persist(
    (set, get) => ({
      messages: [],
      isStreaming: false,
      streamingText: '',
      error: null,

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
        }),
    }),
    {
      name: 'gridalpha-conversation',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({ messages: s.messages }),
    },
  ),
);

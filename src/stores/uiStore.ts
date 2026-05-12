import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// FOUNDRY UI store — ephemeral overlay state shared across surfaces.
// Persisted to sessionStorage so a tab refresh keeps state intact, but a new
// tab gets a fresh UI.

export interface UIState {
  aiAssistantOpen: boolean;
  commandPaletteOpen: boolean;
  toggleAIAssistant: () => void;
  toggleCommandPalette: () => void;
  closeAll: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      aiAssistantOpen: false,
      commandPaletteOpen: false,
      toggleAIAssistant: () => set((s) => ({ aiAssistantOpen: !s.aiAssistantOpen })),
      toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
      closeAll: () => set({ aiAssistantOpen: false, commandPaletteOpen: false }),
    }),
    {
      name: 'gridalpha-ui',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

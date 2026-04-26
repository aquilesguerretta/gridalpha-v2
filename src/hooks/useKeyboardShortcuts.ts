import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';

// FOUNDRY hook — global keyboard shortcuts for shell overlays.
// Mount once at the top of the app shell.
//
//   Cmd/Ctrl+K  → toggle command palette
//   Cmd/Ctrl+P  → contextual news drawer (placeholder; logs for now)
//   Cmd/Ctrl+/  → toggle AI Assistant
//   Escape      → close all overlays

export function useKeyboardShortcuts() {
  const toggleCommandPalette = useUIStore((s) => s.toggleCommandPalette);
  const toggleAIAssistant = useUIStore((s) => s.toggleAIAssistant);
  const closeAll = useUIStore((s) => s.closeAll);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const cmdOrCtrl = e.metaKey || e.ctrlKey;

      if (cmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        // Cmd+P contextual news drawer — placeholder for now
        console.log('Cmd+P pressed — contextual news drawer not yet implemented');
        return;
      }

      if (cmdOrCtrl && e.key === '/') {
        e.preventDefault();
        toggleAIAssistant();
        return;
      }

      if (e.key === 'Escape') {
        closeAll();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleCommandPalette, toggleAIAssistant, closeAll]);
}

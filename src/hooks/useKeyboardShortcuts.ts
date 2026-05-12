import { useEffect } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { useCmdPStore } from '@/stores/cmdpStore';
import { dispatchCmdPTrigger } from '@/components/shared/CommandPalette';

// FOUNDRY hook + CONDUIT Wave 3 extension — global keyboard shortcuts.
// Mount once at the top of the app shell.
//
//   Cmd/Ctrl+K  → open Cmd+P drawer (manual mode, empty input)
//   Cmd/Ctrl+P  → open Cmd+P drawer with current selection (or empty)
//                 — preventDefault so the browser print dialog never opens
//   Cmd/Ctrl+/  → toggle AI Assistant
//   Escape      → close all overlays (uiStore + cmdpStore)
//
// The Cmd+P/K handlers dispatch a `cmdp:trigger` window event picked up
// by the CommandPalette wrapper. This keeps useNewsData mounted in
// exactly one place (the wrapper) instead of duplicating it here.

export function useKeyboardShortcuts() {
  const toggleAIAssistant = useUIStore((s) => s.toggleAIAssistant);
  const closeAllUI = useUIStore((s) => s.closeAll);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const cmdOrCtrl = e.metaKey || e.ctrlKey;

      if (cmdOrCtrl && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        // Cmd+K opens the drawer in manual mode — empty query, focus
        // jumps to the REFINE input so the user can type.
        dispatchCmdPTrigger({ rawText: '', triggeredFrom: 'manual' });
        return;
      }

      if (cmdOrCtrl && e.key.toLowerCase() === 'p') {
        // Critical: preventDefault stops Chrome's print dialog.
        e.preventDefault();
        const text = readWindowSelection();
        dispatchCmdPTrigger({
          rawText: text,
          triggeredFrom: text ? 'selection' : 'manual',
        });
        return;
      }

      if (cmdOrCtrl && e.key === '/') {
        e.preventDefault();
        toggleAIAssistant();
        return;
      }

      if (e.key === 'Escape') {
        // Close cmdp drawer if open, plus the rest of the UI overlays.
        const cmdpOpen = useCmdPStore.getState().isOpen;
        if (cmdpOpen) useCmdPStore.getState().close();
        closeAllUI();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleAIAssistant, closeAllUI]);
}

/** Read the current document text selection. Returns "" when no
 *  meaningful selection exists or the selection is inside an editable
 *  field (input/textarea/contenteditable). */
function readWindowSelection(): string {
  if (typeof window === 'undefined') return '';
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return '';
  const text = sel.toString().trim();
  if (text.length < 2 || text.length > 240) return '';
  // Skip selections inside editable surfaces.
  if (sel.anchorNode && isInsideEditable(sel.anchorNode)) return '';
  return text;
}

function isInsideEditable(node: Node): boolean {
  let n: Node | null = node;
  while (n) {
    if (n.nodeType === 1) {
      const el = n as HTMLElement;
      const tag = el.tagName?.toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA') return true;
      if (el.isContentEditable) return true;
    }
    n = n.parentNode;
  }
  return false;
}

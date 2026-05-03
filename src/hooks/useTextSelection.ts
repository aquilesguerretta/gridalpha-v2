import { useEffect, useState } from 'react';

// CONDUIT Wave 3 — global text-selection observer.
//
// Subscribes to `selectionchange` and produces a stable, debounced snapshot
// of the current selection: the selected string, the bounding client rect
// of the selection range, and a flag indicating whether the selection
// happened inside an editable element (input/textarea/contenteditable),
// so callers can skip those cases.
//
// The hook itself has no opinion about Cmd+P — it just reports state.
// `CmdPSelectionIndicator` and `useCmdP` consume the report.

export interface TextSelectionInfo {
  /** The trimmed selected text. Always >= 1 character when non-null. */
  text: string;
  /** Bounding rect of the selection range, in viewport coordinates. */
  bounds: DOMRect | null;
  /** True if the selection was inside an `<input>`, `<textarea>`, or
   *  any element with `contenteditable="true"`. UI typically suppresses
   *  the indicator in this case. */
  isInEditable: boolean;
}

const DEBOUNCE_MS = 80;
const MIN_SELECTION_CHARS = 2;
const MAX_SELECTION_CHARS = 240;

/**
 * Returns the current text selection info, or `null` when there's no
 * stable, non-trivial selection. Re-renders only when the selection
 * actually changes (debounced ~80ms to ride out the click+drag).
 */
export function useTextSelection(): TextSelectionInfo | null {
  const [info, setInfo] = useState<TextSelectionInfo | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let timer: number | undefined;

    const compute = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return setInfo(null);

      const raw = sel.toString();
      const text = raw.trim();
      if (text.length < MIN_SELECTION_CHARS || text.length > MAX_SELECTION_CHARS) {
        return setInfo(null);
      }

      // Skip selections inside editable surfaces — the user is most likely
      // editing/typing, not asking a question about a term.
      const anchorNode = sel.anchorNode;
      const isInEditable = anchorNode ? isInsideEditable(anchorNode) : false;
      if (isInEditable) return setInfo(null);

      let bounds: DOMRect | null = null;
      try {
        const range = sel.getRangeAt(0);
        bounds = range.getBoundingClientRect();
        // Browsers sometimes report a 0×0 rect for collapsed-then-expanded
        // selections; treat that as "no selection."
        if (!bounds || (bounds.width === 0 && bounds.height === 0)) {
          bounds = null;
        }
      } catch {
        bounds = null;
      }

      setInfo({ text, bounds, isInEditable: false });
    };

    const handler = () => {
      if (timer != null) window.clearTimeout(timer);
      timer = window.setTimeout(compute, DEBOUNCE_MS);
    };

    document.addEventListener('selectionchange', handler);
    return () => {
      document.removeEventListener('selectionchange', handler);
      if (timer != null) window.clearTimeout(timer);
    };
  }, []);

  return info;
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

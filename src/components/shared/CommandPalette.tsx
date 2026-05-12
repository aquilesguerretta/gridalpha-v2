import { useCallback, useEffect } from 'react';
import { useCmdP } from '@/hooks/useCmdP';
import { CmdPDrawer } from './CmdPDrawer';
import { CmdPSelectionIndicator } from './CmdPSelectionIndicator';

// CONDUIT Wave 3 — global Cmd+P mount.
//
// REPLACES the FOUNDRY Cmd+K stub. Keeps the `CommandPalette` export
// name so existing imports in GlobalShell continue to work. The
// component now:
//   • Mounts the `useCmdP` orchestration hook (subscribes to news,
//     captures AI context snapshots, drives the resolver).
//   • Renders the `CmdPDrawer` (driven by `useCmdPStore`).
//   • Renders the `CmdPSelectionIndicator` so any text selection
//     gets a "⌘P TO EXPLORE" pill.
//   • Listens for the global `cmdp:trigger` window event dispatched by
//     `useKeyboardShortcuts` — this decouples the keyboard handler
//     from the orchestration hook and avoids a double `useNewsData`
//     subscription.

export interface CmdPTriggerEventDetail {
  rawText: string;
  triggeredFrom: 'selection' | 'manual';
}

export const CMDP_TRIGGER_EVENT = 'cmdp:trigger';

export function CommandPalette() {
  const { openWithSelection, openEmpty } = useCmdP();

  // Dispatcher hook used elsewhere in the app to trigger the drawer
  // without depending on this module directly. Currently only used by
  // the keyboard handler via window event.
  const handleTrigger = useCallback(
    (detail: CmdPTriggerEventDetail) => {
      const text = detail.rawText.trim();
      if (text) {
        openWithSelection({ rawText: text, triggeredFrom: detail.triggeredFrom });
      } else {
        openEmpty();
      }
    },
    [openWithSelection, openEmpty],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = (e: Event) => {
      const detail =
        (e as CustomEvent<CmdPTriggerEventDetail | undefined>).detail;
      if (!detail) return;
      handleTrigger(detail);
    };
    window.addEventListener(CMDP_TRIGGER_EVENT, handler);
    return () => window.removeEventListener(CMDP_TRIGGER_EVENT, handler);
  }, [handleTrigger]);

  return (
    <>
      <CmdPSelectionIndicator
        onActivate={(text) =>
          handleTrigger({ rawText: text, triggeredFrom: 'selection' })
        }
      />
      <CmdPDrawer />
    </>
  );
}

/**
 * Dispatch a Cmd+P trigger from anywhere in the app — keyboard handler,
 * a chart toolbar button, an AnnotatableChart action. Safe to call
 * outside React (no hooks).
 */
export function dispatchCmdPTrigger(detail: CmdPTriggerEventDetail): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<CmdPTriggerEventDetail>(CMDP_TRIGGER_EVENT, { detail }),
  );
}

import { C } from '@/design/tokens';
import { useUIStore } from '@/stores/uiStore';
import { useHoverState } from '@/components/terminal/useHoverState';

// FOUNDRY shared — floating button that toggles the AI Assistant.
// Stacked above the dev ProfileSwitcher (which sits at right:S.lg/bottom:S.lg).
// 48×48 electric blue circle. Hover state brightens.

export function AIAssistantTrigger() {
  const toggle = useUIStore((s) => s.toggleAIAssistant);
  const hover = useHoverState();
  return (
    <button
      type="button"
      aria-label="Toggle GridAlpha AI Assistant"
      onClick={toggle}
      {...hover.bind}
      style={{
        position: 'fixed',
        right: 24,
        bottom: 84,
        width: 48,
        height: 48,
        borderRadius: '50%',
        background: hover.hovered ? C.electricBlueLight : C.electricBlue,
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 8500,
        transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width={20}
        height={20}
        fill="none"
        stroke="white"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}

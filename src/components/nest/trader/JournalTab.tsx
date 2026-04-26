// FORGE — JournalTab orchestrator. Thin wrapper around JournalView so
// TraderNest can switch tabs through a stable, single import surface.

import { JournalView } from './journal/JournalView';

export function JournalTab() {
  return <JournalView />;
}

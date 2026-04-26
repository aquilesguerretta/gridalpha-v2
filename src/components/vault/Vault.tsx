// ATLAS — Vault parent.
// Switches between VaultIndex / Alexandria / CaseStudyView based on the URL.
//
// URL contract (ARCHITECT wires the routes):
//   /vault                 → VaultIndex
//   /vault/alexandria      → Alexandria
//   /vault/:id             → CaseStudyView (any other id segment)
//
// We read both useParams (for routes registered as /vault/:id) and useLocation
// so the component still does the right thing even if the routing setup
// catches /vault/* as a single splat.

import { useLocation, useParams } from 'react-router-dom';
import { Alexandria } from './Alexandria';
import { CaseStudyView } from './CaseStudyView';
import { VaultIndex } from './VaultIndex';

export function Vault() {
  const params = useParams<{ id?: string }>();
  const location = useLocation();

  if (location.pathname.endsWith('/alexandria')) {
    return <Alexandria />;
  }

  // Derive the trailing segment from the URL when params don't provide it.
  const fallbackId = (() => {
    const trimmed = location.pathname.replace(/\/+$/, '');
    const idx = trimmed.lastIndexOf('/vault/');
    if (idx === -1) return undefined;
    const tail = trimmed.slice(idx + '/vault/'.length);
    return tail.length > 0 ? tail : undefined;
  })();

  const studyId = params.id ?? fallbackId;
  if (studyId && studyId !== 'alexandria') {
    return <CaseStudyView caseStudyId={studyId} />;
  }

  return <VaultIndex />;
}

export default Vault;

// ATLAS — Vault parent.
// Switches between VaultIndex / Alexandria / CaseStudyView / Lesson / Entry
// based on the URL.
//
// URL contract (ARCHITECT wires the routes):
//   /vault                                              → VaultIndex
//   /vault/alexandria                                   → Alexandria
//   /vault/alexandria/lesson/:lessonId                  → Lesson (SCRIBE)
//   /vault/alexandria/entry/:entrySlug?layer=L1|L2|L3   → Entry (SCRIBE 1A)
//   /vault/:id                                          → CaseStudyView

import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { Alexandria } from './Alexandria';
import { CaseStudyView } from './CaseStudyView';
import { Entry } from './Entry';
import { Lesson } from './Lesson';
import { VaultIndex } from './VaultIndex';
import type { LayerKey } from '@/lib/types/curriculum';

const LESSON_PREFIX = '/alexandria/lesson/';
const ENTRY_PREFIX = '/alexandria/entry/';

function parseLayer(raw: string | null): LayerKey {
  if (raw === 'L2' || raw === 'L3') return raw;
  return 'L1';
}

export function Vault() {
  const params = useParams<{ id?: string; lessonId?: string; entrySlug?: string }>();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const trimmedPath = location.pathname.replace(/\/+$/, '');

  // Entry route: /vault/alexandria/entry/:entrySlug — handled before
  // /alexandria so the more specific route wins.
  const entryIdx = trimmedPath.indexOf(ENTRY_PREFIX);
  if (entryIdx !== -1) {
    const entrySlug =
      params.entrySlug ?? trimmedPath.slice(entryIdx + ENTRY_PREFIX.length);
    if (entrySlug.length > 0) {
      const layer = parseLayer(searchParams.get('layer'));
      return <Entry entrySlug={entrySlug} layer={layer} />;
    }
  }

  // Lesson route: /vault/alexandria/lesson/:lessonId
  const lessonIdx = trimmedPath.indexOf(LESSON_PREFIX);
  if (lessonIdx !== -1) {
    const lessonId =
      params.lessonId ?? trimmedPath.slice(lessonIdx + LESSON_PREFIX.length);
    if (lessonId.length > 0) return <Lesson lessonId={lessonId} />;
  }

  if (trimmedPath.endsWith('/alexandria')) {
    return <Alexandria />;
  }

  // Derive the trailing segment from the URL when params don't provide it.
  const fallbackId = (() => {
    const idx = trimmedPath.lastIndexOf('/vault/');
    if (idx === -1) return undefined;
    const tail = trimmedPath.slice(idx + '/vault/'.length);
    return tail.length > 0 ? tail : undefined;
  })();

  const studyId = params.id ?? fallbackId;
  if (studyId && studyId !== 'alexandria') {
    return <CaseStudyView caseStudyId={studyId} />;
  }

  return <VaultIndex />;
}

export default Vault;

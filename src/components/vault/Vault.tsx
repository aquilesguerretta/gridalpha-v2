// ATLAS — Vault parent.
// Switches between VaultIndex / Alexandria / CaseStudyView / Lesson based
// on the URL.
//
// URL contract (ARCHITECT wires the routes):
//   /vault                                       → VaultIndex
//   /vault/alexandria                            → Alexandria
//   /vault/alexandria/lesson/:lessonId           → Lesson (SCRIBE)
//   /vault/:id                                   → CaseStudyView
//
// We read both useParams (for routes registered as /vault/:id) and useLocation
// so the component still does the right thing even if the routing setup
// catches /vault/* as a single splat.

import { useLocation, useParams } from 'react-router-dom';
import { Alexandria } from './Alexandria';
import { CaseStudyView } from './CaseStudyView';
import { Lesson } from './Lesson';
import { VaultIndex } from './VaultIndex';

const LESSON_PREFIX = '/alexandria/lesson/';

export function Vault() {
  const params = useParams<{ id?: string; lessonId?: string }>();
  const location = useLocation();
  const trimmedPath = location.pathname.replace(/\/+$/, '');

  // Lesson route: /vault/alexandria/lesson/:lessonId — handled before the
  // /alexandria check so `/alexandria/lesson/foo` doesn't match Alexandria.
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

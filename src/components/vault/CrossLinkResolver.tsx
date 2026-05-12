// SCRIBE — wraps any prose body and converts canonical concept terms to
// react-router Links. Case-insensitive matching; original casing
// preserved in output. Skips linking if the term resolves to the current
// entry (no self-links) and ignores matches inside Markdown emphasis or
// code spans for now (V1 simplicity).

import { Fragment, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { C } from '@/design/tokens';
import { CROSS_LINK_MAP } from '@/lib/curriculum/crossLinkMap';

interface Props {
  /** Plain text or simple Markdown text. Multi-paragraph splitting is the
   *  caller's responsibility — pass one paragraph at a time. */
  text: string;
  currentEntryId?: string;
}

interface Segment {
  text: string;
  href?: string;
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildSegments(text: string, currentEntryId: string | undefined): Segment[] {
  // Sort terms by length descending so "second law of thermodynamics" wins
  // over "second law" when both could match.
  const terms = Object.keys(CROSS_LINK_MAP).sort((a, b) => b.length - a.length);
  if (terms.length === 0) return [{ text }];

  const pattern = new RegExp(`\\b(${terms.map(escapeRegExp).join('|')})\\b`, 'gi');
  const segments: Segment[] = [];
  let cursor = 0;
  let m: RegExpExecArray | null;

  while ((m = pattern.exec(text)) !== null) {
    const matched = m[0];
    const slug = CROSS_LINK_MAP[matched.toLowerCase()];
    if (!slug || slug === currentEntryId) continue;
    if (m.index > cursor) {
      segments.push({ text: text.slice(cursor, m.index) });
    }
    segments.push({
      text: matched,
      href: `/vault/alexandria/entry/${slug}?layer=L1`,
    });
    cursor = m.index + matched.length;
  }
  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor) });
  }
  return segments;
}

export function CrossLinkResolver({ text, currentEntryId }: Props) {
  const segments = useMemo(() => buildSegments(text, currentEntryId), [text, currentEntryId]);

  return (
    <>
      {segments.map((s, i) => {
        if (s.href) {
          return (
            <Link
              key={i}
              to={s.href}
              style={{
                color:           C.electricBlue,
                textDecoration:  'underline',
                textDecorationStyle: 'dotted',
                textUnderlineOffset: '2px',
              }}
            >
              {s.text}
            </Link>
          );
        }
        return <Fragment key={i}>{s.text}</Fragment>;
      })}
    </>
  );
}

export default CrossLinkResolver;

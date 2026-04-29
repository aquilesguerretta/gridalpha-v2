// SCRIBE — minimal Markdown renderer for entry prose.
// Handles the constructs used in the Sub-Tier 1A handoff:
//   - **bold** and *italic* inline emphasis
//   - Markdown tables ( | header | header | / | --- | --- | / data rows )
//   - bullet lists ( - item / * item )
// Each "block" (paragraph, list, or table) is split on \n\n.
// Inline text segments are passed through CrossLinkResolver so canonical
// concept terms become Links — without re-resolving inside table cells
// already wrapped in semantic markup.
//
// We deliberately avoid adding a Markdown library dependency.

import { Fragment, useMemo } from 'react';
import { C, F, R, S } from '@/design/tokens';
import { CrossLinkResolver } from './CrossLinkResolver';

interface Props {
  body: string;
  currentEntryId: string;
  fontSize?: number;
}

interface Block {
  type: 'paragraph' | 'list' | 'table';
  content: string;
}

function splitBlocks(body: string): Block[] {
  const raw = body.split(/\n\n+/);
  const out: Block[] = [];
  for (const chunk of raw) {
    const text = chunk.trim();
    if (!text) continue;
    const lines = text.split('\n');
    const isList = lines.every((l) => /^[\s]*[-*]\s+/.test(l));
    const looksTable = lines.length >= 2 && lines.every((l) => l.trim().startsWith('|') && l.trim().endsWith('|'));
    if (looksTable) out.push({ type: 'table', content: text });
    else if (isList) out.push({ type: 'list', content: text });
    else out.push({ type: 'paragraph', content: text });
  }
  return out;
}

interface InlineSegment {
  text: string;
  bold?: boolean;
  italic?: boolean;
}

/** Tokenise an inline string into segments by Markdown emphasis markers. */
function tokenizeInline(s: string): InlineSegment[] {
  const out: InlineSegment[] = [];
  // Match **bold** first (longer marker), then *italic*.
  const re = /(\*\*([^*]+)\*\*|\*([^*\n]+)\*)/g;
  let cursor = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    if (m.index > cursor) out.push({ text: s.slice(cursor, m.index) });
    if (m[2] !== undefined) out.push({ text: m[2], bold: true });
    else if (m[3] !== undefined) out.push({ text: m[3], italic: true });
    cursor = m.index + m[0].length;
  }
  if (cursor < s.length) out.push({ text: s.slice(cursor) });
  return out;
}

function InlineText({ text, currentEntryId }: { text: string; currentEntryId: string }) {
  const segments = useMemo(() => tokenizeInline(text), [text]);
  return (
    <>
      {segments.map((seg, i) => {
        const inner = <CrossLinkResolver text={seg.text} currentEntryId={currentEntryId} />;
        if (seg.bold) return <strong key={i} style={{ color: C.textPrimary, fontWeight: 700 }}>{inner}</strong>;
        if (seg.italic) return <em key={i}>{inner}</em>;
        return <Fragment key={i}>{inner}</Fragment>;
      })}
    </>
  );
}

function ListBlock({ block, currentEntryId, fontSize }: { block: Block; currentEntryId: string; fontSize: number }) {
  const items = block.content
    .split('\n')
    .map((l) => l.replace(/^[\s]*[-*]\s+/, ''))
    .filter((l) => l.length > 0);
  return (
    <ul
      style={{
        margin:     0,
        paddingLeft: S.lg,
        display:    'flex',
        flexDirection: 'column',
        gap:        S.xs,
      }}
    >
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            fontFamily: F.sans,
            fontSize,
            color:      C.textSecondary,
            lineHeight: 1.7,
          }}
        >
          <InlineText text={item} currentEntryId={currentEntryId} />
        </li>
      ))}
    </ul>
  );
}

function TableBlock({ block, currentEntryId }: { block: Block; currentEntryId: string }) {
  const lines = block.content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 2) return null;

  const splitRow = (line: string): string[] =>
    line
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|')
      .map((c) => c.trim());

  const header = splitRow(lines[0]);
  // lines[1] is the alignment separator like "| --- | --- |"; skip it if present.
  const bodyStart = /^\|?\s*-{3,}/.test(lines[1]) ? 2 : 1;
  const rows = lines.slice(bodyStart).map(splitRow);

  return (
    <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
      <table
        style={{
          width:          '100%',
          borderCollapse: 'collapse',
          fontFamily:     F.mono,
          fontSize:       12,
          color:          C.textSecondary,
          background:     C.bgElevated,
          border:         `1px solid ${C.borderDefault}`,
          borderTop:      `1px solid ${C.borderAccent}`,
          borderRadius:   R.md,
          overflow:       'hidden',
        }}
      >
        <thead>
          <tr>
            {header.map((h, i) => (
              <th
                key={i}
                style={{
                  textAlign:     'left',
                  padding:       `${S.xs} ${S.md}`,
                  borderBottom:  `1px solid ${C.borderDefault}`,
                  fontFamily:    F.mono,
                  fontSize:      10,
                  fontWeight:    600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color:         C.electricBlue,
                  background:    'rgba(59,130,246,0.05)',
                  whiteSpace:    'nowrap',
                }}
              >
                <InlineText text={h} currentEntryId={currentEntryId} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td
                  key={j}
                  style={{
                    textAlign:     'left',
                    padding:       `${S.xs} ${S.md}`,
                    borderBottom:  i === rows.length - 1 ? 'none' : `1px solid ${C.borderDefault}`,
                    fontFamily:    F.mono,
                    fontSize:      11,
                    color:         C.textSecondary,
                    verticalAlign: 'top',
                  }}
                >
                  <InlineText text={cell} currentEntryId={currentEntryId} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MarkdownProse({ body, currentEntryId, fontSize = 16 }: Props) {
  const blocks = useMemo(() => splitBlocks(body), [body]);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: S.md, maxWidth: 780 }}>
      {blocks.map((block, i) => {
        if (block.type === 'table')
          return <TableBlock key={i} block={block} currentEntryId={currentEntryId} />;
        if (block.type === 'list')
          return <ListBlock key={i} block={block} currentEntryId={currentEntryId} fontSize={fontSize} />;
        return (
          <p
            key={i}
            style={{
              margin:     0,
              fontFamily: F.sans,
              fontSize,
              color:      C.textSecondary,
              lineHeight: 1.7,
            }}
          >
            <InlineText text={block.content} currentEntryId={currentEntryId} />
          </p>
        );
      })}
    </div>
  );
}

export default MarkdownProse;

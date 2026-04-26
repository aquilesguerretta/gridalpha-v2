import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { C, F, S } from '@/design/tokens';

// FOUNDRY primitive — generic data table.
// Header row in F.mono 10px uppercase muted. Cells in F.mono 13px primary.
// Numeric cells right-align by default unless overridden by ColumnDef.align.
// Row hover: background rgba(255,255,255,0.02).

export type ColumnAlign = 'left' | 'right' | 'center';

export interface ColumnDef {
  key: string;
  label: string;
  align?: ColumnAlign;
  width?: string | number;
  render?: (value: any, row: any) => ReactNode;
}

interface Props {
  columns: ColumnDef[];
  rows: any[];
  compact?: boolean;
}

const resolveAlign = (col: ColumnDef, val: unknown): ColumnAlign =>
  col.align ?? (typeof val === 'number' ? 'right' : 'left');

export function DataTable({ columns, rows, compact }: Props) {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const rowHeight = compact ? 32 : 44;

  const headerCellBase: CSSProperties = {
    padding: `${S.sm} ${S.md}`,
    fontFamily: F.mono,
    fontSize: 10,
    fontWeight: 600,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: C.textMuted,
    borderBottom: `1px solid ${C.borderDefault}`,
    whiteSpace: 'nowrap',
  };

  return (
    <table
      style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: F.mono,
        fontSize: 13,
        color: C.textPrimary,
      }}
    >
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              style={{
                ...headerCellBase,
                textAlign: col.align ?? 'left',
                width: col.width,
              }}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIdx) => (
          <tr
            key={rowIdx}
            onMouseEnter={() => setHoveredRow(rowIdx)}
            onMouseLeave={() =>
              setHoveredRow((cur) => (cur === rowIdx ? null : cur))
            }
            style={{
              height: rowHeight,
              background: hoveredRow === rowIdx ? 'rgba(255,255,255,0.02)' : 'transparent',
              borderBottom: `1px solid ${C.borderDefault}`,
              transition: 'background-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {columns.map((col) => {
              const val = row[col.key];
              const align = resolveAlign(col, val);
              return (
                <td
                  key={col.key}
                  style={{
                    textAlign: align,
                    padding: `0 ${S.md}`,
                    fontFamily: F.mono,
                    fontSize: 13,
                    fontVariantNumeric: 'tabular-nums',
                    color: C.textPrimary,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.render ? col.render(val, row) : (val as ReactNode)}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

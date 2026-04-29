import { View, Text, StyleSheet } from '@react-pdf/renderer';

// CONDUIT-2 — data table with a sticky header row, alternating row
// backgrounds, and per-column alignment. Rows are arrays of strings;
// the caller formats numbers/dates beforehand so the table component
// stays presentation-only.

const styles = StyleSheet.create({
  table: {
    marginBottom: 14,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#0B0F19',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  headerCell: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
    letterSpacing: 1.0,
    textTransform: 'uppercase',
  },
  bodyRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  bodyRowAlt: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E7EB',
  },
  bodyCell: {
    fontFamily: 'Courier',
    fontSize: 10,
    color: '#1F2937',
  },
});

export type ColumnAlign = 'left' | 'right' | 'center';

export interface PDFTableColumn {
  label: string;
  /** Width as a flex value; defaults to 1. */
  flex?: number;
  align?: ColumnAlign;
}

interface Props {
  columns: PDFTableColumn[];
  rows: (string | number)[][];
}

export function PDFTable({ columns, rows }: Props) {
  return (
    <View style={styles.table}>
      <View style={styles.headerRow} fixed>
        {columns.map((c, i) => (
          <Text
            key={i}
            style={[
              styles.headerCell,
              {
                flex: c.flex ?? 1,
                textAlign: c.align ?? 'left',
              },
            ]}
          >
            {c.label}
          </Text>
        ))}
      </View>
      {rows.map((row, ri) => (
        <View key={ri} style={ri % 2 === 0 ? styles.bodyRow : styles.bodyRowAlt}>
          {row.map((cell, ci) => {
            const col = columns[ci];
            return (
              <Text
                key={ci}
                style={[
                  styles.bodyCell,
                  {
                    flex: col?.flex ?? 1,
                    textAlign: col?.align ?? 'left',
                  },
                ]}
              >
                {String(cell)}
              </Text>
            );
          })}
        </View>
      ))}
    </View>
  );
}

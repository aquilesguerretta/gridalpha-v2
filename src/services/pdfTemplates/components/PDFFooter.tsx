import { View, Text, StyleSheet } from '@react-pdf/renderer';

// CONDUIT-2 — branded page footer. Mounted via `fixed` so it repeats on
// every page. Brand line left, "Page X of Y" right.

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 36,
    left: 54,
    right: 54,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  text: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: '#71717A',
    letterSpacing: 0.6,
  },
});

interface Props {
  brandLine: string;
}

export function PDFFooter({ brandLine }: Props) {
  return (
    <View style={styles.container} fixed>
      <Text style={styles.text}>{brandLine}</Text>
      <Text
        style={styles.text}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
      />
    </View>
  );
}

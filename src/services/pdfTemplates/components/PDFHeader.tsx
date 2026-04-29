import { View, Text, StyleSheet } from '@react-pdf/renderer';

// CONDUIT-2 — branded page header. Mounted via `fixed` so it repeats on
// every page. GridAlpha wordmark left, document type + date right.

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    marginBottom: 24,
  },
  brand: {
    fontFamily: 'Times-Roman',
    fontSize: 16,
    color: '#0B0F19',
  },
  meta: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: '#71717A',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
});

interface Props {
  documentType: string;
  generatedDate: string;
}

export function PDFHeader({ documentType, generatedDate }: Props) {
  return (
    <View style={styles.container} fixed>
      <Text style={styles.brand}>GridAlpha</Text>
      <Text style={styles.meta}>
        {documentType} {'·'} {generatedDate}
      </Text>
    </View>
  );
}

import { Text, View, StyleSheet } from '@react-pdf/renderer';

// CONDUIT-2 — body prose and small disclaimer text.
// `bullets` renders an unordered list with consistent indent.

const styles = StyleSheet.create({
  body: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#1F2937',
    lineHeight: 1.45,
    marginBottom: 10,
  },
  small: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#71717A',
    lineHeight: 1.45,
  },
  italic: {
    fontFamily: 'Helvetica-Oblique',
    fontSize: 9,
    color: '#71717A',
    lineHeight: 1.45,
  },
  bulletRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bulletDot: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#3B82F6',
    width: 14,
  },
  bulletText: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#1F2937',
    lineHeight: 1.45,
    flex: 1,
  },
});

type Variant = 'body' | 'small' | 'disclaimer';

interface Props {
  children: React.ReactNode;
  variant?: Variant;
}

export function PDFBody({ children, variant = 'body' }: Props) {
  const style =
    variant === 'small' ? styles.small : variant === 'disclaimer' ? styles.italic : styles.body;
  return <Text style={style}>{children}</Text>;
}

interface BulletProps {
  items: React.ReactNode[];
}

export function PDFBulletList({ items }: BulletProps) {
  return (
    <View style={{ marginBottom: 10 }}>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>{'•'}</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

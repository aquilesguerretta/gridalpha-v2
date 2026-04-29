import { Text, StyleSheet } from '@react-pdf/renderer';

// CONDUIT-2 — heading hierarchy.
//   level 1 (default): hero/display heading, 32pt Times-Roman
//   level 2: section heading, 18pt Times-Roman bold
//   level 3: sub-heading, 14pt Times-Roman bold

const styles = StyleSheet.create({
  level1: {
    fontFamily: 'Times-Roman',
    fontSize: 32,
    color: '#0B0F19',
    lineHeight: 1.2,
    marginBottom: 14,
  },
  level2: {
    fontFamily: 'Times-Bold',
    fontSize: 18,
    color: '#0B0F19',
    lineHeight: 1.25,
    marginBottom: 10,
  },
  level3: {
    fontFamily: 'Times-Bold',
    fontSize: 14,
    color: '#0B0F19',
    lineHeight: 1.3,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Times-Italic',
    fontSize: 16,
    color: '#71717A',
    lineHeight: 1.35,
    marginBottom: 12,
  },
});

interface Props {
  children: string;
  level?: 1 | 2 | 3;
  subtitle?: boolean;
}

export function PDFHeading({ children, level = 1, subtitle = false }: Props) {
  if (subtitle) return <Text style={styles.subtitle}>{children}</Text>;
  if (level === 2) return <Text style={styles.level2}>{children}</Text>;
  if (level === 3) return <Text style={styles.level3}>{children}</Text>;
  return <Text style={styles.level1}>{children}</Text>;
}

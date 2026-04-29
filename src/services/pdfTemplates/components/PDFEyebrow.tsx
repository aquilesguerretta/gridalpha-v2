import { Text, StyleSheet } from '@react-pdf/renderer';

// CONDUIT-2 — small caps eyebrow that sits above section headings.
// Inter-section rhythm: eyebrow → heading → body, with consistent
// vertical spacing.

const styles = StyleSheet.create({
  eyebrow: {
    fontFamily: 'Courier',
    fontSize: 10,
    fontWeight: 'bold',
    color: '#3B82F6',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  hero: {
    fontFamily: 'Courier',
    fontSize: 11,
    fontWeight: 'bold',
    color: '#3B82F6',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
});

interface Props {
  children: string;
  variant?: 'section' | 'hero';
}

export function PDFEyebrow({ children, variant = 'section' }: Props) {
  return (
    <Text style={variant === 'hero' ? styles.hero : styles.eyebrow}>
      {children}
    </Text>
  );
}

import { View, Text, StyleSheet } from '@react-pdf/renderer';

// CONDUIT-2 — large metric block. Used for hero KPIs (10-yr NPV, total
// CO₂ avoided, payback years, etc.). Accent colors land on the value
// so the page reads at-a-glance: blue = neutral, gold = positive,
// red = negative.

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    paddingTop: 10,
    paddingBottom: 12,
    marginBottom: 14,
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
  },
  label: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: '#71717A',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontFamily: 'Courier-Bold',
    fontSize: 28,
    lineHeight: 1.1,
  },
  unit: {
    fontFamily: 'Courier',
    fontSize: 11,
    color: '#71717A',
    marginTop: 4,
  },
});

type Tone = 'neutral' | 'positive' | 'negative';

const TONE_COLOR: Record<Tone, string> = {
  neutral: '#0B0F19',
  positive: '#F59E0B',
  negative: '#EF4444',
};

const TONE_BORDER: Record<Tone, string> = {
  neutral: '#3B82F6',
  positive: '#F59E0B',
  negative: '#EF4444',
};

interface Props {
  label: string;
  value: string;
  unit?: string;
  tone?: Tone;
}

export function PDFMetricCallout({
  label,
  value,
  unit,
  tone = 'neutral',
}: Props) {
  return (
    <View style={[styles.container, { borderTopColor: TONE_BORDER[tone] }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, { color: TONE_COLOR[tone] }]}>{value}</Text>
      {unit && <Text style={styles.unit}>{unit}</Text>}
    </View>
  );
}

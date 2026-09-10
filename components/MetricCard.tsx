import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW } from '../utils/theme';

interface Props {
  label: string;
  value: string | number;
  icon: string;
  sub?: string;
  color?: string;
}

export default function MetricCard({ label, value, icon, sub, color = COLORS.primary }: Props) {
  return (
    <View style={[styles.card, SHADOW.sm]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {sub && <Text style={styles.sub}>{sub}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: 140,
  },
  icon: { fontSize: 26, marginBottom: 6 },
  value: { fontSize: FONTS.xxl, fontWeight: '800' },
  label: { fontSize: FONTS.xs, color: COLORS.textSecondary, marginTop: 2, textAlign: 'center' },
  sub: { fontSize: FONTS.xs, color: COLORS.textMuted, marginTop: 2 },
});

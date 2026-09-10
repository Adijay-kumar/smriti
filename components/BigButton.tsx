import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW } from '../utils/theme';

interface Props {
  label: string;
  icon?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  style?: ViewStyle;
}

export default function BigButton({ label, icon, onPress, variant = 'primary', style }: Props) {
  const bg = {
    primary: COLORS.primary,
    secondary: COLORS.accent,
    danger: COLORS.danger,
    outline: COLORS.white,
  }[variant];

  const textColor = variant === 'outline' ? COLORS.primary : COLORS.white;
  const border = variant === 'outline' ? { borderWidth: 2.5, borderColor: COLORS.primary } : {};

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: bg }, border, SHADOW.md, style]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 28,
    borderRadius: RADIUS.xl,
    gap: 12,
    minHeight: 72,
  },
  icon: {
    fontSize: 28,
  },
  label: {
    fontSize: FONTS.xl,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

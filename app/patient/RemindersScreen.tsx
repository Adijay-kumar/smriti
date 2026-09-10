import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../utils/theme';

interface Props { navigation: any; }

const REMINDERS = [
  { time: '8:00 AM', label: 'Morning Medication', icon: '💊', done: true },
  { time: '10:00 AM', label: 'Memory Exercise', icon: '🧠', done: true },
  { time: '1:00 PM', label: 'Lunch & Rest', icon: '🍽️', done: false },
  { time: '4:00 PM', label: 'Evening Walk', icon: '🚶', done: false },
  { time: '6:00 PM', label: 'Family Video Call', icon: '📹', done: false },
  { time: '9:00 PM', label: 'Night Medication', icon: '💊', done: false },
];

export default function RemindersScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.title}>🔔 Today's Reminders</Text>
        <Text style={styles.date}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>

        {REMINDERS.map((r, i) => (
          <View key={i} style={[styles.row, r.done && styles.rowDone, SHADOW.sm]}>
            <Text style={styles.icon}>{r.icon}</Text>
            <View style={styles.info}>
              <Text style={[styles.time, r.done && styles.textDone]}>{r.time}</Text>
              <Text style={[styles.label, r.done && styles.textDone]}>{r.label}</Text>
            </View>
            <Text style={styles.check}>{r.done ? '✅' : '⏳'}</Text>
          </View>
        ))}

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back to Home</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.patientBg },
  scroll: { padding: 20, gap: 14, paddingBottom: 40 },
  title: { fontSize: FONTS.xxl, fontWeight: '800', color: COLORS.textPrimary },
  date: { fontSize: FONTS.md, color: COLORS.textSecondary },
  row: {
    backgroundColor: COLORS.white, borderRadius: RADIUS.lg,
    padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14,
  },
  rowDone: { opacity: 0.55 },
  icon: { fontSize: 32 },
  info: { flex: 1 },
  time: { fontSize: FONTS.md, fontWeight: '700', color: COLORS.primary },
  label: { fontSize: FONTS.xl, fontWeight: '600', color: COLORS.textPrimary, marginTop: 2 },
  textDone: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  check: { fontSize: 24 },
  back: { alignSelf: 'center', padding: 12, marginTop: 8 },
  backText: { fontSize: FONTS.md, color: COLORS.textSecondary, fontWeight: '600' },
});

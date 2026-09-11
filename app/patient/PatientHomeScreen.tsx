import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, Alert,
} from 'react-native';
import BigButton from '../../components/BigButton';
import { getPatient } from '../../utils/storage';
import { Patient } from '../../utils/mockData';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../utils/theme';

interface Props { navigation: any; route: any; }

const REMINDERS = [
  { time: '8:00 AM', label: 'Morning Medication 💊' },
  { time: '1:00 PM', label: 'Lunch & Rest 🍽️' },
  { time: '4:00 PM', label: 'Memory Exercise 🧠' },
  { time: '9:00 PM', label: 'Evening Medication 💊' },
];

export default function PatientHomeScreen({ navigation, route }: Props) {
  const { patientId = 'p001' } = route.params || {};
  const [patient, setPatient] = useState<Patient | null>(null);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  useEffect(() => {
    getPatient(patientId).then(setPatient);
  }, [patientId]);

  const handleHelp = () =>
    Alert.alert('🆘 Help', 'Calling your caregiver Dr. Priya Nair…\n\nPhone: 98765-43210', [
      { text: 'Call Now', style: 'destructive' },
      { text: 'Cancel' },
    ]);

    
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Greeting card */}
        <View style={[styles.greetCard, SHADOW.md]}>
          <Text style={styles.avatar}>{patient?.avatar ?? '👴'}</Text>
          <Text style={styles.greeting}>
            {greeting}, {patient?.name?.split(' ')[0] ?? 'there'} 👋
          </Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}</Text>
        </View>

        {/* Primary CTA */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Today's Activity</Text>
          <BigButton
            label="Start Memory Game"
            icon="🧠"
            onPress={() => navigation.navigate('Game', { patientId })}
          />
        </View>

        {/* Quick actions */}
        <View style={styles.row}>
          <BigButton
            label="Reminders"
            icon="🔔"
            variant="outline"
            style={{ flex: 1 }}
            onPress={() => navigation.navigate('Reminders')}
          />
          <BigButton
            label="Talk to Me"
            icon="🔊"
            variant="outline"
            style={{ flex: 1 }}
            onPress={() => Alert.alert('🔊 Voice', 'Voice assistant coming soon!\n\nSay: "Start game" or "Show reminders"')}
          />
        </View>

        {/* Today's reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Today's Schedule</Text>
          {REMINDERS.map((r, i) => (
            <View key={i} style={[styles.reminderRow, SHADOW.sm]}>
              <Text style={styles.reminderTime}>{r.time}</Text>
              <Text style={styles.reminderLabel}>{r.label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.row}>
  <BigButton
    label="My ID Card"
    icon="🪪"
    variant="outline"
    style={{ flex: 1 }}
    onPress={() =>
      navigation.navigate('IDCard', { patientId })
    }
  />
</View>

        {/* SOS */}
        <BigButton
          label="I Need Help"
          icon="🆘"
          variant="danger"
          onPress={handleHelp}
          style={{ marginTop: 8 }}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.patientBg },
  scroll: { padding: 20, gap: 18, paddingBottom: 40 },
  greetCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  avatar: { fontSize: 52 },
  greeting: { fontSize: FONTS.xxl, fontWeight: '800', color: COLORS.white, textAlign: 'center' },
  date: { fontSize: FONTS.md, color: 'rgba(255,255,255,0.8)' },
  section: { gap: 12 },
  sectionLabel: { fontSize: FONTS.lg, fontWeight: '700', color: COLORS.textPrimary },
  row: { flexDirection: 'row', gap: 12 },
  reminderRow: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  reminderTime: { fontSize: FONTS.md, fontWeight: '700', color: COLORS.primary, minWidth: 75 },
  reminderLabel: { fontSize: FONTS.lg, color: COLORS.textPrimary, flex: 1 },
});

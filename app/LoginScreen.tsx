import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image,
} from 'react-native';
import { initStorage } from '../utils/storage';
import { COLORS, FONTS, RADIUS, SHADOW } from '../utils/theme';

interface Props {
  navigation: any;
}

export default function LoginScreen({ navigation }: Props) {
  useEffect(() => { initStorage(); }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Logo */}
        <View style={styles.header}>
          <Text style={styles.logo}>🧠</Text>
          <Text style={styles.appName}>Smriti</Text>
          <Text style={styles.tagline}>Caring through memory</Text>
        </View>

        {/* Role selection */}
        <Text style={styles.prompt}>Who are you?</Text>

        <TouchableOpacity
          style={[styles.roleCard, { backgroundColor: COLORS.primaryLight, borderColor: COLORS.primary }]}
          onPress={() => navigation.navigate('PatientHome', { patientId: 'p001' })}
          activeOpacity={0.85}
        >
          <Text style={styles.roleIcon}>👴</Text>
          <View>
            <Text style={[styles.roleTitle, { color: COLORS.primary }]}>I am a Patient</Text>
            <Text style={styles.roleSub}>Play memory games & view reminders</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleCard, { backgroundColor: COLORS.accentLight, borderColor: COLORS.accent }]}
          onPress={() => navigation.navigate('CaregiverHome')}
          activeOpacity={0.85}
        >
          <Text style={styles.roleIcon}>👩‍⚕️</Text>
          <View>
            <Text style={[styles.roleTitle, { color: COLORS.accent }]}>I am a Caregiver</Text>
            <Text style={styles.roleSub}>Monitor patients & adjust settings</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.demoNote}>Demo mode — tap to explore</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 28, justifyContent: 'center', gap: 16 },
  header: { alignItems: 'center', marginBottom: 20 },
  logo: { fontSize: 72, marginBottom: 8 },
  appName: { fontSize: 42, fontWeight: '800', color: COLORS.primary, letterSpacing: -1 },
  tagline: { fontSize: FONTS.md, color: COLORS.textSecondary, marginTop: 4 },
  prompt: { fontSize: FONTS.lg, fontWeight: '600', color: COLORS.textPrimary, textAlign: 'center' },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    padding: 22,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    ...SHADOW.sm,
  },
  roleIcon: { fontSize: 44 },
  roleTitle: { fontSize: FONTS.xl, fontWeight: '700' },
  roleSub: { fontSize: FONTS.sm, color: COLORS.textSecondary, marginTop: 2 },
  demoNote: { textAlign: 'center', color: COLORS.textMuted, fontSize: FONTS.sm, marginTop: 8 },
});

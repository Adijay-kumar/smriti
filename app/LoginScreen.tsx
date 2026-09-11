import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  SafeAreaView, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW } from '../utils/theme';
import { api } from '../utils/api';
import { saveUser } from '../utils/storage';

interface Props { navigation: any; }

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleLogin() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.login(email.trim(), password.trim());

      if (res.detail || res.error) {
        Alert.alert('Login failed', res.detail || res.error);
        return;
      }

      // res = { access_token, user_id, name, role, patient_id }
      await saveUser(res);

      if (res.role === 'patient') {
        if (!res.patient_id) {
          Alert.alert('Account issue', 'No patient profile linked to this account. Contact your caregiver.');
          return;
        }
        navigation.replace('PatientHome', { patientId: res.patient_id });
      } else {
        navigation.replace('CaregiverHome', { caregiverId: res.user_id });
      }
    } catch (e) {
      Alert.alert('Network error', 'Could not reach server. Check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        <View style={styles.header}>
          <Text style={styles.logo}>🧠</Text>
          <Text style={styles.appName}>Smriti</Text>
          <Text style={styles.tagline}>Caring through memory</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.btn}
          onPress={handleLogin}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Sign In</Text>}
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: 28, justifyContent: 'center', gap: 16 },
  header:    { alignItems: 'center', marginBottom: 24 },
  logo:      { fontSize: 72, marginBottom: 8 },
  appName:   { fontSize: 42, fontWeight: '800', color: COLORS.primary, letterSpacing: -1 },
  tagline:   { fontSize: FONTS.md, color: COLORS.textSecondary, marginTop: 4 },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border ?? '#ddd',
    borderRadius: RADIUS.md,
    padding: 16,
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    backgroundColor: '#fff',
  },
  btn: {
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    marginTop: 8,
    ...SHADOW.sm,
  },
  btnText: { color: '#fff', fontSize: FONTS.lg, fontWeight: '700' },
});
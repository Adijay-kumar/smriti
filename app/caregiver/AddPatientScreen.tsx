import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../utils/theme';
import { api } from '../../utils/api';
import { getPatients } from '../../utils/storage';

interface Props {
  navigation: any;
  route: { params: { caregiverId: string } };
}

export default function AddPatientScreen({ navigation, route }: Props) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!name.trim() || !age.trim()) {
      Alert.alert('Missing fields', 'Name and age required');
      return;
    }

    setLoading(true);
    try {
      const res = await api.createPatient(route.params.caregiverId, {
        name: name.trim(),
        age: parseInt(age),
        language,
      });

      if (res.detail || res.error) {
        Alert.alert('Error', res.detail || res.error);
        return;
      }

      Alert.alert('Success', 'Patient added');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', 'Could not add patient');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Text style={styles.title}>Add Patient</Text>

        <TextInput
          style={styles.input}
          placeholder="Patient name"
          value={name}
          onChangeText={setName}
        />

        <TextInput
          style={styles.input}
          placeholder="Age"
          keyboardType="number-pad"
          value={age}
          onChangeText={setAge}
        />

        <Text style={styles.label}>Language</Text>
        <View style={styles.langRow}>
          {['English', 'Hindi', 'Bengali'].map(lang => (
            <TouchableOpacity
              key={lang}
              style={[
                styles.langBtn,
                language === lang && { backgroundColor: COLORS.primary }
              ]}
              onPress={() => setLanguage(lang)}
            >
              <Text style={[styles.langText, language === lang && { color: '#fff' }]}>
                {lang}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.btn}
          onPress={handleAdd}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>Add Patient</Text>}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, gap: 16 },
  title: { fontSize: FONTS.xxl, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 12 },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border ?? '#ddd',
    borderRadius: RADIUS.md,
    padding: 12,
    fontSize: FONTS.md,
    color: COLORS.textPrimary,
    backgroundColor: '#fff',
  },
  label: { fontSize: FONTS.md, fontWeight: '700', color: COLORS.textPrimary, marginTop: 8 },
  langRow: { flexDirection: 'row', gap: 10 },
  langBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border ?? '#ddd',
    alignItems: 'center',
  },
  langText: { fontSize: FONTS.sm, fontWeight: '600', color: COLORS.textSecondary },
  btn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    marginTop: 16,
    ...SHADOW.sm,
  },
  btnText: { color: '#fff', fontSize: FONTS.lg, fontWeight: '700' },
});
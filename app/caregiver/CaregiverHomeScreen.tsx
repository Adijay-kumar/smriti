import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { getPatients, getSessions } from '../../utils/storage';
import { getPatientStats } from '../../utils/adaptive';
import { Patient, GameSession } from '../../utils/mockData';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../utils/theme';
import { api } from '../../utils/api';


interface Props { 
  navigation: any;
  route?: { params?: { caregiverId?: string } };
}

interface PatientWithStats extends Patient {
  stats: ReturnType<typeof getPatientStats>;
}

// TO
export default function CaregiverHomeScreen({ navigation, route }: Props) {
  const [patients, setPatients] = useState<PatientWithStats[]>([]);
const [refreshing, setRefreshing] = useState(false);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

const caregiverId = route?.params?.caregiverId;

const load = useCallback(async () => {
  setLoading(true);
  setError(null);
  console.warn('Function check:', {
  getPatients: typeof getPatients,
  apiGetPatients: typeof api.getPatients,
  getSessions: typeof getSessions,
  getPatientStats: typeof getPatientStats,
});


  try {
    if (!caregiverId) {
      throw new Error('Missing caregiver ID. Please sign in again.');
    }

    const pts = await getPatients(caregiverId);
    const sessions = await getSessions();

    const enriched: PatientWithStats[] = pts.map(patient => ({
      ...patient,
      stats: getPatientStats(
        sessions.filter(session => session.patientId === patient.id)
      ),
    }));

    setPatients(enriched);
  } catch (err) {
    setPatients([]);

    const message =
      err instanceof Error
        ? err.message
        : 'Could not load patients. Please try again.';

    setError(message);
    console.warn(
  'ORIGINAL PATIENT ERROR:',
  err instanceof Error ? err.stack : String(err)
);

  } finally {
    setLoading(false);
  }
}, [caregiverId]);

useEffect(() => {
  void load();
}, [load]);

const onRefresh = async () => {
  setRefreshing(true);

  try {
    await load();
  } finally {
    setRefreshing(false);
  }
};

  const diffColor = (d: number) => d === 1 ? '#27AE60' : d === 2 ? COLORS.accent : COLORS.danger;
  const diffLabel = (d: number) => ['', 'Easy', 'Medium', 'Hard'][d];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* Header */}
        <View style={styles.headerAction}>
          <View>
            <Text style={styles.title}>My Patients</Text>
            <Text style={styles.sub}>{patients.length} patients</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddPatient', { caregiverId })}
          >
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        

        {/* Summary chips */}
        <View style={styles.chips}>
          <View style={[styles.chip, { backgroundColor: COLORS.primaryLight }]}>
            <Text style={[styles.chipText, { color: COLORS.primary }]}>
              {patients.filter(p => (p.stats?.avgAccuracy ?? 0) >= 70).length} Doing Well
            </Text>
          </View>
          <View style={[styles.chip, { backgroundColor: COLORS.dangerLight }]}>
            <Text style={[styles.chipText, { color: COLORS.danger }]}>
              {patients.filter(p => (p.stats?.avgAccuracy ?? 100) < 60).length} Needs Attention
            </Text>
          </View>
        </View>
        {loading ? (
  <Text style={styles.sub}>Loading patients…</Text>
) : error ? (
  <View>
    <Text accessibilityRole="alert" style={styles.sub}>
      {error}
    </Text>

    <TouchableOpacity
      accessibilityRole="button"
      onPress={() => void load()}
      style={{ paddingVertical: 16 }}
    >
      <Text style={{ color: COLORS.primary, fontWeight: '700' }}>
        Try Again
      </Text>
    </TouchableOpacity>
  </View>
) : patients.length === 0 ? (
  <Text style={styles.sub}>
    No patients are linked to this caregiver account.
  </Text>
) : null}


        {/* Patient cards */}
        {patients.map(p => (
          <TouchableOpacity
            key={p.id}
            style={[styles.patientCard, SHADOW.sm]}
            onPress={() => navigation.navigate('Analysis', { patientId: p.id })}
            activeOpacity={0.85}
          >
            <View style={styles.cardTop}>
              <Text style={styles.avatar}>{p.avatar}</Text>
              <View style={styles.cardInfo}>
                <Text style={styles.name}>{p.name}</Text>
                <Text style={styles.age}>Age {p.age} · {p.language}</Text>
              </View>
              <View style={[styles.diffBadge, { backgroundColor: diffColor(p.difficulty) + '22', borderColor: diffColor(p.difficulty) }]}>
                <Text style={[styles.diffText, { color: diffColor(p.difficulty) }]}>
                  {diffLabel(p.difficulty)}
                </Text>
              </View>
            </View>

            {/* Mini stats */}
            {p.stats && (
              <View style={styles.miniStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statVal}>{p.stats.avgAccuracy}%</Text>
                  <Text style={styles.statLabel}>Accuracy</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statVal}>{p.stats.completionRate}%</Text>
                  <Text style={styles.statLabel}>Completion</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statVal}>{p.stats.totalSessions}</Text>
                  <Text style={styles.statLabel}>Sessions</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statVal, {
                    color: p.stats.trend > 0 ? '#27AE60' : p.stats.trend < 0 ? COLORS.danger : COLORS.textSecondary
                  }]}>
                    {p.stats.trend > 0 ? '↑' : p.stats.trend < 0 ? '↓' : '→'}
                  </Text>
                  <Text style={styles.statLabel}>Trend</Text>
                </View>
              </View>
            )}

            <Text style={styles.tapHint}>Tap for full analysis →</Text>
          </TouchableOpacity>
        ))}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: FONTS.xxl, fontWeight: '800', color: COLORS.textPrimary },
  sub: { fontSize: FONTS.sm, color: COLORS.textSecondary, marginTop: 2 },
  headerIcon: { fontSize: 44 },
  chips: { flexDirection: 'row', gap: 10 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: RADIUS.full },
  chipText: { fontSize: FONTS.sm, fontWeight: '700' },
  headerAction: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addBtn: { backgroundColor: COLORS.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: RADIUS.full },
  addBtnText: { color: '#fff', fontSize: FONTS.sm, fontWeight: '700' },
  patientCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: 18,
    gap: 14,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { fontSize: 36 },
  cardInfo: { flex: 1 },
  name: { fontSize: FONTS.xl, fontWeight: '700', color: COLORS.textPrimary },
  age: { fontSize: FONTS.sm, color: COLORS.textSecondary },
  diffBadge: { borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  diffText: { fontSize: FONTS.xs, fontWeight: '700' },
  miniStats: { flexDirection: 'row', backgroundColor: COLORS.background, borderRadius: RADIUS.md, padding: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: FONTS.lg, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: COLORS.border },
  tapHint: { fontSize: FONTS.xs, color: COLORS.textMuted, textAlign: 'right' },
});

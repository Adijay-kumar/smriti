import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert,
} from 'react-native';
import MetricCard from '../../components/MetricCard';
import { getPatient, getRecentSessions, updatePatient } from '../../utils/storage';
import { evaluatePerformance, getPatientStats } from '../../utils/adaptive';
import { Patient, GameSession, DIFFICULTY_LABELS } from '../../utils/mockData';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../utils/theme';

interface Props { navigation: any; route: any; }

export default function AnalysisScreen({ navigation, route }: Props) {
  const { patientId } = route.params;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [sessions, setSessions] = useState<GameSession[]>([]);

  useEffect(() => {
    Promise.all([
      getPatient(patientId),
      getRecentSessions(patientId, 7),
    ]).then(([p, s]) => {
      setPatient(p);
      setSessions(s);
    });
  }, [patientId]);

  const stats = getPatientStats(sessions);
  const adaptation = patient ? evaluatePerformance(sessions, patient.difficulty) : null;

  const handleDifficultyChange = async (newDiff: 1 | 2 | 3) => {
    if (!patient) return;
    const updated = { ...patient, difficulty: newDiff };
    await updatePatient(updated);
    setPatient(updated);
    Alert.alert('✅ Updated', `Difficulty set to ${DIFFICULTY_LABELS[newDiff]} for ${patient.name}`);
  };

  const adaptationColor = {
    increase: '#27AE60',
    decrease: COLORS.danger,
    maintain: COLORS.accent,
  }[adaptation?.recommendation ?? 'maintain'];

  const adaptationIcon = {
    increase: '📈',
    decrease: '📉',
    maintain: '📊',
  }[adaptation?.recommendation ?? 'maintain'];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Patient header */}
        <View style={[styles.header, SHADOW.md]}>
          <Text style={styles.avatar}>{patient?.avatar ?? '👴'}</Text>
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{patient?.name}</Text>
            <Text style={styles.sub}>Age {patient?.age} · {patient?.language}</Text>
            <Text style={styles.sub}>Difficulty: {DIFFICULTY_LABELS[patient?.difficulty ?? 1]}</Text>
          </View>
        </View>

        {/* Metrics row */}
        {stats && (
          <>
            <Text style={styles.sectionTitle}>Performance (Last 7 Days)</Text>
            <View style={styles.metricsRow}>
              <MetricCard label="Accuracy" value={`${stats.avgAccuracy}%`} icon="🎯" color={stats.avgAccuracy >= 70 ? '#27AE60' : COLORS.danger} />
              <MetricCard label="Completion" value={`${stats.completionRate}%`} icon="✅" />
            </View>
            <View style={styles.metricsRow}>
              <MetricCard label="Avg Response" value={`${stats.avgResponseTime}s`} icon="⏱️" color={COLORS.accent} />
              <MetricCard label="Total Score" value={stats.totalScore} icon="⭐" />
            </View>
          </>
        )}

        {/* Adaptive engine recommendation */}
        {adaptation && (
          <>
            <Text style={styles.sectionTitle}>Adaptive Engine</Text>
            <View style={[styles.adaptCard, { borderColor: adaptationColor, backgroundColor: adaptationColor + '12' }, SHADOW.sm]}>
              <Text style={styles.adaptIcon}>{adaptationIcon}</Text>
              <View style={styles.adaptInfo}>
                <Text style={[styles.adaptTitle, { color: adaptationColor }]}>
                  {adaptation.recommendation === 'increase' ? 'Increase Difficulty'
                   : adaptation.recommendation === 'decrease' ? 'Decrease Difficulty'
                   : 'Maintain Difficulty'}
                </Text>
                <Text style={styles.adaptReason}>{adaptation.reason}</Text>
              </View>
            </View>
          </>
        )}

        {/* Session history */}
        <Text style={styles.sectionTitle}>Recent Sessions</Text>
        <View style={styles.sessionsTable}>
          <View style={styles.tableHeader}>
            {['Date', 'Accuracy', 'Time', 'Score'].map(h => (
              <Text key={h} style={styles.tableHead}>{h}</Text>
            ))}
          </View>
          {sessions.slice(0, 7).map((s, i) => (
            <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
              <Text style={styles.tableCell}>{s.date.slice(5)}</Text>
              <Text style={[styles.tableCell, { color: s.accuracy >= 70 ? '#27AE60' : COLORS.danger, fontWeight: '700' }]}>
                {s.accuracy}%
              </Text>
              <Text style={styles.tableCell}>{s.avgResponseTime}s</Text>
              <Text style={styles.tableCell}>⭐{s.score}</Text>
            </View>
          ))}
        </View>

        {/* Manual difficulty override */}
        <Text style={styles.sectionTitle}>Override Difficulty</Text>
        <View style={styles.diffRow}>
          {([1, 2, 3] as const).map(d => (
            <TouchableOpacity
              key={d}
              style={[
                styles.diffBtn,
                patient?.difficulty === d && styles.diffBtnActive,
              ]}
              onPress={() => handleDifficultyChange(d)}
            >
              <Text style={[styles.diffBtnText, patient?.difficulty === d && styles.diffBtnTextActive]}>
                {DIFFICULTY_LABELS[d]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back to Patients</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  scroll: { padding: 20, gap: 16, paddingBottom: 40 },
  header: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  avatar: { fontSize: 44 },
  headerInfo: { flex: 1 },
  name: { fontSize: FONTS.xxl, fontWeight: '800', color: COLORS.white },
  sub: { fontSize: FONTS.sm, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  sectionTitle: { fontSize: FONTS.lg, fontWeight: '700', color: COLORS.textPrimary },
  metricsRow: { flexDirection: 'row', gap: 12 },
  adaptCard: {
    flexDirection: 'row',
    gap: 14,
    padding: 18,
    borderRadius: RADIUS.xl,
    borderWidth: 2,
    alignItems: 'center',
  },
  adaptIcon: { fontSize: 36 },
  adaptInfo: { flex: 1 },
  adaptTitle: { fontSize: FONTS.lg, fontWeight: '700' },
  adaptReason: { fontSize: FONTS.sm, color: COLORS.textSecondary, marginTop: 4 },
  sessionsTable: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOW.sm },
  tableHeader: { flexDirection: 'row', backgroundColor: COLORS.primaryLight, padding: 12 },
  tableHead: { flex: 1, fontSize: FONTS.xs, fontWeight: '700', color: COLORS.primary, textAlign: 'center' },
  tableRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10 },
  tableRowAlt: { backgroundColor: '#F9FCFB' },
  tableCell: { flex: 1, fontSize: FONTS.sm, color: COLORS.textPrimary, textAlign: 'center' },
  diffRow: { flexDirection: 'row', gap: 12 },
  diffBtn: {
    flex: 1, padding: 16, borderRadius: RADIUS.lg, alignItems: 'center',
    backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.border, ...SHADOW.sm,
  },
  diffBtnActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  diffBtnText: { fontSize: FONTS.md, fontWeight: '700', color: COLORS.textSecondary },
  diffBtnTextActive: { color: COLORS.white },
  backBtn: { alignSelf: 'center', padding: 12 },
  backText: { fontSize: FONTS.md, color: COLORS.textSecondary, fontWeight: '600' },
});

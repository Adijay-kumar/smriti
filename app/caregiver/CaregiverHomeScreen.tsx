import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { getPatients, getSessions } from '../../utils/storage';
import { getPatientStats } from '../../utils/adaptive';
import { Patient, GameSession } from '../../utils/mockData';
import { COLORS, FONTS, RADIUS, SHADOW } from '../../utils/theme';

interface Props { navigation: any; }

interface PatientWithStats extends Patient {
  stats: ReturnType<typeof getPatientStats>;
}

export default function CaregiverHomeScreen({ navigation }: Props) {
  const [patients, setPatients] = useState<PatientWithStats[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const pts = await getPatients();
    const all = await getSessions();
    const enriched = pts.map(p => ({
      ...p,
      stats: getPatientStats(all.filter(s => s.patientId === p.id)),
    }));
    setPatients(enriched);
  }, []);

  useEffect(() => { load(); }, []);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const diffColor = (d: number) => d === 1 ? '#27AE60' : d === 2 ? COLORS.accent : COLORS.danger;
  const diffLabel = (d: number) => ['', 'Easy', 'Medium', 'Hard'][d];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>My Patients</Text>
            <Text style={styles.sub}>Dr. Priya Nair · {patients.length} patients</Text>
          </View>
          <Text style={styles.headerIcon}>👩‍⚕️</Text>
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

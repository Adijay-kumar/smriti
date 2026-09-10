import { GameSession, Patient } from './mockData';
import { updatePatient } from './storage';

interface PerformanceResult {
  recommendation: 'increase' | 'decrease' | 'maintain';
  reason: string;
  newDifficulty: 1 | 2 | 3;
}

export function evaluatePerformance(
  sessions: GameSession[],
  currentDifficulty: 1 | 2 | 3
): PerformanceResult {
  if (sessions.length < 2) {
    return {
      recommendation: 'maintain',
      reason: 'Not enough data yet',
      newDifficulty: currentDifficulty,
    };
  }

  const recent = sessions.slice(0, 3); // last 3 sessions
  const avgAccuracy = recent.reduce((s, g) => s + g.accuracy, 0) / recent.length;
  const avgTime = recent.reduce((s, g) => s + g.avgResponseTime, 0) / recent.length;
  const completionRate = recent.filter(g => g.completed).length / recent.length;

  // High performance → increase difficulty
  if (avgAccuracy >= 85 && avgTime <= 4 && completionRate >= 0.8) {
    const next = Math.min(3, currentDifficulty + 1) as 1 | 2 | 3;
    return {
      recommendation: 'increase',
      reason: `Accuracy ${avgAccuracy.toFixed(0)}%, avg ${avgTime.toFixed(1)}s — doing great!`,
      newDifficulty: next,
    };
  }

  // Low performance → decrease difficulty
  if (avgAccuracy < 50 || avgTime > 8 || completionRate < 0.5) {
    const next = Math.max(1, currentDifficulty - 1) as 1 | 2 | 3;
    return {
      recommendation: 'decrease',
      reason: `Accuracy ${avgAccuracy.toFixed(0)}%, avg ${avgTime.toFixed(1)}s — let's make it easier`,
      newDifficulty: next,
    };
  }

  return {
    recommendation: 'maintain',
    reason: `Accuracy ${avgAccuracy.toFixed(0)}% — steady progress`,
    newDifficulty: currentDifficulty,
  };
}

export async function applyAdaptation(patient: Patient, sessions: GameSession[]): Promise<PerformanceResult> {
  const result = evaluatePerformance(sessions, patient.difficulty);
  if (result.newDifficulty !== patient.difficulty) {
    await updatePatient({ ...patient, difficulty: result.newDifficulty });
  }
  return result;
}

export function getPatientStats(sessions: GameSession[]) {
  if (!sessions.length) return null;
  const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

  return {
    avgAccuracy: Math.round(avg(sessions.map(s => s.accuracy))),
    avgResponseTime: Math.round(avg(sessions.map(s => s.avgResponseTime)) * 10) / 10,
    totalSessions: sessions.length,
    completionRate: Math.round((sessions.filter(s => s.completed).length / sessions.length) * 100),
    totalScore: sessions.reduce((a, s) => a + s.score, 0),
    trend: sessions.length >= 2
      ? sessions[0].accuracy - sessions[sessions.length - 1].accuracy
      : 0,
  };
}

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Patient, GameSession, DEMO_PATIENTS, DEMO_SESSIONS } from './mockData';

const KEYS = {
  PATIENTS: 'smriti_patients',
  SESSIONS: 'smriti_sessions',
  CURRENT_USER: 'smriti_current_user',
};

export async function initStorage() {
  const existing = await AsyncStorage.getItem(KEYS.PATIENTS);
  if (!existing) {
    await AsyncStorage.setItem(KEYS.PATIENTS, JSON.stringify(DEMO_PATIENTS));
    await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(DEMO_SESSIONS));
  }
}

export async function getPatients(): Promise<Patient[]> {
  const raw = await AsyncStorage.getItem(KEYS.PATIENTS);
  return raw ? JSON.parse(raw) : DEMO_PATIENTS;
}

export async function getPatient(id: string): Promise<Patient | null> {
  const patients = await getPatients();
  return patients.find(p => p.id === id) || null;
}

export async function updatePatient(updated: Patient): Promise<void> {
  const patients = await getPatients();
  const idx = patients.findIndex(p => p.id === updated.id);
  if (idx !== -1) {
    patients[idx] = updated;
    await AsyncStorage.setItem(KEYS.PATIENTS, JSON.stringify(patients));
  }
}

export async function getSessions(patientId?: string): Promise<GameSession[]> {
  const raw = await AsyncStorage.getItem(KEYS.SESSIONS);
  const all: GameSession[] = raw ? JSON.parse(raw) : DEMO_SESSIONS;
  return patientId ? all.filter(s => s.patientId === patientId) : all;
}

export async function saveSession(session: GameSession): Promise<void> {
  const sessions = await getSessions();
  sessions.push(session);
  await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
}

export async function getRecentSessions(patientId: string, days = 7): Promise<GameSession[]> {
  const sessions = await getSessions(patientId);
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return sessions
    .filter(s => new Date(s.date) >= cutoff)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

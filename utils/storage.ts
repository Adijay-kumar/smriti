import AsyncStorage from '@react-native-async-storage/async-storage';
import { Patient, GameSession, DEMO_PATIENTS, DEMO_SESSIONS } from './mockData';
import { api } from './api';

const KEYS = {
  PATIENTS: 'smriti_patients',
  SESSIONS: 'smriti_sessions',
  CURRENT_USER: 'smriti_current_user',
};

export async function saveUser(user: {
  access_token: string;
  user_id: string;
  name: string;
  role: string;
  patient_id?: string | null;
}) {
  await AsyncStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
}

export async function getUser() {
  const raw = await AsyncStorage.getItem(KEYS.CURRENT_USER);
  return raw ? JSON.parse(raw) : null;
}

export async function clearUser() {
  await AsyncStorage.removeItem(KEYS.CURRENT_USER);
}

export async function initStorage() {
  const existing = await AsyncStorage.getItem(KEYS.PATIENTS);
  if (!existing) {
    await AsyncStorage.setItem(KEYS.PATIENTS, JSON.stringify(DEMO_PATIENTS));
    await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(DEMO_SESSIONS));
  }
}

export async function getPatients(caregiverId?: string) {
  if (!caregiverId) {
    console.warn('getPatients called without caregiverId');
    return [];
  }
  try {
    return await api.getPatients(caregiverId);
  } catch (e) {
    console.error('getPatients error:', e);
    return [];
  }
}

export async function getPatient(id: string): Promise<Patient | null> {
  // Note: This requires caregiverId — if you need to get by patient id alone,
  // pass it to getPatients and find it there
  const raw = await AsyncStorage.getItem(KEYS.PATIENTS);
  const all: Patient[] = raw ? JSON.parse(raw) : DEMO_PATIENTS;
  return all.find(p => p.id === id) || null;
}

export async function updatePatient(updated: Patient): Promise<void> {
  const raw = await AsyncStorage.getItem(KEYS.PATIENTS);
  const patients: Patient[] = raw ? JSON.parse(raw) : [];
  const idx = patients.findIndex(p => p.id === updated.id);
  if (idx !== -1) {
    patients[idx] = updated;
    await AsyncStorage.setItem(KEYS.PATIENTS, JSON.stringify(patients));
  }
}

export async function getSessions(patientId?: string): Promise<GameSession[]> {
  const raw = await AsyncStorage.getItem(KEYS.SESSIONS);
  const all: GameSession[] = raw ? JSON.parse(raw) : [];
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
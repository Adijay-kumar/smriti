// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { Patient, GameSession, DEMO_PATIENTS, DEMO_SESSIONS } from './mockData';
// import { api } from './api';

// const KEYS = {
//   PATIENTS: 'smriti_patients',
//   SESSIONS: 'smriti_sessions',
//   CURRENT_USER: 'smriti_current_user',
// };

// export async function saveUser(user: {
//   access_token: string;
//   user_id: string;
//   name: string;
//   role: string;
//   patient_id?: string | null;
// }) {
//   await AsyncStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
// }

// export async function getUser() {
//   const raw = await AsyncStorage.getItem(KEYS.CURRENT_USER);
//   return raw ? JSON.parse(raw) : null;
// }

// export async function clearUser() {
//   await AsyncStorage.removeItem(KEYS.CURRENT_USER);
// }

// export async function initStorage() {
//   const existing = await AsyncStorage.getItem(KEYS.PATIENTS);
//   if (!existing) {
//     await AsyncStorage.setItem(KEYS.PATIENTS, JSON.stringify(DEMO_PATIENTS));
//     await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(DEMO_SESSIONS));
//   }
// }

// // export async function getPatients(caregiverId?: string) {
// //   if (!caregiverId) {
// //     console.warn('getPatients called without caregiverId');
// //     return [];
// //   }
// //   try {
// //     return await api.getPatients(caregiverId);
// //   } catch (e) {
// //     console.error('getPatients error:', e);
// //     return [];
// //   }
// // }

// // export async function getPatient(id: string): Promise<Patient | null> {
// //   try {
// //     const patient = await api.getPatient(id);

// //     if (patient.detail || patient.error) {
// //       console.error('getPatient API error:', patient);
// //       return null;
// //     }

// //     return patient;
// //   } catch (e) {
// //     console.error('getPatient error:', e);
// //     return null;
// //   }
// // }

// export async function getPatient(id: string): Promise<Patient | null> {
//   try {
//     const patient = await api.getPatient(id);

//     if (patient.detail || patient.error) {
//       console.error('getPatient API error:', patient);
//       return null;
//     }

//     return patient;
//   } catch (e) {
//     console.error('getPatient error:', e);
//     return null;
//   }
// }

// export async function updatePatient(updated: Patient): Promise<void> {
//   const raw = await AsyncStorage.getItem(KEYS.PATIENTS);
//   const patients: Patient[] = raw ? JSON.parse(raw) : [];
//   const idx = patients.findIndex(p => p.id === updated.id);
//   if (idx !== -1) {
//     patients[idx] = updated;
//     await AsyncStorage.setItem(KEYS.PATIENTS, JSON.stringify(patients));
//   }
// }

// export async function getSessions(patientId?: string): Promise<GameSession[]> {
//   const raw = await AsyncStorage.getItem(KEYS.SESSIONS);
//   const all: GameSession[] = raw ? JSON.parse(raw) : [];
//   return patientId ? all.filter(s => s.patientId === patientId) : all;
// }

// export async function saveSession(session: GameSession): Promise<void> {
//   const sessions = await getSessions();
//   sessions.push(session);
//   await AsyncStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
// }

// export async function getRecentSessions(patientId: string, days = 7): Promise<GameSession[]> {
//   const sessions = await getSessions(patientId);
//   const cutoff = new Date();
//   cutoff.setDate(cutoff.getDate() - days);
//   return sessions
//     .filter(s => new Date(s.date) >= cutoff)
//     .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
// }

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Patient,
  GameSession,
  DEMO_PATIENTS,
  DEMO_SESSIONS,
} from './mockData';
import { api } from './api';

console.log('### SMRITI STORAGE FILE LOADED ###');

const KEYS = {
  PATIENTS: 'smriti_patients',
  SESSIONS: 'smriti_sessions',
  CURRENT_USER: 'smriti_current_user',
};

// ─────────────────────────────────────────────
// USER STORAGE
// ─────────────────────────────────────────────

export async function saveUser(user: {
  access_token: string;
  user_id: string;
  name: string;
  role: string;
  patient_id?: string | null;
}) {
  await AsyncStorage.setItem(
    KEYS.CURRENT_USER,
    JSON.stringify(user)
  );
}

export async function getUser() {
  const raw = await AsyncStorage.getItem(KEYS.CURRENT_USER);
  return raw ? JSON.parse(raw) : null;
}

export async function clearUser() {
  await AsyncStorage.removeItem(KEYS.CURRENT_USER);
}

// ─────────────────────────────────────────────
// INITIAL STORAGE
// ─────────────────────────────────────────────

export async function initStorage() {
  const existing = await AsyncStorage.getItem(KEYS.PATIENTS);

  if (!existing) {
    await AsyncStorage.setItem(
      KEYS.PATIENTS,
      JSON.stringify(DEMO_PATIENTS)
    );

    await AsyncStorage.setItem(
      KEYS.SESSIONS,
      JSON.stringify(DEMO_SESSIONS)
    );
  }
}

// ─────────────────────────────────────────────
// PATIENTS
// ─────────────────────────────────────────────

// export async function getPatient(
//   id: string
// ): Promise<Patient | null> {

//   console.log('================================');
//   console.log('STORAGE getPatient START');
//   console.log('Storage received ID:', id);
//   console.log('api.getPatient type:', typeof api.getPatient);
//   console.log('================================');

//   try {
//     const patient = await api.getPatient(id);

//     console.log('================================');
//     console.log('STORAGE API RESULT');
//     console.log('Patient from API:', patient);
//     console.log('================================');

//     if (!patient) {
//       console.log('STORAGE: API returned NULL or UNDEFINED');
//       return null;
//     }

//     if (patient.detail || patient.error) {
//       console.error(
//         'STORAGE: API returned an error:',
//         patient
//       );
//       return null;
//     }

//     console.log('STORAGE: Patient returned successfully');

//     return patient;

//   } catch (error) {

//     console.error('================================');
//     console.error('STORAGE getPatient EXCEPTION');
//     console.error(error);
//     console.error('================================');

//     return null;
//   }
// }

export async function getPatient(
  id: string
): Promise<Patient | null> {
  try {
    return await api.getPatient(id);
  } catch (error) {
    console.warn(
      'Patient loading failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    return null;
  }
}



// ─────────────────────────────────────────────
// UPDATE PATIENT
// ─────────────────────────────────────────────

export async function updatePatient(
  updated: Patient
): Promise<void> {

  const raw = await AsyncStorage.getItem(KEYS.PATIENTS);

  const patients: Patient[] = raw
    ? JSON.parse(raw)
    : [];

  const index = patients.findIndex(
    patient => patient.id === updated.id
  );

  if (index !== -1) {
    patients[index] = updated;

    await AsyncStorage.setItem(
      KEYS.PATIENTS,
      JSON.stringify(patients)
    );
  }
}

// ─────────────────────────────────────────────
// SESSIONS
// ─────────────────────────────────────────────

export async function getSessions(
  patientId?: string
): Promise<GameSession[]> {

  const raw = await AsyncStorage.getItem(
    KEYS.SESSIONS
  );

  const all: GameSession[] = raw
    ? JSON.parse(raw)
    : [];

  if (!patientId) {
    return all;
  }

  return all.filter(
    session => session.patientId === patientId
  );
}

// ─────────────────────────────────────────────
// SAVE SESSION
// ─────────────────────────────────────────────

export async function saveSession(
  session: GameSession
): Promise<void> {

  const sessions = await getSessions();

  sessions.push(session);

  await AsyncStorage.setItem(
    KEYS.SESSIONS,
    JSON.stringify(sessions)
  );
}

// ─────────────────────────────────────────────
// RECENT SESSIONS
// ─────────────────────────────────────────────

export async function getRecentSessions(
  patientId: string,
  days = 7
): Promise<GameSession[]> {

  const sessions = await getSessions(patientId);

  const cutoff = new Date();

  cutoff.setDate(
    cutoff.getDate() - days
  );

  return sessions
    .filter(
      session =>
        new Date(session.date) >= cutoff
    )
    .sort(
      (a, b) =>
        new Date(b.date).getTime() -
        new Date(a.date).getTime()
    );
}
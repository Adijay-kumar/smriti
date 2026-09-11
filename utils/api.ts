import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.1.11:8000';

export const api = {
  login: (email: string, password: string) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(r => r.json()),

  getPatients: async (caregiverId: string) => {
    if (!caregiverId?.trim()) {
      throw new Error('Missing caregiver ID. Please sign in again.');
    }
    const raw = await AsyncStorage.getItem('smriti_current_user');
    const user = raw ? JSON.parse(raw) : null;
    if (!user?.access_token) {
      throw new Error('Please sign in again.');
    }
    const response = await fetch(
      `${BASE_URL}/patients/?caregiver_id=${encodeURIComponent(caregiverId)}`,
      {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
          Accept: 'application/json',
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Could not load patients (${response.status}).`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Invalid patient list response.');
    }
    return data;
  },

  // getPatient: async (patientId: string) => {
  //   const raw = await AsyncStorage.getItem('smriti_current_user');
  //   const user = raw ? JSON.parse(raw) : null;
  //   const token = user?.access_token;
  //   const response = await fetch(`${BASE_URL}/patients/${patientId}`, {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //       'Content-Type': 'application/json',
  //     },
  //   });
  //   if (!response.ok) {
  //     throw new Error(`Could not load patient (${response.status}).`);
  //   }
  //   return response.json();
  // },
  getPatient: async (patientId: string) => {
  const raw = await AsyncStorage.getItem('smriti_current_user');
  const user = raw ? JSON.parse(raw) : null;
  const token = user?.access_token;
  const response = await fetch(`${BASE_URL}/patients/${patientId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Could not load patient (${response.status}).`);
  }
  return response.json();
},

  register: (name: string, email: string, password: string, role: string) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    }).then(r => r.json()),

  createPatient: (caregiverId: string, data: {
    name: string;
    age: number;
    email: string;
    password: string;
    language?: string;
    difficulty?: number;
    date_of_birth?: string;
    photo_url?: string;
    location?: string;
    blood_group?: string;
    emergency_contact?: string;
    emergency_contact_name?: string;
    medical_info?: string;
  }) =>
    fetch(`${BASE_URL}/patients/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caregiver_id: caregiverId, ...data }),
    }).then(r => r.json()),

  saveSession: (session: object) =>
    fetch(`${BASE_URL}/sessions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    }).then(r => r.json()),

  getVoiceNotes: (patientId: string) =>
    fetch(`${BASE_URL}/voice-notes/?patient_id=${patientId}`).then(r => r.json()),
};
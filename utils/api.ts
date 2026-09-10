const BASE_URL = 'http://192.168.1.11:8000';
// NOT localhost! On a phone, localhost = the phone itself.
// Run: ipconfig (Windows) or ifconfig (Mac) to find your IP
// Example: 'http://192.168.1.42:8000'

export const api = {
  // Auth
  login: (email: string, password: string) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(r => r.json()),

  // Patients
  getPatients: (caregiverId: string) =>
    fetch(`${BASE_URL}/patients/?caregiver_id=${caregiverId}`).then(r => r.json()),

  // Sessions
  saveSession: (session: object) =>
    fetch(`${BASE_URL}/sessions/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(session),
    }).then(r => r.json()),

  // Voice notes
  getVoiceNotes: (patientId: string) =>
    fetch(`${BASE_URL}/voice-notes/?patient_id=${patientId}`).then(r => r.json()),
};
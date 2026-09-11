export interface Patient {
  id: string;
  name: string;
  age: number;
  language: string;
  difficulty: 1 | 2 | 3;

  caregiver_id?: string;
  caregiverId?: string;
  avatar?: string;

  date_of_birth?: string | null;
  photo_url?: string | null;
  location?: string | null;
  blood_group?: string | null;
  emergency_contact?: string | null;
  emergency_contact_name?: string | null;
  medical_info?: string | null;
}

export interface GameSession {
  id: string;
  patientId: string;
  date: string;
  accuracy: number;      // 0-100
  avgResponseTime: number; // seconds
  score: number;
  attempts: number;
  difficulty: number;
  completed: boolean;
}

export interface User {
  id: string;
  name: string;
  role: 'patient' | 'caregiver';
  patientId?: string; // if patient
}

export const DEMO_PATIENTS: Patient[] = [
  {
    id: 'p001',
    name: 'Ravi Sharma',
    age: 72,
    language: 'Hindi',
    difficulty: 1,
    caregiverId: 'c001',
    avatar: '👴',
  },
  {
    id: 'p002',
    name: 'Meena Patel',
    age: 68,
    language: 'English',
    difficulty: 2,
    caregiverId: 'c001',
    avatar: '👵',
  },
  {
    id: 'p003',
    name: 'Suresh Kumar',
    age: 75,
    language: 'Hindi',
    difficulty: 1,
    caregiverId: 'c001',
    avatar: '👴',
  },
];

// Generate last 7 days of sessions for each patient
function generateSessions(patientId: string, baseAccuracy: number): GameSession[] {
  const sessions: GameSession[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const variance = Math.floor(Math.random() * 20) - 10;
    sessions.push({
      id: `s-${patientId}-${i}`,
      patientId,
      date: date.toISOString().split('T')[0],
      accuracy: Math.min(100, Math.max(20, baseAccuracy + variance)),
      avgResponseTime: Math.round((3 + Math.random() * 4) * 10) / 10,
      score: Math.floor(Math.random() * 400) + 200,
      attempts: 10,
      difficulty: 1,
      completed: Math.random() > 0.2,
    });
  }
  return sessions;
}

export const DEMO_SESSIONS: GameSession[] = [
  ...generateSessions('p001', 72),
  ...generateSessions('p002', 85),
  ...generateSessions('p003', 58),
];

export const DEMO_USERS: User[] = [
  { id: 'c001', name: 'Dr. Priya Nair', role: 'caregiver' },
  { id: 'u-p001', name: 'Ravi Sharma', role: 'patient', patientId: 'p001' },
];

// Memory game word pairs by difficulty
export const WORD_PAIRS = {
  1: [ // Easy - common items
    ['सेब', '🍎'], ['केला', '🍌'], ['गाय', '🐄'],
    ['घर', '🏠'], ['पानी', '💧'], ['सूरज', '☀️'],
    ['चाँद', '🌙'], ['फूल', '🌸'], ['पेड़', '🌳'],
    ['किताब', '📚'],
  ],
  2: [ // Medium
    ['हाथी', '🐘'], ['रेलगाड़ी', '🚂'], ['तितली', '🦋'],
    ['बादल', '☁️'], ['मछली', '🐟'], ['पहाड़', '⛰️'],
    ['नदी', '🏞️'], ['बाज़ार', '🛒'], ['रसोई', '🍳'],
    ['खिड़की', '🪟'],
  ],
  3: [ // Hard - abstract
    ['स्वतंत्रता', '🗽'], ['संगीत', '🎵'], ['विज्ञान', '🔬'],
    ['इतिहास', '📜'], ['दर्शन', '🤔'], ['गणित', '➕'],
    ['साहित्य', '✍️'], ['कला', '🎨'], ['न्याय', '⚖️'],
    ['समाज', '👥'],
  ],
};

export const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
};

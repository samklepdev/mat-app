// ─── Medication ──────────────────────────────────────────────────────────────

export type MedicationType =
  | 'buprenorphine'
  | 'methadone'
  | 'naltrexone'
  | 'vivitrol'
  | 'suboxone'
  | 'sublocade'
  | 'other';

export interface Medication {
  id: string;
  name: string;
  type: MedicationType;
  doseMg: number;
  timesPerDay: number;
  reminderTimes: string[]; // "HH:MM" 24hr
  notes?: string;
  startDate: string; // ISO date
  active: boolean;
}

// ─── Check-in ─────────────────────────────────────────────────────────────────

export interface CheckIn {
  id: string;
  date: string; // ISO date — one per day
  mood: number; // 1–5
  sleep: number; // 1–5
  cravings: number; // 1–5 (5 = no cravings, framed positively)
  tookMedication: boolean;
  note?: string;
  createdAt: string; // ISO datetime
}

// ─── Journal ──────────────────────────────────────────────────────────────────

export interface JournalEntry {
  id: string;
  date: string; // ISO date
  prompt?: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Stability ────────────────────────────────────────────────────────────────

export interface StabilityStats {
  currentStreakDays: number;
  longestStreakDays: number;
  totalCheckIns: number;
  medicationAdherencePercent: number; // over last 30 days
  startDate: string; // when the user first started tracking
}

// ─── Saved Provider ─────────────────────────────────────────────────────────────

export interface SavedProvider {
  id: string;
  name: string;
  street1: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  website?: string;
  notes?: string;
  savedAt: string;
}

// ─── User / Settings ──────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  displayName?: string;
  treatmentStartDate: string; // ISO date
  onboardingComplete: boolean;
  notificationsEnabled: boolean;
  biometricLockEnabled: boolean;
  reminderTime: string;   // "HH:MM" 24hr, default "08:00"
  reminderNote?: string;  // optional e.g. "leave for clinic"
  createdAt: string;
}

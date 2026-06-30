import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('mat-app.db');

// ─── Schema ───────────────────────────────────────────────────────────────────

export function initDatabase(): void {
  db.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS user_profile (
      id TEXT PRIMARY KEY,
      display_name TEXT,
      treatment_start_date TEXT NOT NULL,
      onboarding_complete INTEGER NOT NULL DEFAULT 0,
      notifications_enabled INTEGER NOT NULL DEFAULT 1,
      biometric_lock_enabled INTEGER NOT NULL DEFAULT 0,
      reminder_time TEXT NOT NULL DEFAULT '08:00',
      reminder_note TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      dose_mg REAL NOT NULL,
      times_per_day INTEGER NOT NULL,
      reminder_times TEXT NOT NULL,
      notes TEXT,
      start_date TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS check_ins (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      mood INTEGER NOT NULL,
      sleep INTEGER NOT NULL,
      cravings INTEGER NOT NULL,
      took_medication INTEGER NOT NULL DEFAULT 0,
      note TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      prompt TEXT,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_check_ins_date ON check_ins(date);
    CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries(date);
  `);

  const migrations = [
    `ALTER TABLE user_profile ADD COLUMN reminder_time TEXT NOT NULL DEFAULT '08:00'`,
    `ALTER TABLE user_profile ADD COLUMN reminder_note TEXT`,
  ];

  for (const sql of migrations) {
    try {
      db.execSync(sql);
    } catch {
      // Column already exists — safe to ignore.
    }
  }
}

// ─── Profile Queries ──────────────────────────────────────────────────────────

export function getProfile() {
  return db.getFirstSync<Record<string, unknown>>(
    'SELECT * FROM user_profile WHERE onboarding_complete = 1 LIMIT 1'
  );
}

export function upsertProfile(profile: {
  id: string;
  displayName?: string;
  treatmentStartDate: string;
  notificationsEnabled: boolean;
  biometricLockEnabled: boolean;
  reminderTime: string;
  reminderNote?: string;
  createdAt: string;
}): void {
  db.runSync(
    `INSERT INTO user_profile
      (id, display_name, treatment_start_date, onboarding_complete, notifications_enabled, biometric_lock_enabled, reminder_time, reminder_note, created_at)
     VALUES (?, ?, ?, 1, ?, ?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET
       display_name = excluded.display_name,
       treatment_start_date = excluded.treatment_start_date,
       notifications_enabled = excluded.notifications_enabled,
       biometric_lock_enabled = excluded.biometric_lock_enabled,
       reminder_time = excluded.reminder_time,
       reminder_note = excluded.reminder_note`,
    [
      profile.id,
      profile.displayName ?? null,
      profile.treatmentStartDate,
      profile.notificationsEnabled ? 1 : 0,
      profile.biometricLockEnabled ? 1 : 0,
      profile.reminderTime,
      profile.reminderNote ?? null,
      profile.createdAt,
    ]
  );
}

// ─── Check-in Queries ─────────────────────────────────────────────────────────

export function getCheckInByDate(date: string) {
  return db.getFirstSync<Record<string, unknown>>(
    'SELECT * FROM check_ins WHERE date = ?',
    [date]
  );
}

export function upsertCheckIn(checkIn: {
  id: string;
  date: string;
  mood: number;
  sleep: number;
  cravings: number;
  tookMedication: boolean;
  note?: string;
  createdAt: string;
}): void {
  db.runSync(
    `INSERT INTO check_ins (id, date, mood, sleep, cravings, took_medication, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       mood = excluded.mood,
       sleep = excluded.sleep,
       cravings = excluded.cravings,
       took_medication = excluded.took_medication,
       note = excluded.note`,
    [
      checkIn.id,
      checkIn.date,
      checkIn.mood,
      checkIn.sleep,
      checkIn.cravings,
      checkIn.tookMedication ? 1 : 0,
      checkIn.note ?? null,
      checkIn.createdAt,
    ]
  );
}

export function getRecentCheckIns(limit = 30) {
  return db.getAllSync<Record<string, unknown>>(
    'SELECT * FROM check_ins ORDER BY date DESC LIMIT ?',
    [limit]
  );
}

// ─── Journal Queries ──────────────────────────────────────────────────────────

export function createJournalEntry(entry: {
  id: string;
  date: string;
  prompt?: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}): void {
  db.runSync(
    `INSERT INTO journal_entries (id, date, prompt, body, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      entry.id,
      entry.date,
      entry.prompt ?? null,
      entry.body,
      entry.createdAt,
      entry.updatedAt,
    ]
  );
}

export function getRecentJournalEntries(limit = 30) {
  return db.getAllSync<Record<string, unknown>>(
    'SELECT * FROM journal_entries ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
}

export function deleteJournalEntry(id: string): void {
  db.runSync('DELETE FROM journal_entries WHERE id = ?', [id]);
}

// ─── Stability Queries ────────────────────────────────────────────────────────

export function getCurrentStreak(): number {
  const rows = db.getAllSync<{ date: string }>(
    'SELECT date FROM check_ins WHERE took_medication = 1 ORDER BY date DESC'
  );

  if (!rows.length) return 0;

  let streak = 0;
  const today = new Date();

  for (let i = 0; i < rows.length; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);

    // Use local date components, not toISOString(), which converts to
    // UTC first and can shift the date by a day depending on timezone.
    const year = expected.getFullYear();
    const month = String(expected.getMonth() + 1).padStart(2, '0');
    const day = String(expected.getDate()).padStart(2, '0');
    const expectedStr = `${year}-${month}-${day}`;

    if (rows[i].date === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export { db };

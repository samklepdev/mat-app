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
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      dose_mg REAL NOT NULL,
      times_per_day INTEGER NOT NULL,
      reminder_times TEXT NOT NULL, -- JSON array of "HH:MM" strings
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
    const expectedStr = expected.toISOString().split('T')[0];

    if (rows[i].date === expectedStr) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

export { db };

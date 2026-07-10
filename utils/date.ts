// Centralized date helpers.
//
// Always use these instead of `new Date().toISOString().split('T')[0]`
// for "today's date" — toISOString() converts to UTC first, which can
// roll over to the wrong day depending on the user's timezone offset,
// especially right around midnight local time.

export function todayLocalISO(): string {
  return toLocalISO(new Date());
}

export function toLocalISO(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parses a "YYYY-MM-DD" string as local date components, not UTC.
// `new Date("2026-06-30")` parses as UTC midnight, which can shift to
// the wrong day once converted back to local time for comparisons.
export function parseLocalISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function isSameLocalDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

// Formats a "HH:MM" 24hr string as a locale time, e.g. "8:00 AM".
export function formatTimeHHMM(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// Parses a "HH:MM" 24hr string into a Date with today's date and that time
// — the shape @react-native-community/datetimepicker expects as a value.
export function parseTimeHHMM(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

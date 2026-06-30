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

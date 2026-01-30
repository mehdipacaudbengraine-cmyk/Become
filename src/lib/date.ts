/**
 * Date utilities for consistent day normalization across the app
 */

/**
 * Normalize a date to UTC midnight (00:00:00.000)
 * Accepts either a Date object, a "YYYY-MM-DD" string, or undefined (defaults to today)
 *
 * @param input - Date, "YYYY-MM-DD" string, or undefined
 * @returns Date object normalized to UTC midnight
 */
export function normalizeDay(input?: string | Date): Date {
  if (typeof input === 'string') {
    // Parse "YYYY-MM-DD" format
    const [year, month, day] = input.split('-').map(Number);
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
  }

  if (input instanceof Date) {
    // Normalize existing Date to UTC midnight
    return new Date(Date.UTC(
      input.getUTCFullYear(),
      input.getUTCMonth(),
      input.getUTCDate(),
      0,
      0,
      0,
      0
    ));
  }

  // Default to today at UTC midnight
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    0,
    0,
    0,
    0
  ));
}

/**
 * Format a Date to "YYYY-MM-DD" string
 *
 * @param date - Date object
 * @returns "YYYY-MM-DD" string
 */
export function formatDateISO(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date as "YYYY-MM-DD" string (UTC)
 *
 * @returns "YYYY-MM-DD" string for today
 */
export function getTodayISO(): string {
  return formatDateISO(normalizeDay());
}

/**
 * PASS 4.1 - Determine day relation (past/today/future)
 * Used for locking UI interactions on past/future days
 *
 * @param dayISO - Day to check in "YYYY-MM-DD" format
 * @param todayISO - Today's date (defaults to getTodayISO())
 * @returns 'past' | 'today' | 'future'
 */
export function getDayRelation(dayISO: string, todayISO?: string): 'past' | 'today' | 'future' {
  const today = todayISO ?? getTodayISO();

  if (dayISO < today) return 'past';
  if (dayISO > today) return 'future';
  return 'today';
}

/**
 * PASS 6.1 - Get yesterday's date as "YYYY-MM-DD" string (UTC)
 *
 * @param todayISO - Optional reference date (defaults to getTodayISO())
 * @returns "YYYY-MM-DD" string for yesterday
 */
export function getYesterdayISO(todayISO?: string): string {
  const reference = todayISO ?? getTodayISO();
  const refDate = normalizeDay(reference);
  const yesterday = new Date(Date.UTC(
    refDate.getUTCFullYear(),
    refDate.getUTCMonth(),
    refDate.getUTCDate() - 1
  ));
  return formatDateISO(yesterday);
}

/**
 * PASS 7.2 - Get days elapsed in current week (Monday = 1, Sunday = 7)
 * Returns 1-7 based on current day of week (UTC)
 *
 * @param todayISO - Optional reference date (defaults to getTodayISO())
 * @returns Number of days elapsed since Monday (1-7)
 */
export function getDaysElapsedInWeek(todayISO?: string): number {
  const reference = todayISO ?? getTodayISO();
  const refDate = normalizeDay(reference);
  // getUTCDay() returns 0 (Sunday) to 6 (Saturday)
  // Convert to Monday-based: Mon=1, Tue=2, ..., Sun=7
  const dayOfWeek = refDate.getUTCDay();
  return dayOfWeek === 0 ? 7 : dayOfWeek;
}

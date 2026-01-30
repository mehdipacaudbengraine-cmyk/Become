/**
 * PASS 6.1 - Progress utility functions (pure, no DB access)
 */

import type { DayProgress } from '@/lib/actions/progress';
import { getYesterdayISO } from '@/lib/date';

/**
 * Check if a day has zero activity
 * A "zero day" = score === 0 AND (morning+evening+beginner === 0) AND journalValidated === false
 */
function isZeroDay(day: DayProgress): boolean {
  return (
    day.score === 0 &&
    day.morningCount === 0 &&
    day.eveningCount === 0 &&
    day.beginnerCount === 0 &&
    !day.journalValidated
  );
}

/**
 * Check if a day has any activity
 */
function hasActivity(day: DayProgress): boolean {
  return (
    day.morningCount + day.eveningCount + day.beginnerCount > 0 ||
    day.journalValidated
  );
}

export interface ReEntryResult {
  isReEntry: boolean;
  consecutiveZeroDaysBeforeToday: number;
}

/**
 * PASS 6.1 - Compute re-entry flag
 * 
 * Detects when a user returns today after multiple days of inactivity.
 * 
 * Conditions for isReEntry = true:
 * 1. hasActivityToday: user has done something today
 * 2. hadNoActivityYesterday: yesterday was a zero day
 * 3. consecutiveZeroDaysBeforeToday >= 2: at least 2 consecutive zero days before today
 * 
 * @param days - Array of DayProgress for the last 7 days
 * @param todayISO - Today's date in YYYY-MM-DD format
 * @returns { isReEntry, consecutiveZeroDaysBeforeToday }
 */
export function computeReEntryFlag(
  days: DayProgress[],
  todayISO: string
): ReEntryResult {
  // Find today
  const today = days.find(d => d.dayISO === todayISO);
  const hasActivityToday = today ? hasActivity(today) : false;

  // Find yesterday
  const yesterdayISO = getYesterdayISO(todayISO);
  const yesterday = days.find(d => d.dayISO === yesterdayISO);
  const hadNoActivityYesterday = yesterday ? isZeroDay(yesterday) : false;

  // Count consecutive zero days before today (descending order from yesterday)
  // Filter days before today, excluding yesterday (checked separately)
  const daysBeforeToday = days
    .filter(d => d.dayISO < todayISO && d.dayISO !== yesterdayISO)
    .sort((a, b) => b.dayISO.localeCompare(a.dayISO)); // Most recent first

  let consecutiveZeroDaysBeforeToday = 0;
  for (const day of daysBeforeToday) {
    if (isZeroDay(day)) {
      consecutiveZeroDaysBeforeToday++;
    } else {
      break; // Stop at first day with activity
    }
  }

  // isReEntry = hasActivityToday && hadNoActivityYesterday && consecutiveZeroDaysBeforeToday >= 2
  const isReEntry =
    hasActivityToday &&
    hadNoActivityYesterday &&
    consecutiveZeroDaysBeforeToday >= 2;

  return {
    isReEntry,
    consecutiveZeroDaysBeforeToday,
  };
}

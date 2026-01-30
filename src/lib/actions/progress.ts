'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * Convert a date string or current date to UTC midnight
 * Ensures consistent date handling across timezone boundaries
 */
function toDbDateUTC(dateStr?: string): Date {
  if (dateStr) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(Date.UTC(y, m - 1, d));
  }
  const now = new Date();
  return new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));
}

/**
 * Format Date to YYYY-MM-DD
 */
function formatDateToISO(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format Date to "Lun 26/01" format (French)
 */
function formatDateLabel(date: Date): string {
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    timeZone: 'UTC',
  });

  const parts = formatter.formatToParts(date);
  let weekday = parts.find((p) => p.type === 'weekday')?.value || '';
  const day = parts.find((p) => p.type === 'day')?.value || '';
  const month = parts.find((p) => p.type === 'month')?.value || '';

  // Capitalize first letter and remove trailing period (e.g., "lun." → "Lun")
  weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1).replace('.', '');

  return `${weekday} ${day}/${month}`;
}

export interface DayProgress {
  dayISO: string;
  label: string;
  morningCount: number;
  eveningCount: number;
  beginnerCount: number;
  journalValidated: boolean;
  score: number;
  disciplined: boolean;
}

export interface WeeklyProgress {
  days: DayProgress[];
  currentStreak: number;
  disciplinedDays7: number;
  disciplinedDaysPrev7: number; // PASS 5.2: Previous 7 days (J-7 to J-13)
}

/**
 * Calculate daily score based on completed tasks
 *
 * Score breakdown (max 100):
 * - Morning: 40 points (6 tasks max)
 * - Evening: 30 points (6 tasks max)
 * - Beginner: 20 points (7 tasks max)
 * - Journal: 10 points (validated)
 */
function calculateScore(
  morningCount: number,
  eveningCount: number,
  beginnerCount: number,
  journalValidated: boolean
): number {
  const morningScore = Math.min(morningCount, 6) / 6 * 40;
  const eveningScore = Math.min(eveningCount, 6) / 6 * 30;
  const beginnerScore = Math.min(beginnerCount, 7) / 7 * 20;
  const journalScore = journalValidated ? 10 : 0;

  const total = morningScore + eveningScore + beginnerScore + journalScore;
  return Math.round(Math.min(Math.max(total, 0), 100));
}

/**
 * Get weekly progress for the last 7 days
 * Returns scores, completion counts, and streak information
 */
export async function getWeeklyProgress(): Promise<WeeklyProgress> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  const userId = session.user.id as string;

  // Generate last 7 days (today to today-6)
  const today = toDbDateUTC();
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() - i
    ));
    dates.push(date);
  }
  dates.reverse(); // oldest first

  // PASS 5.2: Generate previous 7 days (J-7 to J-13)
  const prevDates: Date[] = [];
  for (let i = 7; i < 14; i++) {
    const date = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() - i
    ));
    prevDates.push(date);
  }
  prevDates.reverse(); // oldest first

  try {
    // Fetch all data in parallel (including previous 7 days for comparison)
    const [morningData, eveningData, beginnerData, journalData] = await Promise.all([
      db.morningRoutineCompletion.findMany({
        where: {
          userId,
          day: {
            gte: prevDates[0],
            lte: dates[dates.length - 1],
          },
        },
        select: {
          day: true,
        },
      }),
      db.eveningRoutineCompletion.findMany({
        where: {
          userId,
          day: {
            gte: prevDates[0],
            lte: dates[dates.length - 1],
          },
        },
        select: {
          day: true,
        },
      }),
      db.beginnerTaskCompletion.findMany({
        where: {
          userId,
          day: {
            gte: prevDates[0],
            lte: dates[dates.length - 1],
          },
        },
        select: {
          day: true,
        },
      }),
      db.journalEntry.findMany({
        where: {
          userId,
          day: {
            gte: prevDates[0],
            lte: dates[dates.length - 1],
          },
        },
        select: {
          day: true,
          isValidated: true,
        },
      }),
    ]);

    // Create maps for quick lookup
    const morningMap = new Map<string, number>();
    const eveningMap = new Map<string, number>();
    const beginnerMap = new Map<string, number>();
    const journalMap = new Map<string, boolean>();

    morningData.forEach((item: { day: Date }) => {
      const key = formatDateToISO(item.day);
      morningMap.set(key, (morningMap.get(key) || 0) + 1);
    });

    eveningData.forEach((item: { day: Date }) => {
      const key = formatDateToISO(item.day);
      eveningMap.set(key, (eveningMap.get(key) || 0) + 1);
    });

    beginnerData.forEach((item: { day: Date }) => {
      const key = formatDateToISO(item.day);
      beginnerMap.set(key, (beginnerMap.get(key) || 0) + 1);
    });

    journalData.forEach((item: { day: Date; isValidated: boolean }) => {
      const key = formatDateToISO(item.day);
      journalMap.set(key, item.isValidated);
    });

    // Build daily progress data
    const days: DayProgress[] = dates.map((date) => {
      const dayISO = formatDateToISO(date);
      const morningCount = morningMap.get(dayISO) || 0;
      const eveningCount = eveningMap.get(dayISO) || 0;
      const beginnerCount = beginnerMap.get(dayISO) || 0;
      const journalValidated = journalMap.get(dayISO) || false;

      const score = calculateScore(morningCount, eveningCount, beginnerCount, journalValidated);
      const disciplined = score >= 70;

      return {
        dayISO,
        label: formatDateLabel(date),
        morningCount,
        eveningCount,
        beginnerCount,
        journalValidated,
        score,
        disciplined,
      };
    });

    // Calculate current streak (consecutive disciplined days from today backwards)
    let currentStreak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].disciplined) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Count disciplined days in last 7 days
    const disciplinedDays7 = days.filter((d) => d.disciplined).length;

    // PASS 5.2: Calculate disciplined days in previous 7 days (J-7 to J-13)
    const prevDaysProgress: DayProgress[] = prevDates.map((date) => {
      const dayISO = formatDateToISO(date);
      const morningCount = morningMap.get(dayISO) || 0;
      const eveningCount = eveningMap.get(dayISO) || 0;
      const beginnerCount = beginnerMap.get(dayISO) || 0;
      const journalValidated = journalMap.get(dayISO) || false;

      const score = calculateScore(morningCount, eveningCount, beginnerCount, journalValidated);
      const disciplined = score >= 70;

      return {
        dayISO,
        label: '',
        morningCount,
        eveningCount,
        beginnerCount,
        journalValidated,
        score,
        disciplined,
      };
    });

    const disciplinedDaysPrev7 = prevDaysProgress.filter((d) => d.disciplined).length;

    return {
      days,
      currentStreak,
      disciplinedDays7,
      disciplinedDaysPrev7,
    };
  } catch (error) {
    console.error('[getWeeklyProgress] error:', error);
    throw new Error('Failed to fetch weekly progress');
  }
}

/**
 * PASS 8.1 - Get total disciplined days (cumulative, all-time)
 * A day is disciplined if score >= 70
 */
export async function getTotalDisciplinedDays(): Promise<number> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  const userId = session.user.id as string;

  try {
    // Fetch all completion data (no date filter)
    const [morningData, eveningData, beginnerData, journalData] = await Promise.all([
      db.morningRoutineCompletion.findMany({
        where: { userId },
        select: { day: true },
      }),
      db.eveningRoutineCompletion.findMany({
        where: { userId },
        select: { day: true },
      }),
      db.beginnerTaskCompletion.findMany({
        where: { userId },
        select: { day: true },
      }),
      db.journalEntry.findMany({
        where: { userId },
        select: { day: true, isValidated: true },
      }),
    ]);

    // Create maps for quick lookup
    const morningMap = new Map<string, number>();
    const eveningMap = new Map<string, number>();
    const beginnerMap = new Map<string, number>();
    const journalMap = new Map<string, boolean>();

    morningData.forEach((item: { day: Date }) => {
      const key = formatDateToISO(item.day);
      morningMap.set(key, (morningMap.get(key) || 0) + 1);
    });

    eveningData.forEach((item: { day: Date }) => {
      const key = formatDateToISO(item.day);
      eveningMap.set(key, (eveningMap.get(key) || 0) + 1);
    });

    beginnerData.forEach((item: { day: Date }) => {
      const key = formatDateToISO(item.day);
      beginnerMap.set(key, (beginnerMap.get(key) || 0) + 1);
    });

    journalData.forEach((item: { day: Date; isValidated: boolean }) => {
      const key = formatDateToISO(item.day);
      journalMap.set(key, item.isValidated);
    });

    // Collect all unique days with any activity
    const allDays = new Set<string>([
      ...morningMap.keys(),
      ...eveningMap.keys(),
      ...beginnerMap.keys(),
      ...journalMap.keys(),
    ]);

    // Count disciplined days
    let totalDisciplined = 0;
    allDays.forEach((dayISO) => {
      const morningCount = morningMap.get(dayISO) || 0;
      const eveningCount = eveningMap.get(dayISO) || 0;
      const beginnerCount = beginnerMap.get(dayISO) || 0;
      const journalValidated = journalMap.get(dayISO) || false;

      const score = calculateScore(morningCount, eveningCount, beginnerCount, journalValidated);
      if (score >= 70) {
        totalDisciplined++;
      }
    });

    return totalDisciplined;
  } catch (error) {
    console.error('[getTotalDisciplinedDays] error:', error);
    return 0;
  }
}

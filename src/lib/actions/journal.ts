'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

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
 * Get journal entry for a specific day
 * Returns the entry with all questions and validation status
 */
export async function getJournalByDay(dateStr?: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  const userId = session.user.id as string;
  const targetDate = toDbDateUTC(dateStr);

  try {
    const entry = await db.journalEntry.findUnique({
      where: {
        userId_day: {
          userId,
          day: targetDate,
        },
      },
      select: {
        q1: true,
        q2: true,
        q3: true,
        q4: true,
        isValidated: true,
      },
    });

    return entry || {
      q1: '',
      q2: '',
      q3: '',
      q4: '',
      isValidated: false,
    };
  } catch (error) {
    console.error('[getJournalByDay] error:', error);
    throw new Error('Failed to fetch journal entry');
  }
}

/**
 * Save journal entry for a specific day
 * Validates that all required questions are answered (non-empty after trim)
 * Returns success status and validation state
 */
export async function saveJournalByDay(
  dateStr: string,
  payload: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
  }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  const userId = session.user.id as string;
  const targetDate = toDbDateUTC(dateStr);

  // Calculate validation: all questions must be non-empty after trim
  const isValidated =
    payload.q1.trim() !== '' &&
    payload.q2.trim() !== '' &&
    payload.q3.trim() !== '' &&
    payload.q4.trim() !== '';

  try {
    await db.journalEntry.upsert({
      where: {
        userId_day: {
          userId,
          day: targetDate,
        },
      },
      update: {
        q1: payload.q1,
        q2: payload.q2,
        q3: payload.q3,
        q4: payload.q4,
        isValidated,
      },
      create: {
        userId,
        day: targetDate,
        q1: payload.q1,
        q2: payload.q2,
        q3: payload.q3,
        q4: payload.q4,
        isValidated,
      },
    });

    // Revalidate relevant paths
    revalidatePath('/journal');
    revalidatePath(`/journal/${dateStr}`);
    revalidatePath('/dashboard');

    return {
      success: true,
      isValidated,
    };
  } catch (error) {
    console.error('[saveJournalByDay] error:', error);
    throw new Error('Failed to save journal entry');
  }
}

/**
 * Get all journal entries for a user
 * Returns array of entries with dates and validation status
 */
export async function getAllJournalEntries() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  const userId = session.user.id as string;

  try {
    const entries = await db.journalEntry.findMany({
      where: {
        userId,
      },
      select: {
        day: true,
        isValidated: true,
      },
      orderBy: {
        day: 'desc',
      },
    });

    return entries.map((entry) => ({
      day: entry.day,
      isValidated: entry.isValidated,
    }));
  } catch (error) {
    console.error('[getAllJournalEntries] error:', error);
    throw new Error('Failed to fetch journal entries');
  }
}

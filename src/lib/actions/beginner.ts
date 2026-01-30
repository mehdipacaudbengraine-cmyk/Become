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
 * Get all completed task keys for a given date
 */
export async function getBeginnerCompletions(dateStr?: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  const userId = session.user.id as string;
  const targetDate = toDbDateUTC(dateStr);

  try {
    const completions = await db.beginnerTaskCompletion.findMany({
      where: {
        userId,
        day: targetDate,
      },
      select: {
        taskKey: true,
      },
    });

    return completions.map((c) => c.taskKey);
  } catch (error) {
    console.error('[getBeginnerCompletions] error:', error);
    throw new Error('Failed to fetch completions');
  }
}

/**
 * Toggle a beginner task completion status
 * Returns the new completion status
 */
export async function toggleBeginnerTask(taskKey: string, dateStr?: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  const userId = session.user.id as string;
  const targetDate = toDbDateUTC(dateStr);

  try {
    // Check if task is already completed
    const existing = await db.beginnerTaskCompletion.findUnique({
      where: {
        userId_day_taskKey: {
          userId,
          day: targetDate,
          taskKey,
        },
      },
    });

    if (existing) {
      // Delete if exists (uncomplete)
      await db.beginnerTaskCompletion.delete({
        where: {
          id: existing.id,
        },
      });
      // Revalidate cache to ensure fresh data
      revalidatePath('/programs/beginner');
      revalidatePath('/dashboard');
      revalidatePath('/progress');
      return { success: true, completed: false };
    } else {
      // Create if doesn't exist (complete)
      await db.beginnerTaskCompletion.create({
        data: {
          userId,
          day: targetDate,
          taskKey,
        },
      });
      // Revalidate cache to ensure fresh data
      revalidatePath('/programs/beginner');
      revalidatePath('/dashboard');
      revalidatePath('/progress');
      return { success: true, completed: true };
    }
  } catch (error) {
    console.error('[toggleBeginnerTask] error:', error);
    throw new Error('Failed to toggle task');
  }
}

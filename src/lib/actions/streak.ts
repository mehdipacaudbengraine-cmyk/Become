'use server';

import { db } from '@/lib/db';
import { getToday, getDaysBetween } from '@/lib/utils';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

const COMPLETION_THRESHOLD = 0.6; // 60% of tasks = day counts

export async function updateStreak(userId: string) {
  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return;
    }

    const today = getToday();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get today's completion
    const todayCompletion = await getDayCompletion(userId, today);

    // Get yesterday's completion
    const yesterdayCompletion = await getDayCompletion(userId, yesterday);

    let newStreak = user.currentStreak;

    // If today is complete
    if (todayCompletion >= COMPLETION_THRESHOLD) {
      // If yesterday was also complete, increment streak
      if (yesterdayCompletion >= COMPLETION_THRESHOLD) {
        newStreak = user.currentStreak + 1;
      } else {
        // Start new streak
        newStreak = 1;
      }
    } else {
      // Today not complete yet
      // Check if yesterday was missed (if so, reset streak)
      if (user.lastActiveDate) {
        const daysSinceActive = getDaysBetween(user.lastActiveDate, today);
        if (daysSinceActive > 1 && yesterdayCompletion < COMPLETION_THRESHOLD) {
          newStreak = 0;
        }
      }
    }

    // Update user
    await db.user.update({
      where: { id: userId },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, user.longestStreak),
        lastActiveDate: today,
      },
    });

    return {
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, user.longestStreak),
    };
  } catch (error) {
    console.error('Failed to update streak:', error);
  }
}

async function getDayCompletion(userId: string, date: Date): Promise<number> {
  // Get active enrollment
  const enrollment = await db.enrollment.findFirst({
    where: {
      userId,
      isActive: true,
    },
  });

  if (!enrollment) {
    return 0;
  }

  // Get the day's tasks
  const programDay = await db.programDay.findFirst({
    where: {
      programId: enrollment.programId,
      dayNumber: enrollment.currentDay,
    },
    include: {
      tasks: true,
    },
  });

  if (!programDay || programDay.tasks.length === 0) {
    return 0;
  }

  // Get completions for that day
  const completions = await db.taskCompletion.count({
    where: {
      userId,
      date,
      taskId: {
        in: programDay.tasks.map((t) => t.id),
      },
    },
  });

  return completions / programDay.tasks.length;
}

export async function getStreak(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      currentStreak: true,
      longestStreak: true,
    },
  });

  return {
    currentStreak: user?.currentStreak || 0,
    longestStreak: user?.longestStreak || 0,
  };
}

// Server action to mark today's completion for the authenticated user.
// - Ensures session exists
// - Prevents multiple completions in the same day
// - Updates lastActiveDate, currentStreak, longestStreak atomically
export async function completeToday() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id as string | undefined;

  if (!userId) {
    throw new Error('Not authenticated');
  }

  const today = getToday();

  return await db.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { lastActiveDate: true, currentStreak: true, longestStreak: true },
    });

    const lastActive = user?.lastActiveDate ? new Date(user.lastActiveDate) : null;
    if (lastActive) {
      lastActive.setHours(0, 0, 0, 0);
    }

    // If already completed today, return current values
    if (lastActive && lastActive.getTime() === today.getTime()) {
      return {
        alreadyCompleted: true,
        currentStreak: user?.currentStreak || 0,
        longestStreak: user?.longestStreak || 0,
      };
    }

    let newStreak = 1;
    if (lastActive) {
      const daysBetween = getDaysBetween(lastActive, today);
      if (daysBetween === 1) {
        newStreak = (user?.currentStreak || 0) + 1;
      } else {
        newStreak = 1;
      }
    }

    const updated = await tx.user.update({
      where: { id: userId },
      data: {
        lastActiveDate: today,
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, user?.longestStreak || 0),
      },
      select: {
        currentStreak: true,
        longestStreak: true,
      },
    });

    revalidatePath('/dashboard');

    return { alreadyCompleted: false, ...updated };
  });
}

// Server action wrapper compatible with form `action` signature
export async function completeTodayAction(_formData: FormData) {
  await completeToday();
}

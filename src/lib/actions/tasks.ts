'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getToday } from '@/lib/utils';
import { updateStreak } from './streak';

export async function getTodaysTasks(userId: string) {
  const enrollment = await db.enrollment.findFirst({
    where: {
      userId,
      isActive: true,
    },
    include: {
      program: {
        include: {
          days: {
            where: {
              dayNumber: {
                // Get current day from enrollment
              },
            },
            include: {
              tasks: {
                orderBy: {
                  order: 'asc',
                },
              },
            },
          },
        },
      },
    },
  });

  if (!enrollment) {
    return {
      tasks: [],
      principle: null,
    };
  }

  const programDay = await db.programDay.findFirst({
    where: {
      programId: enrollment.programId,
      dayNumber: enrollment.currentDay,
    },
    include: {
      tasks: {
        orderBy: {
          order: 'asc',
        },
      },
    },
  });

  if (!programDay) {
    return {
      tasks: [],
      principle: null,
    };
  }

  const today = getToday();

  // Get today's completions
  const completions = await db.taskCompletion.findMany({
    where: {
      userId,
      date: today,
      taskId: {
        in: programDay.tasks.map((t) => t.id),
      },
    },
  });

  const completedTaskIds = new Set(completions.map((c) => c.taskId));

  const tasksWithCompletion = programDay.tasks.map((task) => ({
    ...task,
    isCompleted: completedTaskIds.has(task.id),
  }));

  return {
    tasks: tasksWithCompletion,
    principle: programDay.principle,
  };
}

export async function completeTask(userId: string, taskId: string) {
  try {
    const today = getToday();

    // Check if already completed
    const existing = await db.taskCompletion.findFirst({
      where: {
        userId,
        taskId,
        date: today,
      },
    });

    if (existing) {
      return {
        success: true,
        message: 'Task already completed',
      };
    }

    // Create completion
    await db.taskCompletion.create({
      data: {
        userId,
        taskId,
        date: today,
      },
    });

    // Update streak
    await updateStreak(userId);

    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error) {
    return {
      error: 'Failed to complete task',
    };
  }
}

export async function uncompleteTask(userId: string, taskId: string) {
  try {
    const today = getToday();

    await db.taskCompletion.deleteMany({
      where: {
        userId,
        taskId,
        date: today,
      },
    });

    // Update streak
    await updateStreak(userId);

    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error) {
    return {
      error: 'Failed to uncomplete task',
    };
  }
}

export async function getTodayCompletion(userId: string) {
  const { tasks } = await getTodaysTasks(userId);

  if (tasks.length === 0) {
    return 0;
  }

  const completedCount = tasks.filter((t) => t.isCompleted).length;
  return Math.round((completedCount / tasks.length) * 100);
}

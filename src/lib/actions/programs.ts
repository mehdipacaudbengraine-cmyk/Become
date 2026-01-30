'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function getPrograms() {
  return await db.program.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      difficulty: 'asc',
    },
  });
}

export async function enrollInProgram(userId: string, programId: string) {
  try {
    console.log('[enrollInProgram] programId received:', programId);
    // Check if user already has an active enrollment
    const existingEnrollment = await db.enrollment.findFirst({
      where: {
        userId,
        isActive: true,
      },
    });

    if (existingEnrollment) {
      // Try to deactivate the existing enrollment. If this fails (eg. unique constraint),
      // log and continue so we still attempt to create the new enrollment.
      try {
        await db.enrollment.update({
          where: {
            id: existingEnrollment.id,
          },
          data: {
            isActive: false,
          },
        });
      } catch (err) {
        console.warn('[enrollInProgram] failed to deactivate existing enrollment, continuing:', err);
      }
    }

    // Create new enrollment
    const enrollment = await db.enrollment.create({
      data: {
        userId,
        programId,
        currentDay: 1,
        isActive: true,
      },
      include: {
        program: true,
      },
    });

    console.log('[enrollInProgram] created enrollment for user', userId, 'programId', programId);
    revalidatePath('/dashboard');
    revalidatePath('/programs');

    return {
      success: true,
      enrollment,
    };
  } catch (error) {
    return {
      error: 'Failed to enroll in program',
    };
  }
}

// Server action that uses the current session to start a program for the
// authenticated user. It ensures the user is authenticated, prevents
// multiple active enrollments by deactivating any existing one, and creates
// a new Enrollment with startedAt set to now.
export async function startProgram(programId: string) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id as string | undefined;

  if (!userId) {
    throw new Error('Not authenticated');
  }

  try {
    console.log('[startProgram] programId received:', programId, 'for user', userId);
    const program = await db.program.findUnique({ where: { id: programId } });
    console.log('[startProgram] looked up program:', program ? { id: program.id, slug: program.slug, name: program.name } : null);
    const existingEnrollment = await db.enrollment.findFirst({
      where: { userId, isActive: true },
    });

    if (existingEnrollment) {
      try {
        await db.enrollment.update({
          where: { id: existingEnrollment.id },
          data: { isActive: false },
        });
      } catch (err) {
        console.warn('[startProgram] failed to deactivate existing enrollment, proceeding to create new enrollment', err);
        // continue and try to create new enrollment; do not fail the entire action
      }
    }

    const enrollment = await db.enrollment.create({
      data: {
        userId,
        programId,
        currentDay: 1,
        isActive: true,
        startedAt: new Date(),
      },
      include: { program: true },
    });

    revalidatePath('/dashboard');
    revalidatePath('/programs');

    return { success: true, enrollment };
  } catch (error) {
    return { error: 'Failed to start program' };
  }
}

export async function getActiveEnrollment(userId: string) {
  return await db.enrollment.findFirst({
    where: {
      userId,
      isActive: true,
    },
    include: {
      program: true,
    },
  });
}

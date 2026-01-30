'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

/**
 * Server Action: Save introspection responses and mark onboarding as done
 * 
 * Guarantees:
 * - Uses session.user.id (Prisma User.id) as the unique identifier
 * - Creates or updates Introspection record using upsert
 * - Marks User.onboardingDone = true
 * - Returns structured success/error responses
 */
export async function saveIntrospection(q1: string, q2: string, q3: string) {
  console.log('[saveIntrospection] START');
  
  // Step 1: Verify session exists and contains user ID
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    console.log('[saveIntrospection] UNAUTH - no session or user.id');
    return { 
      success: false, 
      code: 'UNAUTH', 
      message: 'Session not found or expired' 
    };
  }

  const userId = session.user.id;
  console.log('[saveIntrospection] userId from session:', userId);

  try {
    // Step 2: Verify user exists in database
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, onboardingDone: true },
    });

    if (!user) {
      console.error('[saveIntrospection] USER_NOT_FOUND:', userId);
      return {
        success: false,
        code: 'USER_NOT_FOUND',
        message: `User ${userId} not found in database`,
      };
    }

    console.log('[saveIntrospection] User found:', user.email, '| onboardingDone:', user.onboardingDone);

    // Step 3: Upsert Introspection record
    // This handles both create (first time) and update (if revisiting onboarding)
    const introspection = await db.introspection.upsert({
      where: { userId },
      create: {
        userId,
        q1: q1.trim(),
        q2: q2.trim(),
        q3: q3.trim(),
      },
      update: {
        q1: q1.trim(),
        q2: q2.trim(),
        q3: q3.trim(),
      },
    });

    console.log('[saveIntrospection] Introspection upserted:', introspection.id);

    // Step 4: Mark onboarding as complete
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { onboardingDone: true },
      select: { id: true, onboardingDone: true },
    });

    console.log('[saveIntrospection] User onboardingDone updated to:', updatedUser.onboardingDone);
    
    return { 
      success: true,
      code: 'OK',
      userId: updatedUser.id,
    };
  } catch (error) {
    console.error('[saveIntrospection] DB_ERROR:', error);
    
    // Extract meaningful error message
    let errorMessage = 'Unknown database error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      code: 'DB_ERROR',
      message: errorMessage,
    };
  }
} 
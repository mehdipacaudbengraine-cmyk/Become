import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { ReactNode } from 'react';

export default async function OnboardedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect('/login');
  }

  const userId = session.user.id as string;

  // Check if user has completed onboarding
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { onboardingDone: true },
  });

  if (!user?.onboardingDone) {
    redirect('/onboarding/introspection');
  }

  return children;
}

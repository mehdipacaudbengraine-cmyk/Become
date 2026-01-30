import { db } from "@/lib/db";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import IntrospectionForm from '@/components/onboarding/IntrospectionForm';


export const dynamic = 'force-dynamic';

export default async function IntrospectionPage() {
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session?.user?.id) {
    redirect('/login?callbackUrl=/onboarding/introspection');
  }

  const userId = session.user.id as string;

  // Get user onboarding status
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { onboardingDone: true },
  });

  // If already completed onboarding, redirect to dashboard
  if (user?.onboardingDone) {
    redirect('/dashboard');
  }

  return <IntrospectionForm />;
}

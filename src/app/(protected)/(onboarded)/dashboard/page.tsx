/**
 * BECOME Dashboard - Ultra Minimal Edition
 * "Arrête de scroller. Prends ta vie en main."
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardActions from '@/components/dashboard/DashboardActions';
import { getTodayISO } from '@/lib/date';
import { getMorningCompletions } from '@/lib/actions/morning';
import { getEveningCompletions } from '@/lib/actions/evening';
import { getJournalByDay } from '@/lib/actions/journal';
import { getWeeklyProgress } from '@/lib/actions/progress';
import { computeReEntryFlag } from '@/lib/progress';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    redirect('/login');
  }

  const userName = session.user.name || 'Salut';
  const todayISO = getTodayISO();

  let morningCompleted = false;
  let eveningCompleted = false;
  let journalValidated = false;
  let isReEntry = false;

  try {
    const [morningCompletions, eveningCompletions, journalEntry, weeklyProgress] = await Promise.all([
      getMorningCompletions(todayISO),
      getEveningCompletions(todayISO),
      getJournalByDay(todayISO),
      getWeeklyProgress(),
    ]);

    morningCompleted = morningCompletions.length === 6;
    eveningCompleted = eveningCompletions.length === 6;
    journalValidated = journalEntry.isValidated;

    const reEntryResult = computeReEntryFlag(weeklyProgress.days, todayISO);
    isReEntry = reEntryResult.isReEntry;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-black flex flex-col items-center justify-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-xl">
        {/* Header - Ultra minimal */}
        <div className="text-center mb-12">
          <h1 className="be-heading-1">
            Salut, {userName}
          </h1>
        </div>

        {/* Actions */}
        <DashboardActions
          morningCompleted={morningCompleted}
          eveningCompleted={eveningCompleted}
          journalValidated={journalValidated}
          isReEntry={isReEntry}
        />
      </div>
    </div>
  );
}
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import DashboardActions from '@/components/dashboard/DashboardActions';
import { getTodayISO, getYesterdayISO } from '@/lib/date';
import { getMorningCompletions } from '@/lib/actions/morning';
import { getEveningCompletions } from '@/lib/actions/evening';
import { getJournalByDay } from '@/lib/actions/journal';
import { getWeeklyProgress, type DayProgress } from '@/lib/actions/progress';
import { computeReEntryFlag } from '@/lib/progress';

export const dynamic = 'force-dynamic';

function getContinuityMessage(yesterdayScore: number): string {
  if (yesterdayScore <= 20) return "Hier était difficile. Aujourd'hui est neuf.";
  if (yesterdayScore <= 50) return 'Tu as avancé. Continue.';
  if (yesterdayScore <= 80) return 'Solide journée. On enchaîne.';
  return 'Exemplaire. Reste discipliné.';
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    redirect('/login');
  }

  const userName = session.user.name || 'Salut';
  const todayISO = getTodayISO();
  const yesterdayISO = getYesterdayISO(todayISO);

  let morningCompleted = false;
  let eveningCompleted = false;
  let journalValidated = false;
  let isReEntry = false;
  let yesterdayScore = 0;
  let isNewDay = true;

  try {
    const [morningCompletions, eveningCompletions, journalEntry, weeklyProgress] =
      await Promise.all([
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

    const yesterdayData = weeklyProgress.days.find((d: DayProgress) => d.dayISO === yesterdayISO);
    yesterdayScore = yesterdayData?.score ?? 0;

    const todayData = weeklyProgress.days.find((d: DayProgress) => d.dayISO === todayISO);
    isNewDay = !todayData || todayData.score === 0;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }

  const continuityMessage = getContinuityMessage(yesterdayScore);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-black flex flex-col items-center justify-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-xl">
        <div className="text-center mb-8">
          <h1 className="be-heading-1">Salut, {userName}</h1>
        </div>

        {isNewDay && !morningCompleted && (
          <div className="text-center mb-10">
            <p className="be-subtitle text-lg text-white/70 mb-6">
              {continuityMessage}
            </p>
            <Link href="/routines/morning">
              <button className="be-btn-primary be-glass be-card-interactive px-8 py-3 text-lg">
                Commencer ma journée
              </button>
            </Link>
          </div>
        )}

        {(!isNewDay || morningCompleted) && (
          <DashboardActions
            morningCompleted={morningCompleted}
            eveningCompleted={eveningCompleted}
            journalValidated={journalValidated}
            isReEntry={isReEntry}
          />
        )}
      </div>
    </div>
  );
}
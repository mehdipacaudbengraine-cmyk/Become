/**
 * PASS 9.1 – FEATURE FREEZE
 * =========================
 * This dashboard is functionally complete.
 * 
 * DO NOT ADD:
 * - New messages or toasts
 * - New metrics or calculations
 * - New conditional UI elements
 * - New behavioral triggers
 * 
 * Any extension MUST go through a new PASS with explicit approval.
 * The product knows how to stay silent when enough is done.
 */

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DailyMantra from '@/components/dashboard/DailyMantra';
import DashboardActions from '@/components/dashboard/DashboardActions';
import { getTodayISO, getDaysElapsedInWeek } from '@/lib/date';
import { getMorningCompletions } from '@/lib/actions/morning';
import { getEveningCompletions } from '@/lib/actions/evening';
import { getJournalByDay } from '@/lib/actions/journal';
import { getWeeklyProgress, getTotalDisciplinedDays } from '@/lib/actions/progress';
import { computeReEntryFlag } from '@/lib/progress';

export const dynamic = 'force-dynamic';

/**
 * PASS 5.1 - Get trajectory message based on disciplined days count
 */
function getTrajectoryMessage(disciplinedDays7: number): string {
  if (disciplinedDays7 <= 1) return 'Le rythme est à construire.';
  if (disciplinedDays7 <= 3) return 'Une base est en train de se poser.';
  if (disciplinedDays7 <= 5) return 'La discipline devient régulière.';
  return 'Tu es sur une trajectoire solide.';
}

/**
 * PASS 5.2 - Get week comparison message
 */
function getWeekComparisonMessage(disciplinedDays7: number, disciplinedDaysPrev7: number): string {
  if (disciplinedDays7 === 0 && disciplinedDaysPrev7 === 0) {
    return 'Le rythme est à initier.';
  }

  const delta = disciplinedDays7 - disciplinedDaysPrev7;

  if (delta >= 2) return 'Progression nette.';
  if (delta === 1) return 'Progression légère.';
  if (delta === 0) return 'Rythme stable.';
  if (delta === -1) return 'Ralentissement léger.';
  return 'Ralentissement. Reprise possible.';
}

/**
 * PASS 8.2 - Get CSS classes based on cumulative discipline thresholds
 * Silent visual evolution: opacity → weight → tracking
 */
function getDisciplineThresholdClasses(totalDays: number): string {
  if (totalDays >= 365) return 'text-white/50 font-medium tracking-tight';
  if (totalDays >= 180) return 'text-white/50 font-medium';
  if (totalDays >= 90) return 'text-white/50';
  if (totalDays >= 30) return 'text-white/40';
  return 'text-white/30';
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    redirect('/login');
  }

  const userName = session.user.name || 'Salut';

  // Fetch today's completion status for guidance
  const todayISO = getTodayISO();

  let morningCompleted = false;
  let eveningCompleted = false;
  let journalValidated = false;
  let disciplinedDays7 = 0;
  let disciplinedDaysPrev7 = 0;
  let isReEntry = false;
  let totalDisciplinedDays = 0;
  let currentStreak = 0;

  try {
    const [morningCompletions, eveningCompletions, journalEntry, weeklyProgress, totalDisciplined] = await Promise.all([
      getMorningCompletions(todayISO),
      getEveningCompletions(todayISO),
      getJournalByDay(todayISO),
      getWeeklyProgress(),
      getTotalDisciplinedDays(),
    ]);

    // Morning is complete if all 6 tasks are done
    morningCompleted = morningCompletions.length === 6;

    // Evening is complete if all 6 tasks are done
    eveningCompleted = eveningCompletions.length === 6;

    // Journal is validated if isValidated flag is true
    journalValidated = journalEntry.isValidated;

    // PASS 5.1: Get disciplined days count for trajectory message
    disciplinedDays7 = weeklyProgress.disciplinedDays7;

    // PASS 5.2: Get previous week disciplined days for comparison
    disciplinedDaysPrev7 = weeklyProgress.disciplinedDaysPrev7;

    // PASS 6.2: Compute re-entry flag for comeback message
    const reEntryResult = computeReEntryFlag(weeklyProgress.days, todayISO);
    isReEntry = reEntryResult.isReEntry;

    // PASS 8.1: Total disciplined days (all-time)
    totalDisciplinedDays = totalDisciplined;

    // PASS 8.3: Current streak for continuity message
    currentStreak = weeklyProgress.currentStreak;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Continue with default values if fetch fails
  }

  const trajectoryMessage = getTrajectoryMessage(disciplinedDays7);
  const comparisonMessage = getWeekComparisonMessage(disciplinedDays7, disciplinedDaysPrev7);

  // PASS 5.3 bis: Signal de décrochage silencieux
  const showAdjustmentSignal =
    disciplinedDays7 <= 2 &&
    disciplinedDaysPrev7 >= disciplinedDays7 &&
    disciplinedDaysPrev7 > 0;
  void showAdjustmentSignal;

  // PASS 9.2: Quiet mode - reduced density when disciplined
  const isQuietMode = disciplinedDays7 >= 5 && !isReEntry;
  const quietClasses = isQuietMode ? 'text-xs text-white/40 italic' : '';

  // PASS 9.3: Ultra quiet mode - complete silence when fully disciplined
  const isUltraQuiet = disciplinedDays7 === 7 && !isReEntry;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-black flex flex-col items-center justify-center px-4 py-12 sm:py-20">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center be-section-spacing">
          <h1 className="be-heading-1 mb-4">
            Salut, {userName}
          </h1>
          <DailyMantra />
          {/* Messages stack with consistent spacing - PASS 9.3: hidden in ultra quiet */}
          {!isUltraQuiet && (
            <div className="mt-6 space-y-2 max-w-md mx-auto">
              {/* PASS 7.1 - Weekly objective progress */}
              <p className={`be-subtitle ${isQuietMode ? quietClasses : 'text-sm text-white/60'}`}>
                {disciplinedDays7} / 4 —{' '}
                {disciplinedDays7 <= 1
                  ? 'Le rythme est à construire.'
                  : disciplinedDays7 <= 3
                    ? 'Une base est en train de se poser.'
                    : 'Objectif hebdomadaire atteint.'}
              </p>
              {/* PASS 7.2/7.3/7.4 - Weekly cycle messages */}
              {(() => {
                const daysElapsed = getDaysElapsedInWeek(todayISO);
                const isStartOfWeek = daysElapsed === 1; // Monday
                const isEndOfWeek = daysElapsed === 7; // Sunday
                
                // PASS 7.4: Start of week message (Monday only)
                if (isStartOfWeek) {
                  return (
                    <p className="be-subtitle text-xs text-white/40">
                      Nouvelle semaine. Le cadre est posé.
                    </p>
                  );
                }
                
                // PASS 7.3: End of week message (Sunday only)
                if (isEndOfWeek) {
                  return (
                    <p className="be-subtitle text-xs text-white/40">
                      Fin de semaine. Le cycle se referme.
                    </p>
                  );
                }
                
                // PASS 7.2: Week projection (Tue-Sat)
                if (disciplinedDays7 === 0 || daysElapsed < 2) return null;
                const projected = Math.min(7, Math.max(0, Math.round((disciplinedDays7 / daysElapsed) * 7)));
                return (
                  <p className="be-subtitle text-xs text-white/50">
                    À ce rythme : ~{projected} jours disciplinés cette semaine.
                  </p>
                );
              })()}
              {/* PASS 5.1 - Trajectory projection */}
              <p className={`be-subtitle ${isQuietMode ? quietClasses : 'text-sm'}`}>
                {trajectoryMessage}
              </p>
              {/* PASS 5.2 - Week vs week comparison */}
              <p className={`be-subtitle ${isQuietMode ? quietClasses : 'text-sm text-white/50'}`}>
                {comparisonMessage}
              </p>
              {/* PASS 6.2 - Re-entry message (comeback after absence) */}
              {isReEntry && (
                <p className="be-subtitle text-sm text-white/60">
                  Tu reprends. C'est suffisant pour aujourd'hui.
                </p>
              )}
              {/* PASS 6.3 - Minimal plan for re-entry */}
              {isReEntry && (
                <p className="be-subtitle text-sm text-white/60">
                  Aujourd'hui : matin + carnet. Le reste est bonus.
                </p>
              )}
              {/* PASS 8.3 - Continuity micro-anchor */}
              {disciplinedDays7 >= 1 && currentStreak === 0 && (
                <p className={`be-subtitle ${isQuietMode ? quietClasses : 'text-sm text-white/50'}`}>
                  La continuité ne demande pas la perfection.
                </p>
              )}
              {/* PASS 8.4 - Emotional closure */}
              {!isReEntry && morningCompleted && eveningCompleted && journalValidated && (
                <p className="be-subtitle text-xs text-white/40 italic">
                  Rien d'autre à faire ici.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Navigation Grid with Guidance */}
        <DashboardActions
          morningCompleted={morningCompleted}
          eveningCompleted={eveningCompleted}
          journalValidated={journalValidated}
          isReEntry={isReEntry}
        />

        {/* PASS 8.1 - Long-term memory footer / PASS 8.2 - Silent thresholds */}
        {!isUltraQuiet && (
          <div className="mt-12 text-center">
            <p className={`be-subtitle text-xs ${getDisciplineThresholdClasses(totalDisciplinedDays)}`}>
              Discipline cumulée : {totalDisciplinedDays} jours
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

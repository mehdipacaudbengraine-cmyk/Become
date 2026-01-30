import { getWeeklyProgress } from '@/lib/actions/progress';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import WeeklyProgressClient from '@/components/progress/WeeklyProgressClient';

export const dynamic = 'force-dynamic';

export default async function ProgressPage() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    redirect('/login');
  }

  let weeklyProgress;
  try {
    weeklyProgress = await getWeeklyProgress();
  } catch (error) {
    console.error('Error fetching weekly progress:', error);
    weeklyProgress = {
      days: [],
      currentStreak: 0,
      disciplinedDays7: 0,
    };
  }

  return (
    <WeeklyProgressClient
      days={weeklyProgress.days}
      currentStreak={weeklyProgress.currentStreak}
      disciplinedDays7={weeklyProgress.disciplinedDays7}
    />
  );
}

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBeginnerCompletions } from '@/lib/actions/beginner';
import { getMorningCompletions } from '@/lib/actions/morning';
import { getEveningCompletions } from '@/lib/actions/evening';
import DayDrilldownClient from '@/components/progress/DayDrilldownClient';
import { normalizeDay, formatDateISO, getTodayISO, getDayRelation } from '@/lib/date';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    date: string;
  };
}

export default async function DayDrilldownPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.id) {
    redirect('/login');
  }

  const { date } = params;

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    redirect('/progress');
  }

  // Normalize the date to ensure it's valid
  let targetDate: Date;
  try {
    targetDate = normalizeDay(date);
  } catch (error) {
    redirect('/progress');
  }

  const dateStr = formatDateISO(targetDate);
  const todayStr = getTodayISO();

  // PASS 4.2: Block access to past/future days - redirect to /progress
  const relation = getDayRelation(dateStr, todayStr);
  if (relation !== 'today') {
    redirect('/progress');
  }

  const isFuture = dateStr > todayStr;

  // Fetch all completions for this day
  let morningCompleted: string[] = [];
  let eveningCompleted: string[] = [];
  let beginnerCompleted: string[] = [];

  try {
    [morningCompleted, eveningCompleted, beginnerCompleted] = await Promise.all([
      getMorningCompletions(dateStr),
      getEveningCompletions(dateStr),
      getBeginnerCompletions(dateStr),
    ]);
  } catch (error) {
    console.error('Error fetching day completions:', error);
  }

  return (
    <DayDrilldownClient
      dateStr={dateStr}
      isFuture={isFuture}
      morningCompleted={morningCompleted}
      eveningCompleted={eveningCompleted}
      beginnerCompleted={beginnerCompleted}
    />
  );
}

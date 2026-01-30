import MorningRoutineClient from '@/components/routines/MorningRoutineClient';
import { getMorningCompletions } from '@/lib/actions/morning';
import { getTodayISO } from '@/lib/date';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams?: {
    day?: string;
    reentry?: string;
  };
}

export default async function MorningRoutinePage({ searchParams }: PageProps) {
  // Get day from URL params or default to today
  const dayStr = typeof searchParams?.day === 'string' ? searchParams.day : getTodayISO();

  // PASS 6.4: Check for re-entry param
  const isReEntry = searchParams?.reentry === '1';

  let initialCompleted: string[] = [];

  try {
    initialCompleted = await getMorningCompletions(dayStr);
  } catch (error) {
    console.error('Error fetching morning completions:', error);
    // Continue with empty array if fetch fails
  }

  return <MorningRoutineClient selectedDay={dayStr} initialCompleted={initialCompleted} isReEntry={isReEntry} />;
}

import EveningRoutineClient from '@/components/routines/EveningRoutineClient';
import { getEveningCompletions } from '@/lib/actions/evening';
import { getTodayISO } from '@/lib/date';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams?: {
    day?: string;
  };
}

export default async function EveningRoutinePage({ searchParams }: PageProps) {
  // Get day from URL params or default to today
  const dayStr = typeof searchParams?.day === 'string' ? searchParams.day : getTodayISO();

  let initialCompleted: string[] = [];

  try {
    initialCompleted = await getEveningCompletions(dayStr);
  } catch (error) {
    console.error('Error fetching evening completions:', error);
    // Continue with empty array if fetch fails
  }

  return <EveningRoutineClient selectedDay={dayStr} initialCompleted={initialCompleted} />;
}

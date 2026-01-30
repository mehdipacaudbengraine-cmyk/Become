import BeginnerProgramClient from '@/components/programs/BeginnerProgramClient';
import { getBeginnerCompletions } from '@/lib/actions/beginner';
import { getTodayISO } from '@/lib/date';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams?: {
    day?: string;
  };
}

export default async function BeginnerProgramPage({ searchParams }: PageProps) {
  // Get day from URL params or default to today
  const dayStr = typeof searchParams?.day === 'string' ? searchParams.day : getTodayISO();

  let initialCompleted: string[] = [];

  try {
    initialCompleted = await getBeginnerCompletions(dayStr);
  } catch (error) {
    console.error('Error fetching beginner completions:', error);
    // Continue with empty array if fetch fails
  }

  return <BeginnerProgramClient selectedDay={dayStr} initialCompleted={initialCompleted} />;
}

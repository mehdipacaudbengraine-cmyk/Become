import { getJournalByDay } from '@/lib/actions/journal';
import JournalEntryClient from '@/components/journal/JournalEntryClient';

export const dynamic = 'force-dynamic';

interface JournalDayPageProps {
  params: {
    date: string;
  };
}

export default async function JournalDayPage({ params }: JournalDayPageProps) {
  const { date } = params;

  // Validate date format (YYYY-MM-DD)
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) {
    return (
      <div className="min-h-[calc(100vh-73px)] bg-black flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Date invalide</h1>
          <p className="text-gray-400">Le format de date doit être YYYY-MM-DD</p>
        </div>
      </div>
    );
  }

  let initialData = {
    q1: '',
    q2: '',
    q3: '',
    q4: '',
    isValidated: false,
  };

  try {
    initialData = await getJournalByDay(date);
  } catch (error) {
    console.error('Error fetching journal entry:', error);
    // Continue with empty data if fetch fails
  }

  return <JournalEntryClient date={date} initialData={initialData} />;
}

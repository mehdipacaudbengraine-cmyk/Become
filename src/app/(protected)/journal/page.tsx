import { getAllJournalEntries } from '@/lib/actions/journal';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

/**
 * Generate the last N days as Date objects (UTC midnight)
 */
function generateLastNDays(n: number): Date[] {
  const days: Date[] = [];
  const now = new Date();

  for (let i = 0; i < n; i++) {
    const date = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - i
    ));
    days.push(date);
  }

  return days;
}

/**
 * Format Date to YYYY-MM-DD for URLs
 */
function formatDateToISO(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format Date to DD/MM/YYYY for display
 */
function formatDateToDisplay(date: Date): string {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

export default async function JournalPage() {
  // Get all journal entries from DB
  const dbEntries = await getAllJournalEntries();

  // Generate last 30 days
  const allDays = generateLastNDays(30);

  // Calculate today UTC midnight for comparison
  const now = new Date();
  const todayUTC = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));

  // Create a map of existing entries by date string
  const entriesMap = new Map(
    dbEntries.map((entry: { day: Date; isValidated: boolean }) => [
      formatDateToISO(entry.day),
      entry.isValidated,
    ])
  );

  // Calculate current streak
  let currentStreak = 0;
  for (const day of allDays) {
    const dateStr = formatDateToISO(day);
    const isValidated = entriesMap.get(dateStr);
    if (isValidated) {
      currentStreak++;
    } else {
      break;
    }
  }

  const entries = allDays.map((day) => {
    const dateStr = formatDateToISO(day);
    const isValidated = entriesMap.get(dateStr);
    const isPast = day.getTime() < todayUTC.getTime();

    // Determine status based on whether it's a past day or today
    let status: string;
    if (isPast) {
      // Past day: "Validé" or "Non réalisé"
      status = isValidated ? 'Validé' : 'Non réalisé';
    } else {
      // Today or future: "À réaliser" or "Validé"
      status = isValidated ? 'Validé' : 'À réaliser';
    }

    return {
      dateISO: dateStr,
      dateDisplay: formatDateToDisplay(day),
      status,
      isClickable: !isPast, // Only today and future are clickable
    };
  });

  return (
    <div className="min-h-[calc(100vh-73px)] bg-black px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto">
        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white text-center mb-12">
          Carnet de bord
        </h1>

        {/* Timeline Entries */}
        <div className="space-y-3 mb-12">
          {entries.map((entry) => {
            const baseClasses = "flex items-center justify-between px-6 py-3 bg-gray-900/40 border border-gray-700/50 rounded-full transition-all duration-200";

            if (entry.isClickable) {
              // Clickable link (today and future days)
              return (
                <Link
                  key={entry.dateISO}
                  href={`/journal/${entry.dateISO}`}
                  className={`${baseClasses} hover:bg-gray-800/60 hover:border-gray-600/70`}
                >
                  <span className="text-white font-medium">{entry.dateDisplay}</span>
                  <span className="text-gray-400 text-sm">{entry.status}</span>
                </Link>
              );
            } else {
              // Non-clickable div (past days)
              return (
                <div
                  key={entry.dateISO}
                  className={`${baseClasses} cursor-default opacity-60`}
                >
                  <span className="text-white font-medium">{entry.dateDisplay}</span>
                  <span className="text-gray-400 text-sm">{entry.status}</span>
                </div>
              );
            }
          })}
        </div>

        {/* Series Stats */}
        <div className="text-center">
          <p className="text-gray-400 text-lg">
            Série en cours <span className="text-white font-semibold">{currentStreak}/{allDays.length}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

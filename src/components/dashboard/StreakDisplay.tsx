import t from '@/lib/i18n/t';

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
}

export function StreakDisplay({
  currentStreak,
  longestStreak,
}: StreakDisplayProps) {
  return (
    <div className="grid grid-cols-2 gap-4 w-full">
      <div className="bg-black/40 border border-gray-700 rounded-[16px] p-6 text-center hover:border-gray-600 transition-colors">
        <p className="text-xs sm:text-sm text-gray-400 mb-2">{t('streak.current')}</p>
        <p className="text-4xl sm:text-5xl font-bold text-white">{currentStreak}</p>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">{t('streak.days')}</p>
      </div>
      <div className="bg-black/40 border border-gray-700 rounded-[16px] p-6 text-center hover:border-gray-600 transition-colors">
        <p className="text-xs sm:text-sm text-gray-400 mb-2">{t('streak.longest')}</p>
        <p className="text-4xl sm:text-5xl font-bold text-white">{longestStreak}</p>
        <p className="text-xs sm:text-sm text-gray-500 mt-2">{t('streak.days')}</p>
      </div>
    </div>
  );
}

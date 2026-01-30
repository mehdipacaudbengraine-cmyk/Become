import t from '@/lib/i18n/t';

interface DailyPrincipleProps {
  principle: string;
}

export function DailyPrinciple({ principle }: DailyPrincipleProps) {
  return (
    <div className="bg-gradient-to-r from-gray-900/30 to-gray-800/20 border border-gray-700 text-gray-100 rounded-[16px] p-6">
      <p className="text-xs uppercase tracking-wider mb-3 text-gray-500">
        {t('dashboard.today_principle')}
      </p>
      <p className="text-lg font-light leading-relaxed text-gray-200 italic">{principle}</p>
    </div>
  );
}

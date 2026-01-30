import { type ClassValue, clsx } from 'clsx';
import t from './i18n/t';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-FR', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getToday(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function getDaysBetween(start: Date, end: Date): number {
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export type TodayFocus = {
  subtitle: string;
  items: string[];
};

/**
 * Returns 2-3 short action items for today's focus based on program title/slug and day number.
 * Minimal heuristic-based implementation to avoid extra server calls or DB changes.
 */
export function getTodayFocus(programTitleOrSlug: string, dayNumber: number): TodayFocus {
  const key = (programTitleOrSlug || '').toLowerCase();

  // Simple heuristics based on program title/slug
  const even = dayNumber % 2 === 0;
  if (key.includes('mind') || key.includes('meditat') || key.includes('mindful')) {
    return {
      subtitle: t('focus.subtitle_small_steps', { day: dayNumber }),
      items: [
        even ? t('focus.breathing_even') + ' + courte vigilance corporelle' : t('focus.breathing_odd'),
        t('focus.intention'),
        t('focus.complete_tasks'),
      ],
    };
  }

  if (key.includes('fitness') || key.includes('move') || key.includes('workout')) {
    return {
      subtitle: t('focus.subtitle_focus_day', { day: dayNumber }),
      items: [
        even ? t('focus.hi_intensity') : t('focus.low_intensity'),
        t('focus.hydrate'),
        t('focus.complete_tasks'),
      ],
    };
  }

  // Default guidance with light variation by day parity
  return {
    subtitle: t('focus.subtitle_focus_day', { day: dayNumber }),
    items: [
      even ? t('focus.practice_principle') : t('focus.read_principle'),
      t('focus.complete_tasks'),
      t('focus.reflect'),
    ],
  };
}

/**
 * PASS 9.1 – FEATURE FREEZE
 * No new messages, toasts, or behavioral triggers.
 */

'use client';

import Link from 'next/link';

interface DashboardActionsProps {
  morningCompleted: boolean;
  eveningCompleted: boolean;
  journalValidated: boolean;
  isReEntry?: boolean;
}

/**
 * Determine the primary action based on daily progress
 * Priority order: morning → evening → journal → progress
 * PASS 6.3: If isReEntry, force morning as primary action
 */
function getPrimaryAction(
  morningCompleted: boolean,
  eveningCompleted: boolean,
  journalValidated: boolean,
  isReEntry?: boolean
): 'morning' | 'evening' | 'journal' | 'progress' {
  // PASS 6.3: Re-entry forces morning as primary action
  if (isReEntry) return 'morning';
  if (!morningCompleted) return 'morning';
  if (!eveningCompleted) return 'evening';
  if (!journalValidated) return 'journal';
  return 'progress';
}

export default function DashboardActions({
  morningCompleted,
  eveningCompleted,
  journalValidated,
  isReEntry,
}: DashboardActionsProps) {
  const primaryAction = getPrimaryAction(morningCompleted, eveningCompleted, journalValidated, isReEntry);

  const actions = [
    {
      id: 'beginner',
      href: '/programs/beginner',
      label: 'Programme débutant',
    },
    {
      id: 'morning',
      // PASS 6.4: Add reentry param when isReEntry for micro-reassurance
      href: isReEntry ? '/routines/morning?reentry=1' : '/routines/morning',
      label: 'Routine matinale',
    },
    {
      id: 'evening',
      href: '/routines/evening',
      label: 'Routine soir',
    },
    {
      id: 'journal',
      href: '/journal',
      label: 'Carnet de bord',
    },
    {
      id: 'progress',
      href: '/progress',
      label: 'Ton avancée',
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {actions.map((action) => {
        const isPrimary = action.id === primaryAction;

        return (
          <Link key={action.id} href={action.href} className="block">
            <button
              className={`w-full be-btn-primary be-glass transition-all duration-300 ${
                isPrimary
                  ? 'be-card-interactive opacity-100'
                  : 'opacity-80 hover:opacity-100'
              }`}
            >
              {action.label}
            </button>
          </Link>
        );
      })}
    </div>
  );
}

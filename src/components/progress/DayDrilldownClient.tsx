'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toggleMorningTask } from '@/lib/actions/morning';
import { toggleEveningTask } from '@/lib/actions/evening';
import { toggleBeginnerTask } from '@/lib/actions/beginner';
import { getTodayISO, getDayRelation } from '@/lib/date';

interface Task {
  key: string;
  label: string;
  duration?: string | null;
}

interface DayDrilldownClientProps {
  dateStr: string;
  isFuture: boolean;
  morningCompleted: string[];
  eveningCompleted: string[];
  beginnerCompleted: string[];
}

const MORNING_TASKS: Task[] = [
  { key: 'wake-up', label: 'Réveil immédiat', duration: null },
  { key: 'natural-light', label: 'Lumière naturelle immédiate', duration: '5 minutes' },
  { key: 'water', label: '500 mL d\'eau au réveil', duration: '2 minutes' },
  { key: 'stretching', label: 'Etirement dynamique', duration: '10 minutes' },
  { key: 'meditation', label: 'Méditation', duration: '10 minutes' },
  { key: 'reading', label: 'Lecture', duration: '30 minutes' },
];

const EVENING_TASKS: Task[] = [
  { key: 'log-journal', label: 'Rempli ton carnet de bord' },
  { key: 'digital-detox', label: 'Detox, coupe les écrans' },
  { key: 'low-light', label: 'Dim, lumière basse' },
  { key: 'unwind', label: 'Unwind, détend ton corps' },
  { key: 'meditation', label: 'Revue mental guidée' },
  { key: 'plan-tomorrow', label: 'Prépare ta journée du lendemain' },
];

const BEGINNER_TASKS: Task[] = [
  { key: 'wake-up', label: 'Se lever à l\'heure définie' },
  { key: 'physical-activity', label: '10 min d\'activité physique' },
  { key: 'important-task', label: '1 tâche importante (25 min focus)' },
  { key: 'water-breakfast', label: '1 verre d\'eau + petit-déj simple' },
  { key: 'reading', label: '10 min lecture' },
  { key: 'day-plan', label: '5 min plan du jour' },
  { key: 'screens-off', label: 'Éteindre les réseaux 1h avant dormir' },
];

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00.000Z');
  const formatter = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const formatted = formatter.format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default function DayDrilldownClient({
  dateStr,
  isFuture,
  morningCompleted,
  eveningCompleted,
  beginnerCompleted,
}: DayDrilldownClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // PASS 4.1: Calculate day relation (past/today/future)
  const todayISO = getTodayISO();
  const dayRelation = getDayRelation(dateStr, todayISO);
  const isPast = dayRelation === 'past';
  const isLocked = isFuture || isPast;

  const [morningTasks, setMorningTasks] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    morningCompleted.forEach((key) => {
      initial[key] = true;
    });
    return initial;
  });

  const [eveningTasks, setEveningTasks] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    eveningCompleted.forEach((key) => {
      initial[key] = true;
    });
    return initial;
  });

  const [beginnerTasks, setBeginnerTasks] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    beginnerCompleted.forEach((key) => {
      initial[key] = true;
    });
    return initial;
  });

  const toggleTask = (
    routineType: 'morning' | 'evening' | 'beginner',
    taskKey: string
  ) => {
    if (isLocked) return; // PASS 4.1: Can't edit locked days (past or future)

    setLoading(`${routineType}-${taskKey}`);
    setError(null);

    // Optimistic update
    let oldState: boolean;
    if (routineType === 'morning') {
      oldState = morningTasks[taskKey] || false;
      setMorningTasks((prev) => ({ ...prev, [taskKey]: !prev[taskKey] }));
    } else if (routineType === 'evening') {
      oldState = eveningTasks[taskKey] || false;
      setEveningTasks((prev) => ({ ...prev, [taskKey]: !prev[taskKey] }));
    } else {
      oldState = beginnerTasks[taskKey] || false;
      setBeginnerTasks((prev) => ({ ...prev, [taskKey]: !prev[taskKey] }));
    }

    startTransition(async () => {
      try {
        let result;
        if (routineType === 'morning') {
          result = await toggleMorningTask(taskKey, dateStr);
        } else if (routineType === 'evening') {
          result = await toggleEveningTask(taskKey, dateStr);
        } else {
          result = await toggleBeginnerTask(taskKey, dateStr);
        }

        if (!result.success) {
          // Rollback on failure
          if (routineType === 'morning') {
            setMorningTasks((prev) => ({ ...prev, [taskKey]: oldState }));
          } else if (routineType === 'evening') {
            setEveningTasks((prev) => ({ ...prev, [taskKey]: oldState }));
          } else {
            setBeginnerTasks((prev) => ({ ...prev, [taskKey]: oldState }));
          }
          setError('Erreur lors de la sauvegarde');
        } else {
          // Align with server response
          if (routineType === 'morning') {
            setMorningTasks((prev) => ({ ...prev, [taskKey]: result.completed }));
          } else if (routineType === 'evening') {
            setEveningTasks((prev) => ({ ...prev, [taskKey]: result.completed }));
          } else {
            setBeginnerTasks((prev) => ({ ...prev, [taskKey]: result.completed }));
          }
          router.refresh();
        }
      } catch (err) {
        // Rollback on error
        if (routineType === 'morning') {
          setMorningTasks((prev) => ({ ...prev, [taskKey]: oldState }));
        } else if (routineType === 'evening') {
          setEveningTasks((prev) => ({ ...prev, [taskKey]: oldState }));
        } else {
          setBeginnerTasks((prev) => ({ ...prev, [taskKey]: oldState }));
        }
        setError('Erreur lors de la sauvegarde');
        console.error('Error toggling task:', err);
      } finally {
        setLoading(null);
      }
    });
  };

  const morningCount = Object.values(morningTasks).filter(Boolean).length;
  const eveningCount = Object.values(eveningTasks).filter(Boolean).length;
  const beginnerCount = Object.values(beginnerTasks).filter(Boolean).length;

  // Calculate score
  const morningScore = Math.min(morningCount, 6) / 6 * 40;
  const eveningScore = Math.min(eveningCount, 6) / 6 * 30;
  const beginnerScore = Math.min(beginnerCount, 7) / 7 * 20;
  const totalScore = Math.round(morningScore + eveningScore + beginnerScore);
  const isDisciplined = totalScore >= 70;

  return (
    <div className="min-h-[calc(100vh-73px)] bg-black px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto be-card-spacing">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/progress"
            className="inline-flex items-center gap-2 be-subtitle text-sm hover:text-white transition-colors duration-200 mb-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à la progression
          </Link>
          <h1 className="be-heading-1 mb-2">
            {formatDisplayDate(dateStr)}
          </h1>
          {/* PASS 4.1: Status badge for locked days */}
          {isLocked && (
            <p className="be-subtitle text-sm">
              {isFuture
                ? 'À venir — modification impossible.'
                : totalScore === 0
                ? 'Non réalisé — journée verrouillée.'
                : 'Réalisé — journée verrouillée.'}
            </p>
          )}
        </div>

        {/* Score Card */}
        <div className="be-card be-glass p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="be-subtitle text-sm mb-1">Score du jour</p>
              <p className={`text-3xl font-bold be-num ${isDisciplined ? 'text-white' : 'text-white/50'}`}>
                {totalScore}/100
              </p>
            </div>
            <div>
              {isDisciplined && (
                <span className="be-chip text-white font-semibold">
                  ✓ Discipliné
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400 mb-6">
            {error}
          </div>
        )}

        {/* Routines */}
        <div className="space-y-6">
          {/* Morning Routine */}
          <div className="be-card be-glass p-6">
            <h2 className="be-heading-3 mb-4">
              Routine matinale <span className="be-num text-white/60">({morningCount}/6)</span>
            </h2>
            <div className="space-y-2">
              {MORNING_TASKS.map((task) => (
                <label
                  key={task.key}
                  aria-disabled={isLocked}
                  className={`flex items-center gap-4 p-4 be-card be-task-item ${
                    isLocked ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={morningTasks[task.key] || false}
                    onChange={() => toggleTask('morning', task.key)}
                    disabled={isLocked || loading === `morning-${task.key}` || isPending}
                    tabIndex={isLocked ? -1 : 0}
                    className="w-5 h-5 rounded accent-white/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                  />
                  <div className="flex-1">
                    <span
                      className={`font-medium transition-colors block ${
                        morningTasks[task.key] ? 'text-white/50 line-through' : 'text-white'
                      }`}
                    >
                      {task.label}
                    </span>
                  </div>
                  {task.duration && (
                    <span className="be-subtitle text-sm flex-shrink-0">
                      {task.duration}
                    </span>
                  )}
                  {morningTasks[task.key] && (
                    <span className="text-white/60 text-lg flex-shrink-0">✓</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Evening Routine */}
          <div className="be-card be-glass p-6">
            <h2 className="be-heading-3 mb-4">
              Routine du soir <span className="be-num text-white/60">({eveningCount}/6)</span>
            </h2>
            <div className="space-y-2">
              {EVENING_TASKS.map((task) => (
                <label
                  key={task.key}
                  aria-disabled={isLocked}
                  className={`flex items-center gap-4 p-4 be-card be-task-item ${
                    isLocked ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={eveningTasks[task.key] || false}
                    onChange={() => toggleTask('evening', task.key)}
                    disabled={isLocked || loading === `evening-${task.key}` || isPending}
                    tabIndex={isLocked ? -1 : 0}
                    className="w-5 h-5 rounded accent-white/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                  />
                  <span
                    className={`flex-1 font-medium transition-colors ${
                      eveningTasks[task.key] ? 'text-white/50 line-through' : 'text-white'
                    }`}
                  >
                    {task.label}
                  </span>
                  {eveningTasks[task.key] && (
                    <span className="text-white/60 text-lg flex-shrink-0">✓</span>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Beginner Program */}
          <div className="be-card be-glass p-6">
            <h2 className="be-heading-3 mb-4">
              Programme débutant <span className="be-num text-white/60">({beginnerCount}/7)</span>
            </h2>
            <div className="space-y-2">
              {BEGINNER_TASKS.map((task) => (
                <label
                  key={task.key}
                  aria-disabled={isLocked}
                  className={`flex items-center gap-4 p-4 be-card be-task-item ${
                    isLocked ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={beginnerTasks[task.key] || false}
                    onChange={() => toggleTask('beginner', task.key)}
                    disabled={isLocked || loading === `beginner-${task.key}` || isPending}
                    tabIndex={isLocked ? -1 : 0}
                    className="w-5 h-5 rounded accent-white/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
                  />
                  <span
                    className={`flex-1 font-medium transition-colors ${
                      beginnerTasks[task.key] ? 'text-white/50 line-through' : 'text-white'
                    }`}
                  >
                    {task.label}
                  </span>
                  {beginnerTasks[task.key] && (
                    <span className="text-white/60 text-lg">✓</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

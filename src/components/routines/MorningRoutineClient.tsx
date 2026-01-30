/**
 * PASS 9.1 – FEATURE FREEZE
 * No new messages, toasts, or behavioral triggers.
 */

'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toggleMorningTask } from '@/lib/actions/morning';

interface Task {
  key: string;
  name: string;
  duration: string | null;
}

interface MorningRoutineClientProps {
  selectedDay: string;
  initialCompleted: string[];
  isReEntry?: boolean;
}

export default function MorningRoutineClient({
  selectedDay,
  initialCompleted,
  isReEntry,
}: MorningRoutineClientProps) {
  const router = useRouter();
  const tasks: Task[] = [
    { key: 'wake-up', name: 'Réveil immédiat', duration: null },
    { key: 'natural-light', name: 'Lumière naturelle immédiate', duration: '5 minutes' },
    { key: 'water', name: '500 mL d\'eau au réveil', duration: '2 minutes' },
    { key: 'stretching', name: 'Etirement dynamique', duration: '10 minutes' },
    { key: 'meditation', name: 'Méditation', duration: '10 minutes' },
    { key: 'reading', name: 'Lecture', duration: '30 minutes' },
  ];

  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    initialCompleted.forEach((key) => {
      initial[key] = true;
    });
    return initial;
  });

  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [animateCount, setAnimateCount] = useState(false);

  // Reset state when selectedDay or initialCompleted changes
  useEffect(() => {
    const next: Record<string, boolean> = {};
    initialCompleted.forEach((key) => {
      next[key] = true;
    });
    setCompletedTasks(next);
    setError(null);
    setLoading(null);
  }, [selectedDay, initialCompleted]);

  const toggleTask = (taskKey: string) => {
    setLoading(taskKey);
    setError(null);

    // Optimistic update
    const oldState = completedTasks[taskKey];
    setCompletedTasks((prev) => ({
      ...prev,
      [taskKey]: !prev[taskKey],
    }));

    // Trigger count animation
    setAnimateCount(true);
    setTimeout(() => setAnimateCount(false), 300);

    startTransition(async () => {
      try {
        const result = await toggleMorningTask(taskKey, selectedDay);

        if (!result.success) {
          // Rollback on failure
          setCompletedTasks((prev) => ({
            ...prev,
            [taskKey]: oldState,
          }));
          setError('Erreur lors de la sauvegarde');
        } else {
          // Align with server response
          setCompletedTasks((prev) => ({
            ...prev,
            [taskKey]: result.completed,
          }));
          // Refresh the page data after successful toggle
          router.refresh();
        }
      } catch (err) {
        // Rollback on error
        setCompletedTasks((prev) => ({
          ...prev,
          [taskKey]: oldState,
        }));
        setError('Erreur lors de la sauvegarde');
        console.error('Error toggling task:', err);
      } finally {
        setLoading(null);
      }
    });
  };

  const completedCount = Object.values(completedTasks).filter(Boolean).length;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-black px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto be-card-spacing">
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1" />
          <div className="flex-1 text-center">
            <h1 className="be-heading-1">
              Routine matinale
            </h1>
          </div>
          <div className="flex-1 flex justify-end">
            <Link href="/dashboard">
              <button className="text-white/60 hover:text-white transition-colors duration-200 p-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>
            </Link>
          </div>
        </div>

        {/* PASS 6.4: Re-entry micro-reassurance */}
        {isReEntry && (
          <div className="be-card be-glass p-4 mb-4 text-center">
            <p className="be-subtitle text-sm text-white/70">
              Une seule action suffit pour relancer la machine.
            </p>
          </div>
        )}

        {/* Citation */}
        <div className="text-center be-section-spacing">
          <p className="be-subtitle text-sm sm:text-base leading-relaxed">
            « Perdez une heure le matin, et vous passerez toute
            <br />
            la journée à courir après »
            <br />
            <span className="text-white/40 text-sm mt-2 block">Richard Whately</span>
          </p>
        </div>

        {/* Tasks List */}
        <div className="space-y-2">
          {tasks.map((task) => (
            <label
              key={task.key}
              className="flex items-center gap-4 p-4 be-card be-task-item"
            >
              <input
                type="checkbox"
                checked={completedTasks[task.key] || false}
                onChange={() => toggleTask(task.key)}
                disabled={loading === task.key || isPending}
                className="be-checkbox"
              />
              <div className="flex-1 flex items-baseline justify-between gap-3">
                <span
                  className={`be-task-text ${
                    completedTasks[task.key] ? 'be-task-text--completed' : ''
                  }`}
                >
                  {task.name}
                </span>
                {task.duration && (
                  <span className="text-white/40 text-sm flex-shrink-0">
                    {task.duration}
                  </span>
                )}
              </div>
              {completedTasks[task.key] && (
                <span className="text-white/60 text-lg flex-shrink-0">✓</span>
              )}
            </label>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400 mb-6">
            {error}
          </div>
        )}

        {/* Stats Card */}
        <div className="be-card be-glass p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="be-subtitle text-sm mb-1">Tâches réalisées</p>
              <p
                className={`be-score text-lg transition-transform duration-300 ${
                  animateCount ? 'scale-105' : 'scale-100'
                }`}
              >
                {completedCount}/{tasks.length}
              </p>
            </div>
            <div>
              <p className="be-subtitle text-sm mb-1">Série en cours</p>
              <p className="be-score text-lg">0</p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="flex justify-center mt-6">
          <Link href="/dashboard">
            <button className="be-btn-primary be-glass">
              Retour au dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

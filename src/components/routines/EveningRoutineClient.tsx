/**
 * PASS 9.1 – FEATURE FREEZE
 * No new messages, toasts, or behavioral triggers.
 */

'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toggleEveningTask } from '@/lib/actions/evening';

interface Task {
  key: string;
  name: string;
}

interface EveningRoutineClientProps {
  selectedDay: string;
  initialCompleted: string[];
}

export default function EveningRoutineClient({
  selectedDay,
  initialCompleted,
}: EveningRoutineClientProps) {
  const router = useRouter();
  const tasks: Task[] = [
    { key: 'log-journal', name: 'Rempli ton carnet de bord' },
    { key: 'digital-detox', name: 'Detox, coupe les écrans' },
    { key: 'low-light', name: 'Dim, lumière basse' },
    { key: 'unwind', name: 'Unwind, détend ton corps' },
    { key: 'meditation', name: 'Revue mental guidée' },
    { key: 'plan-tomorrow', name: 'Prépare ta journée du lendemain' },
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
        const result = await toggleEveningTask(taskKey, selectedDay);
        
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
              Routine du soir
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

        {/* Citation */}
        <div className="text-center be-section-spacing">
          <p className="be-subtitle text-sm sm:text-base leading-relaxed">
            On ne gagne pas la journée le matin.
            <br />
            On la prépare la veille.
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
              <span
                className={`be-task-text ${
                  completedTasks[task.key] ? 'be-task-text--completed' : ''
                }`}
              >
                {task.name}
              </span>
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

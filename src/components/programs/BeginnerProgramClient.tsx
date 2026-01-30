'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toggleBeginnerTask } from '@/lib/actions/beginner';

interface Task {
  key: string;
  label: string;
}

interface BeginnerProgramClientProps {
  selectedDay: string;
  initialCompleted: string[];
}

/**
 * Get emotional progression label based on score
 */
function getProgressionLabel(score: number): string {
  if (score === 0) return 'Commence maintenant';
  if (score < 40) return 'Journée entamée';
  if (score < 70) return 'En construction';
  if (score < 100) return 'Discipline respectée';
  return 'Journée pleine';
}

export default function BeginnerProgramClient({
  selectedDay,
  initialCompleted,
}: BeginnerProgramClientProps) {
  const router = useRouter();
  const tasks: Task[] = [
    { key: 'wake-up', label: 'Se lever à l\'heure définie' },
    { key: 'physical-activity', label: '10 min d\'activité physique' },
    { key: 'important-task', label: '1 tâche importante (25 min focus)' },
    { key: 'water-breakfast', label: '1 verre d\'eau + petit-déj simple' },
    { key: 'reading', label: '10 min lecture' },
    { key: 'day-plan', label: '5 min plan du jour' },
    { key: 'screens-off', label: 'Éteindre les réseaux 1h avant dormir' },
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
        const result = await toggleBeginnerTask(taskKey, selectedDay);
        
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
  const progressPercentage = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-black px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto be-card-spacing">
        {/* Header */}
        <div className="text-center be-section-spacing">
          <h1 className="be-heading-1 mb-3">
            Programme Débutant
          </h1>
          <p className="be-subtitle">
            Complétez vos tâches quotidiennes pour développer vos habitudes
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
                {task.label}
              </span>
              {completedTasks[task.key] && (
                <span className="text-white/60 text-lg flex-shrink-0">✓</span>
              )}
            </label>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="be-card be-glass p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="be-subtitle text-sm">Progression</span>
            <span
              className={`be-score transition-transform duration-300 ${
                animateCount ? 'scale-105' : 'scale-100'
              }`}
            >
              {completedCount}/{tasks.length}
            </span>
          </div>
          <div className="be-progress-bar">
            <div
              className={`be-progress-fill ${
                progressPercentage < 100 ? 'be-progress-fill--incomplete' : ''
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="mt-4 space-y-1">
            <p
              className={`be-subtitle text-sm text-center transition-transform duration-300 ${
                animateCount ? 'scale-105' : 'scale-100'
              }`}
            >
              {progressPercentage}% complété
            </p>
            <p className="text-white/65 text-xs text-center transition-colors duration-300">
              {getProgressionLabel(progressPercentage)}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Back Button */}
        <div className="flex justify-center">
          <Link href="/dashboard">
            <button className="be-btn-primary">
              Retour au dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

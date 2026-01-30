'use client';

import { useState } from 'react';
import t from '@/lib/i18n/t';
import { completeTask, uncompleteTask } from '@/lib/actions/tasks';
import { TaskWithCompletion } from '@/types';

interface TaskListProps {
  tasks: TaskWithCompletion[];
  userId: string;
}

export function TaskList({ tasks, userId }: TaskListProps) {
  const [optimisticTasks, setOptimisticTasks] = useState(tasks);

  async function handleToggle(taskId: string, currentState: boolean) {
    // Optimistic update
    setOptimisticTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, isCompleted: !currentState } : t
      )
    );

    // Server update
    if (currentState) {
      await uncompleteTask(userId, taskId);
    } else {
      await completeTask(userId, taskId);
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {t('dashboard.no_tasks')}
      </div>
    );
  }

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      body: { bg: 'bg-red-900/30', text: 'text-red-400' },
      mindset: { bg: 'bg-blue-900/30', text: 'text-blue-400' },
      focus: { bg: 'bg-green-900/30', text: 'text-green-400' },
      habits: { bg: 'bg-yellow-900/30', text: 'text-yellow-400' },
    };
    return colors[category] || { bg: 'bg-gray-800', text: 'text-gray-400' };
  };

  return (
    <div className="space-y-3">
      {optimisticTasks.map((task) => {
        const badge = getCategoryBadge(task.category);
        return (
          <div
            key={task.id}
            className={`flex items-start gap-4 p-4 border rounded-lg transition-all duration-200 ${
              task.isCompleted
                ? 'bg-gray-900/50 border-gray-700'
                : 'bg-black/40 border-gray-700 hover:border-gray-600'
            }`}
          >
            <input
              type="checkbox"
              checked={task.isCompleted}
              onChange={() => handleToggle(task.id, task.isCompleted)}
              className="mt-1 w-5 h-5 cursor-pointer accent-white"
            />
            <div className="flex-1">
              <p
                className={`font-medium transition-colors ${
                  task.isCompleted ? 'line-through text-gray-500' : 'text-gray-100'
                }`}
              >
                {task.title}
              </p>
              <span
                className={`inline-block mt-2 px-2.5 py-1 text-xs font-medium rounded-lg ${badge.bg} ${badge.text}`}
              >
                {t(`category.${task.category}`)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

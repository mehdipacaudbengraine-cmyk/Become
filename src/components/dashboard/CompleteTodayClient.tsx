"use client";

import { useEffect, useState, useRef } from "react";
import t from '@/lib/i18n/t';

interface Props {
  initialAlreadyCompleted: boolean;
  formId: string;
  buttonId: string;
}

export default function CompleteTodayClient({ initialAlreadyCompleted, formId, buttonId }: Props) {
  const [status, setStatus] = useState<'idle' | 'saving' | 'done'>(
    initialAlreadyCompleted ? 'done' : 'idle'
  );

  const submitting = status === 'saving';
  const completed = status === 'done';

  useEffect(() => {
    // keep status in sync if initial prop changes
    if (initialAlreadyCompleted && status !== 'done') {
      setStatus('done');
    }
  }, [initialAlreadyCompleted, status]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (submitting || completed) return;

    const form = document.getElementById(formId) as HTMLFormElement | null;
    if (!form) return;

    setStatus('saving');
    // submit the server form; server will enforce correctness
    // we optimistically mark as done for UX
    try {
      form.requestSubmit();
      setStatus('done');
    } catch (err) {
      setStatus('idle');
    }
  };

  // Inline messages
  if (completed && initialAlreadyCompleted) {
    return <div className="ml-4 text-sm text-gray-600">{t('dashboard.status.already')}</div>;
  }

  if (completed && !initialAlreadyCompleted) {
    return <div className="ml-4 text-sm text-green-700 font-medium">{t('dashboard.status.done')}</div>;
  }

  if (submitting) {
    return <div className="ml-4 text-sm text-gray-600">{t('dashboard.status.saving')}</div>;
  }

  return (
    <button
      onClick={handleClick}
      className="ml-4 inline-flex items-center"
      disabled={submitting || completed}
    >
      {/* Spinner will be shown via status when needed; idle shows original server button */}
      <span className="sr-only">{t('dashboard.complete_today')}</span>
    </button>
  );
}

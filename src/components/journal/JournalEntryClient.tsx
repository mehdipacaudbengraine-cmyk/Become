'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { saveJournalByDay } from '@/lib/actions/journal';

interface JournalEntryClientProps {
  date: string;
  initialData: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    isValidated: boolean;
  };
}

/**
 * Format date YYYY-MM-DD to DD/MM/YYYY
 */
function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-');
  return `${day}/${month}/${year}`;
}

export default function JournalEntryClient({
  date,
  initialData,
}: JournalEntryClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [formData, setFormData] = useState({
    q1: initialData.q1,
    q2: initialData.q2,
    q3: initialData.q3,
    q4: initialData.q4,
  });

  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const questions = [
    { key: 'q1', label: "Comment s'est passée ta journée ?" },
    { key: 'q2', label: "Qu'as-tu accompli aujourd'hui ?" },
    { key: 'q3', label: 'Quelles difficultés as-tu rencontrées ?' },
    { key: 'q4', label: 'Que veux-tu améliorer demain ?' },
  ];

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
    // Clear messages when user starts typing
    setSuccessMessage(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const result = await saveJournalByDay(date, formData);

        if (result.success) {
          if (result.isValidated) {
            setSuccessMessage('Journal enregistré et validé !');
          } else {
            setSuccessMessage('Journal enregistré (brouillon - remplis toutes les questions pour valider)');
          }
          // Refresh the page data
          router.refresh();
        } else {
          setErrorMessage('Erreur lors de la sauvegarde');
        }
      } catch (err) {
        console.error('Error saving journal:', err);
        setErrorMessage('Erreur lors de la sauvegarde');
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-black px-4 py-8 sm:py-12">
      <div className="max-w-2xl mx-auto be-card-spacing">
        {/* Header */}
        <div className="flex items-center justify-between be-section-spacing">
          <Link
            href="/journal"
            className="be-nav-link"
          >
            ← Retour
          </Link>
          <h1 className="be-heading-2">
            {formatDate(date)}
          </h1>
          <div className="w-20"></div> {/* Spacer for centering */}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((question) => (
            <div key={question.key} className="space-y-3">
              <label
                htmlFor={question.key}
                className="block be-heading-3 text-base"
              >
                {question.label}
              </label>
              <textarea
                id={question.key}
                value={formData[question.key as keyof typeof formData]}
                onChange={(e) => handleChange(question.key, e.target.value)}
                rows={4}
                className="be-textarea resize-none"
                placeholder="Écris ta réponse..."
              />
            </div>
          ))}

          {/* Messages */}
          {successMessage && (
            <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
              <p className="text-green-400 text-sm">{successMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
              <p className="text-red-400 text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full be-btn-primary be-glass bg-white/10 border-white/20 hover:bg-white/15 disabled:opacity-40"
          >
            {isPending ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>

        {/* Status indicator */}
        {initialData.isValidated && !successMessage && (
          <div className="text-center">
            <span className="be-chip text-green-400" style={{ borderColor: 'rgba(34, 197, 94, 0.3)', background: 'rgba(34, 197, 94, 0.1)' }}>
              ✓ Journal validé
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

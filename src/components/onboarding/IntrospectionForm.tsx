'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { saveIntrospection } from '@/lib/actions/introspection';
import t from '@/lib/i18n/t';

export default function IntrospectionForm() {
  const router = useRouter();
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!q1.trim() || !q2.trim() || !q3.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setError(null);

    startTransition(async () => {
      try {
        console.log('[IntrospectionForm] Calling saveIntrospection...');
        const result = await saveIntrospection(q1, q2, q3);
        
        console.log('[IntrospectionForm] Result:', result);
        
        if (result.success) {
          console.log('[IntrospectionForm] Success, redirecting to /dashboard');
          // Redirect to dashboard after successful save
          router.replace('/dashboard');
        } else {
          // Handle error responses
          let errorMsg = t('onboarding.introspection.error');
          
          if (result.code === 'UNAUTH') {
            errorMsg = 'Session expirée, reconnecte-toi';
          } else if (result.code === 'DB_ERROR') {
            errorMsg = 'Erreur de sauvegarde. Réessaie.';
            // Show detailed error in dev mode
            if (process.env.NODE_ENV === 'development' && result.message) {
              console.error('[IntrospectionForm] Dev error details:', result.message);
            }
          }
          
          setError(errorMsg);
          console.error('[IntrospectionForm] Error:', result.code, result.message);
        }
      } catch (err) {
        console.error('[IntrospectionForm] Exception:', err);
        setError(t('onboarding.introspection.error'));
      }
    });
  };

  return (
    <div className="min-h-[calc(100vh-73px)] flex items-center justify-center bg-black px-4 py-12 sm:py-20">
      <div className="w-full max-w-2xl space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            {t('onboarding.introspection.title')}
          </h1>
          <p className="text-gray-400 text-lg">
            {t('onboarding.introspection.subtitle')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Question 1 */}
          <div className="space-y-2">
            <label className="block text-white font-semibold">
              {t('onboarding.introspection.q1')}
            </label>
            <textarea
              value={q1}
              onChange={(e) => setQ1(e.target.value)}
              placeholder={t('onboarding.introspection.q1_placeholder')}
              className="w-full px-4 py-3 bg-black/50 border border-white/15 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 resize-none"
              rows={4}
              disabled={isPending}
            />
          </div>

          {/* Question 2 */}
          <div className="space-y-2">
            <label className="block text-white font-semibold">
              {t('onboarding.introspection.q2')}
            </label>
            <textarea
              value={q2}
              onChange={(e) => setQ2(e.target.value)}
              placeholder={t('onboarding.introspection.q2_placeholder')}
              className="w-full px-4 py-3 bg-black/50 border border-white/15 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 resize-none"
              rows={4}
              disabled={isPending}
            />
          </div>

          {/* Question 3 */}
          <div className="space-y-2">
            <label className="block text-white font-semibold">
              {t('onboarding.introspection.q3')}
            </label>
            <textarea
              value={q3}
              onChange={(e) => setQ3(e.target.value)}
              placeholder={t('onboarding.introspection.q3_placeholder')}
              className="w-full px-4 py-3 bg-black/50 border border-white/15 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/10 resize-none"
              rows={4}
              disabled={isPending}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isPending}
              className="min-w-[160px]"
            >
              {isPending ? t('onboarding.introspection.saving') : t('onboarding.introspection.button')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

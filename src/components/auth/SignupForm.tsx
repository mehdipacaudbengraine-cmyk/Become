'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signupUser } from '@/lib/actions/signup';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import t from '@/lib/i18n/t';

export function SignupForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await signupUser(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Auto login after signup
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const signInResult = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (signInResult?.error) {
      setError(t('auth.signup.created_but_login_failed'));
      setLoading(false);
      return;
    }

    // Redirect to introspection for onboarding
    router.push('/onboarding/introspection');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="name"
        label={t('auth.signup.labels.name')}
        type="text"
        required
        placeholder={t('auth.signup.placeholder.name')}
        disabled={loading}
      />
      <Input
        name="email"
        label={t('auth.signup.labels.email')}
        type="email"
        required
        placeholder={t('auth.signup.placeholder.email')}
        disabled={loading}
      />
      <Input
        name="password"
        label={t('auth.signup.labels.password')}
        type="password"
        required
        placeholder={t('auth.signup.placeholder.password')}
        disabled={loading}
      />

      {error && (
        <div className="p-3 bg-red-950 border border-red-800 text-red-300 text-sm rounded">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t('auth.signup.saving') : t('auth.signup.button')}
      </Button>
    </form>
  );
}

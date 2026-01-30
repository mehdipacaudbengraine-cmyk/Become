'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import t from '@/lib/i18n/t';

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError(t('auth.login.error_invalid'));
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="email"
        label={t('auth.login.labels.email')}
        type="email"
        required
        placeholder={t('auth.login.placeholder.email')}
        disabled={loading}
      />
      <Input
        name="password"
        label={t('auth.login.labels.password')}
        type="password"
        required
        placeholder={t('auth.login.placeholder.password')}
        disabled={loading}
      />

      {error && (
        <div className="p-3 bg-red-950 border border-red-800 text-red-300 text-sm rounded">
          {error}
        </div>
      )}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? t('auth.login.saving') : t('auth.login.button')}
      </Button>
    </form>
  );
}

import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';
import { Card } from '@/components/ui/Card';
import t from '@/lib/i18n/t';

export const dynamic = 'force-dynamic';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white">{t('auth.signup.title')}</h1>
          <p className="text-gray-400">{t('auth.signup.subtitle')}</p>
        </div>

        <Card className="border-white/20">
          <SignupForm />

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">{t('auth.signup.have_account')} </span>
            <Link href="/login" className="font-medium text-white hover:text-gray-300">
              {t('auth.signup.linkLogin')}
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

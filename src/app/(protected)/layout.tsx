import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import LogoutButton from '@/components/auth/LogoutButton';
import t from '@/lib/i18n/t';
import { ReactNode } from 'react';

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-2xl font-bold">
            {t('landing.logo')}
          </Link>
          <div className="flex-1 flex items-center gap-6 text-sm">
            <div className="flex gap-6">
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-black font-medium"
              >
                {t('nav.dashboard')}
              </Link>
              <Link
                href="/programs"
                className="text-gray-700 hover:text-black font-medium"
              >
                {t('nav.programs')}
              </Link>
              <Link
                href="/progress"
                className="text-gray-700 hover:text-black font-medium"
              >
                {t('nav.progress')}
              </Link>
            </div>
            <div className="ml-auto">
              <LogoutButton />
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/auth/LogoutButton';
import t from '@/lib/i18n/t';

export function ProtectedNavbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b be-glass sticky top-0 z-50" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center">
        <div className="hidden md:flex items-center gap-10">
          <Link
            href="/dashboard"
            className="text-2xl font-bold text-white tracking-tight focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded"
            style={{ letterSpacing: '-0.01em' }}
          >
            {t('landing.logo')}
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className={`be-nav-link focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded ${
                pathname === '/dashboard' ? 'be-nav-link--active' : ''
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/journal"
              className={`be-nav-link focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20 rounded ${
                pathname?.startsWith('/journal') ? 'be-nav-link--active' : ''
              }`}
            >
              Carnet de bord
            </Link>
          </div>
        </div>
        <div className="ml-auto">
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}

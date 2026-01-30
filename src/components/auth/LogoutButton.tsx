"use client";

import { signOut, useSession } from 'next-auth/react';
import t from '@/lib/i18n/t';

export default function LogoutButton() {
  const { data: session } = useSession();
  if (!session || !session.user) return null;

  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      className="ml-4 inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-200 font-medium px-2 py-1 rounded"
      aria-label={t('auth.logout')}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 8v8" />
      </svg>
      <span>{t('auth.logout')}</span>
    </button>
  );
}

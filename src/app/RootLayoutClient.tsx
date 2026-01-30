'use client';

import { SessionProvider } from '@/components/providers/SessionProvider';
import { ReactNode } from 'react';

export function RootLayoutClient({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

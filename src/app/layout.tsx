import type { Metadata } from 'next';
import { SessionProvider } from '@/components/providers/SessionProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'BECOME - Système d’exécution personnel',
  description: "Transformer le développement personnel en un système d'exécution clair et structuré.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

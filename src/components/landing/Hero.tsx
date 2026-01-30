import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import t from '@/lib/i18n/t';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function Hero() {
  const session = await getServerSession(authOptions);

  // If authenticated, redirect to introspection; otherwise to signup
  const primaryHref = session ? '/onboarding/introspection' : '/signup';

  return (
    <section className="relative min-h-[calc(100vh-73px)] flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 sm:py-32">
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight tracking-tight mb-6 bg-gradient-to-b from-white via-zinc-300 to-zinc-700 bg-clip-text text-transparent">
          {t('landing.hero.title').split('\n').map((line: string, i: number) => (
            <span key={i}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </h1>

        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
          {t('landing.hero.subtitle')}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href={primaryHref}>
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              {t('landing.hero.primary')}
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              {t('landing.hero.secondary')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

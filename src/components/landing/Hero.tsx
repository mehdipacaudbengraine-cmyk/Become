import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import t from '@/lib/i18n/t';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function Hero() {
  const session = await getServerSession(authOptions);

  // If authenticated, send to onboarding; otherwise to signup
  const primaryHref = session ? '/onboarding/introspection' : '/signup';

  return (
    <section className="relative min-h-[calc(100vh-73px)] flex items-center justify-center py-12 sm:py-16 lg:py-20 overflow-hidden">
      {/* Radial gradient depth - contained */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_50%_30%,rgba(255,255,255,0.06),transparent_70%)]" />
      
      {/* Content container */}
      <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Glass card */}
        <div className="relative rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-6 sm:p-10 lg:p-12">
          {/* Inner content - centered */}
          <div className="text-center space-y-6 sm:space-y-8">
            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight tracking-tight bg-gradient-to-b from-white via-zinc-300 to-zinc-700 bg-clip-text text-transparent">
              {t('landing.hero.title')
                .split('\n')
                .map((line: string, i: number) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {line}
                  </span>
                ))}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {t('landing.hero.subtitle')}
            </p>

            {/* Proof / reassurance line */}
            <p className="text-sm text-white/60 max-w-xl mx-auto">
              {t('landing.hero.proof')}
            </p>

            {/* Credibility chips */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs text-white/60">
                7 jours • 1 score
              </span>
              <span className="px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs text-white/60">
                Stoïque. Sans dopamine.
              </span>
              <span className="px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs text-white/60">
                Routine → progrès
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link href={primaryHref} className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  {t('landing.hero.primary')}
                </Button>
              </Link>

              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  {t('landing.hero.secondary')}
                </Button>
              </Link>
            </div>

            {/* Feature bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left">
                <p className="text-white font-semibold text-sm mb-1">{t('landing.hero.bullets.0.title')}</p>
                <p className="text-white/60 text-xs leading-relaxed">{t('landing.hero.bullets.0.desc')}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left">
                <p className="text-white font-semibold text-sm mb-1">{t('landing.hero.bullets.1.title')}</p>
                <p className="text-white/60 text-xs leading-relaxed">{t('landing.hero.bullets.1.desc')}</p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left">
                <p className="text-white font-semibold text-sm mb-1">{t('landing.hero.bullets.2.title')}</p>
                <p className="text-white/60 text-xs leading-relaxed">{t('landing.hero.bullets.2.desc')}</p>
              </div>
            </div>

            {/* Micro reassurance */}
            <p className="text-xs text-white/40">
              {t('landing.hero.note')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

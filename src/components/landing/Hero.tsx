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
    <section className="relative min-h-[calc(100vh-73px)] flex items-center justify-center py-14 sm:py-24 lg:py-28 overflow-hidden">
      {/* Radial gradient depth */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_50%_40%,rgba(255,255,255,0.04),transparent_70%)]" />

      {/* Content — floats directly on the grid */}
      <div className="relative w-full max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 text-center space-y-6 sm:space-y-10">
        {/* Headline */}
        <h1 className="text-[1.75rem] sm:text-5xl lg:text-6xl font-bold leading-[1.05] sm:leading-[1.1] tracking-tight bg-gradient-to-b from-white via-zinc-300 to-zinc-700 bg-clip-text text-transparent [text-wrap:balance] max-w-[20ch] sm:max-w-none mx-auto">
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
        <p className="text-[0.95rem] sm:text-lg text-gray-400 max-w-[28ch] sm:max-w-xl mx-auto leading-relaxed sm:leading-normal line-clamp-2 sm:line-clamp-none">
          {t('landing.hero.subtitle')}
        </p>

        {/* Chips — hidden on mobile */}
        <div className="hidden sm:flex items-center justify-center gap-2">
          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs text-white/50">
            7 jours · 1 score
          </span>
          <span className="px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] text-xs text-white/50">
            Sans dopamine
          </span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 sm:pt-0">
          <Link href={primaryHref} className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto !py-3.5 sm:!py-3">
              {t('landing.hero.primary')}
            </Button>
          </Link>

          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto !py-3.5 sm:!py-3">
              {t('landing.hero.secondary')}
            </Button>
          </Link>
        </div>

        {/* Micro-line — mobile only */}
        <p className="block sm:hidden text-[0.7rem] text-white/30 tracking-wide">
          2 minutes pour démarrer.
        </p>

        {/* Feature cards — mobile: inline summary / desktop: 3 cards */}
        {/* Mobile: single discreet line */}
        <div className="flex sm:hidden items-center justify-center gap-1.5 text-[0.65rem] text-white/30 pt-2">
          <span>{t('landing.hero.bullets.0.title')}</span>
          <span>·</span>
          <span>{t('landing.hero.bullets.1.title')}</span>
          <span>·</span>
          <span>{t('landing.hero.bullets.2.title')}</span>
        </div>

        {/* Desktop: full cards */}
        <div className="hidden sm:grid sm:grid-cols-3 gap-3 pt-2">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm px-4 py-3 text-left">
            <p className="text-white font-semibold text-sm">{t('landing.hero.bullets.0.title')}</p>
            <p className="text-white/50 text-xs mt-1">{t('landing.hero.bullets.0.desc')}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm px-4 py-3 text-left">
            <p className="text-white font-semibold text-sm">{t('landing.hero.bullets.1.title')}</p>
            <p className="text-white/50 text-xs mt-1">{t('landing.hero.bullets.1.desc')}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm px-4 py-3 text-left">
            <p className="text-white font-semibold text-sm">{t('landing.hero.bullets.2.title')}</p>
            <p className="text-white/50 text-xs mt-1">{t('landing.hero.bullets.2.desc')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

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
    <section className="relative min-h-[calc(100vh-73px)] flex items-center justify-center overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04] bg-[linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] bg-[size:40px_40px]" />
      {/* Radial gradient depth */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_60%)]" />
      <div className="relative max-w-4xl mx-auto px-6 sm:px-8 lg:px-10 text-center py-20 sm:py-32 border border-white/10 rounded-2xl bg-white/[0.02] backdrop-blur-sm space-y-10">
        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight tracking-tight mb-6 bg-gradient-to-b from-white via-zinc-300 to-zinc-700 bg-clip-text text-transparent">
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
        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          {t('landing.hero.subtitle')}
        </p>

        {/* Proof / reassurance line */}
        <p className="text-sm sm:text-base text-white/60 max-w-2xl mx-auto mb-10">
          {t('landing.hero.proof')}
        </p>

        {/* Credibility chips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
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
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
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

        {/* Feature bullets (fills the “empty” feel + conversion) */}
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-left">
            <p className="text-white font-semibold mb-1">{t('landing.hero.bullets.0.title')}</p>
            <p className="text-white/60 text-sm leading-relaxed">{t('landing.hero.bullets.0.desc')}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-left">
            <p className="text-white font-semibold mb-1">{t('landing.hero.bullets.1.title')}</p>
            <p className="text-white/60 text-sm leading-relaxed">{t('landing.hero.bullets.1.desc')}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 text-left">
            <p className="text-white font-semibold mb-1">{t('landing.hero.bullets.2.title')}</p>
            <p className="text-white/60 text-sm leading-relaxed">{t('landing.hero.bullets.2.desc')}</p>
          </div>
        </div>

        {/* Micro reassurance (optional but strong) */}
        <p className="text-xs sm:text-sm text-white/45 mt-6">
          {t('landing.hero.note')}
        </p>
      </div>
    </section>
  );
}
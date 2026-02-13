import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Button } from '@/components/ui/Button';

export default async function ManifestoPage() {
  const session = await getServerSession(authOptions);
  const ctaHref = session ? '/onboarding/introspection' : '/signup';

  return (
    <div className="be-landing-grid min-h-screen bg-black overflow-hidden">
      {/* Radial center glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_25%,_rgba(255,255,255,0.06),_transparent_65%)]" />

      <div className="relative z-10 max-w-2xl mx-auto px-6 sm:px-8 py-16 sm:py-24">

        {/* Back */}
        <div className="mb-16 sm:mb-20">
          <Link
            href="/"
            className="text-[0.7rem] font-semibold tracking-[0.18em] text-white/25 hover:text-white/55 transition-colors uppercase"
          >
            ← Retour
          </Link>
        </div>

        {/* ── HERO ── */}
        <header className="mb-24 sm:mb-32">
          <h1 className="mb-6">
            <span className="block text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
              Ce n&apos;est pas une motivation.
            </span>
            <span className="block text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-white/25 mt-1">
              C&apos;est un cadre.
            </span>
          </h1>
          <p className="text-white/30 text-sm sm:text-base tracking-wide">
            BECOME n&apos;est pas une app. C&apos;est un système.
          </p>
        </header>

        {/* ── LE PROBLÈME ── */}
        <section className="mb-20 sm:mb-24">
          <p className="text-[0.6rem] font-semibold tracking-[0.25em] text-white/20 uppercase mb-8">
            Le problème
          </p>
          <div className="space-y-1 text-lg sm:text-xl leading-relaxed">
            <p className="text-white/75">Tu sais quoi faire.</p>
            <p className="text-white/75">Tu ne le fais pas.</p>
            <p className="text-white/40 pt-4">Ce n&apos;est pas un manque de savoir.</p>
            <p className="text-white/40">C&apos;est un manque de cadre.</p>
          </div>
        </section>

        <div className="h-px bg-white/[0.06] mb-20 sm:mb-24" />

        {/* ── LA RÈGLE ── */}
        <section className="mb-20 sm:mb-24">
          <p className="text-[0.6rem] font-semibold tracking-[0.25em] text-white/20 uppercase mb-10">
            La règle
          </p>
          <div className="mb-10 text-center">
            {['Matin.', 'Carnet.', 'Soir.'].map((word) => (
              <p
                key={word}
                className="text-[3.25rem] sm:text-[4.5rem] lg:text-[6rem] font-bold tracking-tight leading-none text-white"
              >
                {word}
              </p>
            ))}
          </div>
          <p className="text-white/35 text-base sm:text-lg text-center">
            Le reste est bonus.
          </p>
        </section>

        <div className="h-px bg-white/[0.06] mb-20 sm:mb-24" />

        {/* ── SIGNATURE + CTA ── */}
        <footer className="pb-16 space-y-10">
          <p className="text-white/50 text-lg sm:text-xl leading-loose">
            Pas de dopamine.<br />
            Pas de blabla.<br />
            Juste l&apos;action.
          </p>
          <Link href={ctaHref} className="inline-block">
            <Button variant="primary" size="lg">
              Commencer
            </Button>
          </Link>
        </footer>

      </div>
    </div>
  );
}

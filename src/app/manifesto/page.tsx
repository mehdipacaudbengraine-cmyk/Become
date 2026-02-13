import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function ManifestoPage() {
  const session = await getServerSession(authOptions);
  const ctaHref = session ? '/dashboard' : '/signup';

  return (
    <div className="min-h-screen bg-black px-4 py-16 sm:py-24">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <div className="mb-14">
          <Link
            href="/"
            className="text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            ← Retour
          </Link>
        </div>

        {/* Header */}
        <header className="mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4">
            Manifeste
          </h1>
          <p className="text-white/50 text-base sm:text-lg leading-relaxed">
            BECOME n'est pas une motivation. C'est un cadre.
          </p>
        </header>

        {/* Sections */}
        <div className="space-y-14">
          <section>
            <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">
              Le problème
            </h2>
            <p className="text-white/75 leading-relaxed text-base sm:text-lg">
              Tu sais quoi faire.
              <br />
              Tu ne le fais pas.
              <br />
              Ce n'est pas un manque de savoir. C'est un manque de cadre.
            </p>
          </section>

          <div className="h-px bg-white/5" />

          <section>
            <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">
              La règle
            </h2>
            <p className="text-white/75 leading-relaxed text-base sm:text-lg">
              Chaque jour est simple :
              <br />
              Matin.
              <br />
              Carnet.
              <br />
              Soir.
              <br />
              Le reste est bonus.
            </p>
          </section>

          <div className="h-px bg-white/5" />

          <section>
            <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">
              La promesse
            </h2>
            <p className="text-white/75 leading-relaxed text-base sm:text-lg">
              On ne te sauve pas.
              <br />
              On te met face à toi-même.
              <br />
              Et on te laisse une marche à suivre.
            </p>
          </section>

          <div className="h-px bg-white/5" />

          <section>
            <h2 className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">
              L'engagement
            </h2>
            <p className="text-white/75 leading-relaxed text-base sm:text-lg">
              Peu de mots.
              <br />
              Peu de bruit.
              <br />
              Des preuves.
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-20 pt-10 border-t border-white/5">
          <Link
            href={ctaHref}
            className="inline-block text-sm text-white/60 hover:text-white border border-white/10 bg-white/[0.03] px-5 py-2.5 rounded-lg transition-colors"
          >
            Entrer dans le cadre →
          </Link>
        </div>
      </div>
    </div>
  );
}

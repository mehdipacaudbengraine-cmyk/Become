import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import t from '@/lib/i18n/t';

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-gray-800 bg-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="text-white text-2xl font-bold tracking-wider">
          {t('landing.logo')}
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm">
          <a href="#features" className="text-white/60 hover:text-white transition-colors duration-200">
            {t('landing.nav.features')}
          </a>
          <a href="#manifesto" className="text-white/60 hover:text-white transition-colors duration-200">
            {t('landing.nav.manifesto')}
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              {t('landing.nav.login')}
            </Button>
          </Link>
          <Link href="/signup">
            <Button variant="primary" size="sm">
              {t('landing.cta')}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

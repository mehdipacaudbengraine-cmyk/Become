import t from '@/lib/i18n/t';

export default function Quote() {
  return (
    <section id="manifesto" className="relative py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Separator */}
        <div className="h-px w-full bg-white/5 mb-10 sm:mb-12" />

        {/* Quote card */}
        <div className="relative max-w-3xl mx-auto">
          {/* Glow effect */}
          <div className="absolute -inset-1 rounded-2xl bg-white/5 blur-2xl opacity-50 pointer-events-none" />
          
          <div className="relative be-card be-glass p-8 sm:p-10 text-center">
            {/* Decorative quote mark */}
            <span className="block text-4xl text-white/20 mb-4 font-serif">"</span>
            
            <blockquote className="text-lg sm:text-xl text-white/80 leading-relaxed whitespace-pre-line">
              {t('quote.text')}
            </blockquote>

            <p className="be-subtitle text-white/50 mt-6">{t('quote.author')}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

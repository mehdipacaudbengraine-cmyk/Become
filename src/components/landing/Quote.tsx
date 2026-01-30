import t from '@/lib/i18n/t';

export default function Quote() {
  return (
    <section id="manifesto" className="py-20 sm:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-light text-gray-100 leading-relaxed mb-8 whitespace-pre-line">
          {t('quote.text')}
        </blockquote>

        <p className="text-gray-500 text-lg">{t('quote.author')}</p>
      </div>
    </section>
  );
}

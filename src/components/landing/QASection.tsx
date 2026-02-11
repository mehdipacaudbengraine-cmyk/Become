export default function QASection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section separator */}
        <div className="h-px w-full bg-white/5 mb-10 sm:mb-12" />

        <div className="space-y-4 sm:space-y-6">
          {/* Card 1 */}
          <div className="be-card be-glass p-6 sm:p-8">
            <h3 className="text-white font-medium text-center mb-2">
              Connais-tu l'importance de la routine ?
            </h3>

            <div className="be-subtitle text-white/60 leading-relaxed text-center space-y-4 text-sm sm:text-base">
              <p>
                Tu ne deviens pas ce que tu veux.
                <br />
                Tu deviens ce que tu répètes.
              </p>

              <p className="mt-6">
                Chaque jour.
                <br />
                Même quand tu n'y penses pas.
                <br />
                Tes habitudes décident quand tu hésites.
                <br />
                Elles agissent quand tu es fatigué.
                <br />
                Sans routine, tu subis.
                <br />
                Avec une routine, tu avances.
              </p>

              <p className="mt-6">
                BECOME t'aide à installer les bonnes habitudes.
                <br />
                Jusqu'à ce qu'elles deviennent automatiques.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="be-card be-glass p-6 sm:p-8">
            <h3 className="text-white font-medium text-center mb-2">
              Quel est le lien entre
              <br />
              habitude et discipline ?
            </h3>

            <div className="be-subtitle text-white/60 leading-relaxed text-center space-y-4 text-sm sm:text-base">
              <p>
                La discipline, c'est décider.
                <br />
                L'habitude, c'est ne plus avoir à décider.
              </p>

              <p className="mt-6">
                Au début, la discipline force l'action.
                <br />
                Avec le temps, l'habitude prend le relais.
                <br />
                Sans habitudes, la discipline fatigue.
                <br />
                Avec des habitudes, elle devient naturelle.
              </p>

              <p className="mt-6">
                La vraie discipline,
                <br />
                c'est de construire des habitudes
                <br />
                qui travaillent à ta place.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

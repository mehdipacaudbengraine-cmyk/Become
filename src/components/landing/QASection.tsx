export default function QASection() {
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Card 1 */}
        <div className="relative border border-gray-700/50 rounded-lg bg-black p-8 sm:p-12 backdrop-blur-sm shadow-lg shadow-black/50 hover:shadow-xl hover:shadow-black/50 transition-shadow duration-300">
          <h3 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8">
            Connais-tu l'importance de la routine ?
          </h3>
          
          <div className="text-center text-gray-400 leading-relaxed space-y-4 text-sm sm:text-base">
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
        <div className="relative border border-gray-700/50 rounded-lg bg-black p-8 sm:p-12 backdrop-blur-sm shadow-lg shadow-black/50 hover:shadow-xl hover:shadow-black/50 transition-shadow duration-300">
          <h3 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8">
            Quel est le lien entre
            <br />
            habitude et discipline ?
          </h3>
          
          <div className="text-center text-gray-400 leading-relaxed space-y-4 text-sm sm:text-base">
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
    </section>
  );
}

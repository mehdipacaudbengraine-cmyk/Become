import { prisma } from "../src/lib/db";


async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await prisma.taskCompletion.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.dailyTask.deleteMany();
  await prisma.programDay.deleteMany();
  await prisma.program.deleteMany();
  await prisma.user.deleteMany();

  // Create programs
  const disciplineReset = await prisma.program.create({
    data: {
      slug: 'discipline-reset',
      name: 'Discipline Reset',
      tagline: 'Build unshakeable discipline in 21 days',
      description:
        'A 21-day program designed to rebuild your discipline from the ground up. Through daily physical and mental challenges, you will develop the consistency needed to take control of your life.',
      durationDays: 21,
      difficulty: 'beginner',
      isActive: true,
    },
  });

  const dopamineDetox = await prisma.program.create({
    data: {
      slug: 'dopamine-detox',
      name: 'Dopamine Detox',
      tagline: 'Reset your brain, reclaim your focus',
      description:
        'A 14-day program to break free from dopamine addiction. Eliminate cheap distractions, reset your reward system, and regain the ability to focus on what truly matters.',
      durationDays: 14,
      difficulty: 'intermediate',
      isActive: true,
    },
  });

  const physicalReset = await prisma.program.create({
    data: {
      slug: 'physical-reset',
      name: 'Physical Reset',
      tagline: 'Build strength, build confidence',
      description:
        'A 30-day physical transformation program. No gym required. Build functional strength, improve mobility, and develop the physical foundation for a high-performance life.',
      durationDays: 30,
      difficulty: 'beginner',
      isActive: true,
    },
  });

  console.log('✅ Programs created');

  // Seed Discipline Reset (21 days)
  for (let day = 1; day <= 21; day++) {
    const programDay = await prisma.programDay.create({
      data: {
        programId: disciplineReset.id,
        dayNumber: day,
        principle: getDisciplinePrinciple(day),
      },
    });

    await prisma.dailyTask.createMany({
      data: getDisciplineTasks(programDay.id, day),
    });
  }

  console.log('✅ Discipline Reset seeded (21 days)');

  // Seed Dopamine Detox (14 days)
  for (let day = 1; day <= 14; day++) {
    const programDay = await prisma.programDay.create({
      data: {
        programId: dopamineDetox.id,
        dayNumber: day,
        principle: getDopaminePrinciple(day),
      },
    });

    await prisma.dailyTask.createMany({
      data: getDopamineTasks(programDay.id, day),
    });
  }

  console.log('✅ Dopamine Detox seeded (14 days)');

  // Seed Physical Reset (30 days)
  for (let day = 1; day <= 30; day++) {
    const programDay = await prisma.programDay.create({
      data: {
        programId: physicalReset.id,
        dayNumber: day,
        principle: getPhysicalPrinciple(day),
      },
    });

    await prisma.dailyTask.createMany({
      data: getPhysicalTasks(programDay.id, day),
    });
  }

  console.log('✅ Physical Reset seeded (30 days)');
  console.log('🎉 Seeding complete!');
}

// Discipline Reset - Principles
function getDisciplinePrinciple(day: number): string {
  const principles = [
    'Choisis ce que tu veux le plus, pas ce que tu veux maintenant.',
    "Tes actions te définissent, pas tes intentions.",
    'Fais ce qui doit être fait, quand il faut, même sans envie.',
    "La motivation lance. La discipline maintient.",
    "Les choix difficiles d'aujourd'hui créent la vie facile de demain.",
    "Il ne faut pas attendre d'être prêt. Commence.",
    'La discipline te libère de ta faiblesse.',
    "Chaque petit acte de discipline construit la personne que tu veux devenir.",
    "Le confort empêche le progrès.",
    "Le corps réalise ce que l'esprit croit.",
    "Tes excuses sont des chaînes.",
    "Le succès est la somme d'efforts répétés.",
    "La douleur est temporaire. Le regret dure.",
    "Tu deviens la personne que tu choisis d'être.",
    "La discipline pèse peu. Le regret pèse lourd.",
    "Tu n'es pas tes émotions. Tu es tes actes.",
    "Des actions simples, répétées, produisent des résultats.",
    "L'obstacle est la voie.",
    "Construis la vie voulue, un jour discipliné à la fois.",
    "Ton futur compte sur toi maintenant.",
    "La discipline relie objectifs et accomplissements.",
  ];
  return principles[day - 1] || principles[0];
}

// Discipline Reset - Tasks
function getDisciplineTasks(programDayId: string, day: number) {
  const weekNumber = Math.ceil(day / 7);
  const pushups = 30 + weekNumber * 10;
  const reading = 10 + weekNumber * 5;

    return [
      {
        programDayId,
        title: `Fais ${pushups} pompes (sans excuses)`,
        category: 'body',
        order: 1,
      },
      {
        programDayId,
        title: 'Fais ton lit dès le réveil',
        category: 'habits',
        order: 2,
      },
      {
        programDayId,
        title: `Lis ${reading} minutes (livre papier)`,
        category: 'focus',
        order: 3,
      },
      {
        programDayId,
        title: 'Douche froide 2 minutes',
        category: 'body',
        order: 4,
      },
      {
        programDayId,
        title: "Note 3 victoires de la journée avant de dormir",
        category: 'mindset',
        order: 5,
      },
    ];
}

// Dopamine Detox - Principles
function getDopaminePrinciple(day: number): string {
  const principles = [
    "Ton attention est ton bien le plus précieux. Protège-la.",
    "L'ennui n'est pas l'ennemi. La distraction oui.",
    "Moins de stimulation = plus de concentration.",
    "La dopamine facile détruit ta capacité à faire l'effort.",
    "Tu n'as pas besoin de divertissement constant. Cherche un but.",
    "Chaque scroll vote contre ton futur.",
    "Le silence apporte la clarté.",
    "La faible stimulation produit haute performance.",
    "Le plaisir immédiat ruine le possible futur.",
    "La gratification différée est une superpuissance.",
    "L'ennui engendre la créativité.",
    "On ne pense pas clairement dans un esprit bruyant.",
    "Choisis le signal plutôt que le bruit.",
    "Ton cerveau n'est pas fait pour du contenu infini. Respecte-le.",
  ];
  return principles[day - 1] || principles[0];
}

// Dopamine Detox - Tasks
function getDopamineTasks(programDayId: string, day: number) {
  return [
    {
      programDayId,
      title: "Aucun réseau social toute la journée",
      category: 'focus',
      order: 1,
    },
    {
      programDayId,
      title: "Pas de YouTube, Netflix ni streaming",
      category: 'focus',
      order: 2,
    },
    {
      programDayId,
      title: 'Reste 10 minutes en silence (sans téléphone, sans musique)',
      category: 'mindset',
      order: 3,
    },
    {
      programDayId,
      title: "Écris 1 page dans un journal sur la journée",
      category: 'mindset',
      order: 4,
    },
    {
      programDayId,
      title: day <= 7 ? 'Marche 20 minutes sans écouteurs' : 'Marche 30 minutes sans écouteurs',
      category: 'body',
      order: 5,
    },
  ];
}

// Physical Reset - Principles
function getPhysicalPrinciple(day: number): string {
  const principles = [
    'Un corps fort forge un esprit fort.',
    "Tu n'as pas besoin d'une salle. Tu as besoin d'engagement.",
    "Chaque répétition renforce le respect de soi.",
    "La force physique rend visible la force mentale.",
    'Entraîne ton corps. Entraîne ta discipline.',
    "La régularité vaut mieux que l'intensité.",
    "Ton corps est la machine que tu possèdes. Entretiens-la.",
    "La sueur est la faiblesse qui s'en va.",
    "Le corps désiré se construit séance après séance.",
    "La force ne se donne pas. Elle se mérite.",
    "Ta santé future dépend de l'effort d'aujourd'hui.",
    'La douleur est temporaire. La fierté perdure.',
    "Entraîne-toi comme si ta vie en dépendait.",
    'Le mouvement est un remède.',
    'Construis le corps qui te portera toute ta vie.',
    "Tu n'es pas fatigué. Tu es sous-entraîné.",
    "La séance que tu regrettes est celle que tu rates.",
    "La force fonctionnelle crée la confiance.",
    "Ton corps s’adapte à la demande.",
    "Chaque entraînement te sépare de l’ancien toi.",
    "Les champions s’entraînent. Les autres se plaignent.",
    'Conquiers ton corps.',
    'La force est un choix quotidien.',
    'Tu es ce que tu fais régulièrement.',
    'Le corps atteint ce que l’esprit croit.',
    'Traine dur. Vis plus léger.',
    'Construis la force. Construis le caractère.',
    'Ton corps est ta responsabilité.',
    'Corps fort. Vie forte.',
    'La ligne d’arrivée n’est qu’un commencement.',
  ];
  return principles[day - 1] || principles[0];
}

// Physical Reset - Tasks
function getPhysicalTasks(programDayId: string, day: number) {
  const week = Math.ceil(day / 7);
  const pushups = 40 + week * 10;
  const squats = 50 + week * 10;
  const plankSeconds = 30 + week * 10;

  return [
    {
      programDayId,
      title: `${pushups} pompes (bonne technique)`,
      category: 'body',
      order: 1,
    },
    {
      programDayId,
      title: `${squats} squats`,
      category: 'body',
      order: 2,
    },
    {
      programDayId,
      title: `Planche ${plankSeconds} secondes`,
      category: 'body',
      order: 3,
    },
    {
      programDayId,
      title: day % 2 === 0 ? '20 burpees' : '30 jumping jacks',
      category: 'body',
      order: 4,
    },
    {
      programDayId,
      title: "Bois 2 litres d'eau aujourd'hui",
      category: 'habits',
      order: 5,
    },
  ];
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from '../src/lib/db';

async function main() {
  const email = 'demo@become.app';
  const slug = 'discipline-reset';

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error('User not found:', email);
    process.exit(1);
  }

  const program = await prisma.program.findUnique({ where: { slug } });
  if (!program) {
    console.error('Program not found:', slug);
    process.exit(1);
  }

  const existing = await prisma.enrollment.findFirst({ where: { userId: user.id, isActive: true } });
  if (existing) {
    console.log('User already enrolled:', existing.id);
    return;
  }

  const enrollment = await prisma.enrollment.create({
    data: {
      userId: user.id,
      programId: program.id,
      currentDay: 1,
      isActive: true,
    },
  });

  console.log('Enrolled user:', email, 'in program', slug, '->', enrollment.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

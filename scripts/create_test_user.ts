import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/db';

async function main() {
  const email = 'demo@become.app';
  const name = 'Demo User';
  const password = 'password123';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('User already exists:', email);
    return;
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashed,
    },
  });

  console.log('Created test user:', email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const guest = await prisma.guest.findFirst({
    where: {
      OR: [
        { nome: { contains: 'cueca', mode: 'insensitive' } },
        { slug: { contains: 'cueca', mode: 'insensitive' } }
      ]
    }
  });

  const settings = await prisma.settings.findUnique({
    where: { id: 'default' }
  });

  console.log('--- GUEST DATA ---');
  console.log(JSON.stringify(guest, null, 2));
  console.log('\n--- SETTINGS DATA ---');
  console.log(JSON.stringify(settings, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

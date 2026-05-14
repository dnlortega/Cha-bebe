
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const allGuests = await prisma.guest.findMany({
    orderBy: { createdAt: 'asc' }
  });

  const withDiaper = allGuests.filter(g => g.fralda_tamanho !== null);
  const withoutDiaper = allGuests.filter(g => g.fralda_tamanho === null);
  
  const cuecaIdx = allGuests.findIndex(g => g.slug === 'cueca');

  console.log(`Total Guests: ${allGuests.length}`);
  console.log(`With Diaper: ${withDiaper.length}`);
  console.log(`Without Diaper: ${withoutDiaper.length}`);
  console.log(`Index of 'CUECA' (0-based): ${cuecaIdx}`);
  
  if (cuecaIdx !== -1) {
    const guestsBeforeCueca = allGuests.slice(0, cuecaIdx);
    const withoutDiaperBeforeCueca = guestsBeforeCueca.filter(g => g.fralda_tamanho === null);
    console.log(`Guests before 'CUECA': ${guestsBeforeCueca.length}`);
    console.log(`Guests without diaper before 'CUECA': ${withoutDiaperBeforeCueca.length}`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany();
  console.log("Current Events:");
  console.log(events);

  const updated = await prisma.event.updateMany({
    data: { ownerEmail: 'dnlortega@gmail.com' }
  });
  console.log(`Updated ${updated.count} events to dnlortega@gmail.com`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });

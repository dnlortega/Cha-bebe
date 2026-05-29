import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting data migration...');

  // 1. Check if the default event exists
  let event = await prisma.event.findUnique({
    where: { id: 'default' }
  });

  if (!event) {
    // We need an owner email for the master admin. We can check the Admin table or use a default.
    const masterAdmin = await prisma.admin.findFirst({
      orderBy: { id: 'asc' }
    });
    const ownerEmail = masterAdmin?.googleEmail || process.env.ALLOWED_GOOGLE_ADMIN_EMAIL || 'admin@example.com';

    event = await prisma.event.create({
      data: {
        id: 'default',
        name: 'Evento Principal',
        slug: 'evento-principal',
        ownerEmail
      }
    });
    console.log('Created default event with owner:', ownerEmail);
  }

  // 2. Update all existing records to use the default eventId
  const guestUpdate = await prisma.guest.updateMany({
    where: { eventId: null },
    data: { eventId: 'default' }
  });
  console.log(`Updated ${guestUpdate.count} guests.`);

  const settingsUpdate = await prisma.settings.updateMany({
    where: { eventId: null },
    data: { eventId: 'default' }
  });
  console.log(`Updated ${settingsUpdate.count} settings.`);

  const giftUpdate = await prisma.gift.updateMany({
    where: { eventId: null },
    data: { eventId: 'default' }
  });
  console.log(`Updated ${giftUpdate.count} gifts.`);

  const guestHistoryUpdate = await prisma.guestHistory.updateMany({
    where: { eventId: null },
    data: { eventId: 'default' }
  });
  console.log(`Updated ${guestHistoryUpdate.count} guest histories.`);

  console.log('Migration completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

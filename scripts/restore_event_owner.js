/**
 * Restaura acesso ao evento principal para dnlortega@gmail.com:
 * - garante ownerEmail no evento "default"
 * - adiciona coluna allowedEmails se o schema Prisma exigir
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const TARGET_EMAIL = 'dnlortega@gmail.com';
const EVENT_ID = 'default';

async function ensureAllowedEmailsColumn() {
  await prisma.$executeRawUnsafe(`
    ALTER TABLE "Event"
    ADD COLUMN IF NOT EXISTS "allowedEmails" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
  `);
}

async function main() {
  await ensureAllowedEmailsColumn();

  const before = await prisma.event.findUnique({
    where: { id: EVENT_ID },
    select: { id: true, name: true, slug: true, ownerEmail: true },
  });

  if (!before) {
    console.error('Evento não encontrado:', EVENT_ID);
    process.exit(1);
  }

  console.log('Antes:', before);

  const updated = await prisma.event.update({
    where: { id: EVENT_ID },
    data: { ownerEmail: TARGET_EMAIL },
    select: { id: true, name: true, slug: true, ownerEmail: true },
  });

  console.log('Depois:', updated);

  const admin = await prisma.admin.findFirst({
    where: { googleEmail: { equals: TARGET_EMAIL, mode: 'insensitive' } },
  });
  console.log('Admin vinculado:', admin ? { id: admin.id, username: admin.username, status: admin.status } : null);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

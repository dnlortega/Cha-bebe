import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const guests = [
    { nome: "Família Silva", slug: "familia-silva" },
    { nome: "João e Maria", slug: "joao-e-maria" },
    { nome: "Tia Ana", slug: "tia-ana" },
  ];

  for (const guest of guests) {
    await prisma.guest.upsert({
      where: { slug: guest.slug },
      update: {},
      create: {
        nome: guest.nome,
        slug: guest.slug,
      },
    });
  }

  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

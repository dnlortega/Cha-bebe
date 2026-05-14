import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

async function testAdd(line: string) {
  try {
    const parts = line.split("|").map(s => s.trim());
    const nome = parts[0];
    const tipo = (parts[1]?.toUpperCase() === "FAMILIA") ? "FAMILIA" : "INDIVIDUAL";
    const membros = parts[2] || null;
    const fralda = parts[3]?.toUpperCase() || null;
    const kitChurrasco = parts[4]?.toUpperCase() === "SIM" || parts[4]?.toUpperCase() === "KIT";
    
    const slug = await generateSlug(nome);
    console.log(`Adding: ${nome}, Slug: ${slug}, Fralda: ${fralda}, Kit: ${kitChurrasco}`);
    
    const result = await prisma.guest.upsert({
      where: { slug },
      update: { tipo, membros, fralda_tamanho: fralda, kit_churrasco: kitChurrasco },
      create: { nome, slug, tipo, membros, fralda_tamanho: fralda, kit_churrasco: kitChurrasco },
    });
    console.log("Upsert success:", result.nome);
  } catch (error) {
    console.error("Upsert failed:", error);
  }
}

async function main() {
  await testAdd("TESTE KIT | INDIVIDUAL | | M | SIM");
  await prisma.$disconnect()
}

main()

import prisma from "../src/lib/prisma";

async function main() {
  const admins = await prisma.admin.findMany();
  console.log("Existing Admins:", admins);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

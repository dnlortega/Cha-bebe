import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.settings.update({
    where: { id: "default" },
    data: {
      systemFont: "Outfit",
      systemFontSize: 14,
      inviteFont: "Cormorant Garamond",
      inviteFontSize: 18
    }
  })
  console.log("Fonts updated to Outfit (14px) and Cormorant Garamond (18px) successfully.")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

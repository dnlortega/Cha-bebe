import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  try {
    const guests = await prisma.guest.findMany({ take: 1 })
    if (guests.length === 0) {
      console.log("No guests found to test")
      return
    }
    const guest = guests[0]
    console.log(`Testing update for guest: ${guest.nome}`)
    const updated = await prisma.guest.update({
      where: { id: guest.id },
      data: {
        kit_churrasco: true
      }
    })
    console.log("Update success:", updated.kit_churrasco)
  } catch (error) {
    console.error("Update failed with error:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()


import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 1. Atualizar o estoque: aumentar GG de 0 para 1
  await prisma.settings.update({
    where: { id: 'default' },
    data: { ggQty: 1 }
  });
  console.log('✅ Estoque atualizado: GG agora tem 1 unidade.');

  // 2. Executar distribuição apenas para quem está sem fralda
  const settings = await prisma.settings.findUnique({ where: { id: 'default' } });
  if (!settings) return;

  const guests = await prisma.guest.findMany({
    where: { fralda_tamanho: null },
    orderBy: { createdAt: 'asc' }
  });

  console.log(`📦 Convidados sem fralda: ${guests.length}`);

  let rnLeft = settings.rnQty;
  let pLeft  = settings.pQty;
  let mLeft  = settings.mQty;
  let gLeft  = settings.gQty;
  let ggLeft = settings.ggQty;

  for (const guest of guests) {
    let size = null;
    if (rnLeft > 0) { size = 'RN'; rnLeft--; }
    else if (pLeft > 0) { size = 'P'; pLeft--; }
    else if (mLeft > 0) { size = 'M'; mLeft--; }
    else if (gLeft > 0) { size = 'G'; gLeft--; }
    else if (ggLeft > 0) { size = 'GG'; ggLeft--; }

    if (size) {
      await prisma.guest.update({
        where: { id: guest.id },
        data: { fralda_tamanho: size }
      });
      console.log(`✅ ${guest.nome} → ${size}`);
    } else {
      console.log(`⚠️  Estoque esgotado para: ${guest.nome}`);
      break;
    }
  }

  console.log('\n✅ Distribuição concluída!');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());

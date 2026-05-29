const fs = require('fs');
const path = require('path');

const actionsPath = path.join(__dirname, '../src/app/actions.ts');
let code = fs.readFileSync(actionsPath, 'utf8');

const helperCode = `
import { cookies } from "next/headers";

export async function getActiveEventId(): Promise<string> {
  const cookieStore = await cookies();
  const eventId = cookieStore.get("activeEventId")?.value;
  return eventId || "default";
}
`;

if (!code.includes('getActiveEventId')) {
  code = code.replace(/import { revalidatePath, [^;]+;/, match => match + '\n' + helperCode);
}

const replacers = [
  {
    find: /export async function getSettings\(\) \{/,
    replace: `export async function getSettings(forceEventId?: string) {\n  const eventId = forceEventId || await getActiveEventId();`
  },
  {
    find: /let settings = await prisma\.settings\.findUnique\(\{\s+where: \{ id: "default" \},\s+\}\);/,
    replace: `let settings = await prisma.settings.findUnique({ where: { eventId } });`
  },
  {
    find: /settings = await prisma\.settings\.create\(\{\s+data: \{ \s+id: "default",/,
    replace: `settings = await prisma.settings.create({ data: { id: eventId, eventId,`
  },
  {
    find: /export async function updateSettings\(data: any\) \{/,
    replace: `export async function updateSettings(data: any) {\n  const eventId = await getActiveEventId();`
  },
  {
    find: /where: \{ id: "default" \},/,
    replace: `where: { eventId },`
  },
  {
    find: /create: \{\s+id: "default",/,
    replace: `create: { id: eventId, eventId,`
  },
  {
    find: /export async function getRecentMessages\(forAdmin = false\) \{/,
    replace: `export async function getRecentMessages(forAdmin = false, forceEventId?: string) {\n  const eventId = forceEventId || await getActiveEventId();`
  },
  {
    find: /where: \{\s+mensagem: \{ not: null \},/,
    replace: `where: { eventId, mensagem: { not: null },`
  },
  {
    find: /export async function getGifts\(\) \{/,
    replace: `export async function getGifts(forceEventId?: string) {\n  const eventId = forceEventId || await getActiveEventId();`
  },
  {
    find: /return prisma\.gift\.findMany\(\{/,
    replace: `return prisma.gift.findMany({\n    where: { eventId },`
  },
  {
    find: /export async function addGift\(name: string, category: string = "Geral"\) \{/,
    replace: `export async function addGift(name: string, category: string = "Geral") {\n  const eventId = await getActiveEventId();`
  },
  {
    find: /await prisma\.gift\.create\(\{ data: \{ name, category \} \}\);/,
    replace: `await prisma.gift.create({ data: { eventId, name, category } });`
  },
  {
    find: /export async function updateRSVP\(slug: string, status: string, membrosConfirmados\?: string, mensagem\?: string, giftId\?: string\) \{/,
    replace: `export async function updateRSVP(slug: string, status: string, membrosConfirmados?: string, mensagem?: string, giftId?: string, forceEventId?: string) {\n  const eventId = forceEventId || await getActiveEventId();`
  },
  {
    find: /const currentGuest = await prisma\.guest\.findUnique\(\{ where: \{ slug \} \}\);/,
    replace: `const currentGuest = await prisma.guest.findUnique({ where: { eventId_slug: { eventId, slug } } });`
  },
  {
    find: /const updatedGuest = await prisma\.guest\.update\(\{\s+where: \{ slug \},/,
    replace: `const updatedGuest = await prisma.guest.update({ where: { eventId_slug: { eventId, slug } },`
  },
  {
    find: /guestId: updatedGuest\.id,/,
    replace: `eventId, guestId: updatedGuest.id,`
  },
  {
    find: /export async function updateGuest\(id: string, nome: string, tipo: string, membros\?: string, qtdAdultos: number = 1, qtdCriancas: number = 0, fralda\?: string, kitChurrasco: boolean = false\) \{/,
    replace: `export async function updateGuest(id: string, nome: string, tipo: string, membros?: string, qtdAdultos: number = 1, qtdCriancas: number = 0, fralda?: string, kitChurrasco: boolean = false) {\n  const eventId = await getActiveEventId();`
  },
  {
    find: /export async function getGuests\(\) \{/,
    replace: `export async function getGuests(forceEventId?: string) {\n  const eventId = forceEventId || await getActiveEventId();`
  },
  {
    find: /const guests = await prisma\.guest\.findMany\(\{/,
    replace: `const guests = await prisma.guest.findMany({\n    where: { eventId },`
  },
  {
    find: /export async function addMultipleGuests\(namesText: string\) \{/,
    replace: `export async function addMultipleGuests(namesText: string) {\n  const eventId = await getActiveEventId();`
  },
  {
    find: /return prisma\.guest\.upsert\(\{\s+where: \{ slug \},\s+update: \{ tipo,/,
    replace: `return prisma.guest.upsert({ where: { eventId_slug: { eventId, slug } }, update: { tipo,`
  },
  {
    find: /create: \{ nome, slug, tipo,/,
    replace: `create: { eventId, nome, slug, tipo,`
  },
  {
    find: /export async function distributeDiapers\(\) \{/,
    replace: `export async function distributeDiapers() {\n  const eventId = await getActiveEventId();`
  },
  {
    find: /const guests = await prisma\.guest\.findMany\(\{ where: \{ fralda_tamanho: null \},/,
    replace: `const guests = await prisma.guest.findMany({ where: { eventId, fralda_tamanho: null },`
  },
  {
    find: /export async function getHistoryLogs\(\) \{/,
    replace: `export async function getHistoryLogs() {\n  const eventId = await getActiveEventId();`
  },
  {
    find: /const logs = await prisma\.guestHistory\.findMany\(\{/,
    replace: `const logs = await prisma.guestHistory.findMany({\n    where: { eventId },`
  }
];

replacers.forEach(r => {
  code = code.replace(r.find, r.replace);
});

fs.writeFileSync(actionsPath, code, 'utf8');
console.log('actions.ts rewritten safely.');

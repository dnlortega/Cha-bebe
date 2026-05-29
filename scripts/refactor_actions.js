const fs = require('fs');
const path = require('path');

const actionsPath = path.join(__dirname, '../src/app/actions.ts');
let code = fs.readFileSync(actionsPath, 'utf8');

// Add getActiveEventId helper
const helperCode = `
import { cookies } from "next/headers";

export async function getActiveEventId(): Promise<string> {
  const cookieStore = cookies();
  const eventId = cookieStore.get("activeEventId")?.value;
  return eventId || "default";
}

`;

if (!code.includes('getActiveEventId')) {
  // insert after imports
  code = code.replace(/import { revalidatePath, [^;]+;/, match => match + '\n' + helperCode);
}

// Now replace all queries to use activeEventId

// getSettings()
code = code.replace(/let settings = await prisma\.settings\.findUnique\(\{\s+where: \{ id: "default" \},\s+\}\);/, 
  `const eventId = await getActiveEventId();
  let settings = await prisma.settings.findUnique({
    where: { eventId },
  });`);

code = code.replace(/settings = await prisma\.settings\.create\(\{\s+data: \{ \s+id: "default",/,
  `settings = await prisma.settings.create({
      data: { 
        id: eventId,
        eventId,`);

// updateSettings
code = code.replace(/export async function updateSettings\(data: any\) \{/, `export async function updateSettings(data: any) {\n  const eventId = await getActiveEventId();`);
code = code.replace(/where: \{ id: "default" \},/, `where: { eventId },`);
code = code.replace(/create: \{ \s+id: "default",/, `create: { \n        id: eventId, eventId,`);

// getRecentMessages
code = code.replace(/export async function getRecentMessages\(forAdmin = false\) \{/, `export async function getRecentMessages(forAdmin = false) {\n  const eventId = await getActiveEventId();`);
code = code.replace(/mensagem: \{ not: null \},/, `eventId,\n      mensagem: { not: null },`);

// getGifts
code = code.replace(/export async function getGifts\(\) \{/, `export async function getGifts() {\n  const eventId = await getActiveEventId();`);
code = code.replace(/return prisma\.gift\.findMany\(\{/, `return prisma.gift.findMany({\n    where: { eventId },`);

// addGift
code = code.replace(/export async function addGift\(name: string, category: string = "Geral"\) \{/, `export async function addGift(name: string, category: string = "Geral") {\n  const eventId = await getActiveEventId();`);
code = code.replace(/await prisma\.gift\.create\(\{ data: \{ name, category \} \}\);/, `await prisma.gift.create({ data: { eventId, name, category } });`);

// updateRSVP - since the slug might not be unique anymore, we need eventId.
code = code.replace(/export async function updateRSVP\(slug: string, status: string, membrosConfirmados\?: string, mensagem\?: string, giftId\?: string\) \{/, `export async function updateRSVP(slug: string, status: string, membrosConfirmados?: string, mensagem?: string, giftId?: string, forceEventId?: string) {\n  const eventId = forceEventId || await getActiveEventId();`);
code = code.replace(/const currentGuest = await prisma\.guest\.findUnique\(\{ where: \{ slug \} \}\);/, `const currentGuest = await prisma.guest.findUnique({ where: { eventId_slug: { eventId, slug } } });`);
code = code.replace(/const updatedGuest = await prisma\.guest\.update\(\{[\s\S]*?where: \{ slug \},/, `const updatedGuest = await prisma.guest.update({
      where: { eventId_slug: { eventId, slug } },`);
code = code.replace(/guestId: updatedGuest\.id,/, `eventId,\n        guestId: updatedGuest.id,`);

// updateGuest
code = code.replace(/export async function updateGuest\(id: string, nome: string, tipo: string, membros\?: string, qtdAdultos: number = 1, qtdCriancas: number = 0, fralda\?: string, kitChurrasco: boolean = false\) \{/, `export async function updateGuest(id: string, nome: string, tipo: string, membros?: string, qtdAdultos: number = 1, qtdCriancas: number = 0, fralda?: string, kitChurrasco: boolean = false) {\n  const eventId = await getActiveEventId();`);

// getGuests
code = code.replace(/export async function getGuests\(\) \{/, `export async function getGuests() {\n  const eventId = await getActiveEventId();`);
code = code.replace(/const guests = await prisma\.guest\.findMany\(\{/, `const guests = await prisma.guest.findMany({\n    where: { eventId },`);

// addMultipleGuests
code = code.replace(/export async function addMultipleGuests\(namesText: string\) \{/, `export async function addMultipleGuests(namesText: string) {\n  const eventId = await getActiveEventId();`);
code = code.replace(/return prisma\.guest\.upsert\(\{[\s\S]*?where: \{ slug \},[\s\S]*?update: \{ tipo,/, `return prisma.guest.upsert({
        where: { eventId_slug: { eventId, slug } },
        update: { tipo,`);
code = code.replace(/create: \{ nome, slug, tipo,/, `create: { eventId, nome, slug, tipo,`);

// distributeDiapers
code = code.replace(/export async function distributeDiapers\(\) \{/, `export async function distributeDiapers() {\n  const eventId = await getActiveEventId();`);
code = code.replace(/where: \{ fralda_tamanho: null \},/, `where: { eventId, fralda_tamanho: null },`);

// getHistoryLogs
code = code.replace(/export async function getHistoryLogs\(\) \{/, `export async function getHistoryLogs() {\n  const eventId = await getActiveEventId();`);
code = code.replace(/const logs = await prisma\.guestHistory\.findMany\(\{/, `const logs = await prisma.guestHistory.findMany({\n    where: { eventId },`);

fs.writeFileSync(actionsPath, code, 'utf8');
console.log('actions.ts refactored.');

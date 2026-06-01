"use server";

import prisma from "@/lib/prisma";
import { generateSlug } from "./actions"; // Or just inline it

// Event management for user
export async function getUserEvents(email: string) {
  const events = await prisma.event.findMany({
    where: {
      OR: [
        { ownerEmail: email },
        {
          sharedWith: {
            some: { email: email }
          }
        }
      ]
    },
    include: {
      settings: true
    }
  });

  return events;
}

const defaultSettingsData = {
  invitationUrl: "/convite.png",
  theme: "GOLD",
  sessionTimeout: 30,
  rnQty: 0,
  pQty: 0,
  mQty: 0,
  gQty: 0,
  ggQty: 0,
  systemFont: "Inter",
  systemFontSize: 14,
  inviteFont: "Playfair Display",
  inviteFontSize: 18,
  showInvitationImage: true,
  babyName: "O Bebê",
  babyGender: "NONE",
} as const;

export async function createDefaultEventForUser(email: string, shareable: boolean = false) {
  const eventName = `Chá de Bebê - ${email.split("@")[0]}`;
  const baseSlug = await import("./actions").then((m) => m.generateSlug(eventName));
  let finalSlug = baseSlug;

  let counter = 1;
  while (await prisma.event.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  const newEvent = await prisma.event.create({
    data: {
      name: eventName,
      slug: finalSlug,
      ownerEmail: email,
      shareable,
    },
  });

  // Settings id must match eventId (one row per event); avoid schema default "default"
  await prisma.settings.create({
    data: {
      id: newEvent.id,
      eventId: newEvent.id,
      ...defaultSettingsData,
    },
  });

  return newEvent;
}

export async function getMuralDataBySlug(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug }
  });
  if (!event) return { messages: [], settings: null };

  const [settings, messages] = await Promise.all([
    import("./actions").then(m => m.getSettings(event.id)),
    import("./actions").then(m => m.getRecentMessages(false, event.id))
  ]);

  return { messages, settings };
}

export async function getActiveEventSlug() {
  const { getActiveEventId } = await import("./actions");
  const eventId = await getActiveEventId();
  if (!eventId) return "evento-principal";
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  });
  return event?.slug || "evento-principal";
}

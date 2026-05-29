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
          shares: {
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

export async function createDefaultEventForUser(email: string) {
  // auto-create event
  const eventName = `Chá de Bebê - ${email.split('@')[0]}`;
  const baseSlug = await import('./actions').then(m => m.generateSlug(eventName));
  let finalSlug = baseSlug;
  
  // ensure unique slug
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
      settings: {
        create: {
          invitationUrl: "/convite.png", 
          theme: "GOLD", 
          sessionTimeout: 30,
          rnQty: 0, pQty: 0, mQty: 0, gQty: 0, ggQty: 0,
          systemFont: "Inter",
          systemFontSize: 14,
          inviteFont: "Playfair Display",
          inviteFontSize: 18,
          showInvitationImage: true,
          babyName: "O Bebê",
          babyGender: "NONE"
        }
      }
    }
  });
  
  return newEvent;
}

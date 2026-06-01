"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setActiveEventCookie(eventId: string) {
  const cookieStore = await cookies();
  cookieStore.set("activeEventId", eventId, { path: "/", maxAge: 60 * 60 * 24 * 30 }); // 30 days
  revalidatePath("/", "layout");
}

export async function clearActiveEventCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("activeEventId");
  revalidatePath("/", "layout");
}

export async function checkActiveEventCookie() {
  const cookieStore = await cookies();
  return !!cookieStore.get("activeEventId");
}

export async function validateActiveEventAccess(email: string) {
  const cookieStore = await cookies();
  const eventId = cookieStore.get("activeEventId")?.value;
  if (!eventId) return false;

  const { PrismaClient } = require("@prisma/client");
  const prisma = new PrismaClient();

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      OR: [
        { ownerEmail: email },
        { sharedWith: { some: { email: email } } }
      ]
    }
  });

  if (!event) {
    cookieStore.delete("activeEventId");
    return false;
  }
  return true;
}

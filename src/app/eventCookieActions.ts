"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { normalizeUserEmail } from "@/lib/eventAccess";

export async function setActiveEventCookie(eventId: string) {
  const cookieStore = await cookies();
  cookieStore.set("activeEventId", eventId, { path: "/", maxAge: 60 * 60 * 24 * 30 });
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

export async function getActiveEventIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("activeEventId")?.value ?? null;
}

export type ActiveEventAccess =
  | { active: false }
  | {
      active: true;
      eventId: string;
      eventName: string;
      isOwner: boolean;
      isCollaborator: boolean;
    };

export async function getActiveEventAccess(
  userEmail: string
): Promise<ActiveEventAccess> {
  const cookieStore = await cookies();
  const eventId = cookieStore.get("activeEventId")?.value;
  if (!eventId || !userEmail) return { active: false };

  const email = normalizeUserEmail(userEmail);

  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      OR: [
        { ownerEmail: { equals: email, mode: "insensitive" } },
        {
          sharedWith: {
            some: { email: { equals: email, mode: "insensitive" } },
          },
        },
      ],
    },
    select: { id: true, name: true, ownerEmail: true },
  });

  if (!event) {
    cookieStore.delete("activeEventId");
    return { active: false };
  }

  const isOwner = normalizeUserEmail(event.ownerEmail) === email;
  return {
    active: true,
    eventId: event.id,
    eventName: event.name,
    isOwner,
    isCollaborator: !isOwner,
  };
}

export async function validateActiveEventAccess(email: string) {
  const access = await getActiveEventAccess(email);
  return access.active;
}

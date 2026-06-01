"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function getOwnedEvent(eventId: string, ownerEmail: string) {
  return prisma.event.findFirst({
    where: {
      id: eventId,
      ownerEmail: { equals: normalizeEmail(ownerEmail), mode: "insensitive" },
    },
  });
}

// Event management for user
export async function getUserEvents(email: string) {
  const normalized = normalizeEmail(email);
  const events = await prisma.event.findMany({
    where: {
      OR: [
        { ownerEmail: normalized },
        {
          sharedWith: {
            some: {
              email: { equals: normalized, mode: "insensitive" },
            },
          },
        },
      ],
    },
    include: {
      settings: {
        select: { babyName: true, eventDate: true },
      },
      sharedWith: {
        select: { id: true, email: true, role: true },
        orderBy: { createdAt: "asc" },
      },
      _count: {
        select: { guests: true, gifts: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return events;
}

export type RegisteredUserForShare = {
  id: string;
  email: string;
  username: string;
  avatarUrl: string | null;
  alreadyShared: boolean;
};

/** Usuários com login Google aprovado, disponíveis para compartilhar evento */
export async function getRegisteredUsersForSharing(
  requesterEmail: string,
  eventId?: string
) {
  const requester = normalizeEmail(requesterEmail);

  const admins = await prisma.admin.findMany({
    where: {
      status: "APPROVED",
      googleEmail: { not: null },
      NOT: {
        googleEmail: { equals: requester, mode: "insensitive" },
      },
    },
    select: {
      id: true,
      username: true,
      googleEmail: true,
      avatarUrl: true,
    },
    orderBy: { googleEmail: "asc" },
  });

  let sharedEmails = new Set<string>();
  if (eventId) {
    const shares = await prisma.eventShare.findMany({
      where: { eventId },
      select: { email: true },
    });
    sharedEmails = new Set(shares.map((s) => normalizeEmail(s.email)));
  }

  const users: RegisteredUserForShare[] = [];
  for (const admin of admins) {
    if (!admin.googleEmail) continue;
    const email = normalizeEmail(admin.googleEmail);
    users.push({
      id: admin.id,
      email,
      username: admin.username,
      avatarUrl: admin.avatarUrl,
      alreadyShared: sharedEmails.has(email),
    });
  }

  return users;
}

export async function shareEventWithRegisteredUser(
  eventId: string,
  adminId: string,
  ownerEmail: string
) {
  const admin = await prisma.admin.findFirst({
    where: {
      id: adminId,
      status: "APPROVED",
      googleEmail: { not: null },
    },
  });

  if (!admin?.googleEmail) {
    return {
      success: false,
      error: "Usuário não encontrado ou ainda não aprovado no sistema.",
    };
  }

  return shareEventWithEmail(eventId, admin.googleEmail, ownerEmail);
}

export async function shareEventWithEmail(
  eventId: string,
  collaboratorEmail: string,
  ownerEmail: string
) {
  const email = normalizeEmail(collaboratorEmail);
  const owner = normalizeEmail(ownerEmail);

  if (!isValidEmail(email)) {
    return { success: false, error: "Informe um e-mail válido." };
  }
  if (email === owner) {
    return { success: false, error: "Você não pode compartilhar o evento com você mesmo." };
  }

  const event = await getOwnedEvent(eventId, owner);
  if (!event) {
    return { success: false, error: "Sem permissão para compartilhar este evento." };
  }

  try {
    await prisma.eventShare.upsert({
      where: { eventId_email: { eventId, email } },
      create: { eventId, email, role: "EDITOR" },
      update: {},
    });
    await prisma.event.update({
      where: { id: eventId },
      data: { shareable: true },
    });
    revalidatePath("/admin/events");
    revalidatePath("/admin", "layout");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Falha ao compartilhar evento." };
  }
}

export async function removeEventShare(
  eventId: string,
  collaboratorEmail: string,
  ownerEmail: string
) {
  const email = normalizeEmail(collaboratorEmail);
  const event = await getOwnedEvent(eventId, ownerEmail);
  if (!event) {
    return { success: false, error: "Sem permissão." };
  }

  try {
    await prisma.eventShare.delete({
      where: { eventId_email: { eventId, email } },
    });
    const remaining = await prisma.eventShare.count({ where: { eventId } });
    if (remaining === 0) {
      await prisma.event.update({
        where: { id: eventId },
        data: { shareable: false },
      });
    }
    revalidatePath("/admin/events");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Falha ao remover compartilhamento." };
  }
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

export type CreateEventOptions = {
  name?: string;
  eventDate?: string;
  eventAddress?: string;
  showInvitationImage?: boolean;
};

export async function createDefaultEventForUser(
  email: string,
  sharedEmails: string[] = [],
  options: CreateEventOptions = {}
) {
  const owner = normalizeEmail(email);
  const eventName = options.name?.trim() || `Chá de Bebê - ${owner.split("@")[0]}`;
  const baseSlug = await import("./actions").then((m) => m.generateSlug(eventName));
  let finalSlug = baseSlug;

  let counter = 1;
  while (await prisma.event.findUnique({ where: { slug: finalSlug } })) {
    finalSlug = `${baseSlug}-${counter}`;
    counter++;
  }

  const collaborators = [
    ...new Set(
      sharedEmails
        .map(normalizeEmail)
        .filter((e) => isValidEmail(e) && e !== owner)
    ),
  ];

  const newEvent = await prisma.event.create({
    data: {
      name: eventName,
      slug: finalSlug,
      ownerEmail: owner,
      shareable: collaborators.length > 0,
      ...(collaborators.length > 0
        ? {
            sharedWith: {
              create: collaborators.map((collaboratorEmail) => ({
                email: collaboratorEmail,
                role: "EDITOR",
              })),
            },
          }
        : {}),
    },
  });

  // Settings id must match eventId (one row per event); avoid schema default "default"
  await prisma.settings.create({
    data: {
      id: newEvent.id,
      eventId: newEvent.id,
      ...defaultSettingsData,
      eventDate: options.eventDate ? new Date(options.eventDate) : undefined,
      eventAddress: options.eventAddress?.trim() || undefined,
      showInvitationImage:
        typeof options.showInvitationImage === "boolean"
          ? options.showInvitationImage
          : defaultSettingsData.showInvitationImage,
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

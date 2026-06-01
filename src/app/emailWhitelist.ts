"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Add an email to the whitelist of the event identified by its slug.
 */
export async function addAllowedEmail(eventSlug: string, email: string) {
  try {
    const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
    if (!event) return { success: false, error: "Evento não encontrado" };
    await prisma.event.update({
      where: { id: event.id },
      data: { allowedEmails: { push: email } },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Falha ao adicionar e‑mail" };
  }
}

/**
 * Remove an email from the whitelist of the event identified by its slug.
 */
export async function removeAllowedEmail(eventSlug: string, email: string) {
  try {
    const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
    if (!event) return { success: false, error: "Evento não encontrado" };
    const filtered = (event.allowedEmails || []).filter(e => e !== email);
    await prisma.event.update({
      where: { id: event.id },
      data: { allowedEmails: filtered },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    console.error(e);
    return { success: false, error: "Falha ao remover e‑mail" };
  }
}

/**
 * Retrieve the whitelist for the event identified by its slug.
 */
export async function getAllowedEmails(eventSlug: string) {
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  return event?.allowedEmails || [];
}

"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function generateSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

export async function getSettings() {
  let settings = await prisma.settings.findUnique({
    where: { id: "default" },
  });

  if (!settings) {
    settings = await prisma.settings.create({
      data: { id: "default", invitationUrl: "/convite.png", theme: "GOLD", sessionTimeout: 30 },
    });
  }

  return settings;
}

export async function updateSettings(invitationUrl: string, theme: string, sessionTimeout: number) {
  try {
    await prisma.settings.upsert({
      where: { id: "default" },
      update: { invitationUrl, theme },
      create: { id: "default", invitationUrl, theme }
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error updating settings:", error);
    return { success: false, error: "FALHA AO ATUALIZAR CONFIGURAÇÕES." };
  }
}

export async function deleteGuest(id: string) {
  try {
    await prisma.guest.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting guest:", error);
    return { success: false, error: "FALHA AO EXCLUIR CONVIDADO." };
  }
}

export async function updateGuest(id: string, nome: string, tipo: string, membros?: string) {
  try {
    const slug = await generateSlug(nome);
    await prisma.guest.update({
      where: { id },
      data: { nome, slug, tipo, membros },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error updating guest:", error);
    return { success: false, error: "FALHA AO ATUALIZAR CONVIDADO." };
  }
}

export async function addMultipleGuests(namesText: string) {
  try {
    const lines = namesText.split("\n").map(n => n.trim()).filter(n => n.length > 0);
    
    const results = await Promise.all(
      lines.map(async (line) => {
        const parts = line.split("|").map(s => s.trim());
        const nome = parts[0];
        const tipo = (parts[1]?.toUpperCase() === "FAMILIA") ? "FAMILIA" : "INDIVIDUAL";
        const membros = parts[2] || null; // Nomes separados por vírgula
        
        const slug = await generateSlug(nome);
        
        return prisma.guest.upsert({
          where: { slug },
          update: { tipo, membros },
          create: { nome, slug, tipo, membros },
        });
      })
    );

    revalidatePath("/admin");
    return { success: true, count: results.length };
  } catch (error) {
    console.error("Error adding guests:", error);
    return { success: false, error: "FALHA AO CADASTRAR CONVIDADOS." };
  }
}

export async function updateRSVP(slug: string, status: string, membrosConfirmados?: string) {
  try {
    // Calcular qtd baseada nos membros confirmados se for familia
    const count = membrosConfirmados ? membrosConfirmados.split(",").filter(n => n.trim().length > 0).length : (status === "CONFIRMED" ? 1 : 0);

    await prisma.guest.update({
      where: { slug },
      data: {
        status_confirmacao: status,
        membros_confirmados: membrosConfirmados || null,
        qtd_adultos: count, // Para estatísticas simples
        data_resposta: new Date(),
      },
    });
    revalidatePath("/admin");
    revalidatePath(`/${slug}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating RSVP:", error);
    return { success: false, error: "FALHA AO ATUALIZAR CONFIRMAÇÃO." };
  }
}

export async function getGuests() {
  try {
    const guests = await prisma.guest.findMany({
      orderBy: { nome: "asc" },
    });
    return guests;
  } catch (error) {
    console.error("Error fetching guests:", error);
    return [];
  }
}

export async function verifyAdmin(username: string, password: string) {
  const envUser = process.env.ADMIN_USERNAME;
  const envPass = process.env.ADMIN_PASSWORD;
  
  if (!envUser || !envPass) return false;
  
  return username === envUser && password === envPass;
}

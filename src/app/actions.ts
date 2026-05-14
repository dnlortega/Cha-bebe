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
      data: { 
        id: "default", 
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
        inviteFontSize: 18
      },
    });
  }

  return settings;
}

export async function updateSettings(
  invitationUrl: string, 
  theme: string, 
  sessionTimeout: number,
  rnQty: number = 0,
  pQty: number = 0,
  mQty: number = 0,
  gQty: number = 0,
  ggQty: number = 0,
  systemFont: string = "Inter",
  systemFontSize: number = 14,
  inviteFont: string = "Playfair Display",
  inviteFontSize: number = 18
) {
  try {
    await prisma.settings.upsert({
      where: { id: "default" },
      update: { invitationUrl, theme, sessionTimeout, rnQty, pQty, mQty, gQty, ggQty, systemFont, systemFontSize, inviteFont, inviteFontSize },
      create: { id: "default", invitationUrl, theme, sessionTimeout, rnQty, pQty, mQty, gQty, ggQty, systemFont, systemFontSize, inviteFont, inviteFontSize }
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

export async function updateGuest(
  id: string, 
  nome: string, 
  tipo: string, 
  membros?: string, 
  qtdAdultos: number = 1, 
  qtdCriancas: number = 0,
  fralda?: string,
  kitChurrasco: boolean = false
) {
  try {
    const slug = await generateSlug(nome);
    await prisma.guest.update({
      where: { id },
      data: { 
        nome, 
        slug, 
        tipo, 
        membros,
        qtd_adultos: qtdAdultos,
        qtd_criancas: qtdCriancas,
        fralda_tamanho: fralda,
        kit_churrasco: kitChurrasco
      },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating guest:", error);
    return { 
      success: false, 
      error: `ERRO: ${error.message || "FALHA AO ATUALIZAR"}` 
    };
  }
}

export async function distributeDiapers() {
  try {
    const settings = await getSettings();
    // Pegar apenas convidados que ainda não têm fralda definida
    const guests = await prisma.guest.findMany({ 
      where: { fralda_tamanho: null },
      orderBy: { createdAt: "asc" } 
    });
    
    let rnLeft = settings.rnQty;
    let pLeft = settings.pQty;
    let mLeft = settings.mQty;
    let gLeft = settings.gQty;
    let ggLeft = settings.ggQty;

    // Se não houver estoque definido, avisar
    if (rnLeft + pLeft + mLeft + gLeft + ggLeft === 0) {
      return { success: false, error: "ESTOQUE ZERADO. DEFINA AS QUANTIDADES E SALVE ANTES." };
    }

    for (const guest of guests) {
      let size = null;
      if (rnLeft > 0) { size = "RN"; rnLeft--; }
      else if (pLeft > 0) { size = "P"; pLeft--; }
      else if (mLeft > 0) { size = "M"; mLeft--; }
      else if (gLeft > 0) { size = "G"; gLeft--; }
      else if (ggLeft > 0) { size = "GG"; ggLeft--; }

      // Só atualiza se encontrou um tamanho disponível
      if (size) {
        await prisma.guest.update({
          where: { id: guest.id },
          data: { fralda_tamanho: size }
        });
      } else {
        // Se acabaram as fraldas no estoque, podemos parar o loop
        break;
      }
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error distributing diapers:", error);
    return { success: false, error: "Erro ao distribuir fraldas" };
  }
}

export async function addMultipleGuests(namesText: string) {
  try {
    const lines = namesText.split("\n").map(n => n.trim()).filter(n => n.length > 0);
    
    const results = await Promise.all(
      lines.map(async (line) => {
        const parts = line.split("|").map(s => s.trim());
        const nome = parts[0];
        const tipoRaw = (parts[1] || "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const tipo = tipoRaw === "FAMILIA" ? "FAMILIA" : "INDIVIDUAL";
        const membros = parts[2] || null;
        const fralda = parts[3]?.toUpperCase() || null;
        const kitChurrasco = parts[4]?.toUpperCase() === "SIM" || parts[4]?.toUpperCase() === "KIT";
        
        const slug = await generateSlug(nome);
        
        return prisma.guest.upsert({
          where: { slug },
          update: { tipo, membros, fralda_tamanho: fralda, kit_churrasco: kitChurrasco },
          create: { nome, slug, tipo, membros, fralda_tamanho: fralda, kit_churrasco: kitChurrasco },
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

export async function ensureAdminExists() {
  const count = await prisma.admin.count();
  if (count === 0) {
    await prisma.admin.create({
      data: {
        username: "admin",
        password: "admin123",
      },
    });
  }
}

export async function verifyAdmin(username: string, password: string) {
  try {
    await ensureAdminExists(); // Make sure there's at least one admin
    
    const admin = await prisma.admin.findUnique({
      where: { username },
    });
    
    if (!admin) {
      console.log(`Login attempt failed: User ${username} not found in database.`);
      return false;
    }

    const isCorrect = admin.password === password;
    if (!isCorrect) {
      console.log(`Login attempt failed: Incorrect password for user ${username}.`);
    }
    
    return isCorrect;
  } catch (error) {
    console.error("Critical error during admin verification:", error);
    return false;
  }
}

export async function updateAdminCredentials(currentUsername: string, newUsername: string, newPass: string) {
  try {
    const admin = await prisma.admin.findUnique({ where: { username: currentUsername } });
    if (!admin) return { success: false, error: "Admin não encontrado" };

    await prisma.admin.update({
      where: { username: currentUsername },
      data: { username: newUsername, password: newPass }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao atualizar credenciais" };
  }
}

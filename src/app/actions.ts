"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

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
  noStore();
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
        rnQty: 0, pQty: 0, mQty: 0, gQty: 0, ggQty: 0,
        systemFont: "Inter",
        systemFontSize: 14,
        inviteFont: "Playfair Display",
        inviteFontSize: 18,
        showInvitationImage: true,
        babyName: "O Bebê",
        babyGender: "NONE"
      },
    });
  }

  // Retorna um objeto 100% serializável, convertendo o Date do banco em string ISO
  return {
    ...settings,
    eventDate: settings.eventDate ? settings.eventDate.toISOString() : null
  };
}

export async function updateSettings(data: any) {
  try {
    await prisma.settings.upsert({
      where: { id: "default" },
      update: { 
        ...data,
        eventDate: data.eventDate ? new Date(data.eventDate) : null 
      },
      create: { 
        id: "default", 
        ...data,
        eventDate: data.eventDate ? new Date(data.eventDate) : null
      }
    });
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error) {
    console.error("Error updating settings:", error);
    return { success: false, error: "FALHA AO ATUALIZAR CONFIGURAÇÕES." };
  }
}

// Guestbook / Mural Actions
export async function getRecentMessages() {
  noStore();
  const messages = await prisma.guest.findMany({
    where: { mensagem: { not: null }, status_confirmacao: "CONFIRMED" },
    select: { nome: true, mensagem: true, data_resposta: true },
    orderBy: { data_resposta: "desc" },
    take: 60
  });

  // Retorna mensagens com data_resposta serializada como string ISO para o cliente
  return messages.map(m => ({
    ...m,
    data_resposta: m.data_resposta ? m.data_resposta.toISOString() : null
  }));
}

// Gift Actions
export async function getGifts() {
  noStore();
  return prisma.gift.findMany({
    orderBy: { name: "asc" }
  });
}

export async function addGift(name: string, category: string = "Geral") {
  try {
    await prisma.gift.create({ data: { name, category } });
    revalidatePath("/admin/gifts");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao adicionar presente" };
  }
}

export async function deleteGift(id: string) {
  try {
    await prisma.gift.delete({ where: { id } });
    revalidatePath("/admin/gifts");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao excluir presente" };
  }
}

export async function updateRSVP(slug: string, status: string, membrosConfirmados?: string, mensagem?: string, giftId?: string) {
  try {
    const count = membrosConfirmados ? membrosConfirmados.split(",").filter(n => n.trim().length > 0).length : (status === "CONFIRMED" ? 1 : 0);

    // Se a confirmação foi recusada ou desfeita, libera o presente anterior do convidado se houver
    if (status !== "CONFIRMED") {
      const currentGuest = await prisma.guest.findUnique({ where: { slug } });
      if (currentGuest?.giftId) {
        await prisma.gift.update({
          where: { id: currentGuest.giftId },
          data: { isReserved: false }
        });
      }
    }

    // Se escolheu um presente novo, marca como reservado
    if (giftId && status === "CONFIRMED") {
      await prisma.gift.update({
        where: { id: giftId },
        data: { isReserved: true }
      });
    }

    const updatedGuest = await prisma.guest.update({
      where: { slug },
      include: { gift: true },
      data: {
        status_confirmacao: status,
        membros_confirmados: membrosConfirmados || null,
        qtd_adultos: count,
        data_resposta: new Date(),
        mensagem: mensagem || null,
        giftId: status === "CONFIRMED" ? (giftId || null) : null
      },
    });

    // Registra o log histórico da resposta
    await prisma.guestHistory.create({
      data: {
        guestId: updatedGuest.id,
        guestNome: updatedGuest.nome,
        status_confirmacao: updatedGuest.status_confirmacao,
        data_resposta: new Date(),
        qtd_adultos: updatedGuest.qtd_adultos,
        qtd_criancas: updatedGuest.qtd_criancas,
        fralda_tamanho: updatedGuest.fralda_tamanho,
        kit_churrasco: updatedGuest.kit_churrasco,
        mensagem: updatedGuest.mensagem,
        giftName: updatedGuest.gift?.name || null
      }
    });
    
    revalidatePath("/admin");
    revalidatePath("/admin/history");
    revalidatePath(`/${slug}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating RSVP:", error);
    return { success: false, error: "FALHA AO ATUALIZAR CONFIRMAÇÃO." };
  }
}

// Restantes das funções mantidas e adaptadas...
export async function deleteGuest(id: string) {
  try {
    const guest = await prisma.guest.findUnique({ where: { id } });
    if (guest?.giftId) {
      await prisma.gift.update({
        where: { id: guest.giftId },
        data: { isReserved: false }
      });
    }
    await prisma.guest.delete({ where: { id } });
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: "FALHA AO EXCLUIR CONVIDADO." };
  }
}

export async function deleteAllGuests() {
  try {
    await prisma.$transaction([
      prisma.guest.deleteMany(),
      prisma.gift.updateMany({
        data: { isReserved: false }
      })
    ]);
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Error deleting all guests:", error);
    return { success: false, error: "FALHA AO EXCLUIR TODOS OS CONVIDADOS." };
  }
}

export async function updateGuest(id: string, nome: string, tipo: string, membros?: string, qtdAdultos: number = 1, qtdCriancas: number = 0, fralda?: string, kitChurrasco: boolean = false) {
  try {
    const slug = await generateSlug(nome);
    await prisma.guest.update({
      where: { id },
      data: { 
        nome, slug, tipo, membros,
        qtd_adultos: qtdAdultos,
        qtd_criancas: qtdCriancas,
        fralda_tamanho: fralda,
        kit_churrasco: kitChurrasco
      },
    });
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: `ERRO: ${error.message}` };
  }
}

export async function getGuests() {
  noStore();
  const guests = await prisma.guest.findMany({
    include: { gift: true },
    orderBy: { nome: "asc" },
  });

  return guests.map(g => ({
    ...g,
    data_resposta: g.data_resposta ? g.data_resposta.toISOString() : null,
    createdAt: g.createdAt.toISOString(),
    updatedAt: g.updatedAt.toISOString(),
    gift: g.gift ? {
      ...g.gift,
      createdAt: g.gift.createdAt.toISOString()
    } : null
  }));
}

export async function addMultipleGuests(namesText: string) {
  try {
    const lines = namesText.split("\n").map(n => n.trim()).filter(n => n.length > 0);
    const results = await Promise.all(lines.map(async (line) => {
      const parts = line.split("|").map(s => s.trim());
      const nome = parts[0];
      const tipo = (parts[1] || "").toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") === "FAMILIA" ? "FAMILIA" : "INDIVIDUAL";
      const membros = parts[2] || null;
      const fralda = parts[3]?.toUpperCase() || null;
      const kitChurrasco = parts[4]?.toUpperCase() === "SIM" || parts[4]?.toUpperCase() === "KIT";
      const slug = await generateSlug(nome);
      return prisma.guest.upsert({
        where: { slug },
        update: { tipo, membros, fralda_tamanho: fralda, kit_churrasco: kitChurrasco },
        create: { nome, slug, tipo, membros, fralda_tamanho: fralda, kit_churrasco: kitChurrasco },
      });
    }));
    revalidatePath("/admin");
    return { success: true, count: results.length };
  } catch (error) {
    return { success: false, error: "FALHA AO CADASTRAR CONVIDADOS." };
  }
}

export async function verifyAdmin(username: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { username } });
  return admin?.password === password;
}

export async function updateAdminCredentials(currentUsername: string, newUsername: string, newPass: string) {
  try {
    await prisma.admin.update({
      where: { username: currentUsername },
      data: { username: newUsername, password: newPass }
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao atualizar credenciais" };
  }
}

export async function distributeDiapers() {
  try {
    const settings = await getSettings();
    const guests = await prisma.guest.findMany({ where: { fralda_tamanho: null }, orderBy: { createdAt: "asc" } });
    let stocks = { RN: settings.rnQty, P: settings.pQty, M: settings.mQty, G: settings.gQty, GG: settings.ggQty };
    if (Object.values(stocks).reduce((a, b) => a + b, 0) === 0) return { success: false, error: "ESTOQUE ZERADO." };

    for (const guest of guests) {
      let size = (stocks.RN-- > 0) ? "RN" : (stocks.P-- > 0) ? "P" : (stocks.M-- > 0) ? "M" : (stocks.G-- > 0) ? "G" : (stocks.GG-- > 0) ? "GG" : null;
      if (size) await prisma.guest.update({ where: { id: guest.id }, data: { fralda_tamanho: size } });
      else break;
    }
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Erro ao distribuir fraldas" };
  }
}

export async function getHistoryLogs() {
  noStore();
  const logs = await prisma.guestHistory.findMany({
    orderBy: { data_resposta: "desc" }
  });
  return logs.map(l => ({
    ...l,
    data_resposta: l.data_resposta.toISOString()
  }));
}

export async function registerAdminSession(token: string, deviceInfo: string, deviceName: string, location: string, gpsCoords: string | null) {
  try {
    // Remove qualquer sessao antiga duplicada com o mesmo deviceInfo
    await prisma.adminSession.deleteMany({
      where: { deviceInfo }
    });

    await prisma.adminSession.create({
      data: { token, deviceInfo, deviceName, location, gpsCoords }
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao registrar sessao:", error);
    return { success: false };
  }
}

export async function verifyAdminSession(token: string) {
  try {
    const session = await prisma.adminSession.findUnique({
      where: { token }
    });
    if (!session) return false;

    // Atualiza o lastActive da sessao
    await prisma.adminSession.update({
      where: { token },
      data: { lastActive: new Date() }
    });
    return true;
  } catch (error) {
    console.error("Erro ao verificar sessao:", error);
    return false;
  }
}

export async function getAdminSessions() {
  noStore();
  try {
    const sessions = await prisma.adminSession.findMany({
      orderBy: { lastActive: "desc" }
    });
    return sessions.map(s => ({
      ...s,
      lastActive: s.lastActive.toISOString(),
      createdAt: s.createdAt.toISOString()
    }));
  } catch (error) {
    console.error("Erro ao carregar sessoes:", error);
    return [];
  }
}

export async function revokeAdminSession(id: string) {
  try {
    await prisma.adminSession.delete({
      where: { id }
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao revogar sessao:", error);
    return { success: false };
  }
}

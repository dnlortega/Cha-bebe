"use server";

import prisma from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

import { cookies } from "next/headers";

export async function getActiveEventId(): Promise<string> {
  const cookieStore = await cookies();
  const eventId = cookieStore.get("activeEventId")?.value;
  return eventId || "default";
}


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

export async function getSettings(forceEventId?: string) {
  const eventId = forceEventId || await getActiveEventId();
  noStore();
  let settings = await prisma.settings.findUnique({ where: { eventId } });

  if (!settings) {
    settings = await prisma.settings.create({ data: { id: eventId, eventId, 
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
  const eventId = await getActiveEventId();
  try {
    await prisma.settings.upsert({
      where: { eventId },
      update: { 
        ...data,
        eventDate: data.eventDate ? new Date(data.eventDate) : null 
      },
      create: { id: eventId, eventId, 
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
export async function getRecentMessages(forAdmin = false, forceEventId?: string) {
  const eventId = forceEventId || await getActiveEventId();
  noStore();
  const messages = await prisma.guest.findMany({
    where: { eventId, mensagem: { not: null }, 
      status_confirmacao: "CONFIRMED",
      ...(forAdmin ? {} : { exibir_mensagem: true })
    },
    select: { id: true, nome: true, mensagem: true, data_resposta: true, exibir_mensagem: true },
    orderBy: { data_resposta: "desc" },
    take: 60
  });

  // Retorna mensagens com data_resposta serializada como string ISO para o cliente
  return messages.map(m => ({
    ...m,
    data_resposta: m.data_resposta ? m.data_resposta.toISOString() : null
  }));
}

export async function toggleMessageVisibility(id: string, exibir_mensagem: boolean) {
  try {
    await prisma.guest.update({
      where: { id },
      data: { exibir_mensagem }
    });
    revalidatePath("/admin");
    revalidatePath("/mural");
    return { success: true };
  } catch (error) {
    console.error("Error toggling message visibility:", error);
    return { success: false, error: "Falha ao alterar a exibição da mensagem." };
  }
}

// Gift Actions
export async function getGifts(forceEventId?: string) {
  const eventId = forceEventId || await getActiveEventId();
  noStore();
  return prisma.gift.findMany({
    where: { eventId },
    orderBy: { name: "asc" }
  });
}

export async function addGift(name: string, category: string = "Geral") {
  const eventId = await getActiveEventId();
  try {
    await prisma.gift.create({ data: { eventId, name, category } });
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

export async function updateRSVP(slug: string, status: string, membrosConfirmados?: string, mensagem?: string, giftId?: string, forceEventId?: string) {
  const eventId = forceEventId || await getActiveEventId();
  try {
    const count = membrosConfirmados ? membrosConfirmados.split(",").filter(n => n.trim().length > 0).length : (status === "CONFIRMED" ? 1 : 0);

    // Se a confirmação foi recusada ou desfeita, libera o presente anterior do convidado se houver
    if (status !== "CONFIRMED") {
      const currentGuest = await prisma.guest.findUnique({ where: { eventId_slug: { eventId, slug } } });
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

    const updatedGuest = await prisma.guest.update({ where: { eventId_slug: { eventId, slug } },
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
        eventId, guestId: updatedGuest.id,
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
  const eventId = await getActiveEventId();
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

export async function getGuests(forceEventId?: string) {
  const eventId = forceEventId || await getActiveEventId();
  noStore();
  const guests = await prisma.guest.findMany({
    where: { eventId },
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
  const eventId = await getActiveEventId();
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
      return prisma.guest.upsert({ where: { eventId_slug: { eventId, slug } }, update: { tipo, membros, fralda_tamanho: fralda, kit_churrasco: kitChurrasco },
        create: { eventId, nome, slug, tipo, membros, fralda_tamanho: fralda, kit_churrasco: kitChurrasco },
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

export async function getAdminCredentials() {
  noStore();
  try {
    const admin = await prisma.admin.findFirst();
    return admin ? { username: admin.username, googleEmail: admin.googleEmail || "" } : null;
  } catch (error) {
    console.error("Erro ao carregar credenciais do admin:", error);
    return null;
  }
}

export async function updateAdminCredentials(currentUsername: string, newUsername: string, newPass: string, googleEmail?: string) {
  try {
    const admin = await prisma.admin.findFirst();
    if (!admin) {
      return { success: false, error: "Nenhum administrador encontrado." };
    }

    const updateData: any = {};
    if (newUsername) updateData.username = newUsername;
    if (newPass) updateData.password = newPass;
    if (googleEmail !== undefined) updateData.googleEmail = googleEmail || null;

    await prisma.admin.update({
      where: { id: admin.id },
      data: updateData
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar credenciais:", error);
    return { success: false, error: "Erro ao atualizar credenciais." };
  }
}

export async function updateGoogleSessionDetails(token: string, deviceInfo: string, deviceName: string, location: string, gpsCoords: string | null, diagnostics: string) {
  try {
    // 1. Update the actual active session
    await prisma.adminSession.update({
      where: { token },
      data: { deviceInfo, deviceName, location, gpsCoords, diagnostics }
    });

    // 2. Locate and update the temporary session history log generated by Google login callback
    const lastLog = await prisma.sessionHistoryLog.findFirst({
      where: {
        action: "INICIADA",
        deviceName: "Google Sign-In | Autenticando..."
      },
      orderBy: {
        timestamp: "desc"
      }
    });

    if (lastLog) {
      await prisma.sessionHistoryLog.update({
        where: { id: lastLog.id },
        data: { deviceName, deviceInfo, location }
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao enriquecer detalhes da sessão Google:", error);
    return { success: false };
  }
}

export async function distributeDiapers() {
  const eventId = await getActiveEventId();
  try {
    const settings = await getSettings();
    const guests = await prisma.guest.findMany({ where: { eventId, fralda_tamanho: null }, orderBy: { createdAt: "asc" } });
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
  const eventId = await getActiveEventId();
  noStore();
  const logs = await prisma.guestHistory.findMany({
    where: { eventId },
    orderBy: { data_resposta: "desc" }
  });
  return logs.map(l => ({
    ...l,
    data_resposta: l.data_resposta.toISOString()
  }));
}

export async function registerAdminSession(token: string, deviceInfo: string, deviceName: string, location: string, gpsCoords: string | null, diagnostics: string, adminEmail?: string) {
  try {
    // Remove qualquer sessao antiga duplicada com o mesmo deviceInfo E deviceName juntas
    const duplicateSessions = await prisma.adminSession.findMany({
      where: { deviceInfo, deviceName }
    });

    for (const dup of duplicateSessions) {
      await prisma.sessionHistoryLog.create({
        data: {
          deviceName: dup.deviceName,
          deviceInfo: dup.deviceInfo,
          location: dup.location,
          action: "FINALIZADA"
        }
      });
    }

    await prisma.adminSession.deleteMany({
      where: { 
        deviceInfo,
        deviceName
      }
    });

    await prisma.adminSession.create({
      data: { token, deviceInfo, deviceName, location, gpsCoords, diagnostics, adminEmail }
    });

    // Registra o início da nova sessão no histórico de auditoria
    await prisma.sessionHistoryLog.create({
      data: {
        deviceName,
        deviceInfo,
        location,
        action: "INICIADA"
      }
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

    // Se a sessão tiver um email associado, verifica se o admin correspondente ainda está APPROVED
    if (session.adminEmail) {
      const masterEmail = process.env.ALLOWED_GOOGLE_ADMIN_EMAIL || "dnlortega@gmail.com";
      const isMaster = session.adminEmail.toLowerCase() === masterEmail.toLowerCase();
      
      const admin = await prisma.admin.findUnique({
        where: { googleEmail: session.adminEmail }
      });
      
      // dnlortega@gmail.com é sempre aprovado. Outros precisam existir e estar APPROVED
      if (!isMaster && (!admin || admin.status !== "APPROVED")) {
        // Exclui a sessão inválida
        await prisma.adminSession.delete({
          where: { token }
        });
        return false;
      }
    }

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
    const session = await prisma.adminSession.findUnique({
      where: { id }
    });
    if (session) {
      // Registra a finalização da sessão
      await prisma.sessionHistoryLog.create({
        data: {
          deviceName: session.deviceName,
          deviceInfo: session.deviceInfo,
          location: session.location,
          action: "FINALIZADA"
        }
      });
    }

    await prisma.adminSession.delete({
      where: { id }
    });
    return { success: true };
  } catch (error) {
    console.error("Erro ao revogar sessao:", error);
    return { success: false };
  }
}

export async function getSessionHistoryLogs() {
  noStore();
  try {
    const logs = await prisma.sessionHistoryLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 50
    });
    return logs.map(l => ({
      ...l,
      timestamp: l.timestamp.toISOString()
    }));
  } catch (error) {
    console.error("Erro ao carregar historico de sessoes:", error);
    return [];
  }
}

export async function getAdminAccounts(sessionToken: string) {
  noStore();
  try {
    const masterEmail = process.env.ALLOWED_GOOGLE_ADMIN_EMAIL || "dnlortega@gmail.com";
    const session = await prisma.adminSession.findUnique({
      where: { token: sessionToken }
    });
    if (!session || session.adminEmail?.toLowerCase() !== masterEmail.toLowerCase()) {
      return { success: false, error: "Não autorizado. Apenas o administrador principal pode gerenciar acessos." };
    }

    const admins = await prisma.admin.findMany({
      orderBy: { googleEmail: "asc" }
    });

    return { 
      success: true, 
      admins: admins.map(a => ({
        id: a.id,
        username: a.username,
        googleEmail: a.googleEmail || "",
        status: a.status,
        allowedScreens: a.allowedScreens,
        avatarUrl: a.avatarUrl
      }))
    };
  } catch (error) {
    console.error("Erro ao carregar contas de administrador:", error);
    return { success: false, error: "Erro ao buscar contas de administrador." };
  }
}

export async function updateAdminAccountStatus(sessionToken: string, adminId: string, status: string) {
  try {
    const masterEmail = process.env.ALLOWED_GOOGLE_ADMIN_EMAIL || "dnlortega@gmail.com";
    const session = await prisma.adminSession.findUnique({
      where: { token: sessionToken }
    });
    if (!session || session.adminEmail?.toLowerCase() !== masterEmail.toLowerCase()) {
      return { success: false, error: "Não autorizado." };
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      return { success: false, error: "Administrador não encontrado." };
    }

    if (admin.googleEmail?.toLowerCase() === masterEmail.toLowerCase()) {
      return { success: false, error: "Não é possível alterar o status do administrador principal." };
    }

    await prisma.admin.update({
      where: { id: adminId },
      data: { status }
    });

    // Se o status for alterado para BLOCKED ou PENDING, deleta todas as sessões ativas desse usuário para deslogá-lo
    if (status !== "APPROVED" && admin.googleEmail) {
      await prisma.adminSession.deleteMany({
        where: { adminEmail: admin.googleEmail }
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar status do administrador:", error);
    return { success: false, error: "Erro ao atualizar status." };
  }
}

export async function deleteAdminAccount(sessionToken: string, adminId: string) {
  try {
    const masterEmail = process.env.ALLOWED_GOOGLE_ADMIN_EMAIL || "dnlortega@gmail.com";
    const session = await prisma.adminSession.findUnique({
      where: { token: sessionToken }
    });
    if (!session || session.adminEmail?.toLowerCase() !== masterEmail.toLowerCase()) {
      return { success: false, error: "Não autorizado." };
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      return { success: false, error: "Administrador não encontrado." };
    }

    if (admin.googleEmail?.toLowerCase() === masterEmail.toLowerCase()) {
      return { success: false, error: "Não é possível excluir o administrador principal." };
    }

    if (admin.googleEmail) {
      await prisma.adminSession.deleteMany({
        where: { adminEmail: admin.googleEmail }
      });
    }

    await prisma.admin.delete({
      where: { id: adminId }
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir administrador:", error);
    return { success: false, error: "Erro ao excluir administrador." };
  }
}

export async function isMasterAdmin(sessionToken: string) {
  noStore();
  try {
    const masterEmail = process.env.ALLOWED_GOOGLE_ADMIN_EMAIL || "dnlortega@gmail.com";
    const session = await prisma.adminSession.findUnique({
      where: { token: sessionToken }
    });
    return session?.adminEmail?.toLowerCase() === masterEmail.toLowerCase();
  } catch (e) {
    return false;
  }
}

export async function getAdminSessionDetails(token: string) {
  noStore();
  try {
    const session = await prisma.adminSession.findUnique({
      where: { token }
    });
    if (!session) return { success: false };

    const masterEmail = process.env.ALLOWED_GOOGLE_ADMIN_EMAIL || "dnlortega@gmail.com";
    const isMaster = session.adminEmail?.toLowerCase() === masterEmail.toLowerCase();

    if (session.adminEmail) {
      const admin = await prisma.admin.findUnique({
        where: { googleEmail: session.adminEmail }
      });
      if (isMaster) {
        return {
          success: true,
          email: session.adminEmail,
          isMaster: true,
          allowedScreens: "ALL",
          avatarUrl: admin?.avatarUrl || null
        };
      }
      if (!admin || admin.status !== "APPROVED") {
        return { success: false };
      }
      return {
        success: true,
        email: session.adminEmail,
        isMaster: false,
        allowedScreens: admin.allowedScreens,
        avatarUrl: admin.avatarUrl
      };
    } else {
      // Conta de credencial local (admin clássico), tem acesso a ALL
      return {
        success: true,
        email: null,
        isMaster: false,
        allowedScreens: "ALL",
        avatarUrl: null
      };
    }
  } catch (e) {
    console.error("Erro ao obter detalhes da sessão:", e);
    return { success: false };
  }
}

export async function updateAdminAllowedScreens(sessionToken: string, adminId: string, allowedScreens: string) {
  try {
    const masterEmail = process.env.ALLOWED_GOOGLE_ADMIN_EMAIL || "dnlortega@gmail.com";
    const session = await prisma.adminSession.findUnique({
      where: { token: sessionToken }
    });
    if (!session || session.adminEmail?.toLowerCase() !== masterEmail.toLowerCase()) {
      return { success: false, error: "Não autorizado. Apenas o administrador principal pode alterar permissões." };
    }

    const admin = await prisma.admin.findUnique({
      where: { id: adminId }
    });

    if (!admin) {
      return { success: false, error: "Administrador não encontrado." };
    }

    if (admin.googleEmail?.toLowerCase() === masterEmail.toLowerCase()) {
      return { success: false, error: "Não é possível alterar as permissões do administrador principal." };
    }

    await prisma.admin.update({
      where: { id: adminId },
      data: { allowedScreens }
    });

    // Revalida o caminho para atualizar os dados no cache
    revalidatePath("/admin/access");

    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar telas do administrador:", error);
    return { success: false, error: "Erro ao atualizar telas permitidas." };
  }
}


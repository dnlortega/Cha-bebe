import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { registerAdminSession } from "@/app/actions";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const host = request.headers.get("x-forwarded-host") || url.host;
  let proto = request.headers.get("x-forwarded-proto") || "http";
  if (proto.includes(",")) {
    proto = proto.split(",")[0];
  }
  // Utiliza dinamicamente o pathname atual (funciona tanto para /api/auth/google/callback quanto /api/auth/callback/google)
  const redirectUri = `${proto}://${host}${url.pathname}`;

  // Se houver um erro do Google nos query params
  const googleErr = url.searchParams.get("error");
  if (googleErr) {
    return NextResponse.redirect(`${proto}://${host}/admin?google_error=${encodeURIComponent("Acesso negado pelo Google.")}`);
  }

  if (!code) {
    return NextResponse.redirect(`${proto}://${host}/admin?google_error=${encodeURIComponent("Código de autorização inválido.")}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const allowedEmail = process.env.ALLOWED_GOOGLE_ADMIN_EMAIL;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${proto}://${host}/admin?google_error=${encodeURIComponent("Credenciais do Google não configuradas no servidor.")}`);
  }

  try {
    // 1. Troca o código de autorização pelos tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error("Erro na troca do token Google:", errorData);
      return NextResponse.redirect(`${proto}://${host}/admin?google_error=${encodeURIComponent("Falha ao autenticar com o Google.")}`);
    }

    const tokens = await tokenResponse.json();

    // 2. Busca informações do usuário autenticado no Google
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(`${proto}://${host}/admin?google_error=${encodeURIComponent("Falha ao obter dados do usuário do Google.")}`);
    }

    const userInfo = await userInfoResponse.json();
    const email = userInfo.email?.toLowerCase();
    const picture = userInfo.picture || null;

    if (!email) {
      return NextResponse.redirect(`${proto}://${host}/admin?google_error=${encodeURIComponent("Não foi possível obter o e-mail da conta do Google.")}`);
    }

    // 3. Verifica a autorização
    let admin = await prisma.admin.findFirst({
      where: {
        googleEmail: {
          equals: email,
          mode: 'insensitive'
        }
      }
    });

    const isMaster = allowedEmail && email === allowedEmail.toLowerCase();

    if (isMaster) {
      if (admin) {
        admin = await prisma.admin.update({
          where: { id: admin.id },
          data: { 
            status: "APPROVED",
            avatarUrl: picture
          }
        });
      } else {
        const firstAdmin = await prisma.admin.findFirst({
          where: { googleEmail: null }
        });
        if (firstAdmin) {
          admin = await prisma.admin.update({
            where: { id: firstAdmin.id },
            data: { googleEmail: email, status: "APPROVED", avatarUrl: picture }
          });
        } else {
          admin = await prisma.admin.create({
            data: {
              username: "admin",
              password: "admin123",
              googleEmail: email,
              status: "APPROVED",
              avatarUrl: picture
            }
          });
        }
      }
    } else {
      if (!admin) {
        admin = await prisma.admin.create({
          data: {
            username: email,
            password: "google_auth_random_" + Math.random().toString(36).substring(2),
            googleEmail: email,
            status: "PENDING",
            avatarUrl: picture
          }
        });
      } else {
        // Atualiza apenas o avatar — status só pode ser alterado pelo master admin
        admin = await prisma.admin.update({
          where: { id: admin.id },
          data: { avatarUrl: picture }
        });
      }
    }

    if (admin.status === "PENDING") {
      return NextResponse.redirect(`${proto}://${host}/admin?pending_email=${encodeURIComponent(email)}`);
    }

    if (admin.status === "BLOCKED") {
      return NextResponse.redirect(`${proto}://${host}/admin?blocked_email=${encodeURIComponent(email)}`);
    }

    // 4. Cria o token de sessão único do painel
    const token = "session_" + Math.random().toString(36).substring(2) + Date.now().toString(36);

    // 5. Registra a sessão vinculando ao email
    await registerAdminSession(
      token,
      "Google Sign-In | Autenticando...",
      "Google Sign-In | Autenticando...",
      "Localização Desconhecida",
      null,
      "{}",
      email
    );

    // 6. Redireciona de volta para o painel com o token gerado
    const loginIdentity = admin.googleEmail || email;
    return NextResponse.redirect(`${proto}://${host}/admin?google_token=${token}&google_username=${encodeURIComponent(loginIdentity)}&google_avatar=${encodeURIComponent(admin.avatarUrl || "")}`);
  } catch (error) {
    console.error("Erro interno no callback do Google Auth:", error);
    return NextResponse.redirect(`${proto}://${host}/admin?google_error=${encodeURIComponent("Erro interno no callback de autenticação.")}`);
  }
}

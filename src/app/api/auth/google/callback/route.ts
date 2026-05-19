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
  const origin = `${proto}://${host}`;
  const redirectUri = `${origin}/api/auth/google/callback`;

  // If there's an error query param from Google
  const googleErr = url.searchParams.get("error");
  if (googleErr) {
    return NextResponse.redirect(`${origin}/admin?google_error=${encodeURIComponent("Acesso negado pelo Google.")}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/admin?google_error=${encodeURIComponent("Código de autorização inválido.")}`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const allowedEmail = process.env.ALLOWED_GOOGLE_ADMIN_EMAIL;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/admin?google_error=${encodeURIComponent("Credenciais do Google não configuradas no servidor.")}`);
  }

  try {
    // 1. Exchange the auth code for access/ID tokens
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
      return NextResponse.redirect(`${origin}/admin?google_error=${encodeURIComponent("Falha ao autenticar com o Google.")}`);
    }

    const tokens = await tokenResponse.json();

    // 2. Fetch the user info from Google's endpoint using the access token
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      return NextResponse.redirect(`${origin}/admin?google_error=${encodeURIComponent("Falha ao obter dados do usuário do Google.")}`);
    }

    const userInfo = await userInfoResponse.json();
    const email = userInfo.email?.toLowerCase();

    if (!email) {
      return NextResponse.redirect(`${origin}/admin?google_error=${encodeURIComponent("Não foi possível obter o e-mail da conta do Google.")}`);
    }

    // 3. Verify authorization
    // First, look for an admin linked to this email in the database
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
        if (admin.status !== "APPROVED") {
          admin = await prisma.admin.update({
            where: { id: admin.id },
            data: { status: "APPROVED" }
          });
        }
      } else {
        const firstAdmin = await prisma.admin.findFirst({
          where: { googleEmail: null }
        });
        if (firstAdmin) {
          admin = await prisma.admin.update({
            where: { id: firstAdmin.id },
            data: { googleEmail: email, status: "APPROVED" }
          });
        } else {
          admin = await prisma.admin.create({
            data: {
              username: "admin",
              password: "admin123",
              googleEmail: email,
              status: "APPROVED"
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
            status: "PENDING"
          }
        });
      }
    }

    if (admin.status === "PENDING") {
      return NextResponse.redirect(`${origin}/admin?pending_email=${encodeURIComponent(email)}`);
    }

    if (admin.status === "BLOCKED") {
      return NextResponse.redirect(`${origin}/admin?blocked_email=${encodeURIComponent(email)}`);
    }

    // 4. Generate the admin session token
    const token = "session_" + Math.random().toString(36).substring(2) + Date.now().toString(36);

    // 5. Register the session in the database
    // We register it with temporary details. The client-side page will immediately enrich the session details
    // using a server action once it loads.
    await registerAdminSession(
      token,
      "Google Sign-In | Autenticando...",
      "Google Sign-In | Autenticando...",
      "Localização Desconhecida",
      null,
      "{}",
      email
    );

    // 6. Redirect back to the admin area with the token and username
    return NextResponse.redirect(`${origin}/admin?google_token=${token}&google_username=${encodeURIComponent(admin.username)}`);
  } catch (error) {
    console.error("Erro interno no callback do Google Auth:", error);
    return NextResponse.redirect(`${origin}/admin?google_error=${encodeURIComponent("Erro interno no callback de autenticação.")}`);
  }
}

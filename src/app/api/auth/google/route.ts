import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const host = request.headers.get("x-forwarded-host") || url.host;
    let proto = request.headers.get("x-forwarded-proto") || "http";
    if (proto.includes(",")) {
      proto = proto.split(",")[0];
    }
    const redirectUri = `${proto}://${host}/api/auth/callback/google`;

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json(
        { error: "Google Client ID não está configurado no arquivo .env." },
        { status: 500 }
      );
    }

    // Build the Google OAuth 2.0 URL
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent("openid email profile")}` +
      `&access_type=offline` +
      `&prompt=select_account`;

    return NextResponse.redirect(googleAuthUrl);
  } catch (error) {
    console.error("Erro no início da autenticação Google:", error);
    return NextResponse.json({ error: "Erro interno no servidor." }, { status: 500 });
  }
}

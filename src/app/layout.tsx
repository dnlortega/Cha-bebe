import type { Metadata } from "next";
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSettings } from "@/app/actions";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getThemeById } from "@/lib/themes";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CHÁ DE BEBÊ - CONFIRMAÇÃO DE PRESENÇA",
  description: "CONFIRME SUA PRESENÇA EM NOSSO MOMENTO ESPECIAL",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const initialTheme = settings.theme || "GOLD";
  const themeConfig = getThemeById(initialTheme);

  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className={`min-h-full flex flex-col font-inter uppercase tracking-wide transition-colors duration-500 ${themeConfig.className}`}>
        <ThemeProvider initialTheme={initialTheme}>
          <TooltipProvider>
            {children}
            <Toaster position="top-center" richColors />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

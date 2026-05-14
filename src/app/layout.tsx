import type { Metadata } from "next";
import { Inter, Cinzel, Playfair_Display, Cormorant_Garamond, Dancing_Script, Great_Vibes, Lora, Outfit, DM_Sans, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getSettings } from "@/app/actions";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getThemeById } from "@/lib/themes";

// System fonts
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const outfit = Outfit({ variable: "--font-outfit", subsets: ["latin"] });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"] });
const plusJakarta = Plus_Jakarta_Sans({ variable: "--font-plus-jakarta", subsets: ["latin"] });

// Invite fonts
const cinzel = Cinzel({ variable: "--font-cinzel", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({ variable: "--font-cormorant", subsets: ["latin"], weight: ["300","400","500","600"] });
const dancing = Dancing_Script({ variable: "--font-dancing", subsets: ["latin"] });
const greatVibes = Great_Vibes({ variable: "--font-great-vibes", subsets: ["latin"], weight: ["400"] });
const lora = Lora({ variable: "--font-lora", subsets: ["latin"] });

// Map font names to CSS variables
const FONT_VAR_MAP: Record<string, string> = {
  "Inter": "var(--font-inter)",
  "Outfit": "var(--font-outfit)",
  "DM Sans": "var(--font-dm-sans)",
  "Plus Jakarta Sans": "var(--font-plus-jakarta)",
  "Geist": "var(--font-inter)", // fallback
  "Cinzel": "var(--font-cinzel)",
  "Playfair Display": "var(--font-playfair)",
  "Cormorant Garamond": "var(--font-cormorant)",
  "Dancing Script": "var(--font-dancing)",
  "Great Vibes": "var(--font-great-vibes)",
  "Lora": "var(--font-lora)",
};

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

  const systemFontFamily = FONT_VAR_MAP[settings.systemFont || "Inter"] || "var(--font-inter)";
  const systemFontSize = settings.systemFontSize || 14;

  const allFontVars = [
    inter.variable, outfit.variable, dmSans.variable, plusJakarta.variable,
    cinzel.variable, playfair.variable, cormorant.variable, dancing.variable,
    greatVibes.variable, lora.variable,
  ].join(" ");

  return (
    <html
      lang="pt-BR"
      className={`${allFontVars} h-full antialiased`}
      style={{
        fontFamily: systemFontFamily,
        fontSize: `${systemFontSize}px`,
      }}
    >
      <body className={`min-h-full flex flex-col uppercase tracking-wide transition-colors duration-500 ${themeConfig.className}`}>
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

export type ThemeConfig = {
  id: string;
  name: string;
  icon: string;
  className: string;
};

export const THEMES: ThemeConfig[] = [
  { id: "GOLD", name: "🔱 DOURADO CLASSIC", icon: "🔱", className: "theme-gold" },
  { id: "BLUE", name: "❄️ AZUL CELESTE", icon: "❄️", className: "theme-blue" },
  { id: "PINK", name: "🌸 ROSA PASTEL", icon: "🌸", className: "theme-pink" },
  { id: "BT21", name: "🧸 BT21 POP", icon: "🧸", className: "theme-bt21" },
  { id: "DARK", name: "🌑 NAVY ELEGANT", icon: "🌑", className: "theme-dark" },
  { id: "SAGE", name: "🌿 BOHO SAGE", icon: "🌿", className: "theme-sage" },
  { id: "MINT", name: "🌱 MINT FRESH", icon: "🌱", className: "theme-mint" },
  { id: "LAVENDER", name: "💜 LAVENDER LUXE", icon: "💜", className: "theme-lavender" },
  { id: "PEACH", name: "🍑 PEACH SOFT", icon: "🍑", className: "theme-peach" },
  { id: "WHITE", name: "⚪ CLASSIC WHITE", icon: "⚪", className: "theme-white" },
  { id: "BTS", name: "🎵 BTS / ARMY", icon: "🎵", className: "theme-bts" },
  { id: "TOYSTORY", name: "🤠 TOY STORY", icon: "🤠", className: "theme-toystory" },
  { id: "PRINCE", name: "👑 PEQUENO PRÍNCIPE", icon: "👑", className: "theme-prince" },
];

export const getThemeById = (id: string) => THEMES.find(t => t.id === id) || THEMES[0];

// ============================================
// PANEL DESIGN SYSTEM
// ============================================

export type PanelDesignId = "classic" | "premium" | "neon" | "ocean" | "rose";

export type PanelDesignConfig = {
  id: PanelDesignId;
  name: string;
  description: string;
  icon: string;
  className: string;
  dark?: boolean;
};

export const PANEL_DESIGNS: PanelDesignConfig[] = [
  {
    id: "classic",
    name: "Clássico",
    description: "Sidebar compacta com ícones, minimalista e rápido",
    icon: "◻",
    className: "",
    dark: false,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Sidebar escura com gradiente azul profundo e micro-animações",
    icon: "◈",
    className: "panel-premium",
    dark: true,
  },
  {
    id: "neon",
    name: "Neon",
    description: "Dark futurista com acentos neon verde",
    icon: "⚡",
    className: "panel-neon",
    dark: true,
  },
  {
    id: "ocean",
    name: "Ocean",
    description: "Gradiente azul-oceano, limpo e sereno",
    icon: "🌊",
    className: "panel-ocean",
    dark: true,
  },
  {
    id: "rose",
    name: "Rose",
    description: "Dark elegante em tons rose e vinho",
    icon: "🌹",
    className: "panel-rose",
    dark: true,
  },
];

export const getPanelDesignById = (id: string): PanelDesignConfig =>
  PANEL_DESIGNS.find(d => d.id === id) || PANEL_DESIGNS[0];


// ============================================
// INVITE DESIGN SYSTEM
// ============================================

export type InviteDesignId = "editorial" | "floral" | "luxury" | "modern" | "romantic";

export type InviteDesignConfig = {
  id: InviteDesignId;
  name: string;
  description: string;
  icon: string;
};

export const INVITE_DESIGNS: InviteDesignConfig[] = [
  { id: "editorial", name: "Editorial",  description: "Minimalista, tipográfico, linhas finas e elegantes",       icon: "◼" },
  { id: "floral",    name: "Floral",     description: "Botânico e arejado, cantos florais e cards suaves",        icon: "🌸" },
  { id: "luxury",    name: "Luxo",       description: "Fundo creme, bordas douradas, mat duplo na foto",           icon: "✦" },
  { id: "modern",    name: "Moderno",    description: "Geométrico, alto contraste, alinhamento à esquerda",        icon: "◧" },
  { id: "romantic",  name: "Romântico",  description: "Gradiente suave, corações, foto polaroid inclinada",        icon: "♡" },
];

export const getInviteDesignById = (id: string): InviteDesignConfig =>
  INVITE_DESIGNS.find(d => d.id === id) || INVITE_DESIGNS[0];


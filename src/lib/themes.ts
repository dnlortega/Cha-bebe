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
  { id: "WHITE", name: "⚪ CLASSIC WHITE", icon: "⚪", className: "theme-white" },
];

export const getThemeById = (id: string) => THEMES.find(t => t.id === id) || THEMES[0];

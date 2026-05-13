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

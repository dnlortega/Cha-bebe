"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getThemeById } from "@/lib/themes";

type ThemeContextType = {
  theme: string;
  setTheme: (theme: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ 
  children, 
  initialTheme 
}: { 
  children: React.ReactNode; 
  initialTheme: string;
}) {
  const [theme, setThemeState] = useState(initialTheme);

  const setTheme = (newTheme: string) => {
    setThemeState(newTheme);
  };

  useEffect(() => {
    const themeConfig = getThemeById(theme);
    // Apply class to body
    document.body.classList.forEach(cls => {
      if (cls.startsWith("theme-")) {
        document.body.classList.remove(cls);
      }
    });
    document.body.classList.add(themeConfig.className);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

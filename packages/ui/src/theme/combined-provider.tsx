"use client";

import type { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { createContext, useContext, useEffect, useState } from "react";

type ThemeModifier =
  | "none"
  | "condensed"
  | "minimal"
  | "elegant"
  | "natural"
  | "cyberpunk";

interface ThemeModifierContext {
  modifier: ThemeModifier;
  setModifier: (modifier: ThemeModifier) => void;
}

const ModifierContext = createContext<ThemeModifierContext>({
  modifier: "none",
  setModifier: () => {},
});

function ThemeModifierProvider({ children }: { children: React.ReactNode }) {
  const [modifier, setModifier] = useState<ThemeModifier>("none");

  useEffect(() => {
    const saved = localStorage.getItem(
      "theme-modifier",
    ) as ThemeModifier | null;
    if (
      saved &&
      [
        "none",
        "condensed",
        "minimal",
        "elegant",
        "natural",
        "cyberpunk",
      ].includes(saved)
    ) {
      setModifier(saved);
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const modifiers = [
      "condensed",
      "minimal",
      "elegant",
      "natural",
      "cyberpunk",
    ];
    for (const mod of modifiers) {
      html.removeAttribute("data-modifier");
    }
    if (modifier !== "none") {
      html.setAttribute("data-modifier", modifier);
    }
    localStorage.setItem("theme-modifier", modifier);
  }, [modifier]);

  return (
    <ModifierContext.Provider value={{ modifier, setModifier }}>
      {children}
    </ModifierContext.Provider>
  );
}

export function useThemeModifier() {
  return useContext(ModifierContext);
}

export function CombinedThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      <ThemeModifierProvider>{children}</ThemeModifierProvider>
    </NextThemesProvider>
  );
}

export { useTheme };

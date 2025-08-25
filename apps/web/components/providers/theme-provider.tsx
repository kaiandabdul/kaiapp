"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider, ConfigProvider } from "@lobehub/ui";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "@ant-design/v5-patch-for-react-19";

// --- Types ---
type Theme = "light" | "dark" | "auto";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

// --- Context ---
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// --- Constants ---
const STORAGE_KEY = "theme";
const DEFAULT_FONTS = [
  "https://registry.npmmirror.com/@lobehub/webfont-mono/latest/files/css/index.css",
  "https://registry.npmmirror.com/@lobehub/webfont-harmony-sans/latest/files/css/index.css",
  "https://registry.npmmirror.com/@lobehub/webfont-harmony-sans-sc/latest/files/css/index.css",
  "https://unpkg.com/katex/dist/katex.min.css",
];

// --- Provider ---
export function GlobalThemeProvider({
  children,
  customFonts = DEFAULT_FONTS,
}: {
  children: React.ReactNode;
  customFonts?: string[];
}) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [mounted, setMounted] = useState(false);

  // Determine actual theme based on preference
  const resolveTheme = (preference: Theme): ResolvedTheme => {
    if (preference !== "auto") return preference;
    
    return window.matchMedia("(prefers-color-scheme: dark)").matches 
      ? "dark" 
      : "light";
  };

  // Initialize theme
  useEffect(() => {
    const stored = (localStorage.getItem(STORAGE_KEY) as Theme) || "light";
    setThemeState(stored);
    setResolvedTheme(resolveTheme(stored));
    setMounted(true);
  }, []);

  // Handle system theme changes
  useEffect(() => {
    if (theme !== "auto") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setResolvedTheme(resolveTheme("auto"));

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Apply theme to DOM
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme, mounted]);

  // Update theme preference
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setResolvedTheme(resolveTheme(newTheme));
    localStorage.setItem(STORAGE_KEY, newTheme);
  };

  if (!mounted) return null;

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      <ConfigProvider config={{ proxy: "unpkg" }}>
        <ThemeProvider themeMode={resolvedTheme} customFonts={customFonts}>
          <AntdRegistry>{children}</AntdRegistry>
        </ThemeProvider>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
}

// --- Hook ---
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within GlobalThemeProvider");
  }
  return context;
}
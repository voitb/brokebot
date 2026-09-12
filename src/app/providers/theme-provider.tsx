import {
  createContext,
  useContext,
  useLayoutEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { DEFAULT_USER_CONFIG } from "@/lib/db";
import { useUserConfig } from "@/hooks/use-user-config";

type Theme = typeof DEFAULT_USER_CONFIG.theme;

const THEME_KEY = "theme-class";

type ThemeProviderContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
};

export const ThemeProviderContext = createContext<
  ThemeProviderContextType | undefined
>(undefined);

function subscribeToSystemTheme(callback: () => void) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", callback);
  return () => mediaQuery.removeEventListener("change", callback);
}

function getSystemThemeSnapshot(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getServerSnapshot(): "dark" | "light" {
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { config, isLoading, updateConfig } = useUserConfig();
  const theme: Theme = config.theme;

  const systemTheme = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemThemeSnapshot,
    getServerSnapshot
  );

  useLayoutEffect(() => {
    if (isLoading) return;

    const resolvedTheme = theme === "system" ? systemTheme : theme;
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme, systemTheme, isLoading]);

  const value: ThemeProviderContextType = {
    theme,
    setTheme: (newTheme: Theme) => updateConfig({ theme: newTheme }),
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

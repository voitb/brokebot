import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeProviderContext = createContext<
  ThemeProviderContextType | undefined
>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

// Module-level functions for useSyncExternalStore (stable references)
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

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem(storageKey) as Theme;
    return stored || defaultTheme;
  });

  // Subscribe to OS theme changes using React 18+ recommended pattern
  const systemTheme = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemThemeSnapshot,
    getServerSnapshot
  );

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme === "system" ? systemTheme : theme);
  }, [theme, systemTheme]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      localStorage.setItem(storageKey, newTheme);
      setTheme(newTheme);
    },
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

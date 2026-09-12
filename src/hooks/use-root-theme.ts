import { useSyncExternalStore } from "react";

function subscribeToRootTheme(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getRootThemeSnapshot(): "light" | "dark" {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): "light" | "dark" {
  return "light";
}

export function useRootTheme(): "light" | "dark" {
  return useSyncExternalStore(
    subscribeToRootTheme,
    getRootThemeSnapshot,
    getServerSnapshot
  );
}

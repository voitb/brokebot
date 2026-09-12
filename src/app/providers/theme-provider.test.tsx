import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import type { UserConfig } from "@/lib/db";
import { createMockUserConfig } from "@/testing/mocks/factories";
import { createMockMatchMedia } from "@/testing/mocks/dom-helpers";
import { ThemeProvider } from "./theme-provider";

const userConfigState: { config: UserConfig; isLoading: boolean } = {
  config: createMockUserConfig(),
  isLoading: false,
};

vi.mock("@/hooks/use-user-config", () => ({
  useUserConfig: () => ({
    config: userConfigState.config,
    isLoading: userConfigState.isLoading,
    updateConfig: vi.fn().mockResolvedValue(undefined),
    resetConfig: vi.fn().mockResolvedValue(undefined),
  }),
}));

function setSystemPrefersDark(prefersDark: boolean) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: createMockMatchMedia(prefersDark),
  });
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    userConfigState.config = createMockUserConfig();
    userConfigState.isLoading = false;
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
    setSystemPrefersDark(false);
  });

  it("stores the configured theme, not the class it resolved to", () => {
    userConfigState.config = createMockUserConfig({ theme: "system" });
    setSystemPrefersDark(true);

    render(<ThemeProvider>content</ThemeProvider>);

    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("theme-class")).toBe("system");
  });

  it("stores an explicit theme and applies it over the system preference", () => {
    userConfigState.config = createMockUserConfig({ theme: "dark" });
    setSystemPrefersDark(false);

    render(<ThemeProvider>content</ThemeProvider>);

    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("theme-class")).toBe("dark");
  });

  it("leaves the pre-paint class alone while the stored config is still loading", () => {
    userConfigState.isLoading = true;
    setSystemPrefersDark(false);
    document.documentElement.classList.add("dark");

    render(<ThemeProvider>content</ThemeProvider>);

    expect(document.documentElement).toHaveClass("dark");
    expect(document.documentElement).not.toHaveClass("light");
    expect(localStorage.getItem("theme-class")).toBeNull();
  });
});

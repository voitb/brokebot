import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./ThemeProvider";

function TestComponent() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme("dark")}>Set Dark</button>
      <button onClick={() => setTheme("light")}>Set Light</button>
      <button onClick={() => setTheme("system")}>Set System</button>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("uses defaultTheme when no stored theme exists", () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId("theme").textContent).toBe("dark");
    });

    it("uses system as default when no props provided", () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId("theme").textContent).toBe("system");
    });

    it("uses stored theme from localStorage", () => {
      localStorage.setItem("theme", "light");

      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId("theme").textContent).toBe("light");
    });

    it("uses custom storage key", () => {
      localStorage.setItem("custom-theme", "dark");

      render(
        <ThemeProvider storageKey="custom-theme">
          <TestComponent />
        </ThemeProvider>
      );

      expect(screen.getByTestId("theme").textContent).toBe("dark");
    });
  });

  describe("theme switching", () => {
    it("switches to dark theme", () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      act(() => {
        screen.getByText("Set Dark").click();
      });

      expect(screen.getByTestId("theme").textContent).toBe("dark");
      expect(document.documentElement.classList.contains("dark")).toBe(true);
      expect(localStorage.getItem("theme")).toBe("dark");
    });

    it("switches to light theme", () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <TestComponent />
        </ThemeProvider>
      );

      act(() => {
        screen.getByText("Set Light").click();
      });

      expect(screen.getByTestId("theme").textContent).toBe("light");
      expect(document.documentElement.classList.contains("light")).toBe(true);
    });

    it("removes old theme class when switching", () => {
      render(
        <ThemeProvider defaultTheme="light">
          <TestComponent />
        </ThemeProvider>
      );

      expect(document.documentElement.classList.contains("light")).toBe(true);

      act(() => {
        screen.getByText("Set Dark").click();
      });

      expect(document.documentElement.classList.contains("light")).toBe(false);
      expect(document.documentElement.classList.contains("dark")).toBe(true);
    });

    it("applies system theme based on media query", () => {
      render(
        <ThemeProvider defaultTheme="system">
          <TestComponent />
        </ThemeProvider>
      );

      // matchMedia mock returns { matches: false } so system theme = light
      expect(document.documentElement.classList.contains("light")).toBe(true);
    });
  });

  describe("useTheme hook", () => {
    it("throws error when used outside provider", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useTheme must be used within a ThemeProvider");

      consoleSpy.mockRestore();
    });
  });

  describe("persistence", () => {
    it("persists theme to localStorage on change", () => {
      render(
        <ThemeProvider>
          <TestComponent />
        </ThemeProvider>
      );

      act(() => {
        screen.getByText("Set Dark").click();
      });

      expect(localStorage.getItem("theme")).toBe("dark");

      act(() => {
        screen.getByText("Set Light").click();
      });

      expect(localStorage.getItem("theme")).toBe("light");
    });

    it("uses custom storage key for persistence", () => {
      render(
        <ThemeProvider storageKey="my-app-theme">
          <TestComponent />
        </ThemeProvider>
      );

      act(() => {
        screen.getByText("Set Dark").click();
      });

      expect(localStorage.getItem("my-app-theme")).toBe("dark");
      expect(localStorage.getItem("theme")).toBeNull();
    });
  });
});

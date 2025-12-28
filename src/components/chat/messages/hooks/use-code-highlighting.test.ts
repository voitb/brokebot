import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCodeHighlighting } from "./useCodeHighlighting";

let mockTheme = "dark";

vi.mock("@/providers/ThemeProvider", () => ({
  useTheme: () => ({
    theme: mockTheme,
  }),
}));

vi.mock("react-syntax-highlighter/dist/esm/styles/prism", () => ({
  oneDark: { "pre[class*='language-']": { background: "#282c34" } },
  oneLight: { "pre[class*='language-']": { background: "#fafafa" } },
}));

describe("useCodeHighlighting", () => {
  beforeEach(() => {
    mockTheme = "dark";
  });

  describe("language detection", () => {
    it("extracts language from className", () => {
      const { result } = renderHook(() =>
        useCodeHighlighting({
          className: "language-typescript",
          children: "const x = 1;",
        })
      );

      expect(result.current.language).toBe("typescript");
    });

    it("handles javascript language", () => {
      const { result } = renderHook(() =>
        useCodeHighlighting({
          className: "language-javascript",
          children: "let x = 1;",
        })
      );

      expect(result.current.language).toBe("javascript");
    });

    it("handles python language", () => {
      const { result } = renderHook(() =>
        useCodeHighlighting({
          className: "language-python",
          children: "x = 1",
        })
      );

      expect(result.current.language).toBe("python");
    });

    it("returns empty string when no language specified", () => {
      const { result } = renderHook(() =>
        useCodeHighlighting({
          className: "some-other-class",
          children: "code",
        })
      );

      expect(result.current.language).toBe("");
    });

    it("returns empty string when className is undefined", () => {
      const { result } = renderHook(() =>
        useCodeHighlighting({
          children: "code",
        })
      );

      expect(result.current.language).toBe("");
    });
  });

  describe("code processing", () => {
    it("converts children to string", () => {
      const { result } = renderHook(() =>
        useCodeHighlighting({
          className: "language-js",
          children: "const x = 1;",
        })
      );

      expect(result.current.code).toBe("const x = 1;");
    });

    it("removes trailing newline", () => {
      const { result } = renderHook(() =>
        useCodeHighlighting({
          className: "language-js",
          children: "const x = 1;\n",
        })
      );

      expect(result.current.code).toBe("const x = 1;");
    });

    it("preserves internal newlines", () => {
      const { result } = renderHook(() =>
        useCodeHighlighting({
          className: "language-js",
          children: "const x = 1;\nconst y = 2;",
        })
      );

      expect(result.current.code).toBe("const x = 1;\nconst y = 2;");
    });
  });

  describe("inline detection", () => {
    it("returns isInline true when no language match", () => {
      const { result } = renderHook(() =>
        useCodeHighlighting({
          className: "inline-code",
          children: "code",
        })
      );

      expect(result.current.isInline).toBe(true);
    });

    it("returns isInline false when language is detected", () => {
      const { result } = renderHook(() =>
        useCodeHighlighting({
          className: "language-typescript",
          children: "const x = 1;",
        })
      );

      expect(result.current.isInline).toBe(false);
    });
  });

  describe("theme handling", () => {
    it("returns oneDark style for dark theme", () => {
      mockTheme = "dark";

      const { result } = renderHook(() =>
        useCodeHighlighting({
          className: "language-js",
          children: "code",
        })
      );

      expect(result.current.syntaxStyle).toEqual({
        "pre[class*='language-']": { background: "#282c34" },
      });
    });

    it("returns oneLight style for light theme", () => {
      mockTheme = "light";

      const { result } = renderHook(() =>
        useCodeHighlighting({
          className: "language-js",
          children: "code",
        })
      );

      expect(result.current.syntaxStyle).toEqual({
        "pre[class*='language-']": { background: "#fafafa" },
      });
    });
  });
});

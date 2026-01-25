import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCodeHighlighting } from "./use-code-highlighting";

let mockTheme = "dark";

vi.mock("@/app/providers/theme-provider", () => ({
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
    it.each(["typescript", "javascript", "python"])(
      "extracts %s from className",
      (lang) => {
        const { result } = renderHook(() =>
          useCodeHighlighting({
            className: `language-${lang}`,
            children: "code",
          })
        );
        expect(result.current.language).toBe(lang);
      }
    );

    it("returns empty string when no language in className", () => {
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
        useCodeHighlighting({ children: "code" })
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

    it("removes trailing newline but preserves internal ones", () => {
      const { result } = renderHook(() =>
        useCodeHighlighting({
          className: "language-js",
          children: "const x = 1;\nconst y = 2;\n",
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
    it.each([
      ["dark", "#282c34"],
      ["light", "#fafafa"],
    ])("returns correct style for %s theme", (theme, background) => {
      mockTheme = theme;
      const { result } = renderHook(() =>
        useCodeHighlighting({
          className: "language-js",
          children: "code",
        })
      );
      expect(result.current.syntaxStyle).toEqual({
        "pre[class*='language-']": { background },
      });
    });
  });
});

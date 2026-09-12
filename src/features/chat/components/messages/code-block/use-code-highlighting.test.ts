import { describe, it, expect, vi, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import { useCodeHighlighting } from "./use-code-highlighting";

vi.mock("react-syntax-highlighter/dist/esm/styles/prism", () => ({
  oneDark: { "pre[class*='language-']": { background: "#282c34" } },
  oneLight: { "pre[class*='language-']": { background: "#fafafa" } },
}));

describe("useCodeHighlighting", () => {
  afterEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("treats a multiline fence without a language class as a block", () => {
    const { result } = renderHook(() =>
      useCodeHighlighting({ children: "const x = 1;\nconst y = 2;" })
    );
    expect(result.current.isInline).toBe(false);
  });

  it("follows the document dark class", () => {
    document.documentElement.classList.add("dark");
    const { result: darkResult, unmount } = renderHook(() =>
      useCodeHighlighting({ children: "code" })
    );
    expect(darkResult.current.syntaxStyle).toBe(oneDark);
    unmount();

    document.documentElement.classList.remove("dark");
    const { result: lightResult } = renderHook(() =>
      useCodeHighlighting({ children: "code" })
    );
    expect(lightResult.current.syntaxStyle).toBe(oneLight);
  });
});

import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/testing/utils";
import { CodeBlock } from "./code-block";

vi.mock("react-syntax-highlighter", () => ({
  Prism: ({ children, language }: { children: string; language: string }) => (
    <pre data-testid="syntax-highlighter" data-language={language}>
      {children}
    </pre>
  ),
}));

describe("CodeBlock", () => {
  describe("inline code rendering", () => {
    it("renders inline code when no language class is provided", () => {
      render(<CodeBlock>const x = 1;</CodeBlock>);

      const inlineCode = screen.getByText("const x = 1;");
      expect(inlineCode).toBeInTheDocument();
      expect(inlineCode.tagName).toBe("CODE");
    });

    it("does not render block code components for inline code", () => {
      render(<CodeBlock>inline</CodeBlock>);

      expect(screen.queryByRole("button", { name: /copy/i })).not.toBeInTheDocument();
      expect(screen.queryByTestId("syntax-highlighter")).not.toBeInTheDocument();
    });
  });

  describe("code block rendering", () => {
    it("renders syntax-highlighted block for code with language class", () => {
      render(
        <CodeBlock className="language-typescript">
          const x = 1;{"\n"}const y = 2;
        </CodeBlock>
      );

      const highlighter = screen.getByTestId("syntax-highlighter");
      expect(highlighter).toBeInTheDocument();
      expect(highlighter.textContent).toContain("const x = 1;");
    });

    it("uses correct language for syntax highlighting", () => {
      render(<CodeBlock className="language-python">x = 1</CodeBlock>);

      const highlighter = screen.getByTestId("syntax-highlighter");
      expect(highlighter).toHaveAttribute("data-language", "python");
    });
  });

  describe("language label", () => {
    it("displays correct language label", () => {
      render(<CodeBlock className="language-javascript">code</CodeBlock>);

      expect(screen.getByText("javascript")).toBeInTheDocument();
    });

    it("displays typescript label for typescript code", () => {
      render(<CodeBlock className="language-typescript">code</CodeBlock>);

      expect(screen.getByText("typescript")).toBeInTheDocument();
    });
  });

  describe("copy button", () => {
    it("renders copy button for code blocks", () => {
      render(<CodeBlock className="language-typescript">const x = 1;</CodeBlock>);

      const copyButton = screen.getByRole("button", { name: /copy/i });
      expect(copyButton).toBeInTheDocument();
    });
  });
});

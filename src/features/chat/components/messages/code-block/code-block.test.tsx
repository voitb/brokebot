import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { render } from "@/testing/utils";
import { CodeBlock } from "./code-block";

let mockUseCodeHighlighting = {
  language: "typescript",
  code: "const x = 1;",
  isInline: false,
  syntaxStyle: { "pre[class*='language-']": { background: "#282c34" } },
};

vi.mock("./use-code-highlighting", () => ({
  useCodeHighlighting: vi.fn(() => mockUseCodeHighlighting),
}));

vi.mock("react-syntax-highlighter", () => ({
  Prism: ({ children, language }: { children: string; language: string }) => (
    <div data-testid="syntax-highlighter" data-language={language}>
      {children}
    </div>
  ),
}));

vi.mock("@/components/ui/copy-button", () => ({
  CopyButton: ({ value, className }: { value: string; className?: string }) => (
    <button data-testid="copy-button" data-value={value} className={className}>
      Copy
    </button>
  ),
}));

vi.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="scroll-area" className={className}>
      {children}
    </div>
  ),
  ScrollBar: ({ orientation, className }: { orientation: string; className?: string }) => (
    <div data-testid="scroll-bar" data-orientation={orientation} className={className} />
  ),
}));

import { useCodeHighlighting } from "./use-code-highlighting";

describe("CodeBlock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCodeHighlighting = {
      language: "typescript",
      code: "const x = 1;",
      isInline: false,
      syntaxStyle: { "pre[class*='language-']": { background: "#282c34" } },
    };
    vi.mocked(useCodeHighlighting).mockReturnValue(mockUseCodeHighlighting);
  });

  describe("inline code rendering", () => {
    it("renders inline code for single-line code", () => {
      mockUseCodeHighlighting.isInline = true;

      render(<CodeBlock>const x = 1;</CodeBlock>);

      const inlineCode = screen.getByText("const x = 1;");
      expect(inlineCode).toBeInTheDocument();
      expect(inlineCode.tagName).toBe("CODE");
      expect(inlineCode).toHaveClass("bg-muted");
    });

    it("applies correct inline code styling", () => {
      mockUseCodeHighlighting.isInline = true;

      render(<CodeBlock>inline code</CodeBlock>);

      const inlineCode = screen.getByText("inline code");
      expect(inlineCode).toHaveClass("px-1.5");
      expect(inlineCode).toHaveClass("py-0.5");
      expect(inlineCode).toHaveClass("rounded");
      expect(inlineCode).toHaveClass("text-sm");
      expect(inlineCode).toHaveClass("font-mono");
    });

    it("does not render code block components for inline code", () => {
      mockUseCodeHighlighting.isInline = true;

      render(<CodeBlock>inline</CodeBlock>);

      expect(screen.queryByTestId("scroll-area")).not.toBeInTheDocument();
      expect(screen.queryByTestId("copy-button")).not.toBeInTheDocument();
      expect(screen.queryByTestId("syntax-highlighter")).not.toBeInTheDocument();
    });
  });

  describe("code block rendering", () => {
    it("renders syntax-highlighted block for multi-line code", () => {
      mockUseCodeHighlighting.code = "const x = 1;\nconst y = 2;";

      render(
        <CodeBlock className="language-typescript">
          const x = 1;{"\n"}const y = 2;
        </CodeBlock>
      );

      const highlighter = screen.getByTestId("syntax-highlighter");
      expect(highlighter).toBeInTheDocument();
      expect(highlighter.textContent).toBe("const x = 1;\nconst y = 2;");
    });

    it("uses correct language for syntax highlighting", () => {
      mockUseCodeHighlighting.language = "python";
      mockUseCodeHighlighting.code = "x = 1";

      render(<CodeBlock className="language-python">x = 1</CodeBlock>);

      const highlighter = screen.getByTestId("syntax-highlighter");
      expect(highlighter).toHaveAttribute("data-language", "python");
    });

    it("renders group wrapper for hover effects", () => {
      render(<CodeBlock className="language-typescript">code</CodeBlock>);

      const wrapper = screen.getByTestId("scroll-area").closest(".group");
      expect(wrapper).toBeInTheDocument();
      expect(wrapper).toHaveClass("relative");
    });
  });

  describe("language label", () => {
    it("displays correct language label in uppercase", () => {
      mockUseCodeHighlighting.language = "javascript";

      render(<CodeBlock className="language-javascript">code</CodeBlock>);

      const label = screen.getByText("javascript");
      expect(label).toBeInTheDocument();
      expect(label).toHaveClass("uppercase");
    });

    it("displays typescript label for typescript code", () => {
      mockUseCodeHighlighting.language = "typescript";

      render(<CodeBlock className="language-typescript">code</CodeBlock>);

      expect(screen.getByText("typescript")).toBeInTheDocument();
    });

    it("displays python label for python code", () => {
      mockUseCodeHighlighting.language = "python";

      render(<CodeBlock className="language-python">code</CodeBlock>);

      expect(screen.getByText("python")).toBeInTheDocument();
    });

    it("applies correct styling to language label", () => {
      render(<CodeBlock className="language-typescript">code</CodeBlock>);

      const label = screen.getByText("typescript");
      expect(label).toHaveClass("text-xs");
      expect(label).toHaveClass("font-medium");
      expect(label).toHaveClass("text-muted-foreground");
    });
  });

  describe("copy button", () => {
    it("renders copy button with code value", () => {
      mockUseCodeHighlighting.code = "const x = 1;";

      render(<CodeBlock className="language-typescript">const x = 1;</CodeBlock>);

      const copyButton = screen.getByTestId("copy-button");
      expect(copyButton).toBeInTheDocument();
      expect(copyButton).toHaveAttribute("data-value", "const x = 1;");
    });

    it("copy button is hidden by default with opacity-0", () => {
      render(<CodeBlock className="language-typescript">code</CodeBlock>);

      const copyButton = screen.getByTestId("copy-button");
      expect(copyButton).toHaveClass("opacity-0");
      expect(copyButton).toHaveClass("group-hover:opacity-100");
      expect(copyButton).toHaveClass("transition-opacity");
    });

    it("copy button has small size", () => {
      render(<CodeBlock className="language-typescript">code</CodeBlock>);

      const copyButton = screen.getByTestId("copy-button");
      expect(copyButton).toHaveClass("h-6");
      expect(copyButton).toHaveClass("w-6");
      expect(copyButton).toHaveClass("p-0");
    });
  });

  describe("header section", () => {
    it("renders header with language and copy button", () => {
      mockUseCodeHighlighting.language = "typescript";

      render(<CodeBlock className="language-typescript">code</CodeBlock>);

      expect(screen.getByText("typescript")).toBeInTheDocument();
      expect(screen.getByTestId("copy-button")).toBeInTheDocument();
    });

    it("header has correct styling", () => {
      render(<CodeBlock className="language-typescript">code</CodeBlock>);

      const header = screen.getByText("typescript").closest("div");
      expect(header).toHaveClass("flex");
      expect(header).toHaveClass("items-center");
      expect(header).toHaveClass("justify-between");
      expect(header).toHaveClass("bg-muted");
      expect(header).toHaveClass("px-3");
      expect(header).toHaveClass("py-2");
      expect(header).toHaveClass("rounded-t-lg");
      expect(header).toHaveClass("border");
    });
  });

  describe("scroll area", () => {
    it("renders scroll area for code content", () => {
      render(<CodeBlock className="language-typescript">code</CodeBlock>);

      const scrollArea = screen.getByTestId("scroll-area");
      expect(scrollArea).toBeInTheDocument();
    });

    it("scroll area has correct styling", () => {
      render(<CodeBlock className="language-typescript">code</CodeBlock>);

      const scrollArea = screen.getByTestId("scroll-area");
      expect(scrollArea).toHaveClass("w-1");
      expect(scrollArea).toHaveClass("flex-1");
      expect(scrollArea).toHaveClass("rounded-b-lg");
      expect(scrollArea).toHaveClass("border");
    });

    it("renders horizontal scroll bar", () => {
      render(<CodeBlock className="language-typescript">code</CodeBlock>);

      const scrollBar = screen.getByTestId("scroll-bar");
      expect(scrollBar).toBeInTheDocument();
      expect(scrollBar).toHaveAttribute("data-orientation", "horizontal");
      expect(scrollBar).toHaveClass("w-full");
    });
  });

  describe("code highlighting integration", () => {
    it("calls useCodeHighlighting with className and children", () => {
      const className = "language-typescript";
      const children = "const x = 1;";

      render(<CodeBlock className={className}>{children}</CodeBlock>);

      expect(useCodeHighlighting).toHaveBeenCalledWith({
        className,
        children,
      });
    });

    it("handles empty className", () => {
      const children = "code";

      render(<CodeBlock>{children}</CodeBlock>);

      expect(useCodeHighlighting).toHaveBeenCalledWith({
        className: undefined,
        children,
      });
    });

    it("uses code from useCodeHighlighting hook", () => {
      mockUseCodeHighlighting.code = "const processedCode = true;";

      render(<CodeBlock className="language-typescript">original code</CodeBlock>);

      expect(screen.getByTestId("syntax-highlighter")).toHaveTextContent(
        "const processedCode = true;"
      );
      expect(screen.getByTestId("copy-button")).toHaveAttribute(
        "data-value",
        "const processedCode = true;"
      );
    });
  });

  describe("edge cases", () => {
    it("handles empty code string", () => {
      mockUseCodeHighlighting.code = "";

      render(<CodeBlock className="language-typescript">{""}</CodeBlock>);

      const highlighter = screen.getByTestId("syntax-highlighter");
      expect(highlighter).toHaveTextContent("");
    });

    it("handles long code blocks", () => {
      const longCode = Array(100)
        .fill("const x = 1;")
        .join("\n");
      mockUseCodeHighlighting.code = longCode;

      render(<CodeBlock className="language-typescript">{longCode}</CodeBlock>);

      expect(screen.getByTestId("scroll-area")).toBeInTheDocument();
      expect(screen.getByTestId("scroll-bar")).toBeInTheDocument();
    });

    it("handles code with special characters", () => {
      mockUseCodeHighlighting.code = 'const str = "<>&\\"\'";';

      render(
        <CodeBlock className="language-typescript">
          {'const str = "<>&\\"\'";'}
        </CodeBlock>
      );

      expect(screen.getByTestId("syntax-highlighter").textContent).toBe(
        'const str = "<>&\\"\'";'
      );
    });

    it("handles unknown language gracefully", () => {
      mockUseCodeHighlighting.language = "";

      render(<CodeBlock className="language-unknown">code</CodeBlock>);

      const highlighter = screen.getByTestId("syntax-highlighter");
      expect(highlighter).toBeInTheDocument();
      expect(highlighter).toHaveAttribute("data-language", "");
    });
  });

  describe("component structure", () => {
    it("maintains correct rendering order for block code", () => {
      render(<CodeBlock className="language-typescript">code</CodeBlock>);

      const root = screen.getByTestId("scroll-area").closest(".group");
      expect(root).toBeInTheDocument();

      const header = screen.getByText("typescript").closest("div");
      const scrollArea = screen.getByTestId("scroll-area");

      expect(header).toBeInTheDocument();
      expect(scrollArea).toBeInTheDocument();
    });

    it("renders children content correctly for inline code", () => {
      mockUseCodeHighlighting.isInline = true;

      render(
        <CodeBlock>
          <span>nested content</span>
        </CodeBlock>
      );

      expect(screen.getByText("nested content")).toBeInTheDocument();
    });
  });
});

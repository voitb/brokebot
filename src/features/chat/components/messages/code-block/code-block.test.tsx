import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/testing/utils";
import { CodeBlock } from "./code-block";

vi.mock("react-syntax-highlighter", () => ({
  Prism: ({ children }: { children: string }) => <pre>{children}</pre>,
}));

describe("CodeBlock", () => {
  it("shows the language as accessible text", () => {
    render(<CodeBlock className="language-javascript">const x = 1;</CodeBlock>);

    expect(screen.getByText("javascript")).toBeInTheDocument();
  });

  it("copies the code when the Copy control is used", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    render(
      <CodeBlock className="language-javascript">{"const x = 1;\n"}</CodeBlock>
    );

    await userEvent.click(screen.getByRole("button", { name: /copy/i }));

    expect(writeText).toHaveBeenCalledWith("const x = 1;");
  });

  it("keeps Copy available on a multiline fence with no language class", () => {
    render(<CodeBlock>{"const x = 1;\nconst y = 2;"}</CodeBlock>);

    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
    expect(screen.queryByText("javascript")).not.toBeInTheDocument();
  });
});

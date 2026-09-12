import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChatInterface } from "./chat-interface";

vi.mock("../header/chat-header", () => ({ ChatHeader: () => <header>Header</header> }));
vi.mock("../messages/chat-messages/chat-messages", () => ({ ChatMessages: () => <main>Messages</main> }));
vi.mock("../input/chat-input/", () => ({ ChatInput: () => <div>Input</div> }));

const mockUseChatInput = vi.fn(() => ({
  message: "",
  setMessage: vi.fn(),
  isLoading: false,
  isGenerating: false,
  handleMessageSubmit: vi.fn(),
  regenerateLastResponse: vi.fn(),
  stopGeneration: vi.fn(),
}));

vi.mock("@/features/chat/hooks/use-chat-input", () => ({ useChatInput: () => mockUseChatInput() }));

describe("ChatInterface", () => {
  it("renders the header, transcript and composer", () => {
    render(
      <MemoryRouter initialEntries={["/chat/123"]}>
        <ChatInterface />
      </MemoryRouter>
    );

    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Messages")).toBeInTheDocument();
    expect(screen.getByText("Input")).toBeInTheDocument();
  });
});

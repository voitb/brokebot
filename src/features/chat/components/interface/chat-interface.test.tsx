import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ChatInterface } from "./chat-interface";
import type { UseConversationReturn } from "@/hooks";
import type { Conversation, Message } from "@/lib/db";
import { createMockConversation } from "@/testing/mocks/factories";

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

let mockConversation: Conversation | undefined = undefined;
let mockMessages: Message[] = [];

vi.mock("@/features/chat/hooks/use-chat-input", () => ({ useChatInput: () => mockUseChatInput() }));
vi.mock("@/hooks/use-conversations", () => ({
  useConversation: (): UseConversationReturn => ({
    conversation: mockConversation,
    messages: mockMessages,
  }),
}));

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<ChatInterface />} />
        <Route path="/chat/:id" element={<ChatInterface />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ChatInterface", () => {
  beforeEach(() => {
    mockConversation = undefined;
    mockMessages = [];
  });

  it("renders layout when no conversation id", () => {
    renderAt("/");
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Messages")).toBeInTheDocument();
    expect(screen.getByText("Input")).toBeInTheDocument();
  });

  it("shows loading when conversation id exists but not loaded", () => {
    renderAt("/chat/123");
    expect(screen.getByText(/loading conversation/i)).toBeInTheDocument();
  });

  it("renders layout when conversation is loaded", () => {
    mockConversation = createMockConversation({ id: "123" });
    renderAt("/chat/123");
    expect(screen.getByText("Header")).toBeInTheDocument();
  });
});

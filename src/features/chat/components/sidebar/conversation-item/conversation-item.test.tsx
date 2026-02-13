import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/testing/utils";
import { ConversationItem } from "./conversation-item";
import { createMockConversation } from "@/testing/mocks/factories";
import { mockNavigate } from "@/testing/mocks/modules";

const mockDeleteConversation = vi.fn().mockResolvedValue(undefined);
const mockTogglePinConversation = vi.fn().mockResolvedValue(undefined);
const mockUpdateConversationTitle = vi.fn().mockResolvedValue(undefined);

vi.mock("@/app/providers/conversations-provider", () => ({
  useConversations: () => ({
    deleteConversation: mockDeleteConversation,
    togglePinConversation: mockTogglePinConversation,
    updateConversationTitle: mockUpdateConversationTitle,
    moveConversationToFolder: vi.fn(),
    createFolder: vi.fn(),
    folders: [],
  }),
}));

vi.mock("@/hooks/use-conversation-id", () => ({
  useConversationId: () => undefined,
}));

describe("ConversationItem", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders conversation title and navigates on click", async () => {
    const conversation = createMockConversation({ id: "conv-1", title: "My Chat" });
    render(<ConversationItem conversation={conversation} />);

    expect(screen.getByText("My Chat")).toBeInTheDocument();

    await user.click(screen.getByText("My Chat"));

    expect(mockNavigate).toHaveBeenCalledWith("/chat/conv-1");
  });

  it("shows edit input on double-click and saves on enter", async () => {
    const conversation = createMockConversation({ title: "Original Title" });
    render(<ConversationItem conversation={conversation} />);

    await user.dblClick(screen.getByText("Original Title"));

    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();

    await user.clear(input);
    await user.type(input, "Updated{Enter}");

    await waitFor(() => {
      expect(mockUpdateConversationTitle).toHaveBeenCalledWith(
        conversation.id,
        "Updated"
      );
    });
  });

  it("opens delete dialog from menu and confirms deletion", async () => {
    const conversation = createMockConversation({ title: "Delete Me" });
    render(<ConversationItem conversation={conversation} />);

    await user.click(screen.getByRole("button", { name: /actions for/i }));
    await user.click(screen.getByText("Delete"));

    expect(screen.getByText(/delete conversation/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /delete/i }));

    expect(mockDeleteConversation).toHaveBeenCalledWith(conversation.id);
  });
});

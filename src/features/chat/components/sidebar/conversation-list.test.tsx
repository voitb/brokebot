import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConversationList } from "./conversation-list";
import { createMockConversation, createMockFolder } from "@/testing/mocks/modules";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";

const mockCreateFolder = vi.fn();
const mockCreateEmptyConversation = vi.fn().mockResolvedValue("new-id");

const mockConversationsContext = {
  conversations: [] as ReturnType<typeof createMockConversation>[],
  folders: [] as ReturnType<typeof createMockFolder>[],
  isLoading: false,
  createFolder: mockCreateFolder,
  createEmptyConversation: mockCreateEmptyConversation,
};

vi.mock("@/app/providers/conversations-provider", () => ({
  useConversations: () => mockConversationsContext,
}));

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <TooltipProvider>{children}</TooltipProvider>
    </BrowserRouter>
  );
}

describe("ConversationList", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockConversationsContext.conversations = [];
    mockConversationsContext.folders = [];
    mockConversationsContext.isLoading = false;
  });

  it("renders empty state when no conversations exist", () => {
    render(<ConversationList />, { wrapper: Wrapper });

    expect(screen.getByPlaceholderText(/search conversations/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new chat/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /create new folder/i })).toBeInTheDocument();
    expect(screen.getByText(/no conversations yet/i)).toBeInTheDocument();
  });

  it("creates new chat when button is clicked", async () => {
    render(<ConversationList />, { wrapper: Wrapper });

    await user.click(screen.getByRole("button", { name: /new chat/i }));

    expect(mockCreateEmptyConversation).toHaveBeenCalledWith("New Conversation", undefined);
  });

  it("opens folder dialog and creates folder on submit", async () => {
    render(<ConversationList />, { wrapper: Wrapper });

    await user.click(screen.getByRole("button", { name: /create new folder/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.type(screen.getByRole("textbox"), "Work Projects");
    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(mockCreateFolder).toHaveBeenCalledWith("Work Projects");
  });

  it("renders conversations in correct sections", () => {
    mockConversationsContext.conversations = [
      createMockConversation({ id: "1", title: "Pinned Chat", pinned: true }),
      createMockConversation({ id: "2", title: "Recent Chat", pinned: false }),
    ];
    mockConversationsContext.folders = [createMockFolder({ id: "folder-1", name: "Work" })];

    render(<ConversationList />, { wrapper: Wrapper });

    expect(screen.getByText("Favourites")).toBeInTheDocument();
    expect(screen.getByText("Pinned Chat")).toBeInTheDocument();
    expect(screen.getByText("Recent")).toBeInTheDocument();
    expect(screen.getByText("Recent Chat")).toBeInTheDocument();
  });

  it("hides conversation sections while loading", () => {
    mockConversationsContext.conversations = [
      createMockConversation({ id: "1", title: "Recent Chat", pinned: false }),
      createMockConversation({ id: "2", title: "Work Chat", pinned: false, folderId: "folder-1" }),
    ];
    mockConversationsContext.folders = [createMockFolder({ id: "folder-1", name: "Work" })];
    mockConversationsContext.isLoading = true;

    const { rerender } = render(<ConversationList />, { wrapper: Wrapper });

    expect(screen.queryByText("Recent")).not.toBeInTheDocument();
    expect(screen.queryByText("Recent Chat")).not.toBeInTheDocument();
    expect(screen.queryByText("Work")).not.toBeInTheDocument();

    mockConversationsContext.isLoading = false;
    rerender(<ConversationList />);

    expect(screen.getByText("Recent")).toBeInTheDocument();
    expect(screen.getByText("Recent Chat")).toBeInTheDocument();
    expect(screen.getByText("Work")).toBeInTheDocument();
  });
});

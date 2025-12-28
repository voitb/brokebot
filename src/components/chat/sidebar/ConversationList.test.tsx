import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/test/utils";
import { ConversationList } from "./ConversationList";
import {
  createMockConversation,
  createMockFolder,
  createMockConversationListHook,
} from "@/test/mocks";

const mockUseConversationList = createMockConversationListHook();

vi.mock("./hooks/useConversationList", () => ({
  useConversationList: vi.fn(() => mockUseConversationList),
}));

vi.mock("@/providers/ConversationsProvider", async () => {
  const { createMockConversationsHook } = await import("@/test/mocks/hooks");
  return {
    useConversations: vi.fn(() => createMockConversationsHook({
      createFolder: vi.fn(),
    })),
  };
});

vi.mock("@/providers/WebLLMProvider", async () => {
  const { createMinimalWebLLMProvider } = await import("@/test/mocks/providers");
  return createMinimalWebLLMProvider();
});

import { useConversationList } from "./hooks/useConversationList";
import { useConversations } from "@/providers/ConversationsProvider";

describe("ConversationList", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useConversationList).mockReturnValue(mockUseConversationList);
    vi.mocked(useConversations).mockReturnValue({
      createFolder: vi.fn(),
    } as unknown as ReturnType<typeof useConversations>);
  });

  it("renders search bar", () => {
    render(<ConversationList />);

    expect(screen.getByPlaceholderText(/search conversations/i)).toBeInTheDocument();
  });

  it("renders new chat button", () => {
    render(<ConversationList />);

    expect(screen.getByRole("button", { name: /new chat/i })).toBeInTheDocument();
  });

  it("renders new folder button", () => {
    render(<ConversationList />);

    expect(screen.getByRole("button", { name: /create new folder/i })).toBeInTheDocument();
  });

  it("shows empty state when no conversations", () => {
    render(<ConversationList />);

    expect(screen.getByText(/no conversations yet/i)).toBeInTheDocument();
  });

  it("shows search empty state when searching with no results", () => {
    vi.mocked(useConversationList).mockReturnValue({
      ...mockUseConversationList,
      searchTerm: "nonexistent",
    });

    render(<ConversationList />);

    expect(screen.getByText(/no conversations found matching your search/i)).toBeInTheDocument();
    expect(screen.getByText(/try searching with different keywords/i)).toBeInTheDocument();
  });

  it("renders favourites section when pinned conversations exist", () => {
    const pinnedConversations = [
      createMockConversation({ title: "Pinned Chat", pinned: true }),
    ];

    vi.mocked(useConversationList).mockReturnValue({
      ...mockUseConversationList,
      pinnedConversations,
    });

    render(<ConversationList />);

    expect(screen.getByText("Favourites")).toBeInTheDocument();
    expect(screen.getByText("Pinned Chat")).toBeInTheDocument();
  });

  it("renders recent section when unfolded conversations exist", () => {
    const unfoldedConversations = [
      createMockConversation({ title: "Recent Chat 1" }),
      createMockConversation({ title: "Recent Chat 2" }),
    ];

    vi.mocked(useConversationList).mockReturnValue({
      ...mockUseConversationList,
      unfoldedConversations,
    });

    render(<ConversationList />);

    expect(screen.getByText("Recent")).toBeInTheDocument();
    expect(screen.getByText("Recent Chat 1")).toBeInTheDocument();
    expect(screen.getByText("Recent Chat 2")).toBeInTheDocument();
  });

  it("calls handleNewChat when new chat button is clicked", async () => {
    const handleNewChat = vi.fn();
    vi.mocked(useConversationList).mockReturnValue({
      ...mockUseConversationList,
      handleNewChat,
    });

    render(<ConversationList />);

    await user.click(screen.getByRole("button", { name: /new chat/i }));

    expect(handleNewChat).toHaveBeenCalled();
  });

  it("calls setSearchTerm when typing in search bar", async () => {
    const setSearchTerm = vi.fn();
    vi.mocked(useConversationList).mockReturnValue({
      ...mockUseConversationList,
      setSearchTerm,
    });

    render(<ConversationList />);

    const searchInput = screen.getByPlaceholderText(/search conversations/i);
    await user.type(searchInput, "test");

    expect(setSearchTerm).toHaveBeenCalled();
  });

  it("opens folder dialog when new folder button is clicked", async () => {
    render(<ConversationList />);

    await user.click(screen.getByRole("button", { name: /create new folder/i }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders folders when foldersWithConversations exist", () => {
    const folder = {
      ...createMockFolder({ id: "folder-1", name: "Work Projects" }),
      conversations: [createMockConversation({ title: "Work Chat" })],
    };

    vi.mocked(useConversationList).mockReturnValue({
      ...mockUseConversationList,
      foldersWithConversations: [folder],
    });

    render(<ConversationList />);

    expect(screen.getByText("Work Projects")).toBeInTheDocument();
  });
});

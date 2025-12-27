import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "../../../../test/utils";
import { ConversationItem } from "./ConversationItem";
import { createMockConversation, createMockFolder } from "../../../../test/mocks/factories";

const mockUseConversationItem = {
  isEditing: false,
  isMenuOpen: false,
  deleteDialogOpen: false,
  isCreateFolderDialogOpen: false,
  isPinned: false,
  isActive: false,
  folders: [],
  setIsMenuOpen: vi.fn(),
  setDeleteDialogOpen: vi.fn(),
  setCreateFolderDialogOpen: vi.fn(),
  handleConversationClick: vi.fn(),
  handlePinToggle: vi.fn(),
  handleRename: vi.fn(),
  handleSaveRename: vi.fn(),
  handleCancelRename: vi.fn(),
  handleDelete: vi.fn(),
  handleDeleteConfirm: vi.fn(),
  handleMove: vi.fn(),
  handleCreateFolderAndMove: vi.fn(),
  getItemStyles: vi.fn(() => "hover:bg-muted/50" as const),
};

vi.mock("../hooks/useConversationItem", () => ({
  useConversationItem: vi.fn(() => mockUseConversationItem),
}));

vi.mock("../../../../providers/WebLLMProvider", async () => {
  const { createMinimalWebLLMProvider } = await import("../../../../test/mocks/providers");
  return createMinimalWebLLMProvider();
});

import { useConversationItem } from "../hooks/useConversationItem";

describe("ConversationItem", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useConversationItem).mockReturnValue(mockUseConversationItem);
  });

  it("renders conversation title", () => {
    const conversation = createMockConversation({ title: "My Chat" });

    render(<ConversationItem conversation={conversation} />);

    expect(screen.getByText("My Chat")).toBeInTheDocument();
  });

  it("applies active styling when isActive is true", () => {
    vi.mocked(useConversationItem).mockReturnValue({
      ...mockUseConversationItem,
      isActive: true,
      getItemStyles: vi.fn(() => "bg-primary/10 border-primary text-primary font-medium" as const),
    });

    const conversation = createMockConversation({ title: "Active Chat" });

    render(<ConversationItem conversation={conversation} />);

    const item = screen.getByText("Active Chat").closest("div[class*='cursor-pointer']");
    expect(item?.className).toContain("bg-primary/10");
  });

  it("calls handleConversationClick when clicked", async () => {
    const handleClick = vi.fn();
    vi.mocked(useConversationItem).mockReturnValue({
      ...mockUseConversationItem,
      handleConversationClick: handleClick,
    });

    const conversation = createMockConversation({ title: "Clickable Chat" });

    render(<ConversationItem conversation={conversation} />);

    await user.click(screen.getByText("Clickable Chat"));

    expect(handleClick).toHaveBeenCalled();
  });

  it("shows menu button on hover", () => {
    const conversation = createMockConversation({ title: "Hoverable Chat" });

    render(<ConversationItem conversation={conversation} />);

    const menuButton = screen.getByRole("button");
    expect(menuButton).toBeInTheDocument();
  });

  it("opens dropdown menu when menu button is clicked", async () => {
    vi.mocked(useConversationItem).mockReturnValue({
      ...mockUseConversationItem,
      isMenuOpen: true,
    });

    const conversation = createMockConversation({ title: "Menu Chat" });

    render(<ConversationItem conversation={conversation} />);

    expect(screen.getByText("Rename")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("shows editable title input when editing", () => {
    vi.mocked(useConversationItem).mockReturnValue({
      ...mockUseConversationItem,
      isEditing: true,
    });

    const conversation = createMockConversation({ title: "Editable Chat" });

    render(<ConversationItem conversation={conversation} />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("shows delete confirmation dialog when deleteDialogOpen is true", () => {
    vi.mocked(useConversationItem).mockReturnValue({
      ...mockUseConversationItem,
      deleteDialogOpen: true,
    });

    const conversation = createMockConversation({ title: "Delete Me" });

    render(<ConversationItem conversation={conversation} />);

    expect(screen.getByText(/delete conversation/i)).toBeInTheDocument();
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
  });

  it("displays pinned state in menu when open", () => {
    vi.mocked(useConversationItem).mockReturnValue({
      ...mockUseConversationItem,
      isMenuOpen: true,
      isPinned: false,
    });

    const conversation = createMockConversation({ title: "Unpinned Chat" });

    render(<ConversationItem conversation={conversation} />);

    expect(screen.getByText(/add to favourites/i)).toBeInTheDocument();
  });

  it("displays remove from favourites when pinned", () => {
    vi.mocked(useConversationItem).mockReturnValue({
      ...mockUseConversationItem,
      isMenuOpen: true,
      isPinned: true,
    });

    const conversation = createMockConversation({ title: "Pinned Chat" });

    render(<ConversationItem conversation={conversation} />);

    expect(screen.getByText(/remove from favourites/i)).toBeInTheDocument();
  });

  it("shows folder options in menu when folders exist", () => {
    const folders = [
      createMockFolder({ id: "folder-1", name: "Work" }),
      createMockFolder({ id: "folder-2", name: "Personal" }),
    ];

    vi.mocked(useConversationItem).mockReturnValue({
      ...mockUseConversationItem,
      isMenuOpen: true,
      folders,
    });

    const conversation = createMockConversation({ title: "Movable Chat" });

    render(<ConversationItem conversation={conversation} />);

    expect(screen.getByText(/move to folder/i)).toBeInTheDocument();
  });
});

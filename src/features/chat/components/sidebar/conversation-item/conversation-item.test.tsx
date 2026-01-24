import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { render } from "@/testing/utils";
import { ConversationItem } from "./conversation-item";
import {
  createMockConversation,
  createMockFolder,
  createMockConversationItemHook,
} from "@/testing/mocks/modules";

const mockUseConversationItem = createMockConversationItemHook();

vi.mock("./use-conversation-item", () => ({
  useConversationItem: vi.fn(() => mockUseConversationItem),
}));

vi.mock("@/app/providers/web-llm-provider", async () => {
  const { createMinimalWebLLMProvider } = await import("@/testing/mocks/providers");
  return createMinimalWebLLMProvider();
});

import { useConversationItem } from "./use-conversation-item";

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
    vi.mocked(useConversationItem).mockReturnValue(
      createMockConversationItemHook({
        isActive: true,
        getItemStyles: () => "bg-primary/10 border-primary text-primary font-medium",
      })
    );

    const conversation = createMockConversation({ title: "Active Chat" });

    render(<ConversationItem conversation={conversation} />);

    const item = screen.getByText("Active Chat").closest("div[class*='cursor-pointer']");
    expect(item?.className).toContain("bg-primary/10");
  });

  it("calls handleConversationClick when clicked", async () => {
    const handleClick = vi.fn();
    vi.mocked(useConversationItem).mockReturnValue(
      createMockConversationItemHook({ handleConversationClick: handleClick })
    );

    const conversation = createMockConversation({ title: "Clickable Chat" });

    render(<ConversationItem conversation={conversation} />);

    await user.click(screen.getByText("Clickable Chat"));

    expect(handleClick).toHaveBeenCalled();
  });

  it("shows menu button on hover", () => {
    const conversation = createMockConversation({ title: "Hoverable Chat" });

    render(<ConversationItem conversation={conversation} />);

    const menuButton = screen.getByRole("button", { name: /actions for/i });
    expect(menuButton).toBeInTheDocument();
  });

  it("opens dropdown menu when menu button is clicked", async () => {
    vi.mocked(useConversationItem).mockReturnValue(
      createMockConversationItemHook({ isMenuOpen: true })
    );

    const conversation = createMockConversation({ title: "Menu Chat" });

    render(<ConversationItem conversation={conversation} />);

    expect(screen.getByText("Rename")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
  });

  it("shows editable title input when editing", () => {
    vi.mocked(useConversationItem).mockReturnValue(
      createMockConversationItemHook({ isEditing: true })
    );

    const conversation = createMockConversation({ title: "Editable Chat" });

    render(<ConversationItem conversation={conversation} />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("shows delete confirmation dialog when deleteDialogOpen is true", () => {
    vi.mocked(useConversationItem).mockReturnValue(
      createMockConversationItemHook({ deleteDialogOpen: true })
    );

    const conversation = createMockConversation({ title: "Delete Me" });

    render(<ConversationItem conversation={conversation} />);

    expect(screen.getByText(/delete conversation/i)).toBeInTheDocument();
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
  });

  it("displays pinned state in menu when open", () => {
    vi.mocked(useConversationItem).mockReturnValue(
      createMockConversationItemHook({ isMenuOpen: true, isPinned: false })
    );

    const conversation = createMockConversation({ title: "Unpinned Chat" });

    render(<ConversationItem conversation={conversation} />);

    expect(screen.getByText(/add to favourites/i)).toBeInTheDocument();
  });

  it("displays remove from favourites when pinned", () => {
    vi.mocked(useConversationItem).mockReturnValue(
      createMockConversationItemHook({ isMenuOpen: true, isPinned: true })
    );

    const conversation = createMockConversation({ title: "Pinned Chat" });

    render(<ConversationItem conversation={conversation} />);

    expect(screen.getByText(/remove from favourites/i)).toBeInTheDocument();
  });

  it("shows folder options in menu when folders exist", () => {
    const folders = [
      createMockFolder({ id: "folder-1", name: "Work" }),
      createMockFolder({ id: "folder-2", name: "Personal" }),
    ];

    vi.mocked(useConversationItem).mockReturnValue(
      createMockConversationItemHook({ isMenuOpen: true, folders })
    );

    const conversation = createMockConversation({ title: "Movable Chat" });

    render(<ConversationItem conversation={conversation} />);

    expect(screen.getByText(/move to folder/i)).toBeInTheDocument();
  });
});

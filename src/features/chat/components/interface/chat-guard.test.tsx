import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ChatGuard } from "./chat-guard";
import { useActiveConversation } from "@/features/chat/hooks/use-active-conversation";
import { clearTestDatabase, seedConversationWithMessages } from "@/testing/db-helpers";
import { mockNavigate, mockToast } from "@/testing/mocks/modules";

const { activeId } = vi.hoisted(() => ({
  activeId: { current: undefined as string | undefined },
}));

vi.mock("@/hooks/use-conversation-id", () => ({
  useConversationId: () => activeId.current,
}));

function ConversationProbe() {
  const { conversation, messages } = useActiveConversation();

  return (
    <div>
      <p>title: {conversation?.title ?? "none"}</p>
      <p>messages: {messages.length}</p>
    </div>
  );
}

function renderGuard() {
  return render(
    <MemoryRouter>
      <ChatGuard>
        <ConversationProbe />
      </ChatGuard>
    </MemoryRouter>
  );
}

describe("ChatGuard", () => {
  beforeEach(async () => {
    await clearTestDatabase();
    activeId.current = undefined;
    vi.clearAllMocks();
  });

  it("exposes the routed conversation and its messages to children", async () => {
    const conversation = await seedConversationWithMessages({ title: "Seeded Chat" }, 3);
    activeId.current = conversation.id;

    renderGuard();

    await waitFor(() => {
      expect(screen.getByText("title: Seeded Chat")).toBeInTheDocument();
    });

    expect(screen.getByText("messages: 3")).toBeInTheDocument();
    expect(mockToast.error).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("withholds children and redirects when the routed conversation has no row", async () => {
    activeId.current = "missing-conversation";

    renderGuard();

    expect(screen.queryByText(/^title:/)).not.toBeInTheDocument();

    await waitFor(() => {
      expect(mockToast.error).toHaveBeenCalledWith("Conversation not found", {
        description: "The requested conversation does not exist.",
        duration: 4000,
      });
    });

    expect(mockNavigate).toHaveBeenCalledWith("/chat", { replace: true });
    expect(screen.queryByText(/^title:/)).not.toBeInTheDocument();
  });

  it("renders children with no active conversation when the route has no id", () => {
    renderGuard();

    expect(screen.getByText("title: none")).toBeInTheDocument();
    expect(screen.getByText("messages: 0")).toBeInTheDocument();

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});

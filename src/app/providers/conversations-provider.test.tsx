import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { ConversationsProvider, useConversations } from "./conversations-provider";
import { db } from "@/lib/db";
import { clearTestDatabase, seedConversation, seedFolder } from "@/testing/db-helpers";
import { createMockMessage } from "@/testing/mocks/factories";

// Type-safe helper to access context after it's been verified as defined
function assertContext(context: ReturnType<typeof useConversations> | undefined): ReturnType<typeof useConversations> {
  if (!context) throw new Error("Context not initialized - ensure waitFor check passed");
  return context;
}

function TestComponent({ onReady }: { onReady?: (ctx: ReturnType<typeof useConversations>) => void }) {
  const ctx = useConversations();
  if (onReady) onReady(ctx);
  return (
    <div>
      <span data-testid="count">{ctx.conversations.length}</span>
      <span data-testid="folders">{ctx.folders.length}</span>
    </div>
  );
}

describe("ConversationsProvider", () => {
  beforeEach(async () => {
    await clearTestDatabase();
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("provides empty conversations list initially", async () => {
      render(
        <ConversationsProvider>
          <TestComponent />
        </ConversationsProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("count").textContent).toBe("0");
      });
    });

    it("loads existing conversations from database", async () => {
      await seedConversation({ title: "Test 1" });
      await seedConversation({ title: "Test 2" });

      render(
        <ConversationsProvider>
          <TestComponent />
        </ConversationsProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("count").textContent).toBe("2");
      });
    });
  });

  describe("createConversation", () => {
    it("creates conversation with first message", async () => {
      let context: ReturnType<typeof useConversations> | undefined;

      render(
        <ConversationsProvider>
          <TestComponent onReady={(ctx) => { context = ctx; }} />
        </ConversationsProvider>
      );

      await waitFor(() => {
        expect(context).toBeDefined();
      });

      let conversationId: string | null = null;
      await act(async () => {
        conversationId = await assertContext(context).createConversation("New Chat", "Hello!");
      });

      await waitFor(() => {
        expect(conversationId).toBeTruthy();
      });

      const saved = await db.conversations.get(conversationId!);
      expect(saved?.title).toBe("New Chat");
      expect(saved?.messages).toHaveLength(1);
      expect(saved?.messages[0].content).toBe("Hello!");
      expect(saved?.messages[0].role).toBe("user");
    });

    it("returns null on database error", async () => {
      let context: ReturnType<typeof useConversations> | undefined;

      render(
        <ConversationsProvider>
          <TestComponent onReady={(ctx) => { context = ctx; }} />
        </ConversationsProvider>
      );

      await waitFor(() => {
        expect(context).toBeDefined();
      });

      vi.spyOn(db.conversations, "add").mockRejectedValueOnce(new Error("DB Error"));

      let result: string | null = null;
      await act(async () => {
        result = await assertContext(context).createConversation("Test", "Content");
      });

      expect(result).toBeNull();
    });
  });

  describe("createEmptyConversation", () => {
    it("creates conversation without messages", async () => {
      let context: ReturnType<typeof useConversations> | undefined;

      render(
        <ConversationsProvider>
          <TestComponent onReady={(ctx) => { context = ctx; }} />
        </ConversationsProvider>
      );

      await waitFor(() => {
        expect(context).toBeDefined();
      });

      let conversationId: string | null = null;
      await act(async () => {
        conversationId = await assertContext(context).createEmptyConversation("Empty Chat");
      });

      await waitFor(() => {
        expect(conversationId).toBeTruthy();
      });

      const saved = await db.conversations.get(conversationId!);
      expect(saved?.title).toBe("Empty Chat");
      expect(saved?.messages).toHaveLength(0);
    });

    it("creates conversation with folderId", async () => {
      const folder = await seedFolder({ name: "Work" });
      let context: ReturnType<typeof useConversations> | undefined;

      render(
        <ConversationsProvider>
          <TestComponent onReady={(ctx) => { context = ctx; }} />
        </ConversationsProvider>
      );

      await waitFor(() => {
        expect(context).toBeDefined();
      });

      let conversationId: string | null = null;
      await act(async () => {
        conversationId = await assertContext(context).createEmptyConversation("In Folder", folder.id);
      });

      await waitFor(() => {
        expect(conversationId).toBeTruthy();
      });

      const saved = await db.conversations.get(conversationId!);
      expect(saved?.folderId).toBe(folder.id);
    });
  });

  describe("addMessage", () => {
    it("adds message to existing conversation", async () => {
      const conversation = await seedConversation({ title: "Test" });
      let context: ReturnType<typeof useConversations> | undefined;

      render(
        <ConversationsProvider>
          <TestComponent onReady={(ctx) => { context = ctx; }} />
        </ConversationsProvider>
      );

      await waitFor(() => {
        expect(context).toBeDefined();
      });

      await act(async () => {
        await assertContext(context).addMessage(conversation.id, { role: "user", content: "New message" });
      });

      await waitFor(async () => {
        const updated = await db.conversations.get(conversation.id);
        expect(updated?.messages).toHaveLength(1);
      });

      const updated = await db.conversations.get(conversation.id);
      expect(updated?.messages[0].content).toBe("New message");
    });

    it("updates conversation timestamp", async () => {
      const oldDate = new Date(2020, 0, 1);
      const conversation = await seedConversation({ updatedAt: oldDate });
      let context: ReturnType<typeof useConversations> | undefined;

      render(
        <ConversationsProvider>
          <TestComponent onReady={(ctx) => { context = ctx; }} />
        </ConversationsProvider>
      );

      await waitFor(() => {
        expect(context).toBeDefined();
      });

      await act(async () => {
        await assertContext(context).addMessage(conversation.id, { role: "user", content: "Test" });
      });

      await waitFor(async () => {
        const updated = await db.conversations.get(conversation.id);
        expect(updated?.updatedAt.getTime()).toBeGreaterThan(oldDate.getTime());
      });
    });
  });

  describe("updateMessage", () => {
    it("updates message content", async () => {
      const message = createMockMessage({ content: "Original" });
      const conversation = await seedConversation({ messages: [message] });
      let context: ReturnType<typeof useConversations> | undefined;

      render(
        <ConversationsProvider>
          <TestComponent onReady={(ctx) => { context = ctx; }} />
        </ConversationsProvider>
      );

      await waitFor(() => {
        expect(context).toBeDefined();
      });

      await act(async () => {
        await assertContext(context).updateMessage(conversation.id, message.id, "Updated content");
      });

      await waitFor(async () => {
        const updated = await db.conversations.get(conversation.id);
        expect(updated?.messages[0].content).toBe("Updated content");
      });
    });

    it("does not update if content is same", async () => {
      const message = createMockMessage({ content: "Same" });
      const oldDate = new Date(2020, 0, 1);
      const conversation = await seedConversation({ messages: [message], updatedAt: oldDate });
      let context: ReturnType<typeof useConversations> | undefined;

      render(
        <ConversationsProvider>
          <TestComponent onReady={(ctx) => { context = ctx; }} />
        </ConversationsProvider>
      );

      await waitFor(() => {
        expect(context).toBeDefined();
      });

      await act(async () => {
        await assertContext(context).updateMessage(conversation.id, message.id, "Same");
      });

      await waitFor(async () => {
        const updated = await db.conversations.get(conversation.id);
        expect(updated?.updatedAt.getTime()).toBe(oldDate.getTime());
      });
    });
  });

  describe("deleteConversation", () => {
    it("removes conversation from database", async () => {
      const conversation = await seedConversation();
      let context: ReturnType<typeof useConversations> | undefined;

      render(
        <ConversationsProvider>
          <TestComponent onReady={(ctx) => { context = ctx; }} />
        </ConversationsProvider>
      );

      await waitFor(() => {
        expect(context).toBeDefined();
      });

      await act(async () => {
        await assertContext(context).deleteConversation(conversation.id);
      });

      const deleted = await db.conversations.get(conversation.id);
      expect(deleted).toBeUndefined();
    });
  });

  describe("togglePinConversation", () => {
    it("pins unpinned conversation", async () => {
      const conversation = await seedConversation({ pinned: false });
      let context: ReturnType<typeof useConversations> | undefined;

      render(
        <ConversationsProvider>
          <TestComponent onReady={(ctx) => { context = ctx; }} />
        </ConversationsProvider>
      );

      await waitFor(() => {
        expect(context).toBeDefined();
      });

      await act(async () => {
        await assertContext(context).togglePinConversation(conversation.id);
      });

      await waitFor(async () => {
        const updated = await db.conversations.get(conversation.id);
        expect(updated?.pinned).toBe(true);
      });
    });

    it("unpins pinned conversation", async () => {
      const conversation = await seedConversation({ pinned: true });
      let context: ReturnType<typeof useConversations> | undefined;

      render(
        <ConversationsProvider>
          <TestComponent onReady={(ctx) => { context = ctx; }} />
        </ConversationsProvider>
      );

      await waitFor(() => {
        expect(context).toBeDefined();
      });

      await act(async () => {
        await assertContext(context).togglePinConversation(conversation.id);
      });

      await waitFor(async () => {
        const updated = await db.conversations.get(conversation.id);
        expect(updated?.pinned).toBe(false);
      });
    });
  });

  describe("sorting", () => {
    it("sorts pinned conversations first", async () => {
      await seedConversation({ title: "Unpinned", pinned: false, updatedAt: new Date(2024, 0, 2) });
      await seedConversation({ title: "Pinned", pinned: true, updatedAt: new Date(2024, 0, 1) });

      let context: ReturnType<typeof useConversations> | undefined;

      render(
        <ConversationsProvider>
          <TestComponent onReady={(ctx) => { context = ctx; }} />
        </ConversationsProvider>
      );

      await waitFor(() => {
        expect(context?.conversations.length).toBe(2);
      });

      expect(context!.conversations[0].title).toBe("Pinned");
      expect(context!.conversations[1].title).toBe("Unpinned");
    });
  });

  describe("updateConversationTitle", () => {
    it("updates title", async () => {
      const conversation = await seedConversation({ title: "Old Title" });
      let context: ReturnType<typeof useConversations> | undefined;

      render(
        <ConversationsProvider>
          <TestComponent onReady={(ctx) => { context = ctx; }} />
        </ConversationsProvider>
      );

      await waitFor(() => {
        expect(context).toBeDefined();
      });

      await act(async () => {
        await assertContext(context).updateConversationTitle(conversation.id, "New Title");
      });

      await waitFor(async () => {
        const updated = await db.conversations.get(conversation.id);
        expect(updated?.title).toBe("New Title");
      });
    });
  });

  describe("folder operations", () => {
    it("creates folder", async () => {
      let context: ReturnType<typeof useConversations> | undefined;

      render(
        <ConversationsProvider>
          <TestComponent onReady={(ctx) => { context = ctx; }} />
        </ConversationsProvider>
      );

      await waitFor(() => {
        expect(context).toBeDefined();
      });

      let folderId: string | null = null;
      await act(async () => {
        folderId = await assertContext(context).createFolder("New Folder");
      });

      await waitFor(() => {
        expect(folderId).toBeTruthy();
      });

      const folder = await db.folders.get(folderId!);
      expect(folder?.name).toBe("New Folder");
    });

    it("deletes folder and unassigns conversations", async () => {
      const folder = await seedFolder({ name: "To Delete" });
      await seedConversation({ title: "In Folder", folderId: folder.id });
      let context: ReturnType<typeof useConversations> | undefined;

      render(
        <ConversationsProvider>
          <TestComponent onReady={(ctx) => { context = ctx; }} />
        </ConversationsProvider>
      );

      await waitFor(() => {
        expect(context).toBeDefined();
      });

      await act(async () => {
        await assertContext(context).deleteFolder(folder.id);
      });

      await waitFor(async () => {
        const deletedFolder = await db.folders.get(folder.id);
        expect(deletedFolder).toBeUndefined();
      });

      const conversations = await db.conversations.toArray();
      expect(conversations[0].folderId).toBeUndefined();
    });

    it("updates folder name", async () => {
      const folder = await seedFolder({ name: "Old Name" });
      let context: ReturnType<typeof useConversations> | undefined;

      render(
        <ConversationsProvider>
          <TestComponent onReady={(ctx) => { context = ctx; }} />
        </ConversationsProvider>
      );

      await waitFor(() => {
        expect(context).toBeDefined();
      });

      await act(async () => {
        await assertContext(context).updateFolderName(folder.id, "New Name");
      });

      await waitFor(async () => {
        const updated = await db.folders.get(folder.id);
        expect(updated?.name).toBe("New Name");
      });
    });

    it("moves conversation to folder", async () => {
      const folder = await seedFolder();
      const conversation = await seedConversation();
      let context: ReturnType<typeof useConversations> | undefined;

      render(
        <ConversationsProvider>
          <TestComponent onReady={(ctx) => { context = ctx; }} />
        </ConversationsProvider>
      );

      await waitFor(() => {
        expect(context).toBeDefined();
      });

      await act(async () => {
        await assertContext(context).moveConversationToFolder(conversation.id, folder.id);
      });

      await waitFor(async () => {
        const updated = await db.conversations.get(conversation.id);
        expect(updated?.folderId).toBe(folder.id);
      });
    });

    it("removes conversation from folder", async () => {
      const folder = await seedFolder();
      const conversation = await seedConversation({ folderId: folder.id });
      let context: ReturnType<typeof useConversations> | undefined;

      render(
        <ConversationsProvider>
          <TestComponent onReady={(ctx) => { context = ctx; }} />
        </ConversationsProvider>
      );

      await waitFor(() => {
        expect(context).toBeDefined();
      });

      await act(async () => {
        await assertContext(context).moveConversationToFolder(conversation.id, null);
      });

      await waitFor(async () => {
        const updated = await db.conversations.get(conversation.id);
        expect(updated?.folderId).toBeUndefined();
      });
    });
  });

  describe("useConversations hook", () => {
    it("throws when used outside provider", () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useConversations must be used within a ConversationsProvider");

      consoleSpy.mockRestore();
    });
  });
});

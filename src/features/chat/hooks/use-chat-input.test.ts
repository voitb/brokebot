import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { useChatInput } from "./use-chat-input";
import { ConversationsProvider } from "@/app/providers/conversations-provider";
import { useConversation } from "@/hooks/use-conversations";
import { ActiveConversationContext } from "./use-active-conversation";
import { db } from "@/lib/db";
import {
  clearTestDatabase,
  seedConversation,
  seedConversationWithMessages,
} from "@/testing/db-helpers";
import { mockNavigate, mockToast } from "@/testing/mocks/modules";
import { endGeneration, startGeneration } from "./active-generations";
import type { OpenRouterMessage, StreamResponse } from "@/features/chat/api/openrouter";

type RetryToastOptions = { action?: { onClick?: () => void } };

let conversationId: string | undefined;
let modelType: "online" | "local" = "online";
let streamChunks: StreamResponse[] = [];
let capturedPrompt: OpenRouterMessage[] = [];
let streamGate: { reached: () => void; blocked: Promise<void> } | null = null;

async function* streamMockedMessage(promptMessages: OpenRouterMessage[] = []) {
  capturedPrompt = promptMessages;
  if (streamGate) {
    streamGate.reached();
    await streamGate.blocked;
  }
  yield* streamChunks;
}

vi.mock("@/hooks/use-conversation-id", () => ({
  useConversationId: () => conversationId,
}));

vi.mock("@/app/providers/model-provider", async () => {
  const { createMockModelContext, createMockModel } = await import("@/testing/mocks/factories");
  return {
    useModel: () =>
      createMockModelContext({
        currentModel: createMockModel(modelType),
        streamMessage: streamMockedMessage,
      }),
  };
});

function ActiveConversation({ children }: { children: React.ReactNode }) {
  return React.createElement(
    ActiveConversationContext.Provider,
    { value: useConversation(conversationId) },
    children
  );
}

function wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(
    ConversationsProvider,
    null,
    React.createElement(
      MemoryRouter,
      null,
      React.createElement(ActiveConversation, null, children)
    )
  );
}

async function loadMessages(id: string) {
  const conversation = await db.conversations.get(id);
  return conversation?.messages ?? [];
}

async function flushLiveQuery() {
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

function openStreamGate() {
  let release!: () => void;
  let reached!: () => void;
  const hasStarted = new Promise<void>((resolve) => {
    reached = resolve;
  });
  streamGate = {
    reached,
    blocked: new Promise<void>((resolve) => {
      release = resolve;
    }),
  };
  return { hasStarted, release };
}

describe("useChatInput", () => {
  beforeEach(async () => {
    await clearTestDatabase();
    vi.clearAllMocks();
    conversationId = undefined;
    modelType = "online";
    capturedPrompt = [];
    streamGate = null;
    streamChunks = [{ content: "AI response", isComplete: true }];
  });

  it("guards an empty message", async () => {
    const existing = await seedConversation({ messages: [] });
    conversationId = existing.id;

    const { result } = renderHook(() => useChatInput(), { wrapper });

    await act(async () => {
      await result.current.handleMessageSubmit();
    });

    expect(await loadMessages(existing.id)).toHaveLength(0);
  });

  it("ignores a send when no conversation is open", async () => {
    const { result } = renderHook(() => useChatInput(), { wrapper });

    await act(async () => {
      await result.current.handleMessageSubmit("Hello");
    });

    expect(await db.conversations.count()).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("stores the user turn and the streamed reply", async () => {
    const existing = await seedConversation({ messages: [] });
    conversationId = existing.id;

    const { result } = renderHook(() => useChatInput(), { wrapper });

    act(() => result.current.setMessage("Hello"));

    await act(async () => {
      await result.current.handleMessageSubmit();
    });

    await waitFor(async () => {
      const messages = await loadMessages(existing.id);
      expect(messages.map(({ role, content }) => ({ role, content }))).toEqual([
        { role: "user", content: "Hello" },
        { role: "assistant", content: "AI response" },
      ]);
    });

    expect(result.current.message).toBe("");
  });

  it("titles an existing empty conversation from its first user message", async () => {
    const existing = await seedConversation({ title: "New Conversation", messages: [] });
    conversationId = existing.id;

    const { result } = renderHook(() => useChatInput(), { wrapper });

    await act(async () => {
      await result.current.handleMessageSubmit("What is Dexie?");
    });

    const storedConversation = await db.conversations.get(existing.id);

    expect(storedConversation?.title).toBe("What is Dexie?");
  });

  it("titles a first message with attachments from the typed caption", async () => {
    const existing = await seedConversation({ title: "New Conversation", messages: [] });
    conversationId = existing.id;

    const { result } = renderHook(() => useChatInput(), { wrapper });

    await act(async () => {
      await result.current.handleMessageSubmit(
        'Summarize this\n\n<file name="notes.txt">\nLorem ipsum\n</file>'
      );
    });

    const storedConversation = await db.conversations.get(existing.id);

    expect(storedConversation?.title).toBe("Summarize this");
  });

  it("titles an attachment-only first message with the file name", async () => {
    const existing = await seedConversation({ title: "New Conversation", messages: [] });
    conversationId = existing.id;

    const { result } = renderHook(() => useChatInput(), { wrapper });

    await act(async () => {
      await result.current.handleMessageSubmit('<file name="notes.txt">\nLorem ipsum\n</file>');
    });

    const storedConversation = await db.conversations.get(existing.id);

    expect(storedConversation?.title).toBe("notes.txt");
  });

  it("does not append a second user message on Retry", async () => {
    const existing = await seedConversation({ title: "New Conversation", messages: [] });
    conversationId = existing.id;
    streamChunks = [{ content: "", isComplete: true, error: "network failure" }];

    const { result } = renderHook(() => useChatInput(), { wrapper });

    await act(async () => {
      await result.current.handleMessageSubmit("Hello");
    });

    await waitFor(async () => {
      const messages = await loadMessages(existing.id);
      expect(messages.at(-1)?.content).toContain("[ERROR]:");
    });

    const lastErrorToastCall = mockToast.error.mock.calls.at(-1) ?? [];
    const toastOptions: RetryToastOptions | undefined = lastErrorToastCall[1];

    streamChunks = [{ content: "Recovered", isComplete: true }];

    await act(async () => {
      toastOptions?.action?.onClick?.();
    });

    await waitFor(async () => {
      const messages = await loadMessages(existing.id);
      expect(messages.at(-1)?.content).toBe("Recovered");
    });

    const storedMessages = await loadMessages(existing.id);

    expect(storedMessages.filter((message) => message.role === "user")).toHaveLength(1);
    expect(storedMessages.filter((message) => message.role === "assistant")).toHaveLength(1);
  });

  it("blames the local model rather than the API key when a local generation fails", async () => {
    const existing = await seedConversation({ messages: [] });
    conversationId = existing.id;
    modelType = "local";
    streamChunks = [{ content: "", isComplete: true, error: "WebGPU device lost" }];

    const { result } = renderHook(() => useChatInput(), { wrapper });

    await act(async () => {
      await result.current.handleMessageSubmit("Hello");
    });

    await waitFor(async () => {
      const messages = await loadMessages(existing.id);
      expect(messages.at(-1)?.content).toContain("reloading the local model");
    });
  });

  it("warns once when the reply was cut off at the token limit", async () => {
    const existing = await seedConversation({ messages: [] });
    conversationId = existing.id;
    streamChunks = [
      { content: "Half an answ", isComplete: true, isTruncated: true },
    ];

    const { result } = renderHook(() => useChatInput(), { wrapper });

    await act(async () => {
      await result.current.handleMessageSubmit("Hello");
    });

    expect(mockToast.info).toHaveBeenCalledExactlyOnceWith(
      "The reply hit the token limit and was cut off."
    );
    expect((await loadMessages(existing.id)).at(-1)?.content).toBe("Half an answ");
  });

  it("stays quiet when the reply finished on its own", async () => {
    const existing = await seedConversation({ messages: [] });
    conversationId = existing.id;

    const { result } = renderHook(() => useChatInput(), { wrapper });

    await act(async () => {
      await result.current.handleMessageSubmit("Hello");
    });

    expect(mockToast.info).not.toHaveBeenCalled();
  });

  it("refuses to regenerate while another conversation holds the local engine", async () => {
    const existing = await seedConversationWithMessages({}, 2);
    conversationId = existing.id;
    modelType = "local";
    const otherGeneration = new AbortController();

    const { result } = renderHook(() => useChatInput(), { wrapper });
    await flushLiveQuery();

    act(() => startGeneration("another-conversation", otherGeneration));

    await act(async () => {
      await result.current.regenerateLastResponse();
    });

    expect(capturedPrompt).toEqual([]);
    expect(mockToast.info).toHaveBeenCalledExactlyOnceWith(
      "Waiting for the reply in another conversation…"
    );

    act(() => endGeneration("another-conversation", otherGeneration));

    await act(async () => {
      await result.current.regenerateLastResponse();
    });

    expect(capturedPrompt).not.toEqual([]);
  });

  it("ignores regeneration when there is nothing to regenerate", async () => {
    const existing = await seedConversation({ messages: [] });
    conversationId = existing.id;

    const { result } = renderHook(() => useChatInput(), { wrapper });

    await act(async () => {
      await result.current.regenerateLastResponse();
    });

    expect(capturedPrompt).toEqual([]);
  });

  it("does not repeat the last user turn when regenerating", async () => {
    const existing = await seedConversation({
      messages: [
        {
          id: "message-1",
          role: "user",
          content: "First question",
          createdAt: new Date("2024-01-01T00:00:00.000Z"),
        },
        {
          id: "message-2",
          role: "assistant",
          content: "First answer",
          createdAt: new Date("2024-01-01T00:00:01.000Z"),
        },
        {
          id: "message-3",
          role: "user",
          content: "Second question",
          createdAt: new Date("2024-01-01T00:00:02.000Z"),
        },
        {
          id: "message-4",
          role: "assistant",
          content: "Second answer",
          createdAt: new Date("2024-01-01T00:00:03.000Z"),
        },
      ],
    });
    conversationId = existing.id;

    const { result } = renderHook(() => useChatInput(), { wrapper });

    await waitFor(async () => {
      await result.current.regenerateLastResponse();
      expect(capturedPrompt).not.toHaveLength(0);
    });

    const [systemEntry] = capturedPrompt;
    const entriesBeforeLastUserTurn = capturedPrompt.slice(0, -1);

    expect(capturedPrompt.at(-1)).toEqual({ role: "user", content: "Second question" });
    expect(
      entriesBeforeLastUserTurn.some((entry) => entry.content.includes("Second question"))
    ).toBe(false);
    expect(systemEntry.role).toBe("system");
    expect(systemEntry.content).toContain("First question");
  });

  it("still reports the conversation as generating after the chat view remounts, and blocks regeneration", async () => {
    const existing = await seedConversationWithMessages({}, 2);
    conversationId = existing.id;
    const { hasStarted, release } = openStreamGate();

    const firstInstance = renderHook(() => useChatInput(), { wrapper });
    let submitted!: Promise<void>;
    await act(async () => {
      submitted = firstInstance.result.current.handleMessageSubmit("Hello");
      await hasStarted;
    });
    expect(firstInstance.result.current.isGenerating).toBe(true);
    firstInstance.unmount();

    const remounted = renderHook(() => useChatInput(), { wrapper });
    await flushLiveQuery();
    expect(remounted.result.current.isGenerating).toBe(true);

    capturedPrompt = [];
    await act(async () => {
      await remounted.result.current.regenerateLastResponse();
    });
    expect(capturedPrompt).toEqual([]);

    await act(async () => {
      release();
      await submitted;
    });

    expect(remounted.result.current.isGenerating).toBe(false);
  });

  it("stops a generation started before the chat view remounted", async () => {
    const existing = await seedConversation({ messages: [] });
    conversationId = existing.id;
    const { hasStarted, release } = openStreamGate();

    const firstInstance = renderHook(() => useChatInput(), { wrapper });
    let submitted!: Promise<void>;
    await act(async () => {
      submitted = firstInstance.result.current.handleMessageSubmit("Hello");
      await hasStarted;
    });
    expect(firstInstance.result.current.isGenerating).toBe(true);
    firstInstance.unmount();

    const remounted = renderHook(() => useChatInput(), { wrapper });
    act(() => remounted.result.current.stopGeneration());

    await act(async () => {
      release();
      await submitted;
    });

    const messages = await loadMessages(existing.id);
    expect(messages.at(-1)?.content).toBe("");
    expect(remounted.result.current.isGenerating).toBe(false);
  });
});

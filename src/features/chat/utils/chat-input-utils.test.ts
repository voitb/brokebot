import { describe, it, expect } from "vitest";
import {
  buildConversationTitle,
  buildMessageWithFiles,
  buildPrompt,
  ERROR_MESSAGE_PREFIX,
  formatAttachedFiles,
  summarizeConversation,
  truncateTitle,
} from "./chat-input-utils";
import type { AttachedFile } from "./file-upload-utils";
import type { OpenRouterMessage } from "@/features/chat/api/openrouter";
import { mockToast } from "@/testing/mocks/modules";

function createAttachedFile(name: string, content: string): AttachedFile {
  return {
    id: name,
    file: new File([content], name, { type: "text/plain" }),
    type: "text",
    content,
  };
}

describe("summarizeConversation", () => {
  it("truncates and summarizes long conversations", () => {
    const messages: OpenRouterMessage[] = [
      { role: "system", content: "Base instructions" },
      { role: "user", content: "Old user message" },
      { role: "assistant", content: "Old assistant response" },
      { role: "user", content: "Recent message" },
      { role: "assistant", content: "Recent response" },
    ];

    const result = summarizeConversation(messages, 2);

    expect(result).toHaveLength(3);
    expect(result[0].role).toBe("system");
    expect(result[0].content).toContain("Base instructions");
    expect(result[0].content).toContain("Previous conversation summary");
    expect(result[1].content).toBe("Recent message");
    expect(result[2].content).toBe("Recent response");
  });
});

describe("truncateTitle", () => {
  it("truncates long titles to 50 characters with ellipsis", () => {
    expect(truncateTitle("A".repeat(100))).toBe("A".repeat(50) + "...");
    expect(truncateTitle("Short")).toBe("Short");
  });

  it("never splits an emoji in half", () => {
    const title = truncateTitle("a" + "\u{1F600}".repeat(60));
    expect(title).toBe("a" + "\u{1F600}".repeat(49) + "...");
    expect(title).not.toContain("\uFFFD");
  });
});

describe("buildConversationTitle", () => {
  it("titles from the typed caption, not the attached file markup", () => {
    const message = buildPromptlessMessage("Summarize this");
    expect(buildConversationTitle(message)).toBe("Summarize this");
  });

  it("falls back to the file name when only a file was sent", () => {
    expect(buildConversationTitle(buildPromptlessMessage(""))).toBe("notes.txt");
  });
});

function buildPromptlessMessage(caption: string): string {
  const fileBlock = formatAttachedFiles([createAttachedFile("notes.txt", "Lorem ipsum")]);
  return caption ? `${caption}\n\n${fileBlock}` : fileBlock;
}

describe("formatAttachedFiles", () => {
  it("keeps a matchable name when sanitising empties the file name", () => {
    expect(formatAttachedFiles([createAttachedFile("<>", "body")])).toContain(
      '<file name="attachment">'
    );
  });
});

describe("buildMessageWithFiles", () => {
  it("keeps every attachment that fits the per-message budget", () => {
    const files = [
      createAttachedFile("a.txt", "a".repeat(200_000)),
      createAttachedFile("b.txt", "b".repeat(200_000)),
    ];

    const { message } = buildMessageWithFiles("Read these", files);

    expect(message).toContain('<file name="a.txt">');
    expect(message).toContain('<file name="b.txt">');
    expect(mockToast.info).not.toHaveBeenCalled();
  });

  it("drops the attachments that overflow the per-message budget and says which", () => {
    const files = [
      createAttachedFile("old.txt", "o".repeat(200_000)),
      createAttachedFile("newer.txt", "n".repeat(200_000)),
      createAttachedFile("newest.txt", "x".repeat(200_000)),
    ];

    const { message, sent } = buildMessageWithFiles("Read these", files);

    expect(sent.map((file) => file.file.name)).toEqual(["newer.txt", "newest.txt"]);
    expect(message).not.toContain('<file name="old.txt">');
    expect(message).toContain('<file name="newer.txt">');
    expect(message).toContain('<file name="newest.txt">');
    expect(message.length).toBeLessThanOrEqual(400_000 + "Read these".length + 200);
    expect(mockToast.info).toHaveBeenCalledExactlyOnceWith(
      "Too much attached text for one message. Not sent: old.txt. They stay attached for your next message."
    );
  });
});

describe("buildPrompt", () => {
  const [userMessage, errorMessage, assistantMessage]: OpenRouterMessage[] = [
    { role: "user", content: "Hi" },
    { role: "assistant", content: `${ERROR_MESSAGE_PREFIX}boom` },
    { role: "assistant", content: "Hello" },
  ];

  it("builds an online prompt as a system context message plus the new user message", () => {
    const result = buildPrompt([userMessage, assistantMessage], "What next?", { mode: "online" });
    expect(result).toHaveLength(2);
    expect(result[0].role).toBe("system");
    expect(result[0].content).toContain("*** CONVERSATION HISTORY (FOR CONTEXT) ***");
    expect(result[0].content).toContain("User: Hi");
    expect(result[0].content).toContain("Assistant: Hello");
    expect(result[1]).toEqual({ role: "user", content: "What next?" });
  });

  it("omits error messages from the online history", () => {
    const result = buildPrompt([userMessage, errorMessage], "What next?", { mode: "online" });
    expect(result[0].content).toContain("User: Hi");
    expect(result[0].content).not.toContain("boom");
  });

  it("builds a local prompt as the rules, the history, then the new user message", () => {
    const messages = [userMessage, errorMessage, assistantMessage];
    const result = buildPrompt(messages, "What next?", { mode: "local" });
    expect(result).toHaveLength(4);
    expect(result[0].role).toBe("system");
    expect(result.slice(1).map((msg) => msg.content)).toEqual(["Hi", "Hello", "What next?"]);
  });

  it("drops the oldest online turns so the prompt cannot outgrow the online budget", () => {
    const history: OpenRouterMessage[] = Array.from({ length: 10 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `turn ${i} `.padEnd(60_000, "x"),
    }));

    const prompt = buildPrompt(history, "What next?", { mode: "online" });
    const promptLength = prompt.reduce((sum, msg) => sum + msg.content.length, 0);

    expect(promptLength).toBeLessThanOrEqual(400_000);
    expect(prompt[0].content).toContain("turn 9");
    expect(prompt[0].content).not.toContain("turn 0");
    expect(prompt.at(-1)).toEqual({ role: "user", content: "What next?" });
  });

  it("summarizes a local prompt longer than twelve turns", () => {
    const history: OpenRouterMessage[] = Array.from({ length: 20 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `turn ${i}`,
    }));
    const result = buildPrompt(history, "What next?", { mode: "local" });
    expect(result).toHaveLength(13);
    expect(result[0].content).toContain("Previous conversation summary");
    expect(result[result.length - 1].content).toBe("What next?");
    expect(result[0].content).toContain("turn 0");
  });
});

describe("summarizeConversation budget", () => {
  it("labels summarized turns by their real role when a turn is missing from the history", () => {
    const history: OpenRouterMessage[] = Array.from({ length: 14 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `turn ${i}`,
    })).filter((_, i) => i !== 1);

    const [systemEntry] = buildPrompt(history, "What next?", { mode: "local" });

    expect(systemEntry.content).toContain("User: turn 2");
    expect(systemEntry.content).not.toContain("Assistant: turn 2");
  });

  it("drops the oldest turns so a long local history cannot outgrow the context", () => {
    const history: OpenRouterMessage[] = Array.from({ length: 80 }, (_, i) => ({
      role: i % 2 === 0 ? ("user" as const) : ("assistant" as const),
      content: `turn ${i} `.padEnd(600, "x"),
    }));

    const prompt = buildPrompt(history, "What next?", { mode: "local" });
    const promptLength = prompt.reduce((sum, msg) => sum + msg.content.length, 0);

    expect(promptLength).toBeLessThanOrEqual(12_000);
    expect(prompt.at(-1)).toEqual({ role: "user", content: "What next?" });
  });

  it("keeps the new user message even when it alone exceeds the budget", () => {
    const prompt = buildPrompt([], "x".repeat(20_000), { mode: "local" });

    expect(prompt.at(-1)?.content).toHaveLength(20_000);
  });
});

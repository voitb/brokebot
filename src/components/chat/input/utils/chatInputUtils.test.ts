import { describe, it, expect } from "vitest";
import { summarizeConversation, buildPrompt } from "./chatInputUtils";
import type { OpenRouterMessage } from "../../../../lib/openrouter";

describe("chatInputUtils", () => {
  describe("summarizeConversation", () => {
    it("returns messages unchanged when under max limit", () => {
      const messages: OpenRouterMessage[] = [
        { role: "system", content: "You are helpful" },
        { role: "user", content: "Hello" },
        { role: "assistant", content: "Hi there" },
      ];

      const result = summarizeConversation(messages, 10);

      expect(result).toEqual(messages);
    });

    it("keeps system messages and recent user/assistant messages", () => {
      const messages: OpenRouterMessage[] = [
        { role: "system", content: "You are helpful" },
        { role: "user", content: "First question" },
        { role: "assistant", content: "First answer" },
        { role: "user", content: "Second question" },
        { role: "assistant", content: "Second answer" },
        { role: "user", content: "Third question" },
        { role: "assistant", content: "Third answer" },
      ];

      const result = summarizeConversation(messages, 2);

      expect(result).toHaveLength(3); // 1 system + 2 recent
      expect(result[0].role).toBe("system");
      // Last 2 messages are "Third question" and "Third answer"
      expect(result[1].content).toBe("Third question");
      expect(result[2].content).toBe("Third answer");
    });

    it("adds conversation summary to system message when truncating", () => {
      const messages: OpenRouterMessage[] = [
        { role: "system", content: "Base instructions" },
        { role: "user", content: "Old user message" },
        { role: "assistant", content: "Old assistant response" },
        { role: "user", content: "Recent message" },
        { role: "assistant", content: "Recent response" },
      ];

      const result = summarizeConversation(messages, 2);

      expect(result[0].content).toContain("Base instructions");
      expect(result[0].content).toContain("Previous conversation summary");
      expect(result[0].content).toContain("Old user message");
    });

    it("handles conversations with only user messages in older section", () => {
      const messages: OpenRouterMessage[] = [
        { role: "system", content: "System" },
        { role: "user", content: "Orphan user message" },
        { role: "user", content: "Recent user" },
        { role: "assistant", content: "Recent assistant" },
      ];

      const result = summarizeConversation(messages, 2);

      expect(result[0].content).toContain("Orphan user message");
    });

    it("preserves multiple system messages", () => {
      const messages: OpenRouterMessage[] = [
        { role: "system", content: "First system" },
        { role: "system", content: "Second system" },
        { role: "user", content: "Hello" },
      ];

      const result = summarizeConversation(messages, 10);

      const systemMessages = result.filter((m) => m.role === "system");
      expect(systemMessages).toHaveLength(2);
    });
  });

  describe("buildPrompt", () => {
    it("builds online prompt with contextual template", () => {
      const messages: OpenRouterMessage[] = [
        { role: "user", content: "Previous question" },
        { role: "assistant", content: "Previous answer" },
      ];

      const result = buildPrompt(messages, "New question", { mode: "online" });

      expect(result).toHaveLength(2);
      expect(result[0].role).toBe("system");
      expect(result[1].role).toBe("user");
      expect(result[1].content).toBe("New question");
    });

    it("builds local prompt with full message history", () => {
      const messages: OpenRouterMessage[] = [
        { role: "user", content: "Previous question" },
        { role: "assistant", content: "Previous answer" },
      ];

      const result = buildPrompt(messages, "New question", { mode: "local" });

      expect(result.length).toBeGreaterThanOrEqual(3);
      expect(result[0].role).toBe("system");
      expect(result[result.length - 1].content).toBe("New question");
    });

    it("filters out error messages starting with ERROR_MESSAGE_PREFIX", () => {
      const messages: OpenRouterMessage[] = [
        { role: "user", content: "Hello" },
        { role: "assistant", content: "[ERROR]: Error generating response. Please try again." },
        { role: "user", content: "Retry" },
      ];

      const result = buildPrompt(messages, "New message", { mode: "online" });

      const allContent = result.map((m) => m.content).join(" ");
      expect(allContent).not.toContain("[ERROR]:");
    });

    it("limits conversation history to last 10 messages for online", () => {
      const messages: OpenRouterMessage[] = Array.from({ length: 20 }, (_, i) => ({
        role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
        content: `Message ${i}`,
      }));

      const result = buildPrompt(messages, "Final", { mode: "online" });

      expect(result[0].content).toContain("Message 19");
      expect(result[0].content).not.toContain("Message 0");
    });

    it("applies summarization for long local conversations", () => {
      const messages: OpenRouterMessage[] = Array.from({ length: 20 }, (_, i) => ({
        role: (i % 2 === 0 ? "user" : "assistant") as "user" | "assistant",
        content: `Message ${i}`,
      }));

      const result = buildPrompt(messages, "Final", { mode: "local" });

      // Should be summarized to roughly 12 messages + system + new message
      expect(result.length).toBeLessThanOrEqual(15);
    });
  });
});

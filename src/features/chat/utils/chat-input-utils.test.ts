import { describe, it, expect } from "vitest";
import { summarizeConversation, truncateTitle } from "./chat-input-utils";
import type { OpenRouterMessage } from "@/features/chat/lib/openrouter";

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
});

import { describe, it, expect } from "vitest";
import { parseMessage } from "./parse-message";

describe("parseMessage", () => {
  describe("basic content", () => {
    it("returns content unchanged when no special tags", () => {
      const result = parseMessage("Hello world");
      expect(result.content).toBe("Hello world");
      expect(result.thinking).toBeUndefined();
      expect(result.attachments).toEqual([]);
    });

    it("handles undefined content", () => {
      const result = parseMessage(undefined);
      expect(result.content).toBe("");
      expect(result.attachments).toEqual([]);
    });

    it("handles empty string", () => {
      const result = parseMessage("");
      expect(result.content).toBe("");
    });
  });

  describe("think tags", () => {
    it("extracts complete think block", () => {
      const content = "<think>I need to analyze this</think>Here is my response";
      const result = parseMessage(content);

      expect(result.thinking).toBe("I need to analyze this");
      expect(result.content).toBe("Here is my response");
    });

    it("handles think block with newlines", () => {
      const content = "<think>\nFirst thought\nSecond thought\n</think>Response here";
      const result = parseMessage(content);

      expect(result.thinking).toBe("First thought\nSecond thought");
      expect(result.content).toBe("Response here");
    });

    it("handles incomplete think tag (still generating)", () => {
      const content = "<think>Still thinking about this...";
      const result = parseMessage(content);

      expect(result.thinking).toBe("Still thinking about this...");
      expect(result.content).toBe("");
    });

    it("handles only closing think tag", () => {
      const content = "</think>";
      const result = parseMessage(content);

      expect(result.thinking).toBeUndefined();
      expect(result.content).toBe("");
    });

    it("handles content after closing think tag", () => {
      const content = "</think>The actual response";
      const result = parseMessage(content);

      expect(result.content).toBe("The actual response");
    });
  });

  describe("alternative think patterns", () => {
    it("handles incomplete unicode think tag", () => {
      const content = "◁think▷Still processing...";
      const result = parseMessage(content);

      expect(result.thinking).toBe("Still processing...");
      expect(result.content).toBe("");
    });

    it("handles incomplete bracket think tag", () => {
      const content = "[think]Calculating...";
      const result = parseMessage(content);

      expect(result.thinking).toBe("Calculating...");
      expect(result.content).toBe("");
    });

    it("handles only closing unicode tag", () => {
      const content = "◁/think▷";
      const result = parseMessage(content);

      expect(result.content).toBe("");
    });

    it("handles only closing bracket tag", () => {
      const content = "[/think]";
      const result = parseMessage(content);

      expect(result.content).toBe("");
    });
  });

  describe("file attachments", () => {
    it("extracts single file attachment", () => {
      const content = '<file name="document.pdf">content here</file>Some text';
      const result = parseMessage(content);

      expect(result.attachments).toHaveLength(1);
      expect(result.attachments[0].name).toBe("document.pdf");
      expect(result.content).toBe("Some text");
    });

    it("extracts multiple file attachments", () => {
      const content = '<file name="file1.txt">a</file><file name="file2.md">b</file>Text';
      const result = parseMessage(content);

      expect(result.attachments).toHaveLength(2);
      expect(result.attachments[0].name).toBe("file1.txt");
      expect(result.attachments[1].name).toBe("file2.md");
      expect(result.content).toBe("Text");
    });

    it("handles file tags with think tags", () => {
      const content = '<think>processing</think><file name="data.csv">csv data</file>Analysis complete';
      const result = parseMessage(content);

      expect(result.thinking).toBe("processing");
      expect(result.attachments).toHaveLength(1);
      expect(result.attachments[0].name).toBe("data.csv");
      expect(result.content).toBe("Analysis complete");
    });
  });

  describe("edge cases", () => {
    it("handles think block in middle of content", () => {
      const content = "Before <think>middle thought</think> After";
      const result = parseMessage(content);

      expect(result.thinking).toBe("middle thought");
      expect(result.content).toBe("Before  After");
    });

    it("handles empty think block", () => {
      const content = "<think></think>Content after";
      const result = parseMessage(content);

      expect(result.thinking).toBe("");
      expect(result.content).toBe("Content after");
    });

    it("handles whitespace-only think block", () => {
      const content = "<think>   </think>Actual content";
      const result = parseMessage(content);

      expect(result.thinking).toBe("");
      expect(result.content).toBe("Actual content");
    });
  });
});

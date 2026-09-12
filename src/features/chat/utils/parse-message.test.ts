import { describe, it, expect } from "vitest";
import { parseMessage, escapeFileTagClosers } from "./parse-message";
import { buildMessageWithFiles } from "./chat-input-utils";
import type { AttachedFile } from "./file-upload-utils";

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

    it("handles incomplete think tag (streaming)", () => {
      const content = "<think>Still thinking about this...";
      const result = parseMessage(content);

      expect(result.thinking).toBe("Still thinking about this...");
      expect(result.content).toBe("");
    });

    it("handles content after closing think tag", () => {
      const content = "</think>The actual response";
      const result = parseMessage(content);

      expect(result.content).toBe("The actual response");
    });
  });

  describe("alternative think patterns", () => {
    it("handles unicode think tags", () => {
      const content = "◁think▷Still processing...";
      const result = parseMessage(content);

      expect(result.thinking).toBe("Still processing...");
      expect(result.content).toBe("");
    });

    it("handles bracket think tags", () => {
      const content = "[think]Calculating...";
      const result = parseMessage(content);

      expect(result.thinking).toBe("Calculating...");
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

    it("strips a file tag whose name was sanitised away", () => {
      const content = '<file name="">secret body</file>Check this';
      const result = parseMessage(content);

      expect(result.attachments).toHaveLength(1);
      expect(result.content).toBe("Check this");
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

  describe("file tag round trip", () => {
    function createAttachedFile(name: string, content: string): AttachedFile {
      return {
        id: crypto.randomUUID(),
        file: new File([content], name, { type: "text/plain" }),
        type: "text",
        content,
      };
    }

    it("round trips a body containing the closer", () => {
      const file = createAttachedFile("notes.md", 'before</file>after');
      const result = parseMessage(buildMessageWithFiles("Look at this", [file]).message);

      expect(result.attachments).toHaveLength(1);
      expect(result.attachments[0].name).toBe("notes.md");
      expect(result.content).toBe("Look at this");
      expect(result.content).not.toContain("before");
      expect(result.content).not.toContain("after");
    });

    it("keeps both attachments when the first body contains the closer", () => {
      const first = createAttachedFile("first.md", 'alpha</file>omega');
      const second = createAttachedFile("second.md", "beta");
      const result = parseMessage(buildMessageWithFiles("Check these", [first, second]).message);

      expect(result.attachments).toHaveLength(2);
      expect(result.attachments[0].name).toBe("first.md");
      expect(result.attachments[1].name).toBe("second.md");
      expect(result.content).toBe("Check these");
      expect(result.content).not.toContain("omega");
      expect(result.content).not.toContain("beta");
    });

    it("leaves a body without the closer untouched", () => {
      expect(escapeFileTagClosers("plain text")).toBe("plain text");

      const file = createAttachedFile("plain.txt", "plain text");
      const result = parseMessage(buildMessageWithFiles("Summary", [file]).message);

      expect(result.attachments).toHaveLength(1);
      expect(result.attachments[0].name).toBe("plain.txt");
      expect(result.content).toBe("Summary");
    });

    it("escapes every closer in the body", () => {
      const escaped = escapeFileTagClosers("</file></file>");

      expect(escaped).not.toContain("</file>");
      expect(escaped).toBe("<\\/file><\\/file>");
    });
  });

  describe("extractThinking option", () => {
    it("leaves a think fence intact for the user-message path when extraction is off", () => {
      const result = parseMessage("*think* what if we tried this", { extractThinking: false });

      expect(result.content).toBe("*think* what if we tried this");
      expect(result.thinking).toBeUndefined();
      expect(parseMessage("*think* what if we tried this").content).toBe("");
    });

    it("still strips file tags and returns attachments when extraction is off", () => {
      const content = 'my notes\n\n<file name="notes.txt">\nbody\n</file>';
      const result = parseMessage(content, { extractThinking: false });

      expect(result.attachments).toHaveLength(1);
      expect(result.attachments[0].name).toBe("notes.txt");
      expect(result.content).toBe("my notes");
      expect(result.content).not.toContain("body");
    });

    it("extracts thinking by default when the option is omitted", () => {
      const result = parseMessage("<think>reasoning</think>answer");

      expect(result.thinking).toBe("reasoning");
      expect(result.content).toBe("answer");
    });
  });
});

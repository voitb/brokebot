import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useMessageParser } from "./useMessageParser";

describe("useMessageParser", () => {
  describe("basic content", () => {
    it("returns content unchanged when no special tags", () => {
      const { result } = renderHook(() => useMessageParser("Hello world"));
      expect(result.current.content).toBe("Hello world");
      expect(result.current.thinking).toBeUndefined();
      expect(result.current.attachments).toEqual([]);
    });

    it("handles undefined content", () => {
      const { result } = renderHook(() => useMessageParser(undefined));
      expect(result.current.content).toBe("");
      expect(result.current.attachments).toEqual([]);
    });

    it("handles empty string", () => {
      const { result } = renderHook(() => useMessageParser(""));
      expect(result.current.content).toBe("");
    });
  });

  describe("think tags", () => {
    it("extracts complete think block", () => {
      const content = "<think>I need to analyze this</think>Here is my response";
      const { result } = renderHook(() => useMessageParser(content));

      expect(result.current.thinking).toBe("I need to analyze this");
      expect(result.current.content).toBe("Here is my response");
    });

    it("handles think block with newlines", () => {
      const content = "<think>\nFirst thought\nSecond thought\n</think>Response here";
      const { result } = renderHook(() => useMessageParser(content));

      expect(result.current.thinking).toBe("First thought\nSecond thought");
      expect(result.current.content).toBe("Response here");
    });

    it("handles incomplete think tag (still generating)", () => {
      const content = "<think>Still thinking about this...";
      const { result } = renderHook(() => useMessageParser(content));

      expect(result.current.thinking).toBe("Still thinking about this...");
      expect(result.current.content).toBe("");
    });

    it("handles only closing think tag", () => {
      const content = "</think>";
      const { result } = renderHook(() => useMessageParser(content));

      expect(result.current.thinking).toBeUndefined();
      expect(result.current.content).toBe("");
    });

    it("handles content after closing think tag", () => {
      const content = "</think>The actual response";
      const { result } = renderHook(() => useMessageParser(content));

      expect(result.current.content).toBe("The actual response");
    });
  });

  describe("alternative think patterns", () => {
    it("handles incomplete unicode think tag", () => {
      const content = "◁think▷Still processing...";
      const { result } = renderHook(() => useMessageParser(content));

      expect(result.current.thinking).toBe("Still processing...");
      expect(result.current.content).toBe("");
    });

    it("handles incomplete bracket think tag", () => {
      const content = "[think]Calculating...";
      const { result } = renderHook(() => useMessageParser(content));

      expect(result.current.thinking).toBe("Calculating...");
      expect(result.current.content).toBe("");
    });

    it("handles only closing unicode tag", () => {
      const content = "◁/think▷";
      const { result } = renderHook(() => useMessageParser(content));

      expect(result.current.content).toBe("");
    });

    it("handles only closing bracket tag", () => {
      const content = "[/think]";
      const { result } = renderHook(() => useMessageParser(content));

      expect(result.current.content).toBe("");
    });
  });

  describe("file attachments", () => {
    it("extracts single file attachment", () => {
      const content = '<file name="document.pdf">content here</file>Some text';
      const { result } = renderHook(() => useMessageParser(content));

      expect(result.current.attachments).toHaveLength(1);
      expect(result.current.attachments[0].name).toBe("document.pdf");
      expect(result.current.content).toBe("Some text");
    });

    it("extracts multiple file attachments", () => {
      const content = '<file name="file1.txt">a</file><file name="file2.md">b</file>Text';
      const { result } = renderHook(() => useMessageParser(content));

      expect(result.current.attachments).toHaveLength(2);
      expect(result.current.attachments[0].name).toBe("file1.txt");
      expect(result.current.attachments[1].name).toBe("file2.md");
      expect(result.current.content).toBe("Text");
    });

    it("handles file tags with think tags", () => {
      const content = '<think>processing</think><file name="data.csv">csv data</file>Analysis complete';
      const { result } = renderHook(() => useMessageParser(content));

      expect(result.current.thinking).toBe("processing");
      expect(result.current.attachments).toHaveLength(1);
      expect(result.current.attachments[0].name).toBe("data.csv");
      expect(result.current.content).toBe("Analysis complete");
    });
  });

  describe("edge cases", () => {
    it("handles think block in middle of content", () => {
      const content = "Before <think>middle thought</think> After";
      const { result } = renderHook(() => useMessageParser(content));

      expect(result.current.thinking).toBe("middle thought");
      expect(result.current.content).toBe("Before  After");
    });

    it("handles empty think block", () => {
      const content = "<think></think>Content after";
      const { result } = renderHook(() => useMessageParser(content));

      expect(result.current.thinking).toBe("");
      expect(result.current.content).toBe("Content after");
    });

    it("handles whitespace-only think block", () => {
      const content = "<think>   </think>Actual content";
      const { result } = renderHook(() => useMessageParser(content));

      expect(result.current.thinking).toBe("");
      expect(result.current.content).toBe("Actual content");
    });
  });
});

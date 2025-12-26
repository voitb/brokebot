import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTextareaAutoResize } from "./useTextareaAutoResize";
import { useRef } from "react";

describe("useTextareaAutoResize", () => {
  let mockTextarea: HTMLTextAreaElement;

  beforeEach(() => {
    mockTextarea = {
      style: {
        height: "",
        overflowY: "",
      },
      scrollHeight: 100,
    } as unknown as HTMLTextAreaElement;
  });

  describe("height adjustment", () => {
    it("sets height based on scrollHeight", () => {
      const { result } = renderHook(() => {
        const textareaRef = useRef<HTMLTextAreaElement>(mockTextarea);
        useTextareaAutoResize({
          textareaRef,
          message: "Hello",
          minHeight: 60,
          maxHeight: 200,
        });
        return textareaRef;
      });

      expect(mockTextarea.style.height).toBe("100px");
      expect(mockTextarea.style.overflowY).toBe("hidden");
    });

    it("respects minimum height constraint", () => {
      mockTextarea.scrollHeight = 30;

      renderHook(() => {
        const textareaRef = useRef<HTMLTextAreaElement>(mockTextarea);
        useTextareaAutoResize({
          textareaRef,
          message: "Hi",
          minHeight: 60,
          maxHeight: 200,
        });
        return textareaRef;
      });

      expect(mockTextarea.style.height).toBe("60px");
    });

    it("respects maximum height constraint", () => {
      mockTextarea.scrollHeight = 300;

      renderHook(() => {
        const textareaRef = useRef<HTMLTextAreaElement>(mockTextarea);
        useTextareaAutoResize({
          textareaRef,
          message: "Very long content...",
          minHeight: 60,
          maxHeight: 200,
        });
        return textareaRef;
      });

      expect(mockTextarea.style.height).toBe("200px");
    });

    it("enables scroll when content exceeds maxHeight", () => {
      mockTextarea.scrollHeight = 300;

      renderHook(() => {
        const textareaRef = useRef<HTMLTextAreaElement>(mockTextarea);
        useTextareaAutoResize({
          textareaRef,
          message: "Very long content...",
          minHeight: 60,
          maxHeight: 200,
        });
        return textareaRef;
      });

      expect(mockTextarea.style.overflowY).toBe("auto");
    });

    it("hides scroll when content fits within maxHeight", () => {
      mockTextarea.scrollHeight = 150;

      renderHook(() => {
        const textareaRef = useRef<HTMLTextAreaElement>(mockTextarea);
        useTextareaAutoResize({
          textareaRef,
          message: "Content that fits",
          minHeight: 60,
          maxHeight: 200,
        });
        return textareaRef;
      });

      expect(mockTextarea.style.overflowY).toBe("hidden");
    });
  });

  describe("default values", () => {
    it("uses default minHeight of 60", () => {
      mockTextarea.scrollHeight = 20;

      renderHook(() => {
        const textareaRef = useRef<HTMLTextAreaElement>(mockTextarea);
        useTextareaAutoResize({
          textareaRef,
          message: "Hi",
        });
        return textareaRef;
      });

      expect(mockTextarea.style.height).toBe("60px");
    });

    it("uses default maxHeight of 200", () => {
      mockTextarea.scrollHeight = 500;

      renderHook(() => {
        const textareaRef = useRef<HTMLTextAreaElement>(mockTextarea);
        useTextareaAutoResize({
          textareaRef,
          message: "Very long...",
        });
        return textareaRef;
      });

      expect(mockTextarea.style.height).toBe("200px");
    });
  });

  describe("null ref handling", () => {
    it("handles null ref gracefully", () => {
      renderHook(() => {
        const textareaRef = useRef<HTMLTextAreaElement>(null);
        useTextareaAutoResize({
          textareaRef,
          message: "Hello",
        });
        return textareaRef;
      });

      // Should not throw
    });
  });

  describe("message dependency", () => {
    it("resets height to auto before measuring", () => {
      let heightSetToAuto = false;
      const originalHeight = mockTextarea.style.height;

      Object.defineProperty(mockTextarea.style, "height", {
        set: (value: string) => {
          if (value === "auto") {
            heightSetToAuto = true;
          }
          Object.defineProperty(mockTextarea.style, "height", {
            value,
            writable: true,
            configurable: true,
          });
        },
        get: () => originalHeight,
        configurable: true,
      });

      renderHook(() => {
        const textareaRef = useRef<HTMLTextAreaElement>(mockTextarea);
        useTextareaAutoResize({
          textareaRef,
          message: "Test",
        });
        return textareaRef;
      });

      expect(heightSetToAuto).toBe(true);
    });
  });
});

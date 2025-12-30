import { describe, it, expect } from "vitest";
import {
  getTooltipText,
  getIconConfig,
  isSpeechButtonDisabled,
  isRecordingActive,
  STATUS_TOOLTIP,
  STATUS_ICON,
} from "./speech-button-utils";
import type { TranscriberStatus } from "@/features/chat/hooks/use-speech-to-text";

describe("speechButtonUtils", () => {
  describe("getTooltipText", () => {
    it("returns 'Stop recording' for recording status", () => {
      expect(getTooltipText("recording")).toBe("Stop recording");
    });

    it("returns 'Processing audio...' for processing status", () => {
      expect(getTooltipText("processing")).toBe("Processing audio...");
    });

    it("returns 'Loading model...' for loading status", () => {
      expect(getTooltipText("loading")).toBe("Loading model...");
    });

    it("returns 'Start voice input' for ready status", () => {
      expect(getTooltipText("ready")).toBe("Start voice input");
    });

    it("returns 'Start voice input' for uninitialized status", () => {
      expect(getTooltipText("uninitialized")).toBe("Start voice input");
    });

    it("returns 'Start voice input' for error status", () => {
      expect(getTooltipText("error")).toBe("Start voice input");
    });

    it("has entries for all TranscriberStatus values", () => {
      const allStatuses: TranscriberStatus[] = [
        "uninitialized",
        "loading",
        "ready",
        "recording",
        "processing",
        "error",
      ];
      allStatuses.forEach((status) => {
        expect(STATUS_TOOLTIP[status]).toBeDefined();
      });
    });
  });

  describe("getIconConfig", () => {
    it("returns mic-off with destructive color for recording", () => {
      const config = getIconConfig("recording");
      expect(config.type).toBe("mic-off");
      expect(config.className).toContain("text-destructive");
    });

    it("returns loader with animate-spin for processing", () => {
      const config = getIconConfig("processing");
      expect(config.type).toBe("loader");
      expect(config.className).toContain("animate-spin");
    });

    it("returns loader with animate-spin for loading", () => {
      const config = getIconConfig("loading");
      expect(config.type).toBe("loader");
      expect(config.className).toContain("animate-spin");
    });

    it("returns mic for ready status", () => {
      const config = getIconConfig("ready");
      expect(config.type).toBe("mic");
    });

    it("returns mic for uninitialized status", () => {
      const config = getIconConfig("uninitialized");
      expect(config.type).toBe("mic");
    });

    it("returns mic for error status", () => {
      const config = getIconConfig("error");
      expect(config.type).toBe("mic");
    });

    it("has entries for all TranscriberStatus values", () => {
      const allStatuses: TranscriberStatus[] = [
        "uninitialized",
        "loading",
        "ready",
        "recording",
        "processing",
        "error",
      ];
      allStatuses.forEach((status) => {
        expect(STATUS_ICON[status]).toBeDefined();
      });
    });
  });

  describe("isSpeechButtonDisabled", () => {
    it("returns true when disabled prop is true", () => {
      expect(isSpeechButtonDisabled("ready", true)).toBe(true);
    });

    it("returns true when status is processing", () => {
      expect(isSpeechButtonDisabled("processing")).toBe(true);
    });

    it("returns true when status is loading", () => {
      expect(isSpeechButtonDisabled("loading")).toBe(true);
    });

    it("returns false when status is ready and not disabled", () => {
      expect(isSpeechButtonDisabled("ready")).toBe(false);
    });

    it("returns false when status is recording and not disabled", () => {
      expect(isSpeechButtonDisabled("recording")).toBe(false);
    });

    it("returns false when status is uninitialized and not disabled", () => {
      expect(isSpeechButtonDisabled("uninitialized")).toBe(false);
    });

    it("returns false when status is error and not disabled", () => {
      expect(isSpeechButtonDisabled("error")).toBe(false);
    });
  });

  describe("isRecordingActive", () => {
    it("returns true for recording status", () => {
      expect(isRecordingActive("recording")).toBe(true);
    });

    it("returns false for all other statuses", () => {
      const nonRecordingStatuses: TranscriberStatus[] = [
        "uninitialized",
        "loading",
        "ready",
        "processing",
        "error",
      ];
      nonRecordingStatuses.forEach((status) => {
        expect(isRecordingActive(status)).toBe(false);
      });
    });
  });
});

import { describe, it, expect } from "vitest";
import {
  getModelStatusKey,
  getStatusColor,
  getDisplayedStatus,
  type ModelStatusFlags,
} from "./model-status-utils";

describe("modelStatusUtils", () => {
  describe("getModelStatusKey", () => {
    it("returns 'error' when isModelError is true", () => {
      const flags: ModelStatusFlags = {
        isModelError: true,
        isEngineLoading: false,
        isModelReady: false,
      };
      expect(getModelStatusKey(flags)).toBe("error");
    });

    it("returns 'error' even when other flags are true (priority)", () => {
      const flags: ModelStatusFlags = {
        isModelError: true,
        isEngineLoading: true,
        isModelReady: true,
      };
      expect(getModelStatusKey(flags)).toBe("error");
    });

    it("returns 'loading' when isEngineLoading is true and no error", () => {
      const flags: ModelStatusFlags = {
        isModelError: false,
        isEngineLoading: true,
        isModelReady: false,
      };
      expect(getModelStatusKey(flags)).toBe("loading");
    });

    it("returns 'loading' when loading takes priority over ready", () => {
      const flags: ModelStatusFlags = {
        isModelError: false,
        isEngineLoading: true,
        isModelReady: true,
      };
      expect(getModelStatusKey(flags)).toBe("loading");
    });

    it("returns 'ready' when isModelReady is true and not loading/error", () => {
      const flags: ModelStatusFlags = {
        isModelError: false,
        isEngineLoading: false,
        isModelReady: true,
      };
      expect(getModelStatusKey(flags)).toBe("ready");
    });

    it("returns 'initializing' when no flags are true", () => {
      const flags: ModelStatusFlags = {
        isModelError: false,
        isEngineLoading: false,
        isModelReady: false,
      };
      expect(getModelStatusKey(flags)).toBe("initializing");
    });
  });

  describe("getStatusColor", () => {
    it("returns destructive color for error", () => {
      expect(getStatusColor("error")).toBe("text-destructive");
    });

    it("returns amber color for loading", () => {
      expect(getStatusColor("loading")).toBe("text-amber-600 dark:text-amber-400");
    });

    it("returns green color for ready", () => {
      expect(getStatusColor("ready")).toBe("text-green-600 dark:text-green-400");
    });

    it("returns muted color for initializing", () => {
      expect(getStatusColor("initializing")).toBe("text-muted-foreground");
    });
  });

  describe("getDisplayedStatus", () => {
    it("returns 'Error' for error status", () => {
      expect(getDisplayedStatus("error")).toBe("Error");
    });

    it("returns 'Loading Model...' for loading status", () => {
      expect(getDisplayedStatus("loading")).toBe("Loading Model...");
    });

    it("returns 'Ready' for ready status", () => {
      expect(getDisplayedStatus("ready")).toBe("Ready");
    });

    it("returns 'Initializing...' for initializing status", () => {
      expect(getDisplayedStatus("initializing")).toBe("Initializing...");
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePrivacySettings } from "./use-privacy-settings";
import { mockNavigate, mockToast } from "@/testing/mocks/modules";

const mockResetConfig = vi.fn();
const mockClearAllData = vi.fn();
const mockExportConversations = vi.fn();
const mockImportConversations = vi.fn();

let mockConfig: { theme: "dark" | "light" | "system" } = { theme: "dark" };

// react-router-dom is globally mocked in setup.ts
// sonner is globally mocked in setup.ts

vi.mock("@/hooks/use-user-config", async () => {
  const { createMockUserConfigHook } = await import("@/testing/mocks/hooks");
  return {
    useUserConfig: () => createMockUserConfigHook({
      config: mockConfig,
      resetConfig: mockResetConfig,
    }),
  };
});

vi.mock("@/hooks/use-data-management", async () => {
  const { createMockDataManagementHook } = await import("@/testing/mocks/hooks");
  return {
    useDataManagement: () => createMockDataManagementHook({
      clearAllData: mockClearAllData,
    }),
  };
});

vi.mock("@/hooks/use-conversation-backup", async () => {
  const { createMockConversationBackupHook } = await import("@/testing/mocks/hooks");
  return {
    useConversationBackup: () => createMockConversationBackupHook({
      exportConversations: mockExportConversations,
      importConversations: mockImportConversations,
    }),
  };
});

describe("usePrivacySettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfig = { theme: "dark" };
    mockResetConfig.mockResolvedValue(undefined);
    mockClearAllData.mockResolvedValue(undefined);
    mockExportConversations.mockResolvedValue(undefined);
    mockImportConversations.mockResolvedValue(5);
  });

  describe("initial state", () => {
    it("returns config from useUserConfig", () => {
      const { result } = renderHook(() => usePrivacySettings());

      expect(result.current.config).toEqual({ theme: "dark" });
    });

    it("returns hasConversations from prop", () => {
      const { result } = renderHook(() => usePrivacySettings(true));

      expect(result.current.hasConversations).toBe(true);
    });

    it("defaults hasConversations to false", () => {
      const { result } = renderHook(() => usePrivacySettings());

      expect(result.current.hasConversations).toBe(false);
    });

    it("dialogs are closed initially", () => {
      const { result } = renderHook(() => usePrivacySettings());

      expect(result.current.showClearDataDialog).toBe(false);
      expect(result.current.showResetSettingsDialog).toBe(false);
    });

    it("provides fileInputRef", () => {
      const { result } = renderHook(() => usePrivacySettings());

      expect(result.current.fileInputRef).toBeDefined();
      expect(result.current.fileInputRef.current).toBe(null);
    });
  });

  describe("handleClearAllDataConfirm", () => {
    it("clears all data and navigates home", async () => {
      const { result } = renderHook(() => usePrivacySettings());

      act(() => {
        result.current.setShowClearDataDialog(true);
      });

      await act(async () => {
        await result.current.handleClearAllDataConfirm();
      });

      expect(mockClearAllData).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith("All data cleared successfully");
      expect(result.current.showClearDataDialog).toBe(false);
      expect(mockNavigate).toHaveBeenCalledWith("/");
    });
  });

  describe("handleResetSettingsConfirm", () => {
    it("resets config and closes dialog", async () => {
      const { result } = renderHook(() => usePrivacySettings());

      act(() => {
        result.current.setShowResetSettingsDialog(true);
      });

      await act(async () => {
        await result.current.handleResetSettingsConfirm();
      });

      expect(mockResetConfig).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith("Settings reset to defaults");
      expect(result.current.showResetSettingsDialog).toBe(false);
    });
  });

  describe("handleExportConversations", () => {
    it("exports conversations and shows success", async () => {
      const { result } = renderHook(() => usePrivacySettings());

      await act(async () => {
        await result.current.handleExportConversations();
      });

      expect(mockExportConversations).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith("Conversations exported successfully");
    });
  });

  describe("handleImportClick", () => {
    it("clicks file input", () => {
      const mockClick = vi.fn();
      const { result } = renderHook(() => usePrivacySettings());

      // Simulate ref being set
      Object.defineProperty(result.current.fileInputRef, "current", {
        value: { click: mockClick },
        writable: true,
      });

      act(() => {
        result.current.handleImportClick();
      });

      expect(mockClick).toHaveBeenCalled();
    });
  });

  describe("handleFileImport", () => {
    it("imports valid conversation file", async () => {
      const { result } = renderHook(() => usePrivacySettings());

      const validData = [
        { id: "1", messages: [], title: "Test" },
        { id: "2", messages: [], title: "Test2" },
      ];

      // Create a mock file with working text() method
      const mockFile = {
        type: "application/json",
        text: vi.fn().mockResolvedValue(JSON.stringify(validData)),
      };

      const event = {
        target: { files: [mockFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      await act(async () => {
        await result.current.handleFileImport(event);
      });

      expect(mockImportConversations).toHaveBeenCalledWith(validData);
      expect(mockToast.success).toHaveBeenCalledWith("Successfully imported 5 conversation(s)");
    });

    it("rejects non-JSON files", async () => {
      const { result } = renderHook(() => usePrivacySettings());

      const mockFile = {
        type: "text/plain",
        text: vi.fn().mockResolvedValue("text content"),
      };

      const event = {
        target: { files: [mockFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      await act(async () => {
        await result.current.handleFileImport(event);
      });

      expect(mockToast.error).toHaveBeenCalledWith("Please select a valid JSON file");
      expect(mockImportConversations).not.toHaveBeenCalled();
    });

    it("rejects invalid conversation format", async () => {
      const { result } = renderHook(() => usePrivacySettings());

      const invalidData = [{ notId: "test" }];

      const mockFile = {
        type: "application/json",
        text: vi.fn().mockResolvedValue(JSON.stringify(invalidData)),
      };

      const event = {
        target: { files: [mockFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      await act(async () => {
        await result.current.handleFileImport(event);
      });

      expect(mockToast.error).toHaveBeenCalledWith("Invalid conversation file format");
      expect(mockImportConversations).not.toHaveBeenCalled();
    });

    it("handles empty file selection", async () => {
      const { result } = renderHook(() => usePrivacySettings());

      const event = {
        target: { files: [] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      await act(async () => {
        await result.current.handleFileImport(event);
      });

      expect(mockImportConversations).not.toHaveBeenCalled();
    });

    it("handles parse errors gracefully", async () => {
      const { result } = renderHook(() => usePrivacySettings());

      const mockFile = {
        type: "application/json",
        text: vi.fn().mockResolvedValue("invalid json {{{"),
      };

      const event = {
        target: { files: [mockFile] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      await act(async () => {
        await result.current.handleFileImport(event);
      });

      expect(mockToast.error).toHaveBeenCalledWith(
        "Failed to import conversations. Please check the file format."
      );
    });
  });

  describe("dialog state setters", () => {
    it("setShowClearDataDialog updates state", () => {
      const { result } = renderHook(() => usePrivacySettings());

      act(() => {
        result.current.setShowClearDataDialog(true);
      });

      expect(result.current.showClearDataDialog).toBe(true);

      act(() => {
        result.current.setShowClearDataDialog(false);
      });

      expect(result.current.showClearDataDialog).toBe(false);
    });

    it("setShowResetSettingsDialog updates state", () => {
      const { result } = renderHook(() => usePrivacySettings());

      act(() => {
        result.current.setShowResetSettingsDialog(true);
      });

      expect(result.current.showResetSettingsDialog).toBe(true);
    });
  });
});

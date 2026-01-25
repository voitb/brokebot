import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePrivacySettings } from "./use-privacy-settings";
import { mockToast } from "@/testing/mocks/modules";

const mockImportConversations = vi.fn();

vi.mock("@/hooks/use-user-config", async () => {
  const { createMockUserConfigHook } = await import("@/testing/mocks/hooks");
  return { useUserConfig: () => createMockUserConfigHook() };
});

vi.mock("@/hooks/use-data-management", async () => {
  const { createMockDataManagementHook } = await import("@/testing/mocks/hooks");
  return { useDataManagement: () => createMockDataManagementHook() };
});

vi.mock("@/hooks/use-conversation-backup", async () => {
  const { createMockConversationBackupHook } = await import("@/testing/mocks/hooks");
  return {
    useConversationBackup: () => createMockConversationBackupHook({
      importConversations: mockImportConversations,
    }),
  };
});

function createFileEvent(type: string, content: string) {
  return {
    target: {
      files: [{ type, text: async () => content }],
    },
  } as unknown as React.ChangeEvent<HTMLInputElement>;
}

describe("usePrivacySettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockImportConversations.mockResolvedValue(5);
  });

  describe("handleFileImport validation", () => {
    it.each([
      {
        name: "non-JSON file type",
        type: "text/plain",
        content: "",
        error: "Please select a valid JSON file",
      },
      {
        name: "missing required fields",
        type: "application/json",
        content: JSON.stringify([{ notId: "test" }]),
        error: "Invalid conversation file format",
      },
      {
        name: "non-array JSON",
        type: "application/json",
        content: JSON.stringify({ id: "1", messages: [] }),
        error: "Invalid conversation file format",
      },
      {
        name: "malformed JSON",
        type: "application/json",
        content: "invalid json {{{",
        error: "Failed to import conversations. Please check the file format.",
      },
    ])("rejects $name", async ({ type, content, error }) => {
      const { result } = renderHook(() => usePrivacySettings());

      await act(async () => {
        await result.current.handleFileImport(createFileEvent(type, content));
      });

      expect(mockToast.error).toHaveBeenCalledWith(error);
      expect(mockImportConversations).not.toHaveBeenCalled();
    });
  });
});

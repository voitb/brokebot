import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, renderHook, act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { usePrivacySettings } from "./use-privacy-settings";
import { createMockFile, mockToast } from "@/testing/mocks/modules";
import { clearTestDatabase, seedConversation } from "@/testing/db-helpers";
import {
  createMockConversation,
  createMockDocument,
  createMockFolder,
  createMockUserConfig,
} from "@/testing/mocks/factories";
import type { UserConfig } from "@/lib/db";

const mockExportConversations = vi.fn();
const mockImportConversations = vi.fn();

let mockUserConfig: UserConfig = createMockUserConfig();

vi.mock("@/hooks/use-user-config", async () => {
  const { createMockUserConfigHook } = await import("@/testing/mocks/hooks");
  return { useUserConfig: () => createMockUserConfigHook({ config: mockUserConfig }) };
});

vi.mock("@/hooks/use-data-management", async () => {
  const { createMockDataManagementHook } = await import("@/testing/mocks/hooks");
  return { useDataManagement: () => createMockDataManagementHook() };
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

function FileImportHarness() {
  const { handleFileImport } = usePrivacySettings();

  return React.createElement("input", {
    type: "file",
    "aria-label": "Import conversations",
    onChange: handleFileImport,
  });
}

function createBackupFile(filename: string, content: string, type: string): File {
  const file = createMockFile(filename, content, type);
  Object.defineProperty(file, "text", {
    value: () => Promise.resolve(content),
  });
  return file;
}

async function importBackupFile(file: File) {
  const user = userEvent.setup();
  render(React.createElement(FileImportHarness));
  await user.upload(screen.getByLabelText("Import conversations"), file);
}

describe("usePrivacySettings", () => {
  beforeEach(async () => {
    await clearTestDatabase();
    vi.clearAllMocks();
    mockUserConfig = createMockUserConfig();
    mockImportConversations.mockResolvedValue({
      conversations: ["c1", "c2", "c3", "c4", "c5"],
      folders: [],
      documents: [],
    });
  });

  describe("handleFileImport validation", () => {
    it.each([
      {
        name: "non-JSON file type",
        type: "text/plain",
        filename: "notes.txt",
        content: "",
        error: "Please select a valid JSON file",
      },
      {
        name: "missing required fields",
        type: "application/json",
        filename: "backup.json",
        content: JSON.stringify([{ notId: "test" }]),
        error: "Invalid conversation file format",
      },
      {
        name: "malformed JSON",
        type: "application/json",
        filename: "backup.json",
        content: "invalid json {{{",
        error: "Failed to import conversations. Please check the file format.",
      },
    ])("rejects $name", async ({ type, content, filename, error }) => {
      const user = userEvent.setup();
      const file = createMockFile(filename, content, type);
      Object.defineProperty(file, "text", {
        value: () => Promise.resolve(content),
      });

      render(React.createElement(FileImportHarness));

      await user.upload(screen.getByLabelText("Import conversations"), file);

      await waitFor(() => expect(mockToast.error).toHaveBeenCalledWith(error));
      expect(mockImportConversations).not.toHaveBeenCalled();
    });
  });

  describe("handleFileImport success", () => {
    it("imports a backup document produced by the export button", async () => {
      const conversation = createMockConversation({
        id: "exported-1",
        title: "Exported Chat",
      });
      const file = createBackupFile(
        "brokebot-conversations-2026-09-12.json",
        JSON.stringify({
          conversations: [conversation],
          folders: [],
          documents: [],
        }),
        ""
      );

      expect(file.type).toBe("");

      await importBackupFile(file);

      await waitFor(() =>
        expect(mockImportConversations).toHaveBeenCalledWith({
          conversations: [conversation],
          folders: [],
          documents: [],
        })
      );
      expect(mockToast.success).toHaveBeenCalledWith(
        "Successfully imported 5 conversation(s)"
      );
      expect(mockToast.error).not.toHaveBeenCalled();
    });

    it("imports a legacy backup that is a bare conversation array", async () => {
      const conversation = createMockConversation({
        id: "legacy-1",
        title: "Legacy Chat",
      });
      const file = createBackupFile(
        "backup.json",
        JSON.stringify([conversation]),
        "application/json"
      );

      await importBackupFile(file);

      await waitFor(() =>
        expect(mockImportConversations).toHaveBeenCalledWith({
          conversations: [conversation],
          folders: [],
          documents: [],
        })
      );
      expect(mockToast.error).not.toHaveBeenCalled();
    });

    it("hands the backup's folders and documents to the importer", async () => {
      const folder = createMockFolder({ id: "folder-1", name: "Work" });
      const document = { ...createMockDocument({ filename: "notes.txt" }), id: 3 };
      const conversation = createMockConversation({
        id: "exported-1",
        folderId: folder.id,
      });
      const file = createBackupFile(
        "backup.json",
        JSON.stringify({
          conversations: [conversation],
          folders: [folder],
          documents: [document],
        }),
        "application/json"
      );

      await importBackupFile(file);

      await waitFor(() =>
        expect(mockImportConversations).toHaveBeenCalledWith({
          conversations: [conversation],
          folders: [folder],
          documents: [document],
        })
      );
      expect(mockToast.error).not.toHaveBeenCalled();
    });
  });

  describe("handleFileImport when nothing is new", () => {
    it("informs instead of claiming success when no conversation was added", async () => {
      mockImportConversations.mockResolvedValue({
        conversations: [],
        folders: [],
        documents: [],
      });
      const conversation = createMockConversation({ id: "already-here" });
      const file = createBackupFile(
        "backup.json",
        JSON.stringify({ conversations: [conversation], folders: [], documents: [] }),
        "application/json"
      );

      await importBackupFile(file);

      await waitFor(() =>
        expect(mockToast.info).toHaveBeenCalledWith("No new conversations to import.")
      );
      expect(mockToast.success).not.toHaveBeenCalled();
    });
  });

  describe("hasApiKey", () => {
    it("is true while an OpenRouter key is stored", () => {
      mockUserConfig = createMockUserConfig({ openrouterApiKey: "encrypted-key" });

      const { result } = renderHook(() => usePrivacySettings());

      expect(result.current.hasApiKey).toBe(true);
    });

    it("is false when no key is stored", () => {
      const { result } = renderHook(() => usePrivacySettings());

      expect(result.current.hasApiKey).toBe(false);
    });
  });

  describe("hasConversations", () => {
    it("is true once a conversation is stored", async () => {
      await seedConversation({ id: "conv-1" });

      const { result } = renderHook(() => usePrivacySettings());

      await waitFor(() => expect(result.current.hasConversations).toBe(true));
    });

    it("is false while the database holds no conversation", async () => {
      const { result } = renderHook(() => usePrivacySettings());

      await waitFor(() => expect(result.current.hasDocuments).toBe(false));
      expect(result.current.hasConversations).toBe(false);
    });
  });

  describe("handleExportConversations", () => {
    it("toasts success when the export resolves", async () => {
      mockExportConversations.mockResolvedValue(undefined);
      const { result } = renderHook(() => usePrivacySettings());

      await act(async () => {
        await result.current.handleExportConversations();
      });

      expect(mockToast.success).toHaveBeenCalledWith(
        "Conversations exported successfully"
      );
    });

    it("does not toast success when the export fails", async () => {
      mockExportConversations.mockRejectedValue(new Error("export failed"));
      const { result } = renderHook(() => usePrivacySettings());

      await act(async () => {
        await result.current.handleExportConversations();
      });

      expect(mockExportConversations).toHaveBeenCalled();
      expect(mockToast.success).not.toHaveBeenCalled();
    });
  });
});

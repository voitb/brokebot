import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useDocuments } from "./use-documents";
import { db } from "@/lib/db";
import { clearTestDatabase } from "@/testing/db-helpers";
import { mockToast, createMockFile } from "@/testing/mocks/modules";
import { createMockDocument } from "@/testing/mocks/factories";

describe("useDocuments", () => {
  beforeEach(async () => {
    await clearTestDatabase();
    vi.clearAllMocks();
  });

  describe("initialization", () => {
    it("returns empty documents initially", async () => {
      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.documents).toEqual([]);
    });

    it("loads existing documents from database", async () => {
      const doc = createMockDocument({ filename: "existing.txt" });
      await db.documents.add(doc);

      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.documents.length).toBe(1);
      });

      expect(result.current.documents[0].filename).toBe("existing.txt");
    });
  });

  describe("uploadDocument", () => {
    it("uploads and persists document to database", async () => {
      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const file = createMockFile("test.txt", "Test content");

      await act(async () => {
        const doc = await result.current.uploadDocument(file);
        expect(doc).not.toBeNull();
        expect(doc?.filename).toBe("test.txt");
        expect(doc?.content).toBe("Test content");
        expect(doc?.fileType).toBe("txt");
      });

      await waitFor(() => {
        expect(result.current.documents.length).toBe(1);
      });

      expect(result.current.documents[0].filename).toBe("test.txt");
      expect(mockToast.success).toHaveBeenCalledWith(
        'Document "test.txt" uploaded successfully!'
      );
    });

    it("uploads markdown files with correct type", async () => {
      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const file = createMockFile("readme.md", "# Header", "text/markdown");

      await act(async () => {
        const doc = await result.current.uploadDocument(file);
        expect(doc?.fileType).toBe("md");
      });
    });
  });

  describe("deleteDocument", () => {
    it("removes document from database and state", async () => {
      const doc = createMockDocument({ filename: "to-delete.txt" });
      const id = await db.documents.add(doc);

      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.documents.length).toBe(1);
      });

      await act(async () => {
        await result.current.deleteDocument(id as number);
      });

      const deleted = await db.documents.get(id);
      expect(deleted).toBeUndefined();
      expect(result.current.documents.length).toBe(0);
      expect(mockToast.success).toHaveBeenCalledWith("Document deleted successfully!");
    });
  });
});

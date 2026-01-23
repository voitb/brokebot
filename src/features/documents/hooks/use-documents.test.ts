import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useDocuments } from "./use-documents";
import { db, type Document } from "@/lib/db";
import { clearTestDatabase } from "@/testing/db-helpers";
import { mockToast, createMockFile } from "@/testing/mocks/modules";

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
      await db.documents.add({
        filename: "existing.txt",
        content: "Existing content",
        fileType: "txt",
        createdAt: new Date(),
      });

      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.documents.length).toBe(1);
      });

      expect(result.current.documents[0].filename).toBe("existing.txt");
    });
  });

  describe("uploadDocument", () => {
    it("uploads txt file successfully", async () => {
      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const file = createMockFile("test.txt", "Test content");
      const captured: { doc: Document | null } = { doc: null };

      await act(async () => {
        captured.doc = await result.current.uploadDocument(file);
      });

      expect(captured.doc).not.toBeNull();
      if (captured.doc) {
        expect(captured.doc.filename).toBe("test.txt");
        expect(captured.doc.content).toBe("Test content");
        expect(captured.doc.fileType).toBe("txt");
      }
    });

    it("uploads md file successfully", async () => {
      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const file = createMockFile("readme.md", "# Header", "text/markdown");
      const captured: { doc: Document | null } = { doc: null };

      await act(async () => {
        captured.doc = await result.current.uploadDocument(file);
      });

      expect(captured.doc).not.toBeNull();
      if (captured.doc) {
        expect(captured.doc.fileType).toBe("md");
      }
    });

    it("rejects unsupported file types", async () => {
      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const file = createMockFile("image.png", "fake image", "image/png");

      let uploadedDoc: Document | null = null;
      await act(async () => {
        uploadedDoc = await result.current.uploadDocument(file);
      });

      expect(uploadedDoc).toBeNull();
      expect(mockToast.error).toHaveBeenCalledWith(
        "Unsupported file type. Only .txt and .md files are supported."
      );
    });

    it("rejects files larger than 10MB", async () => {
      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const largeContent = "x".repeat(11 * 1024 * 1024);
      const file = createMockFile("large.txt", largeContent);

      let uploadedDoc: Document | null = null;
      await act(async () => {
        uploadedDoc = await result.current.uploadDocument(file);
      });

      expect(uploadedDoc).toBeNull();
      expect(mockToast.error).toHaveBeenCalledWith("File too large. Maximum size is 10MB.");
    });

    it("rejects empty files", async () => {
      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const file = createMockFile("empty.txt", "   ");

      let uploadedDoc: Document | null = null;
      await act(async () => {
        uploadedDoc = await result.current.uploadDocument(file);
      });

      expect(uploadedDoc).toBeNull();
      expect(mockToast.error).toHaveBeenCalledWith("File appears to be empty.");
    });

    it("adds document to local state", async () => {
      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const file = createMockFile("new.txt", "New content");

      await act(async () => {
        await result.current.uploadDocument(file);
      });

      // useLiveQuery updates reactively after DB changes
      await waitFor(() => {
        expect(result.current.documents.length).toBe(1);
      });

      expect(result.current.documents[0].filename).toBe("new.txt");
    });
  });

  describe("deleteDocument", () => {
    it("removes document from database", async () => {
      const id = await db.documents.add({
        filename: "to-delete.txt",
        content: "Delete me",
        fileType: "txt",
        createdAt: new Date(),
      });

      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.documents.length).toBe(1);
      });

      await act(async () => {
        await result.current.deleteDocument(id as number);
      });

      const deleted = await db.documents.get(id);
      expect(deleted).toBeUndefined();
    });

    it("removes document from local state", async () => {
      const id = await db.documents.add({
        filename: "to-delete.txt",
        content: "Delete me",
        fileType: "txt",
        createdAt: new Date(),
      });

      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.documents.length).toBe(1);
      });

      await act(async () => {
        await result.current.deleteDocument(id as number);
      });

      expect(result.current.documents.length).toBe(0);
    });
  });

  describe("getDocumentContent", () => {
    it("returns content for existing document", async () => {
      const id = await db.documents.add({
        filename: "test.txt",
        content: "Document content here",
        fileType: "txt",
        createdAt: new Date(),
      });

      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let content: string | null = null;
      await act(async () => {
        content = await result.current.getDocumentContent(id as number);
      });

      expect(content).toBe("Document content here");
    });

    it("returns null for non-existent document", async () => {
      const { result } = renderHook(() => useDocuments());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let content: string | null = null;
      await act(async () => {
        content = await result.current.getDocumentContent(99999);
      });

      expect(content).toBeNull();
    });
  });

});

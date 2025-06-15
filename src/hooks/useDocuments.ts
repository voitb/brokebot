import { useState, useEffect } from "react";
import { db, type Document } from "../lib/db";
import { toast } from "sonner";

export interface UseDocumentsReturn {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  uploadDocument: (file: File) => Promise<Document | null>;
  deleteDocument: (id: number) => Promise<void>;
  getDocumentContent: (id: number) => Promise<string | null>;
  refreshDocuments: () => Promise<void>;
}

/**
 * Hook for managing documents in IndexedDB
 */
export const useDocuments = (): UseDocumentsReturn => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const docs = await db.documents.orderBy("createdAt").reverse().toArray();
      setDocuments(docs);
    } catch (err) {
      console.error("Failed to load documents:", err);
      setError("Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  };

  const uploadDocument = async (file: File): Promise<Document | null> => {
    try {
      setError(null);

      // Validate file type
      const fileType = getFileType(file);
      if (!fileType) {
        toast.error("Unsupported file type. Only .txt and .md files are supported.");
        return null;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 10MB.");
        return null;
      }

      // Read file content
      const content = await readFileContent(file);
      if (!content.trim()) {
        toast.error("File appears to be empty.");
        return null;
      }

      // Create document object
      const document: Omit<Document, "id"> = {
        filename: file.name,
        content,
        fileType,
        createdAt: new Date(),
      };

      // Save to IndexedDB
      const id = await db.documents.add(document);
      const savedDocument = { ...document, id };

      // Update local state
      setDocuments(prev => [savedDocument, ...prev]);
      
      toast.success(`Document "${file.name}" uploaded successfully!`);
      return savedDocument;

    } catch (err) {
      console.error("Failed to upload document:", err);
      setError("Failed to upload document");
      toast.error("Failed to upload document");
      return null;
    }
  };

  const deleteDocument = async (id: number): Promise<void> => {
    try {
      setError(null);
      await db.documents.delete(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.success("Document deleted successfully!");
    } catch (err) {
      console.error("Failed to delete document:", err);
      setError("Failed to delete document");
      toast.error("Failed to delete document");
    }
  };

  const getDocumentContent = async (id: number): Promise<string | null> => {
    try {
      const document = await db.documents.get(id);
      return document?.content || null;
    } catch (err) {
      console.error("Failed to get document content:", err);
      return null;
    }
  };

  const refreshDocuments = async (): Promise<void> => {
    await loadDocuments();
  };

  return {
    documents,
    isLoading,
    error,
    uploadDocument,
    deleteDocument,
    getDocumentContent,
    refreshDocuments,
  };
};

// Helper functions
const getFileType = (file: File): "txt" | "md" | null => {
  if (file.type === "text/plain" || file.name.endsWith(".txt")) {
    return "txt";
  }
  if (file.name.endsWith(".md")) {
    return "md";
  }
  return null;
};

const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    reader.readAsText(file);
  });
}; 
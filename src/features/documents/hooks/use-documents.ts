import { useLiveQuery } from "dexie-react-hooks";
import { db, type Document } from "@/lib/db";
import { toast } from "sonner";

export interface UseDocumentsReturn {
  documents: Document[];
  isLoading: boolean;
  uploadDocument: (file: File) => Promise<Document | null>;
  deleteDocument: (id: number) => Promise<void>;
  getDocumentContent: (id: number) => Promise<string | null>;
}

export function useDocuments(): UseDocumentsReturn {
  const documents = useLiveQuery(
    () => db.documents.orderBy("createdAt").reverse().toArray(),
    [],
    []
  );

  const isLoading = documents === undefined;

  const uploadDocument = async (file: File): Promise<Document | null> => {
    try {
      const fileType = getFileType(file);
      if (!fileType) {
        toast.error("Unsupported file type. Only .txt and .md files are supported.");
        return null;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 10MB.");
        return null;
      }

      const content = await readFileContent(file);
      if (!content.trim()) {
        toast.error("File appears to be empty.");
        return null;
      }

      const document: Omit<Document, "id"> = {
        filename: file.name,
        content,
        fileType,
        createdAt: new Date(),
      };

      const id = await db.documents.add(document);
      toast.success(`Document "${file.name}" uploaded successfully!`);
      return { ...document, id };
    } catch {
      toast.error("Failed to upload document");
      return null;
    }
  };

  const deleteDocument = async (id: number): Promise<void> => {
    try {
      await db.documents.delete(id);
      toast.success("Document deleted successfully!");
    } catch {
      toast.error("Failed to delete document");
    }
  };

  const getDocumentContent = async (id: number): Promise<string | null> => {
    try {
      const document = await db.documents.get(id);
      return document?.content || null;
    } catch {
      return null;
    }
  };

  return {
    documents: documents ?? [],
    isLoading,
    uploadDocument,
    deleteDocument,
    getDocumentContent,
  };
}

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

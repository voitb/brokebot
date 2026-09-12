import React, { useRef, useState } from "react";
import { useDocuments } from "@/features/documents/hooks/use-documents";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload, Trash2, Calendar } from "lucide-react";

interface DocumentManagerProps {
  className?: string;
}

function formatCharacterCount(characters: number): string {
  if (characters < 1000) return `${characters} character${characters === 1 ? "" : "s"}`;
  if (characters < 1000000) return `${parseFloat((characters / 1000).toFixed(1))}k characters`;
  return `${parseFloat((characters / 1000000).toFixed(1))}m characters`;
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export function DocumentManager({ className }: DocumentManagerProps) {
  const { documents, isLoading, uploadDocument, deleteDocument } = useDocuments();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documentToDelete, setDocumentToDelete] = useState<{ id: number; filename: string } | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      await uploadDocument(files[i]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteClick = (id: number, filename: string) => {
    setDocumentToDelete({ id, filename });
  };

  const handleDeleteConfirm = async () => {
    if (!documentToDelete) return;
    await deleteDocument(documentToDelete.id);
    setDocumentToDelete(null);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents ({documents.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUploadClick}
            disabled={isLoading}
            aria-label="Upload documents"
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt,.md"
          onChange={handleFileUpload}
          className="hidden"
          aria-label="Upload text or markdown files"
        />

        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No documents uploaded yet</p>
            <p className="text-xs mt-2">Upload .txt or .md files to use them with AI</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
              >
                <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{doc.filename}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatTimeAgo(doc.createdAt)}</span>
                    <span>•</span>
                    <span>{doc.fileType.toUpperCase()}</span>
                    <span>•</span>
                    <span>{formatCharacterCount(doc.content.length)}</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => doc.id && handleDeleteClick(doc.id, doc.filename)}
                  className="text-destructive hover:text-destructive"
                  aria-label={`Delete ${doc.filename}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {documents.length > 0 && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground">
              💡 <strong>Tip:</strong> When you attach files to chat messages, AI can read and
              analyze their content. Your documents are stored locally and never sent to external servers.
            </p>
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!documentToDelete} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{documentToDelete?.filename}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
} 
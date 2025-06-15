import React, { useRef } from "react";
import { useDocuments } from "../../hooks/useDocuments";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { FileText, Upload, Trash2, RefreshCw, Calendar } from "lucide-react";
// Note: date-fns not available, using native Date
// import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface DocumentManagerProps {
  className?: string;
}

/**
 * Document manager component for uploading and managing text files
 */
export const DocumentManager: React.FC<DocumentManagerProps> = ({ className }) => {
  const { documents, isLoading, uploadDocument, deleteDocument, refreshDocuments } = useDocuments();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      await uploadDocument(files[i]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteDocument = async (id: number, filename: string) => {
    if (window.confirm(`Are you sure you want to delete "${filename}"?`)) {
      await deleteDocument(id);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents ({documents.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshDocuments}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUploadClick}
              disabled={isLoading}
            >
              <Upload className="h-4 w-4" />
              Upload
            </Button>
          </div>
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
                    <span>{formatFileSize(doc.content.length)}</span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => doc.id && handleDeleteDocument(doc.id, doc.filename)}
                  className="text-destructive hover:text-destructive"
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
    </Card>
  );
}; 
import React, { useState } from "react";
import { Download, FileText, Code, FileCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useConversation } from "@/shared/hooks/use-conversations";
import { toast } from "sonner";
import { generateHTML, generateMarkdown, downloadFile } from "@/lib/export-utils";

interface ExportChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId?: string;
}

type ExportFormat = "html" | "json" | "markdown";

const exportFormats = [
  {
    id: "html" as const,
    name: "HTML",
    description: "Styled document you can share with others",
    icon: FileCode,
  },
  {
    id: "json" as const,
    name: "JSON",
    description: "Full data backup, can be re-imported",
    icon: Code,
  },
  {
    id: "markdown" as const,
    name: "Markdown",
    description: "Plain text format for documentation",
    icon: FileText,
  },
];

export const ExportChatModal: React.FC<ExportChatModalProps> = React.memo(
  ({ open, onOpenChange, conversationId }) => {
    const { conversation, messages } = useConversation(conversationId);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: ExportFormat) => {
      if (!conversation) return;

      setIsExporting(true);

      const safeTitle = conversation.title.replace(/[^a-zA-Z0-9-_]/g, "_");
      const timestamp = new Date().toISOString().split("T")[0];

      try {
        switch (format) {
          case "html": {
            const html = generateHTML(conversation.title, messages);
            downloadFile(html, `${safeTitle}-${timestamp}.html`, "text/html");
            break;
          }
          case "json": {
            const json = JSON.stringify({ ...conversation, messages }, null, 2);
            downloadFile(json, `${safeTitle}-${timestamp}.json`, "application/json");
            break;
          }
          case "markdown": {
            const md = generateMarkdown(conversation.title, messages);
            downloadFile(md, `${safeTitle}-${timestamp}.md`, "text/markdown");
            break;
          }
        }
        toast.success(`Exported as ${format.toUpperCase()}`);
        onOpenChange(false);
      } catch {
        toast.error("Failed to export conversation");
      } finally {
        setIsExporting(false);
      }
    };

    if (!conversation) {
      return (
        <Dialog open={open} onOpenChange={onOpenChange}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Export Chat</DialogTitle>
              <DialogDescription>No conversation selected</DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Conversation
            </DialogTitle>
            <DialogDescription>
              Export "{conversation.title}" to share or backup
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 py-4">
              {exportFormats.map((format) => (
                <Button
                  key={format.id}
                  variant="outline"
                  className="w-full justify-start h-auto py-4 px-4"
                  onClick={() => handleExport(format.id)}
                  disabled={isExporting}
                >
                  <format.icon className="w-5 h-5 mr-3 shrink-0" />
                  <div className="text-left">
                    <div className="font-medium">{format.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {format.description}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </ScrollArea>

          <div className="flex justify-end pt-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

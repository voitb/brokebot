import React, { useState } from "react";
import { Download, FileText, Code, FileCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { ScrollArea } from "../../ui/scroll-area";
import { useConversation } from "../../../hooks/useConversations";
import { toast } from "sonner";

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

function generateHTML(title: string, messages: Array<{ role: string; content: string; createdAt?: Date }>): string {
  const messagesHTML = messages
    .map((msg) => {
      const isUser = msg.role === "user";
      const bgColor = isUser ? "#e3f2fd" : "#f5f5f5";
      const alignment = isUser ? "margin-left: auto" : "margin-right: auto";
      const roleLabel = isUser ? "You" : "Assistant";
      const date = msg.createdAt ? new Date(msg.createdAt).toLocaleString() : "";

      return `
      <div style="max-width: 80%; ${alignment}; margin-bottom: 16px; padding: 16px; background: ${bgColor}; border-radius: 12px;">
        <div style="font-weight: 600; margin-bottom: 8px; color: #333;">${roleLabel}</div>
        <div style="white-space: pre-wrap; line-height: 1.6;">${escapeHTML(msg.content)}</div>
        ${date ? `<div style="font-size: 12px; color: #666; margin-top: 8px;">${date}</div>` : ""}
      </div>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(title)} - brokebot Export</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #fff; color: #333; line-height: 1.5; }
    .container { max-width: 800px; margin: 0 auto; padding: 24px; }
    .header { text-align: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #eee; }
    .header h1 { font-size: 24px; margin-bottom: 8px; }
    .header p { color: #666; font-size: 14px; }
    .messages { display: flex; flex-direction: column; }
    .footer { text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${escapeHTML(title)}</h1>
      <p>Exported from brokebot on ${new Date().toLocaleDateString()}</p>
    </div>
    <div class="messages">
      ${messagesHTML}
    </div>
    <div class="footer">
      <p>Exported from <a href="https://github.com/voitb/brokebot">brokebot</a> - Your Privacy-First AI Assistant</p>
    </div>
  </div>
</body>
</html>`;
}

function generateMarkdown(title: string, messages: Array<{ role: string; content: string; createdAt?: Date }>): string {
  const header = `# ${title}\n\n*Exported from brokebot on ${new Date().toLocaleDateString()}*\n\n---\n\n`;

  const messagesContent = messages
    .map((msg) => {
      const roleLabel = msg.role === "user" ? "**You**" : "**Assistant**";
      const date = msg.createdAt ? `\n*${new Date(msg.createdAt).toLocaleString()}*` : "";
      return `${roleLabel}${date}\n\n${msg.content}\n\n---\n`;
    })
    .join("\n");

  return header + messagesContent;
}

function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

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
      } catch (error) {
        console.error("Export failed:", error);
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

interface MessageForExport {
  role: string;
  content: string;
  createdAt?: Date;
}

export function escapeHTML(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function generateHTML(title: string, messages: MessageForExport[]): string {
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

export function generateMarkdown(title: string, messages: MessageForExport[]): string {
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

export function downloadFile(content: string, filename: string, mimeType: string): void {
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

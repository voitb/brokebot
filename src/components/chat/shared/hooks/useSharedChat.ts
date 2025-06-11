import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { Conversation, Message, ISharedLink } from "../../../../lib/db";

type Theme = "light" | "dark";

export const useSharedChat = (
  conversation: Conversation,
  messages: Message[],
  sharedLink: ISharedLink,
) => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(isSystemDark ? "dark" : "light");
  }, []);
  
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const handleCopyLink = useCallback(async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  }, []);

  const handleDownloadChat = useCallback(() => {
    if (!sharedLink.allowDownload) {
      toast.error("Download is not allowed for this conversation");
      return;
    }

    const chatData = {
      title: conversation.title,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.createdAt.toISOString(),
      })),
      metadata: {
        shareId: sharedLink.id,
        sharedAt: sharedLink.createdAt.toISOString(),
        viewCount: sharedLink.viewCount,
        isPublic: sharedLink.publicDiscovery,
      },
    };

    const blob = new Blob([JSON.stringify(chatData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${conversation.title
      .replace(/[^a-z0-9]/gi, "_")
      .toLowerCase()}_chat.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Chat downloaded successfully!");
  }, [conversation.title, messages, sharedLink]);

  const toggleTheme = useCallback(() => {
    setTheme(currentTheme => currentTheme === "dark" ? "light" : "dark");
  }, []);

  const handleLogoClick = useCallback(() => {
    const frontendUrl =
      import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    window.open(frontendUrl, "_blank");
  }, []);

  return {
    theme,
    handleCopyLink,
    handleDownloadChat,
    toggleTheme,
    handleLogoClick,
  };
}; 
import { useState, useEffect } from "react";
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

  const handleCopyLink = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleDownloadChat = () => {
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
  };

  const toggleTheme = () => {
    setTheme(currentTheme => currentTheme === "dark" ? "light" : "dark");
  };

  const handleLogoClick = () => {
    const frontendUrl =
      import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    window.open(frontendUrl, "_blank");
  };

  const handleDownloadHtmlPage = async () => {
    toast.info("Preparing HTML file... Please wait.");
    try {
      // 1. Clone the entire document to avoid altering the live page
      const clonedDoc = document.cloneNode(true) as Document;

      // 2. Remove ephemeral UI elements (tooltips, toasts) from the clone
      const tooltips = clonedDoc.querySelectorAll(
        '[data-radix-popper-content-wrapper]'
      );
      tooltips.forEach((tooltip) => tooltip.remove());
      const toasts = clonedDoc.querySelectorAll('[data-sonner-toaster]');
      toasts.forEach((toast) => toast.remove());

      // 3. Remove header and footer from the cloned document
      clonedDoc.querySelector("header")?.remove();
      clonedDoc.querySelector("footer")?.remove();

      // 4. Fetch and embed all CSS stylesheets
      const linkElements = Array.from(
        clonedDoc.querySelectorAll('link[rel="stylesheet"]')
      );
      await Promise.all(
        linkElements.map(async (link) => {
          const href = link.getAttribute("href");
          if (href) {
            try {
              const response = await fetch(href);
              const cssText = await response.text();
              const styleElement = clonedDoc.createElement("style");
              styleElement.textContent = cssText;
              link.parentNode?.replaceChild(styleElement, link);
            } catch (error) {
              console.warn(`Could not fetch or embed stylesheet: ${href}`, error);
              // Keep the link tag if fetching fails
            }
          }
        })
      );

      // 5. Get the final HTML as a string
      const html = `<!DOCTYPE html>\n${clonedDoc.documentElement.outerHTML}`;

      // 6. Create a Blob and trigger the download
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${conversation.title
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase()}_page.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Page downloaded successfully!");
    } catch (error) {
      console.error("Failed to download HTML page:", error);
      toast.error("An error occurred while preparing the download.");
    }
  };

  return {
    theme,
    handleCopyLink,
    handleDownloadChat,
    toggleTheme,
    handleLogoClick,
    handleDownloadHtmlPage,
  };
}; 
import { useState, useCallback } from "react";
import { useSharedLinks } from "../../../../hooks/useSharedLinks";
import { toast } from "sonner";

export interface ShareOptions {
  allowDownload: boolean;
  showSharedBy: boolean;
  anonymizeMessages: boolean;
  publicDiscovery: boolean;
}

interface UseShareChatProps {
  conversationId?: string;
  conversationTitle?: string;
}

interface UseShareChatReturn {
  shareOptions: ShareOptions;
  setShareOptions: React.Dispatch<React.SetStateAction<ShareOptions>>;
  shareId: string | null;
  isGeneratingLink: boolean;
  generateShareLink: () => Promise<void>;
  copyShareLink: () => Promise<void>;
}

/**
 * Custom hook for share chat functionality
 */
export const useShareChat = ({
  conversationId,
  conversationTitle,
}: UseShareChatProps): UseShareChatReturn => {
  const { createSharedLink } = useSharedLinks();
  
  const [shareOptions, setShareOptions] = useState<ShareOptions>({
    allowDownload: true,
    showSharedBy: false,
    anonymizeMessages: false,
    publicDiscovery: false,
  });
  
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);

  const generateShareLink = useCallback(async () => {
    if (!conversationId || !conversationTitle) {
      toast.error("No conversation to share");
      return;
    }

    setIsGeneratingLink(true);

    try {
      const newShareId = await createSharedLink(
        conversationId,
        conversationTitle,
        shareOptions
      );

      if (newShareId) {
        setShareId(newShareId);
        toast.success("Share link generated successfully!");
      } else {
        toast.error("Failed to generate share link");
      }
    } catch (error) {
      console.error("Failed to generate share link:", error);
      toast.error("Failed to generate share link");
    } finally {
      setIsGeneratingLink(false);
    }
  }, [conversationId, conversationTitle, shareOptions, createSharedLink]);

  const copyShareLink = useCallback(async () => {
    if (!shareId) return;

    const shareLink = `${window.location.origin}/share/${shareId}`;

    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  }, [shareId]);

  return {
    shareOptions,
    setShareOptions,
    shareId,
    isGeneratingLink,
    generateShareLink,
    copyShareLink,
  };
}; 
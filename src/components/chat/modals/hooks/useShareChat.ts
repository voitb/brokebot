import { useState, useMemo } from "react";
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
  hasActiveSubscription: boolean;
  hasCloudStorage: boolean;
  generateShareLink: () => Promise<void>;
  copyShareLink: () => Promise<void>;
  handlePreviewShare: () => void;
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

  const hasActiveSubscription = useMemo(() => false, []);
  const hasCloudStorage = useMemo(() => false, []);

  const generateShareLink = async () => {
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
  };

  const copyShareLink = async () => {
    if (!shareId) return;

    const shareLink = `${window.location.origin}/share/${shareId}`;

    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      console.error("Failed to copy link:", error);
      toast.error("Failed to copy link");
    }
  };

  const handlePreviewShare = () => {
    if (shareId) {
      const shareLink = `${window.location.origin}/share/${shareId}`;
      window.open(shareLink, "_blank");
    }
  };

  return {
    shareOptions,
    setShareOptions,
    shareId,
    isGeneratingLink,
    generateShareLink,
    copyShareLink,
    hasActiveSubscription,
    hasCloudStorage,
    handlePreviewShare,
  };
}; 
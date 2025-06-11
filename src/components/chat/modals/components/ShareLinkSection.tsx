import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Button } from "../../../ui/button";
import { Input } from "../../../ui/input";
import { CopyButton } from "../../../ui";
import { Globe, ExternalLink } from "lucide-react";

interface ShareLinkSectionProps {
  shareId: string | null;
  isGeneratingLink: boolean;
  onGenerateLink: () => void;
  onPreviewShare: () => void;
}

/**
 * Share link generation and management component
 */
export const ShareLinkSection: React.FC<ShareLinkSectionProps> = React.memo(({
  shareId,
  isGeneratingLink,
  onGenerateLink,
  onPreviewShare,
}) => {
  const shareLink = shareId ? `${window.location.origin}/share/${shareId}` : "";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Globe className="w-4 h-4" />
          Share Link
        </CardTitle>
        <CardDescription>
          Generate a shareable link to this conversation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!shareLink ? (
          <Button
            onClick={onGenerateLink}
            disabled={isGeneratingLink}
            className="w-full"
          >
            {isGeneratingLink ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Generating link...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Generate Share Link
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={shareLink}
                readOnly
                className="font-mono text-sm"
              />
              <CopyButton
                value={shareLink}
                variant="outline"
                size="sm"
                showTooltip={true}
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={onPreviewShare}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Preview Share
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}); 
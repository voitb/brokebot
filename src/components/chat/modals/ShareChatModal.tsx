import React, { useState } from "react";
import { Copy, Link2, QrCode, Coins, ExternalLink, CheckCircle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../ui/dialog";
import { Button } from "../../ui/button";
import { Badge } from "../../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card";
import { Switch } from "../../ui/switch";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { Separator } from "../../ui/separator";
import { Alert, AlertDescription } from "../../ui/alert";
import { useConversation } from "../../../hooks/useConversations";
import { toast } from "sonner";

interface ShareChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId?: string;
}

/**
 * Modal for sharing chat conversations with various options
 */
export const ShareChatModal: React.FC<ShareChatModalProps> = ({
  open,
  onOpenChange,
  conversationId,
}) => {
  const { conversation, messages } = useConversation(conversationId);
  const [shareOptions, setShareOptions] = useState({
    includeSystemMessages: false,
    anonymizeMessages: false,
    publicShare: false,
  });
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [shareLink, setShareLink] = useState<string>("");
  const [isMinting, setIsMinting] = useState(false);

  // Mock user plan - in real app this would come from user context
  const userPlan = "free"; // "free", "pro", "premium"
  const canMintNFT = userPlan === "premium";

  const handleGenerateShareLink = async () => {
    if (!conversation || !messages.length) {
      toast.error("No conversation to share");
      return;
    }

    setIsGeneratingLink(true);
    
    try {
      // Simulate API call to generate shareable link
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate mock share link
      const shareId = Math.random().toString(36).substr(2, 12);
      const mockLink = `https://local-gpt.app/share/${shareId}`;
      setShareLink(mockLink);
      
      toast.success("Share link generated successfully!");
    } catch (error) {
      toast.error("Failed to generate share link");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareLink) return;
    
    try {
      await navigator.clipboard.writeText(shareLink);
      toast.success("Link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleMintNFT = async () => {
    if (!canMintNFT || !shareLink) return;
    
    setIsMinting(true);
    
    try {
      // Simulate blockchain minting process
      await new Promise(resolve => setTimeout(resolve, 3000));
      toast.success("NFT minted successfully! Check your wallet.");
    } catch (error) {
      toast.error("Failed to mint NFT");
    } finally {
      setIsMinting(false);
    }
  };

  const getMessageCount = () => {
    if (!messages) return 0;
    return shareOptions.includeSystemMessages 
      ? messages.length 
      : messages.filter(m => m.role !== 'system').length;
  };

  if (!conversation) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share Chat</DialogTitle>
            <DialogDescription>
              No conversation selected
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Share Chat Conversation
          </DialogTitle>
          <DialogDescription>
            Share "{conversation.title}" with others or mint as NFT
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Chat Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Conversation Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Title:</span>
                <span className="font-medium">{conversation.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Messages:</span>
                <Badge variant="outline">{getMessageCount()} messages</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Created:</span>
                <span>{conversation.createdAt.toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>

          {/* Share Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Share Settings</CardTitle>
              <CardDescription>
                Configure how your conversation will be shared
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Include system messages</Label>
                  <p className="text-xs text-muted-foreground">
                    Include AI system prompts and technical messages
                  </p>
                </div>
                <Switch
                  checked={shareOptions.includeSystemMessages}
                  onCheckedChange={(checked) =>
                    setShareOptions(prev => ({ ...prev, includeSystemMessages: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Anonymize messages</Label>
                  <p className="text-xs text-muted-foreground">
                    Remove or replace personal information
                  </p>
                </div>
                <Switch
                  checked={shareOptions.anonymizeMessages}
                  onCheckedChange={(checked) =>
                    setShareOptions(prev => ({ ...prev, anonymizeMessages: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Public sharing</Label>
                  <p className="text-xs text-muted-foreground">
                    Allow others to discover this conversation
                  </p>
                </div>
                <Switch
                  checked={shareOptions.publicShare}
                  onCheckedChange={(checked) =>
                    setShareOptions(prev => ({ ...prev, publicShare: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Generate Share Link */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Link2 className="w-4 h-4" />
                Share Link
              </CardTitle>
              <CardDescription>
                Generate a shareable link to this conversation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!shareLink ? (
                <Button 
                  onClick={handleGenerateShareLink}
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
                      <Link2 className="w-4 h-4 mr-2" />
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
                    <Button variant="outline" size="sm" onClick={handleCopyLink}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <QrCode className="w-4 h-4 mr-2" />
                      QR Code
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* NFT Minting */}
          <Card className={!canMintNFT ? "opacity-60" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Mint as NFT
                {!canMintNFT && (
                  <Badge variant="secondary" className="ml-2">Premium Only</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Create a unique NFT of this conversation on the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!canMintNFT ? (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    NFT minting is available for Premium plan users only. 
                    <Button variant="link" className="p-0 h-auto ml-1">
                      Upgrade now
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : shareLink ? (
                <div className="space-y-3">
                  <div className="bg-muted p-3 rounded-lg text-sm">
                    <p className="font-medium mb-1">NFT Details:</p>
                    <ul className="space-y-1 text-muted-foreground">
                      <li>• Blockchain: Ethereum</li>
                      <li>• Gas fee: ~$5-15 (estimated)</li>
                      <li>• Metadata: Conversation hash + timestamp</li>
                      <li>• Ownership: Transferable</li>
                    </ul>
                  </div>
                  
                  <Button 
                    onClick={handleMintNFT}
                    disabled={isMinting}
                    className="w-full"
                    variant="default"
                  >
                    {isMinting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Minting NFT...
                      </>
                    ) : (
                      <>
                        <Coins className="w-4 h-4 mr-2" />
                        Mint NFT ($ETH)
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Generate a share link first to enable NFT minting.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 
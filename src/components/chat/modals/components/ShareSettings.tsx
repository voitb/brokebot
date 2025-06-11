import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { Switch } from "../../../ui/switch";
import { Label } from "../../../ui/label";
import { Crown } from "lucide-react";
import type { ShareOptions } from "../hooks/useShareChat";

interface ShareSettingsProps {
  shareOptions: ShareOptions;
  onShareOptionsChange: (options: ShareOptions) => void;
  hasActiveSubscription?: boolean;
}

/**
 * Share settings configuration component
 */
export const ShareSettings: React.FC<ShareSettingsProps> = React.memo(({
  shareOptions,
  onShareOptionsChange,
  hasActiveSubscription = false,
}) => {
  const handleOptionChange = (key: keyof ShareOptions, value: boolean) => {
    onShareOptionsChange({
      ...shareOptions,
      [key]: value,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Share Settings</CardTitle>
        <CardDescription>
          Configure privacy options for shared conversation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Allow download</Label>
            <p className="text-xs text-muted-foreground">
              Allow viewers to download this conversation
            </p>
          </div>
          <Switch
            checked={shareOptions.allowDownload}
            onCheckedChange={(checked) => handleOptionChange("allowDownload", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Show shared by</Label>
            <p className="text-xs text-muted-foreground">
              Display who shared this conversation
            </p>
          </div>
          <Switch
            checked={shareOptions.showSharedBy}
            onCheckedChange={(checked) => handleOptionChange("showSharedBy", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium">Anonymize messages</Label>
            <p className="text-xs text-muted-foreground">
              Remove personal information from shared content
            </p>
          </div>
          <Switch
            checked={shareOptions.anonymizeMessages}
            onCheckedChange={(checked) => handleOptionChange("anonymizeMessages", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label className="text-sm font-medium flex items-center gap-2">
              Public discovery
              <Crown className="h-3 w-3 text-amber-500" />
            </Label>
            <p className="text-xs text-muted-foreground">
              Allow others to discover this conversation (Premium only)
            </p>
          </div>
          <Switch
            checked={shareOptions.publicDiscovery}
            onCheckedChange={(checked) => handleOptionChange("publicDiscovery", checked)}
            disabled={!hasActiveSubscription}
          />
        </div>

        {!hasActiveSubscription && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Upgrade to Premium for public discovery features
          </p>
        )}
      </CardContent>
    </Card>
  );
}); 
import React from "react";
import { Label } from "../../../../ui/label";
import { Button } from "../../../../ui/button";
import { Card, CardContent } from "../../../../ui/card";

interface DangerZoneSectionProps {
  onClearAllDataClick: () => void;
  onResetSettingsClick: () => void;
  hasConversations?: boolean;
}

export const DangerZoneSection: React.FC<DangerZoneSectionProps> = ({
  onClearAllDataClick,
  onResetSettingsClick,
  hasConversations = false,
}) => {
  return (
    <div>
      <Label className="text-base font-medium text-destructive">
        Danger Zone
      </Label>
      <Card className="border-destructive/20">
        <CardContent className="pt-4">
          <div className="space-y-8">
            <div className="space-y-2">
              <Label>Clear all conversations</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete all your conversations and reset all settings
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="mt-2"
                onClick={onClearAllDataClick}
                disabled={!hasConversations}
              >
                Clear all data
              </Button>
            </div>
            <div className="space-y-2">
              <Label>Reset all settings</Label>
              <p className="text-sm text-muted-foreground">
                Reset brokebot to default settings (keeps conversations)
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="mt-2"
                onClick={onResetSettingsClick}
              >
                Reset settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

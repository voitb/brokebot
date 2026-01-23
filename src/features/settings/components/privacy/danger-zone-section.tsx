import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface DangerZoneSectionProps {
  onClearAllDataClick: () => void;
  hasConversations?: boolean;
}

export function DangerZoneSection({
  onClearAllDataClick,
  hasConversations = false,
}: DangerZoneSectionProps) {
  return (
    <div>
      <Label className="text-base font-medium text-destructive">
        Danger Zone
      </Label>
      <Card className="border-destructive/20">
        <CardContent>
          <div>
            <div className="space-y-2">
              <Label>Clear all conversations</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete all your conversations and reset all settings
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              These actions cannot be undone. Please be certain before proceeding.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <Button
              variant="destructive"
              onClick={onClearAllDataClick}
              disabled={!hasConversations}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Conversations & Documents
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

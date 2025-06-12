import React from "react";
import { Button } from "../../../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";
import { CloudUpload } from "lucide-react";
import { Badge } from "../../../../ui/badge";

interface ManualSyncSectionProps {
  onSync: () => void;
  isSyncEnabled: boolean;
}

export const ManualSyncSection: React.FC<ManualSyncSectionProps> = ({
  onSync,
  isSyncEnabled,
}) => {
  return (
    <div>
      <h3 className="text-lg font-medium">Manual Synchronization</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Manually sync your conversations to the cloud to access them on other
        devices. Data is stored for 24 hours.
      </p>
      <Card className={!isSyncEnabled ? "border-dashed bg-muted/40" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-base">
            <span>Cloud Sync</span>
            {!isSyncEnabled && (
              <Badge variant="secondary">Plus Plan Required</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground max-w-[75%]">
              {isSyncEnabled
                ? "Ready to sync your conversations to the cloud."
                : "Upgrade to the Plus plan to enable cross-device sync."}
            </p>
            <Button onClick={onSync} disabled={!isSyncEnabled}>
              <CloudUpload className="w-4 h-4 mr-2" />
              Sync Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

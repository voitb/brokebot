import React from "react";
import { Button } from "../../../../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../ui/card";
import { CloudUpload, Loader2, CloudDownload } from "lucide-react";
import { Badge } from "../../../../ui/badge";

interface ManualSyncSectionProps {
  isSyncEnabled: boolean;
  isUploading: boolean;
  isDownloading: boolean;
  onUpload: () => void;
  onDownload: () => void;
}

export const ManualSyncSection: React.FC<ManualSyncSectionProps> = ({
  isSyncEnabled,
  isUploading,
  isDownloading,
  onUpload,
  onDownload,
}) => {
  const isSyncDisabled = !isSyncEnabled || isUploading || isDownloading;

  return (
    <div>
      <h3 className="text-lg font-medium">Manual Synchronization</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Upload your local conversations to the cloud, then download them on
        another device. Data is stored for 24 hours.
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
          <div className="flex items-center justify-between space-x-4">
            <p className="text-sm text-muted-foreground max-w-[60%]">
              {isSyncEnabled
                ? "Ready to sync your conversations."
                : "Upgrade to the Plus plan to enable cross-device sync."}
            </p>
            <div className="flex items-center space-x-2">
              <Button onClick={onUpload} disabled={isSyncDisabled}>
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CloudUpload className="w-4 h-4 mr-2" />
                )}
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
              <Button onClick={onDownload} disabled={isSyncDisabled} variant="outline">
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CloudDownload className="w-4 h-4 mr-2" />
                )}
                {isDownloading ? "Downloading..." : "Download"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

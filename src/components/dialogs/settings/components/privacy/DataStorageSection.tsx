import React from "react";
import { Label } from "../../../../ui/label";
import { Switch } from "../../../../ui/switch";
import { Card, CardContent } from "../../../../ui/card";
import { Info, Crown } from "lucide-react";

interface DataStorageSectionProps {
  storeConversationsLocally: boolean;
  storeConversationsInCloud: boolean;
  hasActiveSubscription: boolean;
  onToggleLocalStorage: (checked: boolean) => void;
  onToggleCloudStorage: (checked: boolean) => void;
}

export const DataStorageSection: React.FC<DataStorageSectionProps> = ({
  storeConversationsLocally,
  storeConversationsInCloud,
  hasActiveSubscription,
  onToggleLocalStorage,
  onToggleCloudStorage,
}) => {
  // Logic to prevent disabling both storage options
  const isLocalSwitchDisabled = !storeConversationsInCloud;
  const isCloudSwitchDisabled = !storeConversationsLocally || !hasActiveSubscription;
  
  return (
    <>
      <div>
        <Label className="text-base font-medium">Privacy & Data</Label>
        <p className="text-sm text-muted-foreground">
          Control how your data is stored and processed
        </p>
      </div>

      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
        <CardContent>
          <div className="flex items-start gap-3">
            <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Local Data Storage
              </p>
              <p className="text-blue-700 dark:text-blue-200 leading-relaxed">
                Your conversations are stored locally in your browser's
                IndexedDB database. This data remains on your computer until you
                manually delete it. No data is sent to external servers when
                using local AI models.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Store conversations locally</Label>
            <p className="text-sm text-muted-foreground">
              Keep your chat history in browser storage
            </p>
          </div>
          <Switch
            checked={storeConversationsLocally}
            onCheckedChange={onToggleLocalStorage}
            disabled={isLocalSwitchDisabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div>
              <Label className="flex items-center gap-2">
                Store conversations in cloud
                <Crown className="h-3 w-3 text-amber-500" />
              </Label>
              <p className="text-sm text-muted-foreground">
                Sync your conversations across devices (requires subscription)
              </p>
            </div>
          </div>
          <Switch
            checked={storeConversationsInCloud || false}
            onCheckedChange={onToggleCloudStorage}
            // disabled={isCloudSwitchDisabled}
          />
        </div>

        {isLocalSwitchDisabled && hasActiveSubscription && (
           <p className="text-xs text-amber-600 dark:text-amber-400">
            Cannot disable local storage while cloud storage is also disabled. At least one storage option must be active.
          </p>
        )}

        {!hasActiveSubscription && (
          <p className="text-xs text-amber-600 dark:text-amber-400">
            Cloud storage requires an active subscription. Upgrade to access
            this feature.
          </p>
        )}
      </div>
    </>
  );
};

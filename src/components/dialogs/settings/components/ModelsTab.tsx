import React from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { type UserConfig } from "@/lib/db";

interface ModelsTabProps {
  settings: Partial<UserConfig>;
  onFieldChange: <K extends keyof UserConfig>(
    field: K,
    value: UserConfig[K]
  ) => void;
}

export const ModelsTab: React.FC<ModelsTabProps> = ({
  settings,
  onFieldChange,
}) => {
  // In a real scenario, you might have a list of models to select here.
  // For now, we only have the auto-load toggle.
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="auto-load-model">Auto-load model</Label>
          <p className="text-xs text-muted-foreground">
            Automatically load the selected model on startup for faster first
            response.
          </p>
        </div>
        <Switch
          id="auto-load-model"
          checked={settings.autoLoadModel}
          onCheckedChange={(checked) => onFieldChange("autoLoadModel", checked)}
        />
      </div>
    </div>
  );
};

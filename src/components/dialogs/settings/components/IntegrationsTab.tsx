import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type UserConfig } from "@/lib/db";
import { type UserInfo } from "../types";

interface IntegrationsTabProps {
  settings: Partial<UserConfig>;
  onFieldChange: <K extends keyof UserConfig>(
    field: K,
    value: UserConfig[K]
  ) => void;
  userInfo: UserInfo;
}

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({
  settings,
  onFieldChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="openai-api-key">OpenAI API Key</Label>
        <Input
          id="openai-api-key"
          type="password"
          value={settings.openaiApiKey || ""}
          onChange={(e) => onFieldChange("openaiApiKey", e.target.value)}
          placeholder="sk-..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="anthropic-api-key">Anthropic API Key</Label>
        <Input
          id="anthropic-api-key"
          type="password"
          value={settings.anthropicApiKey || ""}
          onChange={(e) => onFieldChange("anthropicApiKey", e.target.value)}
          placeholder="sk-ant-..."
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="google-api-key">Google API Key</Label>
        <Input
          id="google-api-key"
          type="password"
          value={settings.googleApiKey || ""}
          onChange={(e) => onFieldChange("googleApiKey", e.target.value)}
          placeholder="AIzaSy..."
        />
      </div>
    </div>
  );
};

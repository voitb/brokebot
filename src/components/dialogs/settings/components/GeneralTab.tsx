import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { type UserConfig } from "@/lib/db";
import { useTheme } from "@/providers/ThemeProvider";

interface GeneralTabProps {
  settings: Partial<UserConfig>;
  onFieldChange: <K extends keyof UserConfig>(
    field: K,
    value: UserConfig[K]
  ) => void;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  settings,
  onFieldChange,
}) => {
  const { setTheme } = useTheme();

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    onFieldChange("theme", theme);
    setTheme(theme);
  };

  return (
    <div className="space-y-8">
      {/* Profile Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium">Profile</h3>
        <div className="space-y-4 pl-4 border-l-2">
          <div className="space-y-2">
            <Label htmlFor="username">Your Name</Label>
            <Input
              id="username"
              value={settings.username || ""}
              onChange={(e) => onFieldChange("username", e.target.value)}
              placeholder="How should the AI address you?"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select
              value={settings.theme || "system"}
              onValueChange={handleThemeChange}
            >
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      <Separator />

      {/* Models Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium">Local Models</h3>
        <div className="pl-4 border-l-2">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="auto-load-model">Auto-load model</Label>
              <p className="text-xs text-muted-foreground">
                Automatically load the selected model on startup for faster
                first response.
              </p>
            </div>
            <Switch
              id="auto-load-model"
              checked={settings.autoLoadModel}
              onCheckedChange={(checked) =>
                onFieldChange("autoLoadModel", checked)
              }
            />
          </div>
        </div>
      </section>

      <Separator />

      {/* API Keys Section */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium">API Keys</h3>
        <div className="space-y-4 pl-4 border-l-2">
          <div className="space-y-2">
            <Label htmlFor="openrouter-api-key">OpenRouter API Key</Label>
            <Input
              id="openrouter-api-key"
              type="password"
              value={settings.openrouterApiKey || ""}
              onChange={(e) =>
                onFieldChange("openrouterApiKey", e.target.value)
              }
              placeholder="sk-or-..."
            />
          </div>
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
      </section>
    </div>
  );
};

import React, { useState, useEffect } from "react";
import { type Models } from "appwrite";
import { toast } from "sonner";
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
import { Button } from "@/components/ui/button";
import { type UserConfig } from "@/lib/db";
import { useTheme } from "@/providers/ThemeProvider";

interface GeneralTabProps {
  settings: Partial<UserConfig>;
  onFieldChange: <K extends keyof UserConfig>(
    field: K,
    value: UserConfig[K]
  ) => void;
  user: Models.User<Models.Preferences> | null;
  onUpdateName: (name: string) => Promise<void>;
  onUpdatePassword: (oldPass: string, newPass: string) => Promise<void>;
  onSaveChanges: () => Promise<void>;
}

export const GeneralTab: React.FC<GeneralTabProps> = ({
  settings,
  onFieldChange,
  user,
  onUpdateName,
  onUpdatePassword,
  onSaveChanges,
}) => {
  const { setTheme } = useTheme();
  const [name, setName] = useState(user?.name || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    setName(user?.name || "");
  }, [user]);

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    onFieldChange("theme", theme);
    setTheme(theme);
  };
  
  const isEmailUser = !!user?.password;

  const handleNameUpdate = async () => {
    if (!user || name === user.name) return;
    try {
      await onUpdateName(name);
      toast.success("Name updated successfully!");
    } catch (error) {
      toast.error("Failed to update name. Please try again.");
      setName(user.name); // Revert on failure
    }
  };

  const handlePasswordUpdate = async () => {
    if (!oldPassword || !newPassword) {
      toast.error("Both old and new passwords are required.");
      return;
    }
    try {
      await onUpdatePassword(oldPassword, newPassword);
      toast.success("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      toast.error("Failed to update password. Check your old password.");
    }
  };

  return (
    <div className="space-y-8">
      {user ? (
        <section className="space-y-4">
          <h3 className="text-lg font-medium">Account</h3>
          <div className="space-y-6 pl-4 border-l-2">
            <div className="space-y-2">
              <Label htmlFor="account-name">Name</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="account-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <Button
                  onClick={handleNameUpdate}
                  disabled={name === user.name || !name}
                >
                  Update
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="account-email">Email</Label>
              <Input
                id="account-email"
                value={user.email}
                disabled
              />
            </div>
            {isEmailUser && (
              <div className="space-y-4 rounded-lg border p-4">
                 <h4 className="font-medium">Change Password</h4>
                 <div className="space-y-2">
                   <Label htmlFor="old-password">Old Password</Label>
                   <Input 
                    id="old-password" 
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                  />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="new-password">New Password</Label>
                   <Input 
                    id="new-password" 
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                   />
                 </div>
                 <Button onClick={handlePasswordUpdate}>Update Password</Button>
              </div>
            )}
          </div>
        </section>
      ) : (
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
          </div>
        </section>
      )}

      {/* General Settings */}
      <section className="space-y-4">
        <h3 className="text-lg font-medium">Appearance</h3>
        <div className="space-y-4 pl-4 border-l-2">
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
              checked={!!settings.autoLoadModel}
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

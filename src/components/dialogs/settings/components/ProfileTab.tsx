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
import { type UserConfig } from "@/lib/db";
import { useTheme } from "@/providers/ThemeProvider";

interface ProfileTabProps {
  settings: Partial<UserConfig>;
  onFieldChange: <K extends keyof UserConfig>(
    field: K,
    value: UserConfig[K]
  ) => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  settings,
  onFieldChange,
}) => {
  const { setTheme } = useTheme();

  const handleThemeChange = (theme: "light" | "dark" | "system") => {
    onFieldChange("theme", theme);
    setTheme(theme);
  };

  return (
    <div className="space-y-6">
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
          onValueChange={(value: "light" | "dark" | "system") =>
            handleThemeChange(value)
          }
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
  );
};

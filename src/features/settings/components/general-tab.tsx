import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OpenRouterIcon } from "@/components/ui/provider-icons";
import { type UserConfig } from "@/lib/db";
import { useTheme } from "@/hooks/use-theme";
import { ApiKeySection } from "@/features/chat/components/online-model-dialog/api-key-section";

interface GeneralTabProps {
  settings: Partial<UserConfig>;
  onFieldChange: <K extends keyof UserConfig>(field: K, value: UserConfig[K]) => void;
  onSaveChanges: () => Promise<void>;
  isSaving: boolean;
}

const apiKeyProviders = [
  {
    id: "openrouter",
    name: "OpenRouter",
    icon: <OpenRouterIcon />,
    url: "https://openrouter.ai/keys",
  },
] as const;

export function GeneralTab({
  settings,
  onFieldChange,
  onSaveChanges,
  isSaving,
}: GeneralTabProps) {
  const { setTheme } = useTheme();

  const handleThemeChange = async (theme: "light" | "dark" | "system") => {
    onFieldChange("theme", theme);
    try {
      await setTheme(theme);
    } catch {
      return;
    }
  };

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-lg font-medium">Profile</h3>
        <div className="space-y-4 pl-4 border-l-2">
          <div className="space-y-2">
            <Label htmlFor="username">Your Name</Label>
            <Input
              id="username"
              value={settings.username || ""}
              onChange={(e) => onFieldChange("username", e.target.value)}
              placeholder="Your name"
            />
          </div>
        </div>
      </section>

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
        <div className="flex justify-end">
          <Button onClick={onSaveChanges} disabled={isSaving}>
            Save changes
          </Button>
        </div>
      </section>

      <Separator />

      <section className="space-y-4">
        <h3 className="text-lg font-medium">API Keys</h3>
        <div className="space-y-4 pl-4 border-l-2">
          {apiKeyProviders.map((provider) => (
            <Card key={provider.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {provider.icon}
                  {provider.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ApiKeySection provider={provider.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}

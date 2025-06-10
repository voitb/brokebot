import { Label } from "../../../ui/label";
import { Button } from "../../../ui/button";
import { Switch } from "../../../ui/switch";
import { Separator } from "../../../ui/separator";
import { Card, CardContent } from "../../../ui/card";
import { Info, ExternalLink } from "lucide-react";
import { useUserConfig } from "../../../../hooks/useUserConfig";
import { toast } from "sonner";

export function PrivacyTab() {
  const {
    config,
    updateConfig,
    resetConfig,
    clearAllData,
    exportConversations,
  } = useUserConfig();

  const handleToggleLocalStorage = async (checked: boolean) => {
    await updateConfig({ storeConversationsLocally: checked });
    toast.success(checked ? "Local storage enabled" : "Local storage disabled");
  };

  const handleClearAllData = async () => {
    if (
      window.confirm(
        "Are you sure you want to delete ALL conversations and reset settings? This cannot be undone."
      )
    ) {
      await clearAllData();
      toast.success("All data cleared successfully");
    }
  };

  const handleResetSettings = async () => {
    if (
      window.confirm("Are you sure you want to reset all settings to defaults?")
    ) {
      await resetConfig();
      toast.success("Settings reset to defaults");
    }
  };

  const handleExportConversations = async () => {
    await exportConversations();
    toast.success("Conversations exported successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Privacy & Data</Label>
        <p className="text-sm text-muted-foreground">
          Control how your data is stored and processed
        </p>
      </div>

      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
        <CardContent className="pt-4">
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
            checked={config.storeConversationsLocally}
            onCheckedChange={handleToggleLocalStorage}
          />
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-base font-medium">Legal & Terms</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Review our terms and policies
        </p>
        <Button variant="outline" className="w-full" asChild>
          <a href="/terms" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Terms of Service
          </a>
        </Button>
      </div>

      <Separator />

      <div>
        <Label className="text-base font-medium">Data Export</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Download your data for backup or migration
        </p>
        <div className="space-y-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleExportConversations}
          >
            Export conversations as JSON
          </Button>
        </div>
      </div>

      <div>
        <Label className="text-base font-medium text-destructive">
          Danger Zone
        </Label>
        <Card className="border-destructive/20">
          <CardContent className="pt-4">
            <div className="space-y-8">
              <div className="space-y-2">
                <Label>Clear all conversations</Label>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all your conversations and reset all
                  settings
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2"
                  onClick={handleClearAllData}
                >
                  Clear all data
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Reset all settings</Label>
                <p className="text-sm text-muted-foreground">
                  Reset Local-GPT to default settings (keeps conversations)
                </p>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2"
                  onClick={handleResetSettings}
                >
                  Reset settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { Label } from "../../../ui/label";
import { Button } from "../../../ui/button";
import { Switch } from "../../../ui/switch";
import { Separator } from "../../../ui/separator";
import { Card, CardContent } from "../../../ui/card";

export function PrivacyTab() {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Privacy & Data</Label>
        <p className="text-sm text-muted-foreground">
          Control how your data is stored and processed
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Store conversations locally</Label>
            <p className="text-sm text-muted-foreground">
              Keep your chat history in browser storage
            </p>
          </div>
          <Switch defaultChecked />
        </div>
      </div>

      <Separator />

      <div>
        <Label className="text-base font-medium">Data Export</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Download your data for backup or migration
        </p>
        <div className="space-y-2">
          <Button variant="outline" className="w-full">
            Export conversations
          </Button>
          <Button variant="outline" className="w-full">
            Export settings
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
                  Permanently delete all your conversations
                </p>
                <Button variant="destructive" size="sm" className="mt-2">
                  Clear conversations
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Reset all settings</Label>
                <p className="text-sm text-muted-foreground">
                  Reset Local-GPT to default settings
                </p>
                <Button variant="destructive" size="sm" className="mt-2">
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

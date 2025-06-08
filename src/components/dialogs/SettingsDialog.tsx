import { useState } from "react";
import { User, Palette, Shield, CreditCard, Plug, Bot } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { useTheme } from "../../hooks/useTheme";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SettingsTab =
  | "profile"
  | "appearance"
  | "privacy"
  | "integrations"
  | "models"
  | "billing";

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const { theme, setTheme } = useTheme();

  // Mock user data - replace with real data from your auth system
  const [userData, setUserData] = useState({
    fullName: "User",
    nickname: "User",
    workFunction: "",
    preferences: "",
  });

  // Mock API keys - replace with secure storage
  const [apiKeys, setApiKeys] = useState({
    openai: "",
    anthropic: "",
    google: "",
  });

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: User },
    { id: "appearance" as const, label: "Appearance", icon: Palette },
    { id: "models" as const, label: "AI Models", icon: Bot },
    { id: "integrations" as const, label: "Integrations", icon: Plug },
    { id: "privacy" as const, label: "Privacy", icon: Shield },
    { id: "billing" as const, label: "Billing", icon: CreditCard },
  ];

  const handleSave = () => {
    // TODO: Save settings to backend/localStorage
    console.log("Saving settings...", { userData, apiKeys, theme });
    onOpenChange(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="fullName" className="text-sm font-medium">
                  Full name
                </Label>
                <Input
                  id="fullName"
                  value={userData.fullName}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="nickname" className="text-sm font-medium">
                  What should we call you?
                </Label>
                <Input
                  id="nickname"
                  value={userData.nickname}
                  onChange={(e) =>
                    setUserData((prev) => ({
                      ...prev,
                      nickname: e.target.value,
                    }))
                  }
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="workFunction" className="text-sm font-medium">
                What best describes your work?
              </Label>
              <Select
                value={userData.workFunction}
                onValueChange={(value) =>
                  setUserData((prev) => ({ ...prev, workFunction: value }))
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your work function" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="software-engineer">
                    Software Engineer
                  </SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="product-manager">
                    Product Manager
                  </SelectItem>
                  <SelectItem value="researcher">Researcher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="preferences" className="text-sm font-medium">
                Personal AI preferences
                <Badge className="ml-2">BETA</Badge>
              </Label>
              <p className="text-xs text-muted-foreground mt-1 mb-2">
                Your preferences will apply to all conversations with local AI
                models.
              </p>
              <Textarea
                id="preferences"
                value={userData.preferences}
                onChange={(e) =>
                  setUserData((prev) => ({
                    ...prev,
                    preferences: e.target.value,
                  }))
                }
                placeholder="e.g. keep explanations brief and to the point"
                className="mt-1 min-h-[100px]"
              />
            </div>
          </div>
        );

      case "appearance":
        return (
          <div className="space-y-8">
            <div>
              <Label className="text-base font-medium">Theme</Label>
              <p className="text-sm text-muted-foreground">
                Choose how BrokeBot looks and feels
              </p>
              <div className="mt-6 grid grid-cols-3 gap-4">
                {(["light", "dark", "system"] as const).map((themeOption) => (
                  <Card
                    key={themeOption}
                    className={`cursor-pointer transition-all ${
                      theme === themeOption
                        ? "ring-2 ring-primary"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setTheme(themeOption)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="mb-2 h-8 w-full rounded border bg-gradient-to-br from-background to-muted"></div>
                      <p className="text-sm font-medium capitalize">
                        {themeOption}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-base font-medium">Display settings</Label>
              <div className="mt-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Compact mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduce spacing between messages
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Show timestamps</Label>
                    <p className="text-sm text-muted-foreground">
                      Display message timestamps
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </div>
        );

      case "models":
        return (
          <div className="space-y-8">
            <div>
              <Label className="text-base font-medium">Local AI Models</Label>
              <p className="text-sm text-muted-foreground">
                Manage WebLLM models running locally in your browser
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Model Cache Management
                </CardTitle>
                <CardDescription>
                  Downloaded models are cached in your browser for faster
                  loading
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cache size</span>
                    <Badge variant="secondary">~2.4 GB</Badge>
                  </div>
                  <Button variant="destructive" size="sm" className="w-full">
                    Clear model cache
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">
                  Default Model Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Preferred model</Label>
                  <Select defaultValue="llama">
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="llama">
                        Llama-3.1-8B-Instruct
                      </SelectItem>
                      <SelectItem value="phi3">
                        Phi-3-mini-4k-instruct
                      </SelectItem>
                      <SelectItem value="gemma">Gemma-2B-it</SelectItem>
                      <SelectItem value="qwen">Qwen2-1.5B-Instruct</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-load preferred model</Label>
                    <p className="text-sm text-muted-foreground">
                      Load your preferred model automatically
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "integrations":
        return (
          <div className="space-y-8">
            <div>
              <Label className="text-base font-medium">API Integrations</Label>
              <p className="text-sm text-muted-foreground">
                Connect external AI services to access more models
              </p>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">OpenAI API</CardTitle>
                    <Badge variant={apiKeys.openai ? "default" : "secondary"}>
                      {apiKeys.openai ? "Connected" : "Not connected"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Access GPT-4, GPT-4 Turbo, and other OpenAI models
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="openai-key">API Key</Label>
                    <Input
                      id="openai-key"
                      type="password"
                      value={apiKeys.openai}
                      onChange={(e) =>
                        setApiKeys((prev) => ({
                          ...prev,
                          openai: e.target.value,
                        }))
                      }
                      placeholder="sk-..."
                    />
                    <p className="text-xs text-muted-foreground">
                      Get your API key from OpenAI Platform
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Anthropic API</CardTitle>
                    <Badge
                      variant={apiKeys.anthropic ? "default" : "secondary"}
                    >
                      {apiKeys.anthropic ? "Connected" : "Not connected"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Access Claude models from Anthropic
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="anthropic-key">API Key</Label>
                    <Input
                      id="anthropic-key"
                      type="password"
                      value={apiKeys.anthropic}
                      onChange={(e) =>
                        setApiKeys((prev) => ({
                          ...prev,
                          anthropic: e.target.value,
                        }))
                      }
                      placeholder="sk-ant-api..."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Google AI Studio</CardTitle>
                    <Badge variant={apiKeys.google ? "default" : "secondary"}>
                      {apiKeys.google ? "Connected" : "Not connected"}
                    </Badge>
                  </div>
                  <CardDescription>
                    Access Gemini models from Google
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="google-key">API Key</Label>
                    <Input
                      id="google-key"
                      type="password"
                      value={apiKeys.google}
                      onChange={(e) =>
                        setApiKeys((prev) => ({
                          ...prev,
                          google: e.target.value,
                        }))
                      }
                      placeholder="AIza..."
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "privacy":
        return (
          <div className="space-y-8">
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

              <div className="flex items-center justify-between">
                <div>
                  <Label>Analytics</Label>
                  <p className="text-sm text-muted-foreground">
                    Help improve BrokeBot with anonymous usage data
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Crash reporting</Label>
                  <p className="text-sm text-muted-foreground">
                    Send error reports to help fix bugs
                  </p>
                </div>
                <Switch />
              </div>
            </div>

            <Separator />

            <div>
              <Label className="text-base font-medium">Data Export</Label>
              <p className="text-sm text-muted-foreground mb-4">
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
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Clear all conversations</Label>
                      <p className="text-sm text-muted-foreground">
                        Permanently delete all your conversations
                      </p>
                      <Button variant="destructive" size="sm" className="mt-2">
                        Clear conversations
                      </Button>
                    </div>
                    <div>
                      <Label>Reset all settings</Label>
                      <p className="text-sm text-muted-foreground">
                        Reset BrokeBot to default settings
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

      case "billing":
        return (
          <div className="space-y-8">
            <div>
              <Label className="text-base font-medium">Current Plan</Label>
              <p className="text-sm text-muted-foreground">
                You're currently on the free plan
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Free Plan
                  <Badge>Current</Badge>
                </CardTitle>
                <CardDescription>
                  Perfect for getting started with local AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Unlimited local AI conversations</li>
                  <li>✓ 5+ local AI models</li>
                  <li>✓ Browser-based storage</li>
                  <li>✓ No data sent to servers</li>
                  <li>✓ Export conversations</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  Pro Plan
                  <Badge variant="secondary">Coming Soon</Badge>
                </CardTitle>
                <CardDescription>
                  Enhanced features for power users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Everything in Free</li>
                  <li>✓ Cloud backup & sync</li>
                  <li>✓ Advanced model settings</li>
                  <li>✓ Priority model downloads</li>
                  <li>✓ Custom AI personas</li>
                  <li>✓ Team collaboration</li>
                </ul>
                <Button className="w-full mt-4" disabled>
                  Coming Soon
                </Button>
              </CardContent>
            </Card>

            <div>
              <Label className="text-base font-medium">API Usage</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Track your external API usage and costs
              </p>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground text-center">
                    Connect API keys in Integrations to see usage statistics
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[90vw] h-[85vh] overflow-hidden p-0 gap-0">
        <DialogHeader className="px-6 py-5 border-b bg-card/50">
          <DialogTitle className="text-2xl font-semibold">Settings</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Manage your preferences and account settings
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden h-full">
          {/* Sidebar */}
          <nav className="w-72 border-r bg-muted/20 p-6 overflow-y-auto">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden max-w-4xl">
            <div className="flex-1 overflow-y-auto max-w-4xl">
              <div className="p-8 max-w-4xl">{renderTabContent()}</div>
            </div>

            {/* Footer */}
            <div className="border-t bg-card/50 px-8 py-6 flex justify-end gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                size="lg"
              >
                Cancel
              </Button>
              <Button onClick={handleSave} size="lg">
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

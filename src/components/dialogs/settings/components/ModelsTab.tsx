import { Label } from "../../../ui/label";
import { Button } from "../../../ui/button";
import { Switch } from "../../../ui/switch";
import { Badge } from "../../../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import { useUserConfig } from "../../../../hooks/useUserConfig";
import {
  useWebLLM,
  AVAILABLE_MODELS,
} from "../../../../providers/WebLLMProvider";
import { toast } from "sonner";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";

export function ModelsTab() {
  const { config, updateConfig } = useUserConfig();
  const { selectedModel, isLoading, status, setSelectedModel, loadModel } =
    useWebLLM();
  const [storageUsage, setStorageUsage] = useState<string>("Calculating...");

  // Check storage usage on mount
  useEffect(() => {
    const checkStorageUsage = async () => {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        try {
          const estimate = await navigator.storage.estimate();
          const usageInMB = (estimate.usage || 0) / (1024 * 1024);
          setStorageUsage(`~${usageInMB.toFixed(1)} MB`);
        } catch {
          setStorageUsage("Unknown");
        }
      } else {
        setStorageUsage("Not supported");
      }
    };

    checkStorageUsage();
  }, []);

  const handleModelChange = async (modelId: string) => {
    const model = AVAILABLE_MODELS.find((m) => m.id === modelId);
    if (model) {
      setSelectedModel(model);
      await updateConfig({ selectedModelId: modelId });
    }
  };

  const handleAutoLoadToggle = async (checked: boolean) => {
    await updateConfig({ autoLoadModel: checked });
    toast.success(checked ? "Auto-load enabled" : "Auto-load disabled");
  };

  const handleClearCache = async () => {
    if (
      window.confirm(
        "Are you sure you want to clear the model cache? Models will need to be downloaded again."
      )
    ) {
      // Clear IndexedDB cache for models
      if ("caches" in window) {
        caches.keys().then((names) => {
          names.forEach((name) => {
            if (name.includes("webllm") || name.includes("model")) {
              caches.delete(name);
            }
          });
        });
      }

      // Clear IDB cache as well
      try {
        const dbs = await indexedDB.databases();
        await Promise.all(
          dbs
            .filter(
              (db) => db.name?.includes("webllm") || db.name?.includes("model")
            )
            .map((db) => {
              if (db.name) {
                const deleteReq = indexedDB.deleteDatabase(db.name);
                return new Promise((resolve, reject) => {
                  deleteReq.onsuccess = () => resolve(undefined);
                  deleteReq.onerror = () => reject(deleteReq.error);
                });
              }
              return Promise.resolve();
            })
        );

        // Update storage display
        const estimate = await navigator.storage.estimate();
        const usageInMB = (estimate.usage || 0) / (1024 * 1024);
        setStorageUsage(`~${usageInMB.toFixed(1)} MB`);

        toast.success("Model cache cleared");
      } catch {
        toast.success("Model cache cleared");
      }
    }
  };

  const handleReloadModel = async () => {
    try {
      await loadModel(selectedModel.id);
      toast.success("Model reloaded successfully");
    } catch {
      toast.error("Failed to reload model");
    }
  };

  const isModelError = status.includes("error") || status.includes("Error");

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Local AI Models</Label>
        <p className="text-sm text-muted-foreground">
          Manage WebLLM models running locally in your browser
        </p>
      </div>

      {isModelError && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive">
                  Model Loading Error
                </p>
                <p className="text-sm text-muted-foreground mt-1">{status}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleReloadModel}
                  disabled={isLoading}
                >
                  <RefreshCw
                    className={`w-3 h-3 mr-1 ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                  Reload Model
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Model Cache Management</CardTitle>
          <CardDescription>
            Downloaded models are cached in your browser for faster loading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Storage used</span>
              <Badge variant="secondary">{storageUsage}</Badge>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="w-full"
              onClick={handleClearCache}
            >
              Clear model cache
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Model Selection
            {isLoading && (
              <Badge variant="secondary" className="ml-2">
                <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse mr-1" />
                Loading...
              </Badge>
            )}
          </CardTitle>
          <CardDescription>Current status: {status}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Preferred model</Label>
            <Select
              value={selectedModel.id}
              onValueChange={handleModelChange}
              disabled={isLoading}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{model.name}</span>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {model.size}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">
              {selectedModel.description}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-load preferred model</Label>
              <p className="text-sm text-muted-foreground">
                Load your preferred model automatically on startup
              </p>
            </div>
            <Switch
              checked={config.autoLoadModel}
              onCheckedChange={handleAutoLoadToggle}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

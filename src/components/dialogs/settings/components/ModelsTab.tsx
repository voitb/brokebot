import { Label } from "../../../ui/label";
import { Button } from "../../../ui/button";
import { Switch } from "../../../ui/switch";
import { Badge } from "../../../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../../../ui/popover";
import { useSettingsContext } from "../SettingsDialog";
import {
  useWebLLM,
  AVAILABLE_MODELS,
  type ModelInfo,
} from "../../../../providers/WebLLMProvider";
import { toast } from "sonner";
import { AlertCircle, RefreshCw, Check, ChevronsUpDown } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "../../../../lib/utils";

export function ModelsTab() {
  const { tempConfig, setTempConfig } = useSettingsContext();
  const { selectedModel, isLoading, status, setSelectedModel, loadModel } =
    useWebLLM();
  const [storageUsage, setStorageUsage] = useState<string>("Calculating...");
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

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

  const handleModelChange = (modelId: string) => {
    const model = AVAILABLE_MODELS.find((m) => m.id === modelId);
    if (model) {
      setSelectedModel(model);
      setTempConfig({ selectedModelId: modelId });
      setOpen(false);
    }
  };

  const handleAutoLoadToggle = (checked: boolean) => {
    setTempConfig({ autoLoadModel: checked });
    toast.info(
      `Auto-load ${checked ? "enabled" : "disabled"}. Save changes to apply.`
    );
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
        toast.error("Failed to clear cache for all databases.");
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
        <Label className="text-base font-medium">
          Local (In-Browser) Model Settings
        </Label>
        <p className="text-sm text-muted-foreground">
          Manage the default model that runs locally in your browser via WebLLM,
          and control its cache.
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
            <Popover open={open} onOpenChange={setOpen} modal={true}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between mt-1"
                  disabled={isLoading}
                >
                  {AVAILABLE_MODELS.find(
                    (m) => m.id === tempConfig.selectedModelId
                  )?.name || "Select a model"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search models..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandList>
                    <CommandEmpty>No model found.</CommandEmpty>
                    <CommandGroup>
                      {AVAILABLE_MODELS.map((model) => (
                        <CommandItem
                          key={model.id}
                          value={`${model.name} ${model.description} ${
                            (model as ModelInfo).specialization || ""
                          } ${model.performance} ${model.category} ${
                            model.modelType
                          }`}
                          onSelect={() => handleModelChange(model.id)}
                          className="flex items-center justify-between p-3"
                        >
                          <div className="flex flex-col items-start">
                            <span className="font-medium">{model.name}</span>
                            <p className="text-xs text-muted-foreground mb-2">
                              {model.description}
                            </p>
                            <div className="flex gap-2">
                              <Badge variant="outline" className="text-xs">
                                {model.size}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {model.performance}
                              </Badge>
                              {model.modelType !== "LLM" && (
                                <Badge variant="default" className="text-xs">
                                  {model.modelType}
                                </Badge>
                              )}
                              {(model as ModelInfo).specialization && (
                                <Badge
                                  variant="destructive"
                                  className="text-xs"
                                >
                                  {(model as ModelInfo).specialization}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Check
                            className={cn(
                              "ml-2 h-4 w-4 shrink-0",
                              tempConfig.selectedModelId === model.id
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <p className="text-xs text-muted-foreground mt-1">
              {AVAILABLE_MODELS.find((m) => m.id === tempConfig.selectedModelId)
                ?.description || ""}
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
              checked={tempConfig.autoLoadModel}
              onCheckedChange={handleAutoLoadToggle}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

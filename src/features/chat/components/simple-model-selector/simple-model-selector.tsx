import { useState } from "react";
import { ChevronDown, Cpu, Cloud, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useWebLLM, type ModelInfo } from "@/app/providers/web-llm-provider";
import {
  useModel,
  createLocalModel,
  createOnlineModel,
} from "@/app/providers/model-provider";
import { OnlineModelDialog } from "../online-model-dialog/online-model-dialog";
import { type OpenRouterModel } from "@/features/chat/lib/openrouter";
import { toast } from "sonner";
import { LocalModelList } from "./local-model-list";
import { useUserConfig } from "@/shared/hooks/use-user-config";

interface SimpleModelSelectorProps {
  disabled?: boolean;
}

export function SimpleModelSelector({
  disabled = false,
}: SimpleModelSelectorProps) {
  const { selectedModel: webllmModel, availableModels } = useWebLLM();
  const { currentModel, setCurrentModel } = useModel();
  const { config } = useUserConfig();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isOnlineModel = currentModel?.type === "online";
  const displayName = !currentModel
    ? "Initializing..."
    : isOnlineModel
    ? currentModel.onlineModel?.name || "Online Model"
    : webllmModel.name;

  const isOpenRouterKeyAvailable = !!config?.openrouterApiKey;

  const handleLocalModelSelect = (model: ModelInfo) => {
    const localModel = createLocalModel(model);
    setCurrentModel(localModel);
    setIsDropdownOpen(false);
  };

  const handleOnlineModelSelect = (model: OpenRouterModel, apiKey: string) => {
    if (!apiKey) {
      toast.error("OpenRouter API key is required");
      return;
    }

    const onlineModel = createOnlineModel(model, apiKey);
    setCurrentModel(onlineModel);
  };

  const handleDialogTrigger = () => {
    setIsDropdownOpen(false);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex items-center gap-2">
      <OnlineModelDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onModelSelect={handleOnlineModelSelect}
        selectedModel={isOnlineModel ? currentModel.onlineModel : null}
      />

      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground gap-1"
          >
            {isOnlineModel ? (
              <Cloud className="w-3 h-3" />
            ) : (
              <Cpu className="w-3 h-3" />
            )}
            <span className="hidden sm:inline">{displayName}</span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-80">
          <DropdownMenuLabel className="flex items-center justify-between text-xs font-medium text-muted-foreground">
            <div className="flex items-center gap-2">
              <Cloud className="w-3 h-3" />
              Online Models
            </div>
            {isOpenRouterKeyAvailable ? (
              <Badge variant="default" className="text-xs">
                API Ready
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                <Key className="w-2 h-2 mr-1" />
                API Key Required
              </Badge>
            )}
          </DropdownMenuLabel>

          <DropdownMenuItem
            onClick={handleDialogTrigger}
            className="flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer hover:bg-accent rounded-sm"
          >
            Browse Online Models...
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Cpu className="w-3 h-3" />
            Local Models
          </DropdownMenuLabel>

          <LocalModelList
            availableModels={[...availableModels]}
            webllmModel={webllmModel}
            onSelect={handleLocalModelSelect}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

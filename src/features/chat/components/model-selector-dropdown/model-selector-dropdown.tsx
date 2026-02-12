import { useEffect } from "react";
import { ChevronDown, Cpu, Cloud, Key, Loader2 } from "lucide-react";
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
import { OnlineModelDialog } from "../online-model-dialog/online-model-dialog";
import { DropdownLocalModelList } from "./dropdown-local-model-list";
import { useModelSelectorDropdown } from "./use-model-selector-dropdown";

interface ModelSelectorDropdownProps {
  disabled?: boolean;
}

export function ModelSelectorDropdown({
  disabled = false,
}: ModelSelectorDropdownProps) {
  const {
    isDropdownOpen,
    setIsDropdownOpen,
    isDialogOpen,
    setIsDialogOpen,
    isOnlineModel,
    displayName,
    isOpenRouterKeyAvailable,
    currentModel,
    availableModels,
    activeLocalModel,
    isLoadingModels,
    handleLocalModelSelect,
    handleOnlineModelSelect,
    handleDialogTrigger,
    loadLocalModels,
  } = useModelSelectorDropdown();

  // Load local models when dropdown is opened and models not yet loaded
  useEffect(() => {
    if (isDropdownOpen && availableModels.length === 0 && !isLoadingModels) {
      loadLocalModels();
    }
  }, [isDropdownOpen, availableModels.length, isLoadingModels, loadLocalModels]);

  return (
    <div className="flex items-center gap-2">
      <OnlineModelDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onModelSelect={handleOnlineModelSelect}
        selectedModel={currentModel?.type === "online" ? currentModel.onlineModel : null}
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
            {isLoadingModels && <Loader2 className="w-3 h-3 animate-spin" />}
          </DropdownMenuLabel>

          {isLoadingModels ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading available models...
            </div>
          ) : (
            <DropdownLocalModelList
              availableModels={availableModels}
              value={activeLocalModel}
              onChange={handleLocalModelSelect}
            />
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

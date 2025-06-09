import { useState } from "react";
import { Check, ChevronsUpDown, Cpu, Cloud, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Badge } from "../ui/badge";
import { useWebLLM } from "../../providers/WebLLMProvider";

interface ModelSelectorProps {
  disabled?: boolean;
}

export function ModelSelector({ disabled = false }: ModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const { selectedModel, availableModels, setSelectedModel, isLoading } =
    useWebLLM();

  const getDisplayName = (modelName: string) => {
    if (modelName.includes("Llama")) return "Llama-3.1";
    if (modelName.includes("Phi")) return "Phi-3";
    if (modelName.includes("Gemma")) return "Gemma-2B";
    if (modelName.includes("Qwen")) return "Qwen2";
    if (modelName.includes("Mistral")) return "Mistral-7B";
    return modelName.split("-")[0];
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground justify-start"
          disabled={disabled || isLoading}
        >
          <div className="flex items-center gap-1">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Cpu className="w-4 h-4" />
            )}
            <span className="hidden sm:inline text-xs">
              {getDisplayName(selectedModel.name)}
            </span>
          </div>
          <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0"
        align="start"
        side="top"
        sideOffset={5}
      >
        <Command>
          <CommandInput placeholder="Search models..." className="h-9" />
          <CommandEmpty>No model found.</CommandEmpty>
          <CommandList>
            <CommandGroup heading="Local Models (WebLLM)">
              {availableModels.map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.name}
                  onSelect={() => {
                    setSelectedModel(model);
                    setOpen(false);
                  }}
                  className="flex items-center gap-3 p-3"
                >
                  <Cpu className="w-4 h-4" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{model.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        Free • {model.size}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {model.description}
                    </p>
                  </div>
                  <Check
                    className={`ml-auto h-4 w-4 ${
                      selectedModel.id === model.id
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  />
                </CommandItem>
              ))}
            </CommandGroup>

            <CommandGroup heading="External APIs (Coming Soon)">
              <CommandItem disabled className="flex items-center gap-3 p-3">
                <Cloud className="w-4 h-4" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">GPT-4 Turbo</span>
                    <Badge variant="outline" className="text-xs">
                      API Key Required
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    OpenAI's most advanced model
                  </p>
                </div>
              </CommandItem>

              <CommandItem disabled className="flex items-center gap-3 p-3">
                <Cloud className="w-4 h-4" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Claude 3.5 Sonnet
                    </span>
                    <Badge variant="outline" className="text-xs">
                      API Key Required
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Anthropic's reasoning specialist
                  </p>
                </div>
              </CommandItem>

              <CommandItem disabled className="flex items-center gap-3 p-3">
                <Cloud className="w-4 h-4" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      Gemini 2.0 Flash
                    </span>
                    <Badge variant="outline" className="text-xs">
                      API Key Required
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Google's latest multimodal model
                  </p>
                </div>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

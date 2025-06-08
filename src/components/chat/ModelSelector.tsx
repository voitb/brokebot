import { useState } from "react";
import { Check, ChevronsUpDown, Cpu, Cloud } from "lucide-react";
import type { ModelType } from "../../types";
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

// Importy shadcn - tymczasowo komentowane do czasu instalacji
// import { Button } from '../ui/button';
// import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/command';
// import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
// import { Badge } from '../ui/badge';

interface ModelOption {
  value: ModelType;
  label: string;
  description: string;
  icon: React.ReactNode;
  badge?: string;
  disabled?: boolean;
}

const modelOptions: ModelOption[] = [
  // WebLLM Local Models (Real models from WebLLM)
  {
    value: "local",
    label: "Llama-3.1-8B-Instruct",
    description: "Meta's latest Llama model - runs locally in browser",
    icon: <Cpu className="w-4 h-4" />,
    badge: "Free • 8B",
  },
  {
    value: "phi3",
    label: "Phi-3-mini-4k-instruct",
    description: "Microsoft's efficient small model - fast & lightweight",
    icon: <Cpu className="w-4 h-4" />,
    badge: "Free • 3.8B",
  },
  {
    value: "gemma-2b",
    label: "Gemma-2B-it",
    description: "Google's compact model - very fast inference",
    icon: <Cpu className="w-4 h-4" />,
    badge: "Free • 2B",
  },
  {
    value: "qwen",
    label: "Qwen2-1.5B-Instruct",
    description: "Alibaba's efficient model - good for quick responses",
    icon: <Cpu className="w-4 h-4" />,
    badge: "Free • 1.5B",
  },
  {
    value: "mistral",
    label: "Mistral-7B-Instruct-v0.3",
    description: "High-quality 7B model - balanced performance",
    icon: <Cpu className="w-4 h-4" />,
    badge: "Free • 7B",
  },

  // External API Models
  {
    value: "gpt-4",
    label: "GPT-4 Turbo",
    description: "OpenAI's most advanced model",
    icon: <Cloud className="w-4 h-4" />,
    badge: "API Key Required",
    disabled: true,
  },
  {
    value: "claude",
    label: "Claude 3.5 Sonnet",
    description: "Anthropic's reasoning specialist",
    icon: <Cloud className="w-4 h-4" />,
    badge: "API Key Required",
    disabled: true,
  },
  {
    value: "gemini",
    label: "Gemini 2.0 Flash",
    description: "Google's latest multimodal model",
    icon: <Cloud className="w-4 h-4" />,
    badge: "API Key Required",
    disabled: true,
  },
];

interface ModelSelectorProps {
  selectedModel: ModelType;
  onModelChange: (model: ModelType) => void;
  disabled?: boolean;
}

export function ModelSelector({
  selectedModel,
  onModelChange,
  disabled = false,
}: ModelSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedOption = modelOptions.find(
    (option) => option.value === selectedModel
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className="text-xs h-6 px-2 text-muted-foreground hover:text-foreground justify-start"
          disabled={disabled}
        >
          <div className="flex items-center gap-1">
            {selectedOption?.icon}
            <span className="hidden sm:inline text-xs">
              {selectedOption?.value === "local"
                ? "Llama-3.1"
                : selectedOption?.value === "phi3"
                ? "Phi-3"
                : selectedOption?.value === "gemma-2b"
                ? "Gemma-2B"
                : selectedOption?.value === "qwen"
                ? "Qwen2"
                : selectedOption?.value === "mistral"
                ? "Mistral-7B"
                : selectedOption?.label?.split(" ")[0]}
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
            <CommandGroup>
              {modelOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={() => {
                    onModelChange(option.value);
                    setOpen(false);
                  }}
                  disabled={option.disabled}
                  className="flex items-center gap-3 p-3"
                >
                  {option.icon}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {option.label}
                      </span>
                      {option.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {option.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {option.description}
                    </p>
                  </div>
                  <Check
                    className={`ml-auto h-4 w-4 ${
                      selectedModel === option.value
                        ? "opacity-100"
                        : "opacity-0"
                    }`}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

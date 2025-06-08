import { useState } from "react";
import { Check, ChevronsUpDown, Cpu, Cloud, Zap } from "lucide-react";
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
  {
    value: "local",
    label: "Local AI (WebLLM)",
    description: "Runs locally in your browser - private & free",
    icon: <Cpu className="w-4 h-4" />,
    badge: "Free",
  },
  {
    value: "gemini",
    label: "Gemini 2.5 Pro",
    description: "Google's most capable AI model",
    icon: <Cloud className="w-4 h-4" />,
    badge: "API Key Required",
  },
  {
    value: "gpt-4",
    label: "GPT-4 Turbo",
    description: "OpenAI's most advanced model",
    icon: <Zap className="w-4 h-4" />,
    badge: "API Key Required",
  },
  {
    value: "claude",
    label: "Claude 3.5 Sonnet",
    description: "Anthropic's reasoning specialist",
    icon: <Cloud className="w-4 h-4" />,
    badge: "API Key Required",
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
                ? "Local"
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

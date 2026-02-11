import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { TranscriberStatus } from "@/features/chat/hooks/use-speech-to-text";

const STATUS_TOOLTIP: Record<TranscriberStatus, string> = {
  recording: "Stop recording",
  processing: "Processing audio...",
  loading: "Loading model...",
  ready: "Start voice input",
  uninitialized: "Start voice input",
  error: "Start voice input",
};

type IconType = "mic" | "mic-off" | "loader";

interface IconConfig {
  type: IconType;
  className: string;
}

const STATUS_ICON: Record<TranscriberStatus, IconConfig> = {
  recording: { type: "mic-off", className: "h-4 w-4 text-destructive" },
  processing: { type: "loader", className: "h-4 w-4 animate-spin" },
  loading: { type: "loader", className: "h-4 w-4 animate-spin" },
  ready: { type: "mic", className: "h-4 w-4" },
  uninitialized: { type: "mic", className: "h-4 w-4" },
  error: { type: "mic", className: "h-4 w-4" },
};

const ICON_COMPONENTS: Record<IconType, typeof Mic> = {
  mic: Mic,
  "mic-off": MicOff,
  loader: Loader2,
};

interface SpeechToTextButtonProps {
  status: TranscriberStatus;
  onClick: () => void;
  disabled?: boolean;
}

export function SpeechToTextButton({
  status,
  onClick,
  disabled,
}: SpeechToTextButtonProps) {
  const iconConfig = STATUS_ICON[status];
  const IconComponent = ICON_COMPONENTS[iconConfig.type];
  const isDisabled = disabled || status === "processing" || status === "loading";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onClick}
            disabled={isDisabled}
            className="h-8 w-8 p-0"
          >
            <IconComponent className={iconConfig.className} />
          </Button>
          {status === "recording" && (
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-destructive ring-2 ring-white" />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{STATUS_TOOLTIP[status]}</p>
      </TooltipContent>
    </Tooltip>
  );
}

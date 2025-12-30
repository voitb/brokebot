import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { TranscriberStatus } from "@/features/chat/hooks/use-speech-to-text";
import {
  getTooltipText,
  getIconConfig,
  isSpeechButtonDisabled,
  isRecordingActive,
  type IconType,
} from "@/features/chat/utils/speech-button-utils";

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
  const iconConfig = getIconConfig(status);
  const IconComponent = ICON_COMPONENTS[iconConfig.type];

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="relative">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={onClick}
            disabled={isSpeechButtonDisabled(status, disabled)}
            className="h-8 w-8 p-0"
          >
            <IconComponent className={iconConfig.className} />
          </Button>
          {isRecordingActive(status) && (
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-destructive ring-2 ring-white" />
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>{getTooltipText(status)}</p>
      </TooltipContent>
    </Tooltip>
  );
} 
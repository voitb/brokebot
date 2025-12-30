import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { TruncatedText } from "@/components/ui/truncated-text";
import { type OpenRouterModel } from "@/features/chat/lib/openrouter";
import { getCategoryIcon } from "@/features/chat/utils/online-model-utils";

interface ModelCardProps {
  model: OpenRouterModel;
  isSelected: boolean;
  onSelect: (model: OpenRouterModel) => void;
  isFree: boolean;
  isEnabled: boolean;
}

export function ModelCard({
  model,
  isSelected,
  onSelect,
  isFree,
  isEnabled,
}: ModelCardProps) {
  return (
    <Card
      className={`transition-colors flex flex-col h-full ${isEnabled
        ? "cursor-pointer hover:bg-accent"
        : "opacity-50 cursor-not-allowed"
        } ${isSelected ? "ring-2 ring-primary" : ""}`}
      onClick={() => isEnabled && onSelect(model)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <span className="flex-shrink-0 mt-0.5">
              {getCategoryIcon(model.category)}
            </span>
            <TruncatedText maxLines={2} classNames={{ base: "h-10" }}>
              {model.name}
            </TruncatedText>
          </div>
          <Badge variant={isFree ? "secondary" : "default"} className="text-xs flex-shrink-0">
            {isFree ? "FREE" : "PAID"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex-grow">
        <TruncatedText maxLines={2} as="p" classNames={{ base: "text-xs text-muted-foreground h-8" }}>
          {model.description}
        </TruncatedText>
      </CardContent>
      <CardFooter className="flex-col items-start space-y-2 pt-0">
        <div className="flex items-center justify-between w-full">
          <Badge variant="outline" className="text-xs">
            {model.provider}
          </Badge>
          {!isFree && (
            <Badge variant="secondary" className="text-xs capitalize">
              {model.category}
            </Badge>
          )}
        </div>
        {isFree && (
          <div className="flex items-center gap-1 text-xs text-amber-600">
            <AlertTriangle className="w-3 h-3" />
            Learns from prompts
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

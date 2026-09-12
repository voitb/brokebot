import { Save, Trash2, Edit, X, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useApiKeyManager } from "./use-api-key-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ApiKeySectionProps {
  provider: "openrouter";
}

const providerDetails = {
  openrouter: { name: "OpenRouter", url: "https://openrouter.ai/keys" },
};

export function ApiKeySection({ provider }: ApiKeySectionProps) {
  const {
    apiKey,
    setApiKey,
    hasStoredKey,
    isEditing,
    handleApiKeySave,
    handleApiKeyRemove,
    startEditing,
    cancelEditing,
  } = useApiKeyManager(provider);

  const [isRevealed, setIsRevealed] = useState(false);

  const details = providerDetails[provider];

  return (
    <div className="space-y-3">
      <Label
        htmlFor={`api-key-${provider}`}
        className="text-xs font-light text-muted-foreground"
      >
        {details.name} API Key
      </Label>
      <div className="flex gap-2">
        <Input
          id={`api-key-${provider}`}
          type={isRevealed ? "text" : "password"}
          autoComplete="off"
          placeholder={
            hasStoredKey
              ? "API key configured"
              : `Enter your ${details.name} API key`
          }
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="flex-1"
          disabled={!isEditing && hasStoredKey}
        />
        {(isEditing || !hasStoredKey) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRevealed((prev) => !prev)}
            aria-label={isRevealed ? "Hide API key" : "Show API key"}
            className="flex items-center gap-1"
          >
            {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
        )}
        {hasStoredKey && isEditing && (
          <>
              <Button
                variant="default"
                size="sm"
                onClick={handleApiKeySave}
                className="flex items-center gap-1"
              >
                <Save className="w-4 h-4" />
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={cancelEditing}
                className="flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
          </>
        )}
        {hasStoredKey && !isEditing && (
          <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsRevealed(false);
                  startEditing();
                }}
                className="flex items-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleApiKeyRemove}
                className="flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Remove
              </Button>
          </>
        )}
        {!hasStoredKey && (
          <Button
            variant="default"
            size="sm"
            onClick={handleApiKeySave}
            className="flex items-center gap-1"
          >
            <Save className="w-4 h-4" />
            Save
          </Button>
        )}
      </div>
      {!hasStoredKey && (
        <p className="text-xs text-muted-foreground">
          Get your free API key from{" "}
          <a
            href={details.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            {details.url.replace("https://", "")}
          </a>
        </p>
      )}
    </div>
  );
};

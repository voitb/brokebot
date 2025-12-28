import React from "react";
import { Save, Trash2, Edit, X } from "lucide-react";
import { useApiKeyManager } from "../hooks/useApiKeyManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ApiKeySectionProps {
  provider: "openrouter";
}

const providerDetails = {
  openrouter: { name: "OpenRouter", url: "https://openrouter.ai/keys" },
};

export const ApiKeySection: React.FC<ApiKeySectionProps> = ({ provider }) => {
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
          type={isEditing || !hasStoredKey ? "text" : "password"}
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
        {hasStoredKey ? (
          isEditing ? (
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
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={startEditing}
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
          )
        ) : (
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

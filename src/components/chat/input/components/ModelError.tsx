import React from "react";
import { Alert, AlertDescription } from "../../../ui/alert";
import { Button } from "../../../ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface ModelErrorProps {
  isModelError: boolean;
  status: string;
  isEngineLoading: boolean;
  onRetry: () => Promise<void>;
}

/**
 * Model error alert component
 */
export const ModelError: React.FC<ModelErrorProps> = ({
  isModelError,
  status,
  isEngineLoading,
  onRetry,
}) => {
  if (!isModelError) return null;

  return (
    <Alert className="mb-3 border-destructive/20 bg-destructive/5">
      <AlertCircle className="h-4 w-4 text-destructive" />
      <AlertDescription className="flex items-center justify-between">
        <div>
          <p className="font-medium text-destructive">Model Error</p>
          <p className="text-sm text-muted-foreground">
            {status}. Try reloading or selecting a different model.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={isEngineLoading}
          className="ml-4"
        >
          <RefreshCw
            className={`w-3 h-3 mr-1 ${isEngineLoading ? "animate-spin" : ""}`}
          />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
};

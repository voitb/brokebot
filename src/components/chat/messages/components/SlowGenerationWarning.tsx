import React from "react";
import { Alert, AlertDescription } from "../../../ui/alert";
import { Clock } from "lucide-react";

interface SlowGenerationWarningProps {
  show: boolean;
}

/**
 * Warning component shown when AI generation takes too long
 */
export const SlowGenerationWarning: React.FC<SlowGenerationWarningProps> = React.memo(({ 
  show 
}) => {
  if (!show) {
    return null;
  }

  return (
    <Alert className="mt-2 border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
      <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertDescription className="text-amber-700 dark:text-amber-300">
        <p className="text-sm font-medium">
          AI is taking longer than usual
        </p>
        <p className="text-xs mt-1">
          Consider switching to a lighter model for faster responses.
          Current model might be too heavy for your device.
        </p>
      </AlertDescription>
    </Alert>
  );
}); 
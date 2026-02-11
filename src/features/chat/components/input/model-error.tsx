import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ModelErrorProps {
  isModelError: boolean;
  status: string;
}

export function ModelError({
  isModelError,
  status,
}: ModelErrorProps) {
  if (!isModelError) return null;

  return (
    <Alert className="mb-3 border-destructive/20 bg-destructive/5">
      <AlertCircle className="h-4 w-4 text-destructive" />
      <AlertDescription>
        <p className="font-medium text-destructive">Model Error</p>
        <p className="text-sm text-muted-foreground">
          {status}. Try reloading or selecting a different model.
        </p>
      </AlertDescription>
    </Alert>
  );
}

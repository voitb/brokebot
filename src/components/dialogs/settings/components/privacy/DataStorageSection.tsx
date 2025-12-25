import { Label } from "../../../../ui/label";
import { Info } from "lucide-react";

export const DataStorageSection = () => {
  return (
    <>
      <div>
        <Label className="text-base font-medium">Data Storage</Label>
        <p className="text-sm text-muted-foreground">
          Your conversations are always stored securely on this device.
        </p>
      </div>

      <div className="mt-4 p-3 rounded-lg flex items-start gap-3 text-sm bg-blue-50 border border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
        <Info className="h-4 w-4 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
        <p className="leading-relaxed text-blue-900 dark:text-blue-200">
          To ensure a seamless offline experience, your chat history is always
          kept in your browser's local storage. You can clear all data anytime
          in the "Danger Zone".
        </p>
      </div>
    </>
  );
};

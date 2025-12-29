import type { RefObject, ChangeEvent } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface DataManagementSectionProps {
  fileInputRef: RefObject<HTMLInputElement | null>;
  onExportConversations: () => void;
  onImportClick: () => void;
  onFileImport: (event: ChangeEvent<HTMLInputElement>) => void;
  hasConversations?: boolean;
}

export function DataManagementSection({
  fileInputRef,
  onExportConversations,
  onImportClick,
  onFileImport,
  hasConversations = false,
}: DataManagementSectionProps) {
  return (
    <div>
      <Label className="text-base font-medium">Data Management</Label>
      <p className="text-sm text-muted-foreground mb-3">
        Import and export your conversations
      </p>
      <div className="space-y-2">
        <Button
          variant="outline"
          className="w-full"
          onClick={onExportConversations}
          disabled={!hasConversations}
        >
          Export conversations as JSON
        </Button>
        <Button variant="outline" className="w-full" onClick={onImportClick}>
          <Upload className="w-4 h-4 mr-2" />
          Import conversations from JSON
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={onFileImport}
          className="hidden"
        />
      </div>
    </div>
  );
};

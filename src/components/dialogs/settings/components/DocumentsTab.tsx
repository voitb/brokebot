import React from "react";
import { DocumentManager } from "../../../documents/DocumentManager";

export const DocumentsTab: React.FC = () => {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h3 className="text-lg font-medium">Document Management</h3>
        <div className="pl-4 border-l-2">
          <p className="text-sm text-muted-foreground mb-4">
            Upload and manage text files that AI can read and analyze when attached to chat messages.
            All documents are stored locally on your device for maximum privacy.
          </p>
          <DocumentManager />
        </div>
      </section>
    </div>
  );
}; 
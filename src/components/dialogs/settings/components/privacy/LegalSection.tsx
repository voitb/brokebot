import React from "react";
import { Label } from "../../../../ui/label";
import { Button } from "../../../../ui/button";
import { ExternalLink } from "lucide-react";

export const LegalSection: React.FC = () => {
  return (
    <div>
      <Label className="text-base font-medium">Legal & Terms</Label>
      <p className="text-sm text-muted-foreground mb-3">
        Review our terms and policies
      </p>
      <Button variant="outline" className="w-full" asChild>
        <a href="/terms" target="_blank" rel="noopener noreferrer">
          <ExternalLink className="w-4 h-4 mr-2" />
          View Terms of Service
        </a>
      </Button>
    </div>
  );
};

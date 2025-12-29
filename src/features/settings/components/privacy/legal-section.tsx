import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export function LegalSection() {
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

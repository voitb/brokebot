import { Label } from "../../../ui/label";
import { Button } from "../../../ui/button";
import { Switch } from "../../../ui/switch";
import { Badge } from "../../../ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../ui/card";

export function ModelsTab() {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium">Local AI Models</Label>
        <p className="text-sm text-muted-foreground">
          Manage WebLLM models running locally in your browser
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Model Cache Management</CardTitle>
          <CardDescription>
            Downloaded models are cached in your browser for faster loading
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Cache size</span>
              <Badge variant="secondary">~2.4 GB</Badge>
            </div>
            <Button variant="destructive" size="sm" className="w-full">
              Clear model cache
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Default Model Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Preferred model</Label>
            <Select defaultValue="llama">
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="llama">Llama-3.1-8B-Instruct</SelectItem>
                <SelectItem value="phi3">Phi-3-mini-4k-instruct</SelectItem>
                <SelectItem value="gemma">Gemma-2B-it</SelectItem>
                <SelectItem value="qwen">Qwen2-1.5B-Instruct</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto-load preferred model</Label>
              <p className="text-sm text-muted-foreground">
                Load your preferred model automatically
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

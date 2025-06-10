import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";
import { useUserConfig } from "../../../../hooks/useUserConfig";
import { AutosizeTextarea } from "@/components/ui/auto-size-textarea";

export function ProfileTab() {
  const { config, updateConfig } = useUserConfig();

  const handleChange = (field: string, value: string) => {
    updateConfig({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="fullName" className="text-sm font-medium">
            Full name
          </Label>
          <Input
            id="fullName"
            value={config.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="nickname" className="text-sm font-medium">
            What should we call you?
          </Label>
          <Input
            id="nickname"
            value={config.nickname}
            onChange={(e) => handleChange("nickname", e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="preferences" className="text-sm font-medium">
          Personal AI preferences
        </Label>
        <p className="text-xs text-muted-foreground mt-1 mb-2">
          Your preferences will apply to all conversations with local AI models.
        </p>
        <AutosizeTextarea
          id="preferences"
          value={config.preferences}
          maxHeight={300}
          minHeight={100}
          onChange={(e) => handleChange("preferences", e.target.value)}
          placeholder="e.g. keep explanations brief and to the point"
          className="mt-1 resize-none"
        />
      </div>
    </div>
  );
}

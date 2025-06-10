import { Label } from "../../../ui/label";
import { Input } from "../../../ui/input";
import { Textarea } from "../../../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";
import { Badge } from "../../../ui/badge";

interface UserData {
  fullName: string;
  nickname: string;
  workFunction: string;
  preferences: string;
}

interface ProfileTabProps {
  userData: UserData;
  onUserDataChange: (data: UserData) => void;
}

export function ProfileTab({ userData, onUserDataChange }: ProfileTabProps) {
  const handleChange = (field: keyof UserData, value: string) => {
    onUserDataChange({ ...userData, [field]: value });
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
            value={userData.fullName}
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
            value={userData.nickname}
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
        <Textarea
          id="preferences"
          value={userData.preferences}
          onChange={(e) => handleChange("preferences", e.target.value)}
          placeholder="e.g. keep explanations brief and to the point"
          className="mt-1 min-h-[100px]"
        />
      </div>
    </div>
  );
}

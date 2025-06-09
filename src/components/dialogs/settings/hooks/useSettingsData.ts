import { useState } from "react";

export interface UserData {
  fullName: string;
  nickname: string;
  workFunction: string;
  preferences: string;
}

export interface ApiKeys {
  openai: string;
  anthropic: string;
  google: string;
}

export function useSettingsData() {
  // Mock user data - replace with real data from your auth system
  const [userData, setUserData] = useState<UserData>({
    fullName: "User",
    nickname: "User",
    workFunction: "",
    preferences: "",
  });

  // Mock API keys - replace with secure storage
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: "",
    anthropic: "",
    google: "",
  });

  const handleSave = () => {
    // TODO: Save settings to backend/localStorage
    console.log("Saving settings...", { userData, apiKeys });
  };

  return {
    userData,
    setUserData,
    apiKeys,
    setApiKeys,
    handleSave,
  };
} 
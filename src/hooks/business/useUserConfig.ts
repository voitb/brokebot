import { useLiveQuery } from "dexie-react-hooks";
import { db, type UserConfig } from "@/lib/db";

export function useUserConfig() {
  const userConfig = useLiveQuery(
    () => db.userConfig.get("user_config"),
    [],
  );

  const updateConfig = (changes: Partial<Omit<UserConfig, "id">>) => {
    db.userConfig.update("user_config", { ...changes, updatedAt: new Date() });
  };

  return {
    config: userConfig,
    isLoading: userConfig === undefined,
    updateConfig,
  };
} 
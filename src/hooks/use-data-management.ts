import { useState } from "react";
import { db, DEFAULT_USER_CONFIG } from "@/lib/db";
import { toast } from "sonner";

export interface UseDataManagementReturn {
  clearAllData: () => Promise<void>;
  isClearing: boolean;
}

export function useDataManagement(): UseDataManagementReturn {
  const [isClearing, setIsClearing] = useState(false);

  const clearAllData = async () => {
    setIsClearing(true);
    try {
      await db.conversations.clear();
      await db.documents.clear();
      await db.folders.clear();

      const newConfig = {
        ...DEFAULT_USER_CONFIG,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.userConfig.put(newConfig);
    } catch {
      toast.error("Failed to clear data.");
    } finally {
      setIsClearing(false);
    }
  };

  return {
    clearAllData,
    isClearing,
  };
}

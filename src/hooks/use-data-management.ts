import { useState } from "react";
import { db, DEFAULT_USER_CONFIG } from "@/lib/db";
import { toast } from "sonner";
import { useMounted } from "./use-mounted";

export interface UseDataManagementReturn {
  clearAllData: () => Promise<void>;
  isClearing: boolean;
}

export function useDataManagement(): UseDataManagementReturn {
  const [isClearing, setIsClearing] = useState(false);
  const mountedRef = useMounted();

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
      if (mountedRef.current) {
        setIsClearing(false);
      }
    }
  };

  return {
    clearAllData,
    isClearing,
  };
}

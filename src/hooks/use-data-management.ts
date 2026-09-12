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
      await db.transaction(
        "rw",
        db.conversations,
        db.folders,
        db.documents,
        db.userConfig,
        async () => {
          await db.conversations.clear();
          await db.folders.clear();
          await db.documents.clear();
          await db.userConfig.put({
            ...DEFAULT_USER_CONFIG,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }
      );

      localStorage.removeItem("theme-class");
      localStorage.removeItem("unifiedModel");
      localStorage.removeItem("onboardingCompleted-v1");
      document.cookie = "sidebar_state=; path=/; max-age=0";

      if ("caches" in globalThis) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames
              .filter(
                (name) =>
                  name.startsWith("webllm") || name === "transformers-cache"
              )
              .map((name) => caches.delete(name))
          );
        } catch {
          toast.warning("Data cleared, but cached model files could not be removed.");
        }
      }
    } catch (error) {
      toast.error("Failed to clear data.");
      throw error;
    } finally {
      setIsClearing(false);
    }
  };

  return {
    clearAllData,
    isClearing,
  };
}

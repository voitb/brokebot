import { useLiveQuery } from "dexie-react-hooks";
import { db, type ISharedLink } from "../lib/db";
import { v4 as uuidv4 } from "uuid";

export function useSharedLinks() {
  const sharedLinks = useLiveQuery(
    () => db.sharedLinks.orderBy("createdAt").reverse().toArray(),
    [],
    []
  );

  const createSharedLink = async (
    conversationId: string,
    title: string,
    options: {
      allowDownload?: boolean;
      showSharedBy?: boolean;
      anonymizeMessages?: boolean;
      publicDiscovery?: boolean;
    } = {}
  ): Promise<string | null> => {
    try {
      const shareId = uuidv4().replace(/-/g, '').substring(0, 12);
      
      const newSharedLink: ISharedLink = {
        id: shareId,
        conversationId,
        title,
        allowDownload: options.allowDownload ?? true,
        showSharedBy: options.showSharedBy ?? false,
        anonymizeMessages: options.anonymizeMessages ?? false,
        publicDiscovery: options.publicDiscovery ?? false,
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.sharedLinks.add(newSharedLink);
      return shareId;
    } catch (error) {
      console.error("Error creating shared link:", error);
      return null;
    }
  };

  const updateSharedLink = async (
    shareId: string,
    updates: Partial<Omit<ISharedLink, "id" | "conversationId" | "createdAt">>
  ) => {
    try {
      await db.sharedLinks.where("id").equals(shareId).modify({
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating shared link:", error);
    }
  };

  const deleteSharedLink = async (shareId: string) => {
    try {
      await db.sharedLinks.delete(shareId);
    } catch (error) {
      console.error("Error deleting shared link:", error);
    }
  };

  const incrementViewCount = async (shareId: string) => {
    try {
      await db.sharedLinks.where("id").equals(shareId).modify(link => {
        link.viewCount += 1;
        link.updatedAt = new Date();
      });
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
  };

  const getSharedLinksForConversation = async (conversationId: string) => {
    try {
      return await db.sharedLinks.where("conversationId").equals(conversationId).toArray();
    } catch (error) {
      console.error("Error getting shared links for conversation:", error);
      return [];
    }
  };

  return {
    sharedLinks,
    createSharedLink,
    updateSharedLink,
    deleteSharedLink,
    incrementViewCount,
    getSharedLinksForConversation,
  };
}

export function useSharedLink(shareId: string | undefined) {
  const sharedLink = useLiveQuery(
    () => shareId ? db.sharedLinks.get(shareId) : undefined,
    [shareId]
  );

  return { sharedLink };
} 
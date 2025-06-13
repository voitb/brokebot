import { account, client, APPWRITE_DATABASE_ID } from "../appwriteClient";
import { db } from "../db";
import { Databases, ID, Query } from "appwrite";
import type { Conversation, Message, UserConfig } from "../db";
import type { Models } from "appwrite";

// --- Appwrite Configuration ---
const CONVERSATIONS_COLLECTION_ID = "conversations";
const MESSAGES_COLLECTION_ID = "messages";

const databases = new Databases(client);

// --- Type Definitions ---
interface AppwriteConversation {
  title: string;
  pinned: boolean;
  userId: string;
  $id: string;
  $createdAt: string;
  $updatedAt:string;
}

interface AppwriteMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: string; // ISO 8601 string
  conversationId: string;
  $id: string;
}

/**
 * Converts an Appwrite document for a conversation into the local Dexie format.
 * Messages are handled separately.
 */
function mapAppwriteConversationToLocal(appwriteDoc: AppwriteConversation): Omit<Conversation, 'messages'> {
  return {
    id: appwriteDoc.$id,
    title: appwriteDoc.title,
    pinned: appwriteDoc.pinned,
    createdAt: new Date(appwriteDoc.$createdAt),
    updatedAt: new Date(appwriteDoc.$updatedAt),
  };
}

// --- Public API for Cloud Sync ---

/**
 * Creates a new conversation in the cloud.
 * @param conversation - The conversation object from local DB.
 */
export const createCloudConversation = async (conversation: Conversation) => {
    try {
        const userId = (await account.get()).$id;
        // Create conversation without messages
        const { messages, ...conversationData } = conversation;

        await databases.createDocument(
            APPWRITE_DATABASE_ID,
            CONVERSATIONS_COLLECTION_ID,
            conversation.id,
            { ...conversationData, userId }
        );

        // Batch-create all messages for this conversation
        const messagePromises = messages.map(msg => 
            createCloudMessage(conversation.id, msg)
        );
        await Promise.all(messagePromises);

    } catch (error) {
        console.error("Failed to create conversation in cloud:", error);
        // Here you might want to add more robust error handling,
        // e.g., a queue for failed syncs.
    }
};

/**
 * Adds a single message to an existing conversation in the cloud.
 * @param conversationId - The ID of the conversation.
 * @param message - The message object to add.
 */
export const createCloudMessage = async (conversationId: string, message: Message) => {
    try {
        await databases.createDocument(
            APPWRITE_DATABASE_ID,
            MESSAGES_COLLECTION_ID,
            message.id,
            { ...message, conversationId }
        );
    } catch (error)        {
        console.error(`Failed to add message to conversation ${conversationId} in cloud:`, error);
    }
};

/**
 * Updates a conversation in the cloud.
 * @param conversationId - The ID of the conversation to update.
 * @param data - The partial data to update.
 */
export const updateCloudConversation = async (conversationId: string, data: Partial<Conversation>) => {
    try {
        await databases.updateDocument(
            APPWRITE_DATABASE_ID,
            CONVERSATIONS_COLLECTION_ID,
            conversationId,
            data
        );
    } catch (error) {
        console.error(`Failed to update conversation ${conversationId} in cloud:`, error);
    }
};

/**
 * Deletes a conversation and all its messages from the cloud.
 * @param conversationId - The ID of the conversation to delete.
 */
export const deleteCloudConversation = async (conversationId: string) => {
    try {
        // First, delete all messages associated with the conversation
        let messagesToDelete: Models.Document[] = [];
        let offset = 0;
        do {
            const response = await databases.listDocuments(
                APPWRITE_DATABASE_ID,
                MESSAGES_COLLECTION_ID,
                [Query.equal("conversationId", conversationId), Query.limit(100), Query.offset(offset)]
            );
            messagesToDelete = response.documents;
            const deletePromises = messagesToDelete.map(doc => 
                databases.deleteDocument(APPWRITE_DATABASE_ID, MESSAGES_COLLECTION_ID, doc.$id)
            );
            await Promise.all(deletePromises);
            offset += messagesToDelete.length;
        } while (messagesToDelete.length > 0);

        // Then, delete the conversation document itself
        await databases.deleteDocument(
            APPWRITE_DATABASE_ID,
            CONVERSATIONS_COLLECTION_ID,
            conversationId
        );
    } catch (error) {
        console.error(`Failed to delete conversation ${conversationId} from cloud:`, error);
    }
};

/**
 * Fetches all conversations and their messages for the logged-in user.
 */
export const getCloudConversations = async (): Promise<Conversation[]> => {
    try {
        const userId = (await account.get()).$id;
        const conversationDocs = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            CONVERSATIONS_COLLECTION_ID,
            [Query.equal("userId", userId)]
        );

        const conversations: Conversation[] = [];
        for (const doc of conversationDocs.documents) {
            const messageDocs = await databases.listDocuments(
                APPWRITE_DATABASE_ID,
                MESSAGES_COLLECTION_ID,
                [Query.equal("conversationId", doc.$id), Query.limit(500)] // Limit to 500 messages per convo for now
            );
            
            const conversation: Conversation = {
                id: doc.$id,
                title: doc.title,
                pinned: doc.pinned,
                createdAt: new Date(doc.createdAt),
                updatedAt: new Date(doc.updatedAt),
                modelId: doc.modelId,
                messages: messageDocs.documents.map(msgDoc => ({
                    id: msgDoc.$id,
                    role: msgDoc.role,
                    content: msgDoc.content,
                    createdAt: new Date(msgDoc.createdAt),
                })),
            };
            conversations.push(conversation);
        }
        return conversations;

    } catch (error) {
        console.error("Failed to fetch conversations from cloud:", error);
        return [];
    }
};

export async function createConversationInCloud(
  conversation: Omit<Conversation, 'messages'>,
  userId: string
): Promise<string> {
  try {
    const document = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      CONVERSATIONS_COLLECTION_ID,
      conversation.id, // Use local ID as the document ID
      {
        title: conversation.title,
        pinned: conversation.pinned,
        userId: userId,
      }
    );
    return document.$id;
  } catch (error) {
    console.error("Failed to create conversation in cloud:", error);
    throw new Error("Failed to create conversation in cloud.");
  }
}

export async function addMessageToCloud(
  message: Message,
  conversationId: string
): Promise<string> {
  try {
    // Appwrite doesn't store nested objects, so we use a reference.
    // The `createdAt` is converted to ISO string format for Appwrite.
    const document = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      message.id, // Use local ID as the document ID
      {
        role: message.role,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
        conversationId: conversationId,
      }
    );
    return document.$id;
  } catch (error) {
    console.error("Failed to add message to cloud:", error);
    throw new Error("Failed to add message to cloud.");
  }
}

export async function updateConversationInCloud(
  conversationId: string,
  changes: Partial<Omit<Conversation, 'id' | 'messages' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  try {
    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      CONVERSATIONS_COLLECTION_ID,
      conversationId,
      changes
    );
  } catch (error) {
    console.error("Failed to update conversation in cloud:", error);
    throw new Error("Failed to update conversation in cloud.");
  }
}

export async function deleteConversationFromCloud(
  conversationId: string
): Promise<void> {
  try {
    // 1. Find and delete all associated messages
    let hasMore = true;
    let offset = 0;
    const limit = 25; // Appwrite's default query limit

    while (hasMore) {
      const response = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        [
          Query.equal("conversationId", conversationId),
          Query.limit(limit),
          Query.offset(offset)
        ]
      );

      if (response.documents.length > 0) {
        await Promise.all(
          response.documents.map((doc) =>
            databases.deleteDocument(
              APPWRITE_DATABASE_ID,
              MESSAGES_COLLECTION_ID,
              doc.$id
            )
          )
        );
        offset += response.documents.length;
      } else {
        hasMore = false;
      }
    }

    // 2. Delete the conversation document itself
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      CONVERSATIONS_COLLECTION_ID,
      conversationId
    );
  } catch (error) {
    console.error("Failed to delete conversation from cloud:", error);
    throw new Error("Failed to delete conversation from cloud.");
  }
}

export async function clearAllCloudData(userId: string): Promise<void> {
  try {
    // Fetch all conversation IDs for the user
    const conversationIds: string[] = [];
    let hasMore = true;
    let offset = 0;
    const limit = 100;

    while (hasMore) {
        const response = await databases.listDocuments(
            APPWRITE_DATABASE_ID,
            CONVERSATIONS_COLLECTION_ID,
            [
                Query.equal("userId", userId),
                Query.limit(limit),
                Query.offset(offset)
            ]
        );

        if (response.documents.length > 0) {
            response.documents.forEach(doc => conversationIds.push(doc.$id));
            offset += response.documents.length;
        } else {
            hasMore = false;
        }
    }

    // Delete each conversation and its associated messages
    await Promise.all(
      conversationIds.map((id) => deleteConversationFromCloud(id))
    );
    
  } catch (error) {
    console.error("Failed to clear all cloud data:", error);
    throw new Error("Failed to clear all cloud data.");
  }
}

export async function syncCloudToLocal(userId: string): Promise<void> {
  try {
    // 1. Fetch all conversation documents for the user in one go.
    const conversationsResponse = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      CONVERSATIONS_COLLECTION_ID,
      [Query.equal("userId", userId), Query.limit(500)] // Increased limit
    );

    const cloudConversations = conversationsResponse.documents;
    if (cloudConversations.length === 0) {
      // No conversations in the cloud, nothing to sync.
      return;
    }

    const cloudConversationIds = cloudConversations.map((doc) => doc.$id);

    // 2. Fetch all messages for all those conversations in one go.
    const allMessages: Models.Document[] = [];
    let offset = 0;
    const BATCH_SIZE = 100; // Appwrite query limit
    
    while (true) {
      const messagesResponse = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        MESSAGES_COLLECTION_ID,
        [
          Query.equal("conversationId", cloudConversationIds),
          Query.limit(BATCH_SIZE),
          Query.offset(offset),
        ]
      );

      const fetchedMessages = messagesResponse.documents;
      allMessages.push(...fetchedMessages);

      if (fetchedMessages.length < BATCH_SIZE) {
        break; // Last page fetched
      }

      offset += BATCH_SIZE;
    }

    // 3. Group messages by conversationId for efficient lookup.
    const messagesByConvo = allMessages.reduce((acc, msg) => {
      const convoId = msg.conversationId;
      if (!acc[convoId]) {
        acc[convoId] = [];
      }
      acc[convoId].push({
        id: msg.$id,
        role: msg.role,
        content: msg.content,
        createdAt: new Date(msg.createdAt),
      });
      return acc;
    }, {} as Record<string, Message[]>);

    // 4. Map conversations and merge with their messages.
    const localConversations: Conversation[] = cloudConversations.map((convo) => ({
      id: convo.$id,
      title: convo.title,
      pinned: convo.pinned,
      createdAt: new Date(convo.$createdAt),
      updatedAt: new Date(convo.$updatedAt),
      messages: messagesByConvo[convo.$id]?.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()) || [],
    }));

    // 5. Use a bulk put operation to efficiently update the local DB.
    await db.conversations.bulkPut(localConversations);

    console.log(`Synced ${localConversations.length} conversations and ${allMessages.length} messages from the cloud.`);

  } catch (error) {
    console.error("Failed to sync cloud to local database:", error);
    // Optionally re-throw or handle the error for UI feedback
    throw error;
  }
}

// --- User Config Sync ---

const USER_CONFIG_COLLECTION_ID = "userConfig";

// We use the user's Appwrite ID as the document ID for their config.
export async function getCloudUserConfig(userId: string) {
  try {
    const config = await databases.getDocument(
      APPWRITE_DATABASE_ID,
      USER_CONFIG_COLLECTION_ID,
      userId
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { $databaseId, $collectionId, ...userConfig } = config;
    return userConfig;
  } catch (error: any) {
    if (error.code === 404) {
      return null; // Config doesn't exist, not an error
    }
    console.error("Failed to get user config from cloud:", error);
    throw new Error("Failed to get user config from cloud.");
  }
}

export async function createCloudUserConfig(
  userId: string,
  config: Partial<UserConfig>
) {
  try {
    return await databases.createDocument(
      APPWRITE_DATABASE_ID,
      USER_CONFIG_COLLECTION_ID,
      userId, // Document ID is the user's ID
      config
    );
  } catch (error) {
    console.error("Failed to create user config in cloud:", error);
    throw new Error("Failed to create user config in cloud.");
  }
}

export async function updateCloudUserConfig(
  userId: string,
  config: Partial<UserConfig>
) {
  try {
    return await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      USER_CONFIG_COLLECTION_ID,
      userId, // Document ID is the user's ID
      config
    );
  } catch (error) {
    console.error("Failed to update user config in cloud:", error);
    throw new Error("Failed to update user config in cloud.");
  }
}

export async function updateMessageInCloud(
  messageId: string,
  updates: Partial<{ content: string }>
) {
  try {
    return await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      MESSAGES_COLLECTION_ID,
      messageId,
      updates
    );
  } catch (error) {
    console.error("Failed to update message in cloud:", error);
    throw new Error("Failed to update message in cloud.");
  }
} 
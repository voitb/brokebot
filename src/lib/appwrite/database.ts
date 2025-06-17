import { 
  account, 
  client, 
  APPWRITE_DATABASE_ID, 
  APPWRITE_CONVERSATIONS_COLLECTION_ID,
  APPWRITE_MESSAGES_COLLECTION_ID,
  APPWRITE_FOLDERS_COLLECTION_ID
} from "../appwriteClient";
import { db } from "../db";
import { Databases, Query } from "appwrite";
import type { Conversation, Message, UserConfig, Folder } from "../db";
import type { Models } from "appwrite";

const databases = new Databases(client);

// --- Type Definitions ---
interface AppwriteConversation {
  title: string;
  pinned: boolean;
  userId: string;
  folderId?: string;
  $id: string;
  $createdAt: string;
  $updatedAt:string;
}



// interface AppwriteFolder {
//   name: string;
//   userId: string;
//   $id: string;
//   $createdAt: string;
//   $updatedAt: string;
// }

/**
 * Converts an Appwrite document for a conversation into the local Dexie format.
 * Messages are handled separately.
 */
// function mapAppwriteConversationToLocal(appwriteDoc: AppwriteConversation): Omit<Conversation, 'messages'> {
//   return {
//     id: appwriteDoc.$id,
//     title: appwriteDoc.title,
//     pinned: appwriteDoc.pinned,
//     folderId: appwriteDoc.folderId,
//     createdAt: new Date(appwriteDoc.$createdAt),
//     updatedAt: new Date(appwriteDoc.$updatedAt),
//   };
// }

// --- FOLDERS ---
export async function createFolderInCloud(
  folderId: string,
  data: Omit<Folder, "id">,
  userId: string
) {
  try {
    const { createdAt, updatedAt, ...payload } = data;
    return await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_FOLDERS_COLLECTION_ID,
      folderId,
      { ...payload, userId }
    );
  } catch (error) {
    console.error("Failed to create folder in cloud:", error);
    throw new Error("Failed to create folder in cloud.");
  }
}

export async function updateFolderInCloud(
  folderId: string,
  data: Partial<Omit<Folder, "id">>
): Promise<void> {
  try {
    const { createdAt, updatedAt, ...payload } = data;
    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_FOLDERS_COLLECTION_ID,
      folderId,
      payload
    );
  } catch (error) {
    console.error("Failed to update folder in cloud:", error);
    throw new Error("Failed to update folder in cloud.");
  }
}

export async function deleteFolderFromCloud(folderId: string): Promise<void> {
  try {
    // Before deleting the folder, find all conversations in it and unset their folderId
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_CONVERSATIONS_COLLECTION_ID,
      [Query.equal("folderId", folderId), Query.limit(100)]
    );

    const updatePromises = response.documents.map((doc) =>
      databases.updateDocument(
        APPWRITE_DATABASE_ID,
        APPWRITE_CONVERSATIONS_COLLECTION_ID,
        doc.$id,
        { folderId: null } // Set to null to clear the relationship
      )
    );
    await Promise.all(updatePromises);

    // Now delete the folder
    await databases.deleteDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_FOLDERS_COLLECTION_ID,
      folderId
    );
  } catch (error) {
    console.error(`Failed to delete folder ${folderId} from cloud:`, error);
    throw new Error("Failed to delete folder from cloud.");
  }
}

export async function getAllFoldersFromCloud(userId: string): Promise<Folder[]> {
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_FOLDERS_COLLECTION_ID,
      [Query.equal("userId", userId), Query.limit(100)] // Assuming max 100 folders
    );
    return response.documents.map((doc) => ({
      id: doc.$id,
      name: doc.name,
      userId: doc.userId,
      createdAt: new Date(doc.$createdAt),
      updatedAt: new Date(doc.$updatedAt),
    }));
  } catch (error) {
    console.error("Failed to get folders from cloud:", error);
    return [];
  }
}

// --- CONVERSATIONS ---

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
            APPWRITE_CONVERSATIONS_COLLECTION_ID,
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
            APPWRITE_MESSAGES_COLLECTION_ID,
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
            APPWRITE_CONVERSATIONS_COLLECTION_ID,
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
                APPWRITE_MESSAGES_COLLECTION_ID,
                [Query.equal("conversationId", conversationId), Query.limit(100), Query.offset(offset)]
            );
            messagesToDelete = response.documents;
            const deletePromises = messagesToDelete.map(doc => 
                databases.deleteDocument(APPWRITE_DATABASE_ID, APPWRITE_MESSAGES_COLLECTION_ID, doc.$id)
            );
            await Promise.all(deletePromises);
            offset += messagesToDelete.length;
        } while (messagesToDelete.length > 0);

        // Then, delete the conversation document itself
        await databases.deleteDocument(
            APPWRITE_DATABASE_ID,
            APPWRITE_CONVERSATIONS_COLLECTION_ID,
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
            APPWRITE_CONVERSATIONS_COLLECTION_ID,
            [Query.equal("userId", userId)]
        );

        const conversations: Conversation[] = [];
        for (const doc of conversationDocs.documents) {
            const messageDocs = await databases.listDocuments(
                APPWRITE_DATABASE_ID,
                APPWRITE_MESSAGES_COLLECTION_ID,
                [Query.equal("conversationId", doc.$id), Query.limit(500)] // Limit to 500 messages per convo for now
            );
            
            const conversation: Conversation = {
                id: doc.$id,
                title: doc.title,
                pinned: doc.pinned,
                folderId: doc.folderId,
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
  conversationId: string,
  data: Omit<Conversation, "id" | "messages">,
  userId: string
) {
  try {
    // Appwrite manages createdAt and updatedAt via system fields ($createdAt, $updatedAt).
    // We should not send them in the payload, so we destructure them out.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, updatedAt, ...payload } = data;
    return await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_CONVERSATIONS_COLLECTION_ID,
      conversationId,
      { ...payload, userId }
    );
  } catch (error) {
    console.error("Failed to create conversation in cloud:", error);
    throw new Error("Failed to create conversation in cloud.");
  }
}

export async function addMessageToCloud(
  message: Message,
  conversationId: string
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...messageData } = message;
    return await databases.createDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_MESSAGES_COLLECTION_ID,
      id, // Use local message ID as the document ID in Appwrite
      { ...messageData, conversationId }
    );
  } catch (error) {
    console.error("Failed to add message to cloud:", error);
    throw new Error("Failed to add message to cloud.");
  }
}

export async function updateConversationInCloud(
  conversationId: string,
  data: Partial<Omit<Conversation, "id" | "messages">>
): Promise<void> {
  try {
    // Appwrite manages createdAt and updatedAt via system fields ($createdAt, $updatedAt).
    // We should not send them in the payload, so we destructure them out.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, updatedAt, ...payload } = data;
    await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      APPWRITE_CONVERSATIONS_COLLECTION_ID,
      conversationId,
      payload
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
        APPWRITE_MESSAGES_COLLECTION_ID,
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
              APPWRITE_MESSAGES_COLLECTION_ID,
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
      APPWRITE_CONVERSATIONS_COLLECTION_ID,
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
            APPWRITE_CONVERSATIONS_COLLECTION_ID,
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

/**
 * Fetches all conversations and their nested messages for a given user from Appwrite.
 */
export async function getAllConversationsFromCloud(
  userId: string
): Promise<Conversation[]> {
  const conversations: Conversation[] = [];
  try {
    const response = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_CONVERSATIONS_COLLECTION_ID,
      [Query.equal("userId", userId), Query.limit(100)] // max 100 conversations
    );
    
    for (const cloudConvo of response.documents as (Models.Document & AppwriteConversation)[]) {
      const messagesResponse = await databases.listDocuments(
        APPWRITE_DATABASE_ID,
        APPWRITE_MESSAGES_COLLECTION_ID,
        [Query.equal("conversationId", cloudConvo.$id), Query.limit(500)] // max 500 messages
      );
      
      const messages: Message[] = messagesResponse.documents.map(
        (doc) =>
          ({
            id: doc.$id,
            role: doc.role,
            content: doc.content,
            createdAt: new Date(doc.createdAt),
          } as Message)
      );

      conversations.push(
        rehydrateConversation({
          ...cloudConvo,
          id: cloudConvo.$id,
          messages,
        } as unknown as Conversation)
      );
    }
  } catch (error) {
    console.error("Failed to retrieve conversations from cloud:", error);
  }
  return conversations;
}

/**
 * Converts a cloud conversation (with string dates) to a local Conversation (with Date objects).
 */
function rehydrateConversation(cloudConvo: Conversation): Conversation {
  return {
    ...cloudConvo,
    createdAt: new Date(cloudConvo.createdAt),
    updatedAt: new Date(cloudConvo.updatedAt),
    messages: cloudConvo.messages.map((msg) => ({
      ...msg,
      createdAt: new Date(msg.createdAt),
    })),
  };
}

/**
 * Main sync function. Fetches all data from the cloud and merges it with local data.
 * The strategy is "cloud-first": if a conflict exists, cloud data wins.
 * Local-only data is pushed to the cloud.
 */
export async function syncCloudAndLocal(userId: string) {
  // 1. Fetch all cloud data
  const [cloudConversations, cloudFolders] = await Promise.all([
    getAllConversationsFromCloud(userId),
    getAllFoldersFromCloud(userId),
  ]);

  // 2. Get all local data
  const localConversations = await db.conversations.toArray();
  const localFolders = await db.folders.toArray();

  // 3. Sync Folders
  const folderSyncPromises = [];
  const cloudFolderIds = new Set(cloudFolders.map((f) => f.id));
  // const localFolderIds = new Set(localFolders.map((f) => f.id));

  // 3a. Update local folders that are also in the cloud (cloud wins)
  for (const cloudFolder of cloudFolders) {
    folderSyncPromises.push(
      db.folders.put(cloudFolder, cloudFolder.id)
    );
  }

  // 3b. Add local-only folders to the cloud
  for (const localFolder of localFolders) {
    if (!cloudFolderIds.has(localFolder.id)) {
      const {id, ...data} = localFolder;
      folderSyncPromises.push(createFolderInCloud(id, data, userId));
    }
  }

  // 3c. Delete local folders that are no longer in the cloud
  for (const localFolder of localFolders) {
    if (!cloudFolderIds.has(localFolder.id)) {
      folderSyncPromises.push(db.folders.delete(localFolder.id));
    }
  }
  
  await Promise.all(folderSyncPromises);


  // 4. Sync Conversations (similar logic)
  const conversationSyncPromises = [];
  const cloudConversationIds = new Set(cloudConversations.map((c) => c.id));
  const localConversationIds = new Set(localConversations.map((c) => c.id));

  // 4a. Update local conversations that are also in the cloud (cloud wins)
  // This is the most complex part because of the nested 'messages'.
  // We will rehydrate and 'put' which overwrites the local version.
  for (const cloudConversation of cloudConversations) {
    const rehydrated = rehydrateConversation(cloudConversation);
    conversationSyncPromises.push(
      db.conversations.put(rehydrated, rehydrated.id)
    );
  }

  // 4b. Add local-only conversations to the cloud
  for (const localConversation of localConversations) {
    if (!cloudConversationIds.has(localConversation.id)) {
      const { id, messages, ...data } = localConversation;
      conversationSyncPromises.push(
        createConversationInCloud(id, data, userId).then(() =>
          Promise.all(
            messages.map((msg) => addMessageToCloud(msg, id))
          )
        )
      );
    }
  }

  // 4c. Delete local conversations that are no longer in the cloud
  for (const localId of localConversationIds) {
    if (!cloudConversationIds.has(localId)) {
      conversationSyncPromises.push(db.conversations.delete(localId));
    }
  }

  await Promise.all(conversationSyncPromises);
}

/**
 * @deprecated This function is replaced by syncCloudAndLocal for a more robust two-way sync.
 */
export async function syncCloudToLocal(userId: string) {
  try {
    // 1. Fetch all conversation documents for the user in one go.
    const conversationsResponse = await databases.listDocuments(
      APPWRITE_DATABASE_ID,
      APPWRITE_CONVERSATIONS_COLLECTION_ID,
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
        APPWRITE_MESSAGES_COLLECTION_ID,
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
      folderId: convo.folderId,
      createdAt: new Date(convo.$createdAt),
      updatedAt: new Date(convo.$updatedAt),
      modelId: convo.modelId,
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
  config: Partial<Omit<UserConfig, "id">>
) {
  try {
    const { createdAt, updatedAt, ...payload } = config;
    return await databases.createDocument(
      APPWRITE_DATABASE_ID,
      USER_CONFIG_COLLECTION_ID,
      userId, // Document ID is the user's ID
      { ...payload, userId } // Also include userId as a required attribute in the document body
    );
  } catch (error) {
    console.error("Failed to create user config in cloud:", error);
    throw new Error("Failed to create user config in cloud.");
  }
}

export async function updateCloudUserConfig(
  userId: string,
  config: Partial<Omit<UserConfig, "id">>
) {
  try {
    const { createdAt, updatedAt, ...payload } = config;
    return await databases.updateDocument(
      APPWRITE_DATABASE_ID,
      USER_CONFIG_COLLECTION_ID,
      userId, // Document ID is the user's ID
      payload
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
      APPWRITE_MESSAGES_COLLECTION_ID,
      messageId,
      updates
    );
  } catch (error) {
    console.error("Failed to update message in cloud:", error);
    throw new Error("Failed to update message in cloud.");
  }
} 
import { type Conversation, type Message, db } from "../db";
import { functions } from "../appwriteClient";
import type { Models } from "appwrite";

const UPLOAD_FUNCTION_ID = "sync-upload"; // Replace with your 'sync-upload' function ID
const DOWNLOAD_FUNCTION_ID = "sync-download"; // Replace with your 'sync-download' function ID

/**
 * Fetches all conversations from the local IndexedDB.
 * @returns {Promise<Conversation[]>} A promise that resolves to an array of conversations.
 */
async function getAllLocalConversations() {
  return await db.conversations.toArray();
}

/**
 * Uploads all local conversations to the Appwrite backend for temporary storage.
 * It calls an Appwrite function to handle the server-side logic.
 * @returns {Promise<any>} The result from the Appwrite function execution.
 */
export async function uploadConversations(): Promise<Models.Execution> {
  try {
    const conversations = await getAllLocalConversations();
    if (conversations.length === 0) {
      console.log("No conversations to sync.");
      // We can return a mock Execution object or handle this case in the hook
      return Promise.resolve({
        $id: "",
        $createdAt: "",
        $updatedAt: "",
        $permissions: [],
        functionId: UPLOAD_FUNCTION_ID,
        trigger: "http",
        status: "completed",
        requestMethod: "POST",
        requestPath: "",
        requestHeaders: [],
        responseStatusCode: 200,
        responseBody: JSON.stringify({ success: true, message: "No new data to sync." }),
        responseHeaders: [],
        logs: "",
        errors: "",
        duration: 0,
        search: ""
      } as Models.Execution);
    }

    const execution = await functions.createExecution(
      UPLOAD_FUNCTION_ID,
      JSON.stringify({ conversations }), // Pass conversations in a structured payload
      false // sync execution
    );

    return execution;
  } catch (error) {
    console.error("Failed to upload conversations:", error);
    throw new Error("Conversation upload failed.");
  }
}

/**
 * Converts date strings in a conversation object back to Date objects.
 * This is necessary after data is deserialized from JSON.
 * @param conv The conversation object with date strings.
 * @returns The conversation object with proper Date objects.
 */
const rehydrateConversation = (conv: any): Conversation => {
  return {
    ...conv,
    createdAt: new Date(conv.createdAt),
    updatedAt: new Date(conv.updatedAt),
    messages: conv.messages.map((msg: any) => ({
      ...msg,
      createdAt: new Date(msg.createdAt),
    })),
  };
};

/**
 * Downloads conversations from the Appwrite backend and merges them into the local IndexedDB.
 * It calls an Appwrite function to get the data.
 * @returns {Promise<void>}
 */
export async function downloadAndMergeConversations(): Promise<void> {
  try {
    const execution = await functions.createExecution(
      DOWNLOAD_FUNCTION_ID,
      '{}', // No payload needed for download
      false // sync execution
    );

    if (execution.status === "failed") {
      throw new Error(`Function execution failed: ${execution.errors}`);
    }

    const remoteConversations: any[] = JSON.parse(execution.responseBody);

    if (!remoteConversations || remoteConversations.length === 0) {
      console.log("No remote conversations to download.");
      return;
    }

    // Rehydrate dates from strings to Date objects before saving
    const rehydratedConversations = remoteConversations.map(rehydrateConversation);

    // A simple merge strategy: add new, update existing
    await db.transaction("rw", db.conversations, async () => {
      for (const conv of rehydratedConversations) {
        const existing = await db.conversations.get(conv.id);
        if (existing) {
          // Merge messages to avoid duplicates
          const existingMessageIds = new Set(existing.messages.map((m) => m.id));
          const newMessages = conv.messages.filter((m) => !existingMessageIds.has(m.id));
          
          if(newMessages.length > 0 || conv.updatedAt > existing.updatedAt) {
             await db.conversations.update(conv.id, {
                ...conv,
                messages: [...existing.messages, ...newMessages].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
                updatedAt: new Date()
             });
          }
        } else {
          await db.conversations.add(conv);
        }
      }
    });

    console.log("Successfully downloaded and merged conversations.");
  } catch (error) {
    console.error("Failed to download and merge conversations:", error);
    throw new Error("Conversation download failed.");
  }
} 
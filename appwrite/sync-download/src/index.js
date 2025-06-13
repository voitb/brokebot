import { Client, Databases, Query } from "node-appwrite";

// --- Constants ---
const HTTP_STATUS = {
  OK: 200,
  NOT_FOUND: 404,
  UNAUTHORIZED: 401,
  INTERNAL_SERVER_ERROR: 500,
};

const ERROR_MESSAGES = {
  UNAUTHORIZED: "User not authenticated. User ID is missing from headers.",
  NOT_FOUND: "No sync data found for this user.",
  MISSING_ENV_VARS: "One or more environment variables are missing or empty.",
  SERVER_ERROR: "An internal server error occurred.",
};

// --- Configuration ---
const CONFIG = {
  DATABASE_ID: process.env.APPWRITE_DATABASE_ID,
  COLLECTION_ID: process.env.APPWRITE_COLLECTION_ID,
  API_KEY: process.env.APPWRITE_API_KEY,
  ENDPOINT: process.env.APPWRITE_FUNCTION_ENDPOINT,
  PROJECT_ID: process.env.APPWRITE_FUNCTION_PROJECT_ID,
};

// --- Helper Functions ---

const sendResponse = (res, data, statusCode = HTTP_STATUS.OK) => {
  return res.json(data, statusCode);
};

const sendError = (res, message, statusCode, logError, internalLogMessage) => {
  if (logError && internalLogMessage) {
    logError(internalLogMessage);
  }
  return sendResponse(res, { success: false, error: message }, statusCode);
};

// --- Main Logic ---

const getDatabaseClient = () => {
  const client = new Client()
    .setEndpoint(CONFIG.ENDPOINT)
    .setProject(CONFIG.PROJECT_ID)
    .setKey(CONFIG.API_KEY);
  return new Databases(client);
};

/**
 * Downloads and then deletes a user's sync document.
 * @param {Databases} databases - The Appwrite Databases service instance.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<object[]|null>} The conversations array or null if not found.
 */
const downloadAndDeleteSyncDocument = async (databases, userId, log) => {
  const existingDocs = await databases.listDocuments(CONFIG.DATABASE_ID, CONFIG.COLLECTION_ID, [
    Query.equal("userId", userId),
    Query.limit(1),
  ]);

  if (existingDocs.total > 0) {
    const document = existingDocs.documents[0];
    const conversations = JSON.parse(document.conversations);

    await databases.deleteDocument(CONFIG.DATABASE_ID, CONFIG.COLLECTION_ID, document.$id);
    
    log(`Successfully retrieved and deleted sync document for user: ${userId}`);
    return conversations;
  }
  
  log(`No sync document found for user: ${userId}`);
  return null;
};

// --- Entry Point ---

export default async ({ req, res, log, error }) => {
  const missingVars = Object.entries(CONFIG).filter(([, val]) => !val).map(([key]) => key);
  if (missingVars.length > 0) {
    return sendError(res, ERROR_MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR, error, `${ERROR_MESSAGES.MISSING_ENV_VARS} Missing: ${missingVars.join(', ')}`);
  }

  const userId = req.headers['x-appwrite-user-id'];
  if (!userId) {
    return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED, error, ERROR_MESSAGES.UNAUTHORIZED);
  }

  try {
    const databases = getDatabaseClient();
    const conversations = await downloadAndDeleteSyncDocument(databases, userId, log);

    if (conversations) {
      return sendResponse(res, conversations, HTTP_STATUS.OK);
    } else {
      // It's not an error if there's nothing to download, just return an empty array.
      return sendResponse(res, [], HTTP_STATUS.OK);
    }
  } catch (e) {
    return sendError(res, ERROR_MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR, error, `Failed to download document for user ${userId}: ${e.message}`);
  }
}; 
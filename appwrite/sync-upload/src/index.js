import { Client, Databases, ID, Query } from "node-appwrite";

// --- Constants ---
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  INTERNAL_SERVER_ERROR: 500,
};

const ERROR_MESSAGES = {
  UNAUTHORIZED: "User not authenticated. User ID is missing from headers.",
  INVALID_PAYLOAD: "Invalid payload. Expected 'conversations' as a non-empty array.",
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

/**
 * Sends a JSON response.
 * @param {object} res - The response object from Appwrite.
 * @param {object} data - The JSON data to send.
 * @param {number} statusCode - The HTTP status code.
 */
const sendResponse = (res, data, statusCode = HTTP_STATUS.OK) => {
  return res.json(data, statusCode);
};

/**
 * Handles sending error responses.
 * @param {object} res - The response object from Appwrite.
 * @param {string} message - The error message for the client.
 * @param {number} statusCode - The HTTP status code.
 * @param {function} logError - The error logging function from Appwrite.
 * @param {string} internalLogMessage - The message to log internally.
 */
const sendError = (res, message, statusCode, logError, internalLogMessage) => {
  if (logError && internalLogMessage) {
    logError(internalLogMessage);
  }
  return sendResponse(res, { success: false, error: message }, statusCode);
};


// --- Main Logic ---

/**
 * Initializes and returns an Appwrite Databases client.
 * @returns {Databases}
 */
const getDatabaseClient = () => {
  const client = new Client()
    .setEndpoint(CONFIG.ENDPOINT)
    .setProject(CONFIG.PROJECT_ID)
    .setKey(CONFIG.API_KEY);
  return new Databases(client);
};

/**
 * Creates or updates a sync document for a given user.
 * @param {Databases} databases - The Appwrite Databases service instance.
 * @param {string} userId - The ID of the user.
 * @param {string} conversationsJSON - The user's conversations as a JSON string.
 */
const createOrUpdateSyncDocument = async (databases, userId, conversationsJSON, log) => {
  const existingDocs = await databases.listDocuments(CONFIG.DATABASE_ID, CONFIG.COLLECTION_ID, [
    Query.equal("userId", userId),
  ]);

  if (existingDocs.total > 0) {
    const documentId = existingDocs.documents[0].$id;
    await databases.updateDocument(CONFIG.DATABASE_ID, CONFIG.COLLECTION_ID, documentId, {
      conversations: conversationsJSON,
      updatedAt: new Date().toISOString(),
    });
    log(`Updated sync document for user: ${userId}`);
    return { status: "updated", code: HTTP_STATUS.OK };
  } else {
    await databases.createDocument(
      CONFIG.DATABASE_ID,
      CONFIG.COLLECTION_ID,
      ID.unique(),
      {
        userId,
        conversations: conversationsJSON,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      [`read("user:${userId}")`, `update("user:${userId}")`, `delete("user:${userId}")`]
    );
    log(`Created new sync document for user: ${userId}`);
    return { status: "created", code: HTTP_STATUS.CREATED };
  }
};

// --- Entry Point ---

export default async ({ req, res, log, error }) => {
  // Validate Environment Variables
  const missingVars = Object.entries(CONFIG).filter(([, val]) => !val).map(([key]) => key);
  if (missingVars.length > 0) {
    return sendError(res, ERROR_MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR, error, `${ERROR_MESSAGES.MISSING_ENV_VARS} Missing: ${missingVars.join(', ')}`);
  }

  // Authenticate user
  const userId = req.headers['x-appwrite-user-id'];
  if (!userId) {
    return sendError(res, ERROR_MESSAGES.UNAUTHORIZED, HTTP_STATUS.UNAUTHORIZED, error, ERROR_MESSAGES.UNAUTHORIZED);
  }

  // Validate payload
  let body;
  try {
    body = JSON.parse(req.body ?? '{}');
  } catch (e) {
    return sendError(res, "Invalid JSON in request body.", HTTP_STATUS.BAD_REQUEST, error, `JSON parsing failed: ${e.message}`);
  }

  const { conversations } = body;
  if (!conversations || !Array.isArray(conversations) || conversations.length === 0) {
    return sendError(res, ERROR_MESSAGES.INVALID_PAYLOAD, HTTP_STATUS.BAD_REQUEST);
  }

  try {
    const databases = getDatabaseClient();
    const result = await createOrUpdateSyncDocument(databases, userId, JSON.stringify(conversations), log);
    
    return sendResponse(res, { success: true, message: `Conversations ${result.status} successfully.` }, result.code);

  } catch (e) {
    return sendError(res, ERROR_MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR, error, `Failed to sync document for user ${userId}: ${e.message}`);
  }
}; 
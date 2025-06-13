import { Client, Databases, Query } from "node-appwrite";

// --- Constants ---
const HTTP_STATUS = {
  OK: 200,
  INTERNAL_SERVER_ERROR: 500,
};

const ERROR_MESSAGES = {
  MISSING_ENV_VARS: "One or more environment variables are missing or empty.",
  SERVER_ERROR: "An internal server error occurred during cleanup.",
};

// --- Configuration ---
const CONFIG = {
  DATABASE_ID: process.env.APPWRITE_DATABASE_ID,
  COLLECTION_ID: process.env.APPWRITE_COLLECTION_ID,
  API_KEY: process.env.APPWRITE_API_KEY,
  ENDPOINT: process.env.APPWRITE_FUNCTION_ENDPOINT,
  PROJECT_ID: process.env.APPWRITE_FUNCTION_PROJECT_ID,
  TTL_HOURS: parseInt(process.env.SYNC_TTL_HOURS, 10) || 24, // Time-to-Live in hours
  BATCH_SIZE: 100, // Number of documents to process in one go
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
    .setKey(CONFIG.API_KEY); // Use a powerful API key for cleanup
  return new Databases(client);
};

/**
 * Deletes all documents older than the configured TTL.
 * @param {Databases} databases - The Appwrite Databases service instance.
 */
const deleteStaleDocuments = async (databases, log, error) => {
  const expirationDate = new Date();
  expirationDate.setHours(expirationDate.getHours() - CONFIG.TTL_HOURS);
  const expirationISO = expirationDate.toISOString();
  log(`Searching for documents created before: ${expirationISO}`);

  let documentsProcessed = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await databases.listDocuments(CONFIG.DATABASE_ID, CONFIG.COLLECTION_ID, [
      Query.lessThanEqual("createdAt", expirationISO),
      Query.limit(CONFIG.BATCH_SIZE),
    ]);
    
    const documentsToDelete = response.documents;
    if (documentsToDelete.length === 0) {
      hasMore = false;
      continue;
    }

    log(`Found ${documentsToDelete.length} stale documents to delete in this batch.`);
    
    const deletePromises = documentsToDelete.map(doc =>
      databases.deleteDocument(CONFIG.DATABASE_ID, CONFIG.COLLECTION_ID, doc.$id)
    );
    
    // Using Promise.allSettled to continue even if some deletions fail
    const results = await Promise.allSettled(deletePromises);
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        error(`Failed to delete document ${documentsToDelete[index].$id}: ${result.reason}`);
      }
    });

    documentsProcessed += documentsToDelete.length;
  }
  
  log(`Cleanup process completed. Total documents deleted: ${documentsProcessed}.`);
  return documentsProcessed;
};

// --- Entry Point ---

export default async ({ req, res, log, error }) => {
  if (req.headers['x-appwrite-trigger'] !== 'schedule') {
    log("Function was triggered manually, not by schedule. Exiting.");
    return sendResponse(res, { success: true, message: "Manual trigger acknowledged. No action taken." });
  }

  const missingVars = Object.entries(CONFIG).filter(([key, val]) => key !== 'SYNC_TTL_HOURS' && !val).map(([key]) => key);
  if (missingVars.length > 0) {
    return sendError(res, ERROR_MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR, error, `${ERROR_MESSAGES.MISSING_ENV_VARS} Missing: ${missingVars.join(', ')}`);
  }

  try {
    const databases = getDatabaseClient();
    const count = await deleteStaleDocuments(databases, log, error);
    return sendResponse(res, { success: true, message: `Cleanup process completed. Deleted ${count} documents.` });
  } catch (e) {
    return sendError(res, ERROR_MESSAGES.SERVER_ERROR, HTTP_STATUS.INTERNAL_SERVER_ERROR, error, `Unhandled exception in cleanup: ${e.message}`);
  }
}; 
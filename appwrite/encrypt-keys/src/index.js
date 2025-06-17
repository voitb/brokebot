const crypto = require('crypto');

const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_SERVER_ERROR: 500,
};

const ERROR_MESSAGES = {
  METHOD_NOT_ALLOWED: "Method Not Allowed",
  INVALID_JSON: "Invalid JSON format.",
  MISSING_ACTION: "Action parameter is required (encrypt/decrypt).",
  MISSING_DATA: "Data parameter is required.",
  MISSING_USER_ID: "User ID is required for encryption/decryption.",
  ENCRYPTION_ERROR: "Failed to encrypt data.",
  DECRYPTION_ERROR: "Failed to decrypt data.",
  INVALID_ACTION: "Invalid action. Use 'encrypt' or 'decrypt'.",
};

/**
 * Sends a JSON response.
 */
const sendResponse = (res, data, statusCode = HTTP_STATUS.OK) => {
  return res.json(data, statusCode);
};

/**
 * Handles sending error responses.
 */
const sendError = (res, message, statusCode, logError, internalLogMessage) => {
  if (logError && internalLogMessage) {
    logError(internalLogMessage);
  }
  return sendResponse(res, { error: message }, statusCode);
};

/**
 * Derives a user-specific encryption key from master key and user ID
 */
const deriveUserKey = (userId, masterKey) => {
  const salt = crypto.createHash('sha256').update(userId).digest();
  return crypto.pbkdf2Sync(masterKey, salt, 100000, 32, 'sha256');
};

/**
 * Encrypts data using AES-256-GCM
 */
const encryptData = (plaintext, userId, masterKey) => {
  try {
    const key = deriveUserKey(userId, masterKey);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', key);
    cipher.setAAD(Buffer.from(userId, 'utf8'));
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine iv + authTag + encrypted data
    const result = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
    return result;
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

/**
 * Decrypts data using AES-256-GCM
 */
const decryptData = (encryptedData, userId, masterKey) => {
  try {
    const key = deriveUserKey(userId, masterKey);
    const parts = encryptedData.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipher('aes-256-gcm', key);
    decipher.setAuthTag(authTag);
    decipher.setAAD(Buffer.from(userId, 'utf8'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

/**
 * Main function handler
 */
module.exports = async ({ req, res, log, error }) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return sendError(
      res,
      ERROR_MESSAGES.METHOD_NOT_ALLOWED,
      HTTP_STATUS.METHOD_NOT_ALLOWED
    );
  }

  // Parse request body
  let body;
  try {
    body = JSON.parse(req.body);
  } catch (e) {
    return sendError(
      res,
      ERROR_MESSAGES.INVALID_JSON,
      HTTP_STATUS.BAD_REQUEST,
      error,
      `Failed to parse JSON: ${e.message}`
    );
  }

  const { action, data, userId } = body;

  // Validate required parameters
  if (!action) {
    return sendError(res, ERROR_MESSAGES.MISSING_ACTION, HTTP_STATUS.BAD_REQUEST);
  }

  if (!data) {
    return sendError(res, ERROR_MESSAGES.MISSING_DATA, HTTP_STATUS.BAD_REQUEST);
  }

  if (!userId) {
    return sendError(res, ERROR_MESSAGES.MISSING_USER_ID, HTTP_STATUS.BAD_REQUEST);
  }

  // Get master encryption key from environment
  const masterKey = process.env.MASTER_ENCRYPTION_KEY;
  if (!masterKey) {
    return sendError(
      res,
      "Server configuration error",
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error,
      "MASTER_ENCRYPTION_KEY environment variable not set"
    );
  }

  log(`Processing ${action} request for user: ${userId}`);

  try {
    let result;

    switch (action) {
      case 'encrypt':
        result = encryptData(data, userId, masterKey);
        log(`Successfully encrypted data for user: ${userId}`);
        return sendResponse(res, { 
          encrypted: result,
          success: true
        });

      case 'decrypt':
        result = decryptData(data, userId, masterKey);
        log(`Successfully decrypted data for user: ${userId}`);
        return sendResponse(res, { 
          decrypted: result,
          success: true
        });

      default:
        return sendError(res, ERROR_MESSAGES.INVALID_ACTION, HTTP_STATUS.BAD_REQUEST);
    }

  } catch (e) {
    const errorMessage = action === 'encrypt' ? ERROR_MESSAGES.ENCRYPTION_ERROR : ERROR_MESSAGES.DECRYPTION_ERROR;
    return sendError(
      res,
      errorMessage,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error,
      `${action} operation failed: ${e.message}`
    );
  }
}; 
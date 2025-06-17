const { Client, Functions } = require('node-appwrite');

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
  API_KEY_MISSING:
    "OpenRouter API key not provided. Please configure your API key.",
  MISSING_FIELDS:
    "Fields 'model' and 'messages' (as non-empty array) are required.",
  EXTERNAL_API_ERROR: "External API error.",
  SERVER_ERROR: "Server error occurred.",
  INVALID_API_KEY: "Invalid API key. Please check your API key configuration.",
  DECRYPTION_ERROR: "Failed to decrypt API key.",
};

const CONFIG = {
  OPENROUTER_API_URL: "https://openrouter.ai/api/v1/chat/completions",
  REQUEST_TIMEOUT_MS: 90000,
  APP_URL: process.env.APP_URL || "http://localhost:5173",
  APP_TITLE: process.env.APP_TITLE || "brokebot",
};

// Initialize Appwrite client for internal function calls
const client = new Client()
  .setEndpoint(process.env.APPWRITE_FUNCTION_ENDPOINT)
  .setProject(process.env.APPWRITE_FUNCTION_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const functions = new Functions(client);

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
 * @param {function} [logError] - The error logging function from Appwrite.
 * @param {string} [internalLogMessage] - The message to log internally.
 */
const sendError = (res, message, statusCode, logError, internalLogMessage) => {
  if (logError && internalLogMessage) {
    logError(internalLogMessage);
  }
  return sendResponse(res, { error: message }, statusCode);
};

/**
 * Forwards the chat completion request to the OpenRouter API.
 * @param {{model: string, messages: any[], apiKey: string, log: function, error: function}} params
 * @returns {Promise<{data: object, status: number}|{error: object, status: number}>}
 */
const forwardToOpenRouter = async ({
  model,
  messages,
  apiKey,
  log,
  error,
}) => {
  log(`Forwarding request to model: ${model} with ${messages.length} messages`);
  log(`Messages preview: ${JSON.stringify(messages.slice(0, 2))}...`);
  log(
    `Making request to OpenRouter with API key: ${apiKey ? "SET" : "NOT SET"}`
  );

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    CONFIG.REQUEST_TIMEOUT_MS
  );

  try {
    const response = await fetch(CONFIG.OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": CONFIG.APP_URL,
        "X-Title": CONFIG.APP_TITLE,
      },
      body: JSON.stringify({ model, messages }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const responseData = await response.json();
      log(`OpenRouter API response successful for model: ${model}`);
      return { data: responseData, status: response.status };
    } else {
      const errorText = await response.text();
      let errorResponse;
      try {
        errorResponse = JSON.parse(errorText);
      } catch {
        errorResponse = { error: { message: errorText } };
      }

      error(`OpenRouter API error: ${response.status} - ${errorText}`);

      // Handle specific error cases
      if (response.status === 401) {
        return {
          error: { message: ERROR_MESSAGES.INVALID_API_KEY },
          status: response.status,
          details: errorResponse,
        };
      }

      return {
        error: { message: ERROR_MESSAGES.EXTERNAL_API_ERROR },
        status: response.status,
        details: errorResponse,
      };
    }
  } catch (e) {
    clearTimeout(timeoutId);
    error(`Internal error while communicating with OpenRouter: ${e.message}`);

    if (e.name === "AbortError") {
      return {
        error: { message: "Request timeout" },
        status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
      };
    }

    return {
      error: { message: ERROR_MESSAGES.SERVER_ERROR },
      status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    };
  }
};

/**
 * Decrypts API key using the encrypt-keys function
 */
const decryptApiKey = async (encryptedKey, userId, log, error) => {
  try {
    log(`Attempting to decrypt API key for user: ${userId}`);
    
    const execution = await functions.createExecution(
      'encrypt-keys',
      JSON.stringify({
        action: 'decrypt',
        data: encryptedKey,
        userId: userId
      })
    );

    if (execution.responseStatusCode !== 200) {
      throw new Error(`Decryption request failed: ${execution.responseStatusCode}`);
    }

    const result = JSON.parse(execution.responseBody);
    
    if (!result.success) {
      throw new Error(result.error || 'Decryption failed');
    }

    log(`Successfully decrypted API key for user: ${userId}`);
    return result.decrypted;
  } catch (e) {
    error(`API key decryption failed: ${e.message}`);
    throw new Error('Failed to decrypt API key');
  }
};

// FIX: Use module.exports for CommonJS compatibility
module.exports = async ({ req, res, log, error }) => {
  if (req.method !== "POST") {
    return sendError(
      res,
      ERROR_MESSAGES.METHOD_NOT_ALLOWED,
      HTTP_STATUS.METHOD_NOT_ALLOWED
    );
  }

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

  const { model, messages, api_key, user_id } = body;
  const encryptedApiKey = api_key || process.env.OPENROUTER_API_KEY;
  const userId = user_id;

  log(
    `Request received for model: ${model}, encrypted API key provided: ${
      encryptedApiKey ? "YES" : "NO"
    }, user ID: ${userId || "NOT PROVIDED"}`
  );
  log(`Messages count: ${Array.isArray(messages) ? messages.length : 0}`);

  // Log message structure for debugging rate limits
  if (Array.isArray(messages)) {
    log(
      `Message structure: ${messages
        .map((m) => `${m.role}(${m.content?.length || 0} chars)`)
        .join(", ")}`
    );
  }

  if (!encryptedApiKey) {
    return sendError(
      res,
      ERROR_MESSAGES.API_KEY_MISSING,
      HTTP_STATUS.BAD_REQUEST,
      error,
      "OpenRouter API key not provided."
    );
  }

  if (!userId) {
    return sendError(
      res,
      "User ID is required for key decryption.",
      HTTP_STATUS.BAD_REQUEST,
      error,
      "User ID not provided for key decryption."
    );
  }

  if (!model || !Array.isArray(messages) || messages.length === 0) {
    return sendError(res, ERROR_MESSAGES.MISSING_FIELDS, HTTP_STATUS.BAD_REQUEST);
  }

  try {
    // Decrypt the API key
    let apiKey;
    try {
      apiKey = await decryptApiKey(encryptedApiKey, userId, log, error);
    } catch (decryptError) {
      return sendError(
        res,
        ERROR_MESSAGES.DECRYPTION_ERROR,
        HTTP_STATUS.BAD_REQUEST,
        error,
        `API key decryption failed: ${decryptError.message}`
      );
    }

    const result = await forwardToOpenRouter({
      model,
      messages,
      apiKey,
      log,
      error,
    });

    if (result.error) {
      log(`OpenRouter API error response: ${JSON.stringify(result)}`);
      return sendResponse(res, { error: result.error.message }, result.status);
    }

    log(`Successfully processed request for model: ${model}`);
    return sendResponse(res, result.data, result.status);
  } catch (e) {
    return sendError(
      res,
      ERROR_MESSAGES.SERVER_ERROR,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error,
      `Unhandled exception in main handler: ${e.message}`
    );
  }
};
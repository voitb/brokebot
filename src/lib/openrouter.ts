import { Functions } from 'appwrite';
import { encryptValue, decryptValue } from './encryptionService';
import { account } from './appwriteClient';

export interface ApiKeyConfig {
  openrouterApiKey?: string;
  // Future API keys - currently commented out
  // openaiApiKey?: string;
  // anthropicApiKey?: string;
  // googleApiKey?: string;
}

export interface OpenRouterConfig {
  functions: Functions;
  siteUrl?: string;
  siteName?: string;
  keys: ApiKeyConfig;
}

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface StreamResponse {
  content: string;
  isComplete: boolean;
  error?: string;
}

export interface OpenRouterModel {
  id: string;
  name:string;
  description: string;
  provider: string;
  category: string;
  isFree: boolean;
  contextLength: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

export const getCategoryFromModel = (model: { id: string, name: string, description: string }): string => {
  const modelName = model.name.toLowerCase();
  const modelId = model.id.toLowerCase();
  const modelDesc = model.description.toLowerCase();

  if (modelId.includes('vision') || modelDesc.includes('multimodal')) return 'multimodal';
  if (modelName.includes('claude') && modelName.includes('sonnet')) return 'reasoning';
  if (modelName.includes('gpt-4') || modelName.includes('reasoning')) return 'reasoning';
  if (modelName.includes('flash') || modelName.includes('haiku') || modelName.includes('mini')) return 'efficient';
  if (modelId.includes('code') || modelDesc.includes('coding')) return 'instruction';
  if (modelName.includes('instruct')) return 'instruction';
  
  return 'general';
};

// Helper function to validate OpenRouter API key format
const validateOpenRouterKey = (key: string): boolean => {
  // OpenRouter keys usually start with "sk-or-" and are long
  const isValidFormat = key.startsWith('sk-or-') && key.length > 20;
  return isValidFormat;
};

export class OpenRouterClient {
  private functions: Functions;
  // private config: OpenRouterConfig;
  private keys: ApiKeyConfig;

  constructor(config: OpenRouterConfig) {
    // this.config = config;
    this.functions = config.functions;
    this.keys = config.keys;
  }

  /**
   * Gets current user ID for encryption context
   */
  private async getCurrentUserId(): Promise<string> {
    try {
      const user = await account.get();
      return user.$id;
    } catch (error) {
      // For anonymous users, use a browser fingerprint
      return this.getBrowserFingerprint();
    }
  }

  /**
   * Creates a unique browser fingerprint for anonymous users
   */
  private getBrowserFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Browser fingerprint', 2, 2);
    }
    
    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL()
    ].join('|');
    
    // Create a hash of the fingerprint
    return btoa(fingerprint).slice(0, 32);
  }

  async *streamCompletion(
    model: string,
    messages: OpenRouterMessage[],
    onProgress?: (content: string) => void,
    signal?: AbortSignal
  ): AsyncGenerator<StreamResponse, void, unknown> {
    try {
      // For now, always use OpenRouter API key
      const apiKey = this.keys.openrouterApiKey;
      
      if (!apiKey) {
        throw new Error('OpenRouter API key not found. Please add your OpenRouter API key in Settings.');
      }
      
      if (!validateOpenRouterKey(apiKey)) {
        throw new Error('Invalid OpenRouter API key format. Key should start with "sk-or-" and be at least 20 characters long.');
      }

      // Get user ID and encrypt API key
      const userId = await this.getCurrentUserId();
      const encryptedApiKey = await encryptValue(apiKey);

      // Since Appwrite Functions don't support streaming, we'll use chunked polling approach
      const result = await this.functions.createExecution(
        'proxy-ai',
        JSON.stringify({
          model,
          messages,
          stream: true, // We'll handle this in the function
          api_key: encryptedApiKey,
          user_id: userId
        })
      );

      if (result.responseStatusCode !== 200) {
        const errorMsg = result.responseBody || 'Unknown function error';
        console.error('Appwrite function failed with status:', result.responseStatusCode);
        throw new Error(`Function execution failed (${result.responseStatusCode}): ${errorMsg}`);
      }

      let response;
      try {
        response = JSON.parse(result.responseBody);
      } catch {
        console.error('Invalid response format from proxy function');
        throw new Error('Invalid response format from proxy function');
      }
      
      if (response.error) {
        throw new Error(response.error);
      }

      // Simulate streaming by yielding the content progressively
      const fullContent = response.choices[0]?.message?.content || '';
      
      if (fullContent) {
        // Split content into chunks for progressive display
        const chunks = this.splitIntoChunks(fullContent);
        let accumulatedContent = '';

        for (const chunk of chunks) {
          if (signal?.aborted) {
            yield { content: accumulatedContent, isComplete: true, error: "stopped" };
            return;
          }
          accumulatedContent += chunk;
          if (onProgress) {
            onProgress(accumulatedContent);
          }
          yield {
            content: accumulatedContent,
            isComplete: false,
          };
          // Small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      yield {
        content: fullContent,
        isComplete: true,
      };
    } catch (error) {
      console.error('OpenRouter streaming error:', error);
      yield {
        content: '',
        isComplete: true,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  // Simplified key selection - always use OpenRouter key for now
  private getApiKeyForModel(
    // model: string
  ): string | undefined {
    // For now, always return OpenRouter API key regardless of model
    return this.keys.openrouterApiKey;
    
    // Future logic when we support other keys:
    // if (model.startsWith('openai/')) {
    //   return this.keys.openaiApiKey || this.keys.openrouterApiKey;
    // } else if (model.startsWith('anthropic/')) {
    //   return this.keys.anthropicApiKey || this.keys.openrouterApiKey;
    // } else if (model.startsWith('google/')) {
    //   return this.keys.googleApiKey || this.keys.openrouterApiKey;
    // } else {
    //   return this.keys.openrouterApiKey;
    // }
  }

  private splitIntoChunks(text: string, chunkSize: number = 3): string[] {
    const chunks: string[] = [];
    for (let i = 0; i < text.length; i += chunkSize) {
      chunks.push(text.slice(i, i + chunkSize));
    }
    return chunks;
  }

  async sendMessage(
    model: string,
    messages: OpenRouterMessage[]
  ): Promise<string> {
    try {
      const apiKey = this.getApiKeyForModel();
      
      if (!apiKey) {
        throw new Error('OpenRouter API key not found. Please add your OpenRouter API key in Settings.');
      }
      
      if (!validateOpenRouterKey(apiKey)) {
        throw new Error('Invalid OpenRouter API key format. Key should start with "sk-or-" and be at least 20 characters long.');
      }

      // Get user ID and encrypt API key
      const userId = await this.getCurrentUserId();
      const encryptedApiKey = await encryptValue(apiKey);

      const result = await this.functions.createExecution(
        'proxy-ai',
        JSON.stringify({
          model,
          messages,
          api_key: encryptedApiKey,
          user_id: userId
        })
      );

      if (result.responseStatusCode !== 200) {
        throw new Error(`Function execution failed: ${result.responseBody}`);
      }

      const response = JSON.parse(result.responseBody);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('OpenRouter error:', error);
      throw error;
    }
  }

  // Test API key validity with a simple request
  async testConnection(): Promise<boolean> {
    try {
      const apiKey = this.keys.openrouterApiKey;
      if (!apiKey) {
        return false;
      }
      
      if (!validateOpenRouterKey(apiKey)) {
        return false;
      }
      
      // Get user ID and encrypt API key
      const userId = await this.getCurrentUserId();
      const encryptedApiKey = await encryptValue(apiKey);
      
      const result = await this.functions.createExecution(
        'proxy-ai',
        JSON.stringify({
          model: "deepseek/deepseek-r1-0528-qwen3-8b:free", // Use a free model for testing
          messages: [{ role: "user", content: "Hello" }],
          api_key: encryptedApiKey,
          user_id: userId
        })
      );
      
      return result.responseStatusCode === 200;
    } catch {
      return false;
    }
  }

  async testApiKey(): Promise<{ success: boolean; error?: string }> {
    try {
      const apiKey = this.keys.openrouterApiKey;
      if (!apiKey) {
        return { success: false, error: 'API key is not set.' };
      }
      if (!validateOpenRouterKey(apiKey)) {
        return { success: false, error: 'Invalid API key format.' };
      }
      
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });

      if (response.status === 200) {
        return { success: true };
      } else if (response.status === 401) {
        return { success: false, error: 'Invalid API key.' };
      } else {
        return { success: false, error: `API key validation failed with status: ${response.status}` };
      }
    } catch (error) {
      return { success: false, error: 'A network error occurred while validating the API key.' };
    }
  }
}

export const getStoredApiKeys = async () => {
  if (typeof window === 'undefined') {
    return {};
  }
  
  try {
    const encryptedKeys = localStorage.getItem('apiKeys');
    if (!encryptedKeys) return {};
    
    const parsedKeys = JSON.parse(encryptedKeys);
    const decryptedKeys: any = {};
    
    // Decrypt each key
    for (const [provider, encryptedKey] of Object.entries(parsedKeys)) {
      if (encryptedKey && typeof encryptedKey === 'string') {
        try {
          decryptedKeys[provider] = await decryptValue(encryptedKey);
        } catch (error) {
          console.warn(`Failed to decrypt API key for ${provider}:`, error);
          // Skip this key if decryption fails
        }
      }
    }
    
    return decryptedKeys;
  } catch (error) {
    console.error('Failed to retrieve API keys:', error);
    return {};
  }
};

export const storeApiKeys = async (keys: Partial<ReturnType<typeof getStoredApiKeys>>) => {
  if (typeof window === 'undefined') {
    return;
  }
  
  try {
    const currentKeys = await getStoredApiKeys();
    const newKeys = { ...currentKeys, ...keys };
    const encryptedKeys: any = {};
    
    // Encrypt each key
    for (const [provider, key] of Object.entries(newKeys)) {
      if (key && typeof key === 'string') {
        try {
          encryptedKeys[provider] = await encryptValue(key);
        } catch (error) {
          console.error(`Failed to encrypt API key for ${provider}:`, error);
          throw new Error(`Failed to securely store API key for ${provider}`);
        }
      }
    }
    
    localStorage.setItem('apiKeys', JSON.stringify(encryptedKeys));
  } catch (error) {
    console.error('Failed to store API keys:', error);
    throw error;
  }
};
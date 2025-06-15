import { Functions } from 'appwrite';

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

// Available free models that learn from prompts
export const FREE_LEARNING_MODELS = [
  {
    id: "deepseek/deepseek-r1-0528-qwen3-8b:free",
    name: "DeepSeek R1 Qwen3 8B",
    description: "Advanced reasoning model - learns from user prompts",
    provider: "DeepSeek",
    category: "reasoning",
    warning: "This model learns from your conversations"
  },
  {
    id: "google/gemini-2.0-flash-exp:free",
    name: "Gemini 2.0 Flash Experimental",
    description: "Latest Google multimodal model - learns from user prompts",
    provider: "Google",
    category: "multimodal",
    warning: "This model learns from your conversations"
  },
  {
    id: "qwen/qwen3-32b:free",
    name: "Qwen3 32B",
    description: "Large language model - learns from user prompts",
    provider: "Alibaba",
    category: "general",
    warning: "This model learns from your conversations"
  },
  {
    id: "google/gemma-3n-e4b-it:free",
    name: "Gemma 3n E4B Instruct",
    description: "Google's instruction-tuned model - learns from user prompts",
    provider: "Google",
    category: "instruction",
    warning: "This model learns from your conversations"
  }
] as const;

// Paid models requiring API keys
export const PAID_API_MODELS = [
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    description: "OpenAI's flagship multimodal model",
    provider: "OpenAI",
    category: "multimodal",
    requiresApiKey: "openai"
  },
  {
    id: "openai/gpt-4o-mini",
    name: "GPT-4o Mini",
    description: "Smaller, faster version of GPT-4o",
    provider: "OpenAI",
    category: "efficient",
    requiresApiKey: "openai"
  },
  {
    id: "anthropic/claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet",
    description: "Anthropic's most capable model",
    provider: "Anthropic",
    category: "reasoning",
    requiresApiKey: "anthropic"
  },
  {
    id: "anthropic/claude-3.5-haiku",
    name: "Claude 3.5 Haiku",
    description: "Fast and efficient Claude model",
    provider: "Anthropic",
    category: "efficient",
    requiresApiKey: "anthropic"
  },
  {
    id: "google/gemini-pro-1.5",
    name: "Gemini Pro 1.5",
    description: "Google's advanced multimodal model",
    provider: "Google",
    category: "multimodal",
    requiresApiKey: "google"
  }
] as const;

export type OpenRouterModel = typeof FREE_LEARNING_MODELS[number] | typeof PAID_API_MODELS[number];

// Helper function to validate OpenRouter API key format
const validateOpenRouterKey = (key: string): boolean => {
  // OpenRouter keys usually start with "sk-or-" and are long
  const isValidFormat = key.startsWith('sk-or-') && key.length > 20;
  return isValidFormat;
};

export class OpenRouterClient {
  private functions: Functions;
  private config: OpenRouterConfig;
  private keys: ApiKeyConfig;

  constructor(config: OpenRouterConfig) {
    this.config = config;
    this.functions = config.functions;
    this.keys = config.keys;
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

      // Since Appwrite Functions don't support streaming, we'll use chunked polling approach
      const result = await this.functions.createExecution(
        'proxy-ai',
        JSON.stringify({
          model,
          messages,
          stream: true, // We'll handle this in the function
          api_key: apiKey
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
  private getApiKeyForModel(model: string): string | undefined {
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
      const apiKey = this.getApiKeyForModel(model);
      
      if (!apiKey) {
        throw new Error('OpenRouter API key not found. Please add your OpenRouter API key in Settings.');
      }
      
      if (!validateOpenRouterKey(apiKey)) {
        throw new Error('Invalid OpenRouter API key format. Key should start with "sk-or-" and be at least 20 characters long.');
      }

      const result = await this.functions.createExecution(
        'proxy-ai',
        JSON.stringify({
          model,
          messages,
          api_key: apiKey
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
      
      const result = await this.functions.createExecution(
        'proxy-ai',
        JSON.stringify({
          model: "deepseek/deepseek-r1-0528-qwen3-8b:free", // Use a free model for testing
          messages: [{ role: "user", content: "Hello" }],
          api_key: apiKey
        })
      );
      
      return result.responseStatusCode === 200;
    } catch (error) {
      console.error('OpenRouter connection test failed:', error);
      return false;
    }
  }

  // Public method to test API key
  async testApiKey(): Promise<{ success: boolean; error?: string }> {
    try {
      const apiKey = this.keys.openrouterApiKey;
      
      if (!apiKey) {
        return { success: false, error: 'No API key provided' };
      }
      
      if (!validateOpenRouterKey(apiKey)) {
        return { success: false, error: 'Invalid API key format' };
      }
      
      const isConnected = await this.testConnection();
      
      if (isConnected) {
        return { success: true };
      } else {
        return { success: false, error: 'Connection test failed' };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

// Utility to get stored API keys
export const getStoredApiKeys = () => {
  return {
    openrouter: localStorage.getItem('openrouter_api_key') || '',
    openai: localStorage.getItem('openai_api_key') || '',
    anthropic: localStorage.getItem('anthropic_api_key') || '',
    google: localStorage.getItem('google_api_key') || '',
  };
};

// Utility to store API keys
export const storeApiKeys = (keys: Partial<ReturnType<typeof getStoredApiKeys>>) => {
  Object.entries(keys).forEach(([provider, key]) => {
    if (key) {
      localStorage.setItem(`${provider}_api_key`, key);
    } else {
      localStorage.removeItem(`${provider}_api_key`);
    }
  });
}; 
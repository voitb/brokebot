import { Functions } from 'appwrite';

export interface OpenRouterConfig {
  functions: Functions;
  siteUrl?: string;
  siteName?: string;
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

export class OpenRouterClient {
  private functions: Functions;
  private config: OpenRouterConfig;

  constructor(config: OpenRouterConfig) {
    this.config = config;
    this.functions = config.functions;
  }

  async *streamCompletion(
    model: string,
    messages: OpenRouterMessage[],
    onProgress?: (content: string) => void
  ): AsyncGenerator<StreamResponse, void, unknown> {
    try {
      // Get API key from local storage
      const { getStoredApiKeys } = await import('./apiKeys');
      const keys = getStoredApiKeys();
      
      if (!keys.openrouter) {
        throw new Error('OpenRouter API key not found. Please add your API key in Settings.');
      }

      // Since Appwrite Functions don't support streaming, we'll use chunked polling approach
      const result = await this.functions.createExecution(
        'proxy-ai',
        JSON.stringify({
          model,
          messages,
          stream: true, // We'll handle this in the function
          api_key: keys.openrouter
        })
      );

      if (result.responseStatusCode !== 200) {
        const errorMsg = result.responseBody || 'Unknown function error';
        console.error('Appwrite function error:', result);
        throw new Error(`Function execution failed (${result.responseStatusCode}): ${errorMsg}`);
      }

      let response;
      try {
        response = JSON.parse(result.responseBody);
      } catch {
        console.error('Response parsing error:', result.responseBody);
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
      // Get API key from local storage
      const { getStoredApiKeys } = await import('./apiKeys');
      const keys = getStoredApiKeys();
      
      if (!keys.openrouter) {
        throw new Error('OpenRouter API key not found. Please add your API key in Settings.');
      }

      const result = await this.functions.createExecution(
        'proxy-ai',
        JSON.stringify({
          model,
          messages,
          api_key: keys.openrouter // Pass API key to Appwrite Function
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

  // Test API key validity
  async testConnection(): Promise<boolean> {
    try {
      const result = await this.functions.createExecution(
        'proxy-ai',
        JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [{ role: "user", content: "test" }],
        })
      );
      
      return result.responseStatusCode === 200;
    } catch (error) {
      console.error('OpenRouter connection test failed:', error);
      return false;
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
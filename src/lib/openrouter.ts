import { encryptValue, decryptValue } from './encryptionService';

export interface ApiKeyConfig {
  openrouterApiKey?: string;
}

export interface OpenRouterConfig {
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
  name: string;
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

export const getCategoryFromModel = (model: { id: string; name: string; description: string }): string => {
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

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const validateOpenRouterKey = (key: string): boolean => {
  return key.startsWith('sk-or-') && key.length > 20;
};

export class OpenRouterClient {
  private keys: ApiKeyConfig;
  private siteUrl: string;
  private siteName: string;

  constructor(config: OpenRouterConfig) {
    this.keys = config.keys;
    this.siteUrl = config.siteUrl || window.location.origin;
    this.siteName = config.siteName || 'Brokebot';
  }

  async *streamCompletion(
    model: string,
    messages: OpenRouterMessage[],
    onProgress?: (content: string) => void,
    signal?: AbortSignal
  ): AsyncGenerator<StreamResponse, void, unknown> {
    const apiKey = this.keys.openrouterApiKey;

    if (!apiKey) {
      yield { content: '', isComplete: true, error: 'OpenRouter API key not found. Please add your API key in Settings.' };
      return;
    }

    if (!validateOpenRouterKey(apiKey)) {
      yield { content: '', isComplete: true, error: 'Invalid OpenRouter API key format.' };
      return;
    }

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': this.siteUrl,
          'X-Title': this.siteName
        },
        body: JSON.stringify({
          model,
          messages,
          stream: true
        }),
        signal
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `API request failed with status ${response.status}`;
        yield { content: '', isComplete: true, error: errorMessage };
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        yield { content: '', isComplete: true, error: 'Failed to get response stream' };
        return;
      }

      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;

          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;

            if (delta) {
              accumulatedContent += delta;
              onProgress?.(accumulatedContent);
              yield { content: accumulatedContent, isComplete: false };
            }
          } catch {
            // Skip malformed JSON chunks
          }
        }
      }

      yield { content: accumulatedContent, isComplete: true };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        yield { content: '', isComplete: true, error: 'stopped' };
        return;
      }
      yield { content: '', isComplete: true, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async sendMessage(model: string, messages: OpenRouterMessage[]): Promise<string> {
    const apiKey = this.keys.openrouterApiKey;

    if (!apiKey) {
      throw new Error('OpenRouter API key not found. Please add your API key in Settings.');
    }

    if (!validateOpenRouterKey(apiKey)) {
      throw new Error('Invalid OpenRouter API key format.');
    }

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': this.siteUrl,
        'X-Title': this.siteName
      },
      body: JSON.stringify({ model, messages, stream: false })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  async testApiKey(): Promise<{ success: boolean; error?: string }> {
    const apiKey = this.keys.openrouterApiKey;

    if (!apiKey) {
      return { success: false, error: 'API key is not set.' };
    }

    if (!validateOpenRouterKey(apiKey)) {
      return { success: false, error: 'Invalid API key format.' };
    }

    try {
      const response = await fetch('https://openrouter.ai/api/v1/auth/key', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${apiKey}` }
      });

      if (response.status === 200) {
        return { success: true };
      } else if (response.status === 401) {
        return { success: false, error: 'Invalid API key.' };
      }
      return { success: false, error: `Validation failed with status: ${response.status}` };
    } catch {
      return { success: false, error: 'Network error while validating API key.' };
    }
  }

  async testConnection(): Promise<boolean> {
    const result = await this.testApiKey();
    return result.success;
  }
}

export const getStoredApiKeys = async (): Promise<ApiKeyConfig> => {
  if (typeof window === 'undefined') return {};

  try {
    const encryptedKeys = localStorage.getItem('apiKeys');
    if (!encryptedKeys) return {};

    const parsedKeys = JSON.parse(encryptedKeys) as Record<string, string>;
    const decryptedKeys: ApiKeyConfig = {};

    for (const [provider, encryptedKey] of Object.entries(parsedKeys)) {
      if (encryptedKey && typeof encryptedKey === 'string') {
        try {
          const decrypted = await decryptValue(encryptedKey);
          if (provider === 'openrouterApiKey') {
            decryptedKeys.openrouterApiKey = decrypted;
          }
        } catch {
          // Skip if decryption fails
        }
      }
    }

    return decryptedKeys;
  } catch {
    return {};
  }
};

export const storeApiKeys = async (keys: Partial<ApiKeyConfig>): Promise<void> => {
  if (typeof window === 'undefined') return;

  const currentKeys = await getStoredApiKeys();
  const newKeys = { ...currentKeys, ...keys };
  const encryptedKeys: Record<string, string> = {};

  for (const [provider, key] of Object.entries(newKeys)) {
    if (key && typeof key === 'string') {
      encryptedKeys[provider] = await encryptValue(key);
    }
  }

  localStorage.setItem('apiKeys', JSON.stringify(encryptedKeys));
};

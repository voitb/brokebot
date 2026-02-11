import { useState, useEffect } from 'react';
import { type OpenRouterModel, getCategoryFromModel } from '@/features/chat/api/openrouter';

interface OpenRouterApiModel {
  id: string;
  name: string;
  description: string;
  context_length: number;
  pricing: {
    prompt: string;
    completion: string;
  };
}

interface UseModelsReturn {
  models: OpenRouterModel[];
  isLoading: boolean;
  error: Error | null;
}

const API_URL = 'https://openrouter.ai/api/v1/models';

function formatContextLength(length: number | undefined): number {
    if (typeof length !== 'number' || length <= 0) {
      return 0;
    }
    return length;
}

export function useModels(): UseModelsReturn {
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchModels = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(API_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.statusText}`);
        }
        const { data } = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Unexpected response format from OpenRouter API.');
        }

        const formattedModels: OpenRouterModel[] = data
        .map((model: OpenRouterApiModel) => ({
          id: model.id,
          name: model.name,
          description: model.description,
          contextLength: formatContextLength(model.context_length),
          pricing: model.pricing,
          provider: model.id.split('/')[0],
          isFree: parseFloat(model.pricing.prompt) === 0 && parseFloat(model.pricing.completion) === 0,
          category: getCategoryFromModel(model),
        }));

        if (!controller.signal.aborted) {
          setModels(formattedModels);
        }
      } catch (e) {
        if (e instanceof DOMException && e.name === 'AbortError') {
          return;
        }
        if (!controller.signal.aborted) {
          setError(e instanceof Error ? e : new Error(String(e)));
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchModels();
    return () => controller.abort();
  }, []);

  return { models, isLoading, error };
} 
import { useState, useEffect } from 'react';
import { type OpenRouterModel, getCategoryFromModel } from '../../lib/openrouter';

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
    const fetchModels = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(API_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.statusText}`);
        }
        const { data } = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Unexpected response format from OpenRouter API.');
        }

        const formattedModels: OpenRouterModel[] = data
        .map((model: any) => ({
          id: model.id,
          name: model.name,
          description: model.description,
          contextLength: formatContextLength(model.context_length),
          pricing: model.pricing,
          provider: model.id.split('/')[0],
          isFree: parseFloat(model.pricing.prompt) === 0 && parseFloat(model.pricing.completion) === 0,
          category: getCategoryFromModel(model),
        }));

        setModels(formattedModels);
      } catch (e: any) {
        setError(e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchModels();
  }, []);

  return { models, isLoading, error };
} 
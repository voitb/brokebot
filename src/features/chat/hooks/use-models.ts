import { useState, useEffect } from 'react';
import { type OpenRouterModel, getCategoryFromModel } from '@/features/chat/api/openrouter';
import {
  OpenRouterModelsResponseSchema,
  OpenRouterApiModelSchema,
} from '@/lib/schemas/model-schema';

interface UseModelsOptions {
  apiKey?: string;
}

interface UseModelsReturn {
  models: OpenRouterModel[];
  isLoading: boolean;
  error: Error | null;
}

const API_URL = 'https://openrouter.ai/api/v1/models';

export function useModels({ apiKey }: UseModelsOptions = {}): UseModelsReturn {
  const [models, setModels] = useState<OpenRouterModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setModels([]);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchModels = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(API_URL, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to fetch models: ${response.statusText}`);
        }
        const parsed = OpenRouterModelsResponseSchema.safeParse(await response.json());
        if (!parsed.success) {
          throw new Error('Unexpected response format from OpenRouter API.');
        }

        const formattedModels: OpenRouterModel[] = parsed.data.data.flatMap((entry) => {
          const parsedModel = OpenRouterApiModelSchema.safeParse(entry);
          if (!parsedModel.success) {
            return [];
          }
          const model = parsedModel.data;
          return [{
            id: model.id,
            name: model.name,
            description: model.description,
            contextLength: Math.max(model.context_length ?? 0, 0),
            pricing: model.pricing,
            provider: model.id.split('/')[0],
            isFree: parseFloat(model.pricing.prompt) === 0 && parseFloat(model.pricing.completion) === 0,
            category: getCategoryFromModel(model),
          }];
        });

        if (parsed.data.data.length > 0 && formattedModels.length === 0) {
          throw new Error('Unexpected response format from OpenRouter API.');
        }

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
  }, [apiKey]);

  return { models, isLoading, error };
} 
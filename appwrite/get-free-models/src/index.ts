// This would be the entry point for your Appwrite function.
// It assumes you have a similar folder structure:
// /appwrite/get-free-models/src/index.ts

// Basic, simplified types to satisfy the linter locally.
// The actual types are provided by the Appwrite runtime.
interface AppwriteRequest {
  body: string;
}

interface AppwriteResponse {
  json: (data: Record<string, unknown>, statusCode?: number) => void;
}

interface AppwriteContext {
  req: AppwriteRequest;
  res: AppwriteResponse;
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

interface FreeModel {
  id: string;
  name: string;
  provider: string;
  contextLength: string;
}

const FREE_OPENROUTER_MODELS: FreeModel[] = [
    { id: 'meta-llama/llama-3.2-3b-instruct', name: 'Meta: Llama 3.2 3B Instruct', provider: 'meta-llama', contextLength: '20K' },
    { id: 'meta-llama/llama-3.2-1b-instruct', name: 'Meta: Llama 3.2 1B Instruct', provider: 'meta-llama', contextLength: '131K' },
    { id: 'meta-llama/llama-3.2-11b-vision-instruct', name: 'Meta: Llama 3.2 11B Vision Instruct', provider: 'meta-llama', contextLength: '131K' },
    { id: 'qwen/qwen2.5-72b-instruct', name: 'Qwen2.5 72B Instruct', provider: 'qwen', contextLength: '33K' },
    { id: 'qwen/qwen2.5-vl-7b-instruct', name: 'Qwen: Qwen2.5-VL 7B Instruct', provider: 'qwen', contextLength: '33K' },
    { id: 'meta-llama/llama-3.1-405b', name: 'Meta: Llama 3.1 405B (base)', provider: 'meta-llama', contextLength: '64K' },
    { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Meta: Llama 3.1 8B Instruct', provider: 'meta-llama', contextLength: '131K' },
    { id: 'mistralai/mistral-nemo', name: 'Mistral: Mistral Nemo', provider: 'mistralai', contextLength: '131K' },
    { id: 'google/gemma-2-9b', name: 'Google: Gemma 2 9B', provider: 'google', contextLength: '8K' },
    { id: 'mistralai/mistral-7b-instruct', name: 'Mistral: Mistral 7B Instruct', provider: 'mistralai', contextLength: '33K' },
];

export default async function (context: AppwriteContext): Promise<void> {
  try {
    context.log('Fetching free models list...');
    
    context.res.json({
      success: true,
      models: FREE_OPENROUTER_MODELS,
    });
  } catch (error) {
    context.error('Failed to fetch free models:', error);
    context.res.json({ success: false, error: 'Internal Server Error' }, 500);
  }
} 
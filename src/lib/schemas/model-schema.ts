import { z } from "zod";

export const OnlineModelCategorySchema = z.enum([
  "reasoning",
  "multimodal",
  "efficient",
  "general",
  "instruction",
]);

export type OnlineModelCategory = z.infer<typeof OnlineModelCategorySchema>;

const OpenRouterModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  provider: z.string(),
  category: OnlineModelCategorySchema,
  isFree: z.boolean(),
  contextLength: z.number(),
  pricing: z.object({
    prompt: z.string(),
    completion: z.string(),
  }),
});

export type OpenRouterModel = z.infer<typeof OpenRouterModelSchema>;

export const OpenRouterApiModelSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    context_length: z.number().nullish(),
    pricing: z
      .object({
        prompt: z.string(),
        completion: z.string(),
      })
      .passthrough(),
  })
  .passthrough();

export const OpenRouterModelsResponseSchema = z
  .object({
    data: z.array(z.unknown()),
  })
  .passthrough();

const LocalModelCategorySchema = z.enum([
  "light",
  "medium",
  "large",
  "heavy",
  "extreme",
]);

const LocalModelTypeSchema = z.enum(["LLM", "VLM", "embedding"]);

const LocalModelInfoSchema = z.object({
  id: z.string(),
  name: z.string(),
  size: z.string(),
  description: z.string(),
  ramRequirement: z.string(),
  downloadSize: z.string().optional(),
  performance: z.string(),
  category: LocalModelCategorySchema,
  modelType: LocalModelTypeSchema,
  supportsImages: z.boolean().optional(),
  supportsFunctions: z.boolean().optional(),
  specialization: z.string().optional(),
  warning: z.string().optional(),
  vramRequired: z.number().optional(),
});

export type LocalModelInfo = z.infer<typeof LocalModelInfoSchema>;

const LocalUnifiedModelSchema = z.object({
  type: z.literal("local"),
  localModel: LocalModelInfoSchema,
});

const OnlineUnifiedModelSchema = z.object({
  type: z.literal("online"),
  onlineModel: OpenRouterModelSchema,
});

export const UnifiedModelSchema = z.discriminatedUnion("type", [
  LocalUnifiedModelSchema,
  OnlineUnifiedModelSchema,
]);


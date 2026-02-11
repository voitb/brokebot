import { z } from "zod";

const ModelTypeSchema = z.enum(["local", "online"]);

const OnlineModelCategorySchema = z.enum([
  "reasoning",
  "multimodal",
  "efficient",
  "general",
  "instruction",
]);

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
  downloadSize: z.string(),
  performance: z.string(),
  category: LocalModelCategorySchema,
  modelType: LocalModelTypeSchema,
  supportsImages: z.boolean().optional(),
  supportsFunctions: z.boolean().optional(),
  specialization: z.string().optional(),
  warning: z.string().optional(),
  vramRequired: z.number().optional(),
});

export const UnifiedModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: ModelTypeSchema,
  description: z.string(),
  localModel: LocalModelInfoSchema.optional(),
  onlineModel: OpenRouterModelSchema.optional(),
});

export type ValidatedUnifiedModel = z.infer<typeof UnifiedModelSchema>;

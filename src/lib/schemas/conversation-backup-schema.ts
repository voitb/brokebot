import { z } from "zod";
import type { Conversation, Document, Folder } from "@/lib/db";
import { ConversationSchema } from "./conversation-schema";

const FolderSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

const DocumentSchema = z.object({
  id: z.number().optional(),
  filename: z.string(),
  content: z.string(),
  createdAt: z.coerce.date(),
  fileType: z.enum(["txt", "md", "pdf"]),
});

export const ConversationBackupSchema = z.object({
  conversations: z.array(ConversationSchema),
  folders: z.array(FolderSchema).default([]),
  documents: z.array(DocumentSchema).default([]),
});

export interface ConversationBackup {
  conversations: Conversation[];
  folders: Folder[];
  documents: Document[];
}

export type ConversationBackupParseResult =
  | { success: true; backup: ConversationBackup }
  | { success: false; error: z.ZodError };

export function parseConversationBackup(
  json: unknown
): ConversationBackupParseResult {
  const backup = ConversationBackupSchema.safeParse(json);
  if (backup.success) {
    return { success: true, backup: backup.data };
  }

  const legacyList = z.array(ConversationSchema).safeParse(json);
  if (legacyList.success) {
    return {
      success: true,
      backup: { conversations: legacyList.data, folders: [], documents: [] },
    };
  }

  const legacySingle = ConversationSchema.safeParse(json);
  if (legacySingle.success) {
    return {
      success: true,
      backup: { conversations: [legacySingle.data], folders: [], documents: [] },
    };
  }

  if (Array.isArray(json)) {
    return { success: false, error: legacyList.error };
  }

  if (typeof json === "object" && json !== null && "conversations" in json) {
    return { success: false, error: backup.error };
  }

  return { success: false, error: legacySingle.error };
}

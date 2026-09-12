import { describe, it, expect } from "vitest";
import {
  parseConversationBackup,
  type ConversationBackupParseResult,
} from "./conversation-backup-schema";
import {
  createMockConversation,
  createMockDocument,
  createMockFolder,
  createMockMessage,
} from "@/testing/mocks/factories";

function asJson(value: object): Record<string, unknown> {
  return JSON.parse(JSON.stringify(value));
}

function firstIssuePath(result: ConversationBackupParseResult) {
  return result.success ? undefined : result.error.issues[0]?.path;
}

describe("parseConversationBackup", () => {
  it("accepts an exported backup envelope", () => {
    const conversation = createMockConversation({ id: "conv-1" });

    const result = parseConversationBackup({
      conversations: [asJson(conversation)],
      folders: [],
      documents: [],
    });

    expect(result).toEqual({
      success: true,
      backup: { conversations: [conversation], folders: [], documents: [] },
    });
  });

  it("keeps the folders and documents an envelope carries", () => {
    const conversation = createMockConversation({ id: "conv-1", folderId: "folder-1" });
    const folder = createMockFolder({ id: "folder-1", name: "Work" });
    const document = { ...createMockDocument({ filename: "notes.txt" }), id: 7 };

    const result = parseConversationBackup({
      conversations: [asJson(conversation)],
      folders: [asJson(folder)],
      documents: [asJson(document)],
    });

    expect(result).toEqual({
      success: true,
      backup: { conversations: [conversation], folders: [folder], documents: [document] },
    });
  });

  it("treats an envelope without folders or documents as empty ones", () => {
    const conversation = createMockConversation({ id: "conv-1" });

    const result = parseConversationBackup({ conversations: [asJson(conversation)] });

    expect(result).toEqual({
      success: true,
      backup: { conversations: [conversation], folders: [], documents: [] },
    });
  });

  it("reports the offending folder when an envelope carries a broken one", () => {
    const result = parseConversationBackup({
      conversations: [],
      folders: [{ ...asJson(createMockFolder()), name: 42 }],
      documents: [],
    });

    expect(firstIssuePath(result)).toEqual(["folders", 0, "name"]);
  });

  it("accepts a legacy backup that is a bare conversation array", () => {
    const conversation = createMockConversation({ id: "conv-1" });

    const result = parseConversationBackup([asJson(conversation)]);

    expect(result).toEqual({
      success: true,
      backup: { conversations: [conversation], folders: [], documents: [] },
    });
  });

  it("accepts a legacy backup that is a single conversation", () => {
    const conversation = createMockConversation({ id: "conv-1" });

    const result = parseConversationBackup(asJson(conversation));

    expect(result).toEqual({
      success: true,
      backup: { conversations: [conversation], folders: [], documents: [] },
    });
  });

  it("reports the offending message when an envelope is invalid", () => {
    const conversation = {
      ...asJson(createMockConversation()),
      messages: [{ ...asJson(createMockMessage()), createdAt: "nope" }],
    };

    const result = parseConversationBackup({
      conversations: [conversation],
      folders: [],
      documents: [],
    });

    expect(firstIssuePath(result)).toEqual([
      "conversations",
      0,
      "messages",
      0,
      "createdAt",
    ]);
  });

  it("reports the offending item when a legacy array is invalid", () => {
    const result = parseConversationBackup([
      { ...asJson(createMockConversation()), title: 42 },
    ]);

    expect(firstIssuePath(result)).toEqual([0, "title"]);
  });

  it("reports the conversation shape when the file is neither an envelope nor a list", () => {
    const result = parseConversationBackup({ title: "No id here" });

    expect(firstIssuePath(result)).toEqual(["id"]);
  });
});

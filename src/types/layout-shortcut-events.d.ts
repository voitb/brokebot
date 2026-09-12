declare global {
  interface DocumentEventMap {
    "app:focus-search": CustomEvent<undefined>;
    "conversation:delete": CustomEvent<{ conversationId: string }>;
    "conversation:rename": CustomEvent<undefined>;
  }
}

export {};

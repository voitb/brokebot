// src/hooks/useConversations.ts
import { useLiveQuery } from "dexie-react-hooks";
import { db, type IConversation, type IMessage } from "../lib/db";
import { v4 as uuidv4 } from "uuid";

export function useConversations() {
  const conversations = useLiveQuery(
    () =>
      db.conversations.orderBy("updatedAt").reverse().sortBy("pinned"),
    [],
    [] 
  );

  const createConversation = async (
    title: string,
    firstMessageContent: string
  ): Promise<string | null> => {
    try {
      const newConversation: IConversation = {
        id: uuidv4(),
        title,
        messages: [
          {
            id: uuidv4(),
            role: "user",
            content: firstMessageContent,
            createdAt: new Date(),
          },
        ],
        pinned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.conversations.add(newConversation);
      return newConversation.id;
    } catch (error) {
      console.error("Błąd przy tworzeniu rozmowy:", error);
      return null;
    }
  };

  const createEmptyConversation = async (title: string = "New Conversation"): Promise<string | null> => {
    try {
      const newConversation: IConversation = {
        id: uuidv4(),
        title,
        messages: [], // Pusta tablica wiadomości
        pinned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await db.conversations.add(newConversation);
      return newConversation.id;
    } catch (error) {
      console.error("Błąd przy tworzeniu pustej rozmowy:", error);
      return null;
    }
  };

  const addMessage = async (
    conversationId: string,
    message: Omit<IMessage, "id" | "createdAt">
  ) => {
    try {
      const newMessage: IMessage = {
        ...message,
        id: uuidv4(),
        createdAt: new Date(),
      };
      await db.conversations.where("id").equals(conversationId).modify(convo => {
        convo.messages.push(newMessage);
        convo.updatedAt = new Date(); 
      });
    } catch (error) {
      console.error("Błąd przy dodawaniu wiadomości:", error);
    }
  };

  // 4. Usuwanie rozmowy (DELETE)
  const deleteConversation = async (id: string) => {
    try {
      await db.conversations.delete(id);
    } catch (error) {
      console.error("Błąd przy usuwaniu rozmowy:", error);
    }
  };

  // 5. Przypinanie/Odepinanie rozmowy (UPDATE)
  const togglePinConversation = async (id: string) => {
    try {
      await db.conversations.where("id").equals(id).modify(convo => {
        convo.pinned = !convo.pinned;
        convo.updatedAt = new Date();
      });
    } catch (error) {
      console.error("Błąd przy przypinaniu rozmowy:", error);
    }
  };

  // 6. Aktualizacja tytułu rozmowy (UPDATE) - bez zmiany updatedAt
  const updateConversationTitle = async (id: string, newTitle: string) => {
    try {
      await db.conversations.where("id").equals(id).modify(convo => {
        convo.title = newTitle;
        // Nie zmieniamy updatedAt - chat zostaje w tym samym miejscu na liście
      });
    } catch (error) {
      console.error("Błąd przy aktualizacji tytułu rozmowy:", error);
    }
  };

  return {
    conversations,
    createConversation,
    createEmptyConversation,
    addMessage,
    deleteConversation,
    togglePinConversation,
    updateConversationTitle,
  };
}

// Hook do pobierania konkretnej rozmowy
export function useConversation(conversationId: string | undefined) {
  const conversation = useLiveQuery(
    () => conversationId ? db.conversations.get(conversationId) : undefined,
    [conversationId]
  );

  return {
    conversation,
    messages: conversation?.messages || [],
  };
}
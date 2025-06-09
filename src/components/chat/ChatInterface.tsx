import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";

export function ChatInterface() {
  return (
    <>
      <ChatHeader />
      <ChatMessages />
      <ChatInput />
    </>
  );
}

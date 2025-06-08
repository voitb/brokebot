import type { Message } from "../../types";
import { ScrollArea } from "../ui/scroll-area";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface ChatMessagesProps {
  messages: Message[];
  isLoading?: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} group`}>
      {/* Avatar dla AI */}
      {!isUser && (
        <Avatar className="w-8 h-8 mr-3 mt-1">
          <AvatarImage src="" />
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
            🤖
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`max-w-xl ${isUser ? "ml-auto" : ""}`}>
        {/* Message Content */}
        <div
          className={`p-3 rounded-lg ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        </div>

        {/* Timestamp */}
        <div
          className={`mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
            isUser ? "text-right" : "text-left"
          }`}
        >
          <Badge variant="outline" className="text-xs">
            {message.createdAt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Badge>
        </div>
      </div>

      {/* Avatar dla User */}
      {isUser && (
        <Avatar className="w-8 h-8 ml-3 mt-1">
          <AvatarImage src="" />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            💸
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

function LoadingIndicator() {
  return (
    <div className="flex justify-start">
      <Avatar className="w-8 h-8 mr-3 mt-1">
        <AvatarImage src="" />
        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
          🤖
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted p-3 rounded-lg">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-200"></div>
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-400"></div>
        </div>
      </div>
    </div>
  );
}

export function ChatMessages({
  messages,
  isLoading = false,
}: ChatMessagesProps) {
  return (
    <div className="flex-1 flex flex-col">
      <ScrollArea className="flex-1">
        <div className="p-6 space-y-6">
          {messages.length === 0 && !isLoading && (
            <div className="text-center text-muted-foreground py-12">
              <div className="text-4xl mb-4">💸</div>
              <h3 className="text-lg font-semibold mb-2">
                Welcome to BrokeBot!
              </h3>
              <p className="text-sm">
                Start a conversation with your free AI assistant.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {isLoading && <LoadingIndicator />}
        </div>
      </ScrollArea>
    </div>
  );
}

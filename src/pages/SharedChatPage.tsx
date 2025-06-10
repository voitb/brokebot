import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { SharedChatLayout } from "../components/chat/shared/SharedChatLayout";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import type { IConversation, IMessage } from "../lib/db";

interface SharedChatData {
  conversation: IConversation;
  messages: IMessage[];
  shareId: string;
  viewCount: number;
  isPublic: boolean;
  sharedBy: string;
  sharedAt: Date;
}

/**
 * Page for viewing shared chat conversations
 * URL: /share/:shareId
 */
export const SharedChatPage: React.FC = () => {
  const { shareId } = useParams<{ shareId: string }>();
  const [data, setData] = useState<SharedChatData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedChat = async () => {
      if (!shareId) {
        setError("Invalid share ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Simulate API call to fetch shared chat data
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Mock data - in real app this would come from API
        const mockData: SharedChatData = {
          conversation: {
            id: shareId,
            title: "Chat about React Development",
            createdAt: new Date(Date.now() - 86400000), // 1 day ago
            updatedAt: new Date(Date.now() - 3600000), // 1 hour ago
            pinned: false,
            messages: [], // Will be populated separately
          },
          messages: [
            {
              id: "1",
              conversationId: shareId,
              role: "user",
              content: "How do I create a reusable component in React?",
              createdAt: new Date(Date.now() - 86400000 + 1000),
            },
            {
              id: "2", 
              conversationId: shareId,
              role: "assistant",
              content: "To create a reusable component in React, you should:\n\n1. **Define clear props interface**\n```typescript\ninterface ButtonProps {\n  variant?: 'primary' | 'secondary';\n  size?: 'sm' | 'md' | 'lg';\n  onClick?: () => void;\n  children: React.ReactNode;\n}\n```\n\n2. **Use TypeScript for type safety**\n```tsx\nconst Button: React.FC<ButtonProps> = ({ \n  variant = 'primary',\n  size = 'md',\n  onClick,\n  children \n}) => {\n  return (\n    <button \n      className={`btn btn-${variant} btn-${size}`}\n      onClick={onClick}\n    >\n      {children}\n    </button>\n  );\n};\n```\n\n3. **Make it flexible and composable**\n4. **Add proper default values**\n5. **Export for reuse across your app**",
              createdAt: new Date(Date.now() - 86400000 + 5000),
            },
            {
              id: "3",
              conversationId: shareId,
              role: "user", 
              content: "That's great! How about handling state in reusable components?",
              createdAt: new Date(Date.now() - 86400000 + 30000),
            },
            {
              id: "4",
              conversationId: shareId,
              role: "assistant",
              content: "For state management in reusable components, consider these patterns:\n\n## 1. **Controlled vs Uncontrolled**\n\n**Controlled** (parent manages state):\n```tsx\nconst SearchInput = ({ value, onChange }) => (\n  <input value={value} onChange={onChange} />\n);\n\n// Usage\nconst [search, setSearch] = useState('');\n<SearchInput value={search} onChange={setSearch} />\n```\n\n**Uncontrolled** (component manages own state):\n```tsx\nconst SearchInput = ({ onSearch }) => {\n  const [value, setValue] = useState('');\n  \n  return (\n    <input \n      value={value} \n      onChange={(e) => {\n        setValue(e.target.value);\n        onSearch?.(e.target.value);\n      }} \n    />\n  );\n};\n```\n\n## 2. **Custom Hooks for Complex Logic**\n```tsx\nconst useToggle = (initial = false) => {\n  const [state, setState] = useState(initial);\n  const toggle = () => setState(prev => !prev);\n  return [state, toggle] as const;\n};\n```\n\nChoose controlled for forms, uncontrolled for simple interactions!",
              createdAt: new Date(Date.now() - 86400000 + 45000),
            }
          ],
          shareId,
          viewCount: Math.floor(Math.random() * 100) + 10,
          isPublic: Math.random() > 0.5,
          sharedBy: "ReactDev_2024",
          sharedAt: new Date(Date.now() - 3600000),
        };

        // Increment view count
        mockData.viewCount += 1;

        setData(mockData);
      } catch (err) {
        console.error("Failed to fetch shared chat:", err);
        setError("Failed to load shared conversation. The link may be invalid or expired.");
      } finally {
        setLoading(false);
      }
    };

    fetchSharedChat();
  }, [shareId]);

  // Invalid share ID
  if (!shareId) {
    return <Navigate to="/" replace />;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <div>
            <h2 className="text-xl font-semibold mb-2">Loading shared conversation</h2>
            <p className="text-muted-foreground">Please wait while we fetch the chat...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <Alert className="border-destructive/20 bg-destructive/5">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">
              <div className="space-y-2">
                <p className="font-medium">Unable to load conversation</p>
                <p className="text-sm">{error}</p>
              </div>
            </AlertDescription>
          </Alert>
          
          <div className="text-center mt-6">
            <button 
              onClick={() => window.location.reload()}
              className="text-primary hover:underline"
            >
              Try again
            </button>
            <span className="mx-2 text-muted-foreground">or</span>
            <a 
              href="/"
              className="text-primary hover:underline"
            >
              Go to Local-GPT
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Render shared chat
  return (
    <SharedChatLayout
      conversation={data.conversation}
      messages={data.messages}
      shareId={data.shareId}
      viewCount={data.viewCount}
      isPublic={data.isPublic}
      sharedBy={data.sharedBy}
      sharedAt={data.sharedAt}
    />
  );
}; 
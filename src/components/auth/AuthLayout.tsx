import React from "react";
import { ScrollArea } from "../ui/scroll-area";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <ScrollArea className="h-screen">
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </ScrollArea>
  );
}; 
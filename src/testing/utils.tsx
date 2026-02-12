import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/app/providers/theme-provider';
import { ConversationsProvider } from '@/app/providers/conversations-provider';
import { TooltipProvider } from '@/components/ui/tooltip';

interface WrapperProps {
  children: React.ReactNode;
}

function AllTheProviders({ children }: WrapperProps) {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

function WithConversations({ children }: WrapperProps) {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <TooltipProvider>
          <ConversationsProvider>
            {children}
          </ConversationsProvider>
        </TooltipProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

const renderWithConversations = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: WithConversations, ...options });

export * from '@testing-library/react';
export { customRender as render, renderWithConversations, WithConversations };

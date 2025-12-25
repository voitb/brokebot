import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../providers/ThemeProvider';
import { ConversationsProvider } from '../providers/ConversationsProvider';

interface WrapperProps {
  children: React.ReactNode;
}

function AllTheProviders({ children }: WrapperProps) {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="brokebot-theme">
        {children}
      </ThemeProvider>
    </BrowserRouter>
  );
}

function WithConversations({ children }: WrapperProps) {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="brokebot-theme">
        <ConversationsProvider>
          {children}
        </ConversationsProvider>
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

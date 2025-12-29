# Architecture Guide

This document describes the project structure and conventions for the brokebot codebase.

## Directory Structure

```
src/
├── app/                    # Application shell, providers, router, modals
│   ├── modals/            # Global modal registry (URL-based)
│   ├── providers/         # React context providers
│   ├── app.tsx            # Root app component
│   ├── main.tsx           # Entry point
│   └── router.tsx         # React Router configuration
│
├── components/ui/          # Generic UI primitives (shadcn/ui)
│
├── features/               # Self-contained feature modules
│   ├── chat/              # Chat feature
│   │   ├── components/    # UI components
│   │   ├── hooks/         # Feature-specific hooks
│   │   ├── utils/         # Feature utilities
│   │   ├── lib/           # Feature services (openrouter, webllm, transcriber)
│   │   └── constants/     # Feature constants
│   ├── settings/          # Settings feature
│   ├── documents/         # Documents feature
│   ├── layout/            # Layout feature
│   ├── onboarding/        # Onboarding feature
│   └── welcome/           # Welcome screen feature
│
├── shared/                 # Cross-feature reusable code
│   ├── hooks/             # Shared hooks (used by 2+ features)
│   └── components/        # Shared components
│
├── lib/                    # True infrastructure (used by all features)
│   ├── db.ts              # Dexie IndexedDB database
│   ├── cn.ts              # Tailwind class merging utility
│   └── encryption-service.ts # Data encryption
│
├── types/                  # Global TypeScript types
├── constants/              # Global constants
├── pages/                  # Page components
└── test/                   # Test utilities and mocks
```

## Import Rules (Unidirectional Flow)

```
lib → shared → features → app
```

### Allowed Imports

| From | Can Import |
|------|------------|
| `lib/` | Nothing (pure infrastructure) |
| `shared/` | `lib/`, `components/ui/` |
| `features/*` | `lib/`, `shared/`, `components/ui/`, other features |
| `app/` | Everything |

### Forbidden Imports

- `shared/` must NEVER import from `features/`
- `lib/` must NEVER import from `features/` or `shared/`

## Decision Tree: Where Does Code Go?

```
Is it used by 2+ features?
├── YES → Is it a hook? → shared/hooks/
│        Is it a component? → shared/components/
│        Is it infrastructure (db, encryption)? → lib/
└── NO → Put in the feature that uses it
         └── features/{feature-name}/
             ├── components/  (UI)
             ├── hooks/       (React hooks)
             ├── utils/       (Pure functions)
             ├── lib/         (Services, API clients)
             └── constants/   (Constants)
```

## Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Component files | kebab-case | `chat-header.tsx` |
| Component exports | PascalCase | `export const ChatHeader` |
| Hook files | kebab-case with use- prefix | `use-chat-input.ts` |
| Hook exports | camelCase with use prefix | `export function useChatInput()` |
| Utility files | kebab-case | `chat-error-utils.ts` |
| Test files | Co-located with `.test.ts` suffix | `use-chat-input.test.ts` |
| Constants | UPPER_SNAKE_CASE | `const MAX_FILE_SIZE = 10` |
| Interfaces/Types | PascalCase | `interface UserConfig` |

## Component Organization

Components use nested `components/` subdirectories for sub-components:

```
features/chat/components/
├── header/
│   ├── chat-header.tsx
│   └── components/
│       ├── action-buttons.tsx
│       └── new-chat-button.tsx
├── messages/
│   ├── chat-messages.tsx
│   └── components/
│       └── message-bubble.tsx
└── ...
```

## Hook Patterns

All hooks follow this structure:

```typescript
// Return type interface
export interface UseHookNameReturn {
  // properties and methods
}

// Props interface (if needed)
export interface UseHookNameProps {
  // parameters
}

// Hook implementation
export function useHookName(props?: UseHookNameProps): UseHookNameReturn {
  // implementation
}
```

## State Management

- **Context API** with providers in `/app/providers/`
- **Dexie** for IndexedDB persistence
- No Redux/Zustand - Context API is sufficient for this app size

### Providers

| Provider | Purpose |
|----------|---------|
| `ConversationsProvider` | Conversation/folder management |
| `ModelProvider` | Unified model selection (local/online) |
| `ThemeProvider` | Theme management |
| `WebLLMProvider` | Local model engine |

### Automatic Memoization (React Compiler)

This project uses **React Compiler** (`babel-plugin-react-compiler`) which automatically memoizes:
- Context provider values
- Component props
- Function references
- Computed values

**Source:** [React Compiler docs](https://react.dev/learn/react-compiler)

No manual `useMemo`/`useCallback` is needed unless you require precise control over memoization.

## Modal System

Modals use a URL-based registry pattern for deep linking:

- Open settings: `?modal=settings`
- Open settings tab: `?modal=settings&tab=privacy`
- Open shortcuts: `?modal=shortcuts`

Registry location: `src/app/modals/modal-registry.ts`

## Testing

- **Framework**: Vitest + React Testing Library
- **Location**: Co-located with source files (`.test.ts` / `.test.tsx`)
- **Utilities**: `src/test/` (setup, mocks, factories)

## No Barrel Files

This project intentionally does NOT use barrel files (`index.ts`). All imports are direct:

```typescript
// Correct - direct import
import { ChatHeader } from "@/features/chat/components/header/chat-header";

// Incorrect - no barrel files
import { ChatHeader } from "@/features/chat/components/header";
```

Benefits:
- Better tree-shaking
- Faster builds
- No circular dependency risks
- Clearer import paths

## Path Aliases

Use `@/*` for absolute imports from `src/`:

```typescript
import { Button } from "@/components/ui/button";
import { useChatInput } from "@/features/chat/hooks/use-chat-input";
import { db } from "@/lib/db";
```

# Brokebot Refactoring Plan: Bulletproof React Architecture

## Reference
- [bulletproof-react](https://github.com/alan2207/bulletproof-react/tree/master/apps/react-vite)
- [project-structure docs](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md)

---

## Target Architecture

```
src/
├── app/                          # Application layer
│   ├── index.tsx                 # NEW - <AppProvider> + <AppRouter>
│   ├── main.tsx                  # Simplified - just renders <App />
│   ├── provider.tsx              # NEW - composes all providers
│   ├── router.tsx                # Updated imports
│   ├── providers/                # KEPT - individual provider files
│   │   ├── theme-provider.tsx
│   │   ├── web-llm-provider.tsx
│   │   ├── model-provider.tsx
│   │   └── conversations-provider.tsx
│   ├── routes/                   # RENAMED from pages/
│   │   ├── landing.tsx           # was pages/welcome.tsx
│   │   └── terms.tsx            # was pages/terms-of-service.tsx
│   └── modals/                   # KEPT as-is
│       ├── modal-registry.ts
│       └── modal-root.tsx
│
├── components/                   # Shared components
│   ├── errors/                   # NEW directory
│   │   └── error-boundary.tsx    # MOVED from components/error-boundary.tsx
│   ├── layouts/                  # NEW - MOVED from features/layout/
│   │   ├── chat-layout.tsx
│   │   ├── chat-sidebar.tsx
│   │   ├── responsive-chat-layout/
│   │   │   ├── responsive-chat-layout.tsx
│   │   │   ├── use-layout-shortcuts.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── seo/                      # KEPT as-is
│   └── ui/                       # KEPT as-is
│
├── config/                       # KEPT as-is
├── hooks/                        # Shared hooks
│   ├── use-keyboard-shortcuts.ts # MOVED from features/layout/hooks/
│   └── ... (rest kept)
│
├── features/                     # Domain features
│   ├── chat/                     # CLEANED UP
│   │   ├── api/                  # RENAMED from lib/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── constants/
│   │   └── index.ts              # MINIMIZED to public API only
│   ├── documents/                # KEPT
│   ├── onboarding/               # KEPT
│   └── settings/                 # KEPT
│   (layout/ REMOVED - moved to components/layouts/)
│   (welcome/ REMOVED - inlined into app/routes/landing.tsx)
│
├── lib/                          # KEPT as-is
├── testing/                      # KEPT as-is
└── types/                        # KEPT as-is
```

---

## Current Dependency Violations (Cross-Feature Imports)

These exist today and must be resolved or accepted:

| From | To | Import | Resolution |
|------|----|--------|------------|
| `features/settings` | `features/chat` | `ApiKeySection` | Move shared component to components/ OR accept (settings configures chat) |
| `features/layout` | `features/chat` | `ConversationList` | Layout moves to components/ - this becomes components/ → features/ (acceptable) |
| `features/layout` | `features/onboarding` | `OnboardingDialog, useOnboarding` | Layout moves to components/ - keep as is |
| `features/settings` | `features/documents` | `DocumentManager` | Accept - settings manages documents tab |
| `features/chat` | `features/documents` | `useDocuments` | Accept - chat uses document upload |
| `app/providers` | `features/chat` | openrouter, webllm, useModels | Accept - providers compose features |

**Decision**: Cross-feature imports are acceptable when there's a clear parent-child or composition relationship. The key rule is: no circular dependencies.

---

## Exact File Operations

### Phase 1: App Layer

#### 1A. Create `src/app/provider.tsx`
```tsx
import { Suspense } from "react";
import { HelmetProvider } from "react-helmet-async";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/app/providers/theme-provider";
import { WebLLMProvider } from "@/app/providers/web-llm-provider";
import { ModelProvider } from "@/app/providers/model-provider";
import { ConversationsProvider } from "@/app/providers/conversations-provider";
import { RouteLoadingFallback } from "@/components/ui/route-loading-fallback";

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <HelmetProvider>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <TooltipProvider>
            <WebLLMProvider>
              <ModelProvider>
                <ConversationsProvider>
                  {children}
                </ConversationsProvider>
              </ModelProvider>
            </WebLLMProvider>
          </TooltipProvider>
        </ThemeProvider>
      </HelmetProvider>
    </Suspense>
  );
}
```

#### 1B. Create `src/app/index.tsx`
```tsx
import { RouterProvider } from "react-router-dom";
import { AppProvider } from "@/app/provider";
import { router } from "@/app/router";

export function App() {
  return (
    <AppProvider>
      <RouterProvider router={router} />
    </AppProvider>
  );
}
```

#### 1C. Simplify `src/app/main.tsx`
```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "@/app";
import "@/assets/styles/index.css";

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Failed to find the root element");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### 1D. Rename `src/app/app.tsx` → `src/app/root-layout.tsx`
This file is the root layout for React Router, not the "App". Rename to clarify purpose:
```tsx
// src/app/root-layout.tsx
import { Outlet } from "react-router-dom";
import { ResponsiveChatLayout } from "@/components/layouts";
// ... rest stays the same but import paths updated
```

#### 1E. Rename `src/app/pages/` → `src/app/routes/`
- `pages/welcome.tsx` → `routes/landing.tsx`
- `pages/terms-of-service.tsx` → `routes/terms.tsx`

#### 1F. Update `src/app/router.tsx`
- Import `RootLayout` from `@/app/root-layout` (was `App` from `@/app/app`)
- Import lazy routes from `@/app/routes/landing` and `@/app/routes/terms`

---

### Phase 2: Components Migration

#### 2A. Move `features/layout/` → `components/layouts/`
| Source | Destination |
|--------|------------|
| `features/layout/components/chat-layout.tsx` | `components/layouts/chat-layout.tsx` |
| `features/layout/components/chat-sidebar.tsx` | `components/layouts/chat-sidebar.tsx` |
| `features/layout/components/responsive-chat-layout/` | `components/layouts/responsive-chat-layout/` |
| `features/layout/index.ts` | `components/layouts/index.ts` |

#### 2B. Move layout hooks to shared hooks
| Source | Destination |
|--------|------------|
| `features/layout/hooks/use-keyboard-shortcuts.ts` | `hooks/use-keyboard-shortcuts.ts` |
| `features/layout/hooks/use-keyboard-shortcuts.test.tsx` | `hooks/use-keyboard-shortcuts.test.tsx` |

#### 2C. Move error boundary
| Source | Destination |
|--------|------------|
| `components/error-boundary.tsx` | `components/errors/error-boundary.tsx` |
| `components/error-boundary.test.tsx` | `components/errors/error-boundary.test.tsx` |

#### 2D. Delete `features/layout/` entirely

---

### Phase 3: Features Cleanup

#### 3A. Delete `features/welcome/`
Inline welcome sub-components into `app/routes/landing.tsx` or keep as local components within that route file. The components (WelcomeHeader, FeatureGrid, GettingStarted, PrivacyNotice) are only used in one place.

**Option A** (simpler): Move welcome components to `app/routes/welcome/` as a route module:
```
app/routes/
├── landing/
│   ├── landing.tsx           # Main route component
│   ├── welcome-header.tsx    # Sub-component
│   ├── feature-grid.tsx
│   ├── getting-started.tsx
│   ├── privacy-notice.tsx
│   └── index.ts              # exports LandingRoute
└── terms.tsx
```

**Option B** (minimal): Just move files directly and update imports.

**Recommended: Option A** - keeps route self-contained.

#### 3B. Rename `features/chat/lib/` → `features/chat/api/`
All files inside stay the same, just the directory name changes.
Update all internal imports within `features/chat/`.

#### 3C. Minimize barrel files

**`features/chat/index.ts`** - reduce from 100+ exports to actual public API:
```ts
// Only exports consumed OUTSIDE of features/chat/
export { ChatInterface } from "./components/interface/chat-interface";
export { ChatGuard } from "./components/interface/chat-guard";
export { ChatHeader } from "./components/header/chat-header";
export { ConversationList } from "./components/sidebar/conversation-list";
export { KeyboardShortcutsDialog } from "./components/modals/keyboard-shortcuts-dialog";
export { ApiKeySection } from "./components/online-model-dialog/api-key-section";
```

All other imports should be direct:
```ts
// BEFORE (barrel)
import { useChatInput, truncateTitle } from "@/features/chat";

// AFTER (direct)
import { useChatInput } from "@/features/chat/hooks/use-chat-input";
import { truncateTitle } from "@/features/chat/utils/chat-input-utils";
```

Same for `features/chat/hooks/index.ts`, `features/chat/utils/index.ts`, `features/chat/lib/index.ts` - minimize or remove.

---

### Phase 4: Import Updates

Every moved file requires import updates. Full list of affected imports:

#### `@/features/layout` → `@/components/layouts`
| File | Old Import | New Import |
|------|-----------|------------|
| `src/app/app.tsx` (now root-layout.tsx) | `@/features/layout` | `@/components/layouts` |

#### `@/features/welcome` → `@/app/routes/landing/*` or inline
| File | Old Import | New Import |
|------|-----------|------------|
| `src/app/pages/welcome.tsx` (now routes/landing.tsx) | `@/features/welcome` | Local imports (same directory) |

#### `@/components/error-boundary` → `@/components/errors/error-boundary`
| File | Old Import | New Import |
|------|-----------|------------|
| `src/app/app.tsx` (root-layout.tsx) | `@/components/error-boundary` | `@/components/errors/error-boundary` |
| `src/features/settings/components/settings-dialog/settings-dialog.tsx` | same | same |
| `src/features/chat/components/interface/chat-interface.tsx` | same | same |

#### Internal layout imports
| File | Old Import | New Import |
|------|-----------|------------|
| `responsive-chat-layout/use-layout-shortcuts.ts` | `@/features/layout/hooks/use-keyboard-shortcuts` | `@/hooks/use-keyboard-shortcuts` |

---

### Phase 5: Validation

1. `pnpm tsc --noEmit` - zero type errors
2. `pnpm lint` - zero lint errors
3. `pnpm test:run` - all tests pass
4. `pnpm build` - production build succeeds

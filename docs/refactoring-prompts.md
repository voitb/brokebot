# Refactoring Team Prompts

## How to Execute

Run these prompts as a Claude Code team. The work is organized into **5 phases** with task dependencies.

### Team Setup
```
Team name: "bulletproof-refactor"
```

### Task Dependency Graph
```
Phase 1: [Agent-AppLayer] + [Agent-Components] + [Agent-Features]  (parallel)
Phase 2: [Agent-Imports]                                            (after Phase 1)
Phase 3: [Agent-Validator]                                          (after Phase 2)
```

---

## Agent Prompts

### Agent 1: App Layer Restructuring

**Name**: `app-layer`
**Type**: `general-purpose`
**Mode**: `bypassPermissions`

```
You are restructuring the app/ layer of a React project to follow bulletproof-react patterns.
Read docs/refactoring-plan.md first for the full plan.

Your tasks (do them in order):

## Task 1: Create src/app/provider.tsx

Create a new file that composes ALL providers into one component.
Read all 4 files in src/app/providers/ to understand their interfaces first.
Then read src/app/main.tsx to see current provider nesting.

The file should:
- Import all providers from @/app/providers/
- Import Suspense from react
- Import HelmetProvider from react-helmet-async
- Import TooltipProvider from @/components/ui/tooltip
- Import RouteLoadingFallback from @/components/ui/route-loading-fallback
- Export function AppProvider that wraps children in the same nesting order as current main.tsx
- Wrap everything in a Suspense boundary with RouteLoadingFallback as fallback

## Task 2: Create src/app/index.tsx

Create the app entry point:
- Import AppProvider from @/app/provider
- Import RouterProvider from react-router-dom
- Import router from @/app/router
- Export function App that renders <AppProvider><RouterProvider router={router} /></AppProvider>

## Task 3: Simplify src/app/main.tsx

Read the current main.tsx. Replace all the provider nesting with:
- Import App from @/app (the new index.tsx)
- Import styles
- Render <React.StrictMode><App /></React.StrictMode>
- Remove all individual provider imports

## Task 4: Rename src/app/app.tsx → src/app/root-layout.tsx

Read src/app/app.tsx. This is actually a root layout component (wraps Outlet), not the App.
- Create src/app/root-layout.tsx with the same content as app.tsx but:
  - Rename the function from `App` to `RootLayout`
  - Export as `RootLayout` (named export)
  - Update the import of ResponsiveChatLayout - it will move to @/components/layouts but
    DON'T change that import yet (Agent-Imports will handle it)
- Delete src/app/app.tsx

## Task 5: Rename src/app/pages/ → src/app/routes/

- Read src/app/pages/welcome.tsx and src/app/pages/terms-of-service.tsx
- Create src/app/routes/ directory
- Move welcome.tsx → routes/landing.tsx (keep the same content, just rename the file)
- Move terms-of-service.tsx → routes/terms.tsx (keep the same content, just rename)
- Delete src/app/pages/ directory

## Task 6: Update src/app/router.tsx

Read the current router.tsx. Update it:
- Import RootLayout from @/app/root-layout (was: App from @/app/app)
- Update lazy import paths: @/app/routes/landing (was @/app/pages/welcome)
- Update lazy import paths: @/app/routes/terms (was @/app/pages/terms-of-service)
- Keep ChatGuard import as-is for now

CRITICAL RULES:
- Do NOT change any component logic or behavior
- Do NOT modify provider files in src/app/providers/ - they stay as individual files
- Do NOT update imports in files outside of src/app/ - Agent-Imports handles that
- Verify each file compiles: check TypeScript types are correct
- Read every file BEFORE modifying it
```

---

### Agent 2: Components Restructuring

**Name**: `components`
**Type**: `general-purpose`
**Mode**: `bypassPermissions`

```
You are moving layout components and error boundary to follow bulletproof-react patterns.
Read docs/refactoring-plan.md first for the full plan.

Your tasks (do them in order):

## Task 1: Create src/components/layouts/ directory

Move these files from features/layout/ to components/layouts/:

Read each file first, then create the new file at the new location.

1. features/layout/components/chat-layout.tsx → components/layouts/chat-layout.tsx
2. features/layout/components/chat-sidebar.tsx → components/layouts/chat-sidebar.tsx
3. features/layout/components/responsive-chat-layout/responsive-chat-layout.tsx → components/layouts/responsive-chat-layout/responsive-chat-layout.tsx
4. features/layout/components/responsive-chat-layout/use-layout-shortcuts.ts → components/layouts/responsive-chat-layout/use-layout-shortcuts.ts
5. features/layout/components/responsive-chat-layout/use-layout-shortcuts.test.ts → components/layouts/responsive-chat-layout/use-layout-shortcuts.test.ts
6. features/layout/components/responsive-chat-layout/index.ts → components/layouts/responsive-chat-layout/index.ts

IMPORTANT for use-layout-shortcuts.ts:
- It imports from "@/features/layout/hooks/use-keyboard-shortcuts"
- Change this import to "@/hooks/use-keyboard-shortcuts" (we'll move that hook to shared)

IMPORTANT for chat-sidebar.tsx:
- It imports from "@/features/chat/components/sidebar/conversation-list"
- Keep this import as-is (it's a valid components/ → features/ import in bulletproof-react)

IMPORTANT for responsive-chat-layout.tsx:
- It imports from "@/features/onboarding/hooks/use-onboarding" and "@/features/onboarding/components/onboarding-dialog"
- Keep these imports as-is

## Task 2: Move layout hooks to shared hooks

1. Read features/layout/hooks/use-keyboard-shortcuts.ts
2. Copy to src/hooks/use-keyboard-shortcuts.ts (same content)
3. Read features/layout/hooks/use-keyboard-shortcuts.test.tsx
4. Copy to src/hooks/use-keyboard-shortcuts.test.tsx (same content)

## Task 3: Create components/layouts/index.ts

Create a barrel file that exports what the old features/layout/index.ts exported:
- Read features/layout/index.ts first to see current exports
- Create components/layouts/index.ts with equivalent exports
- Adjust internal import paths (no more features/layout prefix)

## Task 4: Move error boundary

1. Read src/components/error-boundary.tsx
2. Create src/components/errors/ directory
3. Write src/components/errors/error-boundary.tsx (same content)
4. If src/components/error-boundary.test.tsx exists, move it too → src/components/errors/error-boundary.test.tsx

## Task 5: Delete old files

Delete the entire features/layout/ directory and the old components/error-boundary.tsx:
- rm -rf src/features/layout/
- rm src/components/error-boundary.tsx
- rm src/components/error-boundary.test.tsx (if it existed)

CRITICAL RULES:
- Do NOT change any component logic or behavior
- Do NOT update imports in files outside of the moved files - Agent-Imports handles that
- Read every file BEFORE modifying it
- Preserve test files alongside their source files
```

---

### Agent 3: Features Cleanup

**Name**: `features`
**Type**: `general-purpose`
**Mode**: `bypassPermissions`

```
You are cleaning up feature module structure to follow bulletproof-react patterns.
Read docs/refactoring-plan.md first for the full plan.

Your tasks (do them in order):

## Task 1: Move welcome feature into route

The welcome feature (features/welcome/) is only used in one place: app/pages/welcome.tsx (which Agent-AppLayer renamed to app/routes/landing.tsx).

1. Read all files in features/welcome/components/:
   - welcome-header.tsx
   - feature-grid.tsx
   - getting-started.tsx
   - privacy-notice.tsx

2. Read app/routes/landing.tsx (or app/pages/welcome.tsx if Agent-AppLayer hasn't run yet)

3. Create route module structure:
   - src/app/routes/landing/ (directory)
   - Move landing.tsx into this directory as the main route component
   - Move welcome sub-components into this directory:
     - features/welcome/components/welcome-header.tsx → app/routes/landing/welcome-header.tsx
     - features/welcome/components/feature-grid.tsx → app/routes/landing/feature-grid.tsx
     - features/welcome/components/getting-started.tsx → app/routes/landing/getting-started.tsx
     - features/welcome/components/privacy-notice.tsx → app/routes/landing/privacy-notice.tsx
   - Create app/routes/landing/index.ts that exports the main component

4. Update landing.tsx imports to use relative paths (./welcome-header, ./feature-grid, etc.)

5. Delete features/welcome/ entirely

## Task 2: Rename features/chat/lib/ → features/chat/api/

1. List all files in features/chat/lib/
2. Create features/chat/api/ directory
3. Copy each file from lib/ to api/ (same content):
   - lib/openrouter.ts → api/openrouter.ts
   - lib/openrouter.test.ts → api/openrouter.test.ts
   - lib/webllm.ts → api/webllm.ts
   - lib/webllm/worker.ts → api/webllm/worker.ts
   - lib/transcriber/transcribe.ts → api/transcriber/transcribe.ts
   - lib/transcriber/transcribe.test.ts → api/transcriber/transcribe.test.ts
   - lib/transcriber/types.ts → api/transcriber/types.ts
   - lib/transcriber/worker.ts → api/transcriber/worker.ts
   - lib/transcriber/transformers.d.ts → api/transcriber/transformers.d.ts
   - lib/index.ts → api/index.ts
4. Update api/index.ts to use relative paths (should already be relative, verify)
5. Delete features/chat/lib/ directory

## Task 3: Minimize barrel files

### features/chat/index.ts
Read the current file (100+ exports). Replace with ONLY exports consumed outside of features/chat/.
To determine this, grep the codebase for imports from "@/features/chat" that come from OUTSIDE features/chat/.

External consumers (from plan analysis):
- app/pages/welcome.tsx → ChatHeader
- app/router.tsx → ChatGuard (already direct import)
- app/modals/modal-registry.ts → KeyboardShortcutsDialog (already direct import)
- app/providers/model-provider.tsx → openrouter types (direct import)
- app/providers/web-llm-provider.tsx → webllm (direct import)
- features/settings/general-tab.tsx → ApiKeySection
- features/layout/chat-sidebar.tsx → ConversationList (direct import)
- types/models.ts → OpenRouterModel types (direct import)

New features/chat/index.ts should be minimal:
```ts
export { ChatInterface } from "./components/interface/chat-interface";
export { ChatGuard } from "./components/interface/chat-guard";
export { ChatHeader } from "./components/header/chat-header";
export { ConversationList } from "./components/sidebar/conversation-list";
export { KeyboardShortcutsDialog } from "./components/modals/keyboard-shortcuts-dialog";
export { ApiKeySection } from "./components/online-model-dialog/api-key-section";
```

### features/chat/hooks/index.ts
Read the current file. Minimize to only hooks that are exported through features/chat/index.ts or used by other features.
Most hooks are only used within features/chat/ components and should use direct imports.
Consider removing this barrel file entirely if no external consumers need it.

### features/chat/utils/index.ts
Same approach - minimize or remove.

### features/chat/api/index.ts (was lib/index.ts)
Same approach - minimize or remove.

### Other feature index files
Read and minimize:
- features/documents/index.ts
- features/onboarding/index.ts
- features/settings/index.ts

CRITICAL RULES:
- Do NOT change any component logic or behavior
- Do NOT update imports in files outside of features/ - Agent-Imports handles that
- Read every file BEFORE modifying it
- When removing barrel exports, do NOT break internal imports within the feature
```

---

### Agent 4: Import Fixer

**Name**: `import-fixer`
**Type**: `general-purpose`
**Mode**: `bypassPermissions`

```
You are updating ALL imports across the codebase after structural changes by other agents.
Read docs/refactoring-plan.md first for context.

WAIT: Before starting, verify that the file moves have been completed by checking:
- src/app/index.tsx exists (Agent-AppLayer)
- src/app/provider.tsx exists (Agent-AppLayer)
- src/app/root-layout.tsx exists (Agent-AppLayer)
- src/components/layouts/ exists (Agent-Components)
- src/components/errors/ exists (Agent-Components)
- src/features/layout/ does NOT exist (Agent-Components deleted it)
- src/features/welcome/ does NOT exist (Agent-Features deleted it)
- src/features/chat/api/ exists (Agent-Features renamed from lib/)

If any of these are missing, report which agent hasn't completed and stop.

## Your tasks:

### 1. Fix @/features/layout → @/components/layouts imports

Search all files for imports from "@/features/layout" and update:
- `@/features/layout` → `@/components/layouts`
- `@/features/layout/components/*` → `@/components/layouts/*`
- `@/features/layout/hooks/*` → `@/hooks/*`

Expected files to update:
- src/app/root-layout.tsx (was app.tsx)

### 2. Fix @/components/error-boundary → @/components/errors/error-boundary

Search and update:
- `@/components/error-boundary` → `@/components/errors/error-boundary`

Expected files:
- src/app/root-layout.tsx
- src/features/settings/components/settings-dialog/settings-dialog.tsx
- src/features/chat/components/interface/chat-interface.tsx

### 3. Fix @/features/chat/lib/ → @/features/chat/api/

Search all files for imports from "@/features/chat/lib" and update to "@/features/chat/api":

Expected files (many):
- src/app/providers/model-provider.tsx
- src/app/providers/web-llm-provider.tsx
- src/types/models.ts
- src/testing/mocks/factories.ts
- All internal features/chat/ files that import from their own lib/

### 4. Fix @/features/welcome imports

The only consumer was app/pages/welcome.tsx which is now app/routes/landing/landing.tsx.
That file should now use relative imports (./welcome-header etc).
Verify this was done by Agent-Features. If not, fix it.

### 5. Fix @/app/pages/ imports

If any file still imports from @/app/pages/, update to @/app/routes/.

### 6. Fix @/app/app imports

Update any remaining imports of the old App component:
- `@/app/app` → `@/app/root-layout`
- Function name: `App` → `RootLayout`

### 7. Fix barrel file consumers

After Agent-Features minimized barrel files, some imports through barrels may be broken.
Search for any imports from:
- `@/features/chat` (barrel) that import symbols no longer in the barrel
- Fix by converting to direct imports: `@/features/chat/hooks/use-chat-input` etc.

Do the same for features/chat/hooks, features/chat/utils, features/chat/api barrels.

### 8. Verify no broken imports remain

Run: pnpm tsc --noEmit
If errors remain, fix them one by one. Read the error, find the file, fix the import.

CRITICAL RULES:
- ONLY change import/export statements, never change logic
- Use grep extensively to find all affected files before making changes
- Run TypeScript compiler after each major batch of fixes
- Be thorough - a single broken import will fail the build
```

---

### Agent 5: Validator

**Name**: `validator`
**Type**: `general-purpose`
**Mode**: `bypassPermissions`

```
You are the final validator for the bulletproof-react refactoring.
Read docs/refactoring-plan.md first.

WAIT: Before starting, verify Agent-Imports has completed by running:
pnpm tsc --noEmit

If it has type errors, do NOT proceed. Report the errors.

## Validation Steps (do ALL in order):

### 1. TypeScript compilation
Run: pnpm tsc --noEmit
Expected: 0 errors
If errors: fix the import/type issues

### 2. Lint check
Run: pnpm lint
Expected: 0 errors (warnings acceptable)
If errors: fix them

### 3. Test suite
Run: pnpm test:run
Expected: all tests pass
If failures:
- Read the failing test
- Determine if it's an import path issue (fix the import)
- Determine if it's a mock path issue (update mock setup)
- Do NOT change test logic

### 4. Production build
Run: pnpm build
Expected: successful build
If failures: fix the issues

### 5. Structure verification
Verify the target structure exists:
- [ ] src/app/index.tsx exists and exports App
- [ ] src/app/provider.tsx exists and exports AppProvider
- [ ] src/app/root-layout.tsx exists (was app.tsx)
- [ ] src/app/main.tsx imports from @/app
- [ ] src/app/routes/landing/ exists (was pages/welcome.tsx)
- [ ] src/app/routes/terms.tsx exists (was pages/terms-of-service.tsx)
- [ ] src/app/providers/ still exists with 4 provider files
- [ ] src/components/layouts/ exists with layout files
- [ ] src/components/errors/error-boundary.tsx exists
- [ ] src/features/layout/ does NOT exist
- [ ] src/features/welcome/ does NOT exist
- [ ] src/features/chat/api/ exists (was lib/)
- [ ] src/features/chat/lib/ does NOT exist
- [ ] src/features/chat/index.ts has < 15 exports

### 6. No orphan files
Check that no old files remain:
- src/app/app.tsx should NOT exist
- src/app/pages/ should NOT exist
- src/components/error-boundary.tsx should NOT exist (only errors/ version)

Report results as a checklist with pass/fail for each item.
```

---

## Execution Order

```
1. Create team "bulletproof-refactor"
2. Create all tasks with dependencies:
   - Task 1: App Layer        (no dependencies)
   - Task 2: Components       (no dependencies)
   - Task 3: Features         (no dependencies)
   - Task 4: Import Fixer     (blocked by: 1, 2, 3)
   - Task 5: Validator        (blocked by: 4)
3. Spawn agents 1-3 in parallel
4. When all 3 complete, spawn agent 4
5. When agent 4 completes, spawn agent 5
6. Review agent 5 report
```

## Team Leader Prompt

```
You are the team leader for a bulletproof-react refactoring of the brokebot project.

Read docs/refactoring-plan.md and docs/refactoring-prompts.md for the full plan.

Create a team called "bulletproof-refactor" and execute the refactoring in phases:

Phase 1 (parallel): Spawn 3 agents simultaneously:
- "app-layer" (general-purpose) - restructures src/app/
- "components" (general-purpose) - moves layouts & errors to components/
- "features" (general-purpose) - cleans up features (welcome, barrel files, lib→api)

Phase 2 (after Phase 1 completes): Spawn 1 agent:
- "import-fixer" (general-purpose) - fixes ALL broken imports across codebase

Phase 3 (after Phase 2 completes): Spawn 1 agent:
- "validator" (general-purpose) - runs tsc, lint, tests, build

Use the detailed prompts from docs/refactoring-prompts.md for each agent.
Create tasks with proper dependency tracking.
Monitor progress and handle any issues that arise.
```

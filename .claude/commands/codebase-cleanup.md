# Codebase Cleanup Workflow

Comprehensive cleanup workflow that fixes all validation issues, reorganizes code structure, and ensures type safety across the codebase.

## Execution

Run all phases using parallel agents where possible.

---

## Phase 1: TypeScript Configuration (Sequential - Must Run First)

### Task 1.1: Add Test TypeScript Config

```
Create or update TypeScript configuration to include test files in type checking.

1. Read the current tsconfig.app.json and tsconfig.json
2. Create a new tsconfig.test.json that:
   - Extends tsconfig.app.json
   - Includes test files: "src/**/*.test.ts", "src/**/*.test.tsx"
   - Includes testing utilities: "src/testing/**/*"
   - Sets appropriate compiler options for tests (jsx, esModuleInterop, etc.)

3. Update package.json scripts to add:
   - "typecheck": "tsc --noEmit"
   - "typecheck:tests": "tsc --noEmit -p tsconfig.test.json"
   - "typecheck:all": "npm run typecheck && npm run typecheck:tests"

4. Run: npx tsc --noEmit -p tsconfig.test.json 2>&1 | head -100
   - Note all type errors in test files for Phase 2

Example tsconfig.test.json:
```json
{
  "extends": "./tsconfig.app.json",
  "compilerOptions": {
    "types": ["vitest/globals", "node"],
    "noEmit": true
  },
  "include": [
    "src/**/*.test.ts",
    "src/**/*.test.tsx",
    "src/testing/**/*"
  ]
}
```
```

**Agent**: `javascript-typescript:typescript-pro`

---

## Phase 2: Fix Test Type Errors (After Phase 1)

### Task 2.1: Fix Test Type Errors

```
Fix all TypeScript errors in test files identified from Phase 1.

Rules:
- NO `as any` casts
- NO `@ts-ignore` or `@ts-expect-error`
- Use proper mock implementations with all required methods
- Use factory functions from src/testing/mocks/factories.ts
- Create new factories if needed for missing types
- Ensure test data matches actual interfaces

Common fixes needed:
1. Mock objects missing required properties
2. Incorrect mock function signatures
3. Missing type imports
4. Incomplete interface implementations

After fixing, run: npx tsc --noEmit -p tsconfig.test.json
Ensure 0 errors before completing.
```

**Agent**: `unit-testing:test-automator`

---

## Phase 3: Critical Fixes (Parallel)

Launch these agents simultaneously:

### Task 3.1: Add AbortController to useModels

```
Fix the missing AbortController in /Users/voitz/Projects/brokebot/src/features/chat/hooks/use-models.ts

1. Read the current implementation
2. Add AbortController to the fetch request:
   - Create controller in useEffect
   - Pass signal to fetch options
   - Handle AbortError in catch block (ignore it)
   - Return cleanup function that calls controller.abort()

3. Update the test file if needed to handle abort scenarios

Pattern to implement:
```typescript
useEffect(() => {
  const controller = new AbortController();

  const fetchModels = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(API_URL, { signal: controller.signal });
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      if (!controller.signal.aborted) {
        setModels(data);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return; // Ignore abort errors
      }
      setError(error instanceof Error ? error : new Error('Unknown error'));
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
      }
    }
  };

  fetchModels();
  return () => controller.abort();
}, []);
```

Run tests after: npm test -- --run src/features/chat/hooks/use-models.test.ts
```

**Agent**: `react-component-architect`

### Task 3.2: Add Error Boundaries

```
Create and implement Error Boundaries for the application.

1. Create /Users/voitz/Projects/brokebot/src/components/error-boundary.tsx:
   - Use React 19 class component pattern for error boundaries (still required)
   - Create ErrorFallback component with retry button
   - Export both ErrorBoundary and ErrorFallback

2. Create /Users/voitz/Projects/brokebot/src/components/error-boundary.test.tsx:
   - Test error catching
   - Test fallback rendering
   - Test retry functionality

3. Wrap feature roots with ErrorBoundary in:
   - src/features/chat/components/interface/chat-interface.tsx
   - src/features/settings/components/settings-dialog.tsx
   - src/features/welcome/components/welcome-screen.tsx
   - src/app/app.tsx (root level)

Example implementation:
```typescript
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <ErrorFallback error={this.state.error} onRetry={this.handleRetry} />
      );
    }
    return this.props.children;
  }
}
```
```

**Agent**: `react-component-architect`

### Task 3.3: Add Zod Validation for JSON.parse

```
Add runtime validation for JSON.parse results using Zod schemas.

Files to fix:
1. /Users/voitz/Projects/brokebot/src/app/providers/model-provider.tsx (line 75)
2. /Users/voitz/Projects/brokebot/src/features/chat/hooks/use-header-actions.ts (line 167)

Steps:
1. Check if Zod is installed, if not note that it needs to be added
2. Create schema files in appropriate locations:
   - src/lib/schemas/model-schema.ts for UnifiedModel
   - src/lib/schemas/conversation-schema.ts for Conversation

3. Update the JSON.parse locations to use safeParse:
```typescript
import { UnifiedModelSchema } from '@/lib/schemas/model-schema';

// Instead of:
const model = JSON.parse(storedModel) as UnifiedModel;

// Use:
const parsed = UnifiedModelSchema.safeParse(JSON.parse(storedModel));
if (parsed.success) {
  setSelectedModel(parsed.data);
} else {
  console.warn('Invalid stored model, using default');
  localStorage.removeItem(STORAGE_KEY);
}
```

4. Add proper error handling for invalid data
5. Run affected tests to ensure nothing breaks

Check if zod is in package.json first: grep -l "zod" package.json
```

**Agent**: `javascript-typescript:typescript-pro`

### Task 3.4: Replace window.confirm with AlertDialog

```
Replace browser confirm dialog with proper AlertDialog component.

File: /Users/voitz/Projects/brokebot/src/features/documents/components/document-manager.tsx (line 40)

1. Read the current implementation
2. Add state for delete confirmation dialog:
   - documentToDelete: string | null
   - isDeleteDialogOpen: boolean

3. Replace window.confirm with AlertDialog from shadcn/ui:
```typescript
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// State
const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

// Handler
const handleDeleteClick = (filename: string) => {
  setDocumentToDelete(filename);
};

const handleDeleteConfirm = async () => {
  if (!documentToDelete) return;
  await deleteDocument(documentToDelete);
  setDocumentToDelete(null);
};

// In JSX
<AlertDialog open={!!documentToDelete} onOpenChange={(open) => !open && setDocumentToDelete(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Document</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to delete "{documentToDelete}"? This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

4. Update any tests for document-manager if they exist
```

**Agent**: `react-component-architect`

---

## Phase 4: Component Refactoring (Parallel)

### Task 4.1: Refactor Settings Dialog

```
Refactor /Users/voitz/Projects/brokebot/src/features/settings/components/settings-dialog.tsx to reduce size and duplication.

Current: ~200 lines with duplicated mobile/desktop layouts

Steps:
1. Read the current implementation
2. Extract components:
   - Create settings-mobile-layout.tsx for mobile view
   - Create settings-desktop-layout.tsx for desktop view
   - Keep shared logic in settings-dialog.tsx

3. The main settings-dialog.tsx should:
   - Handle state and logic
   - Conditionally render Mobile or Desktop layout
   - Be under 100 lines

4. Ensure both layouts receive props via a shared interface:
```typescript
interface SettingsLayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onClose: () => void;
}
```

5. Run any existing tests: npm test -- --run src/features/settings/
```

**Agent**: `react-component-architect`

### Task 4.2: Refactor Chat Header

```
Refactor /Users/voitz/Projects/brokebot/src/features/chat/components/header/chat-header.tsx to eliminate duplication.

Current: ~205 lines with duplicated mobile/desktop action buttons

Steps:
1. Read the current implementation
2. Identify duplicated code between mobile (lines ~70-118) and desktop (lines ~136-181)
3. Extract shared component:
   - Create header-actions.tsx with shared action buttons
   - Props: conversationId, isPinned, theme, onToggleTheme, onTogglePin, etc.

4. Update chat-header.tsx to use HeaderActions in both layouts:
```typescript
// Both mobile and desktop use same actions component
<HeaderActions
  conversationId={conversationId}
  isPinned={isConversationPinned}
  theme={theme}
  onToggleTheme={toggleTheme}
  onTogglePin={handlePinToggle}
  onExport={handleExport}
  onDelete={handleDelete}
  onRename={handleRename}
/>
```

5. Target: main file under 150 lines
6. Run tests: npm test -- --run src/features/chat/
```

**Agent**: `react-component-architect`

---

## Phase 5: Code Organization (Sequential)

### Task 5.1: Analyze and Plan Reorganization

```
Analyze the current codebase structure and create a reorganization plan.

1. List all hooks in src/hooks/:
   - Identify which are truly shared (used by multiple features)
   - Identify which are feature-specific (should move to features/)

2. List all utilities:
   - src/lib/ - shared utilities
   - src/features/*/utils/ - feature utilities
   - Identify any misplaced utilities

3. For each feature in src/features/, check if it needs subfolders:
   - If >5 hooks: create hooks/ subfolder
   - If >5 utils: create utils/ subfolder
   - If >10 components: create component subfolders by concern

Current expected structure:
```
src/
  hooks/                    # Shared hooks only (used by 2+ features)
    use-is-mobile.ts
    use-copy-to-clipboard.ts
    index.ts
  lib/                      # Shared utilities
    db.ts
    encryption-service.ts
    utils.ts
  features/
    chat/
      components/
        header/
        input/
        messages/
        sidebar/
      hooks/                # Chat-specific hooks
        use-chat-input.ts
        use-chat-messages.ts
        ...
      utils/                # Chat-specific utilities
        parse-message.ts
        ...
      lib/                  # Chat-specific libraries
        openrouter.ts
        webllm/
```

Output a migration plan with:
- Files to move (source -> destination)
- Import updates needed
- Index file updates
```

**Agent**: `Explore`

### Task 5.2: Execute Hook Reorganization

```
Based on the analysis from Task 5.1, reorganize hooks.

Rules:
1. SHARED hooks (stay in src/hooks/):
   - use-is-mobile.ts - used by layout and chat features
   - use-copy-to-clipboard.ts - generic clipboard utility
   - use-user-config.ts - app-wide config
   - use-conversations.ts - if used by multiple features

2. FEATURE-SPECIFIC hooks (move to src/features/*/hooks/):
   - Any hook only used within one feature
   - Check imports to determine usage

Steps for each move:
1. Move the file to new location
2. Move the corresponding .test.ts file
3. Update the feature's index.ts to export
4. Update all imports across the codebase
5. Run: npm run build to verify no broken imports

After all moves:
1. Update src/hooks/index.ts to only export shared hooks
2. Ensure each feature has hooks/index.ts exporting its hooks
3. Run full test suite: npm test -- --run
```

**Agent**: `general-purpose`

### Task 5.3: Execute Utils Reorganization

```
Reorganize utility files following the same pattern as hooks.

Rules:
1. SHARED utilities (stay in src/lib/):
   - db.ts - database utilities
   - encryption-service.ts - app-wide encryption
   - utils.ts (cn function, etc.) - generic utilities

2. FEATURE-SPECIFIC utilities (move to src/features/*/utils/):
   - Check each utility's imports to determine if feature-specific

3. For features with many files, ensure proper subfolder structure:
   - src/features/chat/utils/ for chat utilities
   - src/features/chat/lib/ for chat libraries (openrouter, webllm)

Steps for each move:
1. Move file to new location
2. Move corresponding test file
3. Update imports throughout codebase
4. Update index.ts exports

Verify with: npm run build && npm test -- --run
```

**Agent**: `general-purpose`

---

## Phase 6: Feature Folder Structure (After Phase 5)

### Task 6.1: Organize Chat Feature

```
The chat feature is the largest. Ensure it has proper organization:

Target structure:
```
src/features/chat/
  components/
    header/           # Header-related components
    input/            # Input-related components
    interface/        # Main interface components
    messages/         # Message display components
    modals/           # Dialog/modal components
    sidebar/          # Sidebar components
    model-selector/   # Model selection components
  hooks/              # All chat hooks
    index.ts
  utils/              # Chat utilities
    index.ts
  lib/                # Chat libraries
    openrouter.ts
    transcriber/
    webllm/
  constants/          # Chat constants
  types/              # Chat-specific types (if any)
  index.ts            # Feature public API
```

Steps:
1. Review current chat structure
2. Move any misplaced files
3. Create index.ts files for each subfolder
4. Update main feature index.ts to re-export public API
5. Update imports throughout the app

Verify: npm run build && npm test -- --run
```

**Agent**: `general-purpose`

---

## Phase 7: Final Validation

### Task 7.1: Run Full Validation

```
Run comprehensive validation after all changes:

1. Type check all code:
   npm run typecheck:all

2. Lint check:
   npm run lint

3. Run all tests:
   npm test -- --run

4. Build production:
   npm run build

5. Check for any remaining issues:
   - grep for "as any" in non-test files
   - grep for "@ts-ignore"
   - grep for "window.confirm"
   - grep for "forwardRef"

Report any failures for manual review.
```

**Agent**: `unit-testing:test-automator`

---

## Execution Order

```
Phase 1 (Sequential - Foundation)
    │
    ▼
Phase 2 (Sequential - Fix test types)
    │
    ▼
Phase 3 (Parallel - Critical fixes)
    ├── 3.1 AbortController
    ├── 3.2 Error Boundaries
    ├── 3.3 Zod Validation
    └── 3.4 AlertDialog
    │
    ▼
Phase 4 (Parallel - Refactoring)
    ├── 4.1 Settings Dialog
    └── 4.2 Chat Header
    │
    ▼
Phase 5 (Sequential - Reorganization)
    5.1 Analyze → 5.2 Hooks → 5.3 Utils
    │
    ▼
Phase 6 (Sequential - Structure)
    │
    ▼
Phase 7 (Validation)
```

## Usage

Execute this workflow:
```
/codebase-cleanup
```

Or run individual phases:
```
Fix critical issues only - run Phase 3 tasks in parallel
Reorganize code only - run Phase 5 and 6 sequentially
```

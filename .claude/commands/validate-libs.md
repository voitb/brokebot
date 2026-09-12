# Validate Library Implementations

Deep validation of library wrappers and integrations.

## Context

This project uses:
- Dexie (IndexedDB wrapper)
- React Hook Form + Zod
- React Router v7
- Radix UI
- Tailwind CSS 4 + CVA

## Execution

Launch the `code-architect` agent:

```
Perform a comprehensive library integration audit of ./src/lib

## Library Integration Checks

### 1. Dexie (Database)
Location: src/lib/db.ts (or similar)

✅ CORRECT PATTERNS:
- Single Dexie instance (singleton)
- Version management for migrations
- Typed tables with interfaces
- Transaction usage for atomic ops
- Proper error handling

❌ ANTI-PATTERNS:
- Multiple Dexie instances
- No version management
- Untyped tables
- Missing transactions
- Silent failures

Check:
```typescript
// Good: Typed Dexie
class AppDatabase extends Dexie {
  conversations!: Table<Conversation>;

  constructor() {
    super('appDb');
    this.version(1).stores({
      conversations: '++id, title, createdAt'
    });
  }
}
export const db = new AppDatabase();
```

### 2. React Hook Form + Zod
Location: src/lib/form.ts or feature forms

✅ CORRECT PATTERNS:
- Zod schemas for validation
- zodResolver integration
- Typed form data via z.infer
- Proper error display
- Form state (isSubmitting, errors)

❌ ANTI-PATTERNS:
- Manual validation
- Untyped form data
- Missing error handling
- Not using FormProvider for nested forms

Check:
```typescript
// Good: Zod + RHF integration
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;

const form = useForm<FormData>({
  resolver: zodResolver(schema),
});
```

### 3. React Router v7
Location: src/app/router.tsx

✅ CORRECT PATTERNS:
- Data router (createBrowserRouter)
- Loader/action functions
- Type-safe route params
- Error boundaries per route
- Lazy loading with React.lazy

❌ ANTI-PATTERNS:
- BrowserRouter (legacy)
- No error boundaries
- Untyped params
- No loading states
- Waterfall data fetching

Check:
```typescript
// Good: Data router with loaders
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: 'chat/:id',
        element: <ChatPage />,
        loader: chatLoader,
        errorElement: <ChatError />,
      },
    ],
  },
]);
```

### 4. Radix UI
Location: src/components/ui/

✅ CORRECT PATTERNS:
- Proper primitive composition
- Forwarding refs where needed
- Accessible by default
- Keyboard navigation
- Animation with CSS/Motion

❌ ANTI-PATTERNS:
- Overriding accessibility features
- Breaking keyboard navigation
- Not forwarding refs
- Custom implementations of solved problems

### 5. Tailwind CSS + CVA
Location: src/lib/utils.ts, component files

✅ CORRECT PATTERNS:
- cn() utility for class merging
- CVA for variant components
- Theme tokens (not magic values)
- Responsive utilities
- Dark mode support

❌ ANTI-PATTERNS:
- String concatenation for classes
- Hardcoded colors/sizes
- !important usage
- Inline styles
- CSS files for component styles

Check cn() implementation:
```typescript
// Good: cn utility
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Check CVA usage:
```typescript
// Good: CVA for variants
const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground',
        outline: 'border border-input bg-background',
      },
      size: {
        default: 'h-10 px-4',
        sm: 'h-9 px-3',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

### 6. Motion Library
Location: Component animations

✅ CORRECT PATTERNS:
- AnimatePresence for exit animations
- Layout animations for reflows
- Gesture handling
- Reduced motion respect

❌ ANTI-PATTERNS:
- CSS transitions that could be Motion
- No exit animations
- Not respecting prefers-reduced-motion

## Files to Scan

1. src/lib/ - Library wrappers
2. src/lib/utils.ts - Utility functions
3. src/app/router.tsx - Router config
4. src/components/ui/ - UI primitives

## Shadcn Component Exclusions

`src/components/ui/` contains shadcn/ui components. When validating Radix UI integration:
- These ARE the reference implementation - check for correctness
- Don't flag for size/complexity (compound components are intentional)
- Custom UI components (auto-size-textarea, etc.) should follow project patterns

## Output Format

### Library-by-Library Analysis

#### Dexie Integration
- **Status**: ✅/⚠️/❌
- **Location**: src/lib/db.ts
- **Issues**:
  - Issue 1
- **Recommendations**:
  - Recommendation 1

#### React Hook Form Integration
- **Status**: ✅/⚠️/❌
- **Issues**:
  - Issue 1
- **Recommendations**:
  - Recommendation 1

... (repeat for each library)

### Integration Issues
| Library | Issue | Severity | Fix |
|---------|-------|----------|-----|
| ... | ... | ... | ... |

### Missing Best Practices
| Library | Missing | Recommendation |
|---------|---------|----------------|
| ... | ... | ... |

### Summary
- Libraries analyzed: N
- Well-integrated: N
- Issues found: N
- Library integration score: X/10
```

## Quick Checks

```bash
# Check Dexie singleton
grep -rn "new Dexie\|extends Dexie" src/ --include="*.ts"

# Check zodResolver usage
grep -rn "zodResolver" src/ --include="*.ts" --include="*.tsx"

# Check router type (data router vs legacy)
grep -rn "createBrowserRouter\|BrowserRouter" src/ --include="*.tsx"

# Check cn utility usage
grep -rn "cn(" src/ --include="*.tsx" | head -10

# Check CVA usage
grep -rn "cva(" src/ --include="*.tsx" --include="*.ts"

# Check for inline styles
grep -rn "style={{" src/ --include="*.tsx"
```

## Library Update Recommendations

Check if libraries are up to date:

```bash
npm outdated
```

Key libraries to keep current:
- react, react-dom (19.x)
- react-router-dom (7.x)
- react-hook-form (7.x)
- zod (3.x)
- @radix-ui/* (latest)
- tailwindcss (4.x)

# Validate TypeScript Implementation

Deep validation of TypeScript patterns for type safety and maintainability.

## Context

This project uses:
- TypeScript 5.8 (strict mode)
- Zod for runtime validation
- Path aliases (@/*)

## Execution

Launch the `javascript-typescript:typescript-pro` agent:

```
Perform a comprehensive TypeScript audit of /Users/voitz/Projects/brokebot/src

## Type Safety Checks

### 1. Strict Type Safety
Check for violations of strict typing:

❌ CRITICAL - MUST FIX:
- `as any` casts
- `@ts-ignore` without explanation
- `@ts-expect-error` without proper error description
- Implicit any (should be caught by strict mode)
- Non-null assertions (!) without justification

✅ CORRECT PATTERNS:
- Proper type guards with `is` keyword
- `satisfies` operator for type checking
- Const assertions for literal types
- Generic constraints with `extends`

### 2. Type Design Quality
Check type definitions in src/types/:

✅ GOOD TYPE DESIGN:
- Discriminated unions for state
- Branded types for domain concepts
- Utility types (Pick, Omit, Partial, Required)
- Template literal types where useful
- Proper generic constraints

❌ POOR TYPE DESIGN:
- `object` or `{}` types
- Overuse of `any` or `unknown`
- Index signatures where Map is better
- Enums (prefer const objects with as const)
- Duplicate type definitions
- Types that are too wide or too narrow

### 3. Function Signatures
Check function typing:

✅ CORRECT:
- Return types explicitly declared for public APIs
- Proper generic type parameters
- Function overloads where needed
- Async functions return Promise<T>

❌ INCORRECT:
- Implicit return types on exported functions
- Missing generic constraints
- Parameters typed as `any`
- Callbacks without proper typing

### 4. React Component Types
Check component typing:

✅ CORRECT:
- Props interfaces (not inline)
- PropsWithChildren when needed
- Proper event handler types
- Ref types with useRef<HTMLElement>(null)
- Context types properly defined

❌ INCORRECT:
- Props typed inline
- Event handlers typed as `any`
- Missing children prop type
- FC<> type (prefer function declaration)

### 5. Zod Integration
Check Zod schema usage:

✅ CORRECT:
- z.infer<typeof schema> for type inference
- Schema reuse via .extend() and .merge()
- Proper error handling with safeParse
- Transform for data normalization

❌ INCORRECT:
- Duplicate types alongside schemas
- Not using inferred types
- Missing validation on API boundaries

### 6. Import/Export Types
Check module boundaries:

✅ CORRECT:
- `import type` for type-only imports
- Re-exports from index.ts
- Proper module augmentation

❌ INCORRECT:
- Regular imports for types (increases bundle)
- Circular type dependencies
- Missing exports from barrel files

## Files to Scan

Priority order:
1. src/types/ - Shared type definitions
2. src/lib/ - Library types
3. src/features/*/types/ - Feature types
4. src/hooks/ - Hook return types
5. src/features/*/hooks/ - Feature hook types

## Shadcn Component Exclusions

**Skip `src/components/ui/`** (shadcn) from type quality validation except custom components.

Shadcn components follow their own type patterns. Only validate custom UI components.

## Output Format

### Critical Type Safety Issues
| File:Line | Issue | Fix |
|-----------|-------|-----|
| ... | `as any` cast | Use type guard or proper typing |

### Type Design Issues
| File | Type | Issue | Recommendation |
|------|------|-------|----------------|
| ... | ... | ... | ... |

### Missing Types
| Location | What Needs Typing |
|----------|------------------|
| ... | ... |

### Summary
- Type coverage estimate: X%
- Critical issues: N
- Warnings: N
- Type safety score: X/10
```

## Quick Grep Checks

```bash
# Find 'as any' casts
grep -rn "as any" src/ --include="*.ts" --include="*.tsx"

# Find @ts-ignore
grep -rn "@ts-ignore\|@ts-expect-error" src/ --include="*.ts" --include="*.tsx"

# Find non-null assertions
grep -rn "\!\\." src/ --include="*.ts" --include="*.tsx" | grep -v "\\!=" | head -20

# Find 'object' type usage
grep -rn ": object" src/ --include="*.ts" --include="*.tsx"

# Find enum declarations (prefer const objects)
grep -rn "^enum \|export enum " src/ --include="*.ts" --include="*.tsx"

# Find missing return types on exports
grep -rn "export function\|export const.*=.*=>" src/ --include="*.ts" --include="*.tsx" | grep -v ":"
```

## TypeScript 5.8 Features to Adopt

Check if these modern features are used:
- [ ] `satisfies` operator
- [ ] `const` type parameters
- [ ] `using` declarations for resources
- [ ] Improved type narrowing
- [ ] Template literal types

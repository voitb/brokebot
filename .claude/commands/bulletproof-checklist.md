# Bulletproof React Structure Checklist

Quick reference checklist for validating project structure compliance.

## Directory Checklist

Check each directory exists and contains appropriate content:

### Root Level (`src/`)
- [ ] `app/` - Application layer (routes, providers, main entry)
- [ ] `assets/` - Static files (images, fonts, icons)
- [ ] `components/` - Shared UI components ONLY (no business logic)
- [ ] `config/` - Global configuration, environment variables
- [ ] `features/` - Feature modules (majority of code)
- [ ] `hooks/` - Shared custom hooks
- [ ] `lib/` - Pre-configured library wrappers
- [ ] `stores/` - Global state stores (if needed)
- [ ] `testing/` - Test utilities, mocks, fixtures
- [ ] `types/` - Shared TypeScript types
- [ ] `utils/` - Shared utility functions

### Feature Module Structure (`src/features/[name]/`)
- [ ] `api/` - API requests, React Query hooks
- [ ] `components/` - Feature-specific components
- [ ] `hooks/` - Feature-specific hooks
- [ ] `stores/` - Feature-specific state (if needed)
- [ ] `types/` - Feature-specific types
- [ ] `utils/` - Feature-specific utilities
- [ ] `index.ts` - Barrel export (public API)

## Import Rules Checklist

### Allowed Imports
- [x] `app/` can import from `features/`
- [x] `app/` can import from shared modules
- [x] `features/` can import from shared modules
- [x] Shared modules can import from each other

### Forbidden Imports
- [ ] `features/X` importing from `features/Y` (cross-feature)
- [ ] Shared modules importing from `features/`
- [ ] Shared modules importing from `app/`
- [ ] `features/` importing from `app/`

## Naming Convention Checklist

### Files & Folders
- [ ] All files: `kebab-case.ts` or `kebab-case.tsx`
- [ ] All folders: `kebab-case`
- [ ] Test files: `*.test.ts` or `*.test.tsx`

### Exports
- [ ] Components: `export function PascalCase()`
- [ ] Hooks: `export function useCamelCase()`
- [ ] Utilities: `export function camelCase()`
- [ ] Constants: `export const UPPER_SNAKE_CASE`
- [ ] Types: `export type PascalCase` or `export interface PascalCase`

## Anti-Patterns to Find

Search for these issues:
- [ ] CSS files at `src/` root level
- [ ] `constants/` folder (should be `config/`)
- [ ] `shared/` folder (split into proper shared modules)
- [ ] Components with business logic in `src/components/`
- [ ] Hooks that belong to features in `src/hooks/`
- [ ] Missing barrel exports in features

## Quick Grep Commands

```bash
# Find files not in kebab-case
find src -name "*[A-Z]*" -type f

# Find cross-feature imports
grep -r "from ['\"].*features/[^'\"]*['\"]" src/features/ | grep -v "from.*features/$(dirname)"

# Find imports from features in shared modules
grep -r "from ['\"].*features" src/components/ src/hooks/ src/lib/ src/utils/ src/types/

# Find CSS at root
ls src/*.css

# Find missing index.ts in features
for dir in src/features/*/; do [ ! -f "$dir/index.ts" ] && echo "Missing: $dir/index.ts"; done
```

# Execute Bulletproof React Migration

You are migrating a React/TypeScript project to follow Bulletproof React architecture.

## Current State
```
src/
├── app/              ✅ Correct
├── components/ui/    ✅ Correct (but has dependency inversion)
├── config/           ✅ Correct
├── features/         ✅ Correct (but missing index.ts exports)
├── lib/              ✅ Correct
├── pages/            ❌ Move to app/pages/
├── shared/           ❌ Split into hooks/, components/
├── test/             ❌ Rename to testing/
├── types/            ✅ Correct (but has re-export violations)
├── App.css           ❌ Move to assets/styles/
├── index.css         ❌ Move to assets/styles/
└── vite-env.d.ts     ✅ Keep
```

## Target State
```
src/
├── app/
├── assets/styles/
├── components/
│   ├── ui/
│   ├── seo/
│   └── dialogs/
├── config/
├── features/[name]/
│   └── index.ts (barrel export)
├── hooks/
├── lib/
├── stores/
├── testing/
├── types/
└── utils/
```

## Migration Tasks

### TASK 1: Directory Structure
1. Create directories: `src/assets/styles/`, `src/stores/`, `src/utils/`, `src/hooks/`
2. Move `src/App.css` → `src/assets/styles/app.css`
3. Move `src/index.css` → `src/assets/styles/index.css`
4. ~~Rename `src/constants/` → `src/config/`~~ DONE
5. Rename `src/test/` → `src/testing/`
6. Move `src/pages/terms-of-service.tsx` → `src/app/pages/terms-of-service.tsx`
7. Delete empty `src/pages/`

### TASK 2: Fix Dependency Inversions
1. Move `src/features/chat/hooks/use-copy-to-clipboard.ts` → `src/hooks/use-copy-to-clipboard.ts`
2. Move `src/features/chat/hooks/use-copy-to-clipboard.test.ts` → `src/hooks/use-copy-to-clipboard.test.ts` (if exists)
3. Update `src/components/ui/copy-button.tsx` import to `@/hooks/use-copy-to-clipboard`

### TASK 3: Migrate shared/ Folder
1. Move `src/shared/hooks/use-conversations.ts` → `src/hooks/use-conversations.ts`
2. Move `src/shared/hooks/use-is-mobile.ts` → `src/hooks/use-is-mobile.ts`
3. Move `src/shared/hooks/use-is-mobile.test.ts` → `src/hooks/use-is-mobile.test.ts`
4. Move `src/shared/hooks/use-user-config.ts` → `src/hooks/use-user-config.ts`
5. Move `src/shared/hooks/use-user-config.test.ts` → `src/hooks/use-user-config.test.ts`
6. Move `src/shared/hooks/use-keyboard-shortcuts.ts` → `src/features/layout/hooks/use-keyboard-shortcuts.ts`
7. Move `src/shared/hooks/use-keyboard-shortcuts.test.tsx` → `src/features/layout/hooks/use-keyboard-shortcuts.test.tsx`
8. Move `src/shared/components/common/*` → `src/components/seo/*`
9. Move `src/shared/components/dialogs/*` → `src/components/dialogs/*`
10. Delete empty `src/shared/`

### TASK 4: Update All Imports
After moving files, update ALL imports in the codebase:
- ~~`@/constants/*` → `@/config/*`~~ DONE
- `@/test/*` → `@/testing/*`
- `@/shared/hooks/*` → `@/hooks/*` or `@/features/layout/hooks/*`
- `@/shared/components/common/*` → `@/components/seo/*`
- `@/shared/components/dialogs/*` → `@/components/dialogs/*`
- `@/features/chat/hooks/use-copy-to-clipboard` → `@/hooks/use-copy-to-clipboard`
- `@/pages/*` → `@/app/pages/*`
- CSS imports: `../App.css` → `@/assets/styles/app.css`
- CSS imports: `./index.css` → `@/assets/styles/index.css`

### TASK 5: Clean types/models.ts
Remove re-exports from features. The file should only contain global types, not re-exports from features.

### TASK 6: Add Barrel Exports
Create `index.ts` for each feature exposing only the public API.

## Rules
- Move files with `git mv` when possible to preserve history
- After each move, immediately update all imports
- Run `npm run type-check` or `tsc --noEmit` to verify no broken imports
- Keep tests co-located with source files
- Commit after each logical group of changes

## Validation
After migration, verify:
1. `npm run type-check` passes
2. `npm test` passes
3. `npm run build` succeeds
4. No imports from `@/shared/`, `@/test/`, `@/pages/`
5. No imports from features into `components/ui/` or root `hooks/`

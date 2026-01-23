# Verify Project Structure Against Bulletproof React

Analyze the current project structure and provide a comprehensive report comparing it against **Bulletproof React** architecture principles.

## Phase 1: Project Analysis

Use the `project-analyst` agent to:
- Detect the current tech stack and frameworks
- Map all top-level directories in `src/`
- Identify the current architectural patterns in use

## Phase 2: Deep Structure Exploration

Use the `code-archaeologist` agent to:
- Document the complete folder hierarchy under `src/`
- Identify all feature modules in `src/features/`
- Map cross-feature dependencies and imports
- Find any circular dependencies or import violations

## Phase 3: Architecture Comparison

Compare the current structure against Bulletproof React principles:

### Expected Structure (Bulletproof React)
```
src/
├── app/              # Application layer (routes, providers, entry)
├── assets/           # Static files (images, fonts)
├── components/       # Shared UI components only
├── config/           # Global configs, env variables
├── features/         # Feature-based modules
│   └── [feature]/
│       ├── api/      # API requests and hooks
│       ├── components/
│       ├── hooks/
│       ├── stores/
│       ├── types/
│       ├── utils/
│       └── index.ts  # Public barrel export
├── hooks/            # Shared custom hooks
├── lib/              # Pre-configured libraries
├── stores/           # Global state management
├── testing/          # Test utilities, mocks
├── types/            # Shared TypeScript types
└── utils/            # Shared utility functions
```

### Key Principles to Verify
1. **Unidirectional imports**: `app/` → `features/` → shared modules
2. **No cross-feature imports**: Features must not import from each other
3. **Kebab-case naming**: All files and folders
4. **Feature encapsulation**: Each feature is self-contained
5. **Shared modules independence**: `components/`, `hooks/`, `lib/`, `types/`, `utils/` cannot import from `features/` or `app/`

## Phase 4: Generate Report

Create a structured report with:

### 1. Current State Analysis
- List all directories that exist
- List directories that are missing
- List directories that shouldn't exist (non-standard)

### 2. Import Violations
- Cross-feature imports found
- Reverse dependency violations (shared → features)
- Circular dependencies

### 3. Naming Convention Issues
- Files not using kebab-case
- Components not using PascalCase exports
- Hooks not using camelCase with `use` prefix

### 4. Migration Plan
For each issue, provide:
- **Issue**: What's wrong
- **Location**: File/folder path
- **Action**: Specific fix (move, rename, refactor)
- **Priority**: High/Medium/Low

### 5. File Moves Summary
Generate a table of all files that need to be moved:
```
| Current Path | Target Path | Reason |
|--------------|-------------|--------|
| src/foo/...  | src/bar/... | ...    |
```

## Output Format

Return a markdown report with all findings, prioritized by impact. Include:
- Executive summary (3-5 bullet points)
- Detailed findings by category
- Actionable migration checklist
- Estimated scope (number of files affected)

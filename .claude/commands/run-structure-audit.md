# Run Full Structure Audit

Execute a complete project structure audit against Bulletproof React architecture.

## Execution Steps

Run these agents IN PARALLEL for efficiency:

### 1. Project Analysis (project-analyst)
```
Analyze /Users/voitz/Projects/brokebot:
- Detect tech stack (React, TypeScript, build tools)
- List all top-level src/ directories
- Identify current architectural pattern
Return: Tech stack summary and structure overview
```

### 2. Codebase Exploration (code-archaeologist)
```
Explore /Users/voitz/Projects/brokebot/src:
- Map complete directory hierarchy
- Document each feature module's internal structure
- Identify import patterns and dependencies
- Flag technical debt or structural issues
Return: Full structure documentation with concerns
```

### 3. Architecture Review (code-architect)
```
Compare current structure to Bulletproof React:

BULLETPROOF REACT EXPECTED:
src/
├── app/          # Routes, providers, entry
├── assets/       # Static files
├── components/   # Shared UI only
├── config/       # Global config
├── features/     # Feature modules
├── hooks/        # Shared hooks
├── lib/          # Library wrappers
├── stores/       # Global state
├── testing/      # Test utilities
├── types/        # Shared types
└── utils/        # Shared utilities

FEATURE MODULE EXPECTED:
features/[name]/
├── api/
├── components/
├── hooks/
├── types/
├── utils/
└── index.ts

Tasks:
1. List non-standard directories
2. List missing directories
3. Find misplaced files
4. Check for import violations
5. Generate migration plan

Return: Detailed compliance report with action items
```

## After Agents Complete

Compile findings into final report:

### Structure Compliance Report

#### Executive Summary
- Overall compliance score: X/10
- Critical issues: N
- Files to move: N
- Import violations: N

#### Non-Standard Directories Found
| Directory | Issue | Action |
|-----------|-------|--------|
| src/X     | ...   | Remove/Rename/Merge |

#### Missing Directories
| Directory | Purpose | Priority |
|-----------|---------|----------|
| src/X     | ...     | High/Med/Low |

#### Import Violations
| File | Imports From | Should Import From |
|------|--------------|-------------------|
| ... | ... | ... |

#### Migration Plan (Ordered)
1. [ ] High Priority: ...
2. [ ] Medium Priority: ...
3. [ ] Low Priority: ...

#### File Moves
| Current | Target | Reason |
|---------|--------|--------|
| src/A/x.ts | src/B/x.ts | ... |

## Agents Reference

| Agent | Tool Call | Purpose |
|-------|-----------|---------|
| project-analyst | `Task(subagent_type="project-analyst")` | Tech stack detection |
| code-archaeologist | `Task(subagent_type="code-archaeologist")` | Deep exploration |
| code-architect | `Task(subagent_type="code-architect")` | Architecture design |
| Explore | `Task(subagent_type="Explore")` | Quick searches |

# Command Index

All available Claude Code commands for this project.

## Comprehensive Audits

| Command | Purpose | Agents Used |
|---------|---------|-------------|
| `/full-codebase-audit` | **Complete health check** - Bulletproof React, hooks, KISS/DRY/YAGNI/SRP, React 2026, TypeScript | 8 agents (parallel phases) |

## Validation Workflows

| Command | Purpose | Agents Used |
|---------|---------|-------------|
| `/validate-all` | Master validation - runs all validators | Multiple (parallel) |
| `/validate-react` | React 19 patterns and best practices | `react-principles` |
| `/validate-typescript` | TypeScript quality and type safety | `typescript-pro` |
| `/validate-hooks` | Custom hook implementations | `react-component-architect` |
| `/validate-components` | Component architecture and a11y | `react-component-architect` |
| `/validate-tests` | Test coverage and quality | `unit-testing:test-automator` |
| `/validate-libs` | Library integrations | `code-architect` |
| `/validate-performance` | Performance patterns | `performance-engineer` |
| `/quick-check` | Fast automated checks (no agents) | None (bash only) |

## Structure Workflows

| Command | Purpose | Agents Used |
|---------|---------|-------------|
| `/audit-structure` | Audit project structure | `project-analyst`, `code-archaeologist`, `code-architect` |
| `/verify-structure` | Verify Bulletproof React compliance | `project-analyst`, `code-archaeologist` |
| `/run-structure-audit` | Full structure audit | Multiple (parallel) |
| `/execute-migration` | Execute structure migration | None (manual) |

## Fix Workflows

| Command | Purpose | Agents Used |
|---------|---------|-------------|
| `/fix-all` | **Fix all validation issues** - TypeScript, React patterns, tests, accessibility to achieve 10/10 | 4 agents (parallel) |
| `/fix-audit-issues` | **Fix all audit issues** - Structure, God hooks, cross-feature imports, performance, ESLint | 17 invocations across 8 phases |
| `/fix-tests` | Systematically fix failing tests | `general-purpose`, `unit-testing:test-automator` |

### `/fix-audit-issues` Agent Assignments

| Phase | Agent | Task |
|-------|-------|------|
| 1 (Parallel) | `feature-dev:code-explorer` | Hook usage & component mapping |
| 1 (Parallel) | `Explore` | Cross-feature import search |
| 2 (Sequential) | `Bash` | Clean empty directories |
| 2 (Sequential) | `react-component-architect` | Move hooks, merge providers |
| 2 (Sequential) | `code-architect:code-architect` | Resolve cross-feature imports |
| 3 (Parallel) | `react-component-architect` | Split God hooks (×3) |
| 4 (Parallel) | `react-nextjs-expert` | Route code splitting |
| 4 (Parallel) | `application-performance:frontend-developer` | Lazy load WebLLM |
| 4 (Parallel) | `react-principles` | Document memoization |
| 5 | `react-principles` | Fix ESLint warnings |
| 6 | `code-simplifier:code-simplifier` | Remove nested TooltipProviders |
| 7-8 | `Bash` | Update barrels, verification |

## Utility

| Command | Purpose |
|---------|---------|
| `/bulletproof-checklist` | Quick reference checklist |

## Recommended Workflow

### Daily Development
1. `/quick-check` - Before each commit
2. `/fix-tests` - If tests fail

### Weekly Review
1. `/validate-all` - Comprehensive validation
2. `/verify-structure` - Structure compliance

### Monthly Deep Dive (or Onboarding)
1. `/full-codebase-audit` - **Complete health check** with 8 parallel agents
2. `/fix-audit-issues` - **Fix all identified issues** (run after audit)

### Before Major Release
1. `/full-codebase-audit` - Complete audit
2. `/fix-audit-issues` - Apply all fixes
3. `/validate-performance` - Performance deep dive
4. `/audit-structure` - Architecture review

## Agent Quick Reference

### Core Agents
| Agent | Best For |
|-------|----------|
| `Explore` | Fast codebase search, import analysis, file discovery |
| `Bash` | Command execution, file operations, verification |

### React/Frontend Specialists
| Agent | Best For |
|-------|----------|
| `react-principles` | React 2026 patterns, useEffectEvent, React Compiler |
| `react-component-architect` | Hook/component design, refactoring, composition |
| `react-nextjs-expert` | Code splitting, SSR, ISR, route optimization |
| `application-performance:frontend-developer` | React performance, Core Web Vitals |
| `frontend-developer` | General UI development |

### Architecture & Code Quality
| Agent | Best For |
|-------|----------|
| `feature-dev:code-explorer` | Trace execution paths, map dependencies |
| `feature-dev:code-architect` | Feature architecture design |
| `code-architect:code-architect` | Architecture, Bulletproof React structure |
| `code-simplifier:code-simplifier` | Code simplification, cleanup |
| `code-reviewer` | KISS/DRY/YAGNI/SRP, security review |

### TypeScript & Testing
| Agent | Best For |
|-------|----------|
| `javascript-typescript:typescript-pro` | Advanced types, strict typing |
| `unit-testing:test-automator` | Test strategy, coverage |
| `unit-testing:debugger` | Debugging test failures |

### Exploration & Analysis
| Agent | Best For |
|-------|----------|
| `project-analyst` | Tech stack detection |
| `code-archaeologist` | Codebase exploration, documentation |
| `performance-optimizer` | Bundle size, renders, bottlenecks |

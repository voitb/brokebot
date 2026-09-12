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
| `/validate-test-simplification-project` | **Simplify over-engineered tests** - Analysis + optional auto-fix | 4-6 agents (parallel) |
| `/validate-libs` | Library integrations | `code-architect` |
| `/validate-performance` | Performance patterns | `performance-engineer` |
| `/quick-check` | Fast automated checks (no agents) | None (bash only) |

## Structure Workflows

| Command | Purpose | Agents Used |
|---------|---------|-------------|
| `/audit-structure` | Audit project structure | `project-analyst`, `code-archaeologist`, `code-architect` |
| `/verify-structure` | Verify Bulletproof React compliance | `project-analyst`, `code-archaeologist` |
| `/run-structure-audit` | Full structure audit | Multiple (parallel) |

## Fix Workflows

| Command | Purpose | Agents Used |
|---------|---------|-------------|
| `/fix-all` | **Fix all validation issues** - TypeScript, React patterns, tests, accessibility to achieve 10/10 | 4 agents (parallel) |
| `/fix-tests` | Systematically fix failing tests | `general-purpose`, `unit-testing:test-automator` |

## Global Commands (Project-Agnostic)

Commands in `global/` folder work with any TypeScript/React/Next.js project:

| Command | Purpose | Agents Used |
|---------|---------|-------------|
| `/global:validate-test-simplification` | **Simplify tests (any project)** - No project-specific config required | 4-6 agents (parallel) |

## Utility

| Command | Purpose |
|---------|---------|
| `/bulletproof-checklist` | Quick reference checklist |

## Recommended Workflow

### Daily Development
1. `/quick-check` - Before each commit
2. `/fix-tests` - If tests fail
3. `/validate-test-simplification-project` - Before adding 100+ line test files

### Weekly Review
1. `/validate-all` - Comprehensive validation
2. `/verify-structure` - Structure compliance

### Monthly Deep Dive (or Onboarding)
1. `/full-codebase-audit` - **Complete health check** with 8 parallel agents

### Before Major Release
1. `/full-codebase-audit` - Complete audit
2. `/validate-performance` - Performance deep dive
3. `/audit-structure` - Architecture review

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

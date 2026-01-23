# Audit Project Structure

Run a comprehensive audit of the project structure using specialized agents.

## Instructions

Execute the following analysis steps in sequence:

### Step 1: Analyze Tech Stack
Launch the `project-analyst` agent to detect frameworks and current architecture:
```
Analyze the project at /Users/voitz/Projects/brokebot to detect:
- Framework and libraries in use
- Current folder structure under src/
- Architectural patterns detected
Return a summary of the tech stack and structure.
```

### Step 2: Deep Code Exploration
Launch the `code-archaeologist` agent:
```
Explore the codebase at /Users/voitz/Projects/brokebot/src and document:
1. Complete directory tree with descriptions
2. All feature modules and their internal structure
3. Import patterns between directories
4. Any architectural concerns or technical debt
Focus on structure, not implementation details.
```

### Step 3: Architecture Design Review
Launch the `code-architect` agent:
```
Review the current structure of /Users/voitz/Projects/brokebot/src against Bulletproof React architecture:

Expected Bulletproof React structure:
- src/app/ (routes, providers, entry)
- src/assets/ (static files)
- src/components/ (shared UI only)
- src/config/ (global configs)
- src/features/[name]/ (api/, components/, hooks/, stores/, types/, utils/, index.ts)
- src/hooks/ (shared hooks)
- src/lib/ (pre-configured libraries)
- src/stores/ (global state)
- src/testing/ (test utilities)
- src/types/ (shared types)
- src/utils/ (shared utilities)

Identify:
1. Directories that exist but shouldn't (non-standard)
2. Directories that are missing
3. Files in wrong locations
4. Import violations (cross-feature, reverse dependencies)

Provide a detailed migration plan with file moves.
```

### Step 4: Import Analysis
Use grep to find import violations:
```bash
# Find cross-feature imports
grep -r "from ['\"]@/features/" src/features/ --include="*.ts" --include="*.tsx" | grep -v "from ['\"]@/features/\(chat\|settings\|layout\|onboarding\)/"

# Find imports from features into shared
grep -r "from ['\"]@/features/" src/components/ src/hooks/ src/lib/ src/utils/ src/types/ --include="*.ts" --include="*.tsx" 2>/dev/null
```

## Expected Output

Generate a final report with:

1. **Executive Summary**: 3-5 key findings
2. **Structure Compliance Score**: X/10
3. **Issues Found**: Categorized list
4. **Migration Checklist**: Ordered by priority
5. **File Moves Table**: Current → Target paths

## Agents Used

| Agent | Purpose |
|-------|---------|
| `project-analyst` | Tech stack detection, initial structure mapping |
| `code-archaeologist` | Deep exploration, documentation, risk assessment |
| `code-architect` | Architecture design, migration planning |
| `Explore` | Quick file/pattern searches |

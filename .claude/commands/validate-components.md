# Validate Component Architecture

Deep validation of React component patterns and architecture.

## Context

This project uses:
- React 19 with React Compiler
- Radix UI primitives
- Tailwind CSS 4
- Feature-based architecture (Bulletproof React)

## Execution

Launch the `react-component-architect` agent:

```
Perform a comprehensive component architecture audit of ./src

## Component Quality Checks

### 1. Component Structure
Check component organization:

✅ CORRECT:
- One component per file (with rare exceptions)
- Component name matches file name (kebab-case file, PascalCase export)
- Related components colocated
- Feature components in features/*/components/
- Shared UI in components/ui/

❌ INCORRECT:
- Multiple unrelated components in one file
- Component in wrong directory
- Mismatched file/component names

### 2. Component Size & Complexity
Check for maintainability:

✅ HEALTHY:
- < 200 lines of code
- < 10 props
- Single responsibility
- Clear render logic

❌ UNHEALTHY:
- > 300 lines (needs splitting)
- > 15 props (needs composition)
- Multiple responsibilities
- Deeply nested JSX (> 5 levels)
- Complex conditional rendering

⚠️ EXCEPTIONS (Do NOT flag as issues):
- `src/components/ui/` - shadcn/ui components should be kept as-is
- Third-party component wrappers (Radix, etc.)
- These components are intentionally large compound components

### 3. Props Design
Check prop patterns:

✅ GOOD PROPS DESIGN:
- Props interface defined separately
- Descriptive prop names
- Boolean props: is*, has*, should*, can*
- Handler props: on*, handle*
- Proper defaults via destructuring
- Children prop for composition

❌ POOR PROPS DESIGN:
- Props interface inline
- Generic names (data, info, item)
- Boolean props without prefix
- Handlers without on* prefix
- Too many boolean flags (use variant/enum)
- Prop drilling through many levels

### 4. Composition Patterns
Check for proper React composition:

✅ CORRECT PATTERNS:
- Compound components (Tabs.Root, Tabs.Item)
- Render props for flexibility
- Children for content projection
- Slots pattern via props
- Composition over configuration

❌ ANTI-PATTERNS:
- Giant config objects
- Deep prop drilling
- Props for every variation
- Recreating browser APIs

### 5. Accessibility
Check a11y compliance:

✅ REQUIRED:
- Semantic HTML elements
- ARIA attributes where needed
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast (Tailwind handles)

❌ VIOLATIONS:
- div/span instead of semantic elements
- Missing aria-label on icon buttons
- Non-focusable interactive elements
- Missing alt text on images
- Click handlers on non-interactive elements

### 6. State Management in Components
Check state patterns:

✅ CORRECT:
- Local state for UI-only state
- Lifted state for shared state
- Context for deeply shared state
- Form state with react-hook-form

❌ INCORRECT:
- Global state for local concerns
- Duplicated state
- Derived state in useState
- Uncontrolled components with controlled behavior

### 7. Styling Patterns (Tailwind)
Check Tailwind usage:

✅ CORRECT:
- Utility classes in className
- cn() for conditional classes
- CVA for variant components
- Tailwind config for theme
- No inline styles

❌ INCORRECT:
- Inline style prop
- CSS files for component styles
- !important usage
- Magic numbers (use theme values)
- Hardcoded colors

### 8. Error & Loading States
Check state handling:

✅ REQUIRED:
- Loading state (skeleton/spinner)
- Error state (error message/retry)
- Empty state (helpful message)
- Suspense boundaries for lazy

❌ MISSING:
- No loading indicator
- Silent failures
- No empty state
- Uncaught errors

## Files to Scan

1. src/components/ui/ - Shared UI components
2. src/features/*/components/ - Feature components
3. src/app/ - Layout components

## Output Format

### Component-by-Component Analysis

For complex components:

#### `ComponentName` (file:line)
- **Lines**: N
- **Props**: N
- **Complexity**: Low/Medium/High
- **Issues**:
  - Issue 1
  - Issue 2
- **Recommendations**:
  - Split into X and Y
  - Extract hook for Z

### Components Needing Refactoring
| Component | File | Lines | Props | Issue |
|-----------|------|-------|-------|-------|
| ... | ... | ... | ... | ... |

### Accessibility Issues
| Component | Issue | Fix |
|-----------|-------|-----|
| ... | ... | ... |

### Props Design Issues
| Component | Prop | Issue | Suggestion |
|-----------|------|-------|------------|
| ... | ... | ... | ... |

### Summary
- Components analyzed: N
- Large components (>200 lines): N
- Accessibility issues: N
- Props issues: N
- Component quality score: X/10
```

## Quick Checks

```bash
# Find large components (>200 lines)
wc -l src/components/**/*.tsx src/features/*/components/**/*.tsx 2>/dev/null | sort -rn | head -20

# Find components with many props
grep -rn "interface.*Props" src/ --include="*.tsx" -A 20 | grep -E "^\s+\w+:" | wc -l

# Find inline styles
grep -rn "style={{" src/ --include="*.tsx"

# Find non-semantic interactive elements
grep -rn "<div.*onClick\|<span.*onClick" src/ --include="*.tsx"

# Find missing aria-labels on buttons with only icons
grep -rn "<Button.*<.*Icon\|<button.*<.*Icon" src/ --include="*.tsx" | grep -v "aria-label"

# Find components without error boundaries
grep -L "ErrorBoundary" src/features/*/components/*.tsx 2>/dev/null | head -10
```

## Component Refactoring Patterns

### Before: Prop Drilling
```typescript
// ❌ BAD
<GrandParent user={user}>
  <Parent user={user}>
    <Child user={user} />
  </Parent>
</GrandParent>

// ✅ GOOD - Context
const UserContext = createContext<User | null>(null);
<UserContext value={user}>
  <GrandParent>
    <Parent>
      <Child /> {/* uses useContext(UserContext) */}
    </Parent>
  </GrandParent>
</UserContext>
```

### Before: Config Object
```typescript
// ❌ BAD
<Card
  showHeader={true}
  headerTitle="Title"
  headerIcon={<Icon />}
  showFooter={true}
  footerActions={[...]}
/>

// ✅ GOOD - Composition
<Card>
  <Card.Header icon={<Icon />}>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>{actions}</Card.Footer>
</Card>
```

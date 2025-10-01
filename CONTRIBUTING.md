# Contributing to MeethaPitara Calculator

Thank you for your interest in contributing! This document provides guidelines and best practices for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Experience level
- Gender identity and expression
- Sexual orientation
- Disability
- Personal appearance
- Body size
- Race, ethnicity, or nationality
- Age
- Religion or lack thereof

### Expected Behavior

- Be respectful and inclusive in communication
- Accept constructive criticism gracefully
- Focus on what's best for the project and community
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment, trolling, or discriminatory comments
- Publishing others' private information
- Spamming or excessive self-promotion
- Other conduct that could reasonably be considered inappropriate

## Getting Started

### Prerequisites

- Node.js 20+ (use [nvm](https://github.com/nvm-sh/nvm) for version management)
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/meetha-pitara-calculator.git
   cd meetha-pitara-calculator
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy environment variables:
   ```bash
   cp .env.example .env
   # Fill in your Supabase credentials
   ```
5. Start development server:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branching Strategy

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Creating a Feature Branch

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

### Making Changes

1. Write clean, readable code
2. Add tests for new functionality
3. Update documentation as needed
4. Commit frequently with clear messages

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style/formatting (no logic change)
- `refactor`: Code restructuring (no feature change)
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(calculator): add overrun calculation to recipe metrics

fix(paste-studio): resolve AI timeout on detailed mode

docs(readme): update installation instructions

test(calc): add unit tests for SP/PAC calculations
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define interfaces for data structures
- Avoid `any` type; use `unknown` if needed
- Use strict mode (`"strict": true` in tsconfig.json)

**Example:**
```typescript
// Good ✅
interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
  metrics: Metrics;
}

// Bad ❌
const recipe: any = { ... };
```

### React Components

- Use functional components with hooks
- Keep components small and focused (< 200 lines)
- Extract reusable logic into custom hooks
- Use proper prop typing

**Example:**
```typescript
// Good ✅
interface RecipeCardProps {
  recipe: Recipe;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ 
  recipe, 
  onEdit, 
  onDelete 
}) => {
  // Component logic
};

// Bad ❌
export const RecipeCard = (props) => { ... };
```

### File Organization

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   └── features/       # Feature-specific components
├── lib/                # Pure functions & utilities
├── hooks/              # Custom React hooks
├── services/           # External API integrations
├── types/              # TypeScript type definitions
└── pages/              # Page components (routing)
```

### Styling

- Use Tailwind CSS utility classes
- Follow design system tokens from `index.css`
- Avoid inline styles unless absolutely necessary
- Use semantic color names (e.g., `bg-primary` not `bg-blue-500`)

**Example:**
```tsx
// Good ✅
<div className="bg-card text-card-foreground rounded-lg p-4">
  <h2 className="text-lg font-semibold mb-2">Title</h2>
</div>

// Bad ❌
<div style={{ background: '#ffffff', padding: '16px' }}>
  <h2 style={{ fontSize: '18px' }}>Title</h2>
</div>
```

## Testing Requirements

### Unit Tests

All calculation logic must have unit tests:

```typescript
// lib/calc.test.ts
import { calcMetrics } from './calc';

describe('calcMetrics', () => {
  it('should calculate total solids correctly', () => {
    const recipe = [
      { ing: mockIngredient, grams: 100 }
    ];
    const metrics = calcMetrics(recipe);
    expect(metrics.ts_add_pct).toBeCloseTo(35.2, 1);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Coverage Requirements

- Aim for 80%+ coverage on `lib/` functions
- All critical calculation paths must be tested
- Edge cases (zero values, extreme inputs) must be covered

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] Type checking passes (`npx tsc --noEmit`)
- [ ] Documentation updated (if needed)
- [ ] Commit messages follow convention
- [ ] Branch is up-to-date with `develop`

### Submitting

1. Push your branch to your fork
2. Open a PR against `develop` (not `main`)
3. Fill out the PR template completely
4. Link related issues (e.g., "Closes #123")
5. Request review from maintainers

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested these changes

## Screenshots (if applicable)
Add screenshots of UI changes

## Checklist
- [ ] Tests pass
- [ ] Documentation updated
- [ ] No breaking changes (or noted in description)
```

### Review Process

- Maintainers will review within 3-5 business days
- Address feedback promptly
- Be open to suggestions and alternatives
- Once approved, maintainers will merge

## Issue Guidelines

### Reporting Bugs

Use the bug report template and include:
- **Description**: Clear summary of the issue
- **Steps to Reproduce**: Numbered steps to trigger the bug
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: Browser, OS, Node version
- **Screenshots**: If applicable

### Feature Requests

Use the feature request template and include:
- **Problem**: What problem does this solve?
- **Proposed Solution**: How should it work?
- **Alternatives**: Other approaches considered
- **Additional Context**: Mockups, examples, etc.

### Questions & Discussions

- Use GitHub Discussions for questions
- Search existing issues before creating new ones
- Be specific and provide context
- Tag appropriately (bug, enhancement, question, etc.)

## Development Tips

### Debugging Calculations

Use the built-in debugger:
```typescript
import CalculationDebugger from '@/components/CalculationDebugger';

<CalculationDebugger recipe={recipe} metrics={metrics} />
```

### Hot Reload Issues

If hot reload stops working:
```bash
# Clear cache and restart
rm -rf node_modules/.vite
npm run dev
```

### Type Errors

Check generated types:
```bash
# Supabase types are auto-generated
# If out of sync, they'll be regenerated on next deploy
```

## Recognition

Contributors will be:
- Listed in `CONTRIBUTORS.md`
- Thanked in release notes
- Eligible for maintainer role (after consistent contributions)

## Questions?

- Open a [Discussion](https://github.com/YOUR_USERNAME/meetha-pitara-calculator/discussions)
- Reach out to maintainers
- Check `SETUP_GUIDE.md` for technical details

---

Thank you for contributing to MeethaPitara Calculator! 🍦

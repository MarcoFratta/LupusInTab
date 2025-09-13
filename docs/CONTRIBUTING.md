# Contributing to LupusInTab

Thank you for your interest in contributing to LupusInTab! This document provides guidelines and information for contributors.

## Table of Contents

- [Project Overview](#project-overview)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Contributing Guidelines](#contributing-guidelines)
- [Adding New Roles](#adding-new-roles)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Code Style](#code-style)

## Project Overview

LupusInTab is a Vue 3 + TypeScript implementation of the "Lupus in Tabula" (Werewolf) game. It's a web-based multiplayer game where players take on different roles and try to achieve their team's win condition.

### Key Features

- **Role-based Gameplay**: 25+ unique roles with different abilities
- **Real-time Multiplayer**: Play with friends in the same room
- **Modern UI**: Clean, responsive interface built with Vue 3
- **Extensible Architecture**: Easy to add new roles and features
- **Comprehensive API**: Well-documented APIs for role development

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/LupusInTab.git
   cd LupusInTab
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   Navigate to `http://localhost:5173`

## Project Structure

```
src/
├── components/           # Vue components
│   ├── game/            # Game-specific components
│   ├── roles/           # Role-specific components
│   └── ui/              # Reusable UI components
├── composables/         # Vue composables for state management
├── core/                # Core game engine
│   └── managers/        # Game state managers
├── roles/               # Role definitions
├── stores/              # Pinia stores
├── types.ts             # TypeScript type definitions
├── utils/               # Utility functions
│   ├── roleAPI.ts       # Role interaction API
│   ├── roleChecking.ts  # Role checking utilities
│   └── winConditions.ts # Win condition logic
└── config/              # Configuration files
```

## Contributing Guidelines

### Types of Contributions

We welcome several types of contributions:

1. **Bug Fixes**: Fix existing issues
2. **New Roles**: Add new roles to the game
3. **UI Improvements**: Enhance the user interface
4. **Documentation**: Improve documentation
5. **Performance**: Optimize game performance
6. **Features**: Add new game features

### Before You Start

1. **Check Issues**: Look for existing issues or create a new one
2. **Discuss**: For major changes, discuss your approach first
3. **Fork**: Fork the repository to your GitHub account
4. **Branch**: Create a feature branch from `main`

### Development Workflow

1. **Create Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow the code style guidelines
   - Add tests for new functionality
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   npm run test
   npm run lint
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new role X with Y ability"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Adding New Roles

See [ROLE_CREATION_GUIDE.md](./ROLE_CREATION_GUIDE.md) for detailed instructions on creating new roles.

### Quick Start for New Roles

1. **Create Role Definition** (`src/roles/yourRole.ts`)
2. **Create Prompt Component** (`src/components/roles/YourRole/YourRolePrompt.vue`)
3. **Create Resolve Component** (`src/components/roles/YourRole/YourRoleResolveDetails.vue`)
4. **Add to Roles Index** (`src/roles/index.ts`)
5. **Test Your Role**

## Testing

### Running Tests

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm run test src/__tests__/roles/yourRole.test.ts
```

### Test Structure

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test role interactions
- **Behavioral Tests**: Test complete game scenarios

### Writing Tests

```typescript
// Example role test
import { describe, it, expect } from 'vitest';
import { yourRole } from '../../roles/yourRole';

describe('YourRole', () => {
  it('should have correct properties', () => {
    expect(yourRole.id).toBe('yourRole');
    expect(yourRole.team).toBe('villaggio');
    expect(yourRole.actsAtNight).toBe('alive');
  });
});
```

## Pull Request Process

### Before Submitting

- [ ] Code follows the project's style guidelines
- [ ] Tests pass (`npm run test`)
- [ ] Linting passes (`npm run lint`)
- [ ] Documentation is updated
- [ ] Changes are tested manually

### PR Template

When creating a pull request, please include:

1. **Description**: What changes were made and why
2. **Type**: Bug fix, feature, documentation, etc.
3. **Testing**: How the changes were tested
4. **Screenshots**: For UI changes
5. **Breaking Changes**: If any

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and linting
2. **Code Review**: Maintainers review the code
3. **Testing**: Changes are tested in different scenarios
4. **Approval**: At least one maintainer must approve
5. **Merge**: Changes are merged to main branch

## Code Style

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types when possible
- Use proper type definitions
- Follow the existing type patterns

### Vue 3

- Use Composition API
- Use `<script setup>` syntax
- Follow Vue 3 best practices
- Use proper reactivity patterns

### General

- Use meaningful variable and function names
- Add comments for complex logic
- Follow the existing code structure
- Use consistent formatting

### Example Code Style

```typescript
// Good
export const myRole: RoleDef = {
  id: 'myRole',
  name: 'My Role',
  team: 'villaggio',
  description: 'Does something useful',
  longDescription: `My Role does something useful.

COME FUNZIONA:
• Does this thing
• Does that thing`,
  actsAtNight: 'alive',
  effectType: 'optional',
  numberOfUsage: 1,
  
  resolve(gameState: any, action: any) {
    // Implementation
  }
};

// Bad
export const myRole = {
  id: 'myRole',
  name: 'My Role',
  // Missing required properties
  resolve(gameState, action) {
    // Implementation
  }
};
```

## Getting Help

- **Issues**: Create an issue for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions
- **Documentation**: Check existing documentation first

## License

By contributing to LupusInTab, you agree that your contributions will be licensed under the same license as the project.

## Thank You

Thank you for contributing to LupusInTab! Your contributions help make the game better for everyone.


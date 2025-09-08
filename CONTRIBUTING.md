# 🤝 Contributing to Mini Dashboard

Thank you for your interest in contributing to the Mini Dashboard project! This document provides guidelines and information for contributors.

---

## 📋 Table of Contents

- [Code of Conduct](#-code-of-conduct)
- [Getting Started](#-getting-started)
- [Development Workflow](#-development-workflow)
- [Code Standards](#-code-standards)
- [Testing Guidelines](#-testing-guidelines)
- [Commit Guidelines](#-commit-guidelines)
- [Pull Request Process](#-pull-request-process)
- [Issue Reporting](#-issue-reporting)
- [Feature Requests](#-feature-requests)
- [Security Issues](#-security-issues)

---

## 📖 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, education, socio-economic status, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behaviors include:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behaviors include:**
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher
- **Git** for version control
- **VS Code** (recommended) with suggested extensions

### Initial Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/mini-dashboard.git
   cd mini-dashboard
   ```

2. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/original-owner/mini-dashboard.git
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Set up development environment**
   ```bash
   # Copy environment template
   cp .env.example .env.local
   
   # Edit with your local settings
   nano .env.local
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Project Structure

```
mini-dashboard/
├── .github/              # GitHub workflows and templates
├── docs/                 # Additional documentation
├── public/               # Static assets
├── src/                  # Source code
│   ├── components/       # React components
│   ├── contexts/         # React contexts
│   ├── hooks/           # Custom hooks
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── types/           # TypeScript definitions
│   └── lib/             # Utility functions
├── tests/               # Test files
└── package.json         # Project dependencies
```

---

## 🔄 Development Workflow

### Branch Strategy

We use **Git Flow** with the following branches:

- **`main`** - Production-ready code
- **`develop`** - Integration branch for features
- **`feature/*`** - Individual feature branches
- **`hotfix/*`** - Critical bug fixes
- **`release/*`** - Release preparation

### Feature Development

1. **Create feature branch**
   ```bash
   git checkout develop
   git pull upstream develop
   git checkout -b feature/your-feature-name
   ```

2. **Make changes and commit**
   ```bash
   # Make your changes
   git add .
   git commit -m "feat: add awesome feature"
   ```

3. **Keep your branch updated**
   ```bash
   git fetch upstream
   git rebase upstream/develop
   ```

4. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   # Create pull request on GitHub
   ```

### Development Commands

```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Testing
npm run test
npm run test:watch
npm run test:coverage

# Build
npm run build
npm run preview
```

---

## 📝 Code Standards

### TypeScript Guidelines

1. **Use strict TypeScript**
   ```typescript
   // ✅ Good - Explicit types
   interface UserProps {
     user: User;
     onEdit: (id: number) => void;
   }
   
   // ❌ Bad - Any types
   function handleUser(user: any) {
     // ...
   }
   ```

2. **Prefer interfaces over types for objects**
   ```typescript
   // ✅ Good
   interface User {
     id: number;
     name: string;
   }
   
   // ❌ Avoid for simple objects
   type User = {
     id: number;
     name: string;
   }
   ```

3. **Use utility types when appropriate**
   ```typescript
   // ✅ Good
   type CreateUserData = Omit<User, 'id' | 'createdAt'>;
   type UserUpdate = Partial<Pick<User, 'name' | 'email'>>;
   ```

### React Component Guidelines

1. **Use functional components with hooks**
   ```typescript
   // ✅ Good
   const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
     const [isLoading, setIsLoading] = useState(false);
     
     return (
       <div className="user-card">
         {/* component JSX */}
       </div>
     );
   };
   ```

2. **Prop interface naming**
   ```typescript
   // ✅ Good
   interface UserCardProps {
     user: User;
     onEdit: (id: number) => void;
   }
   
   const UserCard: React.FC<UserCardProps> = ({ user, onEdit }) => {
     // ...
   };
   ```

3. **Use custom hooks for logic**
   ```typescript
   // ✅ Good - Extract logic to custom hook
   const useUserForm = (initialUser?: User) => {
     const [formData, setFormData] = useState(initialUser || {});
     const [errors, setErrors] = useState({});
     
     return { formData, errors, handleChange, handleSubmit };
   };
   ```

### Styling Guidelines

1. **Use Tailwind CSS classes**
   ```typescript
   // ✅ Good
   <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
     Click me
   </button>
   ```

2. **Use component variants with cva**
   ```typescript
   // ✅ Good
   const buttonVariants = cva(
     'inline-flex items-center justify-center rounded-md font-medium',
     {
       variants: {
         variant: {
           primary: 'bg-blue-500 text-white hover:bg-blue-600',
           secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
         },
       },
     }
   );
   ```

3. **Responsive design first**
   ```typescript
   // ✅ Good
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
     {/* content */}
   </div>
   ```

### File Organization

1. **Component file structure**
   ```
   UserCard/
   ├── index.ts          # Export barrel
   ├── UserCard.tsx      # Main component
   ├── UserCard.test.tsx # Tests
   └── UserCard.stories.tsx # Storybook stories (if applicable)
   ```

2. **Import order**
   ```typescript
   // ✅ Good import order
   import React from 'react';
   import { useState, useEffect } from 'react';
   
   import { Button } from '@/components/ui/Button';
   import { useUsers } from '@/hooks/useUsers';
   import { User } from '@/types/user';
   
   import './UserCard.css'; // If needed
   ```

---

## 🧪 Testing Guidelines

### Unit Testing

1. **Test component behavior, not implementation**
   ```typescript
   // ✅ Good
   test('should display user information', () => {
     render(<UserCard user={mockUser} />);
     expect(screen.getByText(mockUser.name)).toBeInTheDocument();
     expect(screen.getByText(mockUser.email)).toBeInTheDocument();
   });
   
   // ❌ Bad - Testing implementation details
   test('should set isLoading state', () => {
     const { result } = renderHook(() => useState(false));
     // ...
   });
   ```

2. **Use meaningful test descriptions**
   ```typescript
   // ✅ Good
   describe('UserForm', () => {
     test('should validate required fields and show error messages', () => {
       // ...
     });
     
     test('should submit form with valid data', () => {
       // ...
     });
   });
   ```

3. **Test edge cases and error states**
   ```typescript
   test('should handle API error gracefully', async () => {
     server.use(
       rest.post('/api/users', (req, res, ctx) => {
         return res(ctx.status(500), ctx.json({ error: 'Server error' }));
       })
     );
     
     render(<UserForm />);
     // Test error handling
   });
   ```

### Testing Best Practices

- **Arrange, Act, Assert** pattern
- **Mock external dependencies**
- **Test user interactions**, not internal state
- **Use data-testid** for complex queries
- **Test accessibility** with jest-axe

### Coverage Requirements

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

---

## 📝 Commit Guidelines

We follow [Conventional Commits](https://conventionalcommits.org/) specification.

### Commit Message Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, missing semi-colons, etc)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **ci**: CI/CD changes

### Examples

```bash
# Good commit messages
git commit -m "feat: add user search functionality"
git commit -m "fix: resolve login form validation issue"
git commit -m "docs: update API documentation"
git commit -m "test: add unit tests for UserForm component"

# Bad commit messages
git commit -m "fix stuff"
git commit -m "update"
git commit -m "changes"
```

### Commit Best Practices

1. **Use imperative mood** ("add" not "added" or "adds")
2. **Keep first line under 50 characters**
3. **Separate subject from body** with blank line
4. **Explain what and why**, not how
5. **Reference issues** when applicable

---

## 🔄 Pull Request Process

### Before Creating PR

1. **Ensure all tests pass**
   ```bash
   npm run test
   npm run lint
   npm run type-check
   npm run build
   ```

2. **Update documentation** if needed

3. **Add tests** for new features

4. **Update CHANGELOG.md** for significant changes

### PR Template

When creating a pull request, please include:

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
```

### PR Review Process

1. **Automated checks** must pass
2. **At least one approval** required
3. **Address all feedback** before merging
4. **Squash and merge** preferred

---

## 🐛 Issue Reporting

### Bug Reports

When reporting bugs, please include:

1. **Bug description** - Clear and concise description
2. **Reproduction steps** - Step-by-step instructions
3. **Expected behavior** - What you expected to happen
4. **Actual behavior** - What actually happened
5. **Environment** - Browser, OS, Node version, etc.
6. **Screenshots** - If applicable
7. **Additional context** - Any other relevant information

### Bug Report Template

```markdown
**Bug Description**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected Behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. iOS]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]
 - Node version: [e.g. 18.16.0]

**Additional Context**
Add any other context about the problem here.
```

---

## 💡 Feature Requests

### Before Submitting

1. **Check existing issues** to avoid duplicates
2. **Consider the scope** - Is this aligned with project goals?
3. **Think about implementation** - Is this technically feasible?

### Feature Request Template

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is. Ex. I'm always frustrated when [...]

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.

**Implementation Ideas**
If you have ideas about how to implement this feature, please share them.
```

---

## 🔒 Security Issues

### Reporting Security Vulnerabilities

**DO NOT** create public issues for security vulnerabilities.

Instead:
1. **Email** security concerns to: [security@example.com]
2. **Include detailed description** of the vulnerability
3. **Provide steps to reproduce** if possible
4. **Allow time for response** before public disclosure

### Security Best Practices

- **Never commit secrets** to version control
- **Use environment variables** for sensitive data
- **Follow security guidelines** in our documentation
- **Keep dependencies updated**

---

## 🎯 Development Tips

### VS Code Configuration

Recommended extensions:

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

### Environment Setup

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  }
}
```

### Debugging

1. **Use React Developer Tools**
2. **Enable TypeScript strict mode**
3. **Use console.debug for development logging**
4. **Leverage VS Code debugger** for complex issues

---

## 📚 Additional Resources

### Documentation
- [Architecture Guide](./ARCHITECTURE.md)
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)

### External Resources
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Testing Library](https://testing-library.com/)

### Community
- **GitHub Discussions** - For questions and general discussion
- **GitHub Issues** - For bug reports and feature requests
- **Discord** - Real-time community chat (if available)

---

## 🙏 Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub contributors** page

---

Thank you for contributing to Mini Dashboard! Your efforts help make this project better for everyone. 🚀

---

*This contributing guide is a living document. Please suggest improvements by opening an issue or pull request.*

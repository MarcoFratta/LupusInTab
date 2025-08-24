## 🚀 Development Workflow

### Pull Request Process

This project uses a **Pull Request workflow** to ensure code quality:

1. **Create a feature branch** from `main` or `develop`
2. **Make your changes** and test locally
3. **Push to your branch** and create a Pull Request
4. **CI checks run automatically**:
   - ✅ Tests must pass
   - ✅ Build must succeed  
   - ✅ Security audit must pass
5. **Get code review approval**
6. **Merge when ready**

### Local Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Build project
npm run build

# Development server
npm run dev
```

### CI/CD Pipeline

The project includes GitHub Actions workflows that:

- **Run tests** on every PR and push
- **Check builds** for errors
- **Audit security** vulnerabilities
- **Block merges** if any checks fail

See [`.github/BRANCH_PROTECTION.md`](.github/BRANCH_PROTECTION.md) for detailed setup instructions.

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

All tests must pass before code can be merged to main branches.

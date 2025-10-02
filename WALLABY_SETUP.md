# Wallaby Setup for BirdGuide NX Workspace

This workspace is configured to work with Wallaby.js for fast, real-time testing.

## Configuration Files

- `wallaby.js` - Main configuration for the entire workspace
- `wallaby.frontend.js` - Frontend-specific configuration (Vitest + React)
- `wallaby.backend.js` - Backend-specific configuration (Jest + NestJS)

## Setup Instructions

### 1. Install Wallaby Extension

Install the Wallaby extension for your IDE:
- **VS Code**: Search for "Wallaby.js" in the Extensions marketplace
- **WebStorm**: Built-in support (no extension needed)
- **Other IDEs**: Check [Wallaby.js documentation](https://wallabyjs.com/)

### 2. Configure Wallaby

#### Option A: Use Main Configuration (Recommended)
- Open Wallaby settings in your IDE
- Set the configuration file to `wallaby.js`
- This will handle both frontend and backend tests automatically

#### Option B: Use Specific Configurations
- For frontend-only testing: Use `wallaby.frontend.js`
- For backend-only testing: Use `wallaby.backend.js`

### 3. Start Wallaby

1. Open your IDE
2. Start Wallaby (usually via command palette or status bar)
3. Wallaby will automatically detect and run your tests

## Features

### Real-time Testing
- Tests run automatically as you type
- Instant feedback on test results
- Visual indicators for passing/failing tests

### Intelligent Test Selection
- Only runs tests affected by your changes
- Skips unrelated tests for faster execution
- Parallel test execution

### Coverage Visualization
- Real-time coverage indicators in your code
- Shows which lines are covered/uncovered
- Helps identify untested code paths

### Debugging Support
- Set breakpoints directly in your code
- Step through tests in real-time
- Inspect variables and call stacks

## Test Frameworks Supported

### Frontend (Vitest + React Testing Library)
- **Location**: `apps/frontend/tests/`
- **Configuration**: `wallaby.frontend.js`
- **Environment**: jsdom (simulates browser environment)
- **Features**: React component testing, user interactions, async operations

### Backend (Jest + NestJS)
- **Location**: `apps/api/src/`
- **Configuration**: `wallaby.backend.js`
- **Environment**: Node.js
- **Features**: Unit tests, integration tests, service testing

### Shared Types (Jest)
- **Location**: `libs/shared-types/src/`
- **Configuration**: `wallaby.js`
- **Environment**: Node.js
- **Features**: Type validation, utility function testing

## Troubleshooting

### Common Issues

1. **Tests not running**
   - Check that Wallaby is started
   - Verify configuration file path
   - Check console for error messages

2. **TypeScript compilation errors**
   - Ensure `@swc/core` is installed
   - Check TypeScript configuration
   - Verify file paths in configuration

3. **Environment variable issues**
   - Check `setup` function in configuration
   - Verify environment variable names
   - Ensure proper mocking

4. **Performance issues**
   - Adjust `workers` configuration
   - Check file patterns (exclude unnecessary files)
   - Monitor memory usage

### Debug Mode

Enable debug mode by setting `debug: true` in your Wallaby configuration. This will provide detailed logging information.

## Performance Tips

1. **Exclude unnecessary files** from the `files` array
2. **Use specific file patterns** to avoid running unrelated tests
3. **Adjust worker count** based on your machine's capabilities
4. **Monitor memory usage** and adjust `NODE_OPTIONS` if needed

## Integration with TDD Workflow

Wallaby is perfect for Test-Driven Development:

1. **Red Phase**: Write a failing test - Wallaby shows it in red
2. **Green Phase**: Write minimal code - Wallaby shows it turn green
3. **Refactor Phase**: Improve code - Wallaby keeps tests green

The real-time feedback makes TDD much more efficient and enjoyable.

## Commands

While Wallaby handles most testing automatically, you can still use these commands for CI/CD or manual testing:

```bash
# Run all tests
npm run test

# Run frontend tests only
npm run test:frontend

# Run backend tests only
npm run test:api
```

## Support

- [Wallaby.js Documentation](https://wallabyjs.com/docs/)
- [Wallaby.js GitHub](https://github.com/wallabyjs)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=WallabyJs.wallaby-vscode)

# Wallaby Setup for BirdGuide NX Workspace

This workspace is configured to work with Wallaby.js for fast, real-time testing.

## Configuration Files

- `wallaby.js` - Main configuration for the entire workspace (Jest + NestJS backend)
- `package.json` - Contains Wallaby configuration for auto-detection

## Setup Instructions

### 1. Install Wallaby Extension

Install the Wallaby extension for your IDE:
- **VS Code**: Search for "Wallaby.js" in the Extensions marketplace
- **WebStorm**: Built-in support (no extension needed)
- **Other IDEs**: Check [Wallaby.js documentation](https://wallabyjs.com/)

### 2. Configure Wallaby

Wallaby is configured to auto-detect Jest for backend tests:
- The main configuration is in `wallaby.js`
- Auto-detection is enabled via `package.json` configuration
- Wallaby automatically runs Jest tests in the `apps/api/src/` directory

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

### Backend (Jest + NestJS)
- **Location**: `apps/api/src/`
- **Configuration**: `wallaby.js`
- **Environment**: Node.js
- **Features**: Unit tests, integration tests, service testing
- **Test Files**: `*.spec.ts` and `*.test.ts`

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
nx run-many --target=test --all

# Run backend tests only
nx test api

# Run frontend tests only
nx test frontend
```

## Support

- [Wallaby.js Documentation](https://wallabyjs.com/docs/)
- [Wallaby.js GitHub](https://github.com/wallabyjs)
- [VS Code Extension](https://marketplace.visualstudio.com/items?itemName=WallabyJs.wallaby-vscode)

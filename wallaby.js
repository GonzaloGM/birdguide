module.exports = function () {
  return {
    // Files to include in the test run
    files: [
      // Shared types library
      'libs/shared-types/src/**/*.ts',
      '!libs/shared-types/src/**/*.test.ts',
      '!libs/shared-types/src/**/*.spec.ts',

      // Backend API files
      'apps/api/src/**/*.ts',
      '!apps/api/src/**/*.test.ts',
      '!apps/api/src/**/*.spec.ts',

      // Frontend app files
      'apps/frontend/app/**/*.{ts,tsx}',
      '!apps/frontend/app/**/*.test.{ts,tsx}',
      '!apps/frontend/app/**/*.spec.{ts,tsx}',
      '!apps/frontend/tests/**/*',

      // Configuration files
      'tsconfig*.json',
      'jest.config.ts',
      'vitest.workspace.ts',
      'apps/frontend/vite.config.ts',
      'apps/api/jest.config.ts',

      // Package files
      'package.json',
      'apps/frontend/package.json',
      'apps/api/package.json',
    ],

    // Test files to run
    tests: [
      'apps/api/src/**/*.test.ts',
      'apps/api/src/**/*.spec.ts',
      'apps/frontend/tests/**/*.test.{ts,tsx}',
      'apps/frontend/tests/**/*.spec.{ts,tsx}',
      'libs/shared-types/src/**/*.test.ts',
      'libs/shared-types/src/**/*.spec.ts',
    ],

    // Test framework - Wallaby will auto-detect based on file patterns
    testFramework: 'auto',

    // Environment setup
    env: {
      type: 'node',
      params: {
        env: 'NODE_OPTIONS=--max-old-space-size=4096',
      },
    },

    // Setup function for global test configuration
    setup: function () {
      // Global test setup
      const path = require('path');

      // Set up environment variables
      process.env.NODE_ENV = 'test';
      process.env.VITE_API_BASE_URL = 'http://localhost:3000/api';

      // Add any global mocks or setup here
      if (typeof global !== 'undefined') {
        // Mock fetch for frontend tests
        global.fetch = global.fetch || require('node-fetch');
      }
    },

    // Debugging configuration
    debug: true,

    // Coverage configuration
    lowCoverageThreshold: 80,

    // Performance settings
    workers: {
      initial: 2,
      regular: 2,
      recycle: true,
    },

    // File patterns for different test types
    patterns: {
      // Frontend tests (Vitest)
      'apps/frontend/**/*.test.{ts,tsx}': {
        testFramework: 'vitest',
        env: {
          type: 'jsdom',
        },
      },

      // Backend tests (Jest)
      'apps/api/**/*.{test,spec}.ts': {
        testFramework: 'jest',
        env: {
          type: 'node',
        },
      },

      // Shared types tests (Jest)
      'libs/shared-types/**/*.{test,spec}.ts': {
        testFramework: 'jest',
        env: {
          type: 'node',
        },
      },
    },

    // Preprocessors for different file types
    preprocessors: {
      '**/*.ts': (file) => {
        // TypeScript preprocessing
        return require('@swc/core').transformSync(file.content, {
          filename: file.path,
          jsc: {
            parser: {
              syntax: 'typescript',
              decorators: true,
              dynamicImport: true,
            },
            transform: {
              decoratorMetadata: true,
              legacyDecorator: true,
            },
            target: 'es2020',
            module: {
              type: 'commonjs',
            },
          },
          module: {
            type: 'commonjs',
          },
        }).code;
      },

      '**/*.tsx': (file) => {
        // TypeScript JSX preprocessing
        return require('@swc/core').transformSync(file.content, {
          filename: file.path,
          jsc: {
            parser: {
              syntax: 'typescript',
              tsx: true,
              decorators: true,
              dynamicImport: true,
            },
            transform: {
              decoratorMetadata: true,
              legacyDecorator: true,
              react: {
                pragma: 'React.createElement',
                pragmaFrag: 'React.Fragment',
                throwIfNamespace: true,
                development: false,
                useBuiltins: false,
              },
            },
            target: 'es2020',
            module: {
              type: 'commonjs',
            },
          },
          module: {
            type: 'commonjs',
          },
        }).code;
      },
    },

    // Wallaby-specific settings
    delays: {
      run: 500,
    },

    // Reporters
    reporters: ['default', 'html'],
  };
};

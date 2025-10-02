module.exports = function () {
  return {
    // Files to include for backend testing
    files: [
      // Shared types
      'libs/shared-types/src/**/*.ts',
      '!libs/shared-types/src/**/*.test.ts',
      '!libs/shared-types/src/**/*.spec.ts',

      // Backend API files
      'apps/api/src/**/*.ts',
      '!apps/api/src/**/*.test.ts',
      '!apps/api/src/**/*.spec.ts',

      // Configuration files
      'tsconfig*.json',
      'apps/api/jest.config.ts',
      'apps/api/.spec.swcrc',

      // Package files
      'package.json',
      'apps/api/package.json',
    ],

    // Test files
    tests: ['apps/api/src/**/*.test.ts', 'apps/api/src/**/*.spec.ts'],

    // Use Jest for backend tests
    testFramework: 'jest',

    // Environment setup for Node.js
    env: {
      type: 'node',
      params: {
        env: 'NODE_OPTIONS=--max-old-space-size=4096',
      },
    },

    // Setup function
    setup: function () {
      // Set up environment variables
      process.env.NODE_ENV = 'test';

      // Add any global mocks or setup here
      if (typeof global !== 'undefined') {
        // Mock any global dependencies if needed
      }
    },

    // Debugging
    debug: true,

    // Coverage
    lowCoverageThreshold: 80,

    // Performance
    workers: {
      initial: 2,
      regular: 2,
      recycle: true,
    },

    // Preprocessors
    preprocessors: {
      '**/*.ts': (file) => {
        // Use SWC for TypeScript compilation (same as your Jest config)
        const swcJestConfig = {
          swcrc: false,
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
        };

        return require('@swc/core').transformSync(file.content, {
          filename: file.path,
          ...swcJestConfig,
        }).code;
      },
    },

    // Delays
    delays: {
      run: 500,
    },
  };
};

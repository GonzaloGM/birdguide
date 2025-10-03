module.exports = function (wallaby) {
  return {
    // Use auto-detection but only for Jest
    autoDetect: ['jest'],

    files: [
      'apps/api/src/**/*.ts',
      '!apps/api/src/**/*.test.ts',
      '!apps/api/src/**/*.spec.ts',
    ],

    tests: ['apps/api/src/**/*.test.ts', 'apps/api/src/**/*.spec.ts'],

    env: {
      type: 'node',
    },

    compilers: {
      '**/*.ts': wallaby.compilers.typeScript({
        target: 'es2017',
        module: 'commonjs',
        decorators: true,
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      }),
    },
  };
};

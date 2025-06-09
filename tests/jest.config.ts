import type { Config } from 'jest';
import { defaults } from 'jest-config';

const config: Config = {
  preset: 'ts-jest',
  rootDir: '../',
  transform: {
    '^.+\\.(ts|html)$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.html$',
        useESM: true,
      },
    ],
  },
  testEnvironment: 'jest-preset-angular',
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.jest.ts'],
  verbose: true,
  detectLeaks: true, // Detect memory leaks in tests
  detectOpenHandles: true, // Detect open handles that may prevent Jest from exiting
  forceExit: false, // Do not force Jest to exit, allowing for proper cleanup
};

export default config;

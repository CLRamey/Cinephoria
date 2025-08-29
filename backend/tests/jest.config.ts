import type { Config } from 'jest';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

const config: Config = {
  displayName: 'backend',
  testEnvironment: 'node',
  preset: 'ts-jest',
  rootDir: '../',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }],
  },
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
  setupFiles: ['dotenv/config'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
  detectLeaks: false,
  detectOpenHandles: true,
  forceExit: false,
};

export default config;

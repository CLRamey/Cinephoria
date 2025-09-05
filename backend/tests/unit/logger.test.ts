import { log, logerror, logwarn } from '../../src/utils/logger';

describe('Logger utilities', () => {
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe('log()', () => {
    it('calls console.log in development', () => {
      Object.defineProperty(process, 'env', {
        value: { NODE_ENV: 'development' },
        configurable: true,
      });

      log('dev log');
      expect(consoleLogSpy).toHaveBeenCalledWith('dev log');
    });

    it('does not call console.log in production', () => {
      Object.defineProperty(process, 'env', {
        value: { NODE_ENV: 'production' },
        configurable: true,
      });

      log('prod log');
      expect(consoleLogSpy).not.toHaveBeenCalled();
    });
  });

  describe('logwarn()', () => {
    it('calls console.warn in development', () => {
      Object.defineProperty(process, 'env', {
        value: { NODE_ENV: 'development' },
        configurable: true,
      });

      logwarn('dev warn');
      expect(consoleWarnSpy).toHaveBeenCalledWith('dev warn');
    });

    it('does not call console.warn in production', () => {
      Object.defineProperty(process, 'env', {
        value: { NODE_ENV: 'production' },
        configurable: true,
      });

      logwarn('prod warn');
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('logerror()', () => {
    it('calls console.error in development', () => {
      Object.defineProperty(process, 'env', {
        value: { NODE_ENV: 'development' },
        configurable: true,
      });

      logerror('dev error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('dev error');
    });

    it('does not call console.error in production', () => {
      Object.defineProperty(process, 'env', {
        value: { NODE_ENV: 'production' },
        configurable: true,
      });

      logerror('prod error');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
});

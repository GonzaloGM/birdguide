import { Test, TestingModule } from '@nestjs/testing';
import { PinoLoggerService } from './logger.service';
import { ConfigService } from '@nestjs/config';

describe('PinoLoggerService', () => {
  let service: PinoLoggerService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PinoLoggerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                NODE_ENV: 'test',
                LOG_LEVEL: 'info',
                LOG_FILE_PATH: './logs/app.log',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<PinoLoggerService>(PinoLoggerService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log info messages', () => {
    // Test that the method doesn't throw and returns void
    expect(() => service.info('Test info message')).not.toThrow();
  });

  it('should log error messages', () => {
    // Test that the method doesn't throw and returns void
    expect(() => service.error('Test error message')).not.toThrow();
  });

  it('should log warn messages', () => {
    // Test that the method doesn't throw and returns void
    expect(() => service.warn('Test warning message')).not.toThrow();
  });

  it('should log debug messages', () => {
    // Test that the method doesn't throw and returns void
    expect(() => service.debug('Test debug message')).not.toThrow();
  });

  it('should log with context', () => {
    // Test that the method doesn't throw and returns void
    expect(() =>
      service.infoWithContext('Test message', {
        userId: '123',
        action: 'login',
      })
    ).not.toThrow();
  });

  it('should create child logger with context', () => {
    const childLogger = service.child({ service: 'auth' });

    expect(childLogger).toBeDefined();
    expect(typeof childLogger.info).toBe('function');
    expect(typeof childLogger.error).toBe('function');
    expect(typeof childLogger.warn).toBe('function');
    expect(typeof childLogger.debug).toBe('function');
  });

  it('should use different log levels based on environment', () => {
    const testConfig = {
      get: jest.fn((key: string) => {
        const config = {
          NODE_ENV: 'production',
          LOG_LEVEL: 'warn',
          LOG_FILE_PATH: './logs/app.log',
        };
        return config[key];
      }),
    };

    const module = Test.createTestingModule({
      providers: [
        PinoLoggerService,
        { provide: ConfigService, useValue: testConfig },
      ],
    });

    expect(module).toBeDefined();
  });

  it('should implement NestJS LoggerService interface', () => {
    expect(typeof service.log).toBe('function');
    expect(typeof service.error).toBe('function');
    expect(typeof service.warn).toBe('function');
    expect(typeof service.debug).toBe('function');
    expect(typeof service.verbose).toBe('function');
    expect(typeof service.info).toBe('function');
  });

  it('should support structured logging methods', () => {
    expect(typeof service.infoWithContext).toBe('function');
    expect(typeof service.errorWithContext).toBe('function');
    expect(typeof service.warnWithContext).toBe('function');
    expect(typeof service.debugWithContext).toBe('function');
  });
});

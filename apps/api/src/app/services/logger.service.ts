import {
  Injectable,
  LoggerService as NestLoggerService,
  LogLevel,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pino from 'pino';
import { join } from 'path';
import { createWriteStream } from 'fs';

@Injectable()
export class PinoLoggerService implements NestLoggerService {
  private readonly logger: pino.Logger;

  constructor(private readonly configService: ConfigService) {
    const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
    const logLevel = this.configService.get<string>('LOG_LEVEL', 'info');
    const logFilePath = this.configService.get<string>(
      'LOG_FILE_PATH',
      './logs/app.log'
    );

    // Create logs directory if it doesn't exist
    const logDir = join(process.cwd(), 'logs');
    require('fs').mkdirSync(logDir, { recursive: true });

    // Create file stream with daily rotation
    // This creates a new log file each day (app-YYYY-MM-DD.log)
    // For production, consider using logrotate or a more sophisticated solution
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    const dailyLogFile = join(logDir, `app-${today}.log`);
    const fileStream = createWriteStream(dailyLogFile, { flags: 'a' });

    // Configure Pino logger
    const pinoConfig: pino.LoggerOptions = {
      level: logLevel,
      formatters: {
        level: (label) => {
          return { level: label };
        },
      },
      timestamp: pino.stdTimeFunctions.isoTime,
    };

    // Create transports based on environment
    if (nodeEnv === 'production') {
      // Production: JSON to file and console
      this.logger = pino(
        pinoConfig,
        pino.multistream([{ stream: fileStream }, { stream: process.stdout }])
      );
    } else {
      // Development: Pretty print to console and JSON to file
      const prettyStream = pino.destination({
        dest: process.stdout.fd,
        sync: false,
      });

      // Use pino-pretty for console output in development
      const prettyTransport = pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          singleLine: false,
        },
      });

      this.logger = pino(
        pinoConfig,
        pino.multistream([{ stream: fileStream }, { stream: prettyTransport }])
      );
    }
  }

  // NestJS LoggerService interface methods
  setLogLevels(levels: LogLevel[]): void {
    // Pino doesn't support dynamic log levels like NestJS built-in logger
    // This is a no-op for compatibility
  }

  setContext(context: string): void {
    // Pino handles context through child loggers
    // This is a no-op for compatibility
  }

  log(message: string, context?: string): void {
    this.info(message, context);
  }

  error(message: string, trace?: string, context?: string): void {
    this.logger.error({ trace, context }, message);
  }

  warn(message: string, context?: string): void {
    this.logger.warn({ context }, message);
  }

  debug(message: string, context?: string): void {
    this.logger.debug({ context }, message);
  }

  verbose(message: string, context?: string): void {
    this.logger.trace({ context }, message);
  }

  info(message: string, context?: string): void {
    this.logger.info({ context }, message);
  }

  // Custom methods for structured logging
  infoWithContext(message: string, context: Record<string, any>): void {
    this.logger.info(context, message);
  }

  errorWithContext(message: string, context: Record<string, any>): void {
    this.logger.error(context, message);
  }

  warnWithContext(message: string, context: Record<string, any>): void {
    this.logger.warn(context, message);
  }

  debugWithContext(message: string, context: Record<string, any>): void {
    this.logger.debug(context, message);
  }

  // Create child logger with default context
  child(defaultContext: Record<string, any>): LoggerService {
    const childLogger = this.logger.child(defaultContext);

    return {
      log: (message: string, context?: string) =>
        childLogger.info({ context }, message),
      error: (message: string, trace?: string, context?: string) =>
        childLogger.error({ trace, context }, message),
      warn: (message: string, context?: string) =>
        childLogger.warn({ context }, message),
      debug: (message: string, context?: string) =>
        childLogger.debug({ context }, message),
      verbose: (message: string, context?: string) =>
        childLogger.trace({ context }, message),
      info: (message: string, context?: string) =>
        childLogger.info({ context }, message),
      infoWithContext: (message: string, context: Record<string, any>) =>
        childLogger.info(context, message),
      errorWithContext: (message: string, context: Record<string, any>) =>
        childLogger.error(context, message),
      warnWithContext: (message: string, context: Record<string, any>) =>
        childLogger.warn(context, message),
      debugWithContext: (message: string, context: Record<string, any>) =>
        childLogger.debug(context, message),
      child: (defaultContext: Record<string, any>) =>
        this.child(defaultContext),
    } as LoggerService;
  }
}

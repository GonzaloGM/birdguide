import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLoggerService } from './logger.service';

export const createLogger = (configService: ConfigService): LoggerService => {
  return new PinoLoggerService(configService);
};

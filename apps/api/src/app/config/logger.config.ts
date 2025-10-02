import { ConfigService } from '@nestjs/config';

export const getLoggerConfig = (configService: ConfigService) => {
  return {
    level: configService.get<string>('LOG_LEVEL', 'info'),
    filePath: configService.get<string>('LOG_FILE_PATH', './logs/app.log'),
    environment: configService.get<string>('NODE_ENV', 'development'),
  };
};

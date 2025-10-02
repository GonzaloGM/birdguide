import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { getAuth0Config } from './auth/auth0.config';
import { getDatabaseConfig } from './config/database.config';
import { getJwtConfig } from './config/jwt.config';
import { UserEntity } from './entities/user.entity';
import { SpeciesEntity } from './entities/species.entity';
import { SpeciesCommonNameEntity } from './entities/species-common-name.entity';
import { UserRepository } from './repositories/user.repository';
import { SpeciesRepository } from './repositories/species.repository';
import { SpeciesService } from './species/species.service';
import { SpeciesController } from './species/species.controller';
import { PinoLoggerService } from './services/logger.service';
import { createLogger } from './services/logger.factory';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...getDatabaseConfig(),
      entities: [UserEntity, SpeciesEntity, SpeciesCommonNameEntity],
      synchronize: process.env.NODE_ENV !== 'production', // Only for development
    }),
    TypeOrmModule.forFeature([
      UserEntity,
      SpeciesEntity,
      SpeciesCommonNameEntity,
    ]),
    JwtModule.register({
      ...getJwtConfig(),
      signOptions: {
        expiresIn: '1h',
        issuer: getAuth0Config().audience,
      },
    }),
  ],
  controllers: [AppController, AuthController, SpeciesController],
  providers: [
    AppService,
    AuthService,
    UserRepository,
    SpeciesRepository,
    SpeciesService,
    PinoLoggerService,
    {
      provide: 'LOGGER',
      useFactory: (configService: ConfigService) => createLogger(configService),
      inject: [ConfigService],
    },
  ],
})
export class AppModule {}

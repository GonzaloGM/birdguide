import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      ...getDatabaseConfig(),
      entities: [UserEntity],
      synchronize: process.env.NODE_ENV !== 'production', // Only for development
    }),
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register({
      ...getJwtConfig(),
      signOptions: {
        expiresIn: '1h',
        issuer: getAuth0Config().audience,
      },
    }),
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService, UserRepository],
})
export class AppModule {}

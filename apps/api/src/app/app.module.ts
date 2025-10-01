import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { auth0Config } from './auth/auth0.config';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_DATABASE || 'birdguide',
      entities: [UserEntity],
      synchronize: process.env.NODE_ENV !== 'production', // Only for development
    }),
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-jwt-secret',
      signOptions: { 
        expiresIn: '1h',
        issuer: auth0Config.audience,
      },
    }),
  ],
  controllers: [AppController, AuthController],
  providers: [AuthService, UserRepository],
})
export class AppModule {}

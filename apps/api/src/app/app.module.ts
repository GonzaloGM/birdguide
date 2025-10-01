import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { auth0Config } from './auth/auth0.config';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-jwt-secret',
      signOptions: { 
        expiresIn: '1h',
        issuer: auth0Config.audience,
      },
    }),
  ],
  controllers: [AppController, AuthController],
  providers: [AuthService],
})
export class AppModule {}

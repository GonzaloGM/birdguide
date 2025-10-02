import { Controller, Post, Get, Req, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PinoLoggerService } from '../services/logger.service';
import {
  AuthResponse,
  User,
  ApiResponse,
  RegisterRequest,
  LoginRequest,
} from '@birdguide/shared-types';

type Auth0CallbackData = {
  code: string;
  state: string;
};

// RegisterRequest and LoginRequest are now imported from shared-types

type AuthenticatedRequest = {
  user: {
    sub: string;
  };
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly logger: PinoLoggerService
  ) {}

  @Post('register')
  async register(
    @Body() registerRequest: RegisterRequest
  ): Promise<ApiResponse<AuthResponse>> {
    this.logger.infoWithContext('Registration request received', {
      email: registerRequest.email,
      username: registerRequest.username,
    });

    try {
      const authResponse = await this.authService.register(registerRequest);

      this.logger.infoWithContext('Registration successful', {
        userId: authResponse.user.id,
        email: authResponse.user.email,
      });

      return {
        success: true,
        data: authResponse,
      };
    } catch (error) {
      this.logger.errorWithContext('Registration failed', {
        email: registerRequest.email,
        username: registerRequest.username,
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
        message:
          error.message === 'User with this email already exists'
            ? 'Email already exists'
            : error.message === 'Username is already taken'
            ? 'Username is already taken'
            : 'Registration failed',
      };
    }
  }

  @Post('login')
  async login(
    @Body() loginRequest: LoginRequest
  ): Promise<ApiResponse<AuthResponse>> {
    this.logger.infoWithContext('Login request received', {
      emailOrUsername: loginRequest.emailOrUsername,
    });

    try {
      const authResponse = await this.authService.login(loginRequest);

      this.logger.infoWithContext('Login successful', {
        userId: authResponse.user.id,
        email: authResponse.user.email,
      });

      return {
        success: true,
        data: authResponse,
      };
    } catch (error) {
      this.logger.errorWithContext('Login failed', {
        emailOrUsername: loginRequest.emailOrUsername,
        error: error.message,
      });

      return {
        success: false,
        error: error.message,
        message: 'Login failed',
      };
    }
  }

  @Post('callback')
  async handleAuth0Callback(
    @Body() auth0CallbackData: Auth0CallbackData
  ): Promise<ApiResponse<AuthResponse>> {
    const authResponse = await this.authService.handleAuth0Callback(
      auth0CallbackData
    );

    return {
      success: true,
      data: authResponse,
    };
  }

  @Get('me')
  async getCurrentUser(
    @Req() req: AuthenticatedRequest
  ): Promise<ApiResponse<User>> {
    const user = await this.authService.getCurrentUser(req.user.sub);

    return {
      success: true,
      data: user,
    };
  }

  @Post('logout')
  async logout(
    @Req() req: AuthenticatedRequest
  ): Promise<ApiResponse<{ message: string }>> {
    await this.authService.logout(req.user.sub);

    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}

import { Controller, Post, Get, Req, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponse, User, ApiResponse } from '@birdguide/shared-types';

type Auth0CallbackData = {
  code: string;
  state: string;
};

type RegisterRequest = {
  email: string;
  password: string;
};

type AuthenticatedRequest = {
  user: {
    sub: string;
  };
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerRequest: RegisterRequest
  ): Promise<ApiResponse<AuthResponse>> {
    const authResponse = await this.authService.register(registerRequest);

    return {
      success: true,
      data: authResponse,
    };
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

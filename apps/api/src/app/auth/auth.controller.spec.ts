import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, AuthResponse, ApiResponse } from '@birdguide/shared-types';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    preferredLocale: 'es-AR',
    xp: 0,
    currentStreak: 0,
    longestStreak: 0,
    isAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockAuthResponse: AuthResponse = {
    user: mockUser,
    token: 'jwt-token-123',
    refreshToken: 'refresh-token-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            handleAuth0Callback: jest.fn(),
            getCurrentUser: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('POST /auth/register', () => {
    it('should register user and return user with tokens', async () => {
      const registerRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      jest.spyOn(authService, 'register').mockResolvedValue(mockAuthResponse);

      const result = await controller.register(registerRequest);

      expect(authService.register).toHaveBeenCalledWith(registerRequest);
      expect(result).toEqual({
        success: true,
        data: mockAuthResponse,
      });
    });

    it('should return error when registration fails', async () => {
      const registerRequest = {
        email: 'invalid-email',
        password: 'password123',
      };

      jest
        .spyOn(authService, 'register')
        .mockRejectedValue(new Error('Invalid email format'));

      await expect(controller.register(registerRequest)).rejects.toThrow(
        'Invalid email format'
      );
    });
  });

  describe('POST /auth/callback', () => {
    it('should handle Auth0 callback and return user with tokens', async () => {
      const auth0CallbackData = {
        code: 'auth0-code-123',
        state: 'auth0-state-123',
      };

      jest
        .spyOn(authService, 'handleAuth0Callback')
        .mockResolvedValue(mockAuthResponse);

      const result = await controller.handleAuth0Callback(auth0CallbackData);

      expect(authService.handleAuth0Callback).toHaveBeenCalledWith(
        auth0CallbackData
      );
      expect(result).toEqual({
        success: true,
        data: mockAuthResponse,
      });
    });

    it('should return error when Auth0 callback fails', async () => {
      const auth0CallbackData = {
        code: 'invalid-code',
        state: 'invalid-state',
      };

      jest
        .spyOn(authService, 'handleAuth0Callback')
        .mockRejectedValue(new Error('Invalid authorization code'));

      await expect(
        controller.handleAuth0Callback(auth0CallbackData)
      ).rejects.toThrow('Invalid authorization code');
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user when authenticated', async () => {
      const mockRequest = {
        user: { sub: 'auth0|user-123' },
      };

      jest.spyOn(authService, 'getCurrentUser').mockResolvedValue(mockUser);

      const result = await controller.getCurrentUser(mockRequest as any);

      expect(authService.getCurrentUser).toHaveBeenCalledWith('auth0|user-123');
      expect(result).toEqual({
        success: true,
        data: mockUser,
      });
    });

    it('should return error when user not found', async () => {
      const mockRequest = {
        user: { sub: 'auth0|nonexistent-user' },
      };

      jest
        .spyOn(authService, 'getCurrentUser')
        .mockRejectedValue(new Error('User not found'));

      await expect(
        controller.getCurrentUser(mockRequest as any)
      ).rejects.toThrow('User not found');
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout user successfully', async () => {
      const mockRequest = {
        user: { sub: 'auth0|user-123' },
      };

      jest.spyOn(authService, 'logout').mockResolvedValue(undefined);

      const result = await controller.logout(mockRequest as any);

      expect(authService.logout).toHaveBeenCalledWith('auth0|user-123');
      expect(result).toEqual({
        success: true,
        message: 'Logged out successfully',
      });
    });
  });
});

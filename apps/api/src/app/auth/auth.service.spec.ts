import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User, AuthResponse } from '@birdguide/shared-types';

describe('AuthService', () => {
  let service: AuthService;

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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('handleAuth0Callback', () => {
    it('should exchange Auth0 code for tokens and create/update user', async () => {
      const auth0CallbackData = {
        code: 'valid-auth0-code',
        state: 'valid-state',
      };

      const result = await service.handleAuth0Callback(auth0CallbackData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
      expect(result.token).toBe('jwt-token-123');
    });

    it('should throw error for invalid authorization code', async () => {
      const auth0CallbackData = {
        code: 'invalid-code',
        state: 'invalid-state',
      };

      await expect(
        service.handleAuth0Callback(auth0CallbackData)
      ).rejects.toThrow();
    });
  });

  describe('getCurrentUser', () => {
    it('should return user by Auth0 ID', async () => {
      const auth0Id = 'auth0|user-123';

      const result = await service.getCurrentUser(auth0Id);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('displayName');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw error when user not found', async () => {
      const auth0Id = 'auth0|nonexistent-user';

      await expect(service.getCurrentUser(auth0Id)).rejects.toThrow();
    });
  });

  describe('logout', () => {
    it('should invalidate user session', async () => {
      const auth0Id = 'auth0|user-123';

      // Should complete successfully
      await expect(service.logout(auth0Id)).resolves.toBeUndefined();
    });
  });
});

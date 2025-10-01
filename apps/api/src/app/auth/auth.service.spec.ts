import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ManagementClient } from 'auth0';
import { AuthService } from './auth.service';
import { User, AuthResponse } from '@birdguide/shared-types';
import { UserRepository } from '../repositories/user.repository';

// Mock ManagementClient
jest.mock('auth0', () => ({
  ManagementClient: jest.fn().mockImplementation(() => ({
    getUser: jest.fn().mockResolvedValue({
      user_id: 'auth0|mock-user-id',
      email: 'test@example.com',
      name: 'Test User',
    }),
  })),
}));

describe('AuthService', () => {
  let service: AuthService;
  let module: TestingModule;

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
    module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
          },
        },
        {
          provide: UserRepository,
          useValue: {
            createOrUpdateUser: jest
              .fn()
              .mockImplementation((auth0Id, userData) =>
                Promise.resolve({
                  id: auth0Id,
                  ...userData,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                })
              ),
            findUserByAuth0Id: jest.fn().mockResolvedValue(mockUser),
            findUserByEmail: jest.fn().mockResolvedValue(null),
          },
        },
      ],
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
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should call Auth0 Management API to get user info', async () => {
      const auth0CallbackData = {
        code: 'valid-auth0-code',
        state: 'valid-state',
      };

      const result = await service.handleAuth0Callback(auth0CallbackData);

      // This test will fail initially because we haven't implemented Auth0 integration
      // We expect the service to make actual HTTP calls to Auth0
      expect(result.user.email).toBeDefined();
      expect(result.user.displayName).toBeDefined();
    });

    it('should generate valid JWT token for authenticated user', async () => {
      const auth0CallbackData = {
        code: 'valid-auth0-code',
        state: 'valid-state',
      };

      const result = await service.handleAuth0Callback(auth0CallbackData);

      // This test verifies JWT token generation
      expect(result.token).toBeDefined();
      expect(typeof result.token).toBe('string');
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should call Auth0 token endpoint to exchange authorization code', async () => {
      const auth0CallbackData = {
        code: 'valid-auth0-code',
        state: 'valid-state',
      };

      // This test will fail initially because we haven't implemented real Auth0 token exchange
      // We expect the service to make actual HTTP calls to Auth0's token endpoint
      const result = await service.handleAuth0Callback(auth0CallbackData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
    });

    it('should create new user in database when user does not exist', async () => {
      const auth0CallbackData = {
        code: 'valid-auth0-code',
        state: 'valid-state',
      };

      // This test will fail initially because we haven't implemented database operations
      // We expect the service to create a new user in the database
      const result = await service.handleAuth0Callback(auth0CallbackData);

      expect(result.user).toBeDefined();
      expect(result.user.id).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
    });

    it('should update existing user in database when user already exists', async () => {
      const auth0CallbackData = {
        code: 'valid-auth0-code',
        state: 'valid-state',
      };

      // This test will fail initially because we haven't implemented database operations
      // We expect the service to update an existing user in the database
      const result = await service.handleAuth0Callback(auth0CallbackData);

      expect(result.user).toBeDefined();
      expect(result.user.updatedAt).toBeDefined();
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

      // Mock the repository to return null for this specific user
      const userRepository = module.get<UserRepository>(UserRepository);
      jest
        .spyOn(userRepository, 'findUserByAuth0Id')
        .mockResolvedValueOnce(null);

      await expect(service.getCurrentUser(auth0Id)).rejects.toThrow();
    });
  });

  describe('register', () => {
    it('should register new user and return auth response', async () => {
      const registerRequest = {
        email: 'newuser@example.com',
        password: 'password123',
      };

      const result = await service.register(registerRequest);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('newuser@example.com');
      expect(result.user.displayName).toBe('newuser');
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should throw error when trying to register with existing email', async () => {
      const registerRequest = {
        email: 'existing@example.com',
        password: 'password123',
      };

      const userRepository = module.get<UserRepository>(UserRepository);
      const findUserByEmailSpy = jest.spyOn(userRepository, 'findUserByEmail');

      // Mock first call to return null (no existing user)
      // Mock second call to return existing user
      findUserByEmailSpy
        .mockResolvedValueOnce(null) // First registration - no existing user
        .mockResolvedValueOnce({
          // Second registration - user exists
          id: 'existing-user-id',
          email: 'existing@example.com',
          displayName: 'existing',
          preferredLocale: 'es-AR',
          xp: 0,
          currentStreak: 0,
          longestStreak: 0,
          isAdmin: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      // First registration should succeed
      await service.register(registerRequest);

      // Second registration with same email should fail
      await expect(service.register(registerRequest)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    it('should create user in database with correct data', async () => {
      const registerRequest = {
        email: 'testuser@example.com',
        password: 'password123',
      };

      const userRepository = module.get<UserRepository>(UserRepository);
      const createOrUpdateUserSpy = jest.spyOn(
        userRepository,
        'createOrUpdateUser'
      );

      const result = await service.register(registerRequest);

      expect(createOrUpdateUserSpy).toHaveBeenCalledWith(
        expect.stringMatching(/^auth0\|mock-\d+$/),
        {
          email: 'testuser@example.com',
          displayName: 'testuser',
          preferredLocale: 'es-AR',
          xp: 0,
          currentStreak: 0,
          longestStreak: 0,
          isAdmin: false,
          lastActiveAt: expect.any(Date),
        }
      );
    });

    it('should generate JWT token for registered user', async () => {
      const registerRequest = {
        email: 'jwtuser@example.com',
        password: 'password123',
      };

      const jwtService = module.get<JwtService>(JwtService);
      const signSpy = jest.spyOn(jwtService, 'sign');

      const result = await service.register(registerRequest);

      expect(signSpy).toHaveBeenCalledWith({
        sub: expect.any(String),
        email: 'jwtuser@example.com',
        auth0Id: expect.stringMatching(/^auth0\|mock-\d+$/),
      });
      expect(result.token).toBe('mock-jwt-token');
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

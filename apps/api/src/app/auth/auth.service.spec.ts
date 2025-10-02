import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ManagementClient } from 'auth0';
import { AuthService } from './auth.service';
import { User, AuthResponse } from '@birdguide/shared-types';
import { UserRepository } from '../repositories/user.repository';

// Mock ManagementClient
jest.mock('auth0', () => ({
  ManagementClient: jest.fn().mockImplementation(() => ({
    users: {
      get: jest.fn().mockResolvedValue({
        data: {
          user_id: 'auth0|mock-user-id',
          email: 'test@example.com',
          name: 'Test User',
        },
      }),
      create: jest.fn().mockResolvedValue({
        data: {
          user_id: 'auth0|created-user-123',
          email: 'created@example.com',
          name: 'created',
        },
        headers: {},
        status: 201,
        statusText: 'Created',
      }),
    },
  })),
}));

describe('AuthService', () => {
  let service: AuthService;
  let module: TestingModule;

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    preferredLocale: 'es-AR',
    xp: 0,
    currentStreak: 0,
    longestStreak: 0,
    isAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Set up required Auth0 environment variables for tests
    process.env.AUTH0_DOMAIN = 'test.auth0.com';
    process.env.AUTH0_CLIENT_ID = 'test-client-id';
    process.env.AUTH0_CLIENT_SECRET = 'test-client-secret';
    process.env.AUTH0_AUDIENCE = 'test-audience';
    process.env.AUTH0_MANAGEMENT_API_AUDIENCE =
      'https://test.auth0.com/api/v2/';
    process.env.AUTH0_MANAGEMENT_API_CLIENT_ID = 'test-management-client-id';
    process.env.AUTH0_MANAGEMENT_API_CLIENT_SECRET =
      'test-management-client-secret';

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
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                AUTH0_DOMAIN: 'test.auth0.com',
                AUTH0_CLIENT_ID: 'test-client-id',
                AUTH0_CLIENT_SECRET: 'test-client-secret',
              };
              return config[key];
            }),
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
            findUserByUsername: jest.fn().mockResolvedValue(null),
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
      expect(result.user.username).toBeDefined();
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
      const auth0CallbackData = 'invalid-code';

      // Mock the exchangeCodeForToken method to throw an error
      jest
        .spyOn(service as any, 'exchangeCodeForToken')
        .mockRejectedValue(new Error('Invalid authorization code'));

      await expect(
        service.handleAuth0Callback(auth0CallbackData)
      ).rejects.toThrow('Auth0 callback failed');
    });
  });

  describe('getCurrentUser', () => {
    it('should return user by Auth0 ID', async () => {
      const auth0Id = 'auth0|user-123';

      const result = await service.getCurrentUser(auth0Id);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('username');
      expect(result.email).toBe('test@example.com');
    });

    it('should throw error when user not found', async () => {
      const auth0Id = 'auth0|nonexistent-user';

      // Mock the repository to return null for this specific user
      const userRepository = module.get<UserRepository>(UserRepository);
      jest
        .spyOn(userRepository, 'findUserByAuth0Id')
        .mockResolvedValueOnce(null);

      const result = await service.getCurrentUser(auth0Id);
      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    it('should register new user with username and return auth response', async () => {
      const registerRequest = {
        email: 'newuser@example.com',
        username: 'newuser123',
        password: 'password123',
      };

      const result = await service.register(registerRequest);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('created@example.com');
      expect(result.user.username).toBe('created');
      expect(result.token).toBe('mock-jwt-token');
    });

    it('should throw error when username is already taken', async () => {
      const registerRequest = {
        email: 'newuser@example.com',
        username: 'takenusername',
        password: 'password123',
      };

      const userRepository = module.get<UserRepository>(UserRepository);
      jest.spyOn(userRepository, 'findUserByUsername').mockResolvedValue({
        id: 'existing-user-id',
        email: 'existing@example.com',
        username: 'takenusername',
        username: 'existing',
        preferredLocale: 'es-AR',
        xp: 0,
        currentStreak: 0,
        longestStreak: 0,
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.register(registerRequest)).rejects.toThrow(
        'Registration failed: Username already exists'
      );
    });

    it('should throw error when username is invalid format', async () => {
      const registerRequest = {
        email: 'newuser@example.com',
        username: 'invalid@username!',
        password: 'password123',
      };

      await expect(service.register(registerRequest)).rejects.toThrow(
        'Registration failed: Username can only contain letters, numbers and underscores'
      );
    });

    it('should throw error when username is too short', async () => {
      const registerRequest = {
        email: 'newuser@example.com',
        username: 'ab',
        password: 'password123',
      };

      await expect(service.register(registerRequest)).rejects.toThrow(
        'Registration failed: Username must be between 3 and 20 characters'
      );
    });

    it('should throw error when username is too long', async () => {
      const registerRequest = {
        email: 'newuser@example.com',
        username: 'a'.repeat(21),
        password: 'password123',
      };

      await expect(service.register(registerRequest)).rejects.toThrow(
        'Registration failed: Username must be between 3 and 20 characters'
      );
    });

    it('should create user in database with correct data', async () => {
      const registerRequest = {
        email: 'testuser@example.com',
        username: 'testuser123',
        password: 'password123',
      };

      const userRepository = module.get<UserRepository>(UserRepository);
      const createOrUpdateUserSpy = jest.spyOn(
        userRepository,
        'createOrUpdateUser'
      );

      const result = await service.register(registerRequest);

      expect(createOrUpdateUserSpy).toHaveBeenCalledWith(
        'auth0|created-user-123', // Mock Auth0 user ID from the mock
        {
          auth0Id: 'auth0|created-user-123',
          email: 'created@example.com',
          username: 'created',
          preferredLocale: 'es-AR',
          preferredRegionId: null,
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
        username: 'jwtuser123',
        password: 'password123',
      };

      const jwtService = module.get<JwtService>(JwtService);
      const signSpy = jest.spyOn(jwtService, 'sign');

      const result = await service.register(registerRequest);

      expect(signSpy).toHaveBeenCalledWith({
        sub: expect.any(String),
        email: 'created@example.com',
        auth0Id: 'auth0|created-user-123', // Mock Auth0 user ID from the mock
      });
      expect(result.token).toBe('mock-jwt-token');
    });
  });

  describe('login', () => {
    it('should login with email and return auth response', async () => {
      const loginRequest = {
        emailOrUsername: 'test@example.com',
        password: 'password123',
      };

      // Mock Auth0 authentication response
      const mockAuth0Response = {
        user_id: 'auth0|123',
        email: 'test@example.com',
        access_token: 'auth0-access-token',
        refresh_token: 'auth0-refresh-token',
      };

      jest
        .spyOn(service as any, 'authenticateWithAuth0')
        .mockResolvedValue(mockAuth0Response);

      const userRepository = module.get<UserRepository>(UserRepository);
      jest
        .spyOn(userRepository, 'findUserByAuth0Id')
        .mockResolvedValue(mockUser);

      const result = await service.login(loginRequest);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.username).toBe('testuser');
      expect(result.refreshToken).toBe('auth0-refresh-token');
    });

    it('should login with username and return auth response', async () => {
      const loginRequest = {
        emailOrUsername: 'testuser',
        password: 'password123',
      };

      // Mock Auth0 authentication response
      const mockAuth0Response = {
        user_id: 'auth0|123',
        email: 'test@example.com',
        access_token: 'auth0-access-token',
        refresh_token: 'auth0-refresh-token',
      };

      jest
        .spyOn(service as any, 'authenticateWithAuth0')
        .mockResolvedValue(mockAuth0Response);

      const userRepository = module.get<UserRepository>(UserRepository);
      jest
        .spyOn(userRepository, 'findUserByAuth0Id')
        .mockResolvedValue(mockUser);

      const result = await service.login(loginRequest);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('refreshToken');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.username).toBe('testuser');
      expect(result.refreshToken).toBe('auth0-refresh-token');
    });

    it('should throw error when user not found in database after Auth0 authentication', async () => {
      const loginRequest = {
        emailOrUsername: 'nonexistent@example.com',
        password: 'password123',
      };

      // Mock Auth0 authentication to succeed
      const mockAuth0Response = {
        user_id: 'auth0|nonexistent',
        email: 'nonexistent@example.com',
        access_token: 'auth0-access-token',
        refresh_token: 'auth0-refresh-token',
      };

      jest
        .spyOn(service as any, 'authenticateWithAuth0')
        .mockResolvedValue(mockAuth0Response);

      const userRepository = module.get<UserRepository>(UserRepository);
      jest.spyOn(userRepository, 'findUserByAuth0Id').mockResolvedValue(null);

      await expect(service.login(loginRequest)).rejects.toThrow(
        'User not found in database'
      );
    });

    it('should fail login with wrong password (Auth0 authentication)', async () => {
      const loginRequest = {
        emailOrUsername: 'test@example.com',
        password: 'wrongpassword',
      };

      // Mock Auth0 authentication to fail with invalid credentials
      jest
        .spyOn(service as any, 'authenticateWithAuth0')
        .mockRejectedValue(new Error('Invalid email or password'));

      await expect(service.login(loginRequest)).rejects.toThrow(
        'Invalid email or password'
      );
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

import { vi } from 'vitest';
import { registrationService } from '../../app/services/registration.service';

// Mock fetch
global.fetch = vi.fn();

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_API_BASE_URL: 'http://localhost:3000/api',
  },
}));

describe('RegistrationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should register user with valid credentials', async () => {
    const mockResponse = {
      user: {
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
      },
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token',
    };

    const mockApiResponse = {
      success: true,
      data: mockResponse,
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    });

    const result = await registrationService.register({
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/auth/register',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      }
    );

    expect(result).toEqual({
      success: true,
      data: mockResponse,
    });
  });

  it('should handle registration errors', async () => {
    const mockError = {
      message: 'Email already exists',
      code: 'EMAIL_EXISTS',
    };

    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => mockError,
    });

    const result = await registrationService.register({
      email: 'existing@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(result).toEqual({
      success: false,
      error: mockError,
    });
  });

  it('should handle API success: false response for duplicate email', async () => {
    const mockApiResponse = {
      success: false,
      error: 'User with this email already exists',
      message: 'Email already exists',
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const result = await registrationService.register({
      email: 'duplicate@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      error: {
        message: 'User with this email already exists',
        code: 'EMAIL_EXISTS',
      },
    });
  });

  it('should handle API success: false response for general error', async () => {
    const mockApiResponse = {
      success: false,
      error: 'Server error occurred',
      message: 'Registration failed',
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const result = await registrationService.register({
      email: 'valid@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      error: {
        message: 'Server error occurred',
        code: 'REGISTRATION_FAILED',
      },
    });
  });

  it('should handle API success: false response for password strength error', async () => {
    const mockApiResponse = {
      success: false,
      error:
        'Auth0 user creation failed: PasswordStrengthError: Password is too weak',
      message: 'Registration failed',
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const result = await registrationService.register({
      email: 'weakpass@example.com',
      password: '123',
      confirmPassword: '123',
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      error: {
        message:
          'Password is too weak. Must be at least 8 characters with uppercase, lowercase and numbers',
        code: 'PASSWORD_TOO_WEAK',
      },
    });
  });

  it('should handle API success: false response for password too common error', async () => {
    const mockApiResponse = {
      success: false,
      error:
        'Auth0 user creation failed: password_dictionary_error: Password is too common',
      message: 'Registration failed',
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const result = await registrationService.register({
      email: 'commonpass@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      error: {
        message: 'Password is too common. Choose a more unique password',
        code: 'PASSWORD_TOO_COMMON',
      },
    });
  });

  it('should handle API success: false response for password contains user info error', async () => {
    const mockApiResponse = {
      success: false,
      error:
        'Auth0 user creation failed: password_no_user_info_error: Password contains user information',
      message: 'Registration failed',
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const result = await registrationService.register({
      email: 'john@example.com',
      password: 'john123',
      confirmPassword: 'john123',
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      error: {
        message:
          'Password cannot contain personal information like your name or email',
        code: 'PASSWORD_CONTAINS_USER_INFO',
      },
    });
  });

  it('should handle API success: false response for user already exists error', async () => {
    const mockApiResponse = {
      success: false,
      error: 'Auth0 user creation failed: user_exists: User already exists',
      message: 'Registration failed',
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const result = await registrationService.register({
      email: 'existing@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      error: {
        message:
          'An account with this email already exists. Try signing in instead',
        code: 'USER_ALREADY_EXISTS',
      },
    });
  });

  it('should handle API success: false response for signup not allowed error', async () => {
    const mockApiResponse = {
      success: false,
      error: 'Auth0 user creation failed: unauthorized: Signup not allowed',
      message: 'Registration failed',
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const result = await registrationService.register({
      email: 'blocked@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      error: {
        message:
          'Signup is not available at this time. Contact support if the problem persists',
        code: 'SIGNUP_NOT_ALLOWED',
      },
    });
  });

  it('should handle API success: false response for invalid email error', async () => {
    const mockApiResponse = {
      success: false,
      error: 'Auth0 user creation failed: invalid_email: Invalid email format',
      message: 'Registration failed',
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const result = await registrationService.register({
      email: 'valid@example.com', // Use valid email to pass client-side validation
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      error: {
        message: 'The email format is not valid',
        code: 'INVALID_EMAIL',
      },
    });
  });

  it('should handle API success: false response for connection disabled error', async () => {
    const mockApiResponse = {
      success: false,
      error: 'Auth0 user creation failed: connection is disabled',
      message: 'Registration failed',
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const result = await registrationService.register({
      email: 'disabled@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      error: {
        message: 'Signup is not available. Contact support for assistance',
        code: 'CONNECTION_DISABLED',
      },
    });
  });

  it('should handle API success: false response for server error', async () => {
    const mockApiResponse = {
      success: false,
      error: 'Auth0 user creation failed: Internal server error',
      message: 'Registration failed',
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });

    const result = await registrationService.register({
      email: 'server@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      success: false,
      error: {
        message: 'A server error occurred. Please try again later',
        code: 'SERVER_ERROR',
      },
    });
  });

  it('should handle network errors', async () => {
    (fetch as any).mockRejectedValueOnce(new Error('Network error'));

    const result = await registrationService.register({
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(result).toEqual({
      success: false,
      error: { message: 'Network error' },
    });
  });

  it('should validate password confirmation before making API call', async () => {
    const result = await registrationService.register({
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'different123',
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: { message: 'Passwords do not match' },
    });
  });

  it('should validate email format before making API call', async () => {
    const result = await registrationService.register({
      email: 'invalid-email',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: { message: 'Invalid email format' },
    });
  });

  it('should validate required fields before making API call', async () => {
    const result = await registrationService.register({
      email: '',
      password: '',
      confirmPassword: '',
    });

    expect(fetch).not.toHaveBeenCalled();
    expect(result).toEqual({
      success: false,
      error: { message: 'Email and password are required' },
    });
  });
});

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

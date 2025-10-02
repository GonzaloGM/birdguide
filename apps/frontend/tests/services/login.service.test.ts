import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loginService } from '../../app/services/login.service';

// Mock fetch
global.fetch = vi.fn();

describe('LoginService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should login successfully with valid credentials', async () => {
    const mockUser = {
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

    const mockResponse = {
      success: true,
      data: {
        user: mockUser,
        token: 'mock-jwt-token',
        refreshToken: null,
      },
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await loginService.login({
      emailOrUsername: 'test@example.com',
      password: 'password123',
    });

    expect(result.success).toBe(true);
    expect(result.data?.user).toEqual(mockUser);
    expect(result.data?.token).toBe('mock-jwt-token');
    expect(fetch).toHaveBeenCalledWith('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailOrUsername: 'test@example.com',
        password: 'password123',
      }),
    });
  });

  it('should handle login failure with invalid credentials', async () => {
    const mockResponse = {
      success: false,
      error: 'Invalid email or password',
      message: 'Login failed',
    };

    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await loginService.login({
      emailOrUsername: 'test@example.com',
      password: 'wrongpassword',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('login.errors.invalidCredentials');
  });

  it('should handle network errors', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

    const result = await loginService.login({
      emailOrUsername: 'test@example.com',
      password: 'password123',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('login.errors.invalidCredentials');
  });

  it('should handle server errors', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' }),
    } as Response);

    const result = await loginService.login({
      emailOrUsername: 'test@example.com',
      password: 'password123',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('login.errors.invalidCredentials');
  });

  it('should map specific error messages to i18n keys', async () => {
    const testCases = [
      {
        backendError: 'Invalid email or password',
        expectedI18nKey: 'login.errors.invalidCredentials',
      },
      {
        backendError: 'Too many login attempts. Please try again later',
        expectedI18nKey: 'login.errors.tooManyAttempts',
      },
      {
        backendError: 'Account is temporarily locked. Please contact support',
        expectedI18nKey: 'login.errors.accountLocked',
      },
      {
        backendError: 'User not found in database',
        expectedI18nKey: 'login.errors.userNotFound',
      },
      {
        backendError: 'Some other error',
        expectedI18nKey: 'login.errors.invalidCredentials',
      },
    ];

    for (const testCase of testCases) {
      const mockResponse = {
        success: false,
        error: testCase.backendError,
        message: 'Login failed',
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await loginService.login({
        emailOrUsername: 'test@example.com',
        password: 'password123',
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe(testCase.expectedI18nKey);
    }
  });
});

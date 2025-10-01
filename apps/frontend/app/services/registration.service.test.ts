import { registrationService } from './registration.service';

// Mock fetch
global.fetch = jest.fn();

describe('RegistrationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await registrationService.register({
      email: 'test@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    });

    expect(fetch).toHaveBeenCalledWith('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
    });

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

    (fetch as jest.Mock).mockResolvedValueOnce({
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

  it('should handle network errors', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

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

import { User, AuthResponse } from '@birdguide/shared-types';

type RegistrationRequest = {
  email: string;
  password: string;
  confirmPassword: string;
};

type RegistrationResult =
  | {
      success: true;
      data: AuthResponse;
    }
  | {
      success: false;
      error: { message: string; code?: string };
    };

const getApiBaseUrl = (): string => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error(
      'Required environment variable VITE_API_BASE_URL is not set'
    );
  }
  return apiBaseUrl;
};

export const registrationService = {
  async register(request: RegistrationRequest): Promise<RegistrationResult> {
    // Validate required fields
    if (!request.email || !request.password) {
      return {
        success: false,
        error: { message: 'Email and password are required' },
      };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(request.email)) {
      return {
        success: false,
        error: { message: 'Invalid email format' },
      };
    }

    // Validate password confirmation
    if (request.password !== request.confirmPassword) {
      return {
        success: false,
        error: { message: 'Passwords do not match' },
      };
    }

    try {
      const apiBaseUrl = getApiBaseUrl();
      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: request.email,
          password: request.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data,
        };
      }

      // Handle API response format: { success: boolean, data?: T, error?: string, message?: string }
      if (data.success === false) {
        return {
          success: false,
          error: {
            message: data.error || data.message || 'Registration failed',
            code:
              data.error === 'User with this email already exists'
                ? 'EMAIL_EXISTS'
                : 'REGISTRATION_FAILED',
          },
        };
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  },
};

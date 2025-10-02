import { User, AuthResponse } from '@birdguide/shared-types';

type RegistrationRequest = {
  email: string;
  username: string;
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
    if (!request.email || !request.username || !request.password) {
      return {
        success: false,
        error: { message: 'Email, username and password are required' },
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
          username: request.username,
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
        // Check for specific error types
        let errorCode = 'REGISTRATION_FAILED';
        let errorMessage = data.error || data.message || 'Registration failed';

        // Handle specific Auth0 error patterns
        if (data.error === 'User with this email already exists') {
          errorCode = 'EMAIL_EXISTS';
        } else if (data.error === 'Username is already taken') {
          errorCode = 'USERNAME_EXISTS';
          errorMessage =
            'Username is already taken. Please choose a different username';
        } else if (
          data.error &&
          data.error.includes('PasswordStrengthError: Password is too weak')
        ) {
          errorCode = 'PASSWORD_TOO_WEAK';
          errorMessage =
            'Password is too weak. Must be at least 8 characters with uppercase, lowercase and numbers';
        } else if (
          data.error &&
          data.error.includes('password_dictionary_error')
        ) {
          errorCode = 'PASSWORD_TOO_COMMON';
          errorMessage =
            'Password is too common. Choose a more unique password';
        } else if (
          data.error &&
          data.error.includes('password_no_user_info_error')
        ) {
          errorCode = 'PASSWORD_CONTAINS_USER_INFO';
          errorMessage =
            'Password cannot contain personal information like your name or email';
        } else if (data.error && data.error.includes('user_exists')) {
          errorCode = 'USER_ALREADY_EXISTS';
          errorMessage =
            'An account with this email already exists. Try signing in instead';
        } else if (data.error && data.error.includes('unauthorized')) {
          errorCode = 'SIGNUP_NOT_ALLOWED';
          errorMessage =
            'Signup is not available at this time. Contact support if the problem persists';
        } else if (data.error && data.error.includes('invalid_email')) {
          errorCode = 'INVALID_EMAIL';
          errorMessage = 'The email format is not valid';
        } else if (
          data.error &&
          data.error.includes('connection is disabled')
        ) {
          errorCode = 'CONNECTION_DISABLED';
          errorMessage =
            'Signup is not available. Contact support for assistance';
        } else if (data.error && data.error.includes('Internal server error')) {
          errorCode = 'SERVER_ERROR';
          errorMessage = 'A server error occurred. Please try again later';
        }

        return {
          success: false,
          error: {
            message: errorMessage,
            code: errorCode,
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

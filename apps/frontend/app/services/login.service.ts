import {
  LoginRequest,
  AuthResponse,
  ApiResponse,
} from '@birdguide/shared-types';

type LoginResult =
  | {
      success: true;
      data: AuthResponse;
    }
  | {
      success: false;
      error: string;
    };

// Map backend error messages to i18n keys
const mapErrorToI18nKey = (errorMessage: string): string => {
  if (errorMessage.includes('Invalid email or password')) {
    return 'login.errors.invalidCredentials';
  }
  if (errorMessage.includes('Too many login attempts')) {
    return 'login.errors.tooManyAttempts';
  }
  if (errorMessage.includes('Account is temporarily locked')) {
    return 'login.errors.accountLocked';
  }
  if (errorMessage.includes('User not found in database')) {
    return 'login.errors.userNotFound';
  }
  // Default to invalid credentials for any other error
  return 'login.errors.invalidCredentials';
};

export const loginService = {
  async login(loginRequest: LoginRequest): Promise<LoginResult> {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginRequest),
      });

      if (!response.ok) {
        return {
          success: false,
          error: 'login.errors.invalidCredentials',
        };
      }

      const result: ApiResponse<AuthResponse> = await response.json();

      if (result.success) {
        return {
          success: true,
          data: result.data,
        };
      } else {
        return {
          success: false,
          error: mapErrorToI18nKey(result.error || 'Invalid email or password'),
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'login.errors.invalidCredentials',
      };
    }
  },
};

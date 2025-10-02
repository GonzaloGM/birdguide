import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { SignupPage } from '../../app/components/signup-page';
import { renderWithI18n } from '../../app/test-utils';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '../../app/contexts/auth-context';
import i18n from '../../app/i18n';

// Mock Auth0
const mockLoginWithPopup = vi.fn();
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    loginWithPopup: mockLoginWithPopup,
  }),
}));

// Mock react-router
const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock registration service
vi.mock('../../app/services/registration.service', () => ({
  registrationService: {
    register: vi.fn(),
  },
}));

// Mock auth context
const mockLogin = vi.fn();
const mockLogout = vi.fn();
vi.mock('../../app/contexts/auth-context', () => ({
  useAuth: () => ({
    user: null,
    isLoggedIn: false,
    login: mockLogin,
    logout: mockLogout,
  }),
}));

describe('SignupPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoginWithPopup.mockClear();
    mockLogin.mockClear();
    mockLogout.mockClear();
    mockNavigate.mockClear();
  });

  it('should render signup form with all required fields', () => {
    renderWithI18n(<SignupPage />);

    expect(screen.getByText(i18n.t('signup.title'))).toBeInTheDocument();
    expect(screen.getByLabelText(i18n.t('signup.email'))).toBeInTheDocument();
    expect(
      screen.getByLabelText(i18n.t('signup.password'))
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(i18n.t('signup.confirmPassword'))
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: i18n.t('signup.submit') })
    ).toBeInTheDocument();
  });

  it('should show validation errors for empty required fields', async () => {
    renderWithI18n(<SignupPage />);

    const submitButton = screen.getByRole('button', {
      name: i18n.t('signup.submit'),
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(i18n.t('signup.errors.emailRequired'))
      ).toBeInTheDocument();
      expect(
        screen.getByText(i18n.t('signup.errors.passwordRequired'))
      ).toBeInTheDocument();
      expect(
        screen.getByText(i18n.t('signup.errors.confirmPasswordRequired'))
      ).toBeInTheDocument();
    });
  });

  it('should show error for invalid email format', async () => {
    renderWithI18n(<SignupPage />);

    const emailInput = screen.getByLabelText(i18n.t('signup.email'));
    const submitButton = screen.getByRole('button', {
      name: i18n.t('signup.submit'),
    });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(i18n.t('signup.errors.emailInvalid'))
      ).toBeInTheDocument();
    });
  });

  it('should show error when passwords do not match', async () => {
    renderWithI18n(<SignupPage />);

    const emailInput = screen.getByLabelText(i18n.t('signup.email'));
    const passwordInput = screen.getByLabelText(i18n.t('signup.password'));
    const confirmPasswordInput = screen.getByLabelText(
      i18n.t('signup.confirmPassword')
    );
    const submitButton = screen.getByRole('button', {
      name: i18n.t('signup.submit'),
    });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'different123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(i18n.t('signup.errors.passwordMismatch'))
      ).toBeInTheDocument();
    });
  });

  it('should clear validation errors when user starts typing', async () => {
    renderWithI18n(<SignupPage />);

    const submitButton = screen.getByRole('button', {
      name: i18n.t('signup.submit'),
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(i18n.t('signup.errors.emailRequired'))
      ).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText(i18n.t('signup.email'));
    await user.type(emailInput, 'test@example.com');

    await waitFor(() => {
      expect(
        screen.queryByText(i18n.t('signup.errors.emailRequired'))
      ).not.toBeInTheDocument();
    });
  });

  it('should call Auth0 loginWithPopup for Google signup', async () => {
    renderWithI18n(<SignupPage />);

    const googleButton = screen.getByRole('button', {
      name: i18n.t('signup.google'),
    });
    await user.click(googleButton);

    expect(mockLoginWithPopup).toHaveBeenCalledWith({
      authorizationParams: {
        connection: 'google-oauth2',
        screen_hint: 'signup',
      },
    });
  });

  it('should call Auth0 loginWithPopup for Apple signup', async () => {
    renderWithI18n(<SignupPage />);

    const appleButton = screen.getByRole('button', {
      name: i18n.t('signup.apple'),
    });
    await user.click(appleButton);

    expect(mockLoginWithPopup).toHaveBeenCalledWith({
      authorizationParams: {
        connection: 'apple',
        screen_hint: 'signup',
      },
    });
  });

  it('should not submit form with invalid data', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    renderWithI18n(<SignupPage />);

    const emailInput = screen.getByLabelText(i18n.t('signup.email'));
    const submitButton = screen.getByRole('button', {
      name: i18n.t('signup.submit'),
    });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(consoleSpy).not.toHaveBeenCalled();
    });

    consoleSpy.mockRestore();
  });

  it('should call registration service with valid data', async () => {
    const { registrationService } = await import(
      '../../app/services/registration.service'
    );
    const mockRegister = vi.mocked(registrationService.register);
    mockRegister.mockResolvedValue({
      success: true,
      data: {
        user: {
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
        },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      },
    });

    renderWithI18n(<SignupPage />);

    const emailInput = screen.getByLabelText(i18n.t('signup.email'));
    const usernameInput = screen.getByLabelText(i18n.t('signup.username'));
    const passwordInput = screen.getByLabelText(i18n.t('signup.password'));
    const confirmPasswordInput = screen.getByLabelText(
      i18n.t('signup.confirmPassword')
    );
    const submitButton = screen.getByRole('button', {
      name: i18n.t('signup.submit'),
    });

    await user.type(emailInput, 'test@example.com');
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        confirmPassword: 'password123',
      });
    });
  });

  it('should show error message when registration fails', async () => {
    const { registrationService } = await import(
      '../../app/services/registration.service'
    );
    const mockRegister = vi.mocked(registrationService.register);
    mockRegister.mockResolvedValue({
      success: false,
      error: { message: 'Email already exists', code: 'EMAIL_EXISTS' },
    });

    renderWithI18n(<SignupPage />);

    const emailInput = screen.getByLabelText(i18n.t('signup.email'));
    const usernameInput = screen.getByLabelText(i18n.t('signup.username'));
    const passwordInput = screen.getByLabelText(i18n.t('signup.password'));
    const confirmPasswordInput = screen.getByLabelText(
      i18n.t('signup.confirmPassword')
    );
    const submitButton = screen.getByRole('button', {
      name: i18n.t('signup.submit'),
    });

    await user.type(emailInput, 'existing@example.com');
    await user.type(usernameInput, 'existinguser');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(i18n.t('signup.errors.userAlreadyExists'))
      ).toBeInTheDocument();
    });
  });

  it('should show error message when API returns duplicate email error', async () => {
    const { registrationService } = await import(
      '../../app/services/registration.service'
    );
    const mockRegister = vi.mocked(registrationService.register);
    mockRegister.mockResolvedValue({
      success: false,
      error: {
        message: 'User with this email already exists',
        code: 'EMAIL_EXISTS',
      },
    });

    renderWithI18n(<SignupPage />);

    const emailInput = screen.getByLabelText(i18n.t('signup.email'));
    const usernameInput = screen.getByLabelText(i18n.t('signup.username'));
    const passwordInput = screen.getByLabelText(i18n.t('signup.password'));
    const confirmPasswordInput = screen.getByLabelText(
      i18n.t('signup.confirmPassword')
    );
    const submitButton = screen.getByRole('button', {
      name: i18n.t('signup.submit'),
    });

    await user.type(emailInput, 'duplicate@example.com');
    await user.type(usernameInput, 'duplicateuser');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(i18n.t('signup.errors.userAlreadyExists'))
      ).toBeInTheDocument();
    });
  });

  it('should show password strength error message from i18n', async () => {
    const { registrationService } = await import(
      '../../app/services/registration.service'
    );
    const mockRegister = vi.mocked(registrationService.register);
    mockRegister.mockResolvedValue({
      success: false,
      error: {
        message:
          'Password is too weak. Must be at least 8 characters with uppercase, lowercase and numbers',
        code: 'PASSWORD_TOO_WEAK',
      },
    });

    renderWithI18n(<SignupPage />);

    const emailInput = screen.getByLabelText(i18n.t('signup.email'));
    const usernameInput = screen.getByLabelText(i18n.t('signup.username'));
    const passwordInput = screen.getByLabelText(i18n.t('signup.password'));
    const confirmPasswordInput = screen.getByLabelText(
      i18n.t('signup.confirmPassword')
    );
    const submitButton = screen.getByRole('button', {
      name: i18n.t('signup.submit'),
    });

    await user.type(emailInput, 'weakpass@example.com');
    await user.type(usernameInput, 'weakuser');
    await user.type(passwordInput, '123');
    await user.type(confirmPasswordInput, '123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(i18n.t('signup.errors.passwordTooWeak'))
      ).toBeInTheDocument();
    });
  });

  it('should show password too common error message from i18n', async () => {
    const { registrationService } = await import(
      '../../app/services/registration.service'
    );
    const mockRegister = vi.mocked(registrationService.register);
    mockRegister.mockResolvedValue({
      success: false,
      error: {
        message: 'Password is too common. Choose a more unique password',
        code: 'PASSWORD_TOO_COMMON',
      },
    });

    renderWithI18n(<SignupPage />);

    const emailInput = screen.getByLabelText(i18n.t('signup.email'));
    const usernameInput = screen.getByLabelText(i18n.t('signup.username'));
    const passwordInput = screen.getByLabelText(i18n.t('signup.password'));
    const confirmPasswordInput = screen.getByLabelText(
      i18n.t('signup.confirmPassword')
    );
    const submitButton = screen.getByRole('button', {
      name: i18n.t('signup.submit'),
    });

    await user.type(emailInput, 'commonpass@example.com');
    await user.type(usernameInput, 'commonuser');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(i18n.t('signup.errors.passwordTooCommon'))
      ).toBeInTheDocument();
    });
  });

  it('should show user already exists error message from i18n', async () => {
    const { registrationService } = await import(
      '../../app/services/registration.service'
    );
    const mockRegister = vi.mocked(registrationService.register);
    mockRegister.mockResolvedValue({
      success: false,
      error: {
        message:
          'An account with this email already exists. Try signing in instead',
        code: 'USER_ALREADY_EXISTS',
      },
    });

    renderWithI18n(<SignupPage />);

    const emailInput = screen.getByLabelText(i18n.t('signup.email'));
    const usernameInput = screen.getByLabelText(i18n.t('signup.username'));
    const passwordInput = screen.getByLabelText(i18n.t('signup.password'));
    const confirmPasswordInput = screen.getByLabelText(
      i18n.t('signup.confirmPassword')
    );
    const submitButton = screen.getByRole('button', {
      name: i18n.t('signup.submit'),
    });

    await user.type(emailInput, 'existing@example.com');
    await user.type(usernameInput, 'existinguser2');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(i18n.t('signup.errors.userAlreadyExists'))
      ).toBeInTheDocument();
    });
  });

  it('should show signup not allowed error message from i18n', async () => {
    const { registrationService } = await import(
      '../../app/services/registration.service'
    );
    const mockRegister = vi.mocked(registrationService.register);
    mockRegister.mockResolvedValue({
      success: false,
      error: {
        message:
          'Signup is not available at this time. Contact support if the problem persists',
        code: 'SIGNUP_NOT_ALLOWED',
      },
    });

    renderWithI18n(<SignupPage />);

    const emailInput = screen.getByLabelText(i18n.t('signup.email'));
    const usernameInput = screen.getByLabelText(i18n.t('signup.username'));
    const passwordInput = screen.getByLabelText(i18n.t('signup.password'));
    const confirmPasswordInput = screen.getByLabelText(
      i18n.t('signup.confirmPassword')
    );
    const submitButton = screen.getByRole('button', {
      name: i18n.t('signup.submit'),
    });

    await user.type(emailInput, 'blocked@example.com');
    await user.type(usernameInput, 'blockeduser');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(i18n.t('signup.errors.signupNotAllowed'))
      ).toBeInTheDocument();
    });
  });

  it('should show loading state during registration', async () => {
    const { registrationService } = await import(
      '../../app/services/registration.service'
    );
    const mockRegister = vi.mocked(registrationService.register);

    // Create a promise that we can control
    let resolveRegistration: (value: any) => void;
    const registrationPromise = new Promise((resolve) => {
      resolveRegistration = resolve;
    });
    mockRegister.mockReturnValue(registrationPromise);

    renderWithI18n(<SignupPage />);

    const emailInput = screen.getByLabelText(i18n.t('signup.email'));
    const usernameInput = screen.getByLabelText(i18n.t('signup.username'));
    const passwordInput = screen.getByLabelText(i18n.t('signup.password'));
    const confirmPasswordInput = screen.getByLabelText(
      i18n.t('signup.confirmPassword')
    );
    const submitButton = screen.getByRole('button', {
      name: i18n.t('signup.submit'),
    });

    await user.type(emailInput, 'test@example.com');
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    // Check that loading state is shown
    await waitFor(() => {
      expect(screen.getByText(i18n.t('loading'))).toBeInTheDocument();
    });

    // Resolve the registration
    resolveRegistration!({
      success: true,
      data: {
        user: {
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
        },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
      },
    });

    await waitFor(() => {
      expect(screen.queryByText(i18n.t('loading'))).not.toBeInTheDocument();
    });
  });

  it('should call login with user data and token after successful registration', async () => {
    const { registrationService } = await import(
      '../../app/services/registration.service'
    );
    const mockRegister = vi.mocked(registrationService.register);

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

    mockRegister.mockResolvedValue({
      success: true,
      data: {
        user: mockUser,
        token: 'mock-jwt-token',
        refreshToken: null,
      },
    });

    renderWithI18n(<SignupPage />);

    const emailInput = screen.getByLabelText(i18n.t('signup.email'));
    const usernameInput = screen.getByLabelText(i18n.t('signup.username'));
    const passwordInput = screen.getByLabelText(i18n.t('signup.password'));
    const confirmPasswordInput = screen.getByLabelText(
      i18n.t('signup.confirmPassword')
    );
    const submitButton = screen.getByRole('button', {
      name: i18n.t('signup.submit'),
    });

    await user.type(emailInput, 'test@example.com');
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(mockUser, 'mock-jwt-token');
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import { SignupPage } from '../../app/components/signup-page';
import { renderWithI18n } from '../../app/test-utils';
import { useAuth0 } from '@auth0/auth0-react';

// Mock Auth0
const mockLoginWithPopup = vi.fn();
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    loginWithPopup: mockLoginWithPopup,
  }),
}));

// Mock react-router
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

// Mock registration service
vi.mock('../../app/services/registration.service', () => ({
  registrationService: {
    register: vi.fn(),
  },
}));

describe('SignupPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLoginWithPopup.mockClear();
  });

  it('should render signup form with all required fields', () => {
    renderWithI18n(<SignupPage />);

    expect(screen.getByText('Registrarme')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar contraseña')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Enviar' })).toBeInTheDocument();
  });

  it('should show validation errors for empty required fields', async () => {
    renderWithI18n(<SignupPage />);

    const submitButton = screen.getByRole('button', { name: 'Enviar' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('El email es requerido')).toBeInTheDocument();
      expect(
        screen.getByText('La contraseña es requerida')
      ).toBeInTheDocument();
      expect(
        screen.getByText('La confirmación de contraseña es requerida')
      ).toBeInTheDocument();
    });
  });

  it('should show error for invalid email format', async () => {
    renderWithI18n(<SignupPage />);

    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Enviar' });

    await user.type(emailInput, 'invalid-email');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email inválido')).toBeInTheDocument();
    });
  });

  it('should show error when passwords do not match', async () => {
    renderWithI18n(<SignupPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const confirmPasswordInput = screen.getByLabelText('Confirmar contraseña');
    const submitButton = screen.getByRole('button', { name: 'Enviar' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'different123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('Las contraseñas no coinciden')
      ).toBeInTheDocument();
    });
  });

  it('should clear validation errors when user starts typing', async () => {
    renderWithI18n(<SignupPage />);

    const submitButton = screen.getByRole('button', { name: 'Enviar' });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('El email es requerido')).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText('Email');
    await user.type(emailInput, 'test@example.com');

    await waitFor(() => {
      expect(
        screen.queryByText('El email es requerido')
      ).not.toBeInTheDocument();
    });
  });

  it('should call Auth0 loginWithPopup for Google signup', async () => {
    renderWithI18n(<SignupPage />);

    const googleButton = screen.getByRole('button', {
      name: 'Registrarse con Google',
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
      name: 'Registrarse con Apple',
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

    const emailInput = screen.getByLabelText('Email');
    const submitButton = screen.getByRole('button', { name: 'Enviar' });

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
      },
    });

    renderWithI18n(<SignupPage />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const confirmPasswordInput = screen.getByLabelText('Confirmar contraseña');
    const submitButton = screen.getByRole('button', { name: 'Enviar' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
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

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const confirmPasswordInput = screen.getByLabelText('Confirmar contraseña');
    const submitButton = screen.getByRole('button', { name: 'Enviar' });

    await user.type(emailInput, 'existing@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
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

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const confirmPasswordInput = screen.getByLabelText('Confirmar contraseña');
    const submitButton = screen.getByRole('button', { name: 'Enviar' });

    await user.type(emailInput, 'duplicate@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText('User with this email already exists')
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

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Contraseña');
    const confirmPasswordInput = screen.getByLabelText('Confirmar contraseña');
    const submitButton = screen.getByRole('button', { name: 'Enviar' });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    // Check that loading state is shown
    await waitFor(() => {
      expect(screen.getByText('Registrando...')).toBeInTheDocument();
    });

    // Resolve the registration
    resolveRegistration!({
      success: true,
      data: {
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
      },
    });

    await waitFor(() => {
      expect(screen.queryByText('Registrando...')).not.toBeInTheDocument();
    });
  });
});

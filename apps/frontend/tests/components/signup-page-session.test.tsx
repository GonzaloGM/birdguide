import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { SignupPage } from '../../app/components/signup-page';
import { renderWithI18n } from '../../app/test-utils';
import { useAuth } from '../../app/contexts/auth-context';

// Mock Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    loginWithPopup: vi.fn(),
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

// Mock auth context
const mockLogin = vi.fn();
vi.mock('../../app/contexts/auth-context', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useAuth: () => ({
      login: mockLogin,
    }),
  };
});

describe('SignupPage with Session Management', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
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
        refreshToken: 'mock-refresh-token',
      },
    });

    renderWithI18n(<SignupPage />);

    const emailInput = screen.getByLabelText('Email');
    const usernameInput = screen.getByLabelText('Usuario');
    const passwordInput = screen.getByLabelText('Contraseña');
    const confirmPasswordInput = screen.getByLabelText('Confirmar contraseña');
    const submitButton = screen.getByRole('button', { name: 'Enviar' });

    await user.type(emailInput, 'test@example.com');
    await user.type(usernameInput, 'testuser');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'password123');
    await user.click(submitButton);

    await waitFor(
      () => {
        expect(mockLogin).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'user-123',
            email: 'test@example.com',
            username: 'testuser',
          }),
          'mock-jwt-token'
        );
      },
      { timeout: 10000 }
    );
  });
});

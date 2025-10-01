import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import i18n from '../../app/i18n';
import { SignupPage } from '../../app/components/signup-page';

// Mock Auth0
const mockLoginWithRedirect = vi.fn();
const mockLoginWithPopup = vi.fn();
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    loginWithRedirect: mockLoginWithRedirect,
    loginWithPopup: mockLoginWithPopup,
  }),
}));

// Mock the navigation
const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>{component}</I18nextProvider>
    </MemoryRouter>
  );
};

describe('SignupPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockLoginWithRedirect.mockClear();
    mockLoginWithPopup.mockClear();
  });

  it('should render the signup form with email, password, and confirm password fields', () => {
    renderWithI18n(<SignupPage />);

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

  it('should render social signup buttons', () => {
    renderWithI18n(<SignupPage />);

    expect(
      screen.getByRole('button', { name: i18n.t('signup.google') })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: i18n.t('signup.apple') })
    ).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
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
    });
  });

  it('should show validation error for invalid email format', async () => {
    const user = userEvent.setup();
    renderWithI18n(<SignupPage />);

    const emailInput = screen.getByLabelText(i18n.t('signup.email'));
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', {
      name: i18n.t('signup.submit'),
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(i18n.t('signup.errors.emailInvalid'))
      ).toBeInTheDocument();
    });
  });

  it('should show validation error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderWithI18n(<SignupPage />);

    const emailInput = screen.getByLabelText(i18n.t('signup.email'));
    const passwordInput = screen.getByLabelText(i18n.t('signup.password'));
    const confirmPasswordInput = screen.getByLabelText(
      i18n.t('signup.confirmPassword')
    );

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.type(confirmPasswordInput, 'different123');

    const submitButton = screen.getByRole('button', {
      name: i18n.t('signup.submit'),
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(i18n.t('signup.errors.passwordMismatch'))
      ).toBeInTheDocument();
    });
  });

  it('should call Auth0 signup with Google when Google button is clicked', async () => {
    const user = userEvent.setup();
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

  it('should call Auth0 signup with Apple when Apple button is clicked', async () => {
    const user = userEvent.setup();
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

  it('should display form in English when language is switched', () => {
    i18n.changeLanguage('en');
    renderWithI18n(<SignupPage />);

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
    expect(
      screen.getByRole('button', { name: i18n.t('signup.google') })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: i18n.t('signup.apple') })
    ).toBeInTheDocument();
  });
});

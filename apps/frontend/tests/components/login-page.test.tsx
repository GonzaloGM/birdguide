import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import i18n from '../../app/i18n';
import { LoginPage } from '../../app/components/login-page';

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

describe('LoginPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockLoginWithRedirect.mockClear();
    mockLoginWithPopup.mockClear();
  });

  it('should render the login form with email and password fields', () => {
    renderWithI18n(<LoginPage />);

    expect(screen.getByLabelText(i18n.t('login.email'))).toBeInTheDocument();
    expect(screen.getByLabelText(i18n.t('login.password'))).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: i18n.t('login.submit') })
    ).toBeInTheDocument();
  });

  it('should render social login buttons', () => {
    renderWithI18n(<LoginPage />);

    expect(
      screen.getByRole('button', { name: i18n.t('login.google') })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: i18n.t('login.apple') })
    ).toBeInTheDocument();
  });

  it('should render reset password link', () => {
    renderWithI18n(<LoginPage />);

    expect(
      screen.getByText(i18n.t('login.forgotPassword'))
    ).toBeInTheDocument();
  });

  it('should show validation errors for empty fields', async () => {
    const user = userEvent.setup();
    renderWithI18n(<LoginPage />);

    const submitButton = screen.getByRole('button', {
      name: i18n.t('login.submit'),
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(i18n.t('login.errors.emailRequired'))
      ).toBeInTheDocument();
      expect(
        screen.getByText(i18n.t('login.errors.passwordRequired'))
      ).toBeInTheDocument();
    });
  });

  it('should show validation error for invalid email format', async () => {
    const user = userEvent.setup();
    renderWithI18n(<LoginPage />);

    const emailInput = screen.getByLabelText(i18n.t('login.email'));
    await user.type(emailInput, 'invalid-email');

    const submitButton = screen.getByRole('button', {
      name: i18n.t('login.submit'),
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(
        screen.getByText(i18n.t('login.errors.emailInvalid'))
      ).toBeInTheDocument();
    });
  });

  it('should call Auth0 login with Google when Google button is clicked', async () => {
    const user = userEvent.setup();
    renderWithI18n(<LoginPage />);

    const googleButton = screen.getByRole('button', {
      name: i18n.t('login.google'),
    });
    await user.click(googleButton);

    expect(mockLoginWithPopup).toHaveBeenCalledWith({
      authorizationParams: {
        connection: 'google-oauth2',
      },
    });
  });

  it('should call Auth0 login with Apple when Apple button is clicked', async () => {
    const user = userEvent.setup();
    renderWithI18n(<LoginPage />);

    const appleButton = screen.getByRole('button', {
      name: i18n.t('login.apple'),
    });
    await user.click(appleButton);

    expect(mockLoginWithPopup).toHaveBeenCalledWith({
      authorizationParams: {
        connection: 'apple',
      },
    });
  });

  it('should display form in English when language is switched', () => {
    i18n.changeLanguage('en');
    renderWithI18n(<LoginPage />);

    expect(screen.getByLabelText(i18n.t('login.email'))).toBeInTheDocument();
    expect(screen.getByLabelText(i18n.t('login.password'))).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: i18n.t('login.submit') })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: i18n.t('login.google') })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: i18n.t('login.apple') })
    ).toBeInTheDocument();
  });
});

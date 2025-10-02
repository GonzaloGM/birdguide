import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router';
import { vi } from 'vitest';
import i18n from '../../app/i18n';
import { LandingPage } from '../../app/components/landing-page';
import { AuthProvider } from '../../app/contexts/auth-context';
import { LanguageProvider } from '../../app/contexts/language-context';

// Mock the navigation
const mockNavigate = vi.fn();
vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock auth context
vi.mock('../../app/contexts/auth-context', () => ({
  useAuth: () => ({
    user: null,
    isLoggedIn: false,
    login: vi.fn(),
    logout: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

const renderWithI18n = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      <I18nextProvider i18n={i18n}>
        <LanguageProvider>
          <AuthProvider>{component}</AuthProvider>
        </LanguageProvider>
      </I18nextProvider>
    </MemoryRouter>
  );
};

describe('LandingPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockLocalStorage.getItem.mockReturnValue('es-AR');
  });
  it('should render the BirdGuide logo in the header', () => {
    renderWithI18n(<LandingPage />);

    const logoLink = screen.getByRole('link', { name: i18n.t('appName') });
    expect(logoLink).toBeInTheDocument();
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('should render the tagline in Spanish by default', () => {
    renderWithI18n(<LandingPage />);

    expect(screen.getByText(i18n.t('tagline'))).toBeInTheDocument();
  });

  it('should render signup and login buttons', () => {
    renderWithI18n(<LandingPage />);

    expect(
      screen.getByRole('button', { name: i18n.t('signupButton') })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: i18n.t('loginButton') })
    ).toBeInTheDocument();
  });

  it('should navigate to signup page when signup button is clicked', async () => {
    const user = userEvent.setup();
    renderWithI18n(<LandingPage />);

    const signupButton = screen.getByRole('button', {
      name: i18n.t('signupButton'),
    });
    await user.click(signupButton);

    expect(mockNavigate).toHaveBeenCalledWith('/signup');
  });

  it('should navigate to login page when login button is clicked', async () => {
    const user = userEvent.setup();
    renderWithI18n(<LandingPage />);

    const loginButton = screen.getByRole('button', {
      name: i18n.t('loginButton'),
    });
    await user.click(loginButton);

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should display tagline in English when language is switched', () => {
    i18n.changeLanguage('en-US');
    renderWithI18n(<LandingPage />);

    expect(screen.getByText(i18n.t('tagline'))).toBeInTheDocument();
  });

  it('should display buttons in English when language is switched', () => {
    i18n.changeLanguage('en-US');
    renderWithI18n(<LandingPage />);

    expect(
      screen.getByRole('button', { name: i18n.t('signupButton') })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: i18n.t('loginButton') })
    ).toBeInTheDocument();
  });
});

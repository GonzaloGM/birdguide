import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import ProfilePage from '../../app/routes/profile';
import { renderWithI18n } from '../../app/test-utils';
import i18n from '../../app/i18n';

// Mock auth context
vi.mock('../../app/contexts/auth-context', () => ({
  useAuth: () => ({
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
    isLoggedIn: true,
    login: vi.fn(),
    logout: vi.fn(),
  }),
}));

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

describe('ProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue('es-AR');
  });

  it('should render the profile page title', () => {
    renderWithI18n(<ProfilePage />);

    expect(screen.getByText(i18n.t('profile.title'))).toBeInTheDocument();
  });

  it('should display language selector in profile page', () => {
    renderWithI18n(<ProfilePage />);

    const languageSelector = screen.getByRole('combobox');
    expect(languageSelector).toBeInTheDocument();
    expect(languageSelector).toHaveValue('es-AR');
  });

  it('should allow changing language from profile page', () => {
    renderWithI18n(<ProfilePage />);

    const languageSelector = screen.getByRole('combobox');
    fireEvent.change(languageSelector, { target: { value: 'en-US' } });

    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'i18nextLng',
      'en-US'
    );
  });

  it('should display both language options in selector', () => {
    renderWithI18n(<ProfilePage />);

    const languageSelector = screen.getByRole('combobox');
    const options = languageSelector.querySelectorAll('option');

    expect(options).toHaveLength(2);
    expect(options[0]).toHaveValue('es-AR');
    expect(options[1]).toHaveValue('en-US');
  });

  it('should display language label in profile page', () => {
    renderWithI18n(<ProfilePage />);

    expect(screen.getByText(i18n.t('profile.language'))).toBeInTheDocument();
  });

  it('should use language context for current language value', () => {
    mockLocalStorage.getItem.mockReturnValue('en-US');
    renderWithI18n(<ProfilePage />);

    const languageSelector = screen.getByRole('combobox');
    expect(languageSelector).toHaveValue('en-US');
  });
});

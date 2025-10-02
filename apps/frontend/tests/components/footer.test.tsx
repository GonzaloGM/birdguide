import React from 'react';
import { screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import { Footer } from '../../app/components/footer';
import { renderWithI18n } from '../../app/test-utils';
import { useAuth } from '../../app/contexts/auth-context';
import i18n from '../../app/i18n';

// Mock auth context
vi.mock('../../app/contexts/auth-context', () => ({
  useAuth: vi.fn(),
}));

// Mock react-router
vi.mock('react-router', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    Link: ({
      to,
      children,
      ...props
    }: {
      to: string;
      children: React.ReactNode;
      [key: string]: unknown;
    }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

describe('Footer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render all navigation buttons when user is logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
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
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderWithI18n(<Footer />);

    expect(screen.getByText(i18n.t('footer.practice'))).toBeInTheDocument();
    expect(screen.getByText(i18n.t('footer.species'))).toBeInTheDocument();
    expect(screen.getByText(i18n.t('footer.profile'))).toBeInTheDocument();
  });

  it('should not render when user is not logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoggedIn: false,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    const { container } = renderWithI18n(<Footer />);

    expect(container.firstChild).toBeNull();
  });

  it('should render Spanish labels by default', () => {
    vi.mocked(useAuth).mockReturnValue({
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
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderWithI18n(<Footer />);

    expect(screen.getByText(i18n.t('footer.practice'))).toBeInTheDocument();
    expect(screen.getByText(i18n.t('footer.species'))).toBeInTheDocument();
    expect(screen.getByText(i18n.t('footer.profile'))).toBeInTheDocument();
  });

  it('should have correct navigation links', () => {
    vi.mocked(useAuth).mockReturnValue({
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
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderWithI18n(<Footer />);

    expect(
      screen.getByRole('link', { name: i18n.t('footer.practice') })
    ).toHaveAttribute('href', '/practice');
    expect(
      screen.getByRole('link', { name: i18n.t('footer.species') })
    ).toHaveAttribute('href', '/species');
    expect(
      screen.getByRole('link', { name: i18n.t('footer.profile') })
    ).toHaveAttribute('href', '/profile');
  });
});

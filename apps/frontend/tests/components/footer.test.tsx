import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import { Footer } from '../../app/components/footer';
import { renderWithI18n } from '../../app/test-utils';
import { useAuth } from '../../app/contexts/auth-context';

// Mock auth context
vi.mock('../../app/contexts/auth-context', () => ({
  useAuth: vi.fn(),
}));

// Mock react-router
vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    Link: ({ to, children, ...props }: any) => (
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
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderWithI18n(<Footer />);

    expect(screen.getByText('Practicar')).toBeInTheDocument();
    expect(screen.getByText('Senderos')).toBeInTheDocument();
    expect(screen.getByText('Especies')).toBeInTheDocument();
    expect(screen.getByText('Perfil')).toBeInTheDocument();
  });

  it('should not render when user is not logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoggedIn: false,
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
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderWithI18n(<Footer />);

    expect(screen.getByText('Practicar')).toBeInTheDocument();
    expect(screen.getByText('Senderos')).toBeInTheDocument();
    expect(screen.getByText('Especies')).toBeInTheDocument();
    expect(screen.getByText('Perfil')).toBeInTheDocument();
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
      login: vi.fn(),
      logout: vi.fn(),
    });

    renderWithI18n(<Footer />);

    expect(screen.getByRole('link', { name: 'Practicar' })).toHaveAttribute(
      'href',
      '/practice'
    );
    expect(screen.getByRole('link', { name: 'Senderos' })).toHaveAttribute(
      'href',
      '/path'
    );
    expect(screen.getByRole('link', { name: 'Especies' })).toHaveAttribute(
      'href',
      '/species'
    );
    expect(screen.getByRole('link', { name: 'Perfil' })).toHaveAttribute(
      'href',
      '/profile'
    );
  });
});

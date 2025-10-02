import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import ProfilePage from '../../app/routes/profile';
import { renderWithI18n } from '../../app/test-utils';
import { useAuth } from '../../app/contexts/auth-context';
import { useNavigate } from 'react-router';

// Mock auth context
const mockLogout = vi.fn();
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

vi.mock('../../app/contexts/auth-context', () => ({
  useAuth: vi.fn(),
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

describe('ProfilePage Logout', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockLogout.mockClear();
    mockNavigate.mockClear();
  });

  it('should render logout button when user is logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isLoggedIn: true,
      login: vi.fn(),
      logout: mockLogout,
    });

    renderWithI18n(<ProfilePage />);

    expect(screen.getByRole('button', { name: 'Salir' })).toBeInTheDocument();
  });

  it('should call logout and redirect to home when logout button is clicked', async () => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser,
      isLoggedIn: true,
      login: vi.fn(),
      logout: mockLogout,
    });

    renderWithI18n(<ProfilePage />);

    const logoutButton = screen.getByRole('button', { name: 'Salir' });
    await user.click(logoutButton);

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should not render logout button when user is not logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isLoggedIn: false,
      login: vi.fn(),
      logout: mockLogout,
    });

    renderWithI18n(<ProfilePage />);

    expect(
      screen.queryByRole('button', { name: 'Salir' })
    ).not.toBeInTheDocument();
  });
});
